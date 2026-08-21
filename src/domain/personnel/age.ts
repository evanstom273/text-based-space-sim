import {
	absoluteDayToCalendar,
	calendarPartsToAbsoluteDay,
	SHIP_EPOCH_YEAR,
} from '../../utils/shipCalendar';

export const GAME_START_ABSOLUTE_DAY = 0;
export const GAME_START_YEAR = SHIP_EPOCH_YEAR; // 2420

export interface CalendarBirthDate {
	year: number;
	monthIndex: number; // 0–11
	day: number;
}

/**
 * Parse ISO YYYY-MM-DD into calendar parts.
 * Returns null when the string is malformed.
 */
export function parseDateOfBirth(isoDate: string): CalendarBirthDate | null {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
	if (!match) return null;
	const year = Number(match[1]);
	const monthIndex = Number(match[2]) - 1;
	const day = Number(match[3]);
	if (!Number.isFinite(year) || monthIndex < 0 || monthIndex > 11 || day < 1 || day > 31) {
		return null;
	}
	return { year, monthIndex, day };
}

export function formatDateOfBirth(parts: CalendarBirthDate): string {
	const month = String(parts.monthIndex + 1).padStart(2, '0');
	const day = String(parts.day).padStart(2, '0');
	return `${parts.year}-${month}-${day}`;
}

/**
 * Age in whole years on a given absolute ship day, derived from DOB.
 * Birthdays occur when the calendar reaches the DOB month/day.
 */
export function getAgeYearsOnAbsoluteDay(dateOfBirth: string, absoluteDay: number): number {
	const dob = parseDateOfBirth(dateOfBirth);
	if (!dob) return 0;
	const current = absoluteDayToCalendar(absoluteDay);
	let age = current.year - dob.year;
	const birthdayReached =
		current.monthIndex > dob.monthIndex ||
		(current.monthIndex === dob.monthIndex && current.day >= dob.day);
	if (!birthdayReached) {
		age -= 1;
	}
	return Math.max(0, age);
}

/**
 * Build a DOB ISO string that yields `ageYears` on the given absolute day.
 * Picks a random day-of-year within a stable-ish window so birthdays are distributed.
 */
export function buildDateOfBirthForAge(
	ageYears: number,
	onAbsoluteDay: number = GAME_START_ABSOLUTE_DAY,
	dayOffsetSeed: number = Math.floor(Math.random() * 365),
): string {
	const onDate = absoluteDayToCalendar(onAbsoluteDay);
	const birthYear = onDate.year - ageYears;
	const dayOfYear = ((dayOffsetSeed % 365) + 365) % 365;

	let remaining = dayOfYear;
	const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	let monthIndex = 0;
	let day = 1;
	for (let index = 0; index < monthDays.length; index += 1) {
		const daysInMonth = monthDays[index] ?? 30;
		if (remaining < daysInMonth) {
			monthIndex = index;
			day = remaining + 1;
			break;
		}
		remaining -= daysInMonth;
	}

	// If birthday would not yet have occurred this year relative to onDate,
	// age would be ageYears-1. Nudge DOB to ensure exact age on onAbsoluteDay.
	let dob = { year: birthYear, monthIndex, day };
	let computed = getAgeYearsOnAbsoluteDay(formatDateOfBirth(dob), onAbsoluteDay);
	if (computed < ageYears) {
		dob = { year: birthYear - 1, monthIndex, day };
	} else if (computed > ageYears) {
		dob = { year: birthYear + 1, monthIndex, day };
	}

	// Final safety clamp
	computed = getAgeYearsOnAbsoluteDay(formatDateOfBirth(dob), onAbsoluteDay);
	if (computed !== ageYears) {
		dob = {
			year: onDate.year - ageYears,
			monthIndex: onDate.monthIndex,
			day: Math.min(onDate.day, 28),
		};
	}

	return formatDateOfBirth(dob);
}

export function absoluteDayOfNextBirthday(dateOfBirth: string, fromAbsoluteDay: number): number {
	const dob = parseDateOfBirth(dateOfBirth);
	if (!dob) return fromAbsoluteDay;
	const current = absoluteDayToCalendar(fromAbsoluteDay);
	let year = current.year;
	let candidate = calendarPartsToAbsoluteDay(year, dob.monthIndex, dob.day);
	if (candidate <= fromAbsoluteDay) {
		candidate = calendarPartsToAbsoluteDay(year + 1, dob.monthIndex, dob.day);
	}
	return candidate;
}
