import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react';
import {
	absoluteDayToCalendar,
	calendarToShipDate,
	DEFAULT_TICK_INTERVAL_SECONDS,
	MAX_TICK_INTERVAL_SECONDS,
	MIN_TICK_INTERVAL_SECONDS,
	MINUTES_PER_CHRONO_TICK,
	MINUTES_PER_DAY,
	SHIP_DAY_START_MINUTES,
	type ShipCalendarDate,
	type TimeSpeedMultiplier,
} from '../utils/shipCalendar';

interface ClockContextValue {
	shipTime: Date;
	calendarDate: ShipCalendarDate;
	minutesPerTick: number;
	tickIntervalSeconds: number;
	setTickIntervalSeconds: (seconds: number) => void;
	speedMultiplier: TimeSpeedMultiplier;
	setSpeedMultiplier: (speed: TimeSpeedMultiplier) => void;
	paused: boolean;
	setPaused: (paused: boolean) => void;
	togglePause: () => void;
	dayEndPending: boolean;
	acknowledgeDayEnd: () => void;
}

const ClockContext = createContext<ClockContextValue | undefined>(undefined);

export function ClockProvider({ children }: { children: ReactNode }) {
	const [absoluteDay, setAbsoluteDay] = useState(0);
	const [minutesInDay, setMinutesInDay] = useState(SHIP_DAY_START_MINUTES);
	const [tickIntervalSeconds, setTickIntervalSecondsState] = useState(DEFAULT_TICK_INTERVAL_SECONDS);
	const [speedMultiplier, setSpeedMultiplier] = useState<TimeSpeedMultiplier>(1);
	const [paused, setPaused] = useState(false);
	const [dayEndPending, setDayEndPending] = useState(false);

	useEffect(() => {
		if (paused || dayEndPending) return;

		const intervalMs = (tickIntervalSeconds * 1000) / speedMultiplier;
		const interval = window.setInterval(() => {
			setMinutesInDay((current) => {
				const next = current + MINUTES_PER_CHRONO_TICK;
				if (next >= MINUTES_PER_DAY) {
					setDayEndPending(true);
					setPaused(true);
					return MINUTES_PER_DAY - MINUTES_PER_CHRONO_TICK;
				}
				return next;
			});
		}, intervalMs);

		return () => window.clearInterval(interval);
	}, [paused, dayEndPending, tickIntervalSeconds, speedMultiplier]);

	const setTickIntervalSeconds = useCallback((seconds: number) => {
		const clamped = Math.min(
			MAX_TICK_INTERVAL_SECONDS,
			Math.max(MIN_TICK_INTERVAL_SECONDS, Math.round(seconds)),
		);
		setTickIntervalSecondsState(clamped);
	}, []);

	const togglePause = useCallback(() => {
		if (dayEndPending) return;
		setPaused((current) => !current);
	}, [dayEndPending]);

	const acknowledgeDayEnd = useCallback(() => {
		setAbsoluteDay((current) => current + 1);
		setMinutesInDay(SHIP_DAY_START_MINUTES);
		setDayEndPending(false);
		setPaused(false);
	}, []);

	const calendarDate = useMemo(() => absoluteDayToCalendar(absoluteDay), [absoluteDay]);
	const shipTime = useMemo(
		() => calendarToShipDate(absoluteDay, minutesInDay),
		[absoluteDay, minutesInDay],
	);

	const value = useMemo<ClockContextValue>(
		() => ({
			shipTime,
			calendarDate,
			minutesPerTick: MINUTES_PER_CHRONO_TICK,
			tickIntervalSeconds,
			setTickIntervalSeconds,
			speedMultiplier,
			setSpeedMultiplier,
			paused,
			setPaused,
			togglePause,
			dayEndPending,
			acknowledgeDayEnd,
		}),
		[
			shipTime,
			calendarDate,
			tickIntervalSeconds,
			setTickIntervalSeconds,
			speedMultiplier,
			paused,
			togglePause,
			dayEndPending,
			acknowledgeDayEnd,
		],
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
