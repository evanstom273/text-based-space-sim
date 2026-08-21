const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
	isDesktop: true,
	platform: process.platform,
	getVersion: () => ipcRenderer.invoke('get-app-version'),
});