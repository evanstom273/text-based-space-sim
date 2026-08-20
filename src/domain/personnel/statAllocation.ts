import type { CoreAttributeId, CoreAttributeScores } from './attributes';
import { CORE_ATTRIBUTE_IDS, createEmptyAttributeScores } from './attributes';
import type { ProfessionalSkillId, ProfessionalSkillScores } from './skills';
import { PROFESSIONAL_SKILL_IDS, createEmptySkillScores } from './skills';
import { STAT_BASE_MAX, STAT_BASE_MIN } from './constants';

export const ALLOCATION_STAT_MIN = 3;
export const ALLOCATION_STAT_MAX = STAT_BASE_MAX;
export const ALLOCATION_STAT_DEFAULT = 5;

export const CAPTAIN_ATTRIBUTE_POINT_POOL = 12;
export const CAPTAIN_SKILL_POINT_POOL = 16;

export function createDefaultAttributeAllocation(): CoreAttributeScores {
	return createEmptyAttributeScores(ALLOCATION_STAT_DEFAULT);
}

export function createDefaultSkillAllocation(): ProfessionalSkillScores {
	return createEmptySkillScores(ALLOCATION_STAT_DEFAULT);
}

export function getSpentAllocationPoints(values: Record<string, number>): number {
	return Object.values(values).reduce((total, value) => total + (value - ALLOCATION_STAT_DEFAULT), 0);
}

export function getRemainingAllocationPoints(
	values: Record<string, number>,
	pool: number,
): number {
	return pool - getSpentAllocationPoints(values);
}

export function canIncreaseAllocation(
	values: Record<string, number>,
	key: string,
	pool: number,
): boolean {
	const current = values[key];
	if (current === undefined) return false;
	if (current >= ALLOCATION_STAT_MAX) return false;
	return getRemainingAllocationPoints(values, pool) > 0;
}

export function canDecreaseAllocation(values: Record<string, number>, key: string): boolean {
	const current = values[key];
	if (current === undefined) return false;
	return current > ALLOCATION_STAT_MIN;
}

export function isAllocationComplete(values: Record<string, number>, pool: number): boolean {
	const remaining = getRemainingAllocationPoints(values, pool);
	if (remaining !== 0) return false;

	return Object.values(values).every(
		(value) => value >= ALLOCATION_STAT_MIN && value <= ALLOCATION_STAT_MAX,
	);
}

function adjustValue(
	values: Record<string, number>,
	key: string,
	delta: 1 | -1,
	pool: number,
): Record<string, number> | null {
	const current = values[key];
	if (current === undefined) return null;

	if (delta === 1 && !canIncreaseAllocation(values, key, pool)) return null;
	if (delta === -1 && !canDecreaseAllocation(values, key)) return null;

	return {
		...values,
		[key]: current + delta,
	};
}

export function increaseAttribute(
	scores: CoreAttributeScores,
	id: CoreAttributeId,
): CoreAttributeScores | null {
	const next = adjustValue(scores, id, 1, CAPTAIN_ATTRIBUTE_POINT_POOL);
	return next as CoreAttributeScores | null;
}

export function decreaseAttribute(
	scores: CoreAttributeScores,
	id: CoreAttributeId,
): CoreAttributeScores | null {
	const next = adjustValue(scores, id, -1, CAPTAIN_ATTRIBUTE_POINT_POOL);
	return next as CoreAttributeScores | null;
}

export function increaseSkill(
	scores: ProfessionalSkillScores,
	id: ProfessionalSkillId,
): ProfessionalSkillScores | null {
	const next = adjustValue(scores, id, 1, CAPTAIN_SKILL_POINT_POOL);
	return next as ProfessionalSkillScores | null;
}

export function decreaseSkill(
	scores: ProfessionalSkillScores,
	id: ProfessionalSkillId,
): ProfessionalSkillScores | null {
	const next = adjustValue(scores, id, -1, CAPTAIN_SKILL_POINT_POOL);
	return next as ProfessionalSkillScores | null;
}

function randomisePool(
	keys: readonly string[],
	pool: number,
): Record<string, number> {
	const values: Record<string, number> = {};
	for (const key of keys) {
		values[key] = ALLOCATION_STAT_DEFAULT;
	}

	let remaining = pool;
	let guard = 0;

	while (remaining > 0 && guard < 10_000) {
		guard += 1;
		const raisable = keys.filter((key) => (values[key] ?? 0) < ALLOCATION_STAT_MAX);
		if (raisable.length === 0) break;
		const key = raisable[Math.floor(Math.random() * raisable.length)] as string;
		values[key] = (values[key] ?? ALLOCATION_STAT_DEFAULT) + 1;
		remaining -= 1;
	}

	// Optional dump/refund shuffle for variety while keeping net spent === pool
	for (let i = 0; i < 24; i += 1) {
		const fromKeys = keys.filter((key) => (values[key] ?? 0) > ALLOCATION_STAT_MIN);
		const toKeys = keys.filter((key) => (values[key] ?? 0) < ALLOCATION_STAT_MAX);
		if (fromKeys.length === 0 || toKeys.length === 0) break;
		const from = fromKeys[Math.floor(Math.random() * fromKeys.length)] as string;
		const to = toKeys[Math.floor(Math.random() * toKeys.length)] as string;
		if (from === to) continue;
		values[from] = (values[from] ?? 0) - 1;
		values[to] = (values[to] ?? 0) + 1;
	}

	return values;
}

export function randomiseAttributeAllocation(): CoreAttributeScores {
	const raw = randomisePool(CORE_ATTRIBUTE_IDS, CAPTAIN_ATTRIBUTE_POINT_POOL);
	const result = createDefaultAttributeAllocation();
	for (const id of CORE_ATTRIBUTE_IDS) {
		result[id] = raw[id] ?? ALLOCATION_STAT_DEFAULT;
	}
	return result;
}

export function randomiseSkillAllocation(): ProfessionalSkillScores {
	const raw = randomisePool(PROFESSIONAL_SKILL_IDS, CAPTAIN_SKILL_POINT_POOL);
	const result = createDefaultSkillAllocation();
	for (const id of PROFESSIONAL_SKILL_IDS) {
		result[id] = raw[id] ?? ALLOCATION_STAT_DEFAULT;
	}
	return result;
}

export function clampAllocationValue(value: number): number {
	return Math.min(
		ALLOCATION_STAT_MAX,
		Math.max(ALLOCATION_STAT_MIN, Math.max(STAT_BASE_MIN, value)),
	);
}
