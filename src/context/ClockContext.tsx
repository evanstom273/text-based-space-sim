import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react';

export const SHIP_CLOCK_START_MINUTES = 9 * 60;
export const SHIP_CLOCK_TICK_MS = 10_000;
export const DEFAULT_MINUTES_PER_TICK = 30;
export const MIN_MINUTES_PER_TICK = 5;
export const MAX_MINUTES_PER_TICK = 120;

interface ClockContextValue {
	shipTime: Date;
	minutesPerTick: number;
	setMinutesPerTick: (minutes: number) => void;
	tickIntervalMs: number;
}

const ClockContext = createContext<ClockContextValue | undefined>(undefined);

function minutesToShipDate(totalMinutes: number): Date {
	const wrapped = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
	const date = new Date();
	date.setHours(Math.floor(wrapped / 60), wrapped % 60, 0, 0);
	return date;
}

export function ClockProvider({ children }: { children: ReactNode }) {
	const [totalMinutes, setTotalMinutes] = useState(SHIP_CLOCK_START_MINUTES);
	const [minutesPerTick, setMinutesPerTickState] = useState(DEFAULT_MINUTES_PER_TICK);

	useEffect(() => {
		const interval = window.setInterval(() => {
			setTotalMinutes((current) => current + minutesPerTick);
		}, SHIP_CLOCK_TICK_MS);

		return () => window.clearInterval(interval);
	}, [minutesPerTick]);

	const setMinutesPerTick = (minutes: number) => {
		const clamped = Math.min(MAX_MINUTES_PER_TICK, Math.max(MIN_MINUTES_PER_TICK, minutes));
		setMinutesPerTickState(clamped);
	};

	const shipTime = useMemo(() => minutesToShipDate(totalMinutes), [totalMinutes]);

	const value = useMemo<ClockContextValue>(
		() => ({
			shipTime,
			minutesPerTick,
			setMinutesPerTick,
			tickIntervalMs: SHIP_CLOCK_TICK_MS,
		}),
		[shipTime, minutesPerTick],
	);

	return <ClockContext.Provider value={value}>{children}</ClockContext.Provider>;
}

export function useShipClock(): ClockContextValue {
	const ctx = useContext(ClockContext);
	if (!ctx) {
		throw new Error('useShipClock must be used within ClockProvider');
	}
	return ctx;
}
