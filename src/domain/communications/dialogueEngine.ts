import type { CommandProfile } from '../../types/commandProfile';
import {
	appendConversationMessages,
	createConversationMessage,
	type CommandProfileCommunicationsState,
	type CrewConversationMessage,
} from './conversations';
import { buildDialogueContext } from './contextBuilder';
import { MASTER_DIALOGUE_DEFINITIONS, getDialogueDefinition } from './content';
import { resolveTemplateVariables } from './templateResolver';
import {
	linkBidirectionalRelationship,
	listRelationshipsFrom,
} from '../personnel/relationships';
import type { PersonnelRecord } from '../personnel/personnel';
import type {
	AvailableDialogueOption,
	DialogueCategory,
	DialogueContext,
	DialogueDefinition,
	DialogueEffect,
	DialogueIntentId,
	DialogueResolutionResult,
	PlayerVariantDefinition,
	ResponseVariantDefinition,
	ThirdPartyCandidate,
} from './types';
import type { DialogueSessionTracker } from './state';

function hashString(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i += 1) {
		hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
	}
	return hash;
}

export function getEligibleDialogueDefinitions(
	context: DialogueContext,
): DialogueDefinition[] {
	return MASTER_DIALOGUE_DEFINITIONS.filter((def) => {
		try {
			return def.isAvailable(context);
		} catch {
			return false;
		}
	});
}

export function getAvailableCategories(
	context: DialogueContext,
): DialogueCategory[] {
	const eligible = getEligibleDialogueDefinitions(context);
	const categories = new Set<DialogueCategory>();
	for (const def of eligible) {
		categories.add(def.category);
	}
	const order: DialogueCategory[] = [
		'general',
		'duty',
		'command',
		'personnel',
		'relationship',
		'family_romantic',
		'personal',
		'contextual',
	];
	return order.filter((cat) => categories.has(cat));
}

export function getAvailableDialogueOptions(
	context: DialogueContext,
	category?: DialogueCategory,
): AvailableDialogueOption[] {
	const definitions = getEligibleDialogueDefinitions(context);
	const filtered = category ? definitions.filter((def) => def.category === category) : definitions;
	const options: AvailableDialogueOption[] = [];

	for (const def of filtered) {
		if (def.targetPartyRequired) {
			for (const candidate of context.target.thirdPartyCandidates) {
				const playerVariant = selectPlayerVariant(def, context, candidate);
				if (playerVariant) {
					const text = resolveTemplateVariables(playerVariant.template, context, candidate);
					if (text) {
						options.push({
							intentId: def.intentId,
							category: def.category,
							label: resolveTemplateVariables(playerVariant.label, context, candidate) ?? playerVariant.label,
							playerText: text,
							targetParty: candidate,
						});
					}
				}
			}
		} else {
			const playerVariant = selectPlayerVariant(def, context);
			if (playerVariant) {
				const text = resolveTemplateVariables(playerVariant.template, context);
				if (text) {
					options.push({
						intentId: def.intentId,
						category: def.category,
						label: resolveTemplateVariables(playerVariant.label, context) ?? playerVariant.label,
						playerText: text,
					});
				}
			}
		}
	}

	return options;
}

function selectPlayerVariant(
	def: DialogueDefinition,
	context: DialogueContext,
	targetParty?: ThirdPartyCandidate,
): PlayerVariantDefinition | undefined {
	const eligible = def.playerVariants.filter((variant) => {
		if (!variant.condition) return true;
		try {
			return variant.condition(context, targetParty);
		} catch {
			return false;
		}
	});

	if (eligible.length === 0) return def.playerVariants[0];

	const seed = hashString(context.target.record.id + '-' + def.intentId + '-' + context.session.exchangeCount);
	return eligible[seed % eligible.length];
}

function selectResponseVariant(
	def: DialogueDefinition,
	context: DialogueContext,
	targetParty?: ThirdPartyCandidate,
): ResponseVariantDefinition | undefined {
	const eligible = def.responseVariants.filter((variant) => {
		if (!variant.condition) return true;
		try {
			return variant.condition(context, targetParty);
		} catch {
			return false;
		}
	});

	if (eligible.length === 0) {
		return def.responseVariants[0];
	}

	const seed = hashString(context.target.record.id + '-' + def.intentId + '-' + context.session.exchangeCount + '-resp');
	return eligible[seed % eligible.length];
}

