/**
 * Lightweight foundation integrity checks for the personnel domain.
 * Import from tools/tests or call during development — not used at runtime by the UI.
 */
import { CORE_ATTRIBUTE_IDS } from './attributes';
import { COMMAND_APPOINTMENT_IDS, COMMAND_APPOINTMENTS } from './commandAppointments';
import { DIVISION_IDS, DIVISIONS } from './divisions';
import { POSITION_IDS, POSITIONS, SENIOR_STAFF_POSITION_IDS } from './positions';
import { RANK_IDS, RANKS } from './ranks';
import { PROFESSIONAL_SKILL_IDS } from './skills';
import { SPECIES_IDS, SPECIES } from './species';
import { SETTING } from '../../config/setting';

export interface PersonnelFoundationReport {
	ok: boolean;
	errors: string[];
	summary: {
		universe: string;
		organisation: string;
		rankCount: number;
		divisionCount: number;
		positionCount: number;
		speciesCount: number;
		attributeCount: number;
		skillCount: number;
		seniorStaffSlotCount: number;
		secondOfficerIsAppointment: boolean;
	};
}

export function verifyPersonnelFoundation(): PersonnelFoundationReport {
	const errors: string[] = [];

	if (SETTING.universe !== 'The Orville') {
		errors.push('Setting universe must be The Orville.');
	}
	if (SETTING.organisation !== 'Planetary Union') {
		errors.push('Organisation must be Planetary Union.');
	}

	if (RANK_IDS.length !== 6) {
		errors.push(`Expected exactly 6 ranks, found ${RANK_IDS.length}.`);
	}
	if ((RANK_IDS as readonly string[]).includes('lieutenant_jg')) {
		errors.push('Lieutenant Junior Grade must not exist.');
	}
	if (!RANKS.captain || RANKS.captain.eligibleForShipCrewGeneration !== false) {
		errors.push('Captain must not be eligible for normal ship crew generation.');
	}

	if (CORE_ATTRIBUTE_IDS.length !== 6) {
		errors.push(`Expected 6 core attributes, found ${CORE_ATTRIBUTE_IDS.length}.`);
	}
	if ((CORE_ATTRIBUTE_IDS as readonly string[]).includes('strength')) {
		errors.push('Use Physical, not Strength.');
	}

	if (PROFESSIONAL_SKILL_IDS.length !== 8) {
		errors.push(`Expected 8 professional skills, found ${PROFESSIONAL_SKILL_IDS.length}.`);
	}
	if (!(PROFESSIONAL_SKILL_IDS as readonly string[]).includes('combat')) {
		errors.push('Combat must be a professional skill.');
	}
	if ((PROFESSIONAL_SKILL_IDS as readonly string[]).includes('security')) {
		errors.push('Security must remain a division, not a skill.');
	}

	for (const divisionId of DIVISION_IDS) {
		const division = DIVISIONS[divisionId];
		for (const positionId of division.positionIds) {
			if (!(POSITION_IDS as readonly string[]).includes(positionId)) {
				errors.push(`Division ${divisionId} references unknown position ${positionId}.`);
			}
		}
	}

	for (const positionId of POSITION_IDS) {
		const position = POSITIONS[positionId];
		if (!(DIVISION_IDS as readonly string[]).includes(position.divisionId)) {
			errors.push(`Position ${positionId} references unknown division ${position.divisionId}.`);
		}
	}

	if (!COMMAND_APPOINTMENT_IDS.includes('second_officer')) {
		errors.push('Second Officer command appointment missing.');
	}
	if (!COMMAND_APPOINTMENTS.second_officer.allowsConcurrentDepartmentalPosition) {
		errors.push('Second Officer must allow concurrent departmental position.');
	}
	if ((POSITION_IDS as readonly string[]).includes('second_officer')) {
		errors.push('Second Officer must not be a departmental position.');
	}

	for (const speciesId of SPECIES_IDS) {
		const species = SPECIES[speciesId];
		if (species.attributeModifiers.length > 0 || species.skillModifiers.length > 0) {
			// Allowed once designed; foundation expects empty until balancing.
		}
	}

	const requiredSpecies = [...SPECIES_IDS] as const;
	for (const id of requiredSpecies) {
		if (!SPECIES[id]) {
			errors.push(`Required species missing: ${id}`);
		}
	}

	if (SPECIES_IDS.length < 10) {
		errors.push(`Expected at least 10 species, found ${SPECIES_IDS.length}.`);
	}

	if (SENIOR_STAFF_POSITION_IDS.length !== 6) {
		errors.push(`Expected 6 senior staff positions, found ${SENIOR_STAFF_POSITION_IDS.length}.`);
	}

	return {
		ok: errors.length === 0,
		errors,
		summary: {
			universe: SETTING.universe,
			organisation: SETTING.organisation,
			rankCount: RANK_IDS.length,
			divisionCount: DIVISION_IDS.length,
			positionCount: POSITION_IDS.length,
			speciesCount: SPECIES_IDS.length,
			attributeCount: CORE_ATTRIBUTE_IDS.length,
			skillCount: PROFESSIONAL_SKILL_IDS.length,
			seniorStaffSlotCount: SENIOR_STAFF_POSITION_IDS.length,
			secondOfficerIsAppointment: COMMAND_APPOINTMENTS.second_officer.allowsConcurrentDepartmentalPosition,
		},
	};
}
