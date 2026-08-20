import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { startDeploySyncWatcher } from './utils/deploySync';
import './index.css';

startDeploySyncWatcher();

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
