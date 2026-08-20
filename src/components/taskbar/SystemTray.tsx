import { useEffect, useState } from 'react';
import { Wifi } from 'lucide-react';
import { formatClock, formatStardate } from '../../utils/terminalTime';

export function SystemTray() {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const interval = window.setInterval(() => setNow(new Date()), 1000);
		return () => window.clearInterval(interval);
	}, []);

	return (
		<div className="ml-auto flex shrink-0 items-center gap-2 pl-1 sm:gap-3 sm:pl-2">
			<div className="hidden items-center gap-1.5 border border-[rgba(176,120,240,0.3)] bg-[var(--surface-inset)] px-2.5 py-1.5 terminal-bevel-sm sm:flex">
				<Wifi size={13} strokeWidth={1.5} className="text-[var(--accent-purple-bright)]" />
				<span className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-silver)]">
					Linked
				</span>
			</div>
			<div className="hidden border-l border-[var(--border-silver)] pl-3 text-right leading-tight sm:block">
				<div className="font-mono text-xs font-medium text-white">{formatClock(now)}</div>
				<div className="font-mono text-[9px] text-[var(--accent-gold)]">{formatStardate(now)}</div>
			</div>
		</div>
	);
}
