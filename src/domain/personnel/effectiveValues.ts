import type { CoreAttributeId, CoreAttributeScores } from './attributes';
import {
	EFFECTIVE_SOFT_CLAMP_MAX,
	EFFECTIVE_SOFT_CLAMP_MIN,
	STAT_BASE_MAX,
	STAT_BASE_MIN,
} from './constants';
import type { StatModifier } from './modifiers';
import { filterModifiersForTarget, sumModifierDeltas } from './modifiers';
import type { PersonnelRecord } from './personnel';
import type { ProfessionalSkillId, ProfessionalSkillScores } from './skills';
import { getSpecies } from './species';
import { getTraitDefinition } from './traits';

export interface EffectiveStatBreakdown {
	base: number;
	divisionModifiers: number;
	positionModifiers: number;
	speciesModifiers: number;
	traitModifiers: number;
	temporaryModifiers: number;
	otherModifiers: number;
	totalModifier: number;
	effective: number;
	sources: StatModifier[];
}

/**
 * Soft-clamp for UI display. Raw effective totals remain available via breakdown.
 * Base values must stay within 0–10; effective may exceed that range.
 */
export function clampStatForDisplay(value: number): number {
	return Math.min(EFFECTIVE_SOFT_CLAMP_MAX, Math.max(EFFECTIVE_SOFT_CLAMP_MIN, value));
}

/**
 * Soft-clamp for future dice/check systems.
 * Same bounds as display for now; kept separate so check rules can diverge later.
 */
export function clampStatForCheck(value: number): number {
	return clampStatForDisplay(value);
}

export function clampBaseStat(value: number): number {
	return Math.min(STAT_BASE_MAX, Math.max(STAT_BASE_MIN, Math.round(value)));
}

function collectResolvedModifiers(person: PersonnelRecord): StatModifier[] {
	const resolved: StatModifier[] = [...person.modifiers];

	const species = getSpecies(person.speciesId);

	for (const spec of species.attributeModifiers) {
		resolved.push({
			id: `species:${species.id}:attr:${spec.attributeId}`,
			sourceKind: 'species',
			sourceId: species.id,
			label: `${species.name} biology`,
			targetKind: 'attribute',
			targetId: spec.attributeId,
			delta: spec.delta,
		});
	}

	for (const spec of species.skillModifiers) {
		resolved.push({
			id: `species:${species.id}:skill:${spec.skillId}`,
			sourceKind: 'species',
			sourceId: species.id,
			label: `${species.name} biology`,
			targetKind: 'skill',
			targetId: spec.skillId,
			delta: spec.delta,
		});
	}

	for (const traitId of person.traitIds) {
		const trait = getTraitDefinition(traitId);
		if (!trait) continue;

		for (const spec of trait.modifiers) {
			resolved.push({
				id: `trait:${trait.id}:${spec.targetKind}:${spec.targetId}`,
				sourceKind: 'trait',
				sourceId: trait.id,
				label: trait.name,
				targetKind: spec.targetKind,
				targetId: spec.targetId,
				delta: spec.delta,
			});
		}
	}

	return resolved;
}

function sumBySourceKind(sources: readonly StatModifier[], kind: StatModifier['sourceKind']): number {
	return sumModifierDeltas(sources.filter((modifier) => modifier.sourceKind === kind));
}

export function getEffectiveAttributeBreakdown(
	person: PersonnelRecord,
	attributeId: CoreAttributeId,
): EffectiveStatBreakdown {
	const all = collectResolvedModifiers(person);
	const sources = filterModifiersForTarget(all, 'attribute', attributeId);
	const base = clampBaseStat(person.baseAttributes[attributeId]);

	const divisionModifiers = sumBySourceKind(sources, 'division');
	const positionModifiers = sumBySourceKind(sources, 'position');
	const speciesModifiers = sumBySourceKind(sources, 'species');
	const traitModifiers = sumBySourceKind(sources, 'trait');
	const temporaryModifiers = sumBySourceKind(sources, 'temporary');
	const otherModifiers = sumBySourceKind(sources, 'other');
	const totalModifier = sumModifierDeltas(sources);

	return {
		base,
		divisionModifiers,
		positionModifiers,
		speciesModifiers,
		traitModifiers,
		temporaryModifiers,
		otherModifiers,
		totalModifier,
		effective: base + totalModifier,
		sources,
	};
}

export function getEffectiveSkillBreakdown(
	person: PersonnelRecord,
	skillId: ProfessionalSkillId,
): EffectiveStatBreakdown {
	const all = collectResolvedModifiers(person);
	const sources = filterModifiersForTarget(all, 'skill', skillId);
	const base = clampBaseStat(person.baseSkills[skillId]);

	const divisionModifiers = sumBySourceKind(sources, 'division');
	const positionModifiers = sumBySourceKind(sources, 'position');
	const speciesModifiers = sumBySourceKind(sources, 'species');
	const traitModifiers = sumBySourceKind(sources, 'trait');
	const temporaryModifiers = sumBySourceKind(sources, 'temporary');
	const otherModifiers = sumBySourceKind(sources, 'other');
	const totalModifier = sumModifierDeltas(sources);

	return {
		base,
		divisionModifiers,
		positionModifiers,
		speciesModifiers,
		traitModifiers,
		temporaryModifiers,
		otherModifiers,
		totalModifier,
		effective: base + totalModifier,
		sources,
	};
}

export function getEffectiveAttribute(person: PersonnelRecord, attributeId: CoreAttributeId): number {
	return getEffectiveAttributeBreakdown(person, attributeId).effective;
}

export function getEffectiveSkill(person: PersonnelRecord, skillId: ProfessionalSkillId): number {
	return getEffectiveSkillBreakdown(person, skillId).effective;
}

export function getAllEffectiveAttributes(person: PersonnelRecord): CoreAttributeScores {
	return {
		physical: getEffectiveAttribute(person, 'physical'),
		agility: getEffectiveAttribute(person, 'agility'),
		intelligence: getEffectiveAttribute(person, 'intelligence'),
		perception: getEffectiveAttribute(person, 'perception'),
		charisma: getEffectiveAttribute(person, 'charisma'),
		resilience: getEffectiveAttribute(person, 'resilience'),
	};
}

export function getAllEffectiveSkills(person: PersonnelRecord): ProfessionalSkillScores {
	return {
		engineering: getEffectiveSkill(person, 'engineering'),
		medicine: getEffectiveSkill(person, 'medicine'),
		science: getEffectiveSkill(person, 'science'),
		combat: getEffectiveSkill(person, 'combat'),
		piloting: getEffectiveSkill(person, 'piloting'),
		command: getEffectiveSkill(person, 'command'),
		diplomacy: getEffectiveSkill(person, 'diplomacy'),
		tactical: getEffectiveSkill(person, 'tactical'),
	};
}
