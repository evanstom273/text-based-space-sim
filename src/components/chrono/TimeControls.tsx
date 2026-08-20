import { Pause, Play } from 'lucide-react';
import { useShipClock } from '../../context/ClockContext';
import type { TimeSpeedMultiplier } from '../../utils/shipCalendar';

const SPEED_OPTIONS: TimeSpeedMultiplier[] = [2, 4, 8];

export function TimeControls() {
	const { speedMultiplier, setSpeedMultiplier, paused, togglePause, dayEndPending } = useShipClock();

	const handleSpeed = (speed: TimeSpeedMultiplier) => {
		if (dayEndPending) return;
		setSpeedMultiplier(speedMultiplier === speed ? 1 : speed);
		if (paused) togglePause();
	};

	return (
		<div className="time-controls flex items-center gap-1">
			{SPEED_OPTIONS.map((speed) => {
				const active = !paused && speedMultiplier === speed;
				return (
					<button
						key={speed}
						type="button"
						disabled={dayEndPending}
						className={`time-control-btn terminal-bevel-sm px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider transition-all sm:px-2 sm:text-[10px] ${
							active
								? 'border-[rgba(176,120,240,0.75)] bg-[var(--accent-purple)]/20 text-[var(--accent-purple-bright)]'
								: 'border-[var(--border-silver)] text-[var(--text-silver-dim)] hover:text-white'
						} ${dayEndPending ? 'opacity-40' : ''}`}
						onClick={() => handleSpeed(speed)}
						aria-pressed={active}
					>
						{speed}x
					</button>
				);
			})}
			<button
				type="button"
				disabled={dayEndPending}
				className={`time-control-btn terminal-bevel-sm flex items-center gap-1 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider transition-all sm:px-2 sm:text-[10px] ${
					paused
						? 'border-[rgba(232,204,120,0.75)] bg-[rgba(212,180,90,0.12)] text-[var(--accent-gold-bright)]'
						: 'border-[var(--border-silver)] text-[var(--text-silver-dim)] hover:text-white'
				} ${dayEndPending ? 'opacity-40' : ''}`}
				onClick={togglePause}
				aria-pressed={paused}
			>
				{paused ? <Play size={10} strokeWidth={2} /> : <Pause size={10} strokeWidth={2} />}
				<span>{paused ? 'Run' : 'Pause'}</span>
			</button>
		</div>
	);
}
