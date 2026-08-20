import { DesktopIconGrid } from './DesktopIconGrid';
import { WindowFrame } from '../window/WindowFrame';
import { SnapOverlay } from '../window/SnapOverlay';
import { Taskbar } from '../taskbar/Taskbar';
import { useWindowManager } from '../../context/WindowManagerContext';

export const SHIP_INFO = {
	name: 'USS Clements',
	registry: 'ECV-1987',
	location: 'Epsilon Eridani Sector',
	alertStatus: 'Green — All Clear',
} as const;

export function ShipStatusBar() {
	return (
		<header className="relative z-[600] flex h-9 shrink-0 items-center justify-between border-b border-[#2a6a9a]/30 bg-[#0f3550]/95 px-3 text-[11px] text-slate-200 backdrop-blur-sm sm:px-4">
			<div className="flex items-center gap-2 sm:gap-4">
				<div className="flex items-center gap-1.5">
					<span className="hidden font-mono uppercase tracking-widest text-[#7ec8f0]/70 sm:inline">
						Union Terminal
					</span>
					<span className="font-mono text-[#7ec8f0]/40 sm:hidden">UT</span>
				</div>
				<div className="h-3 w-px bg-[#3d8fd4]/25" />
				<span className="font-medium text-white">{SHIP_INFO.name}</span>
				<span className="hidden font-mono text-slate-400 sm:inline">{SHIP_INFO.registry}</span>
			</div>
			<div className="flex items-center gap-2 sm:gap-4">
				<span className="hidden truncate text-slate-400 md:inline">{SHIP_INFO.location}</span>
				<div className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5">
					<span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
					<span className="font-mono text-[10px] uppercase tracking-wide text-emerald-300">
						{SHIP_INFO.alertStatus}
					</span>
				</div>
			</div>
		</header>
	);
}

export function Desktop() {
	const { windows, snapTarget } = useWindowManager();

	return (
		<div className="relative flex h-screen w-screen flex-col overflow-hidden bg-terminal-pattern text-slate-100 select-none">
			<ShipStatusBar />
			<div className="relative min-h-0 flex-1">
				<div className="pointer-events-none absolute inset-0 terminal-watermark" />
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
