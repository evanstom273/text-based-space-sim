import { createEmptyAttributeScores, type CoreAttributeId, type CoreAttributeScores } from './attributes';
import { createPersonnelRecord, type PersonnelRecord } from './personnel';
import { generatePersonnelName, pickGenderForSpecies } from './names';
import { getPosition, type PositionId } from './positions';
import type { RankId } from './ranks';
import {
	createEmptySkillScores,
	type ProfessionalSkillId,
	type ProfessionalSkillScores,
} from './skills';
import { getUnionCrewEligibleSpecies, type SpeciesId } from './species';
import { ALLOCATION_STAT_MAX, ALLOCATION_STAT_MIN } from './statAllocation';

export const SENIOR_STAFF_SELECTION_POSITIONS = [
	'first_officer',
	'chief_medical_officer',
	'chief_security_officer',
	'chief_engineer',
	'chief_science_officer',
	'helmsman',
] as const satisfies readonly PositionId[];

export type SeniorStaffSelectionPositionId = (typeof SENIOR_STAFF_SELECTION_POSITIONS)[number];

interface RoleBias {
	primarySkills: readonly ProfessionalSkillId[];
	secondarySkills: readonly ProfessionalSkillId[];
	primaryAttributes: readonly CoreAttributeId[];
	rankWeights: ReadonlyArray<{ rankId: RankId; weight: number }>;
	ageMin: number;
	ageMax: number;
}

const ROLE_BIAS: Record<SeniorStaffSelectionPositionId, RoleBias> = {
	first_officer: {
		primarySkills: ['command', 'diplomacy', 'tactical'],
		secondarySkills: ['piloting', 'science'],
		primaryAttributes: ['intelligence', 'charisma', 'perception'],
		rankWeights: [
			{ rankId: 'commander', weight: 70 },
			{ rankId: 'lieutenant_commander', weight: 30 },
		],
		ageMin: 34,
		ageMax: 56,
	},
	chief_medical_officer: {
		primarySkills: ['medicine', 'science'],
		secondarySkills: ['command', 'diplomacy'],
		primaryAttributes: ['intelligence', 'perception', 'resilience'],
		rankWeights: [
			{ rankId: 'commander', weight: 35 },
			{ rankId: 'lieutenant_commander', weight: 55 },
			{ rankId: 'lieutenant', weight: 10 },
		],
		ageMin: 32,
		ageMax: 58,
	},
	chief_security_officer: {
		primarySkills: ['combat', 'tactical'],
		secondarySkills: ['command', 'piloting'],
		primaryAttributes: ['physical', 'agility', 'perception'],
		rankWeights: [
			{ rankId: 'lieutenant_commander', weight: 60 },
			{ rankId: 'commander', weight: 25 },
			{ rankId: 'lieutenant', weight: 15 },
		],
		ageMin: 30,
		ageMax: 52,
	},
	chief_engineer: {
		primarySkills: ['engineering', 'science'],
		secondarySkills: ['tactical', 'command'],
		primaryAttributes: ['intelligence', 'perception', 'resilience'],
		rankWeights: [
			{ rankId: 'lieutenant_commander', weight: 55 },
			{ rankId: 'commander', weight: 30 },
			{ rankId: 'lieutenant', weight: 15 },
		],
		ageMin: 30,
		ageMax: 55,
	},
	chief_science_officer: {
		primarySkills: ['science', 'engineering'],
		secondarySkills: ['medicine', 'command'],
		primaryAttributes: ['intelligence', 'perception', 'charisma'],
		rankWeights: [
			{ rankId: 'lieutenant_commander', weight: 55 },
			{ rankId: 'commander', weight: 30 },
			{ rankId: 'lieutenant', weight: 15 },
		],
		ageMin: 30,
		ageMax: 54,
	},
	helmsman: {
		primarySkills: ['piloting', 'tactical'],
		secondarySkills: ['command', 'engineering'],
		primaryAttributes: ['agility', 'perception', 'intelligence'],
		rankWeights: [
			{ rankId: 'lieutenant', weight: 55 },
			{ rankId: 'lieutenant_commander', weight: 35 },
			{ rankId: 'ensign', weight: 10 },
		],
		ageMin: 26,
		ageMax: 46,
	},
};

function randomInt(min: number, max: number): number {
	return min + Math.floor(Math.random() * (max - min + 1));
}

function clampStat(value: number): number {
	return Math.min(ALLOCATION_STAT_MAX, Math.max(ALLOCATION_STAT_MIN, value));
}

function weightedPick<T extends string>(items: ReadonlyArray<{ rankId?: T; id?: T; weight: number }>): T {
	const total = items.reduce((sum, item) => sum + item.weight, 0);
	let roll = Math.random() * total;
	for (const item of items) {
		roll -= item.weight;
		if (roll <= 0) {
			return (item.rankId ?? item.id) as T;
		}
	}
	const last = items[items.length - 1];
	return (last?.rankId ?? last?.id) as T;
}

