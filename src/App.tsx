import { GameSessionProvider } from './context/GameSessionContext';
import { GameShell } from './components/game/GameShell';

export function App() {
	return (
		<GameSessionProvider>
			<GameShell />
		</GameSessionProvider>
	);
}

export default App;
