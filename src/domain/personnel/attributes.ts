export const CORE_ATTRIBUTE_IDS = [
	'physical',
	'agility',
	'intelligence',
	'perception',
	'charisma',
	'resilience',
] as const;

export type CoreAttributeId = (typeof CORE_ATTRIBUTE_IDS)[number];

export interface CoreAttributeDefinition {
	id: CoreAttributeId;
	name: string;
	description: string;
}

export const CORE_ATTRIBUTES: Record<CoreAttributeId, CoreAttributeDefinition> = {
	physical: {
		id: 'physical',
		name: 'Physical',
		description: 'General physical capability, fitness, strength and bodily competence.',
	},
	agility: {
		id: 'agility',
		name: 'Agility',
		description: 'Coordination, reflexes, dexterity and speed of physical response.',
	},
	intelligence: {
		id: 'intelligence',
		name: 'Intelligence',
		description: 'Reasoning, learning, technical comprehension and problem solving.',
	},
	perception: {
		id: 'perception',
		name: 'Perception',
		description: 'Awareness, observation and ability to notice important information.',
	},
	charisma: {
		id: 'charisma',
		name: 'Charisma',
		description: 'Social presence, communication, persuasion and interpersonal ability.',
	},
	resilience: {
		id: 'resilience',
		name: 'Resilience',
		description:
			'Ability to withstand physical and mental pressure, stress, exhaustion and difficult circumstances.',
	},
};

export type CoreAttributeScores = Record<CoreAttributeId, number>;

export function createEmptyAttributeScores(defaultValue = 0): CoreAttributeScores {
	return {
		physical: defaultValue,
		agility: defaultValue,
		intelligence: defaultValue,
		perception: defaultValue,
		charisma: defaultValue,
		resilience: defaultValue,
	};
}

export function isCoreAttributeId(value: string): value is CoreAttributeId {
	return (CORE_ATTRIBUTE_IDS as readonly string[]).includes(value);
}
