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
			<div className="hidden items-center gap-1.5 border border-[var(--border-silver)] bg-[var(--surface-inset)] px-2 py-1 terminal-bevel-sm sm:flex">
				<Wifi size={12} strokeWidth={1.5} className="text-[var(--text-silver-dim)]" />
				<span className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-silver-dim)]">
					Linked
				</span>
			</div>
			<div className="hidden text-right leading-tight sm:block">
				<div className="font-mono text-[11px] text-white">{formatClock(now)}</div>
				<div className="font-mono text-[9px] text-[var(--text-silver-dim)]">{formatStardate(now)}</div>
			</div>
		</div>
	);
}
