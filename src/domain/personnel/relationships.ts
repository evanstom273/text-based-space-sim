/**
 * Persistent interpersonal and organisational relationships.
 * Professional and personal relationship graphs are separate concerns.
 */

export const PROFESSIONAL_RELATIONSHIP_TYPE_IDS = [
	'direct_superior',
	'direct_subordinate',
	'supervisor',
	'department_colleague',
	'senior_staff_colleague',
] as const;

export const PERSONAL_RELATIONSHIP_TYPE_IDS = [
	'friend',
	'close_friend',
	'rival',
	'enemy',
	'dating',
	'partner',
	'spouse',
	'parent',
	'child',
	'sibling',
] as const;

export const RELATIONSHIP_TYPE_IDS = [
	...PROFESSIONAL_RELATIONSHIP_TYPE_IDS,
	...PERSONAL_RELATIONSHIP_TYPE_IDS,
] as const;

export type ProfessionalRelationshipTypeId = (typeof PROFESSIONAL_RELATIONSHIP_TYPE_IDS)[number];
export type PersonalRelationshipTypeId = (typeof PERSONAL_RELATIONSHIP_TYPE_IDS)[number];
export type RelationshipTypeId = (typeof RELATIONSHIP_TYPE_IDS)[number];

export type RelationshipCategory = 'professional' | 'personal';

export interface RelationshipTypeDefinition {
	id: RelationshipTypeId;
	name: string;
	category: RelationshipCategory;
	/** Inverse type written on the other person (may equal id for symmetric links). */
	inverseTypeId: RelationshipTypeId;
	/** Default affinity seed for social relationships (-100…100). */
	defaultAffinity: number | null;
	description: string;
}

export const RELATIONSHIP_TYPES: Record<RelationshipTypeId, RelationshipTypeDefinition> = {
	direct_superior: {
		id: 'direct_superior',
		name: 'Direct Superior',
		category: 'professional',
		inverseTypeId: 'direct_subordinate',
		defaultAffinity: null,
		description: 'Immediate operational superior in the chain of command.',
	},
	direct_subordinate: {
		id: 'direct_subordinate',
		name: 'Direct Subordinate',
		category: 'professional',
		inverseTypeId: 'direct_superior',
		defaultAffinity: null,
		description: 'Immediate operational subordinate in the chain of command.',
	},
	supervisor: {
		id: 'supervisor',
		name: 'Supervisor',
		category: 'professional',
		inverseTypeId: 'direct_subordinate',
		defaultAffinity: null,
		description: 'Broader supervisory authority (not necessarily day-to-day direct report).',
	},
	department_colleague: {
		id: 'department_colleague',
		name: 'Department Colleague',
		category: 'professional',
		inverseTypeId: 'department_colleague',
		defaultAffinity: 10,
		description: 'Serves in the same division.',
	},
	senior_staff_colleague: {
		id: 'senior_staff_colleague',
		name: 'Senior Staff Colleague',
		category: 'professional',
		inverseTypeId: 'senior_staff_colleague',
		defaultAffinity: 15,
		description: 'Fellow member of the ship senior staff.',
	},
	friend: {
		id: 'friend',
		name: 'Friend',
		category: 'personal',
		inverseTypeId: 'friend',
		defaultAffinity: 35,
		description: 'Positive social relationship.',
	},
	close_friend: {
		id: 'close_friend',
		name: 'Close Friend',
		category: 'personal',
		inverseTypeId: 'close_friend',
		defaultAffinity: 65,
		description: 'Strong personal friendship.',
	},
	rival: {
		id: 'rival',
		name: 'Rival',
		category: 'personal',
		inverseTypeId: 'rival',
		defaultAffinity: -25,
		description: 'Competitive or antagonistic personal rivalry.',
	},
	enemy: {
		id: 'enemy',
		name: 'Enemy',
		category: 'personal',
		inverseTypeId: 'enemy',
		defaultAffinity: -70,
		description: 'Hostile personal relationship.',
	},
	dating: {
		id: 'dating',
		name: 'Dating',
		category: 'personal',
		inverseTypeId: 'dating',
		defaultAffinity: 50,
		description: 'Romantic relationship that is not a formal partnership.',
	},
	partner: {
		id: 'partner',
		name: 'Partner',
		category: 'personal',
		inverseTypeId: 'partner',
		defaultAffinity: 70,
		description: 'Committed romantic partnership.',
	},
	spouse: {
		id: 'spouse',
		name: 'Spouse',
		category: 'personal',
		inverseTypeId: 'spouse',
		defaultAffinity: 80,
		description: 'Married / formally bonded spouse.',
	},
	parent: {
		id: 'parent',
		name: 'Parent',
		category: 'personal',
		inverseTypeId: 'child',
		defaultAffinity: 75,
		description: 'Parent of another inhabitant.',
	},
	child: {
		id: 'child',
		name: 'Child',
		category: 'personal',
		inverseTypeId: 'parent',
		defaultAffinity: 75,
		description: 'Child of another inhabitant.',
	},
	sibling: {
		id: 'sibling',
		name: 'Sibling',
		category: 'personal',
		inverseTypeId: 'sibling',
		defaultAffinity: 55,
		description: 'Sibling relationship.',
	},
};

