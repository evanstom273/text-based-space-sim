import type { DialogueDefinition } from '../types';
import { isAdult, isYoungChild } from '../conditionEvaluator';

export const GREET_DEFINITION: DialogueDefinition = {
	intentId: 'GREET',
	category: 'general',
	title: 'Greeting',
	isAvailable: () => true,
	playerVariants: [
		{
			id: 'greet_formal_1',
			label: 'Formal greeting',
			template: '{rankAbbr} {lastName}.',
			tones: ['formal', 'professional'],
			condition: (ctx) => ctx.target.isUnion && isAdult(ctx),
		},
		{
			id: 'greet_formal_2',
			label: 'Officer check-in',
			template: 'Good to see you at your post, {rankAbbr} {lastName}.',
			tones: ['formal'],
			condition: (ctx) => ctx.target.isUnion && isAdult(ctx),
		},
		{
			id: 'greet_civilian',
			label: 'Civilian greeting',
			template: 'Hello, {firstName}.',
			tones: ['casual', 'friendly'],
			condition: (ctx) => ctx.target.isCivilian && isAdult(ctx),
		},
		{
			id: 'greet_child',
			label: 'Friendly greeting',
			template: 'Hey there, {firstName}.',
			tones: ['warm', 'friendly'],
			condition: (ctx) => isYoungChild(ctx) || ctx.target.lifeStage === 'older_child',
		},
		{
			id: 'greet_morning',
			label: 'Morning check-in',
			template: 'Good morning, {firstName}.',
			tones: ['friendly', 'warm'],
			condition: (ctx) => ctx.target.timeOfDay === 'morning',
		},
		{
			id: 'greet_afternoon',
			label: 'Afternoon check-in',
			template: 'Good afternoon, {firstName}.',
			tones: ['friendly', 'professional'],
			condition: (ctx) => ctx.target.timeOfDay === 'afternoon',
		},
		{
			id: 'greet_evening',
			label: 'Evening check-in',
			template: 'Good evening, {firstName}.',
			tones: ['casual', 'warm'],
			condition: (ctx) => ctx.target.timeOfDay === 'evening' || ctx.target.timeOfDay === 'night',
		},
	],
	responseVariants: [
		{
			id: 'resp_greet_formal_1',
			template: 'Captain. Standing by.',
			tones: ['formal', 'professional'],
			condition: (ctx) => ctx.target.isUnion && !ctx.target.isFriendOfCaptain && !ctx.target.hasConflictWithCaptain,
		},
		{
			id: 'resp_greet_formal_2',
			template: 'Captain. Ready for your instructions.',
			tones: ['formal', 'professional'],
			condition: (ctx) => ctx.target.isUnion && !ctx.target.isFriendOfCaptain && !ctx.target.hasConflictWithCaptain,
		},
		{
			id: 'resp_greet_formal_3',
			template: 'Reporting as ordered, Captain. What can I do for you?',
			tones: ['professional'],
			condition: (ctx) => ctx.target.isUnion && !ctx.target.isFriendOfCaptain && !ctx.target.hasConflictWithCaptain,
		},
		{
			id: 'resp_greet_warm_1',
			template: 'Good to hear from you, Captain. How can I help today?',
			tones: ['warm', 'friendly'],
			condition: (ctx) => ctx.target.isFriendOfCaptain || ctx.target.isSpouseOfCaptain,
		},
		{
			id: 'resp_greet_warm_2',
			template: 'Hey, Captain. Always glad to catch you between rotations.',
			tones: ['warm', 'casual'],
			condition: (ctx) => ctx.target.isFriendOfCaptain || ctx.target.isSpouseOfCaptain,
		},
		{
			id: 'resp_greet_tense',
			template: 'Captain. What is it?',
			tones: ['cold', 'defensive', 'irritated'],
			condition: (ctx) => ctx.target.hasConflictWithCaptain,
		},
		{
			id: 'resp_greet_child_1',
			template: 'Hi Captain! Are you driving the ship right now?',
			tones: ['excited', 'casual'],
			condition: (ctx) => isYoungChild(ctx),
		},
		{
			id: 'resp_greet_child_2',
			template: 'Hello Captain! I was just watching the stars through the viewport.',
			tones: ['friendly', 'casual'],
			condition: (ctx) => isYoungChild(ctx) || ctx.target.lifeStage === 'older_child',
		},
		{
			id: 'resp_greet_civilian_1',
			template: 'Hello, Captain. Nice to hear from you.',
			tones: ['casual', 'friendly'],
			condition: (ctx) => ctx.target.isCivilian && isAdult(ctx),
		},
		{
			id: 'resp_greet_civilian_2',
			template: 'Good day, Captain. Hope everything is running smoothly on the command deck.',
			tones: ['friendly'],
			condition: (ctx) => ctx.target.isCivilian && isAdult(ctx),
		},
	],
};

