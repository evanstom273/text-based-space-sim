import type { CoreAttributeId } from './attributes';
import type { ModifierDelta } from './constants';
import type { ProfessionalSkillId } from './skills';

export type ModifierSourceKind =
	| 'division'
	| 'position'
	| 'species'
	| 'trait'
	| 'temporary'
	| 'other';

export type ModifierTargetKind = 'attribute' | 'skill';

export interface StatModifier {
	id: string;
	sourceKind: ModifierSourceKind;
	/** Optional reference to the defining entity (species id, trait id, etc.). */
	sourceId?: string;
	label: string;
	targetKind: ModifierTargetKind;
	targetId: CoreAttributeId | ProfessionalSkillId;
	delta: ModifierDelta;
	/** Temporary modifiers may expire; omit for permanent sources. */
	expiresAtAbsoluteDay?: number;
	notes?: string;
}

export interface ModifierSet {
	attributeModifiers: StatModifier[];
	skillModifiers: StatModifier[];
}

export function createEmptyModifierSet(): ModifierSet {
	return {
		attributeModifiers: [],
		skillModifiers: [],
	};
}

export function isModifierDelta(value: number): value is ModifierDelta {
	return value === -2 || value === -1 || value === 0 || value === 1 || value === 2;
}

export function clampToModifierDelta(value: number): ModifierDelta {
	if (value <= -2) return -2;
	if (value === -1) return -1;
	if (value === 0) return 0;
	if (value === 1) return 1;
	return 2;
}

export function sumModifierDeltas(modifiers: readonly StatModifier[]): number {
	return modifiers.reduce((total, modifier) => total + modifier.delta, 0);
}

export function filterModifiersForTarget(
	modifiers: readonly StatModifier[],
	targetKind: ModifierTargetKind,
	targetId: string,
): StatModifier[] {
	return modifiers.filter(
		(modifier) => modifier.targetKind === targetKind && modifier.targetId === targetId,
	);
}
