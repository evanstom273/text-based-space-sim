import type { DialogueDefinition } from '../types';
import { hasChildren, hasFamily, hasSpouse, isAdult } from '../conditionEvaluator';

export const ASK_ABOUT_SPOUSE_DEFINITION: DialogueDefinition = {
	intentId: 'ASK_ABOUT_SPOUSE',
	category: 'family_romantic',
	title: 'Ask about partner',
	isAvailable: (ctx) => hasSpouse(ctx) && isAdult(ctx),
	playerVariants: [
		{
			id: 'ask_spouse_friendly',
			label: 'How is your partner?',
			template: 'How are things with {spouseName} lately?',
			tones: ['warm', 'friendly'],
		},
	],
	responseVariants: [
		{
			id: 'resp_spouse_good',
			template: '{spouseName} is doing great. We are managing to find time together between our shipboard duties.',
			tones: ['warm', 'affectionate'],
			condition: (ctx) => Boolean(ctx.target.spouse),
		},
	],
};

export const ASK_ABOUT_CHILDREN_DEFINITION: DialogueDefinition = {
	intentId: 'ASK_ABOUT_CHILDREN',
	category: 'family_romantic',
	title: 'Ask about children',
	isAvailable: (ctx) => hasChildren(ctx) && isAdult(ctx),
	playerVariants: [
		{
			id: 'ask_children_general',
			label: 'How are the children?',
			template: 'How are the kids adjusting to life aboard the vessel?',
			tones: ['warm', 'concerned'],
			condition: (ctx) => ctx.target.children.length > 1,
		},
		{
			id: 'ask_child_single',
			label: 'How is your child?',
			template: 'How is {childName} doing with life aboard ship?',
			tones: ['warm'],
			condition: (ctx) => ctx.target.children.length === 1,
		},
	],
	responseVariants: [
		{
			id: 'resp_children_fine',
			template: 'They are doing wonderfully. Finding plenty of activities and making friends among the crew families.',
			tones: ['proud', 'warm'],
			condition: (ctx) => ctx.target.children.length > 1,
		},
		{
			id: 'resp_child_single_fine',
			template: '{childName} is settling in really well. Fascinated by everything happening on the ship.',
			tones: ['warm', 'proud'],
			condition: (ctx) => ctx.target.children.length === 1,
		},
	],
};

export const ASK_ABOUT_FAMILY_DEFINITION: DialogueDefinition = {
	intentId: 'ASK_ABOUT_FAMILY',
	category: 'family_romantic',
	title: 'Ask about family',
	isAvailable: (ctx) => hasFamily(ctx) && isAdult(ctx),
	playerVariants: [
		{
			id: 'ask_family_general',
			label: 'Family check-in',
			template: 'How is your family finding life aboard {shipName}?',
			tones: ['warm', 'friendly'],
		},
	],
	responseVariants: [
		{
			id: 'resp_family_settled',
			template: 'Everyone is settled in nicely. Having our family close while serving aboard makes all the difference.',
			tones: ['warm', 'proud'],
		},
	],
};

export const ASK_ABOUT_FRIENDS_DEFINITION: DialogueDefinition = {
	intentId: 'ASK_ABOUT_FRIENDS',
	category: 'family_romantic',
	title: 'Social life & friends',
	isAvailable: (ctx) => isAdult(ctx),
	playerVariants: [
		{
			id: 'ask_friends_general',
			label: 'Social connections',
			template: 'Are you finding good camaraderie and downtime with colleagues off-shift?',
			tones: ['friendly', 'casual'],
		},
	],
	responseVariants: [
		{
			id: 'resp_friends_plenty',
			template: 'Definitely. The mess hall and recreational lounges have a great community spirit.',
			tones: ['friendly', 'warm'],
		},
	],
};