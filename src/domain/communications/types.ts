import type { RelationshipTypeId } from '../personnel/relationships';
import type { PersonnelRecord } from '../personnel/personnel';

export type DialogueCategory =
	| 'general'
	| 'personal'
	| 'duty'
	| 'personnel'
	| 'command'
	| 'relationship'
	| 'family_romantic'
	| 'contextual';

export type DialogueIntentId =
	| 'GREET'
	| 'ASK_WELLBEING'
	| 'ASK_DUTY_STATUS'
	| 'ASK_DEPARTMENT_STATUS'
	| 'ASK_READINESS'
	| 'ASK_WORKLOAD'
	| 'ASK_ABOUT_PERSON'
	| 'ASK_ABOUT_SPOUSE'
	| 'ASK_ABOUT_CHILDREN'
	| 'ASK_ABOUT_FAMILY'
	| 'ASK_ABOUT_FRIENDS'
	| 'ASK_ABOUT_LIFE_ABOARD'
	| 'PRAISE'
	| 'CRITICISE'
	| 'ENCOURAGE'
	| 'APOLOGISE'
	| 'ASK_ADVICE'
	| 'ASK_PROFESSIONAL_OPINION'
	| 'DISCUSS_CONFLICT'
	| 'DISCUSS_RECENT_EVENT'
	| 'WISH_HAPPY_BIRTHDAY'
	| 'EXPRESS_SYMPATHY'
	| 'EXPRESS_CONGRATULATIONS'
	| 'CHILD_TALK_SCHOOL'
	| 'CHILD_TALK_HOBBIES'
	| 'CHILD_TALK_FAMILY'
	| 'CIVILIAN_TALK_WORK'
	| 'CIVILIAN_TALK_LIFE'
	| 'FOLLOW_UP_REASON'
	| 'FOLLOW_UP_ASSISTANCE'
	| 'FOLLOW_UP_SUPPORT'
	| 'END_CONVERSATION';

export type DialogueTone =
	| 'formal'
	| 'professional'
	| 'friendly'
	| 'warm'
	| 'casual'
	| 'affectionate'
	| 'respectful'
	| 'nervous'
	| 'concerned'
	| 'irritated'
	| 'angry'
	| 'cold'
	| 'sad'
	| 'grieving'
	| 'excited'
	| 'proud'
	| 'embarrassed'
	| 'defensive'
	| 'tired'
	| 'confident'
	| 'stressed';

export type LifeStage = 'young_child' | 'older_child' | 'teenager' | 'adult';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface DialogueEffectRelationshipDelta {
	type: 'RELATIONSHIP_DELTA';
	targetId: string;
	amount: number;
	reason?: string;
}

export interface DialogueEffectSetFlag {
	type: 'SET_DIALOGUE_FLAG';
	flag: string;
	value: boolean;
}

export type DialogueEffect = DialogueEffectRelationshipDelta | DialogueEffectSetFlag;

export interface ThirdPartyCandidate {
	person: PersonnelRecord;
	relationshipTypeIds: RelationshipTypeId[];
	primaryRelationshipLabel: string;
	affinity: number;
	isDirectSuperior: boolean;
	isDirectSubordinate: boolean;
	isDepartmentColleague: boolean;
	isSeniorStaffColleague: boolean;
	isSpouse: boolean;
	isChild: boolean;
	isParent: boolean;
	isSibling: boolean;
	isFriend: boolean;
	isRival: boolean;
}

export interface DialogueContext {
	captain: {
		name: string;
		personnelId?: string;
	};
	target: {
		record: PersonnelRecord;
		lifeStage: LifeStage;
		ageYears: number;
		isBirthdayToday: boolean;
		timeOfDay: TimeOfDay;
		shipTimeFormatted: string;
		shipDateFormatted: string;
		isUnion: boolean;
		isCivilian: boolean;
		isSeniorStaff: boolean;
		isDepartmentChief: boolean;
		isFirstOfficer: boolean;
		isSecondOfficer: boolean;
		directSuperior?: PersonnelRecord;
		directSubordinates: PersonnelRecord[];
		departmentChief?: PersonnelRecord;
		firstOfficer?: PersonnelRecord;
		spouse?: PersonnelRecord;
		children: PersonnelRecord[];
		parents: PersonnelRecord[];
		siblings: PersonnelRecord[];
		friends: PersonnelRecord[];
		rivals: PersonnelRecord[];
		captainRelationshipTypeIds: RelationshipTypeId[];
		captainAffinity: number;
		hasConflictWithCaptain: boolean;
		isSpouseOfCaptain: boolean;
		isChildOfCaptain: boolean;
		isParentOfCaptain: boolean;
		isSiblingOfCaptain: boolean;
		isFriendOfCaptain: boolean;
		isRivalOfCaptain: boolean;
		thirdPartyCandidates: ThirdPartyCandidate[];
	};
	vessel: {
		name: string;
		registry: string;
	};
	simulation: {
		absoluteDay: number;
		minutesInDay: number;
	};
	session: {
		exchangeCount: number;
		usedIntentIds: DialogueIntentId[];
		lastTone?: DialogueTone;
		activeFollowUps: DialogueIntentId[];
	};
	history: {
		lastConversationDay?: number;
		totalConversationsCount: number;
		recentPraiseDay?: number;
		recentCriticiseDay?: number;
		flags: Record<string, boolean>;
	};
}

export interface PlayerVariantDefinition {
	id: string;
	label: string;
	template: string;
	tones?: DialogueTone[];
	weight?: number;
	condition?: (context: DialogueContext, targetParty?: ThirdPartyCandidate) => boolean;
}

export interface ResponseVariantDefinition {
	id: string;
	template: string;
	tones: DialogueTone[];
	weight?: number;
	effects?: DialogueEffect[];
	followUpIntentIds?: DialogueIntentId[];
	condition?: (context: DialogueContext, targetParty?: ThirdPartyCandidate) => boolean;
}

export interface DialogueDefinition {
	intentId: DialogueIntentId;
	category: DialogueCategory;
	title: string;
	description?: string;
	isAvailable: (context: DialogueContext) => boolean;
	playerVariants: PlayerVariantDefinition[];
	responseVariants: ResponseVariantDefinition[];
	targetPartyRequired?: boolean;
}

export interface AvailableDialogueOption {
	intentId: DialogueIntentId;
	category: DialogueCategory;
	label: string;
	playerText: string;
	targetParty?: ThirdPartyCandidate;
}

export interface DialogueResolutionResult {
	intentId: DialogueIntentId;
	category: DialogueCategory;
	playerText: string;
	responseText: string;
	selectedTone: DialogueTone;
	templateId: string;
	appliedEffects: DialogueEffect[];
	unlockedFollowUpIntentIds: DialogueIntentId[];
	debugInfo?: {
		tone: DialogueTone;
		templateId: string;
		intentId: DialogueIntentId;
		appliedEffects: DialogueEffect[];
	};
}