function pickSpeciesForCrew(): SpeciesId {
	const eligible = getUnionCrewEligibleSpecies();
	const weighted = eligible.map((species) => ({
		id: species.id,
		weight: Math.max(1, species.unionCrewGenerationWeight),
	}));
	return weightedPick(weighted);
}

function buildBiasedScores(
	keys: readonly string[],
	primary: readonly string[],
	secondary: readonly string[],
): Record<string, number> {
	const scores: Record<string, number> = {};
	for (const key of keys) {
		scores[key] = 5;
	}

	for (const key of primary) {
		scores[key] = clampStat(randomInt(7, 9));
	}

	for (const key of secondary) {
		if (primary.includes(key)) continue;
		scores[key] = clampStat(randomInt(5, 8));
	}

	const others = keys.filter((key) => !primary.includes(key) && !secondary.includes(key));
	for (const key of others) {
		scores[key] = clampStat(randomInt(3, 7));
	}

	// Ensure visible strengths and at least one mild weakness.
	const weaknessPool = others.length > 0 ? others : keys.filter((key) => !primary.includes(key));
	if (weaknessPool.length > 0) {
		const weakKey = weaknessPool[Math.floor(Math.random() * weaknessPool.length)] as string;
		scores[weakKey] = clampStat(Math.min(scores[weakKey] ?? 5, randomInt(3, 5)));
	}

	return scores;
}

function toAttributeScores(raw: Record<string, number>): CoreAttributeScores {
	const scores = createEmptyAttributeScores(5);
	(Object.keys(scores) as CoreAttributeId[]).forEach((id) => {
		scores[id] = clampStat(raw[id] ?? 5);
	});
	return scores;
}

function toSkillScores(raw: Record<string, number>): ProfessionalSkillScores {
	const scores = createEmptySkillScores(5);
	(Object.keys(scores) as ProfessionalSkillId[]).forEach((id) => {
		scores[id] = clampStat(raw[id] ?? 5);
	});
	return scores;
}

function createPersonnelId(positionId: PositionId): string {
	return `crew-${positionId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function generateSeniorStaffCandidate(positionId: PositionId): PersonnelRecord {
	const bias = ROLE_BIAS[positionId as SeniorStaffSelectionPositionId];
	if (!bias) {
		throw new Error(`No senior staff generation bias for position ${positionId}`);
	}

	const position = getPosition(positionId);
	const speciesId = pickSpeciesForCrew();
	const gender = pickGenderForSpecies(speciesId);
	const identity = generatePersonnelName(speciesId, gender);
	const rankId = weightedPick(bias.rankWeights);
	const ageYears = randomInt(bias.ageMin, bias.ageMax);

	const attributeRaw = buildBiasedScores(
		['physical', 'agility', 'intelligence', 'perception', 'charisma', 'resilience'],
		bias.primaryAttributes,
		[],
	);
	const skillRaw = buildBiasedScores(
		['engineering', 'medicine', 'science', 'combat', 'piloting', 'command', 'diplomacy', 'tactical'],
		bias.primarySkills,
		bias.secondarySkills,
	);

	return createPersonnelRecord({
		id: createPersonnelId(positionId),
		identity,
		speciesId,
		gender,
		ageYears,
		rankId,
		divisionId: position.divisionId,
		positionId,
		commandAppointmentId: null,
		baseAttributes: toAttributeScores(attributeRaw),
		baseSkills: toSkillScores(skillRaw),
		origin: 'generated',
		status: 'active',
		service: {
			assignedAbsoluteDay: 0,
			priorAssignments: [],
		},
	});
}

export function createCaptainPersonnel(input: {
	fullName: string;
	speciesId: SpeciesId;
	attributes: CoreAttributeScores;
	skills: ProfessionalSkillScores;
}): PersonnelRecord {
	const trimmed = input.fullName.trim();
	const parts = trimmed.split(/\s+/);
	const firstName = parts[0] ?? 'Captain';
	const lastName = parts.length > 1 ? parts.slice(1).join(' ') : 'Unknown';

	return createPersonnelRecord({
		id: `captain-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		identity: {
			firstName,
			lastName,
			displayNameOverride: trimmed,
		},
		speciesId: input.speciesId,
		gender: 'unspecified',
		ageYears: undefined,
		rankId: 'captain',
		divisionId: 'command',
		positionId: 'command_officer',
		commandAppointmentId: null,
		baseAttributes: { ...input.attributes },
		baseSkills: { ...input.skills },
		origin: 'player_captain',
		status: 'active',
		service: {
			assignedAbsoluteDay: 0,
			priorAssignments: [],
		},
	});
}
