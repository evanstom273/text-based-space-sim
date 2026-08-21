import { createEmptyAttributeScores, type CoreAttributeScores } from './attributes';
import {
	GAME_START_ABSOLUTE_DAY,
	buildDateOfBirthForAge,
	getAgeYearsOnAbsoluteDay,
} from './age';
import type { CivilianRoleId } from './civilianRoles';
import { generatePersonnelName, pickGenderForSpecies } from './names';
import {
	createPersonnelRecord,
	type PersonnelGender,
	type PersonnelRecord,
} from './personnel';
import { getPosition, type PositionId } from './positions';
import { validateShipPopulation } from './populationValidation';
import type { RankId } from './ranks';
import {
	canBeBiologicalParentOf,
	hasRelationship,
	linkBidirectionalRelationship,
	type PersonnelRelationship,
} from './relationships';
import {
	createEmptyCrewRoster,
	findPersonnelById,
	sanitizeFamilyRelationships,
	type CrewRosterState,
} from './roster';
import { createEmptySkillScores, type ProfessionalSkillScores } from './skills';
import { getUnionCrewEligibleSpecies, type SpeciesId } from './species';

const JUNIOR_POSITION_WEIGHTS: ReadonlyArray<{ positionId: PositionId; weight: number }> = [
	{ positionId: 'command_officer', weight: 6 },
	{ positionId: 'engineer', weight: 11 },
	{ positionId: 'security_officer', weight: 10 },
	{ positionId: 'medical_officer', weight: 5 },
	{ positionId: 'nurse', weight: 4 },
	{ positionId: 'science_officer', weight: 8 },
];

const JUNIOR_RANK_WEIGHTS: ReadonlyArray<{ rankId: RankId; weight: number }> = [
	{ rankId: 'ensign', weight: 48 },
	{ rankId: 'lieutenant', weight: 38 },
	{ rankId: 'lieutenant_commander', weight: 12 },
	{ rankId: 'commander', weight: 2 },
];

function randomInt(min: number, max: number): number {
	return min + Math.floor(Math.random() * (max - min + 1));
}

function chance(probability: number): boolean {
	return Math.random() < probability;
}

function pickWeighted<T extends Record<string, unknown>>(
	items: ReadonlyArray<T & { weight: number }>,
): T {
	const total = items.reduce((sum, item) => sum + item.weight, 0);
	let roll = Math.random() * total;
	for (const item of items) {
		roll -= item.weight;
		if (roll <= 0) return item;
	}
	return items[items.length - 1] as T;
}

function pickRandom<T>(items: readonly T[]): T {
	return items[Math.floor(Math.random() * items.length)] as T;
}

function shuffleInPlace<T>(items: T[]): T[] {
	for (let index = items.length - 1; index > 0; index -= 1) {
		const swap = Math.floor(Math.random() * (index + 1));
		const current = items[index] as T;
		items[index] = items[swap] as T;
		items[swap] = current;
	}
	return items;
}

