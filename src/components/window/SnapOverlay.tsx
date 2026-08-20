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

	if (snapTarget === 'left') {
		return (
			<div
				className="pointer-events-none fixed left-1 z-[999] w-[calc(50vw-6px)] rounded-lg border-2 border-[#3d8fd4]/50 bg-[#3d8fd4]/10 backdrop-blur-[1px] animate-fadeIn"
				style={baseStyle}
			/>
		);
	}

	if (snapTarget === 'right') {
		return (
			<div
				className="pointer-events-none fixed right-1 z-[999] w-[calc(50vw-6px)] rounded-lg border-2 border-[#3d8fd4]/50 bg-[#3d8fd4]/10 backdrop-blur-[1px] animate-fadeIn"
				style={baseStyle}
			/>
		);
	}

	return (
		<div
			className="pointer-events-none fixed left-1 right-1 z-[999] rounded-lg border-2 border-[#3d8fd4]/50 bg-[#3d8fd4]/10 backdrop-blur-[1px] animate-fadeIn"
			style={baseStyle}
		/>
	);
}
