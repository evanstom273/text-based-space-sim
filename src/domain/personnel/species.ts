import type { CoreAttributeId } from './attributes';
import type { ModifierDelta } from './constants';
import type { ProfessionalSkillId } from './skills';

/**
 * Initial Orville-canon species catalogue.
 * Not exhaustive — architecture supports adding more later.
 */
export const SPECIES_IDS = [
	'human',
	'moclan',
	'xelayan',
	'kaylon',
	'gelatin',
	'retepsian',
	'bruidian',
	'janisi',
	'sargun',
	'navarian',
	'calivon',
] as const;

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
		description:
			'Xelayans; Planetary Union member species noted for exceptional physical capability in canon biology.',
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
	gelatin: {
		id: 'gelatin',
		name: 'Gelatin',
		description: 'Gelatinous Union personnel capable of amoeboid locomotion and morphology shifts.',
		biologyNotes:
			'Amorphous organic physiology. Species capability modifiers reserved for future design.',
		gameplayTags: ['organic', 'union_member', 'amorphous'],
		eligibleForUnionCrew: true,
		unionCrewGenerationWeight: 18,
		attributeModifiers: [],
		skillModifiers: [],
	},
	retepsian: {
		id: 'retepsian',
		name: 'Retepsian',
		description: 'Retepsians; hermaphroditic humanoid species encountered by the Planetary Union.',
		biologyNotes:
			'Hermaphroditic biology. Species-level modifiers reserved for future design.',
		gameplayTags: ['organic', 'union_member'],
		eligibleForUnionCrew: true,
		unionCrewGenerationWeight: 16,
		attributeModifiers: [],
		skillModifiers: [],
	},
	bruidian: {
		id: 'bruidian',
		name: 'Bruidian',
		description: 'Bruidians; Planetary Union–associated species from Orville canon.',
		biologyNotes: 'Species biology details reserved for future modifier design.',
		gameplayTags: ['organic', 'union_member'],
		eligibleForUnionCrew: true,
		unionCrewGenerationWeight: 14,
		attributeModifiers: [],
		skillModifiers: [],
	},
	janisi: {
		id: 'janisi',
		name: 'Janisi',
		description: 'Janisi; Orville-canon species known for formal diplomatic culture.',
		biologyNotes: 'Species biology details reserved for future modifier design.',
		gameplayTags: ['organic', 'union_member'],
		eligibleForUnionCrew: true,
		unionCrewGenerationWeight: 14,
		attributeModifiers: [],
		skillModifiers: [],
	},
	sargun: {
		id: 'sargun',
		name: 'Sargun',
		description:
			'Sargun; Orville-canon species (e.g. Lysella) eligible for Union-adjacent crew variety.',
		biologyNotes: 'Species biology details reserved for future modifier design.',
		gameplayTags: ['organic', 'union_member'],
		eligibleForUnionCrew: true,
		unionCrewGenerationWeight: 12,
		attributeModifiers: [],
		skillModifiers: [],
	},
	navarian: {
		id: 'navarian',
		name: 'Navarian',
		description:
			'Navarians of Lopovius; Planetary Union neighbors and allies from Orville canon.',
		biologyNotes: 'Species biology details reserved for future modifier design.',
		gameplayTags: ['organic', 'union_ally'],
		eligibleForUnionCrew: true,
		unionCrewGenerationWeight: 12,
		attributeModifiers: [],
		skillModifiers: [],
	},
	calivon: {
		id: 'calivon',
		name: 'Calivon',
		description:
			'Calivons; highly advanced Orville-canon species, rarely serving in Union crews.',
		biologyNotes: 'Species biology details reserved for future modifier design.',
		gameplayTags: ['organic'],
		eligibleForUnionCrew: true,
		unionCrewGenerationWeight: 8,
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
