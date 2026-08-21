export interface ElectronAPI {
	isDesktop: boolean;
	platform: string;
	getVersion: () => Promise<string>;
}

declare global {
	interface Window {
		electronAPI?: ElectronAPI;
	}
}