import { useEffect, useMemo, useState } from 'react';
import type { AuthMode, CommandProfile } from '../../types/commandProfile';
import { ShipInsignia } from '../common/ShipInsignia';
import { formatDisplayShipName } from '../../utils/profileRandomizer';

interface AuthTransitionProps {
	profile: CommandProfile;
	mode: AuthMode;
	fadingOut?: boolean;
	onRevealDesktop?: () => void;
	onComplete: () => void;
}

const ENTER_DURATION_MS = 2400;
const EXIT_DURATION_MS = 1800;

export function AuthTransition({
	profile,
	mode,
	fadingOut = false,
	onRevealDesktop,
	onComplete,
}: AuthTransitionProps) {
	const [visibleLines, setVisibleLines] = useState(0);
	const [phaseStep, setPhaseStep] = useState(0);

	const lines = useMemo(() => {
		const shipLabel = formatDisplayShipName(profile.vessel.name);

		if (mode === 'exit') {
			return [
				'RELINQUISHING COMMAND...',
				`CAPT. ${profile.captain.name}`,
				`VESSEL: ${shipLabel}`,
				'PERSISTING COMMAND STATE...',
				'TERMINAL SESSION CLOSING',
				'RETURNING TO COMMAND NETWORK',
			];
		}

		if (mode === 'load') {
			return [
				'AUTHENTICATING COMMAND PROFILE...',
				`CAPT. ${profile.captain.name}`,
				shipLabel,
				`REGISTRY: ${profile.vessel.registry}`,
				'COMMAND AUTHORISATION ACCEPTED',
				`WELCOME, CAPTAIN ${profile.captain.name.split(' ')[0] ?? profile.captain.name}`,
			];
		}

		return [
			'COMMAND AUTHORISATION ACCEPTED',
			'IDENTITY CONFIRMED',
			`VESSEL: ${shipLabel}`,
			`REGISTRY: ${profile.vessel.registry}`,
			`WELCOME, CAPTAIN ${profile.captain.name.split(' ')[0] ?? profile.captain.name}`,
			'INITIALISING VESSEL TERMINAL...',
		];
	}, [mode, profile]);

	const duration = mode === 'exit' ? EXIT_DURATION_MS : ENTER_DURATION_MS;

	useEffect(() => {
		const lineInterval = duration / (lines.length + 1);
		const timers: number[] = [];

		for (let index = 0; index < lines.length; index += 1) {
			timers.push(window.setTimeout(() => setVisibleLines(index + 1), lineInterval * (index + 1)));
		}

		timers.push(
			window.setTimeout(() => setPhaseStep(1), duration * 0.55),
			window.setTimeout(() => {
				setPhaseStep(2);
				if (mode !== 'exit') {
					onRevealDesktop?.();
				}
			}, duration * 0.72),
			window.setTimeout(onComplete, duration),
		);

		return () => timers.forEach((timer) => window.clearTimeout(timer));
	}, [duration, lines.length, mode, onComplete, onRevealDesktop]);

	return (
		<div
			className={`game-screen auth-screen auth-screen--${mode} ${fadingOut ? 'auth-screen--exit' : ''} ${phaseStep >= 1 ? 'auth-screen--scan' : ''}`}
		>
			<div className="auth-overlay auth-overlay--base" />

			<div className={`auth-content ${fadingOut ? 'auth-content--exit' : ''}`}>
				<div className={`auth-insignia ${phaseStep >= 0 ? 'auth-insignia--pulse' : ''}`}>
					<ShipInsignia size={48} className="text-[var(--accent-gold-bright)]" />
				</div>

				<div className="auth-log">
					{lines.slice(0, visibleLines).map((line) => (
						<div key={line} className="auth-log-line">
							<span className="auth-log-prefix">&gt;</span>
							{line}
						</div>
					))}
				</div>
			</div>

			{phaseStep >= 1 && !fadingOut ? <div className="auth-scanline" aria-hidden="true" /> : null}
		</div>
	);
}
