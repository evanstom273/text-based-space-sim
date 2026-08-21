import type { CommandProfile } from '../../types/commandProfile';
import {
	formatPersonnelDisplayName,
	getCivilianRole,
	getDivision,
	getPosition,
	getRank,
	type PersonnelRecord,
} from '../personnel';
import type { DivisionId } from '../personnel/divisions';
import type { CaptainPresetId } from './presets';

const OPENINGS_FORMAL = [
	'Aye, Captain.',
	'Understood, Captain.',
	'Yes, Captain.',
] as const;

const OPENINGS_WARM = [
	'Sure, Captain.',
	'Of course.',
	'Right away, Captain.',
] as const;

const CLOSINGS_NEUTRAL = [
	'Standing by.',
	"That's all from me.",
	'Nothing else to add.',
] as const;

const CLOSINGS_WARM = [
	'Happy to help.',
	'Anytime, Captain.',
	'Just say the word.',
] as const;

const CLOSINGS_DISMISS = [
	'Understood. I will get back to it.',
	'Aye. Returning to duty.',
	'Copy that, Captain.',
] as const;

const STATUS_BY_DIVISION: Record<DivisionId, readonly string[]> = {
	command: [
		'Bridge routines are steady and the watch rotation is covered.',
		'Command section is running smoothly on my watch.',
	],
	engineering: [
		'Primary systems are stable and secondary checks are on schedule.',
		'No outstanding faults in my section at the moment.',
	],
	security: [
		'Security rotations are covered and shipboard access is nominal.',
		'No incidents to report from my post.',
	],
	medical: [
		'Sickbay is quiet and routine screenings are up to date.',
		'No urgent medical issues in my area right now.',
	],
	science: [
		'Active scans are nominal and lab backlog is manageable.',
		'Science systems are calibrated and running as expected.',
	],
};

const CIVILIAN_STATUS = [
	'Everything on my end is routine for a civilian aboard ship.',
	'No issues from the civilian side that need your attention.',
] as const;

function hashSeed(parts: string[]): number {
	let hash = 0;
	for (const part of parts) {
		for (let index = 0; index < part.length; index += 1) {
			hash = (hash * 31 + part.charCodeAt(index)) >>> 0;
		}
	}
	return hash;
}

function pick<T>(pool: readonly T[], seed: number): T {
	return pool[seed % pool.length] as T;
}

function usesWarmTone(person: PersonnelRecord): boolean {
	return person.baseAttributes.charisma >= 7;
}

function getDivisionStatusLine(person: PersonnelRecord, seed: number): string {
	if (person.personnelKind === 'civilian') {
		return pick(CIVILIAN_STATUS, seed);
	}

	if (person.divisionId && STATUS_BY_DIVISION[person.divisionId]) {
		return pick(STATUS_BY_DIVISION[person.divisionId], seed);
	}

	return pick(
		[
			'My section is operating within normal parameters.',
			'Nothing out of the ordinary to report from my post.',
		],
		seed,
	);
}

function getRoleDescriptor(person: PersonnelRecord): string {
	if (person.personnelKind === 'civilian') {
		return person.civilianRoleId ? getCivilianRole(person.civilianRoleId).name.toLowerCase() : 'crew';
	}

	const position = person.positionId ? getPosition(person.positionId).name.toLowerCase() : 'post';
	const division = person.divisionId ? getDivision(person.divisionId).name : 'ship';
	return `${position} in ${division}`;
}

function buildPresetCore(
	presetId: CaptainPresetId,
	person: PersonnelRecord,
	profile: CommandProfile,
	seed: number,
): string {
	const shipName = profile.vessel.name;
	const role = getRoleDescriptor(person);

	switch (presetId) {
		case 'status_report':
			return getDivisionStatusLine(person, seed);
		case 'wellbeing':
			return pick(
				[
					'Doing alright, Captain. Long shift, but I am managing.',
					'Tired, but still sharp. Nothing I cannot handle.',
					'Holding up fine. Ready to keep at it.',
				],
				seed,
			);
		case 'concerns':
			return pick(
				[
					'Nothing urgent from my end, Captain.',
					'No concerns I can flag right now.',
					'All quiet on my side — I will speak up if that changes.',
				],
				seed,
			);
		case 'good_work':
			return pick(
				[
					'Appreciate that, Captain. I will keep the momentum going.',
					'Thank you, Captain. Means a lot coming from you.',
					'Glad it is showing. I will stay on it.',
				],
				seed,
			);
		case 'stand_by':
			return pick(
				[
					'Standing by on channel.',
					'I will hold position until I hear from you.',
					'Copy. Awaiting your next instruction.',
				],
				seed,
			);
		case 'dismissed':
			return pick(
				[
					'Understood. Back to duty.',
					'Aye. I will leave you to it, Captain.',
					'Copy that. Signing off.',
				],
				seed,
			);
		case 'acknowledged':
			return pick(
				[
					'Message received.',
					'Copy that, Captain.',
					'Understood loud and clear.',
				],
				seed,
			);
		case 'anything_needed':
			return pick(
				[
					`I have what I need for now in ${role}.`,
					'Nothing critical at the moment, Captain.',
					`All set on my end aboard ${shipName}.`,
				],
				seed,
			);
		default:
			return 'Understood, Captain.';
	}
}

export interface CharacterResponseInput {
	person: PersonnelRecord;
	profile: CommandProfile;
	presetId: CaptainPresetId;
	exchangeIndex: number;
}

export function buildPresetCharacterResponse(input: CharacterResponseInput): string {
	const { person, profile, presetId, exchangeIndex } = input;
	const seed = hashSeed([person.id, presetId, String(exchangeIndex)]);
	const warm = usesWarmTone(person);
	const opening = pick(warm ? OPENINGS_WARM : OPENINGS_FORMAL, seed);
	const core = buildPresetCore(presetId, person, profile, seed + 1);

	let closing: string;
	if (presetId === 'dismissed') {
		closing = pick(CLOSINGS_DISMISS, seed + 2);
	} else if (presetId === 'good_work' || presetId === 'wellbeing' || presetId === 'anything_needed') {
		closing = pick(CLOSINGS_WARM, seed + 2);
	} else {
		closing = pick(CLOSINGS_NEUTRAL, seed + 2);
	}

	if (presetId === 'acknowledged' || presetId === 'stand_by') {
		return `${opening} ${core}`;
	}

	return `${opening} ${core} ${closing}`;
}

export function getCharacterDisplayName(person: PersonnelRecord): string {
	return formatPersonnelDisplayName(person.identity);
}

export function getCharacterRankAbbreviation(person: PersonnelRecord): string | null {
	if (!person.rankId) return null;
	return getRank(person.rankId).abbreviation;
}
