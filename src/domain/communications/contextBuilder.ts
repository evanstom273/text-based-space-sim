import type { CommandProfile } from '../../types/commandProfile';
import {
	getAgeYearsOnAbsoluteDay,
	parseDateOfBirth,
} from '../personnel/age';
import type { PersonnelRecord } from '../personnel/personnel';
import {
	getRelationshipType,
	listRelationshipsFrom,
	type RelationshipTypeId,
} from '../personnel/relationships';
import {
	absoluteDayToCalendar,
	formatShipDate,
} from '../../utils/shipCalendar';
import type {
	DialogueContext,
	LifeStage,
	ThirdPartyCandidate,
	TimeOfDay,
} from './types';

export function calculateLifeStage(ageYears: number): LifeStage {
	if (ageYears < 10) return 'young_child';
	if (ageYears < 15) return 'older_child';
	if (ageYears < 18) return 'teenager';
	return 'adult';
}

export function calculateTimeOfDay(minutesInDay: number): TimeOfDay {
	const hour = Math.floor(minutesInDay / 60);
	if (hour >= 5 && hour < 12) return 'morning';
	if (hour >= 12 && hour < 17) return 'afternoon';
	if (hour >= 17 && hour < 22) return 'evening';
	return 'night';
}

export function isCharacterBirthdayToday(
	dateOfBirth: string | undefined,
	absoluteDay: number,
): boolean {
	if (!dateOfBirth) return false;
	const dob = parseDateOfBirth(dateOfBirth);
	if (!dob) return false;
	const current = absoluteDayToCalendar(absoluteDay);
	return current.monthIndex === dob.monthIndex && current.day === dob.day;
}

