export const SHIP_EPOCH_YEAR = 2420;
export const DAYS_PER_YEAR = 365;
export const MINUTES_PER_DAY = 24 * 60;
export const SHIP_DAY_START_MINUTES = 9 * 60;
export const MINUTES_PER_CHRONO_TICK = 30;

export const DEFAULT_TICK_INTERVAL_SECONDS = 10;
export const MIN_TICK_INTERVAL_SECONDS = 2;
export const MAX_TICK_INTERVAL_SECONDS = 60;

export type TimeSpeedMultiplier = 1 | 2 | 4 | 8;

export interface ShipCalendarDate {
	year: number;
	month: string;
	monthShort: string;
	day: number;
	dayOfYear: number;
}

const MONTHS = [
	{ name: 'January', short: 'Jan', days: 31 },
	{ name: 'February', short: 'Feb', days: 28 },
	{ name: 'March', short: 'Mar', days: 31 },
	{ name: 'April', short: 'Apr', days: 30 },
	{ name: 'May', short: 'May', days: 31 },
	{ name: 'June', short: 'Jun', days: 30 },
	{ name: 'July', short: 'Jul', days: 31 },
	{ name: 'August', short: 'Aug', days: 31 },
	{ name: 'September', short: 'Sep', days: 30 },
	{ name: 'October', short: 'Oct', days: 31 },
	{ name: 'November', short: 'Nov', days: 30 },
	{ name: 'December', short: 'Dec', days: 31 },
] as const;

const MONTH_INDEX: Record<string, number> = Object.fromEntries(
	MONTHS.map((month, index) => [month.name, index]),
);

export function absoluteDayToCalendar(absoluteDay: number): ShipCalendarDate {
	let year = SHIP_EPOCH_YEAR;
	let dayOfYearIndex = absoluteDay;

	while (dayOfYearIndex >= DAYS_PER_YEAR) {
		dayOfYearIndex -= DAYS_PER_YEAR;
		year += 1;
	}

	let remaining = dayOfYearIndex;

	for (const month of MONTHS) {
		if (remaining < month.days) {
			return {
				year,
				month: month.name,
				monthShort: month.short,
				day: remaining + 1,
				dayOfYear: dayOfYearIndex + 1,
			};
		}
		remaining -= month.days;
	}

	return {
		year,
		month: 'December',
		monthShort: 'Dec',
		day: 31,
		dayOfYear: DAYS_PER_YEAR,
	};
}

export function calendarToShipDate(absoluteDay: number, minutesInDay: number): Date {
	const calendar = absoluteDayToCalendar(absoluteDay);
	const monthIndex = MONTH_INDEX[calendar.month] ?? 0;
	return new Date(
		calendar.year,
		monthIndex,
		calendar.day,
		Math.floor(minutesInDay / 60),
		minutesInDay % 60,
		0,
		0,
	);
}

export function formatShipDate(calendar: ShipCalendarDate): string {
	return `${String(calendar.day).padStart(2, '0')} ${calendar.monthShort} ${calendar.year}`;
}

export function formatShipDateLong(calendar: ShipCalendarDate): string {
	return `${calendar.month} ${calendar.day}, ${calendar.year}`;
}

export function formatShipStardate(calendar: ShipCalendarDate): string {
	const fraction = (calendar.dayOfYear / DAYS_PER_YEAR).toFixed(2).slice(2);
	return `STARDATE ${String(calendar.year).slice(2)}${String(calendar.dayOfYear).padStart(3, '0')}.${fraction}`;
}
