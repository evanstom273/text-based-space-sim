import { MINUTES_PER_CHRONO_TICK, MINUTES_PER_DAY } from './shipCalendar';

export interface ChronoPosition {
	absoluteDay: number;
	minutesInDay: number;
}

export interface ChronoSimulationResult {
	final: ChronoPosition;
	ticksProcessed: number;
	midnightsCrossed: number;
}

export function compareChronoPosition(a: ChronoPosition, b: ChronoPosition): number {
	if (a.absoluteDay !== b.absoluteDay) return a.absoluteDay - b.absoluteDay;
	return a.minutesInDay - b.minutesInDay;
}

export function simulateChronoToTarget(from: ChronoPosition, to: ChronoPosition): ChronoSimulationResult {
	if (compareChronoPosition(to, from) <= 0) {
		throw new Error('Simulation target must be ahead of the current ship time.');
	}

	let absoluteDay = from.absoluteDay;
	let minutesInDay = from.minutesInDay;
	let ticksProcessed = 0;
	let midnightsCrossed = 0;

	while (compareChronoPosition({ absoluteDay, minutesInDay }, to) < 0) {
		const nextMinutes = minutesInDay + MINUTES_PER_CHRONO_TICK;
		if (nextMinutes >= MINUTES_PER_DAY) {
			absoluteDay += 1;
			minutesInDay = 0;
			midnightsCrossed += 1;
		} else {
			minutesInDay = nextMinutes;
		}
		ticksProcessed += 1;

		if (ticksProcessed > 5_000_000) {
			throw new Error('Simulation exceeded safe tick limit.');
		}
	}

	return {
		final: { absoluteDay, minutesInDay },
		ticksProcessed,
		midnightsCrossed,
	};
}