export const ASK_WELLBEING_DEFINITION: DialogueDefinition = {
	intentId: 'ASK_WELLBEING',
	category: 'general',
	title: 'Check wellbeing',
	isAvailable: () => true,
	playerVariants: [
		{
			id: 'wellbeing_standard_1',
			label: 'How are you holding up?',
			template: 'How are you holding up today?',
			tones: ['professional', 'friendly'],
		},
		{
			id: 'wellbeing_standard_2',
			label: 'General check-in',
			template: 'Just checking in on how you are settling in aboard {shipName}.',
			tones: ['warm', 'professional'],
		},
		{
			id: 'wellbeing_warm',
			label: 'How are you doing lately?',
			template: 'How are things going with you lately, {firstName}?',
			tones: ['warm', 'casual'],
			condition: (ctx) => ctx.target.isFriendOfCaptain || ctx.target.isSpouseOfCaptain,
		},
		{
			id: 'wellbeing_child',
			label: 'How are you doing today?',
			template: 'How are you doing today, {firstName}?',
			tones: ['warm'],
			condition: (ctx) => ctx.target.lifeStage !== 'adult',
		},
	],
	responseVariants: [
		{
			id: 'resp_wellbeing_positive_1',
			template: "I'm doing well, Captain. Keeping steady with my routines aboard {shipName}.",
			tones: ['warm', 'friendly', 'professional'],
			condition: (ctx) => ctx.target.captainAffinity >= 0 && isAdult(ctx),
		},
		{
			id: 'resp_wellbeing_positive_2',
			template: 'Feeling sharp and in good spirits, Captain. Morale in our section is solid.',
			tones: ['confident', 'warm'],
			condition: (ctx) => ctx.target.captainAffinity >= 0 && isAdult(ctx),
		},
		{
			id: 'resp_wellbeing_positive_3',
			template: "Can't complain, Captain. It's a busy cycle, but I enjoy the pace.",
			tones: ['casual', 'friendly'],
			condition: (ctx) => ctx.target.captainAffinity >= 0 && isAdult(ctx),
		},
		{
			id: 'resp_wellbeing_strained_1',
			template: "Managing, Captain. Long shifts lately, but nothing I can't handle.",
			tones: ['tired', 'stressed', 'formal'],
			condition: (ctx) => ctx.target.captainAffinity < 0 && isAdult(ctx),
		},
		{
			id: 'resp_wellbeing_strained_2',
			template: 'A bit fatigued from the recent watch cycles, but I remain on duty and focused.',
			tones: ['tired', 'formal'],
			condition: (ctx) => ctx.target.captainAffinity < 0 && isAdult(ctx),
		},
		{
			id: 'resp_wellbeing_child_1',
			template: "I'm doing good! I was looking out the viewport at the star clusters earlier.",
			tones: ['excited', 'casual'],
			condition: (ctx) => ctx.target.lifeStage === 'young_child',
		},
		{
			id: 'resp_wellbeing_child_2',
			template: "I'm having fun! We had an environmental simulation project today.",
			tones: ['excited'],
			condition: (ctx) => ctx.target.lifeStage === 'young_child',
		},
		{
			id: 'resp_wellbeing_teen',
			template: "I'm fine, Captain. Just studying and hanging out around the observation deck.",
			tones: ['casual'],
			condition: (ctx) => ctx.target.lifeStage === 'teenager' || ctx.target.lifeStage === 'older_child',
		},
	],
};

export const END_CONVERSATION_DEFINITION: DialogueDefinition = {
	intentId: 'END_CONVERSATION',
	category: 'general',
	title: 'Dismiss / End transmission',
	isAvailable: () => true,
	playerVariants: [
		{
			id: 'end_formal_1',
			label: 'That will be all',
			template: 'That will be all for now. Dismissed.',
			tones: ['formal'],
			condition: (ctx) => ctx.target.isUnion && isAdult(ctx),
		},
		{
			id: 'end_formal_2',
			label: 'Carry on',
			template: 'Keep up the good work. Carry on.',
			tones: ['professional'],
			condition: (ctx) => ctx.target.isUnion && isAdult(ctx),
		},
		{
			id: 'end_casual',
			label: 'Talk soon',
			template: "I'll let you get back to it. Talk soon.",
			tones: ['casual', 'friendly'],
		},
	],
	responseVariants: [
		{
			id: 'resp_end_formal_1',
			template: 'Aye, Captain. Returning to post.',
			tones: ['formal'],
			condition: (ctx) => ctx.target.isUnion && isAdult(ctx),
		},
		{
			id: 'resp_end_formal_2',
			template: 'Copy that, Captain. Channel closed.',
			tones: ['professional'],
			condition: (ctx) => ctx.target.isUnion && isAdult(ctx),
		},
		{
			id: 'resp_end_casual',
			template: 'Take care, Captain.',
			tones: ['friendly', 'casual'],
		},
	],
};
