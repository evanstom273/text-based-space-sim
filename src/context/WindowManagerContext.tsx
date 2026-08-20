import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from 'react';
import type { SnapTarget, WindowInstance, WindowRect, WindowState } from '../types';
import { getAppById } from '../config/apps.config';

const MOBILE_BREAKPOINT = 640;
const SNAP_THRESHOLD = 25;

function isMobileViewport(): boolean {
	return typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;
}

function clampRect(rect: WindowRect, minWidth: number, minHeight: number): WindowRect {
	const maxWidth = window.innerWidth;
	const maxHeight = window.innerHeight - 80;
	return {
		x: Math.max(0, Math.min(rect.x, maxWidth - minWidth)),
		y: Math.max(0, Math.min(rect.y, maxHeight - minHeight)),
		width: Math.max(minWidth, Math.min(rect.width, maxWidth)),
		height: Math.max(minHeight, Math.min(rect.height, maxHeight)),
	};
}

interface WindowManagerContextValue {
	windows: WindowInstance[];
	activeWindowId: string | null;
	snapTarget: SnapTarget;
	openWindow: (appId: string) => void;
	closeWindow: (windowId: string) => void;
	minimizeWindow: (windowId: string) => void;
	maximizeWindow: (windowId: string) => void;
	restoreWindow: (windowId: string) => void;
	focusWindow: (windowId: string) => void;
	toggleMinimizeWindow: (windowId: string) => void;
	updateWindowRect: (windowId: string, partial: Partial<WindowRect>) => void;
	setWindowDragging: (isDragging: boolean, target?: SnapTarget) => void;
	applySnap: (windowId: string, target: SnapTarget) => void;
	isAppOpen: (appId: string) => boolean;
	getOpenWindowByAppId: (appId: string) => WindowInstance | undefined;
}

const WindowManagerContext = createContext<WindowManagerContextValue | undefined>(undefined);

