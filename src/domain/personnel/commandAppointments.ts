/**
 * Command appointments exist independently from departmental positions.
 * A person may hold a primary position AND an optional command appointment.
 *
 * Example valid combination:
 *   Rank: Lieutenant Commander
 *   Division: Science
 *   Position: Chief Science Officer
 *   Command Appointment: Second Officer
 */
export const COMMAND_APPOINTMENT_IDS = ['second_officer'] as const;

export type CommandAppointmentId = (typeof COMMAND_APPOINTMENT_IDS)[number];

export interface CommandAppointmentDefinition {
	id: CommandAppointmentId;
	name: string;
	shortName: string;
	description: string;
	/**
	 * When true, this appointment may be held simultaneously with a
	 * departmental primary position (Second Officer pattern).
	 */
	allowsConcurrentDepartmentalPosition: boolean;
}

export const COMMAND_APPOINTMENTS: Record<CommandAppointmentId, CommandAppointmentDefinition> = {
	second_officer: {
		id: 'second_officer',
		name: 'Second Officer',
		shortName: '2O',
		description:
			'Command succession appointment held in addition to a departmental role. Not a separate departmental officer.',
		allowsConcurrentDepartmentalPosition: true,
	},
};

export const COMMAND_APPOINTMENT_LIST: CommandAppointmentDefinition[] =
	COMMAND_APPOINTMENT_IDS.map((id) => COMMAND_APPOINTMENTS[id]);

export function getCommandAppointment(id: CommandAppointmentId): CommandAppointmentDefinition {
	return COMMAND_APPOINTMENTS[id];
}

export function isCommandAppointmentId(value: string): value is CommandAppointmentId {
	return (COMMAND_APPOINTMENT_IDS as readonly string[]).includes(value);
}
