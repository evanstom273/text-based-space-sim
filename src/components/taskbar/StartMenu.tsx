import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { APP_LIST } from '../../config/apps.config';
import { useWindowManager } from '../../context/WindowManagerContext';
import type { AppCategory, AppDefinition } from '../../types';
import { AppIconRenderer } from '../common/AppIconRenderer';
import { ShipInsignia } from '../common/ShipInsignia';

interface StartMenuProps {
	isOpen: boolean;
	onClose: () => void;
}

const CATEGORY_ORDER: AppCategory[] = [
	'Operations',
	'Communications',
	'Navigation',
	'Intelligence',
	'Records',
	'Administration',
];

export function StartMenu({ isOpen, onClose }: StartMenuProps) {
	const { openWindow } = useWindowManager();
	const [query, setQuery] = useState('');

	const filteredApps = useMemo(() => {
		const normalized = query.trim().toLowerCase();
		if (!normalized) return APP_LIST;
		return APP_LIST.filter(
			(app) =>
				app.name.toLowerCase().includes(normalized) ||
				app.description.toLowerCase().includes(normalized) ||
				app.category.toLowerCase().includes(normalized) ||
				app.badgeCode.toLowerCase().includes(normalized),
		);
	}, [query]);

	const groupedApps = useMemo(() => {
		const groups = new Map<AppCategory, AppDefinition[]>();
		for (const category of CATEGORY_ORDER) {
			groups.set(category, []);
		}
		for (const app of filteredApps) {
			const list = groups.get(app.category) ?? [];
			list.push(app);
			groups.set(app.category, list);
		}
		return groups;
	}, [filteredApps]);

	if (!isOpen) return null;

	const handleOpenApp = (appId: string) => {
		openWindow(appId);
		setQuery('');
		onClose();
	};

	return (
		<div className="absolute bottom-[68px] left-2 z-[1000] w-[min(440px,calc(100vw-16px))] animate-fadeIn overflow-hidden border border-[rgba(176,120,240,0.35)] bg-[#242424] shadow-2xl shadow-black/70 terminal-bevel">
			<div className="border-b border-[var(--border-silver)] bg-gradient-to-r from-[#2a2a2a] to-[#222222] px-4 py-3">
				<div className="flex items-center gap-2.5">
					<div className="text-[var(--accent-gold)]">
						<ShipInsignia size={18} />
					</div>
					<div>
						<p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-purple-bright)]">
							Module Registry
						</p>
						<p className="text-[11px] text-[var(--text-silver-dim)]">Select shipboard system</p>
					</div>
				</div>
			</div>
			<div className="border-b border-[var(--border-silver)] px-3 py-2">
				<div className="terminal-chrome-inset flex items-center gap-2 border px-3 py-1.5 terminal-bevel-sm">
					<Search size={14} className="text-[var(--text-silver-dim)]" />
					<input
						type="search"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Search modules..."
						className="w-full bg-transparent text-sm text-[var(--text-silver)] outline-none placeholder:text-[var(--text-silver-dim)]"
						autoFocus
					/>
				</div>
			</div>
			<div className="max-h-[min(420px,50vh)] overflow-y-auto p-2 no-scrollbar">
				{CATEGORY_ORDER.map((category) => {
					const apps = groupedApps.get(category) ?? [];
					if (apps.length === 0) return null;

					return (
						<div key={category} className="mb-2">
							<p className="px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--text-silver-dim)]">
								{category}
							</p>
							{apps.map((app) => (
								<button
									key={app.id}
									type="button"
									className="flex w-full items-center gap-3 border border-transparent px-2 py-2 text-left transition-colors hover:border-[var(--accent-purple)]/25 hover:bg-[var(--accent-purple)]/8 terminal-bevel-sm"
									onClick={() => handleOpenApp(app.id)}
								>
									<div className="icon-module-frame terminal-bevel-sm h-9 w-9 shrink-0 text-[var(--text-silver)]">
										<AppIconRenderer icon={app.icon} size={16} />
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2">
											<span className="text-sm font-medium uppercase tracking-wide text-white">
												{app.name}
											</span>
											<span className="font-mono text-[9px] text-[var(--accent-gold)]">
												{app.badgeCode}
											</span>
										</div>
										<p className="truncate text-[11px] text-[var(--text-silver-dim)]">
											{app.subtitle ?? app.description}
										</p>
									</div>
								</button>
							))}
						</div>
					);
				})}
				{filteredApps.length === 0 && (
					<p className="px-3 py-6 text-center text-sm text-[var(--text-silver-dim)]">No modules found</p>
				)}
			</div>
		</div>
	);
}
