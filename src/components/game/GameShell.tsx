import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useGameSession } from '../../context/GameSessionContext';
import type { AuthMode, GamePhase } from '../../types/commandProfile';
import { SCENE_FADE_MS, useSceneTransition } from '../../hooks/useSceneTransition';
import { ActiveDesktop } from './ActiveDesktop';
import { AuthTransition } from './AuthTransition';
import { BootSequence } from './BootSequence';
import { CommandProfileScreen } from './CommandProfileScreen';
import { CreateProfileScreen } from './CreateProfileScreen';

function isEnterAuth(mode: AuthMode | null): boolean {
	return mode === 'new' || mode === 'load';
}

function isMenuPhase(phase: GamePhase): boolean {
	return phase === 'boot' || phase === 'profiles' || phase === 'create';
}

function SceneLayer({
	phase,
	variant,
	children,
}: {
	phase: GamePhase;
	variant: 'leave' | 'enter' | 'visible' | 'under' | 'under-visible' | 'under-dim';
	children: ReactNode;
}) {
	return (
		<div
			className={`game-scene-layer game-scene-layer--${phase} game-scene-layer--${variant}`}
			style={{ transitionDuration: `${SCENE_FADE_MS}ms` }}
		>
			{children}
		</div>
	);
}

export function GameShell() {
	const {
		phase,
		authMode,
		activeProfile,
		completeBoot,
		completeAuth,
		persistActiveSimulation,
	} = useGameSession();

	const { visiblePhase, leavingPhase, isTransitioning } = useSceneTransition(phase);
	const [desktopRevealed, setDesktopRevealed] = useState(false);
	const [authFadingOut, setAuthFadingOut] = useState(false);

	useEffect(() => {
		if (phase === 'boot' || phase === 'profiles' || phase === 'create') {
			setDesktopRevealed(false);
			setAuthFadingOut(false);
		}
	}, [phase]);

	const handleRevealDesktop = useCallback(() => {
		setDesktopRevealed(true);
	}, []);

	const handleAuthComplete = useCallback(() => {
		if (isEnterAuth(authMode)) {
			setAuthFadingOut(true);
			window.setTimeout(() => {
				setAuthFadingOut(false);
				completeAuth();
			}, SCENE_FADE_MS);
			return;
		}

		completeAuth();
	}, [authMode, completeAuth]);

	const renderMenuPhase = (targetPhase: GamePhase) => {
		switch (targetPhase) {
			case 'boot':
				return <BootSequence onComplete={completeBoot} />;
			case 'profiles':
				return <CommandProfileScreen />;
			case 'create':
				return <CreateProfileScreen />;
			default:
				return null;
		}
	};

	const showDesktop =
		activeProfile !== null &&
		(phase === 'desktop' ||
			(phase === 'auth' && (desktopRevealed || authMode === 'exit')));

	const desktopVariant =
		phase === 'auth' && authMode === 'exit'
			? 'under-dim'
			: desktopRevealed || phase === 'desktop'
				? 'under-visible'
				: 'under';

	const showAuth =
		activeProfile !== null &&
		authMode !== null &&
		(phase === 'auth' || leavingPhase === 'auth');

	const visibleMenuPhase = isMenuPhase(visiblePhase) ? visiblePhase : null;
	const leavingMenuPhase =
		leavingPhase !== null && isMenuPhase(leavingPhase) ? leavingPhase : null;

	return (
		<div className="game-scene-root">
			{showDesktop && activeProfile ? (
				<SceneLayer phase="desktop" variant={desktopVariant}>
					<ActiveDesktop
						profile={activeProfile}
						onSnapshotChange={persistActiveSimulation}
					/>
				</SceneLayer>
			) : null}

			{leavingMenuPhase && leavingMenuPhase !== visibleMenuPhase ? (
				<SceneLayer phase={leavingMenuPhase} variant="leave">
					{renderMenuPhase(leavingMenuPhase)}
				</SceneLayer>
			) : null}

			{visibleMenuPhase ? (
				<SceneLayer
					phase={visibleMenuPhase}
					variant={isTransitioning && leavingMenuPhase ? 'enter' : 'visible'}
				>
					{renderMenuPhase(visibleMenuPhase)}
				</SceneLayer>
			) : null}

			{showAuth && activeProfile && authMode ? (
				<SceneLayer phase="auth" variant={authFadingOut ? 'leave' : isTransitioning ? 'enter' : 'visible'}>
					<AuthTransition
						profile={activeProfile}
						mode={authMode}
						fadingOut={authFadingOut}
						onRevealDesktop={isEnterAuth(authMode) ? handleRevealDesktop : undefined}
						onComplete={handleAuthComplete}
					/>
				</SceneLayer>
			) : null}
		</div>
	);
}
