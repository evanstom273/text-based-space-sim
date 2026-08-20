import type { CalendarEventMarker, TimeSpeedMultiplier } from '../utils/shipCalendar';
import type { ShipStateSnapshot } from '../utils/shipPersistence';

export const COMMAND_PROFILE_VERSION = 1 as const;

export interface CommandProfileCaptain {
	name: string;
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
	crew?: Record<string, unknown>;
	missions?: Record<string, unknown>;
	shipSystems?: Record<string, unknown>;
	communications?: Record<string, unknown>;
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
