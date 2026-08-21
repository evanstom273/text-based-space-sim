/**
 * Civilian occupations / roles for non-Union ship inhabitants.
 * Extensible catalogue — not an exhaustive list.
 */
export const CIVILIAN_ROLE_IDS = [
	'spouse_partner',
	'child',
	'dependant',
	'civilian_scientist',
	'teacher',
	'civilian_specialist',
] as const;

export type CivilianRoleId = (typeof CIVILIAN_ROLE_IDS)[number];

export interface CivilianRoleDefinition {
	id: CivilianRoleId;
	name: string;
	description: string;
	/** Typical age band used during generation (inclusive). */
	typicalAgeMin: number;
	typicalAgeMax: number;
}

export const CIVILIAN_ROLES: Record<CivilianRoleId, CivilianRoleDefinition> = {
	spouse_partner: {
		id: 'spouse_partner',
		name: 'Civilian Partner',
		description: 'Non-serving partner or spouse of ship personnel.',
		typicalAgeMin: 22,
		typicalAgeMax: 65,
	},
	child: {
		id: 'child',
		name: 'Child',
		description: 'Minor dependant living aboard the vessel.',
		typicalAgeMin: 1,
		typicalAgeMax: 17,
	},
	dependant: {
		id: 'dependant',
		name: 'Dependant',
		description: 'Adult dependant resident who is not Union personnel.',
		typicalAgeMin: 18,
		typicalAgeMax: 80,
	},
	civilian_scientist: {
		id: 'civilian_scientist',
		name: 'Civilian Scientist',
		description: 'Civilian research specialist embarked for scientific work.',
		typicalAgeMin: 28,
		typicalAgeMax: 70,
	},
	teacher: {
		id: 'teacher',
		name: 'Teacher',
		description: 'Educator supporting families and children aboard ship.',
		typicalAgeMin: 24,
		typicalAgeMax: 65,
	},
	civilian_specialist: {
		id: 'civilian_specialist',
		name: 'Civilian Specialist',
		description: 'Civilian technical or cultural specialist.',
		typicalAgeMin: 25,
		typicalAgeMax: 68,
	},
};

export const CIVILIAN_ROLE_LIST: CivilianRoleDefinition[] = CIVILIAN_ROLE_IDS.map(
	(id) => CIVILIAN_ROLES[id],
);

export function getCivilianRole(id: CivilianRoleId): CivilianRoleDefinition {
	return CIVILIAN_ROLES[id];
}

export function isCivilianRoleId(value: string): value is CivilianRoleId {
	return (CIVILIAN_ROLE_IDS as readonly string[]).includes(value);
}
