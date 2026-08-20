/**
 * Canonical setting identity for the game.
 * This is explicitly The Orville universe — Planetary Union terminology only.
 * Do not substitute Starfleet / Star Trek naming.
 */
export const SETTING = {
	universe: 'The Orville',
	organisation: 'Planetary Union',
	organisationShort: 'Union',
	vesselClassLabel: 'Planetary Union starship',
	playerRole: 'Captain',
} as const;

export type SettingIdentity = typeof SETTING;
