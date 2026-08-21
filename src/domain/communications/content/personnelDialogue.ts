import type { DialogueDefinition } from '../types';
import { isAdult } from '../conditionEvaluator';

export const ASK_ABOUT_PERSON_DEFINITION: DialogueDefinition = {
	intentId: 'ASK_ABOUT_PERSON',
	category: 'personnel',
	title: 'Inquire about a colleague...',
	targetPartyRequired: true,
	isAvailable: (ctx) => isAdult(ctx) && ctx.target.thirdPartyCandidates.length > 0,
	playerVariants: [
		{
			id: 'ask_person_general',
			label: 'How is {personTitleName}?',
			template: 'How are things with {personTitleName}?',
			tones: ['professional', 'friendly'],
		},
	],
	responseVariants: [
		{
			id: 'resp_person_superior',
			template: '{personTitleName} is a demanding but fair leader. Sets high standards for our division and keeps us focused.',
			tones: ['respectful', 'formal'],
			condition: (_ctx, targetParty) => Boolean(targetParty?.isDirectSuperior),
		},
		{
			id: 'resp_person_subordinate_good',
			template: '{personTitleName} has been performing very well. Reliable, proactive, and improving with every watch.',
			tones: ['proud', 'professional'],
			condition: (_ctx, targetParty) => Boolean(targetParty?.isDirectSubordinate && targetParty.affinity >= 0),
		},
		{
			id: 'resp_person_subordinate_developing',
			template: '{personTitleName} is still learning the ropes, but showing positive effort. I am keeping a supportive eye on their work.',
			tones: ['concerned', 'professional'],
			condition: (_ctx, targetParty) => Boolean(targetParty?.isDirectSubordinate && targetParty.affinity < 0),
		},
		{
			id: 'resp_person_friend',
			template: '{personName} and I get along great. Always good to share a shift and catch up off-duty.',
			tones: ['warm', 'friendly'],
			condition: (_ctx, targetParty) => Boolean(targetParty?.isFriend),
		},
		{
			id: 'resp_person_rival',
			template: 'Professionally, {personTitleName} is capable. Personally, we do not always see eye to eye, but we maintain duty standards.',
			tones: ['cold', 'professional'],
			condition: (_ctx, targetParty) => Boolean(targetParty?.isRival),
		},
		{
			id: 'resp_person_spouse',
			template: '{personName} and I are doing well. Working together on the same vessel has been a positive experience for us.',
			tones: ['affectionate', 'warm'],
			condition: (_ctx, targetParty) => Boolean(targetParty?.isSpouse),
		},
		{
			id: 'resp_person_colleague',
			template: '{personTitleName} is a solid teammate in our section. Dependable and easy to coordinate with.',
			tones: ['professional', 'friendly'],
			condition: (_ctx, targetParty) => Boolean(targetParty?.isDepartmentColleague || targetParty?.isSeniorStaffColleague),
		},
		{
			id: 'resp_person_fallback',
			template: 'Everything seems fine with {personTitleName} as far as I am aware.',
			tones: ['casual'],
		},
	],
};