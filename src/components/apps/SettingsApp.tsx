import {
	DEFAULT_MINUTES_PER_TICK,
	MAX_MINUTES_PER_TICK,
	MIN_MINUTES_PER_TICK,
	useShipClock,
} from '../../context/ClockContext';
import { formatClock } from '../../utils/terminalTime';
import { AppIconRenderer } from '../common/AppIconRenderer';

interface SettingsAppProps {
	windowId: string;
	appId: string;
}

export function SettingsApp(_props: SettingsAppProps) {
	const { shipTime, minutesPerTick, setMinutesPerTick, tickIntervalMs } = useShipClock();
	const tickSeconds = tickIntervalMs / 1000;

	return (
		<div className="flex h-full flex-col bg-gradient-to-b from-[#f2f2f5] to-[#e4e4ea] text-[#2a2a2e] select-text">
			<div className="border-b border-[#d0d0d8]/80 bg-white/80 px-6 py-4">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center border border-[#c8c8d4] bg-[#f8f8fa] text-[var(--accent-purple-dim)] terminal-bevel-sm">
						<AppIconRenderer icon="settings" size={20} />
					</div>
					<div>
						<h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#1a1a1e]">
							Settings
						</h2>
						<p className="font-mono text-[10px] uppercase tracking-wider text-[var(--accent-gold-dim)]">
							ADM-01
						</p>
					</div>
				</div>
			</div>

			<div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6">
				<section className="rounded-sm border border-[#d0d0d8] bg-white/70 p-4 terminal-bevel-sm">
					<div className="mb-4 flex items-center justify-between gap-3">
						<div>
							<h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1a1a1e]">
								Ship chronometer
							</h3>
							<p className="mt-1 text-[11px] leading-relaxed text-[#5a5a64]">
								Terminal clock starts at 09:00 and advances in configurable increments.
							</p>
						</div>
						<div className="rounded-sm border border-[#c8c8d4] bg-[#f8f8fa] px-3 py-2 text-right">
							<p className="font-mono text-lg font-medium text-[#1a1a1e]">{formatClock(shipTime)}</p>
							<p className="font-mono text-[9px] uppercase tracking-wider text-[#9898a4]">
								Current ship time
							</p>
						</div>
					</div>

					<label className="block">
						<div className="mb-2 flex items-center justify-between gap-3">
							<span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#3a3a42]">
								Minutes per chrono cycle
							</span>
							<span className="font-mono text-[11px] text-[var(--accent-purple-dim)]">
								{minutesPerTick.toString().padStart(2, '0')} min / {tickSeconds}s
							</span>
						</div>
						<input
							type="range"
							min={MIN_MINUTES_PER_TICK}
							max={MAX_MINUTES_PER_TICK}
							step={5}
							value={minutesPerTick}
							onChange={(event) => setMinutesPerTick(Number(event.target.value))}
							className="settings-slider w-full"
						/>
						<div className="mt-2 flex justify-between font-mono text-[9px] uppercase tracking-wider text-[#9898a4]">
							<span>{MIN_MINUTES_PER_TICK} min</span>
							<span>Default {DEFAULT_MINUTES_PER_TICK} min</span>
							<span>{MAX_MINUTES_PER_TICK} min</span>
						</div>
					</label>
				</section>
			</div>
		</div>
	);
}
