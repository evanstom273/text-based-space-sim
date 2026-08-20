import { useEffect, useRef, useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import { useWindowManager } from '../../context/WindowManagerContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { AppIconRenderer } from '../common/AppIconRenderer';
import { StartMenu } from './StartMenu';
import { SystemTray } from './SystemTray';

export function Taskbar() {
	const { windows, toggleMinimizeWindow, activeWindowId } = useWindowManager();
	const [menuOpen, setMenuOpen] = useState(false);
	const isMobile = useIsMobile();
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
			<footer
				className={`flex h-11 items-center gap-1 border-t px-2 ${
					isMobile
						? 'border-[#2a6a9a]/40 bg-[#0a2840]/95 backdrop-blur-md'
						: 'border-[#2a6a9a]/30 bg-[#0f3550]/95 backdrop-blur-sm'
				}`}
			>
				<button
					id="start-menu-button"
					type="button"
					className={`flex h-8 items-center gap-2 rounded-md px-2.5 text-xs font-medium transition-colors ${
						menuOpen
							? 'bg-[#2a6a9a]/60 text-white'
							: 'text-slate-200 hover:bg-[#2a6a9a]/40'
					}`}
					onClick={() => setMenuOpen((open) => !open)}
				>
					<LayoutGrid size={16} className="text-[#7ec8f0]" />
					<span className="hidden sm:inline">Applications</span>
				</button>

				<div className="mx-1 hidden h-5 w-px bg-[#3d8fd4]/25 sm:block" />

				<div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto no-scrollbar">
					{windows.map((win) => {
						const isActive = activeWindowId === win.id && win.state !== 'minimised';
						const isMinimised = win.state === 'minimised';

						return (
							<button
								key={win.id}
								type="button"
								className={`flex h-8 max-w-[160px] shrink-0 items-center gap-1.5 rounded-md px-2 text-left text-[11px] transition-colors ${
									isActive
										? 'bg-[#2a6a9a]/70 text-white'
										: isMinimised
											? 'text-slate-400 hover:bg-[#1a4a6e]/50'
											: 'text-slate-200 hover:bg-[#1a4a6e]/50'
								}`}
								onClick={() => toggleMinimizeWindow(win.id)}
							>
								<AppIconRenderer icon={win.icon} size={14} className="shrink-0 text-[#a8daf5]" />
								<span className="truncate">{win.title}</span>
							</button>
						);
					})}
				</div>

				<SystemTray />
			</footer>
		</div>
	);
}
