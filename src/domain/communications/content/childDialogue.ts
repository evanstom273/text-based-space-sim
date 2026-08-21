import type { DialogueDefinition } from '../types';
import { isChildOrTeen, isYoungChild } from '../conditionEvaluator';

export const CHILD_TALK_SCHOOL_DEFINITION: DialogueDefinition = {
	intentId: 'CHILD_TALK_SCHOOL',
	category: 'personal',
	title: 'Studies & lessons',
	isAvailable: (ctx) => isChildOrTeen(ctx),
	playerVariants: [
		{
			id: 'child_school_check',
			label: 'How are your studies?',
			template: 'How are your classes and learning modules going, {firstName}?',
			tones: ['warm'],
		},
	],
	responseVariants: [
		{
			id: 'resp_child_school_fun',
			template: 'We learned about planetary atmospheres and jump drives today! My instructor says I did great.',
			tones: ['excited'],
			condition: (ctx) => isYoungChild(ctx),
		},
		{
			id: 'resp_teen_school_ok',
			template: 'The astrophysics modules are pretty tough, but I am keeping up with the syllabus.',
			tones: ['casual'],
			condition: (ctx) => !isYoungChild(ctx),
		},
	],
};

export const CHILD_TALK_HOBBIES_DEFINITION: DialogueDefinition = {
	intentId: 'CHILD_TALK_HOBBIES',
	category: 'personal',
	title: 'Hobbies & fun',
	isAvailable: (ctx) => isChildOrTeen(ctx),
	playerVariants: [
		{
			id: 'child_hobbies_check',
			label: 'What are you doing for fun?',
			template: 'What fun things have you been up to aboard the vessel?',
			tones: ['warm', 'friendly'],
		},
	],
	responseVariants: [
		{
			id: 'resp_child_simulator',
			template: 'I got to play in the environmental simulator yesterday! We built a whole space station.',
			tones: ['excited'],
		},
	],
};

export const CHILD_TALK_FAMILY_DEFINITION: DialogueDefinition = {
	intentId: 'CHILD_TALK_FAMILY',
	category: 'personal',
	title: 'Family aboard',
	isAvailable: (ctx) => isChildOrTeen(ctx),
	playerVariants: [
		{
			id: 'child_fam_check',
			label: 'How is your family doing?',
			template: 'How are things with your family aboard {shipName}?',
			tones: ['warm'],
		},
	],
	responseVariants: [
		{
			id: 'resp_child_fam_good',
			template: 'Mom and dad have been busy on their shifts, but we ate dinner together yesterday in the mess hall.',
			tones: ['warm', 'friendly'],
		},
	],
};