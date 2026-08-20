import type { ModifierDelta } from './constants';
import type { CoreAttributeId } from './attributes';
import type { ProfessionalSkillId } from './skills';

/**
 * Traits describe the individual — not their species.
 * Catalogue intentionally empty; architecture only.
 */
export interface TraitModifierSpec {
	targetKind: 'attribute' | 'skill';
	targetId: CoreAttributeId | ProfessionalSkillId;
	delta: ModifierDelta;
}

export interface TraitDefinition {
	id: string;
	name: string;
	description: string;
	modifiers: readonly TraitModifierSpec[];
	tags: readonly string[];
}

/** Future trait catalogue lives here. Do not populate during foundation work. */
export const TRAIT_CATALOGUE: Record<string, TraitDefinition> = {};

export function getTraitDefinition(traitId: string): TraitDefinition | undefined {
	return TRAIT_CATALOGUE[traitId];
}