export interface PersonnelRelationship {
	id: string;
	fromPersonnelId: string;
	toPersonnelId: string;
	typeId: RelationshipTypeId;
	/**
	 * Social affinity / relationship strength on a -100…100 scale.
	 * Used for future progression (enemy → rival → friend, etc.).
	 * Structural family/org links may still carry a value for convenience.
	 */
	affinity: number;
}

export function getRelationshipType(id: RelationshipTypeId): RelationshipTypeDefinition {
	return RELATIONSHIP_TYPES[id];
}

export function isRelationshipTypeId(value: string): value is RelationshipTypeId {
	return (RELATIONSHIP_TYPE_IDS as readonly string[]).includes(value);
}

export function clampAffinity(value: number): number {
	return Math.max(-100, Math.min(100, Math.round(value)));
}

function createRelationshipId(fromId: string, toId: string, typeId: RelationshipTypeId): string {
	return `rel-${fromId}-${typeId}-${toId}`;
}

/**
 * Upsert a directed relationship edge.
 */
export function upsertDirectedRelationship(
	relationships: PersonnelRelationship[],
	fromPersonnelId: string,
	toPersonnelId: string,
	typeId: RelationshipTypeId,
	affinity?: number,
): PersonnelRelationship[] {
	if (fromPersonnelId === toPersonnelId) {
		return relationships;
	}
	const definition = RELATIONSHIP_TYPES[typeId];
	const nextAffinity = clampAffinity(
		affinity ?? definition.defaultAffinity ?? 0,
	);
	const without = relationships.filter(
		(entry) =>
			!(
				entry.fromPersonnelId === fromPersonnelId &&
				entry.toPersonnelId === toPersonnelId &&
				entry.typeId === typeId
			),
	);
	return [
		...without,
		{
			id: createRelationshipId(fromPersonnelId, toPersonnelId, typeId),
			fromPersonnelId,
			toPersonnelId,
			typeId,
			affinity: nextAffinity,
		},
	];
}

/**
 * Create or update a relationship and its inverse automatically.
 */
export function linkBidirectionalRelationship(
	relationships: PersonnelRelationship[],
	fromPersonnelId: string,
	toPersonnelId: string,
	typeId: RelationshipTypeId,
	affinity?: number,
): PersonnelRelationship[] {
	const definition = RELATIONSHIP_TYPES[typeId];
	const withForward = upsertDirectedRelationship(
		relationships,
		fromPersonnelId,
		toPersonnelId,
		typeId,
		affinity,
	);
	return upsertDirectedRelationship(
		withForward,
		toPersonnelId,
		fromPersonnelId,
		definition.inverseTypeId,
		affinity,
	);
}

export function listRelationshipsFrom(
	relationships: readonly PersonnelRelationship[],
	personnelId: string,
): PersonnelRelationship[] {
	return relationships.filter((entry) => entry.fromPersonnelId === personnelId);
}

export function listRelationshipsOfType(
	relationships: readonly PersonnelRelationship[],
	personnelId: string,
	typeId: RelationshipTypeId,
): PersonnelRelationship[] {
	return relationships.filter(
		(entry) => entry.fromPersonnelId === personnelId && entry.typeId === typeId,
	);
}

export function hasRelationship(
	relationships: readonly PersonnelRelationship[],
	fromPersonnelId: string,
	toPersonnelId: string,
	typeId: RelationshipTypeId,
): boolean {
	return relationships.some(
		(entry) =>
			entry.fromPersonnelId === fromPersonnelId &&
			entry.toPersonnelId === toPersonnelId &&
			entry.typeId === typeId,
	);
}
