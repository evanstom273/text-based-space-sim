import type { DialogueDefinition } from '../types';
import { isAdult, isSeniorStaff, isUnionOfficer } from '../conditionEvaluator';

export const PRAISE_DEFINITION: DialogueDefinition = {
	intentId: 'PRAISE',
	category: 'command',
	title: 'Commend performance',
	isAvailable: (ctx) => isUnionOfficer(ctx),
	playerVariants: [
		{
			id: 'praise_standard',
			label: 'Commend work',
			template: 'Your dedication and performance in {departmentName} have been exemplary.',
			tones: ['respectful', 'proud'],
		},
		{
			id: 'praise_senior',
			label: 'Praise leadership',
			template: 'You have managed your responsibilities with real distinction.',
			tones: ['formal', 'respectful'],
			condition: (ctx) => isSeniorStaff(ctx),
		},
	],
	responseVariants: [
		{
			id: 'resp_praise_grateful',
			template: 'Thank you, Captain. Hearing that means a great deal to me. I will keep the standard high.',
			tones: ['proud', 'warm'],
			effects: [
				{
					type: 'RELATIONSHIP_DELTA',
					targetId: '{targetId}',
					amount: 2,
					reason: 'Captain praise',
				},
			],
		},
		{
			id: 'resp_praise_humble',
			template: "Thank you, Captain. It's really down to the whole team in {departmentName}.",
			tones: ['respectful', 'professional'],
			effects: [
				{
					type: 'RELATIONSHIP_DELTA',
					targetId: '{targetId}',
					amount: 1,
					reason: 'Captain praise',
				},
			],
		},
	],
};

export const CRITICISE_DEFINITION: DialogueDefinition = {
	intentId: 'CRITICISE',
	category: 'command',
	title: 'Address shortcomings',
	isAvailable: (ctx) => isUnionOfficer(ctx),
	playerVariants: [
		{
			id: 'critique_standard',
			label: 'Demand improvement',
			template: 'Your section needs to step up its attention to detail. Standards have slipped.',
			tones: ['formal', 'cold'],
		},
	],
	responseVariants: [
		{
			id: 'resp_critique_defensive',
			template: 'Understood, Captain. We will review our procedures and rectify any oversights immediately.',
			tones: ['defensive', 'formal'],
			effects: [
				{
					type: 'RELATIONSHIP_DELTA',
					targetId: '{targetId}',
					amount: -2,
					reason: 'Captain reprimand',
				},
			],
		},
	],
};

export const ENCOURAGE_DEFINITION: DialogueDefinition = {
	intentId: 'ENCOURAGE',
	category: 'command',
	title: 'Offer encouragement',
	isAvailable: (ctx) => isAdult(ctx),
	playerVariants: [
		{
			id: 'encourage_standard',
			label: 'Express confidence',
			template: 'I have full confidence in your abilities. Keep pushing forward.',
			tones: ['warm', 'friendly'],
		},
	],
	responseVariants: [
		{
			id: 'resp_encourage_appreciate',
			template: 'I appreciate your support, Captain. I will not let you or the crew down.',
			tones: ['warm', 'confident'],
			effects: [
				{
					type: 'RELATIONSHIP_DELTA',
					targetId: '{targetId}',
					amount: 1,
					reason: 'Captain encouragement',
				},
			],
		},
	],
};

export const APOLOGISE_DEFINITION: DialogueDefinition = {
	intentId: 'APOLOGISE',
	category: 'command',
	title: 'Apologise / Clear the air',
	isAvailable: (ctx) => ctx.target.hasConflictWithCaptain || ctx.target.captainAffinity < 0,
	playerVariants: [
		{
			id: 'apologise_direct',
			label: 'Apologise',
			template: 'I want to clear the air regarding our recent friction. My handling could have been better.',
			tones: ['respectful', 'warm'],
		},
	],
	responseVariants: [
		{
			id: 'resp_apologise_accepted',
			template: 'I appreciate you saying that, Captain. Let us put it behind us and focus on the mission.',
			tones: ['warm', 'respectful'],
			effects: [
				{
					type: 'RELATIONSHIP_DELTA',
					targetId: '{targetId}',
					amount: 4,
					reason: 'Captain apology',
				},
			],
		},
	],
};

export const ASK_ADVICE_DEFINITION: DialogueDefinition = {
	intentId: 'ASK_ADVICE',
	category: 'command',
	title: 'Seek advice',
	isAvailable: (ctx) => isSeniorStaff(ctx),
	playerVariants: [
		{
			id: 'seek_advice_xo',
			label: 'Command counsel',
			template: 'What is your counsel on our current operational posture, {lastName}?',
			tones: ['respectful', 'professional'],
			condition: (ctx) => ctx.target.isFirstOfficer,
		},
		{
			id: 'seek_advice_chief',
			label: 'Department counsel',
			template: 'I value your perspective. What should command be keeping an eye on regarding {departmentName}?',
			tones: ['respectful'],
			condition: (ctx) => ctx.target.isDepartmentChief,
		},
	],
	responseVariants: [
		{
			id: 'resp_advice_xo',
			template: 'Keep cross-department communications flowing, Captain. When the bridge and the lower decks are in sync, the whole vessel operates at peak efficiency.',
			tones: ['professional', 'confident'],
			condition: (ctx) => ctx.target.isFirstOfficer,
		},
		{
			id: 'resp_advice_chief',
			template: 'Maintain standard diagnostic schedules and do not defer preventive maintenance. Routine discipline avoids crises.',
			tones: ['professional'],
		},
	],
};

export const ASK_PROFESSIONAL_OPINION_DEFINITION: DialogueDefinition = {
	intentId: 'ASK_PROFESSIONAL_OPINION',
	category: 'command',
	title: 'Professional assessment',
	isAvailable: (ctx) => isUnionOfficer(ctx),
	playerVariants: [
		{
			id: 'prof_op',
			label: 'Professional assessment',
			template: 'From your professional standpoint in {departmentName}, are our current procedures optimal?',
			tones: ['professional'],
		},
	],
	responseVariants: [
		{
			id: 'resp_prof_op_sound',
			template: 'Our current protocols are sound and fully compliant with Union fleet directives.',
			tones: ['professional'],
		},
	],
};