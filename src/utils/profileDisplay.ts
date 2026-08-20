import type { CommandProfile } from '../types/commandProfile';
import { absoluteDayToCalendar } from './shipCalendar';
import { formatClock } from './terminalTime';
import { calendarToShipDate } from './shipCalendar';
import { formatDisplayShipName } from './profileRandomizer';

export function getProfileCalendarDate(profile: CommandProfile) {
	return absoluteDayToCalendar(profile.simulation.absoluteDay);
}

export function getProfileShipTime(profile: CommandProfile): Date {
	return calendarToShipDate(profile.simulation.absoluteDay, profile.simulation.minutesInDay);
}

export function formatProfileDateShort(profile: CommandProfile): string {
	const calendar = getProfileCalendarDate(profile);
	return `${String(calendar.day).padStart(2, '0')} ${calendar.monthShort.toUpperCase()} ${calendar.year}`;
}

export function formatProfileTime(profile: CommandProfile): string {
	return formatClock(getProfileShipTime(profile));
}

export function formatProfileCaptainLabel(name: string): string {
	return `CAPTAIN ${name}`;
}

export function formatProfileShipLabel(storedName: string): string {
	return formatDisplayShipName(storedName);
}
