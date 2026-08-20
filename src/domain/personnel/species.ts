import type { CoreAttributeId } from './attributes';
import type { ModifierDelta } from './constants';
import type { ProfessionalSkillId } from './skills';

export const SPECIES_IDS = ['human', 'moclan', 'xelayan', 'kaylon'] as const;

export type SpeciesId = (typeof SPECIES_IDS)[number];

/**
 * Species modifiers represent biology / species-level characteristics only.
 * Individual personality belongs to the Trait system — do not stereotype
 * from individual Orville characters onto an entire species.
 */
export interface SpeciesAttributeModifierSpec {
	attributeId: CoreAttributeId;
	delta: ModifierDelta;
}

export interface SpeciesSkillModifierSpec {
	skillId: ProfessionalSkillId;
	delta: ModifierDelta;
}

export interface SpeciesDefinition {
	id: SpeciesId;
	name: string;
	description: string;
	/** Biological / species-level notes (not personality). */
	biologyNotes: string;
	gameplayTags: readonly string[];
	/**
	 * Whether this species may appear in normal procedural Planetary Union
	 * crew generation. Existence in the universe ≠ Union crew eligibility.
	 */
	eligibleForUnionCrew: boolean;
	/**
	 * Relative weight for future Union crew generation.
	 * Architecture only — values are placeholders, not final balance.
	 */
	unionCrewGenerationWeight: number;
	/**
	 * Species attribute/skill modifiers.
	 * Intentionally empty until species modifier design is completed.
	 */
	attributeModifiers: readonly SpeciesAttributeModifierSpec[];
	skillModifiers: readonly SpeciesSkillModifierSpec[];
}

export const SPECIES: Record<SpeciesId, SpeciesDefinition> = {
	human: {
		id: 'human',
		name: 'Human',
		description: 'Humans of Earth; a foundational Planetary Union member species.',
		biologyNotes: 'Baseline human physiology. No species-wide exceptional biology defined yet.',
		gameplayTags: ['organic', 'union_member'],
		eligibleForUnionCrew: true,
		unionCrewGenerationWeight: 100,
		attributeModifiers: [],
		skillModifiers: [],
	},
	moclan: {
		id: 'moclan',
		name: 'Moclan',
		description: 'Moclans of Moclus; Planetary Union member species.',
		biologyNotes:
			'Species-level biological characteristics reserved for future modifier design. Do not encode personality stereotypes.',
		gameplayTags: ['organic', 'union_member'],
		eligibleForUnionCrew: true,
		unionCrewGenerationWeight: 40,
		attributeModifiers: [],
		skillModifiers: [],
	},
	xelayan: {
		id: 'xelayan',
		name: 'Xelayan',
		description: 'Xelayans; Planetary Union member species noted for exceptional physical capability in canon biology.',
		biologyNotes:
			'Species-level physical characteristics reserved for future modifier design. Personality remains trait-driven.',
		gameplayTags: ['organic', 'union_member'],
		eligibleForUnionCrew: true,
		unionCrewGenerationWeight: 25,
		attributeModifiers: [],
		skillModifiers: [],
	},
	kaylon: {
		id: 'kaylon',
		name: 'Kaylon',
		description: 'Kaylon artificial lifeforms. Present in The Orville universe.',
		biologyNotes:
			'Artificial / synthetic lifeform. Species-level capability modifiers reserved for future design.',
		gameplayTags: ['synthetic', 'artificial'],
		eligibleForUnionCrew: false,
		unionCrewGenerationWeight: 0,
		attributeModifiers: [],
		skillModifiers: [],
	},
};

export const SPECIES_LIST: SpeciesDefinition[] = SPECIES_IDS.map((id) => SPECIES[id]);

export function getSpecies(id: SpeciesId): SpeciesDefinition {
	return SPECIES[id];
}

export function isSpeciesId(value: string): value is SpeciesId {
	return (SPECIES_IDS as readonly string[]).includes(value);
}

export function getUnionCrewEligibleSpecies(): SpeciesDefinition[] {
	return SPECIES_LIST.filter((species) => species.eligibleForUnionCrew);
}
