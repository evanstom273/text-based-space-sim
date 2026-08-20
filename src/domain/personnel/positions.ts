import type { DivisionId } from './divisions';

export const POSITION_IDS = [
	'first_officer',
	'helmsman',
	'command_officer',
	'chief_engineer',
	'engineer',
	'chief_security_officer',
	'security_officer',
	'chief_medical_officer',
	'medical_officer',
	'nurse',
	'chief_science_officer',
	'science_officer',
] as const;

export type PositionId = (typeof POSITION_IDS)[number];

export interface PositionDefinition {
	id: PositionId;
	name: string;
	shortName: string;
	divisionId: DivisionId;
	/** Senior staff roles that form the player's initial command team. */
	isSeniorStaffRole: boolean;
	description: string;
	/**
	 * Placeholder for future position modifiers.
	 * Values intentionally empty until balancing design.
	 */
	attributeModifierPlaceholders: readonly string[];
	skillModifierPlaceholders: readonly string[];
}

/**
 * Departmental shipboard positions.
 * Command appointments (e.g. Second Officer) are defined separately.
 */
export const POSITIONS: Record<PositionId, PositionDefinition> = {
	first_officer: {
		id: 'first_officer',
		name: 'First Officer / XO',
		shortName: 'XO',
		divisionId: 'command',
		isSeniorStaffRole: true,
		description: 'Executive officer; dedicated senior command position under the Captain.',
		attributeModifierPlaceholders: [],
		skillModifierPlaceholders: [],
	},
	helmsman: {
		id: 'helmsman',
		name: 'Helmsman',
		shortName: 'Helm',
		divisionId: 'command',
		isSeniorStaffRole: true,
		description: 'Primary helm and navigational control officer.',
		attributeModifierPlaceholders: [],
		skillModifierPlaceholders: [],
	},
	command_officer: {
		id: 'command_officer',
		name: 'Command Officer',
		shortName: 'Command',
		divisionId: 'command',
		isSeniorStaffRole: false,
		description: 'General command-track bridge officer.',
		attributeModifierPlaceholders: [],
		skillModifierPlaceholders: [],
	},
	chief_engineer: {
		id: 'chief_engineer',
		name: 'Chief Engineer',
		shortName: 'Chief Eng.',
		divisionId: 'engineering',
		isSeniorStaffRole: true,
		description: 'Head of Engineering Division.',
		attributeModifierPlaceholders: [],
		skillModifierPlaceholders: [],
	},
	engineer: {
		id: 'engineer',
		name: 'Engineer',
		shortName: 'Engineer',
		divisionId: 'engineering',
		isSeniorStaffRole: false,
		description: 'Engineering Division officer.',
		attributeModifierPlaceholders: [],
		skillModifierPlaceholders: [],
	},
	chief_security_officer: {
		id: 'chief_security_officer',
		name: 'Chief Security Officer',
		shortName: 'Chief Sec.',
		divisionId: 'security',
		isSeniorStaffRole: true,
		description: 'Head of Security Division.',
		attributeModifierPlaceholders: [],
		skillModifierPlaceholders: [],
	},
	security_officer: {
		id: 'security_officer',
		name: 'Security Officer',
		shortName: 'Security',
		divisionId: 'security',
		isSeniorStaffRole: false,
		description: 'Security Division officer.',
		attributeModifierPlaceholders: [],
		skillModifierPlaceholders: [],
	},
	chief_medical_officer: {
		id: 'chief_medical_officer',
		name: 'Chief Medical Officer',
		shortName: 'CMO',
		divisionId: 'medical',
		isSeniorStaffRole: true,
		description: 'Head of Medical Division.',
		attributeModifierPlaceholders: [],
		skillModifierPlaceholders: [],
	},
	medical_officer: {
		id: 'medical_officer',
		name: 'Medical Officer',
		shortName: 'Medical',
		divisionId: 'medical',
		isSeniorStaffRole: false,
		description: 'Medical Division physician/officer.',
		attributeModifierPlaceholders: [],
		skillModifierPlaceholders: [],
	},
	nurse: {
		id: 'nurse',
		name: 'Nurse',
		shortName: 'Nurse',
		divisionId: 'medical',
		isSeniorStaffRole: false,
		description: 'Medical Division nursing officer.',
		attributeModifierPlaceholders: [],
		skillModifierPlaceholders: [],
	},
	chief_science_officer: {
		id: 'chief_science_officer',
		name: 'Chief Science Officer',
		shortName: 'CSO',
		divisionId: 'science',
		isSeniorStaffRole: true,
		description: 'Head of Science Division.',
		attributeModifierPlaceholders: [],
		skillModifierPlaceholders: [],
	},
	science_officer: {
		id: 'science_officer',
		name: 'Science Officer',
		shortName: 'Science',
		divisionId: 'science',
		isSeniorStaffRole: false,
		description: 'Science Division officer.',
		attributeModifierPlaceholders: [],
		skillModifierPlaceholders: [],
	},
};

export const POSITION_LIST: PositionDefinition[] = POSITION_IDS.map((id) => POSITIONS[id]);

/** Senior staff departmental roles (Second Officer is a command appointment, not listed here). */
export const SENIOR_STAFF_POSITION_IDS: readonly PositionId[] = POSITION_IDS.filter(
	(id) => POSITIONS[id].isSeniorStaffRole,
);

export function getPosition(id: PositionId): PositionDefinition {
	return POSITIONS[id];
}

export function isPositionId(value: string): value is PositionId {
	return (POSITION_IDS as readonly string[]).includes(value);
}

export function getPositionsForDivision(divisionId: DivisionId): PositionDefinition[] {
	return POSITION_LIST.filter((position) => position.divisionId === divisionId);
}
