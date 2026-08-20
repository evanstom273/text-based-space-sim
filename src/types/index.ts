import type React from 'react';

export type WindowState = 'normal' | 'minimised' | 'maximised' | 'snapped-left' | 'snapped-right';

export interface WindowRect {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface WindowInstance {
	id: string;
	appId: string;
	title: string;
	icon: string;
	state: WindowState;
	rect: WindowRect;
	previousRect?: WindowRect;
	zIndex: number;
	minWidth: number;
	minHeight: number;
	isFocused: boolean;
}

export type AppCategory =
	| 'Operations'
	| 'Records'
	| 'Intelligence'
	| 'Communications'
	| 'Administration'
	| 'Navigation';

export interface AppDefinition {
	id: string;
	name: string;
	shortName?: string;
	subtitle?: string;
	description: string;
	category: AppCategory;
	badgeCode: string;
	icon: string;
	defaultSize: { width: number; height: number };
	minSize: { width: number; height: number };
	defaultGridPos: { row: number; col: number };
	component: React.ComponentType<{ windowId: string; appId: string }>;
}

export type SnapTarget = 'none' | 'left' | 'right' | 'top';

export interface DesktopIconItem {
	id: string;
	appId: string;
	title: string;
	badgeCode: string;
	icon: string;
	gridCol: number;
	gridRow: number;
}

export const STATUS_BAR_HEIGHT = 56;
export const TASKBAR_HEIGHT = 64;
