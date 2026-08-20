import { useEffect, useRef, useState } from 'react';
import type { GamePhase } from '../types/commandProfile';

export const SCENE_FADE_MS = 650;

export function useSceneTransition(phase: GamePhase) {
	const [visiblePhase, setVisiblePhase] = useState(phase);
	const [leavingPhase, setLeavingPhase] = useState<GamePhase | null>(null);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const phaseRef = useRef(phase);

	useEffect(() => {
		if (phase === phaseRef.current) return;

		const outgoing = phaseRef.current;
		phaseRef.current = phase;
		setLeavingPhase(outgoing);
		setIsTransitioning(true);

		const enterFrame = requestAnimationFrame(() => {
			setVisiblePhase(phase);
		});

		const finishTimer = window.setTimeout(() => {
			setLeavingPhase(null);
			setIsTransitioning(false);
		}, SCENE_FADE_MS);

		return () => {
			cancelAnimationFrame(enterFrame);
			window.clearTimeout(finishTimer);
		};
	}, [phase]);

	return { visiblePhase, leavingPhase, isTransitioning };
}
