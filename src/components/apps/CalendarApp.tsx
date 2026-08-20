import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useShipClock } from '../../context/ClockContext';
import {
	absoluteDayToCalendar,
	buildMonthGrid,
	formatShipDateLong,
	isSameCalendarDay,
	MONTHS,
} from '../../utils/shipCalendar';
import { compareChronoPosition } from '../../utils/chronoSimulation';
import { formatClock } from '../../utils/terminalTime';
import { AppIconRenderer } from '../common/AppIconRenderer';

interface CalendarAppProps {
	windowId: string;
	appId: string;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface SelectedDay {
	year: number;
	monthIndex: number;
	day: number;
	absoluteDay: number;
}

export function CalendarApp(_props: CalendarAppProps) {
	const {
		calendarDate,
		absoluteDay,
		minutesInDay,
		shipTime,
		simulateTo,
		dayEndPending,
	} = useShipClock();
	const [viewYear, setViewYear] = useState(calendarDate.year);
	const [viewMonthIndex, setViewMonthIndex] = useState(calendarDate.monthIndex);
	const [selectedDay, setSelectedDay] = useState<SelectedDay | null>(null);
	const [simulationNote, setSimulationNote] = useState<string | null>(null);

	const monthCells = useMemo(
		() => buildMonthGrid(viewYear, viewMonthIndex),
		[viewYear, viewMonthIndex],
	);

	const selectedCalendar = useMemo(() => {
		if (!selectedDay) return null;
		return absoluteDayToCalendar(selectedDay.absoluteDay);
	}, [selectedDay]);

	const canSimulateSelected = useMemo(() => {
		if (!selectedDay || dayEndPending) return false;
		return (
			compareChronoPosition(
				{ absoluteDay: selectedDay.absoluteDay, minutesInDay: 0 },
				{ absoluteDay, minutesInDay },
			) > 0
		);
	}, [selectedDay, absoluteDay, minutesInDay, dayEndPending]);

	const shiftMonth = (delta: number) => {
		let nextMonth = viewMonthIndex + delta;
		let nextYear = viewYear;

		while (nextMonth < 0) {
			nextMonth += MONTHS.length;
			nextYear -= 1;
		}
		while (nextMonth >= MONTHS.length) {
			nextMonth -= MONTHS.length;
			nextYear += 1;
		}

		setViewMonthIndex(nextMonth);
		setViewYear(nextYear);
	};

	const jumpToCurrentMonth = () => {
		setViewYear(calendarDate.year);
		setViewMonthIndex(calendarDate.monthIndex);
	};

	const handleSelectDay = (cellAbsoluteDay: number, day: number) => {
		setSelectedDay({
			year: viewYear,
			monthIndex: viewMonthIndex,
			day,
			absoluteDay: cellAbsoluteDay,
		});
		setSimulationNote(null);
	};

	const handleSimulate = () => {
		if (!selectedDay || !canSimulateSelected) return;

		const result = simulateTo(selectedDay.absoluteDay, 0);
		const target = absoluteDayToCalendar(result.final.absoluteDay);
		setSimulationNote(
			`Simulated ${result.ticksProcessed.toLocaleString()} chrono cycles and ${result.midnightsCrossed.toLocaleString()} midnights to ${formatShipDateLong(target)} 00:00.`,
		);
		setViewYear(target.year);
		setViewMonthIndex(target.monthIndex);
	};

	const renderDayState = (cellAbsoluteDay: number) => {
		if (cellAbsoluteDay === absoluteDay) return 'current';
		if (
			compareChronoPosition(
				{ absoluteDay: cellAbsoluteDay, minutesInDay: 0 },
				{ absoluteDay, minutesInDay },
			) < 0
		) {
			return 'past';
		}
		return 'future';
	};

	return (
		<div className="flex h-full flex-col bg-gradient-to-b from-[#f2f2f5] to-[#e4e4ea] text-[#2a2a2e] select-text">
			<div className="border-b border-[#d0d0d8]/80 bg-white/80 px-6 py-4">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center border border-[#c8c8d4] bg-[#f8f8fa] text-[var(--accent-purple-dim)] terminal-bevel-sm">
						<AppIconRenderer icon="calendar" size={20} />
					</div>
					<div>
						<h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#1a1a1e]">
							Calendar
						</h2>
						<p className="font-mono text-[10px] uppercase tracking-wider text-[var(--accent-gold-dim)]">
							NAV-02
						</p>
					</div>
				</div>
			</div>

			<div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-4 py-4 sm:px-6">
				<div className="calendar-module-panel rounded-sm border border-[#d0d0d8] bg-white/75 p-3 terminal-bevel-sm sm:p-4">
					<div className="mb-3 flex items-center justify-between gap-2">
						<button
							type="button"
							className="calendar-nav-btn terminal-bevel-sm border border-[#c8c8d4] p-1.5 text-[#3a3a42]"
							onClick={() => shiftMonth(-1)}
							aria-label="Previous month"
						>
							<ChevronLeft size={16} />
						</button>
						<div className="text-center">
							<p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#1a1a1e]">
								{MONTHS[viewMonthIndex]?.name} {viewYear}
							</p>
							<button
								type="button"
								className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[var(--accent-purple-dim)] hover:underline"
								onClick={jumpToCurrentMonth}
							>
								Jump to current month
							</button>
						</div>
						<button
							type="button"
							className="calendar-nav-btn terminal-bevel-sm border border-[#c8c8d4] p-1.5 text-[#3a3a42]"
							onClick={() => shiftMonth(1)}
							aria-label="Next month"
						>
							<ChevronRight size={16} />
						</button>
					</div>

					<div className="mb-1 grid grid-cols-7 gap-1">
						{WEEKDAY_LABELS.map((label) => (
							<div
								key={label}
								className="py-1 text-center font-mono text-[9px] uppercase tracking-wider text-[#9898a4]"
							>
								{label}
							</div>
						))}
					</div>

					<div className="grid grid-cols-7 gap-1">
						{monthCells.map((cell, index) => {
							if (!cell.inMonth || cell.absoluteDay === null || cell.day === null) {
								return <div key={`pad-${index}`} className="calendar-day-cell calendar-day-cell--empty" />;
							}

							const cellCalendar = absoluteDayToCalendar(cell.absoluteDay);
							const dayState = renderDayState(cell.absoluteDay);
							const isSelected =
								selectedDay?.absoluteDay === cell.absoluteDay ||
								(selectedDay === null &&
									isSameCalendarDay(cellCalendar, calendarDate));
							const isToday = cell.absoluteDay === absoluteDay;

							const cellAbsoluteDay = cell.absoluteDay;
							const cellDay = cell.day;

							return (
								<button
									key={cellAbsoluteDay}
									type="button"
									className={`calendar-day-cell terminal-bevel-sm border text-left transition-colors ${
										isSelected
											? 'calendar-day-cell--selected'
											: isToday
												? 'calendar-day-cell--today'
												: dayState === 'past'
													? 'calendar-day-cell--past'
													: 'calendar-day-cell--future'
									}`}
									onClick={() => handleSelectDay(cellAbsoluteDay, cellDay)}
								>
									<span className="font-mono text-[11px] font-medium">{cell.day}</span>
									<span className="calendar-day-marker" aria-hidden="true" />
								</button>
							);
						})}
					</div>
				</div>

				<div className="calendar-action-panel mt-auto rounded-sm border border-[#d0d0d8] bg-white/80 p-4 terminal-bevel-sm">
					{selectedCalendar ? (
						<>
							<p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9898a4]">
								Selected date
							</p>
							<p className="mt-1 text-sm font-semibold text-[#1a1a1e]">
								{formatShipDateLong(selectedCalendar)}
							</p>
							<p className="mt-1 text-[11px] text-[#5a5a64]">
								Ship time now: {formatShipDateLong(calendarDate)} · {formatClock(shipTime)}
							</p>
							<p className="mt-2 text-[11px] leading-relaxed text-[#767680]">
								Event markers and deadlines will appear on scheduled days in a future update.
							</p>
							<button
								type="button"
								disabled={!canSimulateSelected}
								className="dock-home-btn terminal-bevel mt-4 w-full px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-45"
								onClick={handleSimulate}
							>
								{canSimulateSelected
									? `Simulate to ${formatShipDateLong(selectedCalendar)} 00:00`
									: 'Simulation requires a future date'}
							</button>
						</>
					) : (
						<p className="text-sm text-[#5a5a64]">Select a day to inspect or simulate ship time.</p>
					)}

					{simulationNote && (
						<p className="mt-3 border-t border-[#d0d0d8] pt-3 font-mono text-[10px] leading-relaxed text-[var(--accent-purple-dim)]">
							{simulationNote}
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
