import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { APP_LIST } from '../../config/apps.config';
import { useWindowManager } from '../../context/WindowManagerContext';
import type { AppCategory, AppDefinition } from '../../types';
import { AppIconRenderer } from '../common/AppIconRenderer';

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
		<div className="absolute bottom-12 left-2 z-[1000] w-[min(420px,calc(100vw-16px))] animate-fadeIn overflow-hidden rounded-xl border border-[#3d8fd4]/30 bg-[#f8fbfd] shadow-2xl shadow-[#0a2840]/40">
			<div className="border-b border-slate-200/80 bg-gradient-to-r from-[#e8f4fc] to-white px-4 py-3">
				<p className="text-xs font-semibold uppercase tracking-widest text-[#1a5f8a]">
					Union Terminal
				</p>
				<p className="text-[11px] text-slate-500">Select a shipboard module</p>
			</div>
			<div className="border-b border-slate-200/80 px-3 py-2">
				<div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
					<Search size={14} className="text-slate-400" />
					<input
						type="search"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Search modules..."
						className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
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
							<p className="px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-slate-400">
								{category}
							</p>
							{apps.map((app) => (
								<button
									key={app.id}
									type="button"
									className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[#e8f4fc]"
									onClick={() => handleOpenApp(app.id)}
								>
									<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1a5f8a]/10 text-[#1a5f8a]">
										<AppIconRenderer icon={app.icon} size={18} />
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2">
											<span className="text-sm font-medium text-slate-800">{app.name}</span>
											<span className="font-mono text-[9px] text-slate-400">{app.badgeCode}</span>
										</div>
										<p className="truncate text-[11px] text-slate-500">
											{app.subtitle ?? app.description}
										</p>
									</div>
								</button>
							))}
						</div>
					);
				})}
				{filteredApps.length === 0 && (
					<p className="px-3 py-6 text-center text-sm text-slate-400">No modules found</p>
				)}
			</div>
		</div>
	);
}
