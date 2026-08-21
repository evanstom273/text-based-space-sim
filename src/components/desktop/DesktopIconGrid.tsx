import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { APP_LIST } from '../../config/apps.config';
import { useWindowManager } from '../../context/WindowManagerContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import type { DesktopIconItem } from '../../types';
import { TASKBAR_HEIGHT } from '../../types';
import { AppIconRenderer } from '../common/AppIconRenderer';

const CELL_WIDTH = 92;
const CELL_HEIGHT = 98;
const GRID_PADDING = 28;
const DRAG_THRESHOLD = 6;

function buildInitialIcons(): DesktopIconItem[] {
	return APP_LIST.map((app) => ({
		id: `icon-${app.id}`,
		appId: app.id,
		title: app.shortName ?? app.name,
		badgeCode: app.badgeCode,
		icon: app.icon,
		gridCol: app.defaultGridPos.col,
		gridRow: app.defaultGridPos.row,
	}));
}

function findNearestFreeCell(
	icons: DesktopIconItem[],
	targetCol: number,
	targetRow: number,
): { col: number; row: number } {
	const occupied = new Set(icons.map((icon) => `${icon.gridCol},${icon.gridRow}`));
	let col = Math.max(0, targetCol);
	let row = Math.max(0, targetRow);

	for (let attempt = 0; attempt < 144; attempt++) {
		if (!occupied.has(`${col},${row}`)) {
			return { col, row };
		}
		col++;
		if (col >= 12) {
			col = 0;
			row++;
		}
	}

	return { col: targetCol, row: targetRow };
}

export function DesktopIconGrid() {
	const { openWindow } = useWindowManager();
	const isMobile = useIsMobile();
	const [icons, setIcons] = useState<DesktopIconItem[]>(buildInitialIcons);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [draggingId, setDraggingId] = useState<string | null>(null);
	const dragStartRef = useRef<{ x: number; y: number; col: number; row: number; iconId: string } | null>(
		null,
	);
	const pointerCleanupRef = useRef<(() => void) | null>(null);
	const gridRef = useRef<HTMLDivElement>(null);

	const clearPointerListeners = useCallback(() => {
		pointerCleanupRef.current?.();
		pointerCleanupRef.current = null;
	}, []);

	const handleOpen = useCallback(
		(appId: string) => {
			openWindow(appId);
		},
		[openWindow],
	);

	const handleIconPointerDown = (icon: DesktopIconItem, event: ReactPointerEvent<HTMLButtonElement>) => {
		if (isMobile || event.button !== 0) return;

		event.stopPropagation();
		setSelectedId(icon.id);
		clearPointerListeners();

		const pointerId = event.pointerId;
		dragStartRef.current = {
			x: event.clientX,
			y: event.clientY,
			col: icon.gridCol,
			row: icon.gridRow,
			iconId: icon.id,
		};

		const handlePointerMove = (moveEvent: PointerEvent) => {
			const start = dragStartRef.current;
			if (!start || moveEvent.pointerId !== pointerId) return;

			const dx = moveEvent.clientX - start.x;
			const dy = moveEvent.clientY - start.y;
			if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

			setDraggingId(start.iconId);
		};

		const handlePointerUp = (upEvent: PointerEvent) => {
			const start = dragStartRef.current;
			clearPointerListeners();

			if (!start || upEvent.pointerId !== pointerId) {
				dragStartRef.current = null;
				setDraggingId(null);
				return;
			}

			const dx = upEvent.clientX - start.x;
			const dy = upEvent.clientY - start.y;

			if (Math.hypot(dx, dy) >= DRAG_THRESHOLD) {
				const col = Math.round((upEvent.clientX - GRID_PADDING) / CELL_WIDTH);
				const row = Math.round((upEvent.clientY - GRID_PADDING) / CELL_HEIGHT);
				setIcons((prev) => {
					const others = prev.filter((item) => item.id !== start.iconId);
					const free = findNearestFreeCell(others, col, row);
					return prev.map((item) =>
						item.id === start.iconId
							? { ...item, gridCol: free.col, gridRow: free.row }
							: item,
					);
				});
			}

			dragStartRef.current = null;
			setDraggingId(null);
		};

		window.addEventListener('pointermove', handlePointerMove);
		window.addEventListener('pointerup', handlePointerUp);
		window.addEventListener('pointercancel', handlePointerUp);

		pointerCleanupRef.current = () => {
			window.removeEventListener('pointermove', handlePointerMove);
			window.removeEventListener('pointerup', handlePointerUp);
			window.removeEventListener('pointercancel', handlePointerUp);
		};
	};

	const renderIconContent = (icon: DesktopIconItem, isSelected: boolean) => (
		<>
			<div
				className={`icon-module-frame icon-module-frame--hover terminal-bevel-sm ${
					isSelected ? 'icon-module-frame--selected' : ''
				}`}
			>
				<AppIconRenderer icon={icon.icon} size={24} />
			</div>
			<span
				className={`max-w-full truncate text-center text-[10px] font-semibold uppercase tracking-[0.14em] icon-module-label ${
					isSelected ? 'icon-module-label--selected' : ''
				}`}
			>
				{icon.title}
			</span>
			<span className="icon-module-code font-mono text-[8px] uppercase tracking-[0.14em]">
				{icon.badgeCode}
			</span>
		</>
	);

	return (
		<div
			ref={gridRef}
			className={`absolute inset-x-0 top-0 z-10 overflow-auto no-scrollbar ${isMobile ? 'bottom-16 px-3 pt-3' : 'bottom-16 px-4 pt-4'}`}
			style={{ paddingBottom: TASKBAR_HEIGHT }}
			onPointerDown={() => setSelectedId(null)}
		>
			<div className={isMobile ? 'grid grid-cols-3 gap-4' : 'relative min-h-full max-w-[300px]'}>
				{icons.map((icon) => {
					const isSelected = selectedId === icon.id;
					const isDragging = draggingId === icon.id;

					if (isMobile) {
						return (
							<button
								key={icon.id}
								type="button"
								className="group flex flex-col items-center gap-1.5 p-2 text-center transition-transform active:scale-95"
								onClick={() => handleOpen(icon.appId)}
							>
								{renderIconContent(icon, false)}
							</button>
						);
					}

					return (
						<button
							key={icon.id}
							type="button"
							className={`group absolute flex w-[80px] flex-col items-center gap-1 p-1 transition-opacity ${
								isDragging ? 'z-50 opacity-75' : ''
							}`}
							style={{
								left: GRID_PADDING + icon.gridCol * CELL_WIDTH,
								top: GRID_PADDING + icon.gridRow * CELL_HEIGHT,
							}}
							onPointerDown={(event) => handleIconPointerDown(icon, event)}
							onDoubleClick={(event) => {
								event.stopPropagation();
								handleOpen(icon.appId);
							}}
							onClick={(event) => {
								event.stopPropagation();
								setSelectedId(icon.id);
							}}
						>
							{renderIconContent(icon, isSelected)}
						</button>
					);
				})}
			</div>
		</div>
	);
}
