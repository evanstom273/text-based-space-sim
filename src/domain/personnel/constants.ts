/** Base attribute and skill values use a 0–10 scale. */
export const STAT_BASE_MIN = 0;
export const STAT_BASE_MAX = 10;

/**
 * Individual modifier contributions use only:
 * -2 | -1 | 0 | +1 | +2
 */
export const MODIFIER_MIN = -2;
export const MODIFIER_MAX = 2;

export type ModifierDelta = -2 | -1 | 0 | 1 | 2;

/**
 * Effective (base + all modifiers) values are not hard-clamped to 0–10.
 * Display and check systems may optionally soft-clamp for UI or dice rolls;
 * the raw effective total is preserved for inspectability.
 *
 * Soft-clamp helper available via `clampStatForDisplay` / `clampStatForCheck`.
 */
export const EFFECTIVE_SOFT_CLAMP_MIN = 0;
export const EFFECTIVE_SOFT_CLAMP_MAX = 12;

export const PERSONNEL_SCHEMA_VERSION = 1 as const;