export function executeDialogueEffect(
	profile: CommandProfile,
	targetPerson: PersonnelRecord,
	effect: DialogueEffect,
): CommandProfile {
	if (effect.type === 'RELATIONSHIP_DELTA') {
		const targetId = effect.targetId === '{targetId}' ? targetPerson.id : effect.targetId;
		const captainId = profile.captain.personnelId;
		if (!captainId || !profile.future.crew) return profile;

		const currentRelationships = profile.future.crew.relationships;
		const existingEdge = listRelationshipsFrom(currentRelationships, targetId).find(
			(e) => e.toPersonnelId === captainId,
		);

		const currentAffinity = existingEdge ? existingEdge.affinity : 0;
		const newAffinity = currentAffinity + effect.amount;
		const updatedRelationships = linkBidirectionalRelationship(
			currentRelationships,
			captainId,
			targetId,
			existingEdge ? existingEdge.typeId : ('department_colleague' as any),
			newAffinity,
		);

		return {
			...profile,
			future: {
				...profile.future,
				crew: {
					...profile.future.crew,
					relationships: updatedRelationships,
				},
			},
		};
	}

	return profile;
}

export interface SendProceduralDialogueInput {
	profile: CommandProfile;
	person: PersonnelRecord;
	intentId: DialogueIntentId;
	targetParty?: ThirdPartyCandidate;
	absoluteDay: number;
	minutesInDay: number;
	sessionTracker: DialogueSessionTracker;
}

export interface SendProceduralDialogueResult {
	captainMessage: CrewConversationMessage;
	characterMessage: CrewConversationMessage;
	communications: CommandProfileCommunicationsState;
	updatedProfile: CommandProfile;
	updatedSessionTracker: DialogueSessionTracker;
	resolution: DialogueResolutionResult;
}

export function sendProceduralDialogue(
	input: SendProceduralDialogueInput,
): SendProceduralDialogueResult {
	const { profile, person, intentId, targetParty, absoluteDay, minutesInDay, sessionTracker } = input;

	const context = buildDialogueContext(profile, person, absoluteDay, minutesInDay, {
		exchangeCount: sessionTracker.exchangeCount,
		usedIntentIds: sessionTracker.usedIntentIds,
		activeFollowUps: sessionTracker.activeFollowUps,
	});

	const def = getDialogueDefinition(intentId);
	if (!def) {
		throw new Error('Unknown dialogue intent: ' + intentId);
	}

	const playerVariant = selectPlayerVariant(def, context, targetParty);
	const playerTemplate = playerVariant?.template ?? 'Hello.';
	const playerText = resolveTemplateVariables(playerTemplate, context, targetParty) ?? playerTemplate;

	const responseVariant = selectResponseVariant(def, context, targetParty);
	const responseTemplate = responseVariant?.template ?? 'Standing by, Captain.';
	const responseText = resolveTemplateVariables(responseTemplate, context, targetParty) ?? responseTemplate;

	const selectedTone = responseVariant?.tones?.[0] ?? 'professional';
	const appliedEffects = responseVariant?.effects ?? [];
	const unlockedFollowUps = responseVariant?.followUpIntentIds ?? [];

	const captainMessage = createConversationMessage('captain', playerText, absoluteDay, minutesInDay);
	const characterMessage = createConversationMessage('character', responseText, absoluteDay, minutesInDay);

	const communications = appendConversationMessages(
		profile.future.communications,
		person.id,
		[captainMessage, characterMessage],
	);

	let updatedProfile: CommandProfile = {
		...profile,
		future: {
			...profile.future,
			communications,
		},
	};

	for (const effect of appliedEffects) {
		updatedProfile = executeDialogueEffect(updatedProfile, person, effect);
	}

	const nextFollowUps = [
		...sessionTracker.activeFollowUps.filter((id) => id !== intentId),
		...unlockedFollowUps,
	];

	const updatedSessionTracker: DialogueSessionTracker = {
		personnelId: person.id,
		exchangeCount: sessionTracker.exchangeCount + 1,
		usedIntentIds: [...sessionTracker.usedIntentIds, intentId],
		activeFollowUps: nextFollowUps,
		lastTone: selectedTone,
		lastAppliedEffects: appliedEffects,
	};

	const resolution: DialogueResolutionResult = {
		intentId,
		category: def.category,
		playerText,
		responseText,
		selectedTone,
		templateId: responseVariant?.id ?? 'default',
		appliedEffects,
		unlockedFollowUpIntentIds: unlockedFollowUps,
		debugInfo: {
			tone: selectedTone,
			templateId: responseVariant?.id ?? 'default',
			intentId,
			appliedEffects,
		},
	};

	return {
		captainMessage,
		characterMessage,
		communications,
		updatedProfile,
		updatedSessionTracker,
		resolution,
	};
}
