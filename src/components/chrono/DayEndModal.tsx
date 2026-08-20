import { useShipClock } from '../../context/ClockContext';
import { formatShipDateLong } from '../../utils/shipCalendar';
import { formatClock } from '../../utils/terminalTime';

export function DayEndModal() {
	const { dayEndPending, calendarDate, shipTime, acknowledgeDayEnd } = useShipClock();

	if (!dayEndPending) return null;

	return (
		<div className="day-end-overlay fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-[2px]">
			<div
				className="day-end-modal w-full max-w-md border border-[rgba(176,120,240,0.45)] bg-[#242424] p-6 shadow-2xl terminal-bevel"
				role="dialog"
				aria-modal="true"
				aria-labelledby="day-end-title"
			>
				<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--accent-gold)]">
					End of ship day
				</p>
				<h2 id="day-end-title" className="mt-2 text-lg font-semibold uppercase tracking-[0.12em] text-white">
					{formatShipDateLong(calendarDate)}
				</h2>
				<p className="mt-3 text-sm leading-relaxed text-[var(--text-silver-dim)]">
					Ship chronometer reached {formatClock(shipTime)}. A new operational day has begun. Continue
					from midnight?
				</p>
				<button
					type="button"
					className="dock-home-btn terminal-bevel mt-6 w-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em]"
					onClick={acknowledgeDayEnd}
				>
					Continue for now
				</button>
			</div>
		</div>
	);
}
