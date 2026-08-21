import type { DialogueDefinition } from '../types';
import { isAdult, isYoungChild } from '../conditionEvaluator';

export const GREET_DEFINITION: DialogueDefinition = {
	intentId: 'GREET',
	category: 'general',
	title: 'Greeting',
	isAvailable: () => true,
	playerVariants: [
		{
			id: 'greet_formal',
			label: 'Formal greeting',
			template: '{rankAbbr} {lastName}.',
			tones: ['formal', 'professional'],
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
			id: 'greet_evening',
			label: 'Evening check-in',
			template: 'Good evening, {firstName}.',
			tones: ['casual', 'warm'],
			condition: (ctx) => ctx.target.timeOfDay === 'evening' || ctx.target.timeOfDay === 'night',
		},
	],
	responseVariants: [
		{
			id: 'resp_greet_formal',
			template: 'Captain. Standing by.',
			tones: ['formal', 'professional'],
			condition: (ctx) => ctx.target.isUnion && !ctx.target.isFriendOfCaptain && !ctx.target.hasConflictWithCaptain,
		},
		{
			id: 'resp_greet_warm',
			template: 'Good to hear from you, Captain. How can I help?',
			tones: ['warm', 'friendly'],
			condition: (ctx) => ctx.target.isFriendOfCaptain || ctx.target.isSpouseOfCaptain,
		},
		{
			id: 'resp_greet_tense',
			template: 'Captain. What is it?',
			tones: ['cold', 'defensive', 'irritated'],
			condition: (ctx) => ctx.target.hasConflictWithCaptain,
		},
		{
			id: 'resp_greet_child',
			template: 'Hi Captain! Are you driving the ship right now?',
			tones: ['excited', 'casual'],
			condition: (ctx) => isYoungChild(ctx),
		},
		{
			id: 'resp_greet_civilian',
			template: 'Hello, Captain. Nice to hear from you.',
			tones: ['casual', 'friendly'],
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
			id: 'wellbeing_standard',
			label: 'How are you holding up?',
			template: 'How are you holding up today?',
			tones: ['professional', 'friendly'],
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
			id: 'resp_wellbeing_positive',
			template: "I'm doing well, Captain. Keeping steady with my routines aboard {shipName}.",
			tones: ['warm', 'friendly', 'professional'],
			condition: (ctx) => ctx.target.captainAffinity >= 0 && isAdult(ctx),
		},
		{
			id: 'resp_wellbeing_strained',
			template: "Managing, Captain. Long shifts lately, but nothing I can't handle.",
			tones: ['tired', 'stressed', 'formal'],
			condition: (ctx) => ctx.target.captainAffinity < 0 && isAdult(ctx),
		},
		{
			id: 'resp_wellbeing_child',
			template: "I'm doing good! I was looking out the viewport at the stars earlier.",
			tones: ['excited', 'casual'],
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
			id: 'end_formal',
			label: 'That will be all',
			template: 'That will be all for now. Dismissed.',
			tones: ['formal'],
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
			id: 'resp_end_formal',
			template: 'Aye, Captain. Returning to post.',
			tones: ['formal'],
			condition: (ctx) => ctx.target.isUnion && isAdult(ctx),
		},
		{
			id: 'resp_end_casual',
			template: 'Take care, Captain.',
			tones: ['friendly', 'casual'],
		},
	],
};