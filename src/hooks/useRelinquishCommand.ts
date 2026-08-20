import { useCallback } from 'react';
import { useShipClock } from '../context/ClockContext';
import { useGameSession } from '../context/GameSessionContext';

export function useRelinquishCommand() {
	const {
		absoluteDay,
		minutesInDay,
		tickIntervalSeconds,
		speedMultiplier,
		paused,
		dayEndPending,
	} = useShipClock();
	const { persistActiveSimulation, relinquishCommand } = useGameSession();

	return useCallback(() => {
		if (document.activeElement instanceof HTMLElement) {
			document.activeElement.blur();
		}

		persistActiveSimulation({
			absoluteDay,
			minutesInDay,
			tickIntervalSeconds,
			speedMultiplier,
			paused,
			dayEndPending,
		});
		relinquishCommand();
	}, [
		absoluteDay,
		minutesInDay,
		tickIntervalSeconds,
		speedMultiplier,
		paused,
		dayEndPending,
		persistActiveSimulation,
		relinquishCommand,
	]);
}
