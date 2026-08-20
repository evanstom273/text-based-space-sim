import { useShipClock } from '../../context/ClockContext';
import { formatClock, formatStardate } from '../../utils/terminalTime';
import { Wifi } from 'lucide-react';

export function SystemTray() {
	const { shipTime } = useShipClock();

	return (
		<div className="ml-auto flex shrink-0 items-center gap-2 pl-1 sm:gap-3 sm:pl-2">
			<div className="hidden items-center gap-1.5 border border-[rgba(176,120,240,0.3)] bg-[var(--surface-inset)] px-2.5 py-1.5 terminal-bevel-sm sm:flex">
				<Wifi size={13} strokeWidth={1.5} className="text-[var(--accent-purple-bright)]" />
				<span className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-silver)]">
					Linked
				</span>
			</div>
			<div className="hidden border-l border-[var(--border-silver)] pl-3 text-right leading-tight sm:block">
				<div className="font-mono text-xs font-medium text-white">{formatClock(shipTime)}</div>
				<div className="font-mono text-[9px] text-[var(--accent-gold)]">{formatStardate(shipTime)}</div>
			</div>
		</div>
	);
}