export function buildDialogueContext(
	profile: CommandProfile,
	targetPerson: PersonnelRecord,
	absoluteDay: number,
	minutesInDay: number,
	sessionState?: {
		exchangeCount?: number;
		usedIntentIds?: string[];
		activeFollowUps?: string[];
	},
): DialogueContext {
	const crewState = profile.future.crew;
	const roster = crewState?.personnel ?? [];
	const relationships = crewState?.relationships ?? [];
	const communications = profile.future.communications;

	const ageYears = targetPerson.dateOfBirth
		? getAgeYearsOnAbsoluteDay(targetPerson.dateOfBirth, absoluteDay)
		: targetPerson.ageYears ?? 30;

	const lifeStage = calculateLifeStage(ageYears);
	const timeOfDay = calculateTimeOfDay(minutesInDay);
	const isBirthdayToday = isCharacterBirthdayToday(targetPerson.dateOfBirth, absoluteDay);

	const calendar = absoluteDayToCalendar(absoluteDay);
	const shipDateFormatted = formatShipDate(calendar);
	const hours = Math.floor(minutesInDay / 60);
	const mins = minutesInDay % 60;
	const shipTimeFormatted = String(hours).padStart(2, '0') + ':' + String(mins).padStart(2, '0');

	const isUnion = targetPerson.personnelKind === 'union';
	const isCivilian = targetPerson.personnelKind === 'civilian';

	const isFirstOfficer = targetPerson.positionId === 'first_officer';
	const isSecondOfficer = targetPerson.commandAppointmentId === 'second_officer';
	const isDepartmentChief =
		Boolean(targetPerson.positionId) &&
		(targetPerson.positionId?.startsWith('chief_') || targetPerson.positionId === 'chief_medical_officer');

	const isSeniorStaff =
		isFirstOfficer ||
		isSecondOfficer ||
		isDepartmentChief ||
		targetPerson.positionId === 'helmsman';

	const outgoing = listRelationshipsFrom(relationships, targetPerson.id);

	let directSuperior: PersonnelRecord | undefined;
	const directSubordinates: PersonnelRecord[] = [];
	let departmentChief: PersonnelRecord | undefined;
	let firstOfficer: PersonnelRecord | undefined;
	let spouse: PersonnelRecord | undefined;
	const children: PersonnelRecord[] = [];
	const parents: PersonnelRecord[] = [];
	const siblings: PersonnelRecord[] = [];
	const friends: PersonnelRecord[] = [];
	const rivals: PersonnelRecord[] = [];

	const captainId = profile.captain.personnelId;
	const captainRelationshipTypeIds: RelationshipTypeId[] = [];
	let captainAffinity = 0;

	const personMap = new Map<string, PersonnelRecord>();
	for (const p of roster) {
		personMap.set(p.id, p);
		if (p.positionId === 'first_officer') firstOfficer = p;
		if (
			targetPerson.divisionId &&
			p.divisionId === targetPerson.divisionId &&
			(p.positionId?.startsWith('chief_') || p.positionId === 'chief_medical_officer')
		) {
			departmentChief = p;
		}
	}

	for (const edge of outgoing) {
		const other = personMap.get(edge.toPersonnelId);
		if (!other) continue;

		if (other.id === captainId) {
			captainRelationshipTypeIds.push(edge.typeId);
			captainAffinity = edge.affinity;
		}

		switch (edge.typeId) {
			case 'direct_superior':
				directSuperior = other;
				break;
			case 'direct_subordinate':
				directSubordinates.push(other);
				break;
			case 'spouse':
			case 'partner':
			case 'dating':
				if (!spouse) spouse = other;
				break;
			case 'child':
				children.push(other);
				break;
			case 'parent':
				parents.push(other);
				break;
			case 'sibling':
				siblings.push(other);
				break;
			case 'friend':
			case 'close_friend':
				friends.push(other);
				break;
			case 'rival':
			case 'enemy':
				rivals.push(other);
				break;
		}
	}

	const candidateMap = new Map<string, ThirdPartyCandidate>();
	for (const edge of outgoing) {
		const other = personMap.get(edge.toPersonnelId);
		if (!other || other.id === targetPerson.id || (captainId && other.id === captainId)) continue;

		const existing = candidateMap.get(other.id);
		const typeDef = getRelationshipType(edge.typeId);
		if (!existing) {
			candidateMap.set(other.id, {
				person: other,
				relationshipTypeIds: [edge.typeId],
				primaryRelationshipLabel: typeDef.name,
				affinity: edge.affinity,
				isDirectSuperior: edge.typeId === 'direct_superior',
				isDirectSubordinate: edge.typeId === 'direct_subordinate',
				isDepartmentColleague: edge.typeId === 'department_colleague',
				isSeniorStaffColleague: edge.typeId === 'senior_staff_colleague',
				isSpouse: edge.typeId === 'spouse' || edge.typeId === 'partner' || edge.typeId === 'dating',
				isChild: edge.typeId === 'child',
				isParent: edge.typeId === 'parent',
				isSibling: edge.typeId === 'sibling',
				isFriend: edge.typeId === 'friend' || edge.typeId === 'close_friend',
				isRival: edge.typeId === 'rival' || edge.typeId === 'enemy',
			});
		} else {
			existing.relationshipTypeIds.push(edge.typeId);
			if (edge.typeId === 'spouse' || edge.typeId === 'direct_superior') {
				existing.primaryRelationshipLabel = typeDef.name;
			}
		}
	}

	const thirdPartyCandidates = Array.from(candidateMap.values());

	const hasConflictWithCaptain =
		captainRelationshipTypeIds.includes('rival') ||
		captainRelationshipTypeIds.includes('enemy') ||
		captainAffinity < -20;
	const isSpouseOfCaptain =
		captainRelationshipTypeIds.includes('spouse') ||
		captainRelationshipTypeIds.includes('partner') ||
		captainRelationshipTypeIds.includes('dating');
	const isChildOfCaptain = captainRelationshipTypeIds.includes('child');
	const isParentOfCaptain = captainRelationshipTypeIds.includes('parent');
	const isSiblingOfCaptain = captainRelationshipTypeIds.includes('sibling');
	const isFriendOfCaptain =
		captainRelationshipTypeIds.includes('friend') ||
		captainRelationshipTypeIds.includes('close_friend') ||
		captainAffinity >= 30;
	const isRivalOfCaptain =
		captainRelationshipTypeIds.includes('rival') || captainRelationshipTypeIds.includes('enemy');

	const thread = communications?.threads[targetPerson.id];

	return {
		captain: {
			name: profile.captain.name,
			personnelId: profile.captain.personnelId,
		},
		target: {
			record: targetPerson,
			lifeStage,
			ageYears,
			isBirthdayToday,
			timeOfDay,
			shipTimeFormatted,
			shipDateFormatted,
			isUnion,
			isCivilian,
			isSeniorStaff,
			isDepartmentChief,
			isFirstOfficer,
			isSecondOfficer,
			directSuperior,
			directSubordinates,
			departmentChief,
			firstOfficer,
			spouse,
			children,
			parents,
			siblings,
			friends,
			rivals,
			captainRelationshipTypeIds,
			captainAffinity,
			hasConflictWithCaptain,
			isSpouseOfCaptain,
			isChildOfCaptain,
			isParentOfCaptain,
			isSiblingOfCaptain,
			isFriendOfCaptain,
			isRivalOfCaptain,
			thirdPartyCandidates,
		},
		vessel: {
			name: profile.vessel.name,
			registry: profile.vessel.registry,
		},
		simulation: {
			absoluteDay,
			minutesInDay,
		},
		session: {
			exchangeCount: sessionState?.exchangeCount ?? (thread?.messages?.length ? Math.floor(thread.messages.length / 2) : 0),
			usedIntentIds: (sessionState?.usedIntentIds ?? []) as any,
			activeFollowUps: (sessionState?.activeFollowUps ?? []) as any,
		},
		history: {
			totalConversationsCount: thread ? 1 : 0,
			flags: {},
		},
	};
}
