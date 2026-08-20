import { useEffect, useState } from 'react';

function formatClock(date: Date): string {
	return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date: Date): string {
	return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

export function SystemTray() {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const interval = window.setInterval(() => setNow(new Date()), 1000);
		return () => window.clearInterval(interval);
	}, []);

	return (
		<div className="ml-auto flex shrink-0 items-center gap-2 pl-2 text-[11px] text-slate-300">
			<div className="hidden items-center gap-1.5 rounded-md border border-[#3d8fd4]/20 bg-[#1a4a6e]/40 px-2 py-1 sm:flex">
				<span className="h-1.5 w-1.5 rounded-full bg-[#3d8fd4]" />
				<span className="font-mono uppercase tracking-wide text-[#a8daf5]">Online</span>
			</div>
			<div className="text-right leading-tight">
				<div className="font-mono text-slate-200">{formatClock(now)}</div>
				<div className="hidden text-[10px] text-slate-400 sm:block">{formatDate(now)}</div>
			</div>
		</div>
	);
}
