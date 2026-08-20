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
			<div className="flex h-full items-center justify-center bg-[#ececf0] text-[#666] select-text">
				Unknown module
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col bg-gradient-to-b from-[#f2f2f5] to-[#e4e4ea] text-[#2a2a2e] select-text">
			<div className="border-b border-[#d0d0d8]/80 bg-white/80 px-6 py-4">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center border border-[#c8c8d4] bg-[#f8f8fa] text-[var(--accent-purple-dim)] terminal-bevel-sm">
						<AppIconRenderer icon={app.icon} size={20} />
					</div>
					<div>
						<h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#1a1a1e]">
							{app.name}
						</h2>
						<p className="font-mono text-[10px] uppercase tracking-wider text-[var(--accent-gold-dim)]">
							{app.badgeCode}
						</p>
					</div>
				</div>
			</div>
			<div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
				<div className="h-px w-16 bg-gradient-to-r from-transparent via-[var(--accent-purple)]/40 to-transparent" />
				<p className="max-w-sm text-sm leading-relaxed text-[#5a5a64]">{app.description}</p>
				<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#9898a4]">
					Module awaiting integration
				</p>
			</div>
		</div>
	);
}
