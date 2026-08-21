import type { PositionId } from './positions';
import { POSITIONS, SENIOR_STAFF_POSITION_IDS } from './positions';
import type { PersonnelRecord } from './personnel';
import type { PersonnelRelationship } from './relationships';
import { PERSONNEL_SCHEMA_VERSION } from './constants';

/**
 * Expected initial senior staff departmental roles.
 * Second Officer is designated as a command appointment on one of these officers.
 */
export const INITIAL_SENIOR_STAFF_SLOTS: readonly PositionId[] = SENIOR_STAFF_POSITION_IDS;

export interface SeniorStaffState {
	/** Personnel IDs keyed by senior staff position. */
	byPosition: Partial<Record<PositionId, string>>;
	/** Personnel ID holding the Second Officer command appointment, if designated. */
	secondOfficerPersonnelId: string | null;
}

/**
 * Per-save crew roster. Lives inside CommandProfile.future.crew.
 * Isolated per Command Profile — never global.
 */
export interface CrewRosterState {
	schemaVersion: typeof PERSONNEL_SCHEMA_VERSION;
	/** All personnel aboard / assigned to this vessel save. */
	personnel: PersonnelRecord[];
	/** Player Captain personnel ID (same stat model as crew). */
	captainPersonnelId: string | null;
	seniorStaff: SeniorStaffState;
	/** Bidirectional professional + personal relationships for the ship population. */
	relationships: PersonnelRelationship[];
}

export function createEmptyCrewRoster(): CrewRosterState {
	return {
		schemaVersion: PERSONNEL_SCHEMA_VERSION,
		personnel: [],
		captainPersonnelId: null,
		seniorStaff: {
			byPosition: {},
			secondOfficerPersonnelId: null,
		},
		relationships: [],
	};
}

export function findPersonnelById(
	roster: CrewRosterState,
	personnelId: string,
): PersonnelRecord | undefined {
	return roster.personnel.find((person) => person.id === personnelId);
}

export function upsertPersonnel(
	roster: CrewRosterState,
	person: PersonnelRecord,
): CrewRosterState {
	const without = roster.personnel.filter((entry) => entry.id !== person.id);
	return {
		...roster,
		personnel: [...without, person],
	};
}

export interface RosterListEntry {
	person: PersonnelRecord;
	roleLabel: string;
	isCaptain: boolean;
	isSeniorStaff: boolean;
	isSecondOfficer: boolean;
}

/**
 * Ordered personnel for the Crew Roster module:
 * Captain first, then senior staff in slot order, then any remaining personnel.
 */
export function listRosterForDisplay(roster: CrewRosterState): RosterListEntry[] {
	const entries: RosterListEntry[] = [];
	const seen = new Set<string>();

	const captain = roster.captainPersonnelId
		? findPersonnelById(roster, roster.captainPersonnelId)
		: undefined;

	if (captain) {
		seen.add(captain.id);
		entries.push({
			person: captain,
			roleLabel: 'Captain',
			isCaptain: true,
			isSeniorStaff: false,
			isSecondOfficer: false,
		});
	}

	for (const positionId of INITIAL_SENIOR_STAFF_SLOTS) {
		const personnelId = roster.seniorStaff.byPosition[positionId];
		if (!personnelId || seen.has(personnelId)) continue;
		const person = findPersonnelById(roster, personnelId);
		if (!person) continue;
		seen.add(person.id);
		const isSecondOfficer = roster.seniorStaff.secondOfficerPersonnelId === person.id;
		entries.push({
			person,
			roleLabel: POSITIONS[positionId]?.name ?? positionId,
			isCaptain: false,
			isSeniorStaff: true,
			isSecondOfficer,
		});
	}

	for (const person of roster.personnel) {
		if (seen.has(person.id)) continue;
		seen.add(person.id);
		entries.push({
			person,
			roleLabel:
				person.personnelKind === 'civilian'
					? 'Civilian'
					: person.positionId
						? (POSITIONS[person.positionId]?.name ?? 'Crew')
						: 'Crew',
			isCaptain: false,
			isSeniorStaff: false,
			isSecondOfficer: roster.seniorStaff.secondOfficerPersonnelId === person.id,
		});
	}

	return entries;
}

export function replaceRosterRelationships(
	roster: CrewRosterState,
	relationships: PersonnelRelationship[],
): CrewRosterState {
	return {
		...roster,
		relationships,
	};
}

export function syncRosterAgesFromDateOfBirth(
	roster: CrewRosterState,
	absoluteDay: number,
	getAgeYears: (dateOfBirth: string, absoluteDay: number) => number,
): CrewRosterState {
	let changed = false;
	const personnel = roster.personnel.map((person) => {
		if (!person.dateOfBirth) return person;
		const nextAge = getAgeYears(person.dateOfBirth, absoluteDay);
		if (person.ageYears === nextAge) return person;
		changed = true;
		return {
			...person,
			ageYears: nextAge,
			updatedAt: Date.now(),
		};
	});
	if (!changed) return roster;
	return {
		...roster,
		personnel,
	};
}
