import type { PositionId } from './positions';
import { SENIOR_STAFF_POSITION_IDS } from './positions';
import type { PersonnelRecord } from './personnel';
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
