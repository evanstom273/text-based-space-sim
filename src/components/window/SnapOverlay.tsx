import { STATUS_BAR_HEIGHT, TASKBAR_HEIGHT, type SnapTarget } from '../../types';

interface SnapOverlayProps {
	snapTarget: SnapTarget;
}

export function SnapOverlay({ snapTarget }: SnapOverlayProps) {
	if (snapTarget === 'none') return null;

	const baseStyle = {
		top: STATUS_BAR_HEIGHT,
		bottom: TASKBAR_HEIGHT,
	};

	const overlayClass =
		'pointer-events-none fixed z-[999] animate-fadeIn border-2 border-[rgba(176,120,240,0.55)] bg-[rgba(131,68,201,0.12)] backdrop-blur-[2px] terminal-bevel shadow-[0_0_24px_rgba(131,68,201,0.2)]';

	if (snapTarget === 'left') {
		return (
			<div
				className={`${overlayClass} left-1 w-[calc(50vw-6px)]`}
				style={baseStyle}
			/>
		);
	}

	if (snapTarget === 'right') {
		return (
			<div
				className={`${overlayClass} right-1 w-[calc(50vw-6px)]`}
				style={baseStyle}
			/>
		);
	}

	return (
		<div
			className={`${overlayClass} left-1 right-1`}
			style={baseStyle}
		/>
	);
}
