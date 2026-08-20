import { WindowManagerProvider } from '../../context/WindowManagerContext';
import { ClockProvider } from '../../context/ClockContext';
import { useGameSession } from '../../context/GameSessionContext';
import { Desktop } from '../desktop/Desktop';
import { AuthTransition } from './AuthTransition';
import { BootSequence } from './BootSequence';
import { CommandProfileScreen } from './CommandProfileScreen';
import { CreateProfileScreen } from './CreateProfileScreen';

export function GameShell() {
	const {
		phase,
		authMode,
		activeProfile,
		completeBoot,
		completeAuth,
		persistActiveSimulation,
	} = useGameSession();

	if (phase === 'boot') {
		return <BootSequence onComplete={completeBoot} />;
	}

	if (phase === 'profiles') {
		return <CommandProfileScreen />;
	}

	if (phase === 'create') {
		return <CreateProfileScreen />;
	}

	if (phase === 'auth' && activeProfile && authMode) {
		return (
			<AuthTransition profile={activeProfile} mode={authMode} onComplete={completeAuth} />
		);
	}

	if (phase === 'desktop' && activeProfile) {
		return (
			<WindowManagerProvider key={activeProfile.id}>
				<ClockProvider
					initialSnapshot={activeProfile.simulation}
					onSnapshotChange={persistActiveSimulation}
				>
					<Desktop />
				</ClockProvider>
			</WindowManagerProvider>
		);
	}

	return null;
}
