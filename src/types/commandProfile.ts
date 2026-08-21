import type { CalendarEventMarker, TimeSpeedMultiplier } from '../utils/shipCalendar';
import type { ShipStateSnapshot } from '../utils/shipPersistence';
import type { CrewRosterState } from '../domain/personnel/roster';
import type { PersonnelRecord } from '../domain/personnel/personnel';
import type { CommandProfileCommunicationsState } from '../domain/ai/conversations';

export type { CommandProfileCommunicationsState };

export const COMMAND_PROFILE_VERSION = 1 as const;

export interface CommandProfileCaptain {
	name: string;
	/** Optional link to full PersonnelRecord once Captain uses the shared stat model. */
	personnelId?: string;
}

export interface CommandProfileVessel {
	name: string;
	registry: string;
	location: string;
	alertStatus: string;
}

export interface CommandProfileSimulation extends ShipStateSnapshot {}

export interface CommandProfileFutureState {
	calendarEvents?: CalendarEventMarker[];
	/** Per-save crew roster (Planetary Union personnel). Isolated per Command Profile. */
	crew?: CrewRosterState;
	missions?: Record<string, unknown>;
	shipSystems?: Record<string, unknown>;
	/** Dialogue transcripts per personnel id. Credentials stay in terminal settings, not here. */
	communications?: CommandProfileCommunicationsState;
	logs?: Record<string, unknown>;
}

export interface CommandProfile {
	id: string;
	version: typeof COMMAND_PROFILE_VERSION;
	createdAt: number;
	updatedAt: number;
	captain: CommandProfileCaptain;
	vessel: CommandProfileVessel;
	simulation: CommandProfileSimulation;
	future: CommandProfileFutureState;
}

export interface CreateProfileInput {
	captainName: string;
	shipName: string;
	registry: string;
	/** Full captain personnel record (species, attributes, skills). */
	captainPersonnel: PersonnelRecord;
	/** Locked senior staff (Second Officer appointment applied on save). */
	seniorStaff: PersonnelRecord[];
	secondOfficerPersonnelId: string;
}

export type GamePhase = 'boot' | 'profiles' | 'create' | 'auth' | 'desktop';

export type AuthMode = 'new' | 'load' | 'exit';

export interface ProfileStoreData {
	version: typeof COMMAND_PROFILE_VERSION;
	profiles: CommandProfile[];
}

export function createDefaultSimulation(): CommandProfileSimulation {
	return {
		absoluteDay: 0,
		minutesInDay: 9 * 60,
		tickIntervalSeconds: 10,
		speedMultiplier: 1 as TimeSpeedMultiplier,
		paused: false,
		dayEndPending: false,
	};
}
