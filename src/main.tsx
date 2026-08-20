import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import { startDeploySyncWatcher } from './utils/deploySync';
import './index.css';

startDeploySyncWatcher();

if (import.meta.env.PROD) {
	registerSW({
		immediate: true,
		onNeedRefresh() {
			window.location.reload();
		},
	});
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
