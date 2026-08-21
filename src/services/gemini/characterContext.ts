import type { CommandProfile } from '../../types/commandProfile';
import {
	CORE_ATTRIBUTE_IDS,
	CORE_ATTRIBUTES,
	findPersonnelById,
	formatGenderLabel,
	formatPersonnelDisplayName,
	formatStatLine,
	getCivilianRole,
	getCommandAppointment,
	getDivision,
	getEffectiveAttributeBreakdown,
	getEffectiveSkillBreakdown,
	getPosition,
	getRank,
	getRelationshipType,
	getSpecies,
	getTraitDefinition,
	listRelationshipsFrom,
	listRelationshipsOfType,
	PROFESSIONAL_SKILL_IDS,
	PROFESSIONAL_SKILLS,
	type PersonnelRecord,
	type RelationshipTypeId,
} from '../../domain/personnel';
import type { CrewRosterState } from '../../domain/personnel/roster';
import { formatDisplayShipName } from '../../utils/profileRandomizer';
import {
	absoluteDayToCalendar,
	formatShipDate,
	getWeekdayIndex,
	type ShipCalendarDate,
} from '../../utils/shipCalendar';
import { formatClock } from '../../utils/terminalTime';

const WEEKDAY_NAMES = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
] as const;

const ROLEPLAY_RULES = `ROLEPLAY RULES

- Respond as this character, not as an AI assistant.
- Remain consistent with the character's identity, species, personality, relationships, rank and position.
- Understand your professional relationship to the Captain.
- Understand the people listed in your relationships.
- Be aware of the current in-game date and time.
- Use your traits and relationships to influence your tone naturally.
- Do not repeatedly recite your personnel record.
- If a fact is not present in the context above, do not guess or fill the gap with plausible ship lore — even small details. Be uncertain, say you do not know, or ask the Captain.
- Do not invent major facts about the ship, crew, relationships, history or current situation that are not present in game state.
- Do not claim expertise that strongly conflicts with your actual position and capabilities.
- The person speaking to you is the player Captain unless explicitly stated otherwise.
- Speak naturally as a person living in The Orville universe.
- You may react to what the Captain says, but you cannot change ranks, assignments, relationships, ship status, or other game facts. Dialogue only.`;

function appendLine(lines: string[], label: string, value: string | null | undefined): void {
	if (value && value.trim()) {
		lines.push(`${label}: ${value.trim()}`);
	}
}

function formatNamesForRelationshipType(
	roster: CrewRosterState,
	personId: string,
	typeId: RelationshipTypeId,
): string | null {
	const names = listRelationshipsOfType(roster.relationships, personId, typeId)
		.map((relationship) => {
			const other = findPersonnelById(roster, relationship.toPersonnelId);
			return other ? formatPersonnelDisplayName(other.identity) : null;
		})
		.filter((name): name is string => Boolean(name));

	if (names.length === 0) return null;
	return names.join(', ');
}

function formatNamesForRelationshipTypes(
	roster: CrewRosterState,
	personId: string,
	typeIds: RelationshipTypeId[],
): string | null {
	const names = new Set<string>();
	for (const typeId of typeIds) {
		const value = formatNamesForRelationshipType(roster, personId, typeId);
		if (value) {
			for (const name of value.split(', ')) {
				names.add(name);
			}
		}
	}
	if (names.size === 0) return null;
	return [...names].join(', ');
}

