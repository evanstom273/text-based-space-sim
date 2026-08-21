import {
	GAME_START_ABSOLUTE_DAY,
	getAgeYearsOnAbsoluteDay,
	parseDateOfBirth,
} from './age';
import { isCivilianRoleId } from './civilianRoles';
import { isDivisionId } from './divisions';
import { POSITIONS, SENIOR_STAFF_POSITION_IDS, isPositionId } from './positions';
import { isRankId } from './ranks';
import { RELATIONSHIP_TYPES, type RelationshipTypeId } from './relationships';
import type { CrewRosterState } from './roster';

export interface PopulationValidationResult {
	ok: boolean;
	issues: string[];
}

/**
 * Sanity-check a generated ship population before it is persisted.
 */
export function validateShipPopulation(roster: CrewRosterState): PopulationValidationResult {
	const issues: string[] = [];
	const ids = new Set<string>();

	for (const person of roster.personnel) {
		if (ids.has(person.id)) {
			issues.push(`Duplicate personnel id: ${person.id}`);
		}
		ids.add(person.id);

		if (!person.dateOfBirth || !parseDateOfBirth(person.dateOfBirth)) {
			issues.push(`Missing/invalid DOB: ${person.id}`);
		} else {
			const derived = getAgeYearsOnAbsoluteDay(person.dateOfBirth, GAME_START_ABSOLUTE_DAY);
			if (person.ageYears != null && Math.abs(person.ageYears - derived) > 1) {
				issues.push(`Age/DOB mismatch: ${person.id}`);
			}
		}

		if (person.personnelKind === 'civilian') {
			if (person.rankId != null) issues.push(`Civilian has rank: ${person.id}`);
			if (person.divisionId != null) issues.push(`Civilian has division: ${person.id}`);
			if (person.positionId != null) issues.push(`Civilian has position: ${person.id}`);
			if (person.civilianRoleId && !isCivilianRoleId(person.civilianRoleId)) {
				issues.push(`Invalid civilian role: ${person.id}`);
			}
		} else {
			if (!person.rankId || !isRankId(person.rankId)) {
				issues.push(`Union personnel missing/invalid rank: ${person.id}`);
			}
			if (person.rankId === 'admiral') {
				issues.push(`Shipboard admiral generated: ${person.id}`);
			}
			if (person.rankId === 'captain' && person.id !== roster.captainPersonnelId) {
				issues.push(`Extra captain aboard: ${person.id}`);
			}
			if (!person.divisionId || !isDivisionId(person.divisionId)) {
				issues.push(`Union personnel missing/invalid division: ${person.id}`);
			}
			if (!person.positionId || !isPositionId(person.positionId)) {
				issues.push(`Union personnel missing/invalid position: ${person.id}`);
			} else if (
				person.divisionId &&
				POSITIONS[person.positionId].divisionId !== person.divisionId
			) {
				issues.push(`Division/position mismatch: ${person.id}`);
			}
		}
	}

	for (const positionId of SENIOR_STAFF_POSITION_IDS) {
		const holder = roster.seniorStaff.byPosition[positionId];
		if (!holder) continue;
		const matches = roster.personnel.filter((person) => person.positionId === positionId);
		if (matches.length > 1) {
			issues.push(`Multiple holders of senior position ${positionId}`);
		}
	}

	const captains = roster.personnel.filter((person) => person.rankId === 'captain');
	if (captains.length > 1) {
		issues.push('Multiple captains in roster');
	}

	for (const relationship of roster.relationships) {
		if (!ids.has(relationship.fromPersonnelId) || !ids.has(relationship.toPersonnelId)) {
			issues.push(
				`Dangling relationship: ${relationship.fromPersonnelId}>${relationship.typeId}>${relationship.toPersonnelId}`,
			);
			continue;
		}
		if (relationship.fromPersonnelId === relationship.toPersonnelId) {
			issues.push(`Self-relationship: ${relationship.fromPersonnelId} ${relationship.typeId}`);
		}

		const inverse = RELATIONSHIP_TYPES[relationship.typeId as RelationshipTypeId]?.inverseTypeId;
		if (inverse) {
			const hasInverse = roster.relationships.some(
				(entry) =>
					entry.fromPersonnelId === relationship.toPersonnelId &&
					entry.toPersonnelId === relationship.fromPersonnelId &&
					entry.typeId === inverse,
			);
			if (!hasInverse) {
				issues.push(
					`One-way relationship: ${relationship.fromPersonnelId}>${relationship.typeId}>${relationship.toPersonnelId}`,
				);
			}
		}

		if (relationship.typeId === 'parent') {
			const parent = roster.personnel.find((person) => person.id === relationship.fromPersonnelId);
			const child = roster.personnel.find((person) => person.id === relationship.toPersonnelId);
			if (parent && child && (parent.ageYears ?? 0) < (child.ageYears ?? 0) + 16) {
				issues.push(`Implausible parent/child ages: ${parent.id} / ${child.id}`);
			}
		}

		if (relationship.typeId === 'spouse') {
			const alsoFamily = roster.relationships.some(
				(entry) =>
					entry.fromPersonnelId === relationship.fromPersonnelId &&
					entry.toPersonnelId === relationship.toPersonnelId &&
					(entry.typeId === 'child' || entry.typeId === 'parent'),
			);
			if (alsoFamily) {
				issues.push(`Contradictory spouse/parent link: ${relationship.fromPersonnelId}`);
			}
		}
	}

	return { ok: issues.length === 0, issues };
}
