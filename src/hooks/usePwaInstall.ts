import { useCallback, useEffect, useRef, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function detectInstalled(): boolean {
	if (typeof window === 'undefined') return false;
	return (
		window.matchMedia('(display-mode: standalone)').matches ||
		window.matchMedia('(display-mode: fullscreen)').matches ||
		(window.navigator as Navigator & { standalone?: boolean }).standalone === true
	);
}

function detectIos(): boolean {
	if (typeof navigator === 'undefined') return false;
	return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function usePwaInstall() {
	const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
	const [canInstall, setCanInstall] = useState(false);
	const [isInstalled, setIsInstalled] = useState(() => detectInstalled());
	const [isIos] = useState(() => detectIos());
	const [installMessage, setInstallMessage] = useState<string | null>(null);

	useEffect(() => {
		setIsInstalled(detectInstalled());

		const onBeforeInstall = (event: Event) => {
			event.preventDefault();
			deferredPromptRef.current = event as BeforeInstallPromptEvent;
			setCanInstall(true);
			setInstallMessage(null);
		};

		const onInstalled = () => {
			deferredPromptRef.current = null;
			setCanInstall(false);
			setIsInstalled(true);
			setInstallMessage('Union Terminal installed on this device.');
		};

		const onDisplayModeChange = () => {
			setIsInstalled(detectInstalled());
		};

		window.addEventListener('beforeinstallprompt', onBeforeInstall);
		window.addEventListener('appinstalled', onInstalled);
		window.matchMedia('(display-mode: standalone)').addEventListener('change', onDisplayModeChange);

		return () => {
			window.removeEventListener('beforeinstallprompt', onBeforeInstall);
			window.removeEventListener('appinstalled', onInstalled);
			window.matchMedia('(display-mode: standalone)').removeEventListener('change', onDisplayModeChange);
		};
	}, []);

	const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
		const deferred = deferredPromptRef.current;
		if (!deferred) {
			setInstallMessage(
				import.meta.env.PROD
					? 'Install is not available in this browser yet. Try Chrome or Edge on desktop, or use Add to Home Screen on mobile.'
					: 'Install is available in the production build after deploying with PWA enabled.',
			);
			return 'unavailable';
		}

		await deferred.prompt();
		const { outcome } = await deferred.userChoice;

		if (outcome === 'accepted') {
			deferredPromptRef.current = null;
			setCanInstall(false);
			setInstallMessage('Union Terminal installed on this device.');
		} else {
			setInstallMessage('Install dismissed. You can try again from Settings.');
		}

		return outcome;
	}, []);

	return {
		canInstall,
		isInstalled,
		isIos,
		installMessage,
		setInstallMessage,
		promptInstall,
	};
}
