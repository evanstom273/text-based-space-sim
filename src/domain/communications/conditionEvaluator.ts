import type { DialogueContext } from './types';

export function isAdult(context: DialogueContext): boolean {
	return context.target.lifeStage === 'adult';
}

export function isChildOrTeen(context: DialogueContext): boolean {
	return context.target.lifeStage !== 'adult';
}

export function isYoungChild(context: DialogueContext): boolean {
	return context.target.lifeStage === 'young_child';
}

export function isUnionOfficer(context: DialogueContext): boolean {
	return context.target.isUnion && isAdult(context);
}

export function isCivilian(context: DialogueContext): boolean {
	return context.target.isCivilian;
}

export function isSeniorStaff(context: DialogueContext): boolean {
	return context.target.isSeniorStaff && isAdult(context);
}

export function isDepartmentChief(context: DialogueContext): boolean {
	return context.target.isDepartmentChief;
}

export function isFirstOfficer(context: DialogueContext): boolean {
	return context.target.isFirstOfficer;
}

export function hasSpouse(context: DialogueContext): boolean {
	return Boolean(context.target.spouse);
}

export function hasChildren(context: DialogueContext): boolean {
	return context.target.children.length > 0;
}

export function hasFamily(context: DialogueContext): boolean {
	return (
		Boolean(context.target.spouse) ||
		context.target.children.length > 0 ||
		context.target.parents.length > 0 ||
		context.target.siblings.length > 0
	);
}

export function hasDirectSuperior(context: DialogueContext): boolean {
	return Boolean(context.target.directSuperior || context.target.departmentChief);
}

export function hasDirectSubordinates(context: DialogueContext): boolean {
	return context.target.directSubordinates.length > 0;
}

export function isBirthdayToday(context: DialogueContext): boolean {
	return context.target.isBirthdayToday;
}

export function isSpouseOfCaptain(context: DialogueContext): boolean {
	return context.target.isSpouseOfCaptain;
}

export function isChildOfCaptain(context: DialogueContext): boolean {
	return context.target.isChildOfCaptain;
}

export function isFriendOfCaptain(context: DialogueContext): boolean {
	return context.target.isFriendOfCaptain;
}

export function isRivalOfCaptain(context: DialogueContext): boolean {
	return context.target.isRivalOfCaptain;
}
