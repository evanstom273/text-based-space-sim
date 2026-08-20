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
			<div className="module-shell module-workspace items-center justify-center select-text">
				<p className="module-copy-muted">Unknown module</p>
			</div>
		);
	}

	return (
		<div className="module-shell module-workspace select-text">
			<div className="module-header px-6 py-4">
				<div className="flex items-center gap-3">
					<div className="module-icon-frame terminal-bevel-sm">
						<AppIconRenderer icon={app.icon} size={20} />
					</div>
					<div>
						<h2 className="module-title">{app.name}</h2>
						<p className="module-subtitle">{app.badgeCode}</p>
					</div>
				</div>
			</div>
			<div className="module-body flex flex-col items-center justify-center gap-4 px-6 text-center">
				<div className="module-divider" />
				<p className="module-copy max-w-sm">{app.description}</p>
				<p className="module-meta tracking-[0.18em]">Module awaiting integration</p>
			</div>
		</div>
	);
}