export function WindowManagerProvider({ children }: { children: ReactNode }) {
	const [windows, setWindows] = useState<WindowInstance[]>([]);
	const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
	const [snapTarget, setSnapTarget] = useState<SnapTarget>('none');
	const zIndexCounter = useRef(100);

	const getNextZIndex = useCallback(() => {
		zIndexCounter.current += 1;
		return zIndexCounter.current;
	}, []);

	const focusWindow = useCallback(
		(windowId: string) => {
			const nextZ = getNextZIndex();
			setWindows((prev) =>
				prev.map((win) => ({
					...win,
					zIndex: win.id === windowId ? nextZ : win.zIndex,
					isFocused: win.id === windowId,
				})),
			);
			setActiveWindowId(windowId);
		},
		[getNextZIndex],
	);

	const openWindow = useCallback(
		(appId: string) => {
			const appDef = getAppById(appId);
			if (!appDef) return;

			setWindows((prev) => {
				const existing = prev.find((win) => win.appId === appId);
				if (existing) {
					const nextZ = getNextZIndex();
					setActiveWindowId(existing.id);
					return prev.map((win) =>
						win.appId === appId
							? {
									...win,
									state: win.state === 'minimised' ? ('normal' as WindowState) : win.state,
									zIndex: nextZ,
									isFocused: true,
								}
							: { ...win, isFocused: false },
					);
				}

				const offset = (prev.length % 6) * 32;
				const mobile = isMobileViewport();
				const defaultRect = clampRect(
					{
						x: 80 + offset,
						y: 60 + offset,
						width: appDef.defaultSize.width,
						height: appDef.defaultSize.height,
					},
					appDef.minSize.width,
					appDef.minSize.height,
				);

				const nextZ = getNextZIndex();
				const newWindow: WindowInstance = {
					id: `win-${appId}-${Date.now()}`,
					appId,
					title: appDef.name,
					icon: appDef.icon,
					state: mobile ? 'maximised' : 'normal',
					rect: defaultRect,
					zIndex: nextZ,
					minWidth: appDef.minSize.width,
					minHeight: appDef.minSize.height,
					isFocused: true,
				};

				setActiveWindowId(newWindow.id);
				return prev.map((win) => ({ ...win, isFocused: false })).concat(newWindow);
			});
		},
		[getNextZIndex],
	);

	const closeWindow = useCallback((windowId: string) => {
		setWindows((prev) => {
			const remaining = prev.filter((win) => win.id !== windowId);
			if (remaining.length === 0) {
				setActiveWindowId(null);
				return remaining;
			}

			const closedWasActive = prev.find((win) => win.id === windowId)?.isFocused;
			if (closedWasActive) {
				const nextActive = remaining.reduce((best, win) =>
					win.zIndex > best.zIndex ? win : best,
				);
				setActiveWindowId(nextActive.id);
				return remaining.map((win) => ({
					...win,
					isFocused: win.id === nextActive.id,
				}));
			}

			return remaining;
		});
	}, []);

	const minimizeWindow = useCallback((windowId: string) => {
		setWindows((prev) =>
			prev.map((win) =>
				win.id === windowId
					? { ...win, state: 'minimised' as WindowState, isFocused: false }
					: win,
			),
		);
		setActiveWindowId((current) => (current === windowId ? null : current));
	}, []);

	const maximizeWindow = useCallback(
		(windowId: string) => {
			setWindows((prev) =>
				prev.map((win) => {
					if (win.id !== windowId) return win;
					return {
						...win,
						previousRect: win.state === 'normal' ? { ...win.rect } : win.previousRect,
						state: 'maximised' as WindowState,
					};
				}),
			);
			focusWindow(windowId);
		},
		[focusWindow],
	);

	const restoreWindow = useCallback(
		(windowId: string) => {
			setWindows((prev) =>
				prev.map((win) => {
					if (win.id !== windowId) return win;
					if (win.previousRect) {
						return {
							...win,
							state: 'normal' as WindowState,
							rect: { ...win.previousRect },
							previousRect: undefined,
						};
					}
					return { ...win, state: 'normal' as WindowState };
				}),
			);
			focusWindow(windowId);
		},
		[focusWindow],
	);

	const toggleMinimizeWindow = useCallback(
		(windowId: string) => {
			setWindows((prev) => {
				const target = prev.find((win) => win.id === windowId);
				if (!target) return prev;

				if (target.state === 'minimised') {
					const nextZ = getNextZIndex();
					setActiveWindowId(windowId);
					return prev.map((win) =>
						win.id === windowId
							? { ...win, state: 'normal' as WindowState, zIndex: nextZ, isFocused: true }
							: { ...win, isFocused: false },
					);
				}

				if (target.isFocused) {
					setActiveWindowId(null);
					return prev.map((win) =>
						win.id === windowId
							? { ...win, state: 'minimised' as WindowState, isFocused: false }
							: win,
					);
				}

				const nextZ = getNextZIndex();
				setActiveWindowId(windowId);
				return prev.map((win) =>
					win.id === windowId
						? { ...win, zIndex: nextZ, isFocused: true }
						: { ...win, isFocused: false },
				);
			});
		},
		[getNextZIndex],
	);

	const updateWindowRect = useCallback((windowId: string, partial: Partial<WindowRect>) => {
		setWindows((prev) =>
			prev.map((win) => {
				if (win.id !== windowId) return win;
				const nextRect = clampRect({ ...win.rect, ...partial }, win.minWidth, win.minHeight);
				return { ...win, rect: nextRect, state: 'normal' as WindowState };
			}),
		);
	}, []);

	const setWindowDragging = useCallback((isDragging: boolean, target: SnapTarget = 'none') => {
		setSnapTarget(isDragging ? target : 'none');
	}, []);

	const applySnap = useCallback(
		(windowId: string, target: SnapTarget) => {
			if (target === 'none') return;

			if (target === 'top') {
				maximizeWindow(windowId);
				setSnapTarget('none');
				return;
			}

			setWindows((prev) =>
				prev.map((win) => {
					if (win.id !== windowId) return win;
					return {
						...win,
						previousRect: win.state === 'normal' ? { ...win.rect } : win.previousRect,
						state: (target === 'left' ? 'snapped-left' : 'snapped-right') as WindowState,
					};
				}),
			);
			focusWindow(windowId);
			setSnapTarget('none');
		},
		[focusWindow, maximizeWindow],
	);

	const isAppOpen = useCallback(
		(appId: string) => windows.some((win) => win.appId === appId),
		[windows],
	);

	const getOpenWindowByAppId = useCallback(
		(appId: string) => windows.find((win) => win.appId === appId),
		[windows],
	);

	const value = useMemo<WindowManagerContextValue>(
		() => ({
			windows,
			activeWindowId,
			snapTarget,
			openWindow,
			closeWindow,
			minimizeWindow,
			maximizeWindow,
			restoreWindow,
			focusWindow,
			toggleMinimizeWindow,
			updateWindowRect,
			setWindowDragging,
			applySnap,
			isAppOpen,
			getOpenWindowByAppId,
		}),
		[
			windows,
			activeWindowId,
			snapTarget,
			openWindow,
			closeWindow,
			minimizeWindow,
			maximizeWindow,
			restoreWindow,
			focusWindow,
			toggleMinimizeWindow,
			updateWindowRect,
			setWindowDragging,
			applySnap,
			isAppOpen,
			getOpenWindowByAppId,
		],
	);

	return (
		<WindowManagerContext.Provider value={value}>{children}</WindowManagerContext.Provider>
	);
}

export function useWindowManager(): WindowManagerContextValue {
	const ctx = useContext(WindowManagerContext);
	if (!ctx) {
		throw new Error('useWindowManager must be used within WindowManagerProvider');
	}
	return ctx;
}

export function detectSnapTarget(clientX: number, clientY: number): SnapTarget {
	if (clientY <= SNAP_THRESHOLD) return 'top';
	if (clientX <= SNAP_THRESHOLD) return 'left';
	if (clientX >= window.innerWidth - SNAP_THRESHOLD) return 'right';
	return 'none';
}
