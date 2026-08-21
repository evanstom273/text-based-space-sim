const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
	const mainWindow = new BrowserWindow({
		width: 1366,
		height: 840,
		minWidth: 960,
		minHeight: 640,
		title: 'Union Terminal — Starship Command',
		backgroundColor: '#202020',
		show: false,
		autoHideMenuBar: true,
		webPreferences: {
			preload: path.join(__dirname, 'preload.cjs'),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true,
		},
	});

	mainWindow.setMenuBarVisibility(false);

	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
		if (url.startsWith('http:') || url.startsWith('https:')) {
			void shell.openExternal(url);
			return { action: 'deny' };
		}
		return { action: 'allow' };
	});

	if (isDev && process.env.VITE_DEV_SERVER_URL) {
		void mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
	} else {
		void mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
	}

	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
	});
}

ipcMain.handle('get-app-version', () => {
	return app.getVersion();
});

app.whenReady().then(() => {
	createWindow();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});