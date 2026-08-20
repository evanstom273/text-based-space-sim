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
		<header className="terminal-chrome terminal-chrome-top relative z-[600] flex h-12 shrink-0 items-stretch px-0 text-[11px] text-[var(--text-silver)]">
			<div className="ship-identity-block terminal-bevel-sm flex items-center gap-3 px-3 sm:gap-4 sm:px-4">
				<div className="insignia-frame terminal-bevel-sm flex h-9 w-9 shrink-0 items-center justify-center">
					<ShipInsignia size={22} />
				</div>
				<div className="min-w-0 leading-tight">
					<div className="ship-name-glow truncate text-sm font-bold uppercase tracking-[0.14em] text-white sm:text-base">
						{SHIP_INFO.name}
					</div>
					<div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--accent-gold)]">
						{SHIP_INFO.registry}
					</div>
				</div>
			</div>

			<div className="terminal-divider my-2 hidden sm:block" />

			<div className="hidden flex-1 items-center justify-center md:flex">
				<div className="flex items-center gap-2 rounded-sm border border-[var(--border-silver)] bg-[var(--surface-inset)]/60 px-3 py-1">
					<span className="h-1 w-1 rounded-full bg-[var(--accent-purple-bright)] shadow-[0_0_6px_var(--accent-purple-glow)]" />
					<span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-silver)]">
						{formatStardate(now)}
					</span>
				</div>
			</div>

			<div className="terminal-divider-gold my-2 hidden lg:block" />

			<div className="hidden min-w-0 flex-1 items-center justify-center px-4 lg:flex">
				<span className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-silver-dim)]">
					{SHIP_INFO.location}
				</span>
			</div>

			<div className="terminal-divider my-2 hidden sm:block" />

			<div className="flex items-center gap-2 px-3 sm:gap-3 sm:px-4">
				<div className="status-nominal hidden items-center gap-1.5 border px-2.5 py-1 sm:flex terminal-bevel-sm">
					<span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(110,231,160,0.6)]" />
					<span className="font-mono text-[9px] uppercase tracking-wider">{SHIP_INFO.alertStatus}</span>
				</div>

				<div className="hidden items-center gap-2.5 text-[var(--text-silver)] md:flex">
					<Signal size={14} strokeWidth={1.5} className="opacity-80" />
					<Wifi size={14} strokeWidth={1.5} className="opacity-80" />
					<div className="flex items-center gap-1">
						<Battery size={14} strokeWidth={1.5} className="opacity-80" />
						<span className="font-mono text-[9px] text-[var(--text-silver-dim)]">99%</span>
					</div>
				</div>

				<div className="terminal-divider hidden h-6 sm:block" />

				<div className="text-right leading-tight">
					<div className="font-mono text-sm font-medium text-white">{formatClock(now)}</div>
					<div className="hidden font-mono text-[9px] text-[var(--accent-purple-bright)] sm:block">
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
