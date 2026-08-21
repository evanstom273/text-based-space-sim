import type { DialogueDefinition } from '../types';
import { isAdult } from '../conditionEvaluator';

export const DISCUSS_CONFLICT_DEFINITION: DialogueDefinition = {
	intentId: 'DISCUSS_CONFLICT',
	category: 'relationship',
	title: 'Address personal friction',
	isAvailable: (ctx) => ctx.target.hasConflictWithCaptain && isAdult(ctx),
	playerVariants: [
		{
			id: 'conflict_direct',
			label: 'Discuss disagreement',
			template: 'We need to resolve this personal tension between us for the sake of the ship.',
			tones: ['formal', 'respectful'],
		},
	],
	responseVariants: [
		{
			id: 'resp_conflict_frank',
			template: "I agree, Captain. We may not always see eye to eye, but I respect the chain of command and my duty to {shipName}.",
			tones: ['cold', 'professional'],
			effects: [
				{
					type: 'RELATIONSHIP_DELTA',
					targetId: '{targetId}',
					amount: 2,
					reason: 'Conflict addressed',
				},
			],
		},
	],
};

export const EXPRESS_SYMPATHY_DEFINITION: DialogueDefinition = {
	intentId: 'EXPRESS_SYMPATHY',
	category: 'relationship',
	title: 'Express sympathy',
	isAvailable: (ctx) => isAdult(ctx) && (ctx.target.captainAffinity >= 0 || ctx.target.isFriendOfCaptain),
	playerVariants: [
		{
			id: 'sympathy_general',
			label: 'Offer support',
			template: 'If you ever need a sounding board or additional support, my door is open.',
			tones: ['warm', 'respectful'],
		},
	],
	responseVariants: [
		{
			id: 'resp_sympathy_warm',
			template: 'That means a lot, Captain. Thank you for checking in on me.',
			tones: ['warm', 'proud'],
			effects: [
				{
					type: 'RELATIONSHIP_DELTA',
					targetId: '{targetId}',
					amount: 1,
					reason: 'Captain support',
				},
			],
		},
	],
};

export const EXPRESS_CONGRATULATIONS_DEFINITION: DialogueDefinition = {
	intentId: 'EXPRESS_CONGRATULATIONS',
	category: 'relationship',
	title: 'Congratulate',
	isAvailable: (ctx) => isAdult(ctx),
	playerVariants: [
		{
			id: 'congrats_standard',
			label: 'Offer congratulations',
			template: 'Congratulations on your steady achievements aboard the vessel.',
			tones: ['friendly', 'proud'],
		},
	],
	responseVariants: [
		{
			id: 'resp_congrats_happy',
			template: 'Thank you, Captain! Always striving to make meaningful contributions.',
			tones: ['excited', 'warm'],
		},
	],
};