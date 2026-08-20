export const DIVISION_IDS = [
	'command',
	'engineering',
	'security',
	'medical',
	'science',
] as const;

export type DivisionId = (typeof DIVISION_IDS)[number];

export interface DivisionDefinition {
	id: DivisionId;
	name: string;
	description: string;
	/** Position IDs belonging to this division (data-driven; extensible). */
	positionIds: readonly string[];
	/**
	 * Placeholder for future division modifiers.
	 * Up to ~2 attributes and ~2 skills using -2…+2.
	 * Values intentionally empty until balancing design.
	 */
	attributeModifierPlaceholders: readonly string[];
	skillModifierPlaceholders: readonly string[];
}

export const DIVISIONS: Record<DivisionId, DivisionDefinition> = {
	command: {
		id: 'command',
		name: 'Command',
		description: 'Bridge leadership, helm and command-track officers.',
		positionIds: ['first_officer', 'helmsman', 'command_officer'],
		attributeModifierPlaceholders: [],
		skillModifierPlaceholders: [],
	},
	engineering: {
		id: 'engineering',
		name: 'Engineering',
		description: 'Ship systems, propulsion, repairs and technical operations.',
		positionIds: ['chief_engineer', 'engineer'],
		attributeModifierPlaceholders: [],
		skillModifierPlaceholders: [],
	},
	security: {
		id: 'security',
		name: 'Security',
		description: 'Shipboard security, protection and tactical readiness.',
		positionIds: ['chief_security_officer', 'security_officer'],
		attributeModifierPlaceholders: [],
		skillModifierPlaceholders: [],
	},
	medical: {
		id: 'medical',
		name: 'Medical',
		description: 'Sickbay, patient care and medical sciences.',
		positionIds: ['chief_medical_officer', 'medical_officer', 'nurse'],
		attributeModifierPlaceholders: [],
		skillModifierPlaceholders: [],
	},
	science: {
		id: 'science',
		name: 'Science',
		description: 'Research, analysis and scientific exploration.',
		positionIds: ['chief_science_officer', 'science_officer'],
		attributeModifierPlaceholders: [],
		skillModifierPlaceholders: [],
	},
};

export const DIVISION_LIST: DivisionDefinition[] = DIVISION_IDS.map((id) => DIVISIONS[id]);

export function getDivision(id: DivisionId): DivisionDefinition {
	return DIVISIONS[id];
}

export function isDivisionId(value: string): value is DivisionId {
	return (DIVISION_IDS as readonly string[]).includes(value);
}
