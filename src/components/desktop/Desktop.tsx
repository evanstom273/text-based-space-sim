import { useEffect, useState } from 'react';
import { Battery, Signal, Wifi } from 'lucide-react';
import { DesktopIconGrid } from './DesktopIconGrid';
import { TerminalBackground } from './TerminalBackground';
import { WindowFrame } from '../window/WindowFrame';
import { SnapOverlay } from '../window/SnapOverlay';
import { Taskbar } from '../taskbar/Taskbar';
import { ShipInsignia } from '../common/ShipInsignia';
import { useWindowManager } from '../../context/WindowManagerContext';
import { formatClock, formatStardate } from '../../utils/terminalTime';

export const SHIP_INFO = {
	name: 'USS Clements',
	registry: 'ECV-1987',
	location: 'Epsilon Eridani Sector',
	alertStatus: 'Nominal',
} as const;

export function ShipStatusBar() {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const interval = window.setInterval(() => setNow(new Date()), 1000);
		return () => window.clearInterval(interval);
	}, []);

	return (
		<header className="terminal-chrome relative z-[600] flex h-10 shrink-0 items-stretch border-b px-0 text-[11px] text-[var(--text-silver)]">
			<div className="flex min-w-0 flex-1 items-center gap-3 px-3 sm:gap-4 sm:px-4">
				<div className="flex items-center gap-2.5">
					<div className="flex h-7 w-7 shrink-0 items-center justify-center text-[var(--accent-gold)]">
						<ShipInsignia size={22} />
					</div>
					<div className="min-w-0 leading-tight">
						<div className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-white">
							{SHIP_INFO.name}
						</div>
						<div className="hidden font-mono text-[9px] uppercase tracking-widest text-[var(--text-silver-dim)] sm:block">
							{SHIP_INFO.registry}
						</div>
					</div>
				</div>

				<div className="terminal-divider hidden h-5 sm:block" />

				<div className="hidden items-center gap-1.5 md:flex">
					<span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-silver-dim)]">
						{formatStardate(now)}
					</span>
				</div>
			</div>

			<div className="hidden items-center border-x border-[var(--border-silver)] px-4 lg:flex">
				<span className="truncate font-mono text-[10px] uppercase tracking-wide text-[var(--text-silver-dim)]">
					{SHIP_INFO.location}
				</span>
			</div>

			<div className="flex items-center gap-2 px-3 sm:gap-3 sm:px-4">
				<div className="status-nominal hidden items-center gap-1.5 border px-2 py-0.5 sm:flex terminal-bevel-sm">
					<span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
					<span className="font-mono text-[9px] uppercase tracking-wider">{SHIP_INFO.alertStatus}</span>
				</div>

				<div className="hidden items-center gap-2 text-[var(--text-silver-dim)] md:flex">
					<Signal size={13} strokeWidth={1.5} />
					<Wifi size={13} strokeWidth={1.5} />
					<div className="flex items-center gap-0.5">
						<Battery size={13} strokeWidth={1.5} />
						<span className="font-mono text-[9px]">99%</span>
					</div>
				</div>

				<div className="terminal-divider hidden h-5 sm:block" />

				<div className="text-right leading-tight">
					<div className="font-mono text-xs text-white">{formatClock(now)}</div>
					<div className="hidden font-mono text-[9px] text-[var(--text-silver-dim)] sm:block">
						{formatStardate(now)}
					</div>
				</div>
			</div>
		</header>
	);
}

export function Desktop() {
	const { windows, snapTarget } = useWindowManager();

	return (
		<div className="relative flex h-screen w-screen flex-col overflow-hidden bg-terminal-pattern select-none">
			<ShipStatusBar />
			<div className="relative min-h-0 flex-1">
				<TerminalBackground />
				<DesktopIconGrid />
				<div className="pointer-events-none absolute inset-0">
					{windows.map((win) => (
						<div key={win.id} className="pointer-events-auto">
							<WindowFrame window={win} />
						</div>
					))}
				</div>
				<SnapOverlay snapTarget={snapTarget} />
			</div>
			<Taskbar />
		</div>
	);
}
