import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from 'react';
import type {
	AuthMode,
	CommandProfile,
	CreateProfileInput,
	GamePhase,
} from '../types/commandProfile';
import type { ShipStateSnapshot } from '../utils/shipPersistence';
import { SCENE_FADE_MS } from '../hooks/useSceneTransition';
import { getAgeYearsOnAbsoluteDay } from '../domain/personnel/age';
import { syncRosterAgesFromDateOfBirth } from '../domain/personnel/roster';
import {
	createCommandProfile,
	deleteProfileFromStore,
	getProfileById,
	loadFastBootPreference,
	loadProfileStore,
	saveFastBootPreference,
	saveProfileStore,
	upsertProfile,
} from '../utils/profileStore';

interface GameSessionContextValue {
	phase: GamePhase;
	authMode: AuthMode | null;
	profiles: CommandProfile[];
	activeProfile: CommandProfile | null;
	fastBoot: boolean;
	setFastBoot: (enabled: boolean) => void;
	completeBoot: () => void;
	openCreateProfile: () => void;
	cancelCreateProfile: () => void;
	createAndAssumeCommand: (input: CreateProfileInput) => void;
	selectProfile: (profileId: string) => void;
	deleteProfile: (profileId: string) => void;
	completeAuth: () => void;
	relinquishCommand: () => void;
	persistActiveSimulation: (snapshot: ShipStateSnapshot) => void;
}

const GameSessionContext = createContext<GameSessionContextValue | undefined>(undefined);

export function GameSessionProvider({ children }: { children: ReactNode }) {
	const [phase, setPhase] = useState<GamePhase>('boot');
	const [authMode, setAuthMode] = useState<AuthMode | null>(null);
	const [profiles, setProfiles] = useState<CommandProfile[]>(() => loadProfileStore().profiles);
	const [activeProfile, setActiveProfile] = useState<CommandProfile | null>(null);
	const [fastBoot, setFastBootState] = useState(() => loadFastBootPreference());

	const persistStore = useCallback((nextProfiles: CommandProfile[]) => {
		saveProfileStore({ version: 1, profiles: nextProfiles });
		setProfiles(nextProfiles);
	}, []);

	const setFastBoot = useCallback((enabled: boolean) => {
		setFastBootState(enabled);
		saveFastBootPreference(enabled);
	}, []);

	const completeBoot = useCallback(() => {
		setPhase('profiles');
	}, []);

	const openCreateProfile = useCallback(() => {
		setPhase('create');
	}, []);

	const cancelCreateProfile = useCallback(() => {
		setPhase('profiles');
	}, []);

	const createAndAssumeCommand = useCallback(
		(input: CreateProfileInput) => {
			const profile = createCommandProfile(input);
			const crew = profile.future.crew;
			if (!crew || crew.personnel.length < 20) {
				console.error('Ship population incomplete after profile creation', {
					personnel: crew?.personnel.length ?? 0,
					relationships: crew?.relationships.length ?? 0,
				});
			}
			const store = upsertProfile(loadProfileStore(), profile);
			persistStore(store.profiles);
			setActiveProfile(profile);
			setAuthMode('new');
			setPhase('auth');
		},
		[persistStore],
	);

	const selectProfile = useCallback(
		(profileId: string) => {
			const profile = getProfileById(loadProfileStore(), profileId);
			if (!profile) return;
			setActiveProfile(profile);
			setAuthMode('load');
			setPhase('auth');
		},
		[],
	);

	const deleteProfile = useCallback(
		(profileId: string) => {
			const store = deleteProfileFromStore(loadProfileStore(), profileId);
			persistStore(store.profiles);
			if (activeProfile?.id === profileId) {
				setActiveProfile(null);
			}
		},
		[activeProfile?.id, persistStore],
	);

	const completeAuth = useCallback(() => {
		if (authMode === 'exit') {
			setPhase('profiles');
			window.setTimeout(() => {
				setActiveProfile(null);
				setAuthMode(null);
			}, SCENE_FADE_MS);
			return;
		}

		setAuthMode(null);
		setPhase('desktop');
	}, [authMode]);

	const persistActiveSimulation = useCallback(
		(snapshot: ShipStateSnapshot) => {
			if (!activeProfile) return;

			const crew = activeProfile.future.crew
				? syncRosterAgesFromDateOfBirth(
						activeProfile.future.crew,
						snapshot.absoluteDay,
						getAgeYearsOnAbsoluteDay,
					)
				: activeProfile.future.crew;

			const updated: CommandProfile = {
				...activeProfile,
				updatedAt: Date.now(),
				simulation: snapshot,
				future: {
					...activeProfile.future,
					crew,
				},
			};
			const store = upsertProfile(loadProfileStore(), updated);
			persistStore(store.profiles);
			setActiveProfile(updated);
		},
		[activeProfile, persistStore],
	);

	const relinquishCommand = useCallback(() => {
		setAuthMode('exit');
		setPhase('auth');
	}, []);

	const value = useMemo<GameSessionContextValue>(
		() => ({
			phase,
			authMode,
			profiles,
			activeProfile,
			fastBoot,
			setFastBoot,
			completeBoot,
			openCreateProfile,
			cancelCreateProfile,
			createAndAssumeCommand,
			selectProfile,
			deleteProfile,
			completeAuth,
			relinquishCommand,
			persistActiveSimulation,
		}),
		[
			phase,
			authMode,
			profiles,
			activeProfile,
			fastBoot,
			setFastBoot,
			completeBoot,
			openCreateProfile,
			cancelCreateProfile,
			createAndAssumeCommand,
			selectProfile,
			deleteProfile,
			completeAuth,
			relinquishCommand,
			persistActiveSimulation,
		],
	);

	return <GameSessionContext.Provider value={value}>{children}</GameSessionContext.Provider>;
}

export function useGameSession(): GameSessionContextValue {
	const ctx = useContext(GameSessionContext);
	if (!ctx) {
		throw new Error('useGameSession must be used within GameSessionProvider');
	}
	return ctx;
}

export function useActiveCommandProfile(): CommandProfile {
	const { activeProfile } = useGameSession();
	if (!activeProfile) {
		throw new Error('No active command profile loaded');
	}
	return activeProfile;
}
