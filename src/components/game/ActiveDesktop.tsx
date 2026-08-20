import { WindowManagerProvider } from '../../context/WindowManagerContext';
import { ClockProvider } from '../../context/ClockContext';
import type { CommandProfile } from '../../types/commandProfile';
import type { ShipStateSnapshot } from '../../utils/shipPersistence';
import { Desktop } from '../desktop/Desktop';

interface ActiveDesktopProps {
	profile: CommandProfile;
	onSnapshotChange: (snapshot: ShipStateSnapshot) => void;
}

export function ActiveDesktop({ profile, onSnapshotChange }: ActiveDesktopProps) {
	return (
		<WindowManagerProvider key={profile.id}>
			<ClockProvider initialSnapshot={profile.simulation} onSnapshotChange={onSnapshotChange}>
				<Desktop />
			</ClockProvider>
		</WindowManagerProvider>
	);
}