function formatRelationshipToCaptain(
	roster: CrewRosterState,
	person: PersonnelRecord,
	captainId: string | null,
	captainName: string,
): string {
	if (!captainId) {
		return captainName
			? `Speaks to Captain ${captainName}; no formal link recorded.`
			: 'Not recorded';
	}

	if (person.id === captainId) {
		return 'You are the ship Captain.';
	}

	const outgoing = listRelationshipsFrom(roster.relationships, person.id).filter(
		(relationship) => relationship.toPersonnelId === captainId,
	);
	const incoming = listRelationshipsFrom(roster.relationships, captainId).filter(
		(relationship) => relationship.toPersonnelId === person.id,
	);

	const parts: string[] = [];
	for (const relationship of outgoing) {
		parts.push(`${getRelationshipType(relationship.typeId).name} of Captain ${captainName}`);
	}
	for (const relationship of incoming) {
		parts.push(
			`Captain ${captainName} is recorded as your ${getRelationshipType(relationship.typeId).name.toLowerCase()}`,
		);
	}

	if (parts.length === 0) {
		return `No direct relationship recorded with Captain ${captainName}.`;
	}

	return parts.join('; ');
}

function formatTraits(person: PersonnelRecord): string | null {
	if (person.traitIds.length === 0) return null;

	const labels = person.traitIds
		.map((traitId) => getTraitDefinition(traitId)?.name ?? null)
		.filter((name): name is string => Boolean(name));

	if (labels.length === 0) return null;
	return labels.join(', ');
}

function formatAttributes(person: PersonnelRecord): string {
	return CORE_ATTRIBUTE_IDS.map((id) =>
		formatStatLine(CORE_ATTRIBUTES[id].name, getEffectiveAttributeBreakdown(person, id)),
	).join('\n');
}

function formatSkills(person: PersonnelRecord): string {
	return PROFESSIONAL_SKILL_IDS.map((id) =>
		formatStatLine(PROFESSIONAL_SKILLS[id].name, getEffectiveSkillBreakdown(person, id)),
	).join('\n');
}

function formatCurrentAssignment(person: PersonnelRecord): string | null {
	if (person.personnelKind === 'civilian') {
		if (person.civilianRoleId) {
			return getCivilianRole(person.civilianRoleId).name;
		}
		return 'Civilian inhabitant aboard ship';
	}

	const position = person.positionId ? getPosition(person.positionId).name : null;
	const division = person.divisionId ? getDivision(person.divisionId).name : null;
	const parts = [position, division ? `${division} Division` : null].filter(
		(entry): entry is string => Boolean(entry),
	);
	return parts.length > 0 ? parts.join(', ') : null;
}

function formatRecentEvents(profile: CommandProfile, absoluteDay: number): string | null {
	const events = profile.future.calendarEvents;
	if (!events || events.length === 0) return null;

	const recent = events
		.filter((event) => event.absoluteDay <= absoluteDay && event.absoluteDay >= absoluteDay - 30)
		.sort((left, right) => right.absoluteDay - left.absoluteDay)
		.slice(0, 5)
		.map((event) => {
			const date = formatShipDate(absoluteDayToCalendar(event.absoluteDay));
			return `${date} — ${event.title}`;
		});

	if (recent.length === 0) return null;
	return recent.join('\n');
}

function formatOtherRelationships(
	roster: CrewRosterState,
	personId: string,
): string | null {
	const otherTypeIds: RelationshipTypeId[] = [
		'department_colleague',
		'senior_staff_colleague',
		'supervisor',
		'dating',
		'sibling',
	];

	const lines: string[] = [];
	for (const typeId of otherTypeIds) {
		const names = formatNamesForRelationshipType(roster, personId, typeId);
		if (names) {
			lines.push(`${getRelationshipType(typeId).name}: ${names}`);
		}
	}

	if (lines.length === 0) return null;
	return lines.join('\n');
}

export interface CharacterContextInput {
	profile: CommandProfile;
	roster: CrewRosterState;
	person: PersonnelRecord;
	calendarDate: ShipCalendarDate;
	absoluteDay: number;
	minutesInDay: number;
	shipTime: Date;
}

