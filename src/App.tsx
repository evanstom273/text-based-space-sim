import { WindowManagerProvider } from './context/WindowManagerContext';
import { ClockProvider } from './context/ClockContext';
import { Desktop } from './components/desktop/Desktop';

export function App() {
	return (
		<WindowManagerProvider>
			<ClockProvider>
				<Desktop />
			</ClockProvider>
		</WindowManagerProvider>
	);
}

export default App;
