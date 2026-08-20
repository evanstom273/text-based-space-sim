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
	MAX_TICK_INTERVAL_SECONDS,
	MIN_TICK_INTERVAL_SECONDS,
	MINUTES_PER_CHRONO_TICK,
	MINUTES_PER_DAY,
	type ShipCalendarDate,
	type TimeSpeedMultiplier,
} from '../utils/shipCalendar';
import {
	getDefaultShipState,
	loadPersistedShipState,
	savePersistedShipState,
	type ShipStateSnapshot,
} from '../utils/shipPersistence';

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
	persistenceReady: boolean;
}

const ClockContext = createContext<ClockContextValue | undefined>(undefined);

function resolveInitialState(): ShipStateSnapshot {
	return loadPersistedShipState() ?? getDefaultShipState();
}

export function ClockProvider({ children }: { children: ReactNode }) {
	const [initialState] = useState(resolveInitialState);
	const [persistenceReady, setPersistenceReady] = useState(false);
	const [absoluteDay, setAbsoluteDay] = useState(initialState.absoluteDay);
	const [minutesInDay, setMinutesInDay] = useState(initialState.minutesInDay);
	const [tickIntervalSeconds, setTickIntervalSecondsState] = useState(initialState.tickIntervalSeconds);
	const [speedMultiplier, setSpeedMultiplier] = useState<TimeSpeedMultiplier>(initialState.speedMultiplier);
	const [paused, setPaused] = useState(initialState.paused);
	const [dayEndPending, setDayEndPending] = useState(initialState.dayEndPending);

	useEffect(() => {
		setPersistenceReady(true);
	}, []);

	useEffect(() => {
		if (!persistenceReady) return;

		savePersistedShipState({
			absoluteDay,
			minutesInDay,
			tickIntervalSeconds,
			speedMultiplier,
			paused,
			dayEndPending,
		});
	}, [
		persistenceReady,
		absoluteDay,
		minutesInDay,
		tickIntervalSeconds,
		speedMultiplier,
		paused,
		dayEndPending,
	]);

	useEffect(() => {
		if (paused || dayEndPending) return;

		const intervalMs = (tickIntervalSeconds * 1000) / speedMultiplier;
		const interval = window.setInterval(() => {
			setMinutesInDay((current) => {
				const next = current + MINUTES_PER_CHRONO_TICK;
				if (next >= MINUTES_PER_DAY) {
					setAbsoluteDay((day) => day + 1);
					setDayEndPending(true);
					setPaused(true);
					return 0;
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
			persistenceReady,
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
			persistenceReady,
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