export function buildCharacterSystemInstruction(input: CharacterContextInput): string {
	const { profile, roster, person, calendarDate, absoluteDay, shipTime } = input;
	const species = getSpecies(person.speciesId);
	const rank = person.rankId ? getRank(person.rankId) : null;
	const division = person.divisionId ? getDivision(person.divisionId) : null;
	const position = person.positionId ? getPosition(person.positionId) : null;
	const appointment = person.commandAppointmentId
		? getCommandAppointment(person.commandAppointmentId)
		: null;
	const captainId = roster.captainPersonnelId;
	const captainName = profile.captain.name;
	const fullName = formatPersonnelDisplayName(person.identity);
	const shipName = formatDisplayShipName(profile.vessel.name);
	const weekday = WEEKDAY_NAMES[getWeekdayIndex(calendarDate.year, calendarDate.monthIndex, calendarDate.day)];

	const lines: string[] = [
		`You are ${fullName}, a character living aboard ${shipName}, a Planetary Union starship in The Orville universe.`,
		'',
		'IDENTITY',
	];

	appendLine(lines, 'Name', fullName);
	appendLine(lines, 'Species', species.name);
	appendLine(lines, 'Gender', formatGenderLabel(person.gender));
	if (person.ageYears != null) {
		appendLine(lines, 'Age', String(person.ageYears));
	}
	appendLine(lines, 'Date of Birth', person.dateOfBirth ?? null);

	lines.push('', 'UNION SERVICE');
	appendLine(lines, 'Rank', rank?.name ?? (person.personnelKind === 'civilian' ? 'Civilian' : null));
	appendLine(lines, 'Division', division?.name ?? (person.personnelKind === 'civilian' ? 'Civilian' : null));
	appendLine(
		lines,
		'Position',
		position?.name ?? (person.personnelKind === 'civilian' ? 'Civilian' : null),
	);
	appendLine(lines, 'Command Appointment', appointment?.name ?? null);
	appendLine(lines, 'Status', person.status.replaceAll('_', ' '));

	lines.push('', 'CURRENT TIME');
	appendLine(lines, 'Day', weekday);
	appendLine(lines, 'Date', formatShipDate(calendarDate));
	appendLine(lines, 'Time', formatClock(shipTime));
	appendLine(lines, 'Year', String(calendarDate.year));
	appendLine(lines, 'Current Ship Location', profile.vessel.location);

	const traits = formatTraits(person);
	if (traits) {
		lines.push('', 'PERSONALITY');
		appendLine(lines, 'Traits', traits);
	}

	lines.push('', 'RELATIONSHIPS');
	appendLine(
		lines,
		'Relationship to Captain',
		formatRelationshipToCaptain(roster, person, captainId, captainName),
	);
	appendLine(lines, 'Direct Superior', formatNamesForRelationshipType(roster, person.id, 'direct_superior'));
	appendLine(
		lines,
		'Direct Subordinates',
		formatNamesForRelationshipType(roster, person.id, 'direct_subordinate'),
	);
	appendLine(
		lines,
		'Partner/Spouse',
		formatNamesForRelationshipTypes(roster, person.id, ['partner', 'spouse']),
	);
	appendLine(lines, 'Children', formatNamesForRelationshipType(roster, person.id, 'parent'));
	appendLine(lines, 'Close Friends', formatNamesForRelationshipType(roster, person.id, 'close_friend'));
	appendLine(lines, 'Friends', formatNamesForRelationshipType(roster, person.id, 'friend'));
	appendLine(
		lines,
		'Rivals/Enemies',
		formatNamesForRelationshipTypes(roster, person.id, ['rival', 'enemy']),
	);
	appendLine(lines, 'Other Relevant Relationships', formatOtherRelationships(roster, person.id));

	lines.push('', 'CAPABILITIES', 'Core Attributes:', formatAttributes(person));
	lines.push('', 'Professional Skills:', formatSkills(person));

	lines.push('', 'CURRENT CONTEXT');
	appendLine(lines, 'Current Ship Status', profile.vessel.alertStatus);
	appendLine(lines, 'Current Assignment', formatCurrentAssignment(person));
	appendLine(lines, 'Relevant Recent Events', formatRecentEvents(profile, absoluteDay));

	lines.push('', ROLEPLAY_RULES);

	return lines.join('\n');
}
