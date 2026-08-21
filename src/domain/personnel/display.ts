import type { EffectiveStatBreakdown } from './effectiveValues';
import { formatPersonnelDisplayName, type PersonnelRecord } from './personnel';
import { getCommandAppointment } from './commandAppointments';
import { getDivision } from './divisions';
import { getPosition } from './positions';
import { getRank } from './ranks';
import { getSpecies } from './species';

export function formatModifierDelta(delta: number): string {
	if (delta > 0) return `+${delta}`;
	return String(delta);
}

/**
 * Display form: `Engineering 7 (+2)` or `Engineering 7` when unmodified.
 */
export function formatStatWithModifier(breakdown: EffectiveStatBreakdown): string {
	const { base, totalModifier } = breakdown;
	if (totalModifier === 0) return String(base);
	return `${base} (${formatModifierDelta(totalModifier)})`;
}

export function formatStatLine(
	label: string,
	breakdown: EffectiveStatBreakdown,
): string {
	return `${label}: ${formatStatWithModifier(breakdown)}`;
}

export function formatPersonnelTitleLine(person: PersonnelRecord): string {
	const name = formatPersonnelDisplayName(person.identity);
	if (!person.rankId) {
		return name;
	}
	const rank = getRank(person.rankId);
	return `${rank.abbreviation} ${name}`.trim();
}

export function formatPersonnelSummary(person: PersonnelRecord): string {
	const species = getSpecies(person.speciesId);
	const division = person.divisionId ? getDivision(person.divisionId) : null;
	const position = person.positionId ? getPosition(person.positionId) : null;
	const appointment = person.commandAppointmentId
		? getCommandAppointment(person.commandAppointmentId)
		: null;

	const lines = [
		formatPersonnelTitleLine(person),
		species.name,
		division ? `${division.name} Division` : 'Civilian',
		position?.name ?? (person.personnelKind === 'civilian' ? 'Civilian' : 'Crew'),
	];

	if (appointment) {
		lines.push(`Command Appointment: ${appointment.name}`);
	}

	return lines.join('\n');
}