function createId(prefix: string): string {
	return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function pickSpeciesForCrew(): SpeciesId {
	const eligible = getUnionCrewEligibleSpecies();
	return pickWeighted(
		eligible.map((species) => ({
			speciesId: species.id,
			weight: Math.max(1, species.unionCrewGenerationWeight),
		})),
	).speciesId;
}

function rollJuniorStats(positionId: PositionId): {
	attributes: CoreAttributeScores;
	skills: ProfessionalSkillScores;
} {
	const attributes = createEmptyAttributeScores(5);
	const skills = createEmptySkillScores(4);
	(Object.keys(attributes) as Array<keyof CoreAttributeScores>).forEach((id) => {
		attributes[id] = randomInt(3, 7);
	});
	(Object.keys(skills) as Array<keyof ProfessionalSkillScores>).forEach((id) => {
		skills[id] = randomInt(2, 6);
	});

	const boosts: Partial<Record<PositionId, Array<keyof ProfessionalSkillScores>>> = {
		engineer: ['engineering', 'science'],
		security_officer: ['combat', 'tactical'],
		medical_officer: ['medicine', 'science'],
		nurse: ['medicine'],
		science_officer: ['science', 'engineering'],
		command_officer: ['command', 'diplomacy', 'tactical'],
	};
	for (const skillId of boosts[positionId] ?? []) {
		skills[skillId] = randomInt(5, 8);
	}
	return { attributes, skills };
}

function ensureDateOfBirth(person: PersonnelRecord, fallbackAge: number): PersonnelRecord {
	const personnelKind = person.personnelKind ?? 'union';
	if (person.dateOfBirth) {
		return {
			...person,
			personnelKind,
			civilianRoleId: person.civilianRoleId ?? null,
			ageYears: getAgeYearsOnAbsoluteDay(person.dateOfBirth, GAME_START_ABSOLUTE_DAY),
			updatedAt: Date.now(),
		};
	}
	const ageYears = person.ageYears ?? fallbackAge;
	return {
		...person,
		personnelKind,
		civilianRoleId: person.civilianRoleId ?? null,
		ageYears,
		dateOfBirth: buildDateOfBirthForAge(ageYears),
		updatedAt: Date.now(),
	};
}

function createUnionJunior(positionId: PositionId): PersonnelRecord {
	const speciesId = pickSpeciesForCrew();
	const gender = pickGenderForSpecies(speciesId);
	const identity = generatePersonnelName(speciesId, gender);
	const rankId = pickWeighted(JUNIOR_RANK_WEIGHTS).rankId;
	const ageYears = randomInt(22, 48);
	const { attributes, skills } = rollJuniorStats(positionId);
	const position = getPosition(positionId);

	return createPersonnelRecord({
		id: createId(`crew-${positionId}`),
		identity,
		speciesId,
		gender,
		ageYears,
		dateOfBirth: buildDateOfBirthForAge(ageYears),
		personnelKind: 'union',
		rankId,
		divisionId: position.divisionId,
		positionId,
		commandAppointmentId: null,
		baseAttributes: attributes,
		baseSkills: skills,
		origin: 'generated',
		status: 'active',
		service: {
			assignedAbsoluteDay: 0,
			priorAssignments: [],
			serviceNumber: `PU-${randomInt(100000, 999999)}`,
		},
	});
}

function complementaryGender(gender: PersonnelGender): PersonnelGender {
	if (gender === 'female') {
		return chance(0.85) ? 'male' : pickRandom(['female', 'nonbinary'] as const);
	}
	if (gender === 'male') {
		return chance(0.85) ? 'female' : pickRandom(['male', 'nonbinary'] as const);
	}
	return pickRandom(['female', 'male', 'nonbinary'] as const);
}

function createCivilian(input: {
	roleId: CivilianRoleId;
	ageYears: number;
	speciesId: SpeciesId;
	gender: PersonnelGender;
	lastName?: string;
}): PersonnelRecord {
	const identity = generatePersonnelName(input.speciesId, input.gender, {
		lastName: input.lastName,
	});
	const attributes = createEmptyAttributeScores(5);
	const skills = createEmptySkillScores(3);
	(Object.keys(attributes) as Array<keyof CoreAttributeScores>).forEach((id) => {
		attributes[id] = randomInt(2, 7);
	});

	return createPersonnelRecord({
		id: createId(`civilian-${input.roleId}`),
		identity,
		speciesId: input.speciesId,
		gender: input.gender,
		ageYears: input.ageYears,
		dateOfBirth: buildDateOfBirthForAge(input.ageYears),
		personnelKind: 'civilian',
		civilianRoleId: input.roleId,
		rankId: null,
		divisionId: null,
		positionId: null,
		commandAppointmentId: null,
		baseAttributes: attributes,
		baseSkills: skills,
		origin: 'generated',
		status: 'active',
		service: {
			priorAssignments: [],
		},
	});
}

function generateOrdinaryUnionPersonnel(count: number): PersonnelRecord[] {
	const generated: PersonnelRecord[] = [];
	for (let index = 0; index < count; index += 1) {
		generated.push(createUnionJunior(pickWeighted(JUNIOR_POSITION_WEIGHTS).positionId));
	}
	return generated;
}

function findDepartmentChiefId(roster: CrewRosterState, divisionId: string): string | null {
	const chiefByDivision: Record<string, PositionId> = {
		command: 'first_officer',
		engineering: 'chief_engineer',
		security: 'chief_security_officer',
		medical: 'chief_medical_officer',
		science: 'chief_science_officer',
	};
	const chiefPositionId = chiefByDivision[divisionId];
	if (!chiefPositionId) return null;
	return roster.seniorStaff.byPosition[chiefPositionId] ?? null;
}

function buildOrganisationalRelationships(roster: CrewRosterState): PersonnelRelationship[] {
	let relationships = [...roster.relationships];
	const captainId = roster.captainPersonnelId;
	const firstOfficerId = roster.seniorStaff.byPosition.first_officer ?? null;
	const helmsmanId = roster.seniorStaff.byPosition.helmsman ?? null;
	const chiefs = [
		roster.seniorStaff.byPosition.chief_engineer,
		roster.seniorStaff.byPosition.chief_security_officer,
		roster.seniorStaff.byPosition.chief_medical_officer,
		roster.seniorStaff.byPosition.chief_science_officer,
	].filter((id): id is string => Boolean(id));

	if (captainId && firstOfficerId) {
		relationships = linkBidirectionalRelationship(
			relationships,
			firstOfficerId,
			captainId,
			'direct_superior',
		);
	}
	if (firstOfficerId && helmsmanId) {
		relationships = linkBidirectionalRelationship(
			relationships,
			helmsmanId,
			firstOfficerId,
			'direct_superior',
		);
	}
	for (const chiefId of chiefs) {
		if (firstOfficerId) {
			relationships = linkBidirectionalRelationship(
				relationships,
				chiefId,
				firstOfficerId,
				'direct_superior',
			);
		} else if (captainId) {
			relationships = linkBidirectionalRelationship(
				relationships,
				chiefId,
				captainId,
				'direct_superior',
			);
		}
	}

	const seniorIds = [
		captainId,
		firstOfficerId,
		helmsmanId,
		roster.seniorStaff.secondOfficerPersonnelId,
		...chiefs,
	].filter((id): id is string => Boolean(id));

	for (let i = 0; i < seniorIds.length; i += 1) {
		for (let j = i + 1; j < seniorIds.length; j += 1) {
			relationships = linkBidirectionalRelationship(
				relationships,
				seniorIds[i] as string,
				seniorIds[j] as string,
				'senior_staff_colleague',
			);
		}
	}

	for (const person of roster.personnel) {
		if (person.personnelKind !== 'union' || !person.divisionId || !person.positionId) continue;
		if (person.id === captainId || seniorIds.includes(person.id)) continue;

		const chiefId = findDepartmentChiefId(roster, person.divisionId);
		if (chiefId && chiefId !== person.id) {
			relationships = linkBidirectionalRelationship(
				relationships,
				person.id,
				chiefId,
				'direct_superior',
			);
		}

		for (const colleague of roster.personnel) {
			if (colleague.id === person.id) continue;
			if (colleague.personnelKind !== 'union') continue;
			if (colleague.divisionId !== person.divisionId) continue;
			if (hasRelationship(relationships, person.id, colleague.id, 'department_colleague')) {
				continue;
			}
			relationships = linkBidirectionalRelationship(
				relationships,
				person.id,
				colleague.id,
				'department_colleague',
				randomInt(5, 25),
			);
		}
	}

	return relationships;
}

function generateFamiliesAndCivilians(
	roster: CrewRosterState,
	targetCivilians: number,
): { personnel: PersonnelRecord[]; relationships: PersonnelRelationship[] } {
	const extras: PersonnelRecord[] = [];
	let relationships = [...roster.relationships];

	const adultUnion = roster.personnel.filter(
		(person) =>
			person.personnelKind === 'union' &&
			(person.ageYears ?? 0) >= 24 &&
			person.id !== roster.captainPersonnelId,
	);
	shuffleInPlace(adultUnion);

	const familySeedCount = Math.min(
		adultUnion.length,
		randomInt(Math.max(3, Math.floor(targetCivilians * 0.45)), Math.min(8, targetCivilians)),
	);

	for (let index = 0; index < familySeedCount && extras.length < targetCivilians; index += 1) {
		const officer = adultUnion[index];
		if (!officer) break;

		const bondType = chance(0.55) ? 'spouse' : chance(0.6) ? 'partner' : 'dating';
		const shareSurname = bondType === 'spouse' ? chance(0.65) : chance(0.2);
		const spouseAge = Math.max(22, Math.min(70, (officer.ageYears ?? 35) + randomInt(-6, 6)));
		const spouse = createCivilian({
			roleId: 'spouse_partner',
			ageYears: spouseAge,
			speciesId: chance(0.7) ? officer.speciesId : pickSpeciesForCrew(),
			gender: complementaryGender(officer.gender),
			lastName: shareSurname ? officer.identity.lastName : undefined,
		});
		extras.push(spouse);
		relationships = linkBidirectionalRelationship(
			relationships,
			officer.id,
			spouse.id,
			bondType,
			bondType === 'spouse' ? randomInt(70, 95) : randomInt(45, 80),
		);

		const canHaveChildren =
			bondType !== 'dating' &&
			(officer.ageYears ?? 0) >= 28 &&
			spouseAge >= 26 &&
			extras.length < targetCivilians &&
			chance(0.55);

		if (!canHaveChildren) continue;

		const childCount = Math.min(targetCivilians - extras.length, chance(0.65) ? 1 : 2);
		const childSurname = chance(0.7) ? spouse.identity.lastName : officer.identity.lastName;
		const maxChildAge = Math.min(
			17,
			Math.max(1, Math.min(officer.ageYears ?? 35, spouseAge) - 18),
		);
		const childIds: string[] = [];

		for (let childIndex = 0; childIndex < childCount; childIndex += 1) {
			if (maxChildAge < 1) break;
			const childAgeYears = randomInt(1, maxChildAge);
			const childSpecies = chance(0.5) ? officer.speciesId : spouse.speciesId;
			const child = createCivilian({
				roleId: 'child',
				ageYears: childAgeYears,
				speciesId: childSpecies,
				gender: pickGenderForSpecies(childSpecies),
				lastName: childSurname,
			});
			extras.push(child);
			childIds.push(child.id);

			if (
				canBeBiologicalParentOf(officer.ageYears, childAgeYears) &&
				canBeBiologicalParentOf(spouseAge, childAgeYears)
			) {
				relationships = linkBidirectionalRelationship(
					relationships,
					officer.id,
					child.id,
					'parent',
					randomInt(70, 95),
				);
				relationships = linkBidirectionalRelationship(
					relationships,
					spouse.id,
					child.id,
					'parent',
					randomInt(70, 95),
				);
			}
		}

		for (let i = 0; i < childIds.length; i += 1) {
			for (let j = i + 1; j < childIds.length; j += 1) {
				relationships = linkBidirectionalRelationship(
					relationships,
					childIds[i] as string,
					childIds[j] as string,
					'sibling',
					randomInt(40, 80),
				);
			}
		}
	}

	while (extras.length < targetCivilians) {
		const roleId: CivilianRoleId = chance(0.35)
			? 'teacher'
			: chance(0.5)
				? 'civilian_scientist'
				: chance(0.5)
					? 'civilian_specialist'
					: 'dependant';
		const ageRanges: Record<CivilianRoleId, [number, number]> = {
			spouse_partner: [22, 65],
			child: [1, 17],
			dependant: [18, 80],
			civilian_scientist: [28, 70],
			teacher: [24, 65],
			civilian_specialist: [25, 68],
		};
		const [minAge, maxAge] = ageRanges[roleId];
		const speciesId = pickSpeciesForCrew();
		const ageYears = randomInt(minAge, maxAge);
		const resolvedRoleId: CivilianRoleId = ageYears < 18 ? 'child' : roleId;
		extras.push(
			createCivilian({
				roleId: resolvedRoleId,
				ageYears,
				speciesId,
				gender: pickGenderForSpecies(speciesId),
			}),
		);
	}

	return { personnel: extras, relationships };
}

function generateSocialRelationships(roster: CrewRosterState): PersonnelRelationship[] {
	let relationships = [...roster.relationships];
	const adults = roster.personnel.filter((person) => (person.ageYears ?? 0) >= 18);
	shuffleInPlace(adults);

	const friendAttempts = Math.min(40, Math.floor(adults.length * 1.2));
	for (let attempt = 0; attempt < friendAttempts; attempt += 1) {
		const left = pickRandom(adults);
		const right = pickRandom(adults);
		if (!left || !right || left.id === right.id) continue;
		if (hasRelationship(relationships, left.id, right.id, 'spouse')) continue;
		if (hasRelationship(relationships, left.id, right.id, 'partner')) continue;
		if (hasRelationship(relationships, left.id, right.id, 'parent')) continue;
		if (hasRelationship(relationships, left.id, right.id, 'child')) continue;
		if (hasRelationship(relationships, left.id, right.id, 'friend')) continue;
		if (hasRelationship(relationships, left.id, right.id, 'close_friend')) continue;

		const typeId = chance(0.25) ? 'close_friend' : 'friend';
		relationships = linkBidirectionalRelationship(
			relationships,
			left.id,
			right.id,
			typeId,
			typeId === 'close_friend' ? randomInt(55, 85) : randomInt(25, 55),
		);
	}

	const rivalryAttempts = Math.min(8, Math.floor(adults.length / 8));
	for (let attempt = 0; attempt < rivalryAttempts; attempt += 1) {
		const left = pickRandom(adults);
		const right = pickRandom(adults);
		if (!left || !right || left.id === right.id) continue;
		if (hasRelationship(relationships, left.id, right.id, 'spouse')) continue;
		if (hasRelationship(relationships, left.id, right.id, 'friend')) continue;
		const typeId = chance(0.3) ? 'enemy' : 'rival';
		relationships = linkBidirectionalRelationship(
			relationships,
			left.id,
			right.id,
			typeId,
			typeId === 'enemy' ? randomInt(-90, -55) : randomInt(-45, -10),
		);
	}

	return relationships;
}

/**
 * Expand captain + senior staff into a full persistent ship population (~50 extra).
 * Deterministic/code-driven only — no AI. Run once at save creation.
 */
export function populateShipRoster(baseRoster: CrewRosterState): CrewRosterState {
	const withDates: CrewRosterState = {
		...baseRoster,
		relationships: baseRoster.relationships ?? [],
		personnel: baseRoster.personnel.map((person) =>
			ensureDateOfBirth(
				person,
				person.id === baseRoster.captainPersonnelId ? 42 : randomInt(30, 55),
			),
		),
	};

	const unionExtraCount = randomInt(40, 44);
	const civilianCount = Math.max(6, Math.min(10, 50 - unionExtraCount + randomInt(-1, 1)));

	const juniors = generateOrdinaryUnionPersonnel(unionExtraCount);
	let roster: CrewRosterState = {
		...withDates,
		personnel: [...withDates.personnel, ...juniors],
	};

	const family = generateFamiliesAndCivilians(roster, civilianCount);
	roster = {
		...roster,
		personnel: [...roster.personnel, ...family.personnel],
		relationships: family.relationships,
	};

	roster = {
		...roster,
		relationships: buildOrganisationalRelationships(roster),
	};
	roster = {
		...roster,
		relationships: generateSocialRelationships(roster),
	};

	const validation = validateShipPopulation(roster);
	if (!validation.ok) {
		console.warn('Ship population validation warnings:', validation.issues.slice(0, 12));
	}

	return sanitizeFamilyRelationships(roster);
}

export function createPopulatedCrewRoster(baseRoster: CrewRosterState): CrewRosterState {
	if (baseRoster.personnel.length === 0) {
		return createEmptyCrewRoster();
	}
	return populateShipRoster(baseRoster);
}

/**
 * True when the roster still looks like captain + senior staff only
 * (population never applied, or an older save from before ship population).
 */
export function isUnpopulatedSeniorRoster(roster: CrewRosterState): boolean {
	if (roster.personnel.length === 0 || roster.personnel.length > 10) {
		return false;
	}

	const seniorIds = new Set<string>();
	if (roster.captainPersonnelId) {
		seniorIds.add(roster.captainPersonnelId);
	}
	for (const personnelId of Object.values(roster.seniorStaff.byPosition)) {
		if (personnelId) {
			seniorIds.add(personnelId);
		}
	}

	if (seniorIds.size === 0) {
		return false;
	}

	return roster.personnel.every((person) => seniorIds.has(person.id));
}

/**
 * Expand captain/senior-only rosters into a full ship population.
 * Safe to call repeatedly — already-populated rosters are returned unchanged.
 */
export function ensureShipPopulation(roster: CrewRosterState): CrewRosterState {
	if (!isUnpopulatedSeniorRoster(roster)) {
		return {
			...roster,
			relationships: roster.relationships ?? [],
		};
	}
	return createPopulatedCrewRoster({
		...roster,
		relationships: roster.relationships ?? [],
	});
}

export function requirePersonnel(roster: CrewRosterState, personnelId: string): PersonnelRecord {
	const person = findPersonnelById(roster, personnelId);
	if (!person) {
		throw new Error(`Personnel not found: ${personnelId}`);
	}
	return person;
}
