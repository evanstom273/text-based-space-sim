import { useEffect, useRef, type CSSProperties, type PointerEvent } from 'react';
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
	const dragStateRef = useRef<{
		startX: number;
		startY: number;
		originX: number;
		originY: number;
	} | null>(null);
	const resizeStateRef = useRef<{
		dir: ResizeDirection;
		startX: number;
		startY: number;
		originRect: { x: number; y: number; width: number; height: number };
	} | null>(null);

	const appDef = getAppById(win.appId);
	const AppComponent = appDef?.component;

	const isSnapped = win.state === 'snapped-left' || win.state === 'snapped-right';
	const isMaximised = win.state === 'maximised';
	const canManipulate = !isMobile && !isMaximised && !isSnapped;

	if (win.state === 'minimised') {
		return null;
	}

	const handleTitlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
		if (isMobile || isMaximised || isSnapped) return;
		event.preventDefault();
		focusWindow(win.id);

		const frame = frameRef.current;
		if (!frame) return;

		frame.setPointerCapture(event.pointerId);
		dragStateRef.current = {
			startX: event.clientX,
			startY: event.clientY,
			originX: win.rect.x,
			originY: win.rect.y,
		};
		setWindowDragging(true, 'none');
	};

	const handleTitlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
		const drag = dragStateRef.current;
		const frame = frameRef.current;
		if (!drag || !frame) return;

		const dx = event.clientX - drag.startX;
		const dy = event.clientY - drag.startY;
		const nextX = drag.originX + dx;
		const nextY = drag.originY + dy;

		frame.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;

		const snap = detectSnapTarget(event.clientX, event.clientY);
		setWindowDragging(true, snap);
	};

	const handleTitlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
		const drag = dragStateRef.current;
		const frame = frameRef.current;
		if (!drag || !frame) return;

		frame.releasePointerCapture(event.pointerId);

		const dx = event.clientX - drag.startX;
		const dy = event.clientY - drag.startY;
		const nextX = Math.max(0, drag.originX + dx);
		const nextY = Math.max(0, drag.originY + dy);

		const snap = detectSnapTarget(event.clientX, event.clientY);
		dragStateRef.current = null;
		setWindowDragging(false, 'none');

		if (snap !== 'none') {
			frame.style.transform = '';
			applySnap(win.id, snap);
			return;
		}

		frame.style.transform = '';
		updateWindowRect(win.id, { x: nextX, y: nextY });
	};

	const handleResizePointerDown = (
		event: PointerEvent<HTMLDivElement>,
		dir: ResizeDirection,
	) => {
		if (!canManipulate) return;
		event.preventDefault();
		event.stopPropagation();
		focusWindow(win.id);

		const frame = frameRef.current;
		if (!frame) return;

		frame.setPointerCapture(event.pointerId);
		resizeStateRef.current = {
			dir,
			startX: event.clientX,
			startY: event.clientY,
			originRect: { ...win.rect },
		};
	};

	const handleResizePointerMove = (event: PointerEvent<HTMLDivElement>) => {
		const resize = resizeStateRef.current;
		const frame = frameRef.current;
		if (!resize || !frame) return;

		const dx = event.clientX - resize.startX;
		const dy = event.clientY - resize.startY;
		const { dir, originRect } = resize;

		let { x, y, width, height } = originRect;

		if (dir.includes('e')) width = Math.max(win.minWidth, originRect.width + dx);
		if (dir.includes('w')) {
			width = Math.max(win.minWidth, originRect.width - dx);
			x = originRect.x + (originRect.width - width);
		}
		if (dir.includes('s')) height = Math.max(win.minHeight, originRect.height + dy);
		if (dir.includes('n')) {
			height = Math.max(win.minHeight, originRect.height - dy);
			y = originRect.y + (originRect.height - height);
		}

		frame.style.transform = `translate3d(${x}px, ${y}px, 0)`;
		frame.style.width = `${width}px`;
		frame.style.height = `${height}px`;
	};

	const handleResizePointerUp = (event: PointerEvent<HTMLDivElement>) => {
		const resize = resizeStateRef.current;
		const frame = frameRef.current;
		if (!resize || !frame) return;

		frame.releasePointerCapture(event.pointerId);

		const dx = event.clientX - resize.startX;
		const dy = event.clientY - resize.startY;
		const { dir, originRect } = resize;

		let { x, y, width, height } = originRect;

		if (dir.includes('e')) width = Math.max(win.minWidth, originRect.width + dx);
		if (dir.includes('w')) {
			width = Math.max(win.minWidth, originRect.width - dx);
			x = originRect.x + (originRect.width - width);
		}
		if (dir.includes('s')) height = Math.max(win.minHeight, originRect.height + dy);
		if (dir.includes('n')) {
			height = Math.max(win.minHeight, originRect.height - dy);
			y = originRect.y + (originRect.height - height);
		}

		resizeStateRef.current = null;
		frame.style.transform = '';
		frame.style.width = '';
		frame.style.height = '';
		updateWindowRect(win.id, { x, y, width, height });
	};

	const handleMaximizeClick = () => {
		if (isMaximised || isSnapped) {
			restoreWindow(win.id);
		} else {
			maximizeWindow(win.id);
		}
	};

	useEffect(() => {
		const frame = frameRef.current;
		if (!frame || win.state === 'normal') return;
		frame.style.transform = '';
		frame.style.width = '';
		frame.style.height = '';
	}, [win.state, win.rect]);

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
				onPointerMove={handleResizePointerMove}
				onPointerUp={handleResizePointerUp}
			/>
		);
	};

	return (
		<div
			ref={frameRef}
			className={`flex flex-col overflow-hidden border bg-[#ececf0] terminal-bevel ${
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
				onPointerMove={handleTitlePointerMove}
				onPointerUp={handleTitlePointerUp}
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
			<div className="min-h-0 flex-1 overflow-hidden bg-[#ececf0]">
				{AppComponent && <AppComponent windowId={win.id} appId={win.appId} />}
			</div>
			{renderResizeHandle('n', 'top-0 left-2 right-2 h-1 cursor-n-resize')}
			{renderResizeHandle('s', 'bottom-0 left-2 right-2 h-1 cursor-s-resize')}
			{renderResizeHandle('e', 'top-2 bottom-2 right-0 w-1 cursor-e-resize')}
			{renderResizeHandle('w', 'top-2 bottom-2 left-0 w-1 cursor-w-resize')}
			{renderResizeHandle('ne', 'top-0 right-0 h-3 w-3 cursor-ne-resize')}
			{renderResizeHandle('nw', 'top-0 left-0 h-3 w-3 cursor-nw-resize')}
			{renderResizeHandle('se', 'bottom-0 right-0 h-3 w-3 cursor-se-resize')}
			{renderResizeHandle('sw', 'bottom-0 left-0 h-3 w-3 cursor-sw-resize')}
		</div>
	);
}
