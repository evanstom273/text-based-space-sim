import { useCallback, useEffect, useRef, useState } from 'react';
import { APP_LIST } from '../../config/apps.config';
import { useWindowManager } from '../../context/WindowManagerContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import type { DesktopIconItem } from '../../types';
import { TASKBAR_HEIGHT } from '../../types';
import { AppIconRenderer } from '../common/AppIconRenderer';

const CELL_WIDTH = 88;
const CELL_HEIGHT = 92;
const GRID_PADDING = 28;
const DRAG_THRESHOLD = 6;
const DOUBLE_TAP_MS = 350;

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
	const dragStartRef = useRef<{ x: number; y: number; col: number; row: number } | null>(null);
	const lastTapRef = useRef<{ id: string; time: number } | null>(null);
	const gridRef = useRef<HTMLDivElement>(null);

	const handleOpen = useCallback(
		(appId: string) => {
			openWindow(appId);
		},
		[openWindow],
	);

	const handleIconPointerDown = (icon: DesktopIconItem, clientX: number, clientY: number) => {
		if (isMobile) return;
		setSelectedId(icon.id);
		dragStartRef.current = { x: clientX, y: clientY, col: icon.gridCol, row: icon.gridRow };
	};

	const handleIconClick = (icon: DesktopIconItem) => {
		if (isMobile) {
			handleOpen(icon.appId);
			return;
		}

		setSelectedId(icon.id);

		const now = Date.now();
		const lastTap = lastTapRef.current;
		if (lastTap && lastTap.id === icon.id && now - lastTap.time < DOUBLE_TAP_MS) {
			handleOpen(icon.appId);
			lastTapRef.current = null;
			return;
		}
		lastTapRef.current = { id: icon.id, time: now };
	};

	useEffect(() => {
		if (isMobile || !dragStartRef.current) return;

		const handlePointerMove = (event: PointerEvent) => {
			const start = dragStartRef.current;
			if (!start) return;

			const dx = event.clientX - start.x;
			const dy = event.clientY - start.y;
			if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

			setDraggingId(selectedId);
		};

		const handlePointerUp = (event: PointerEvent) => {
			const start = dragStartRef.current;
			if (!start || !selectedId) {
				dragStartRef.current = null;
				setDraggingId(null);
				return;
			}

			const dx = event.clientX - start.x;
			const dy = event.clientY - start.y;

			if (Math.hypot(dx, dy) >= DRAG_THRESHOLD) {
				const col = Math.round((event.clientX - GRID_PADDING) / CELL_WIDTH);
				const row = Math.round((event.clientY - GRID_PADDING) / CELL_HEIGHT);
				setIcons((prev) => {
					const others = prev.filter((item) => item.id !== selectedId);
					const free = findNearestFreeCell(others, col, row);
					return prev.map((item) =>
						item.id === selectedId
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
		return () => {
			window.removeEventListener('pointermove', handlePointerMove);
			window.removeEventListener('pointerup', handlePointerUp);
		};
	}, [isMobile, selectedId]);

	return (
		<div
			ref={gridRef}
			className={`absolute inset-x-0 top-0 z-10 overflow-auto no-scrollbar ${isMobile ? 'bottom-14 px-3 pt-3' : 'bottom-14 px-4 pt-5'}`}
			style={{ paddingBottom: TASKBAR_HEIGHT }}
			onClick={() => setSelectedId(null)}
		>
			<div className={isMobile ? 'grid grid-cols-3 gap-3' : 'relative min-h-full max-w-[320px]'}>
				{icons.map((icon) => {
					const isSelected = selectedId === icon.id;
					const isDragging = draggingId === icon.id;

					if (isMobile) {
						return (
							<button
								key={icon.id}
								type="button"
								className="group flex flex-col items-center gap-2 p-2 text-center transition-transform active:scale-95"
								onClick={() => handleOpen(icon.appId)}
							>
								<div className="icon-module-frame icon-module-frame--hover terminal-bevel-sm group-active:border-[var(--accent-purple)]">
									<AppIconRenderer icon={icon.icon} size={22} />
								</div>
								<span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--text-silver)] icon-text-shadow">
									{icon.title}
								</span>
							</button>
						);
					}

					return (
						<button
							key={icon.id}
							type="button"
							className={`group absolute flex w-[76px] flex-col items-center gap-1.5 p-1 transition-opacity ${
								isDragging ? 'z-50 opacity-70' : ''
							}`}
							style={{
								left: GRID_PADDING + icon.gridCol * CELL_WIDTH,
								top: GRID_PADDING + icon.gridRow * CELL_HEIGHT,
							}}
							onClick={(event) => {
								event.stopPropagation();
								handleIconClick(icon);
							}}
							onPointerDown={(event) => {
								event.stopPropagation();
								handleIconPointerDown(icon, event.clientX, event.clientY);
							}}
						>
							<div
								className={`icon-module-frame icon-module-frame--hover terminal-bevel-sm ${
									isSelected ? 'icon-module-frame--selected' : ''
								}`}
							>
								<AppIconRenderer icon={icon.icon} size={22} />
							</div>
							<span className="max-w-full truncate text-center text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-silver)] icon-text-shadow">
								{icon.title}
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
