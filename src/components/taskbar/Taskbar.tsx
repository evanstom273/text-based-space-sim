import { useEffect, useRef, useState } from 'react';
import { Bell, Volume2 } from 'lucide-react';
import { useWindowManager } from '../../context/WindowManagerContext';
import { AppIconRenderer } from '../common/AppIconRenderer';
import { ShipInsignia } from '../common/ShipInsignia';
import { StartMenu } from './StartMenu';
import { SystemTray } from './SystemTray';

export function Taskbar() {
	const { windows, toggleMinimizeWindow, activeWindowId } = useWindowManager();
	const [menuOpen, setMenuOpen] = useState(false);
	const taskbarRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!menuOpen) return;

		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node;
			if (taskbarRef.current?.contains(target)) return;
			setMenuOpen(false);
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [menuOpen]);

	return (
		<div ref={taskbarRef} className="relative z-[500] shrink-0">
			<StartMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
			<footer className="terminal-dock flex h-16 items-stretch px-2 sm:px-3">
				<div className="flex items-center pr-2 sm:pr-3">
					<button
						id="start-menu-button"
						type="button"
						className={`dock-home-btn terminal-bevel flex h-11 w-11 shrink-0 items-center justify-center transition-all sm:h-12 sm:w-12 ${
							menuOpen ? 'dock-home-btn--active' : ''
						}`}
						onClick={() => setMenuOpen((open) => !open)}
						aria-label="Terminal modules"
					>
						<ShipInsignia size={22} className={menuOpen ? 'text-[var(--accent-purple-bright)]' : ''} />
					</button>
				</div>

				<div className="terminal-divider my-3 hidden sm:block" />

				<div className="terminal-chrome-inset terminal-bevel-sm my-2 flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto border px-2 no-scrollbar">
					{windows.length === 0 && (
						<span className="px-2 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--text-silver-dim)]">
							No active modules
						</span>
					)}
					{windows.map((win) => {
						const isActive = activeWindowId === win.id && win.state !== 'minimised';
						const isMinimised = win.state === 'minimised';

						return (
							<button
								key={win.id}
								type="button"
								className={`dock-tab terminal-bevel-sm flex h-10 max-w-[200px] shrink-0 items-center gap-2 px-3 text-left transition-all ${
									isActive ? 'dock-tab--active' : ''
								} ${isMinimised ? 'opacity-55' : ''}`}
								onClick={() => toggleMinimizeWindow(win.id)}
							>
								<AppIconRenderer
									icon={win.icon}
									size={15}
									className={`shrink-0 ${
										isActive ? 'text-[var(--accent-purple-bright)]' : 'text-[var(--text-silver)]'
									}`}
								/>
								<span
									className={`truncate text-[10px] font-semibold uppercase tracking-[0.12em] ${
										isActive ? 'text-white' : 'text-[var(--text-silver-dim)]'
									}`}
								>
									{win.title}
								</span>
								<span
									className={`ml-auto h-2 w-2 shrink-0 rounded-full ${
										isActive
											? 'bg-[var(--accent-purple-bright)] shadow-[0_0_8px_var(--accent-purple-glow)]'
											: 'bg-[var(--text-silver-dim)]/40'
									}`}
								/>
							</button>
						);
					})}
				</div>

				<div className="terminal-divider-gold my-3 hidden md:block" />

				<div className="hidden items-center gap-2 px-2 text-[var(--text-silver)] md:flex">
					<button
						type="button"
						className="rounded p-1.5 transition-colors hover:bg-[var(--accent-purple-soft)] hover:text-[var(--accent-purple-bright)]"
						aria-label="Notifications"
					>
						<Bell size={15} strokeWidth={1.5} />
					</button>
					<button
						type="button"
						className="rounded p-1.5 transition-colors hover:bg-[var(--accent-purple-soft)] hover:text-[var(--accent-purple-bright)]"
						aria-label="Audio"
					>
						<Volume2 size={15} strokeWidth={1.5} />
					</button>
				</div>

				<SystemTray />
			</footer>
		</div>
	);
}
