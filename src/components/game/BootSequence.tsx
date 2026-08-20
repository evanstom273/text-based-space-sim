import { useCallback, useEffect, useRef, useState } from 'react';
import { ShipInsignia } from '../common/ShipInsignia';
import { useGameSession } from '../../context/GameSessionContext';

const BOOT_LINES = [
	'UNION COMMAND SYSTEM',
	'INITIALISING TERMINAL...',
	'CHRONO SYSTEM ........ ONLINE',
	'NAVIGATION CORE ...... ONLINE',
	'COMMUNICATIONS ....... ONLINE',
	'PERSONNEL DATABASE ... ONLINE',
	'COMMAND NETWORK ...... CONNECTED',
	'SYSTEM READY',
] as const;

const LINE_DELAY_MS = 280;
const FINAL_HOLD_MS = 600;
const FAST_BOOT_MS = 400;
const BOOT_EXIT_MS = 550;

interface BootSequenceProps {
	onComplete: () => void;
}

export function BootSequence({ onComplete }: BootSequenceProps) {
	const { fastBoot, setFastBoot } = useGameSession();
	const [visibleLines, setVisibleLines] = useState(0);
	const [logoVisible, setLogoVisible] = useState(false);
	const [scanActive, setScanActive] = useState(false);
	const [exiting, setExiting] = useState(false);
	const completedRef = useRef(false);

	const finish = useCallback(() => {
		if (completedRef.current) return;
		completedRef.current = true;
		setExiting(true);
		window.setTimeout(onComplete, BOOT_EXIT_MS);
	}, [onComplete]);

	const skipBoot = useCallback(() => {
		if (completedRef.current) return;
		setLogoVisible(true);
		setScanActive(true);
		setVisibleLines(BOOT_LINES.length);
		window.setTimeout(finish, 120);
	}, [finish]);

	useEffect(() => {
		if (fastBoot) {
			window.setTimeout(finish, FAST_BOOT_MS);
			return;
		}

		const logoTimer = window.setTimeout(() => setLogoVisible(true), 120);
		const scanTimer = window.setTimeout(() => setScanActive(true), 280);

		const lineTimers: number[] = [];
		for (let index = 0; index < BOOT_LINES.length; index += 1) {
			lineTimers.push(
				window.setTimeout(() => setVisibleLines(index + 1), 400 + index * LINE_DELAY_MS),
			);
		}

		const completeTimer = window.setTimeout(
			finish,
			400 + BOOT_LINES.length * LINE_DELAY_MS + FINAL_HOLD_MS,
		);

		return () => {
			window.clearTimeout(logoTimer);
			window.clearTimeout(scanTimer);
			lineTimers.forEach((timer) => window.clearTimeout(timer));
			window.clearTimeout(completeTimer);
		};
	}, [fastBoot, finish]);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') {
				event.preventDefault();
				skipBoot();
			}
		};

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [skipBoot]);

	return (
		<div
			className={`game-screen boot-screen ${exiting ? 'boot-screen--exit' : ''}`}
			onClick={skipBoot}
			onKeyDown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') skipBoot();
			}}
			role="button"
			tabIndex={0}
			aria-label="Union terminal boot sequence. Click or press a key to skip."
		>
			<div className="boot-screen-vignette" />

			<div className={`boot-logo-wrap ${logoVisible ? 'boot-logo-wrap--visible' : ''}`}>
				<div className="boot-insignia-frame terminal-bevel-sm">
					<ShipInsignia size={56} className="text-[var(--accent-gold-bright)]" />
				</div>
				<div className="boot-title">UNION COMMAND TERMINAL</div>
				<div className="boot-subtitle">THE ORVILLE UNIVERSE · PLANETARY UNION · VESSEL OPERATIONS</div>
			</div>

			{scanActive ? <div className="boot-scanline" aria-hidden="true" /> : null}

			<div className="boot-log">
				{BOOT_LINES.slice(0, visibleLines).map((line, index) => (
					<div
						key={line}
						className={`boot-log-line ${index === visibleLines - 1 ? 'boot-log-line--active' : ''}`}
					>
						<span className="boot-log-prefix">&gt;</span>
						{line}
					</div>
				))}
			</div>

			<div className="boot-footer">
				<label className="boot-fast-toggle" onClick={(event) => event.stopPropagation()}>
					<input
						type="checkbox"
						checked={fastBoot}
						onChange={(event) => setFastBoot(event.target.checked)}
					/>
					<span>Accelerate boot on future launches</span>
				</label>
				<span className="boot-skip-hint">Click or press any key to skip</span>
			</div>
		</div>
	);
}
