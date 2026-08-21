import type { DialogueDefinition } from '../types';
import { isCivilian } from '../conditionEvaluator';

export const CIVILIAN_TALK_WORK_DEFINITION: DialogueDefinition = {
	intentId: 'CIVILIAN_TALK_WORK',
	category: 'personal',
	title: 'Civilian occupation',
	isAvailable: (ctx) => isCivilian(ctx),
	playerVariants: [
		{
			id: 'civ_work_check',
			label: 'How is your work?',
			template: 'How are your civilian operations and duties going aboard the ship?',
			tones: ['friendly', 'professional'],
		},
	],
	responseVariants: [
		{
			id: 'resp_civ_work_good',
			template: 'Things are running smoothly on my end. It is rewarding supporting the ship community.',
			tones: ['warm', 'friendly'],
		},
	],
};

export const CIVILIAN_TALK_LIFE_DEFINITION: DialogueDefinition = {
	intentId: 'CIVILIAN_TALK_LIFE',
	category: 'personal',
	title: 'Shipboard life',
	isAvailable: (ctx) => isCivilian(ctx),
	playerVariants: [
		{
			id: 'civ_life_check',
			label: 'Civilian life aboard',
			template: 'How are you enjoying life as a civilian aboard {shipName}?',
			tones: ['friendly', 'casual'],
		},
	],
	responseVariants: [
		{
			id: 'resp_civ_life_fine',
			template: 'It takes some getting used to the ship rhythm, but the Union crew have been very accommodating.',
			tones: ['warm'],
		},
	],
};