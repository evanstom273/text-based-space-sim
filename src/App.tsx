import { WindowManagerProvider } from './context/WindowManagerContext';
import { Desktop } from './components/desktop/Desktop';

export function App() {
	return (
		<WindowManagerProvider>
			<Desktop />
		</WindowManagerProvider>
	);
}

export default App;
