import {
	DEFAULT_TICK_INTERVAL_SECONDS,
	MAX_TICK_INTERVAL_SECONDS,
	MIN_TICK_INTERVAL_SECONDS,
	MINUTES_PER_CHRONO_TICK,
} from '../../utils/shipCalendar';
import { useShipClock } from '../../context/ClockContext';
import { formatClock } from '../../utils/terminalTime';
import { formatShipDate } from '../../utils/shipCalendar';
import { AppIconRenderer } from '../common/AppIconRenderer';
import { useGameSession } from '../../context/GameSessionContext';
import { formatDisplayShipName } from '../../utils/profileRandomizer';

interface SettingsAppProps {
	windowId: string;
	appId: string;
}

export function SettingsApp(_props: SettingsAppProps) {
	const {
		shipTime,
		calendarDate,
		tickIntervalSeconds,
		setTickIntervalSeconds,
		absoluteDay,
		minutesInDay,
		speedMultiplier,
		paused,
		dayEndPending,
	} = useShipClock();
	const { activeProfile, persistActiveSimulation, relinquishCommand } = useGameSession();

	const handleRelinquishCommand = () => {
		persistActiveSimulation({
			absoluteDay,
			minutesInDay,
			tickIntervalSeconds,
			speedMultiplier,
			paused,
			dayEndPending,
		});
		relinquishCommand();
	};

	return (
		<div className="module-shell module-workspace select-text">
			<div className="module-header px-6 py-4">
				<div className="flex items-center gap-3">
					<div className="module-icon-frame terminal-bevel-sm">
						<AppIconRenderer icon="settings" size={20} />
					</div>
					<div>
						<h2 className="module-title">Settings</h2>
						<p className="module-subtitle">ADM-01</p>
					</div>
				</div>
			</div>

			<div className="module-body flex flex-col gap-6 overflow-y-auto px-6 py-6">
				<section className="module-panel rounded-sm p-4 terminal-bevel-sm">
					<div className="mb-4 flex items-center justify-between gap-3">
						<div>
							<h3 className="module-heading">Ship chronometer</h3>
							<p className="module-copy-muted mt-1">
								Calendar begins 01 Jan 2420 at 09:00. Each cycle advances{' '}
								{MINUTES_PER_CHRONO_TICK} minutes of ship time.
							</p>
						</div>
						<div className="module-inset rounded-sm px-3 py-2 text-right terminal-bevel-sm">
							<p className="font-mono text-lg font-medium text-[var(--module-text)]">
								{formatClock(shipTime)}
							</p>
							<p className="font-mono text-[10px] text-[var(--module-text-dim)]">
								{formatShipDate(calendarDate)}
							</p>
						</div>
					</div>

					<label className="block">
						<div className="mb-2 flex items-center justify-between gap-3">
							<span className="module-label">Seconds between chrono cycles</span>
							<span className="font-mono text-[11px] text-[var(--accent-purple-dim)]">
								{tickIntervalSeconds}s / {MINUTES_PER_CHRONO_TICK} min
							</span>
						</div>
						<input
							type="range"
							min={MIN_TICK_INTERVAL_SECONDS}
							max={MAX_TICK_INTERVAL_SECONDS}
							step={1}
							value={tickIntervalSeconds}
							onChange={(event) => setTickIntervalSeconds(Number(event.target.value))}
							className="settings-slider w-full"
						/>
						<div className="module-meta mt-2 flex justify-between">
							<span>{MIN_TICK_INTERVAL_SECONDS}s</span>
							<span>Default {DEFAULT_TICK_INTERVAL_SECONDS}s</span>
							<span>{MAX_TICK_INTERVAL_SECONDS}s</span>
						</div>
					</label>
				</section>

				{activeProfile ? (
					<section className="module-panel rounded-sm p-4 terminal-bevel-sm">
						<h3 className="module-heading">Command profile</h3>
						<p className="module-copy-muted mt-1">
							Active assignment: {activeProfile.captain.name} ·{' '}
							{formatDisplayShipName(activeProfile.vessel.name)} ({activeProfile.vessel.registry})
						</p>
						<button
							type="button"
							className="game-btn game-btn--ghost mt-4"
							onClick={handleRelinquishCommand}
						>
							RELINQUISH COMMAND
						</button>
					</section>
				) : null}
			</div>
		</div>
	);
}
