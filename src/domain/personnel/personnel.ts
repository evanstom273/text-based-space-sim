import type { CoreAttributeScores } from './attributes';
import type { CommandAppointmentId } from './commandAppointments';
import { PERSONNEL_SCHEMA_VERSION } from './constants';
import type { DivisionId } from './divisions';
import type { StatModifier } from './modifiers';
import type { PositionId } from './positions';
import type { RankId } from './ranks';
import type { ProfessionalSkillScores } from './skills';
import type { SpeciesId } from './species';

export type PersonnelOrigin = 'generated' | 'player_captain' | 'canon';

export type PersonnelStatus =
	| 'active'
	| 'away'
	| 'injured'
	| 'incapacitated'
	| 'deceased'
	| 'transferred'
	| 'missing';

export type PersonnelGender = 'female' | 'male' | 'nonbinary' | 'unspecified' | 'other';

export interface PersonnelIdentity {
	firstName: string;
	lastName: string;
	/** Optional middle / additional name. */
	middleName?: string;
	/** Override when display form differs from first + last. */
	displayNameOverride?: string;
}

export interface PersonnelServiceRecord {
	/** Planetary Union service number / ID if assigned. */
	serviceNumber?: string;
	/** Absolute ship day of assignment to current vessel, if known. */
	assignedAbsoluteDay?: number;
	/** Free-form service notes for future systems. */
	notes?: string;
	/** Prior postings / history placeholders. */
	priorAssignments: string[];
}

/**
 * Canonical personnel record.
 * Used by crew, future Captain creation, senior staff, and canon characters.
 *
 * Rank, Division, Position, and Command Appointment are independent fields.
 */
export interface PersonnelRecord {
	schemaVersion: typeof PERSONNEL_SCHEMA_VERSION;
	id: string;
	identity: PersonnelIdentity;
	speciesId: SpeciesId;
	gender: PersonnelGender;
	/** ISO date string (YYYY-MM-DD) in ship/universe calendar context when known. */
	dateOfBirth?: string;
	/** Derived or stored age in years; optional while DOB unresolved. */
	ageYears?: number;
	rankId: RankId;
	divisionId: DivisionId;
	/** Primary departmental position. */
	positionId: PositionId;
	/** Optional command appointment (e.g. Second Officer) held in addition to position. */
	commandAppointmentId: CommandAppointmentId | null;
	/** Base 0–10 attribute scores (modifiers tracked separately). */
	baseAttributes: CoreAttributeScores;
	/** Base 0–10 skill scores (modifiers tracked separately). */
	baseSkills: ProfessionalSkillScores;
	/**
	 * Explicit modifier sources attached to this person.
	 * Species/division/position definition modifiers are resolved at evaluation
	 * time from domain data; individual overrides and temporary effects live here.
	 */
	modifiers: StatModifier[];
	/** Individual trait IDs (not species biology). Catalogue empty for now. */
	traitIds: string[];
	service: PersonnelServiceRecord;
	status: PersonnelStatus;
	origin: PersonnelOrigin;
	/** Optional canon character key for future Orville canon integration. */
	canonCharacterId?: string;
	createdAt: number;
	updatedAt: number;
}

export interface CreatePersonnelInput {
	id: string;
	identity: PersonnelIdentity;
	speciesId: SpeciesId;
	gender?: PersonnelGender;
	dateOfBirth?: string;
	ageYears?: number;
	rankId: RankId;
	divisionId: DivisionId;
	positionId: PositionId;
	commandAppointmentId?: CommandAppointmentId | null;
	baseAttributes: CoreAttributeScores;
	baseSkills: ProfessionalSkillScores;
	modifiers?: StatModifier[];
	traitIds?: string[];
	service?: Partial<PersonnelServiceRecord>;
	status?: PersonnelStatus;
	origin?: PersonnelOrigin;
	canonCharacterId?: string;
}

export function formatPersonnelDisplayName(identity: PersonnelIdentity): string {
	if (identity.displayNameOverride?.trim()) {
		return identity.displayNameOverride.trim();
	}

	const parts = [identity.firstName, identity.middleName, identity.lastName]
		.map((part) => part?.trim())
		.filter((part): part is string => Boolean(part));

	return parts.join(' ');
}

export function createPersonnelRecord(input: CreatePersonnelInput): PersonnelRecord {
	const now = Date.now();

	return {
		schemaVersion: PERSONNEL_SCHEMA_VERSION,
		id: input.id,
		identity: input.identity,
		speciesId: input.speciesId,
		gender: input.gender ?? 'unspecified',
		dateOfBirth: input.dateOfBirth,
		ageYears: input.ageYears,
		rankId: input.rankId,
		divisionId: input.divisionId,
		positionId: input.positionId,
		commandAppointmentId: input.commandAppointmentId ?? null,
		baseAttributes: { ...input.baseAttributes },
		baseSkills: { ...input.baseSkills },
		modifiers: input.modifiers ? [...input.modifiers] : [],
		traitIds: input.traitIds ? [...input.traitIds] : [],
		service: {
			serviceNumber: input.service?.serviceNumber,
			assignedAbsoluteDay: input.service?.assignedAbsoluteDay,
			notes: input.service?.notes,
			priorAssignments: input.service?.priorAssignments
				? [...input.service.priorAssignments]
				: [],
		},
		status: input.status ?? 'active',
		origin: input.origin ?? 'generated',
		canonCharacterId: input.canonCharacterId,
		createdAt: now,
		updatedAt: now,
	};
}
