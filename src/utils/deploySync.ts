import { BUILD_ID } from '../config/buildInfo';

interface DeployVersion {
	buildId: string;
}

async function fetchLiveBuildId(): Promise<string | null> {
	const base = import.meta.env.BASE_URL;
	const response = await fetch(`${base}version.json?${Date.now()}`, { cache: 'no-store' });
	if (!response.ok) return null;
	const payload = (await response.json()) as DeployVersion;
	return payload.buildId ?? null;
}

export async function ensureLatestDeploy(): Promise<void> {
	if (import.meta.env.DEV) return;

	try {
		const liveBuildId = await fetchLiveBuildId();
		if (liveBuildId && liveBuildId !== BUILD_ID) {
			window.location.reload();
		}
	} catch {
		// Ignore transient network failures.
	}
}

export function startDeploySyncWatcher(): void {
	if (import.meta.env.DEV) return;

	void ensureLatestDeploy();

	const handleVisibility = () => {
		if (document.visibilityState === 'visible') {
			void ensureLatestDeploy();
		}
	};

	document.addEventListener('visibilitychange', handleVisibility);
}
