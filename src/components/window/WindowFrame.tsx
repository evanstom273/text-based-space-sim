import { useEffect, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { Minus, Square, X, Copy } from 'lucide-react';
import { getAppById } from '../../config/apps.config';
import {
	detectSnapTarget,
	useWindowManager,
} from '../../context/WindowManagerContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import type { WindowInstance } from '../../types';
import { STATUS_BAR_HEIGHT, TASKBAR_HEIGHT } from '../../types';
import { AppIconRenderer } from '../common/AppIconRenderer';

interface WindowFrameProps {
	window: WindowInstance;
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

type DragState = {
	startX: number;
	startY: number;
	originX: number;
	originY: number;
	pointerId: number;
};

type ResizeState = {
	dir: ResizeDirection;
	startX: number;
	startY: number;
	originRect: { x: number; y: number; width: number; height: number };
	pointerId: number;
};

export function WindowFrame({ window: win }: WindowFrameProps) {
	const {
		focusWindow,
		closeWindow,
		minimizeWindow,
		maximizeWindow,
		restoreWindow,
		updateWindowRect,
		setWindowDragging,
		applySnap,
	} = useWindowManager();
	const isMobile = useIsMobile();
	const frameRef = useRef<HTMLDivElement>(null);
	const dragStateRef = useRef<DragState | null>(null);
	const resizeStateRef = useRef<ResizeState | null>(null);
	const pointerCleanupRef = useRef<(() => void) | null>(null);

	const appDef = getAppById(win.appId);
	const AppComponent = appDef?.component;

	const isSnapped = win.state === 'snapped-left' || win.state === 'snapped-right';
	const isMaximised = win.state === 'maximised';
	const canManipulate = !isMobile && !isMaximised && !isSnapped;

	const clearPointerListeners = () => {
		pointerCleanupRef.current?.();
		pointerCleanupRef.current = null;
	};

	useEffect(() => {
		return () => {
			clearPointerListeners();
			setWindowDragging(false, 'none');
		};
	}, [setWindowDragging]);

	useEffect(() => {
		const frame = frameRef.current;
		if (!frame || win.state === 'normal') return;
		frame.style.transform = '';
		frame.style.width = '';
		frame.style.height = '';
	}, [win.state, win.rect]);

	const bindPointerSession = (
		pointerId: number,
		onMove: (event: PointerEvent) => void,
		onEnd: (event: PointerEvent) => void,
	) => {
		clearPointerListeners();

		const handleMove = (event: PointerEvent) => {
			if (event.pointerId !== pointerId) return;
			onMove(event);
		};

		const handleEnd = (event: PointerEvent) => {
			if (event.pointerId !== pointerId) return;
			clearPointerListeners();
			onEnd(event);
		};

		window.addEventListener('pointermove', handleMove);
		window.addEventListener('pointerup', handleEnd);
		window.addEventListener('pointercancel', handleEnd);

		pointerCleanupRef.current = () => {
			window.removeEventListener('pointermove', handleMove);
			window.removeEventListener('pointerup', handleEnd);
			window.removeEventListener('pointercancel', handleEnd);
		};
	};

	const handleTitlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
		if (isMobile || isMaximised || isSnapped) return;
		if (event.button !== 0) return;
		if ((event.target as HTMLElement).closest('button')) return;

		event.preventDefault();
		event.stopPropagation();
		focusWindow(win.id);

		const frame = frameRef.current;
		if (!frame) return;

		const pointerId = event.pointerId;
		dragStateRef.current = {
			startX: event.clientX,
			startY: event.clientY,
			originX: win.rect.x,
			originY: win.rect.y,
			pointerId,
		};
		setWindowDragging(true, 'none');

		bindPointerSession(
			pointerId,
			(moveEvent) => {
				const drag = dragStateRef.current;
				if (!drag || !frameRef.current) return;

				const dx = moveEvent.clientX - drag.startX;
				const dy = moveEvent.clientY - drag.startY;
				const nextX = drag.originX + dx;
				const nextY = drag.originY + dy;

				frameRef.current.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;
				setWindowDragging(true, detectSnapTarget(moveEvent.clientX, moveEvent.clientY));
			},
			(upEvent) => {
				const drag = dragStateRef.current;
				const frame = frameRef.current;
				if (!drag || !frame) return;

				const dx = upEvent.clientX - drag.startX;
				const dy = upEvent.clientY - drag.startY;
				const nextX = Math.max(0, drag.originX + dx);
				const nextY = Math.max(0, drag.originY + dy);
				const snap = detectSnapTarget(upEvent.clientX, upEvent.clientY);

				dragStateRef.current = null;
				setWindowDragging(false, 'none');

				if (snap !== 'none') {
					frame.style.transform = '';
					applySnap(win.id, snap);
					return;
				}

				frame.style.transform = '';
				updateWindowRect(win.id, { x: nextX, y: nextY });
			},
		);
	};

	const handleResizePointerDown = (
		event: ReactPointerEvent<HTMLDivElement>,
		dir: ResizeDirection,
	) => {
		if (!canManipulate) return;
		if (event.button !== 0) return;

		event.preventDefault();
		event.stopPropagation();
		focusWindow(win.id);

		const frame = frameRef.current;
		if (!frame) return;

		const pointerId = event.pointerId;
		resizeStateRef.current = {
			dir,
			startX: event.clientX,
			startY: event.clientY,
			originRect: { ...win.rect },
			pointerId,
		};

		bindPointerSession(
			pointerId,
			(moveEvent) => {
				const resize = resizeStateRef.current;
				const liveFrame = frameRef.current;
				if (!resize || !liveFrame) return;

				const dx = moveEvent.clientX - resize.startX;
				const dy = moveEvent.clientY - resize.startY;
				const { dir: direction, originRect } = resize;

				let { x, y, width, height } = originRect;

				if (direction.includes('e')) width = Math.max(win.minWidth, originRect.width + dx);
				if (direction.includes('w')) {
					width = Math.max(win.minWidth, originRect.width - dx);
					x = originRect.x + (originRect.width - width);
				}
				if (direction.includes('s')) height = Math.max(win.minHeight, originRect.height + dy);
				if (direction.includes('n')) {
					height = Math.max(win.minHeight, originRect.height - dy);
					y = originRect.y + (originRect.height - height);
				}

				liveFrame.style.transform = `translate3d(${x}px, ${y}px, 0)`;
				liveFrame.style.width = `${width}px`;
				liveFrame.style.height = `${height}px`;
			},
			(upEvent) => {
				const resize = resizeStateRef.current;
				const liveFrame = frameRef.current;
				if (!resize || !liveFrame) return;

				const dx = upEvent.clientX - resize.startX;
				const dy = upEvent.clientY - resize.startY;
				const { dir: direction, originRect } = resize;

				let { x, y, width, height } = originRect;

				if (direction.includes('e')) width = Math.max(win.minWidth, originRect.width + dx);
				if (direction.includes('w')) {
					width = Math.max(win.minWidth, originRect.width - dx);
					x = originRect.x + (originRect.width - width);
				}
				if (direction.includes('s')) height = Math.max(win.minHeight, originRect.height + dy);
				if (direction.includes('n')) {
					height = Math.max(win.minHeight, originRect.height - dy);
					y = originRect.y + (originRect.height - height);
				}

				resizeStateRef.current = null;
				liveFrame.style.transform = '';
				liveFrame.style.width = '';
				liveFrame.style.height = '';
				updateWindowRect(win.id, { x, y, width, height });
			},
		);
	};

	const handleMaximizeClick = () => {
		if (isMaximised || isSnapped) {
			restoreWindow(win.id);
		} else {
			maximizeWindow(win.id);
		}
	};

	const getFrameStyle = (): CSSProperties => {
		if (isMobile || isMaximised) {
			return {
				position: 'fixed',
				top: STATUS_BAR_HEIGHT,
				left: 0,
				right: 0,
				bottom: TASKBAR_HEIGHT,
				zIndex: win.zIndex,
			};
		}

		if (win.state === 'snapped-left') {
			return {
				position: 'fixed',
				top: STATUS_BAR_HEIGHT,
				left: 4,
				bottom: TASKBAR_HEIGHT,
				width: 'calc(50vw - 6px)',
				zIndex: win.zIndex,
			};
		}

		if (win.state === 'snapped-right') {
			return {
				position: 'fixed',
				top: STATUS_BAR_HEIGHT,
				right: 4,
				bottom: TASKBAR_HEIGHT,
				width: 'calc(50vw - 6px)',
				zIndex: win.zIndex,
			};
		}

		return {
			position: 'absolute',
			left: 0,
			top: 0,
			width: win.rect.width,
			height: win.rect.height,
			transform: `translate3d(${win.rect.x}px, ${win.rect.y}px, 0)`,
			zIndex: win.zIndex,
		};
	};

	const renderResizeHandle = (dir: ResizeDirection, className: string) => {
		if (!canManipulate) return null;
		return (
			<div
				className={`absolute ${className}`}
				onPointerDown={(event) => handleResizePointerDown(event, dir)}
			/>
		);
	};

	if (win.state === 'minimised') {
		return null;
	}

	return (
		<div
			ref={frameRef}
			className={`module-workspace flex flex-col overflow-hidden border terminal-bevel ${
				win.isFocused
					? 'window-shadow-focused border-[rgba(176,120,240,0.85)]'
					: 'window-shadow border-[var(--border-silver-bright)]'
			} ${isMobile ? 'rounded-none border-x-0' : ''}`}
			style={getFrameStyle()}
			onPointerDown={() => focusWindow(win.id)}
		>
			<div
				className={`flex h-9 shrink-0 items-center justify-between border-b px-2 ${
					win.isFocused
						? 'border-[rgba(176,120,240,0.45)] bg-gradient-to-r from-[#2e2e2e] via-[#262626] to-[#1c1c1c] shadow-[inset_0_0_20px_rgba(131,68,201,0.12)]'
						: 'border-[var(--border-silver)] bg-gradient-to-r from-[#242424] to-[#181818]'
				} ${canManipulate ? 'cursor-grab active:cursor-grabbing' : ''}`}
				onPointerDown={handleTitlePointerDown}
			>
				<div className="flex min-w-0 items-center gap-2">
					<div
						className={`flex h-6 w-6 shrink-0 items-center justify-center terminal-bevel-sm border ${
							win.isFocused
								? 'border-[var(--accent-purple)]/50 text-[var(--accent-purple-bright)]'
								: 'border-[var(--border-silver)] text-[var(--text-silver-dim)]'
						}`}
					>
						<AppIconRenderer icon={win.icon} size={14} />
					</div>
					<span
						className={`truncate text-[10px] font-semibold uppercase tracking-[0.14em] ${
							win.isFocused ? 'text-white' : 'text-[var(--text-silver)]'
						}`}
					>
						{win.title}
					</span>
					{win.isFocused && (
						<span className="hidden h-1 w-1 shrink-0 rounded-full bg-[var(--accent-gold)] sm:inline-block" />
					)}
				</div>
				<div className="flex shrink-0 items-center gap-0.5">
					{!isMobile && (
						<button
							type="button"
							className="flex h-7 w-7 items-center justify-center border border-transparent text-[var(--text-silver-dim)] hover:border-[var(--border-silver)] hover:text-white terminal-bevel-sm"
							onPointerDown={(event) => event.stopPropagation()}
							onClick={(event) => {
								event.stopPropagation();
								minimizeWindow(win.id);
							}}
							aria-label="Minimise"
						>
							<Minus size={13} />
						</button>
					)}
					{!isMobile && (
						<button
							type="button"
							className="flex h-7 w-7 items-center justify-center border border-transparent text-[var(--text-silver-dim)] hover:border-[var(--border-silver)] hover:text-white terminal-bevel-sm"
							onPointerDown={(event) => event.stopPropagation()}
							onClick={(event) => {
								event.stopPropagation();
								handleMaximizeClick();
							}}
							aria-label={isMaximised || isSnapped ? 'Restore' : 'Maximise'}
						>
							{isMaximised || isSnapped ? <Copy size={11} /> : <Square size={11} />}
						</button>
					)}
					<button
						type="button"
						className="flex h-7 w-7 items-center justify-center border border-transparent text-[var(--text-silver-dim)] hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 terminal-bevel-sm"
						onPointerDown={(event) => event.stopPropagation()}
						onClick={(event) => {
							event.stopPropagation();
							closeWindow(win.id);
						}}
						aria-label="Close"
					>
						<X size={13} />
					</button>
				</div>
			</div>
			<div className="module-workspace min-h-0 flex-1 overflow-hidden">
				{AppComponent && <AppComponent windowId={win.id} appId={win.appId} />}
			</div>
			{renderResizeHandle('n', 'top-0 left-1 right-1 h-2 cursor-n-resize')}
			{renderResizeHandle('s', 'bottom-0 left-1 right-1 h-2 cursor-s-resize')}
			{renderResizeHandle('e', 'top-2 bottom-2 right-0 w-2 cursor-e-resize')}
			{renderResizeHandle('w', 'top-2 bottom-2 left-0 w-2 cursor-w-resize')}
			{renderResizeHandle('ne', 'top-0 right-0 h-4 w-4 cursor-ne-resize')}
			{renderResizeHandle('nw', 'top-0 left-0 h-4 w-4 cursor-nw-resize')}
			{renderResizeHandle('se', 'bottom-0 right-0 h-4 w-4 cursor-se-resize')}
			{renderResizeHandle('sw', 'bottom-0 left-0 h-4 w-4 cursor-sw-resize')}
		</div>
	);
}
