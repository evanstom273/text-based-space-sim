import type { DialogueDefinition } from '../types';
import { isBirthdayToday } from '../conditionEvaluator';

export const WISH_HAPPY_BIRTHDAY_DEFINITION: DialogueDefinition = {
	intentId: 'WISH_HAPPY_BIRTHDAY',
	category: 'contextual',
	title: 'Wish Happy Birthday',
	isAvailable: (ctx) => isBirthdayToday(ctx),
	playerVariants: [
		{
			id: 'bday_captain',
			label: 'Happy birthday',
			template: 'Happy birthday, {firstName}! Wishing you a wonderful day aboard {shipName}.',
			tones: ['warm', 'friendly'],
		},
	],
	responseVariants: [
		{
			id: 'resp_bday_warm',
			template: 'Thank you so much, Captain! I appreciate you taking the time to wish me well.',
			tones: ['excited', 'warm'],
			effects: [
				{
					type: 'RELATIONSHIP_DELTA',
					targetId: '{targetId}',
					amount: 3,
					reason: 'Birthday greeting',
				},
			],
		},
	],
};

export const FOLLOW_UP_REASON_DEFINITION: DialogueDefinition = {
	intentId: 'FOLLOW_UP_REASON',
	category: 'duty',
	title: 'Any maintenance bottlenecks?',
	isAvailable: (ctx) => ctx.session.activeFollowUps.includes('FOLLOW_UP_REASON'),
	playerVariants: [
		{
			id: 'follow_reason_q',
			label: 'Inquire on bottlenecks',
			template: 'Are there any specific maintenance bottlenecks we need to prioritize?',
			tones: ['professional'],
		},
	],
	responseVariants: [
		{
			id: 'resp_follow_reason_a',
			template: 'No critical bottlenecks. We are pacing routine part replacements with our standard supply stock.',
			tones: ['professional'],
		},
	],
};

export const FOLLOW_UP_ASSISTANCE_DEFINITION: DialogueDefinition = {
	intentId: 'FOLLOW_UP_ASSISTANCE',
	category: 'duty',
	title: 'Do you need extra support?',
	isAvailable: (ctx) => ctx.session.activeFollowUps.includes('FOLLOW_UP_ASSISTANCE'),
	playerVariants: [
		{
			id: 'follow_asst_q',
			label: 'Offer command support',
			template: 'Do you need command to adjust shift rotations or reassign personnel to assist?',
			tones: ['concerned', 'professional'],
		},
	],
	responseVariants: [
		{
			id: 'resp_follow_asst_a',
			template: 'Our current shift allocations are sufficient, Captain. We will alert you if demands escalate.',
			tones: ['confident', 'professional'],
		},
	],
};

export const FOLLOW_UP_SUPPORT_DEFINITION: DialogueDefinition = {
	intentId: 'FOLLOW_UP_SUPPORT',
	category: 'duty',
	title: 'Can the team handle it?',
	isAvailable: (ctx) => ctx.session.activeFollowUps.includes('FOLLOW_UP_SUPPORT'),
	playerVariants: [
		{
			id: 'follow_supp_q',
			label: 'Confirm workload capability',
			template: 'Is your team managing the workload without excessive fatigue?',
			tones: ['concerned'],
		},
	],
	responseVariants: [
		{
			id: 'resp_follow_supp_a',
			template: 'Yes, Captain. Morale is high and we are taking mandatory downtime between heavy rotations.',
			tones: ['warm', 'professional'],
		},
	],
};