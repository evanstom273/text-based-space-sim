import {
	DEFAULT_TICK_INTERVAL_SECONDS,
	MAX_TICK_INTERVAL_SECONDS,
	MIN_TICK_INTERVAL_SECONDS,
	MINUTES_PER_DAY,
	SHIP_DAY_START_MINUTES,
	type TimeSpeedMultiplier,
} from './shipCalendar';

const STORAGE_KEY = 'union-terminal-ship-state';
const STORAGE_VERSION = 1;

export interface PersistedShipState {
	version: typeof STORAGE_VERSION;
	absoluteDay: number;
	minutesInDay: number;
	tickIntervalSeconds: number;
	speedMultiplier: TimeSpeedMultiplier;
	paused: boolean;
	dayEndPending: boolean;
}

export interface ShipStateSnapshot {
	absoluteDay: number;
	minutesInDay: number;
	tickIntervalSeconds: number;
	speedMultiplier: TimeSpeedMultiplier;
	paused: boolean;
	dayEndPending: boolean;
}

const DEFAULT_STATE: ShipStateSnapshot = {
	absoluteDay: 0,
	minutesInDay: SHIP_DAY_START_MINUTES,
	tickIntervalSeconds: DEFAULT_TICK_INTERVAL_SECONDS,
	speedMultiplier: 1,
	paused: false,
	dayEndPending: false,
};

function isSpeedMultiplier(value: unknown): value is TimeSpeedMultiplier {
	return value === 1 || value === 2 || value === 4 || value === 8;
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
	if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
	return Math.min(max, Math.max(min, Math.round(value)));
}

function sanitizeState(raw: Partial<ShipStateSnapshot>): ShipStateSnapshot {
	return {
		absoluteDay: clampNumber(raw.absoluteDay, 0, 1_000_000, DEFAULT_STATE.absoluteDay),
		minutesInDay: clampNumber(raw.minutesInDay, 0, MINUTES_PER_DAY - 1, DEFAULT_STATE.minutesInDay),
		tickIntervalSeconds: clampNumber(
			raw.tickIntervalSeconds,
			MIN_TICK_INTERVAL_SECONDS,
			MAX_TICK_INTERVAL_SECONDS,
			DEFAULT_STATE.tickIntervalSeconds,
		),
		speedMultiplier: isSpeedMultiplier(raw.speedMultiplier)
			? raw.speedMultiplier
			: DEFAULT_STATE.speedMultiplier,
		paused: typeof raw.paused === 'boolean' ? raw.paused : DEFAULT_STATE.paused,
		dayEndPending:
			typeof raw.dayEndPending === 'boolean' ? raw.dayEndPending : DEFAULT_STATE.dayEndPending,
	};
}

export function loadPersistedShipState(): ShipStateSnapshot | null {
	if (typeof window === 'undefined') return null;

	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;

		const parsed = JSON.parse(raw) as Partial<PersistedShipState>;
		if (parsed.version !== STORAGE_VERSION) return null;

		return sanitizeState(parsed);
	} catch {
		return null;
	}
}

export function savePersistedShipState(state: ShipStateSnapshot): void {
	if (typeof window === 'undefined') return;

	try {
		const payload: PersistedShipState = {
			version: STORAGE_VERSION,
			...sanitizeState(state),
		};
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
	} catch {
		// Ignore quota or privacy mode failures.
	}
}

export function getDefaultShipState(): ShipStateSnapshot {
	return { ...DEFAULT_STATE };
}
