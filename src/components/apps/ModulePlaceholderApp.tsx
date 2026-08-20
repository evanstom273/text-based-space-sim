import { getAppById } from '../../config/apps.config';
import { AppIconRenderer } from '../common/AppIconRenderer';

interface ModulePlaceholderAppProps {
	windowId: string;
	appId: string;
}

export function ModulePlaceholderApp({ appId }: ModulePlaceholderAppProps) {
	const app = getAppById(appId);

	if (!app) {
		return (
			<div className="flex h-full items-center justify-center bg-slate-50 text-slate-500 select-text">
				Unknown module
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800 select-text">
			<div className="border-b border-slate-200/80 bg-white/70 px-6 py-4">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a5f8a]/10 text-[#1a5f8a]">
						<AppIconRenderer icon={app.icon} size={22} />
					</div>
					<div>
						<h2 className="text-base font-semibold tracking-wide text-slate-800">{app.name}</h2>
						<p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
							{app.badgeCode}
						</p>
					</div>
				</div>
			</div>
			<div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
				<p className="max-w-sm text-sm leading-relaxed text-slate-500">{app.description}</p>
				<p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
					Module awaiting integration
				</p>
			</div>
		</div>
	);
}
