import type { DialogueEffect, DialogueIntentId, DialogueTone } from './types';

export interface PersistentDialogueRecord {
	lastInteractionDay: number;
	lastInteractionMinutes: number;
	totalInteractions: number;
	lastPraiseDay?: number;
	lastCriticiseDay?: number;
	flags: Record<string, boolean>;
}

export interface DialogueSessionTracker {
	personnelId: string;
	exchangeCount: number;
	usedIntentIds: DialogueIntentId[];
	activeFollowUps: DialogueIntentId[];
	lastTone?: DialogueTone;
	lastAppliedEffects: DialogueEffect[];
}

export function createInitialSessionTracker(personnelId: string): DialogueSessionTracker {
	return {
		personnelId,
		exchangeCount: 0,
		usedIntentIds: [],
		activeFollowUps: [],
		lastAppliedEffects: [],
	};
}