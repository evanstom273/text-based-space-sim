export const RANK_IDS = [
	'ensign',
	'lieutenant',
	'lieutenant_commander',
	'commander',
	'captain',
	'admiral',
] as const;

export type RankId = (typeof RANK_IDS)[number];

export interface RankDefinition {
	id: RankId;
	name: string;
	abbreviation: string;
	/** Ascending seniority order (Ensign = 1 … Admiral = 6). */
	order: number;
	/** Whether this rank appears in normal shipboard procedural crew generation. */
	eligibleForShipCrewGeneration: boolean;
	notes: string;
}

/**
 * Planetary Union rank structure used by this game.
 * Do NOT add Lieutenant Junior Grade or other Starfleet ranks.
 */
export const RANKS: Record<RankId, RankDefinition> = {
	ensign: {
		id: 'ensign',
		name: 'Ensign',
		abbreviation: 'Ens.',
		order: 1,
		eligibleForShipCrewGeneration: true,
		notes: 'Junior commissioned officer.',
	},
	lieutenant: {
		id: 'lieutenant',
		name: 'Lieutenant',
		abbreviation: 'Lt.',
		order: 2,
		eligibleForShipCrewGeneration: true,
		notes: 'Standard departmental officer rank.',
	},
	lieutenant_commander: {
		id: 'lieutenant_commander',
		name: 'Lieutenant Commander',
		abbreviation: 'Lt. Cmdr.',
		order: 3,
		eligibleForShipCrewGeneration: true,
		notes: 'Senior departmental / junior command rank.',
	},
	commander: {
		id: 'commander',
		name: 'Commander',
		abbreviation: 'Cmdr.',
		order: 4,
		eligibleForShipCrewGeneration: true,
		notes: 'Senior command officer; typical First Officer rank.',
	},
	captain: {
		id: 'captain',
		name: 'Captain',
		abbreviation: 'Capt.',
		order: 5,
		eligibleForShipCrewGeneration: false,
		notes: 'Reserved for the player commanding officer of the vessel.',
	},
	admiral: {
		id: 'admiral',
		name: 'Admiral',
		abbreviation: 'Adm.',
		order: 6,
		eligibleForShipCrewGeneration: false,
		notes: 'Fleet-level command; normally outside shipboard complement.',
	},
};

export const RANK_LIST: RankDefinition[] = RANK_IDS.map((id) => RANKS[id]);

export function getRank(id: RankId): RankDefinition {
	return RANKS[id];
}

export function isRankId(value: string): value is RankId {
	return (RANK_IDS as readonly string[]).includes(value);
}

export function formatRankName(id: RankId): string {
	return RANKS[id].name;
}
