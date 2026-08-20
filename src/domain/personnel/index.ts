export {
	SETTING,
	type SettingIdentity,
} from '../../config/setting';

export {
	STAT_BASE_MIN,
	STAT_BASE_MAX,
	MODIFIER_MIN,
	MODIFIER_MAX,
	EFFECTIVE_SOFT_CLAMP_MIN,
	EFFECTIVE_SOFT_CLAMP_MAX,
	PERSONNEL_SCHEMA_VERSION,
	type ModifierDelta,
} from './constants';

export {
	CORE_ATTRIBUTE_IDS,
	CORE_ATTRIBUTES,
	createEmptyAttributeScores,
	isCoreAttributeId,
	type CoreAttributeId,
	type CoreAttributeDefinition,
	type CoreAttributeScores,
} from './attributes';

export {
	PROFESSIONAL_SKILL_IDS,
	PROFESSIONAL_SKILLS,
	createEmptySkillScores,
	isProfessionalSkillId,
	type ProfessionalSkillId,
	type ProfessionalSkillDefinition,
	type ProfessionalSkillScores,
} from './skills';

export {
	RANK_IDS,
	RANKS,
	RANK_LIST,
	getRank,
	isRankId,
	formatRankName,
	type RankId,
	type RankDefinition,
} from './ranks';

export {
	DIVISION_IDS,
	DIVISIONS,
	DIVISION_LIST,
	getDivision,
	isDivisionId,
	type DivisionId,
	type DivisionDefinition,
} from './divisions';

export {
	POSITION_IDS,
	POSITIONS,
	POSITION_LIST,
	SENIOR_STAFF_POSITION_IDS,
	getPosition,
	isPositionId,
	getPositionsForDivision,
	type PositionId,
	type PositionDefinition,
} from './positions';

export {
	COMMAND_APPOINTMENT_IDS,
	COMMAND_APPOINTMENTS,
	COMMAND_APPOINTMENT_LIST,
	getCommandAppointment,
	isCommandAppointmentId,
	type CommandAppointmentId,
	type CommandAppointmentDefinition,
} from './commandAppointments';

export {
	SPECIES_IDS,
	SPECIES,
	SPECIES_LIST,
	getSpecies,
	isSpeciesId,
	getUnionCrewEligibleSpecies,
	type SpeciesId,
	type SpeciesDefinition,
	type SpeciesAttributeModifierSpec,
	type SpeciesSkillModifierSpec,
} from './species';

export {
	createEmptyModifierSet,
	isModifierDelta,
	clampToModifierDelta,
	sumModifierDeltas,
	filterModifiersForTarget,
	type ModifierSourceKind,
	type ModifierTargetKind,
	type StatModifier,
	type ModifierSet,
} from './modifiers';

export {
	TRAIT_CATALOGUE,
	getTraitDefinition,
	type TraitDefinition,
	type TraitModifierSpec,
} from './traits';

export {
	createPersonnelRecord,
	formatPersonnelDisplayName,
	type PersonnelRecord,
	type PersonnelIdentity,
	type PersonnelServiceRecord,
	type PersonnelOrigin,
	type PersonnelStatus,
	type PersonnelGender,
	type CreatePersonnelInput,
} from './personnel';

export {
	getEffectiveAttributeBreakdown,
	getEffectiveSkillBreakdown,
	getEffectiveAttribute,
	getEffectiveSkill,
	getAllEffectiveAttributes,
	getAllEffectiveSkills,
	clampStatForDisplay,
	clampStatForCheck,
	clampBaseStat,
	type EffectiveStatBreakdown,
} from './effectiveValues';

export {
	formatModifierDelta,
	formatStatWithModifier,
	formatStatLine,
	formatPersonnelTitleLine,
	formatPersonnelSummary,
} from './display';

export {
	INITIAL_SENIOR_STAFF_SLOTS,
	createEmptyCrewRoster,
	findPersonnelById,
	upsertPersonnel,
	type SeniorStaffState,
	type CrewRosterState,
} from './roster';

export {
	verifyPersonnelFoundation,
	type PersonnelFoundationReport,
} from './verifyFoundation';

export {
	ALLOCATION_STAT_MIN,
	ALLOCATION_STAT_MAX,
	ALLOCATION_STAT_DEFAULT,
	CAPTAIN_ATTRIBUTE_POINT_POOL,
	CAPTAIN_SKILL_POINT_POOL,
	createDefaultAttributeAllocation,
	createDefaultSkillAllocation,
	getRemainingAllocationPoints,
	canIncreaseAllocation,
	canDecreaseAllocation,
	isAllocationComplete,
	increaseAttribute,
	decreaseAttribute,
	increaseSkill,
	decreaseSkill,
	randomiseAttributeAllocation,
	randomiseSkillAllocation,
} from './statAllocation';

export {
	SENIOR_STAFF_SELECTION_POSITIONS,
	generateSeniorStaffCandidate,
	createCaptainPersonnel,
} from './seniorStaffGenerator';

export {
	generatePersonnelName,
	pickGenderForSpecies,
	formatGenderLabel,
} from './names';
