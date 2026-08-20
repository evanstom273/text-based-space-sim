export const PROFESSIONAL_SKILL_IDS = [
	'engineering',
	'medicine',
	'science',
	'combat',
	'piloting',
	'command',
	'diplomacy',
	'tactical',
] as const;

export type ProfessionalSkillId = (typeof PROFESSIONAL_SKILL_IDS)[number];

export interface ProfessionalSkillDefinition {
	id: ProfessionalSkillId;
	name: string;
	description: string;
}

/**
 * Professional skills are distinct from shipboard divisions.
 * Example: Combat is a skill; Security is a division.
 */
export const PROFESSIONAL_SKILLS: Record<ProfessionalSkillId, ProfessionalSkillDefinition> = {
	engineering: {
		id: 'engineering',
		name: 'Engineering',
		description: 'Ship systems, repairs, technical problem-solving and mechanical work.',
	},
	medicine: {
		id: 'medicine',
		name: 'Medicine',
		description: 'Diagnosis, treatment, surgery and medical science.',
	},
	science: {
		id: 'science',
		name: 'Science',
		description: 'Research, analysis, xenobiology, astrophysics and experimental work.',
	},
	combat: {
		id: 'combat',
		name: 'Combat',
		description: 'Personal combat proficiency, weapons handling and close-quarters capability.',
	},
	piloting: {
		id: 'piloting',
		name: 'Piloting',
		description: 'Helm control, navigation under pressure and vessel manoeuvring.',
	},
	command: {
		id: 'command',
		name: 'Command',
		description: 'Leadership, bridge decision-making and organisational authority.',
	},
	diplomacy: {
		id: 'diplomacy',
		name: 'Diplomacy',
		description: 'Negotiation, first contact protocol and inter-civilisation relations.',
	},
	tactical: {
		id: 'tactical',
		name: 'Tactical',
		description: 'Shipboard tactics, threat assessment and combat systems coordination.',
	},
};

export type ProfessionalSkillScores = Record<ProfessionalSkillId, number>;

export function createEmptySkillScores(defaultValue = 0): ProfessionalSkillScores {
	return {
		engineering: defaultValue,
		medicine: defaultValue,
		science: defaultValue,
		combat: defaultValue,
		piloting: defaultValue,
		command: defaultValue,
		diplomacy: defaultValue,
		tactical: defaultValue,
	};
}

export function isProfessionalSkillId(value: string): value is ProfessionalSkillId {
	return (PROFESSIONAL_SKILL_IDS as readonly string[]).includes(value);
}
