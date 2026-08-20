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
			<footer className="terminal-chrome flex h-[52px] items-stretch border-t px-1 sm:px-2">
				<div className="flex items-center gap-1 pr-1 sm:gap-2 sm:pr-2">
					<button
						id="start-menu-button"
						type="button"
						className={`terminal-bevel-sm flex h-10 w-10 shrink-0 items-center justify-center border transition-colors sm:h-11 sm:w-11 ${
							menuOpen
								? 'border-[var(--accent-purple)] bg-[var(--accent-purple)]/15 text-[var(--accent-purple-bright)]'
								: 'border-[var(--border-silver)] bg-[var(--surface-inset)] text-[var(--accent-gold)] hover:border-[var(--accent-purple)]/40'
						}`}
						onClick={() => setMenuOpen((open) => !open)}
						aria-label="Terminal modules"
					>
						<ShipInsignia size={20} />
					</button>
				</div>

				<div className="terminal-divider my-2 hidden sm:block" />

				<div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-1 no-scrollbar">
					{windows.map((win) => {
						const isActive = activeWindowId === win.id && win.state !== 'minimised';
						const isMinimised = win.state === 'minimised';

						return (
							<button
								key={win.id}
								type="button"
								className={`terminal-bevel-sm flex h-9 max-w-[180px] shrink-0 items-center gap-2 border px-2.5 text-left transition-colors sm:h-10 ${
									isActive
										? 'border-[var(--accent-purple)] bg-[var(--accent-purple)]/12 text-white'
										: isMinimised
											? 'border-[var(--border-silver)] bg-transparent text-[var(--text-silver-dim)] hover:border-[var(--accent-purple)]/30'
											: 'border-[var(--border-silver)] bg-[var(--surface-inset)]/50 text-[var(--text-silver)] hover:border-[var(--accent-purple)]/35'
								}`}
								onClick={() => toggleMinimizeWindow(win.id)}
							>
								<AppIconRenderer
									icon={win.icon}
									size={14}
									className={`shrink-0 ${isActive ? 'text-[var(--accent-purple-bright)]' : 'text-[var(--text-silver-dim)]'}`}
								/>
								<span className="truncate text-[10px] font-medium uppercase tracking-[0.1em]">
									{win.title}
								</span>
								{isActive && (
									<span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-purple-bright)] shadow-[0_0_6px_var(--accent-purple-glow)]" />
								)}
							</button>
						);
					})}
				</div>

				<div className="terminal-divider my-2 hidden md:block" />

				<div className="hidden items-center gap-2 px-2 text-[var(--text-silver-dim)] md:flex">
					<button type="button" className="p-1 hover:text-[var(--text-silver)]" aria-label="Notifications">
						<Bell size={14} strokeWidth={1.5} />
					</button>
					<button type="button" className="p-1 hover:text-[var(--text-silver)]" aria-label="Audio">
						<Volume2 size={14} strokeWidth={1.5} />
					</button>
				</div>

				<SystemTray />
			</footer>
		</div>
	);
}
