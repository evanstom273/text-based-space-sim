import { formatClock } from '../../../utils/terminalTime';
import type { CommandProfile } from '../../../types/commandProfile';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, MessageSquare, Radio, Sparkles } from 'lucide-react';
import { useShipClock } from '../../../context/ClockContext';
import { useActiveCommandProfile, useGameSession } from '../../../context/GameSessionContext';
import {
	formatPersonnelDisplayName,
	formatPersonnelTitleLine,
	getRank,
	getSpecies,
	type PersonnelRecord,
} from '../../../domain/personnel';
import {
	clearConversationThread,
	getConversationThread,
} from '../../../domain/communications/conversations';
import {
	buildDialogueContext,
	getAvailableCategories,
	getAvailableDialogueOptions,
	sendProceduralDialogue,
	type AvailableDialogueOption,
	type DialogueCategory,
	type DialogueResolutionResult,
	type DialogueSessionTracker,
} from '../../../domain/communications';
import { createInitialSessionTracker } from '../../../domain/communications/state';
import { absoluteDayToCalendar, formatShipDate } from '../../../utils/shipCalendar';

function formatMessageClock(absoluteDay: number, minutesInDay: number): string {
	const calendar = absoluteDayToCalendar(absoluteDay);
	const hours = Math.floor(minutesInDay / 60)
		.toString()
		.padStart(2, '0');
	const minutes = (minutesInDay % 60).toString().padStart(2, '0');
	return formatShipDate(calendar) + ' · ' + hours + ':' + minutes;
}

const CATEGORY_LABELS: Record<DialogueCategory, string> = {
	general: 'General',
	duty: 'Duty & Status',
	command: 'Command',
	personnel: 'Personnel',
	relationship: 'Interpersonal',
	family_romantic: 'Family & Partner',
	personal: 'Personal / Civilian',
	contextual: 'Contextual Events',
};

interface CrewConversationViewProps {
	person: PersonnelRecord;
	roleLabel: string;
	onBack: () => void;
}

export function CrewConversationView({ person, roleLabel, onBack }: CrewConversationViewProps) {
	const profile = useActiveCommandProfile();
	const { patchActiveProfile } = useGameSession();
	const { shipTime, calendarDate, absoluteDay, minutesInDay } = useShipClock();
	const transcriptRef = useRef<HTMLDivElement>(null);

	const [sessionTracker, setSessionTracker] = useState<DialogueSessionTracker>(() =>
		createInitialSessionTracker(person.id),
	);
	const [activeCategory, setActiveCategory] = useState<DialogueCategory>('general');
	const [lastResolution, setLastResolution] = useState<DialogueResolutionResult | null>(null);
	const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);

	const thread = useMemo(
		() => getConversationThread(profile.future.communications, person.id),
		[profile.future.communications, person.id],
	);

	const species = getSpecies(person.speciesId);
	const rank = person.rankId ? getRank(person.rankId) : null;

	const dialogueContext = useMemo(
		() =>
			buildDialogueContext(profile, person, absoluteDay, minutesInDay, {
				exchangeCount: sessionTracker.exchangeCount,
				usedIntentIds: sessionTracker.usedIntentIds,
				activeFollowUps: sessionTracker.activeFollowUps,
			}),
		[profile, person, absoluteDay, minutesInDay, sessionTracker],
	);

	const availableCategories = useMemo(
		() => getAvailableCategories(dialogueContext),
		[dialogueContext],
	);

	useEffect(() => {
		if (availableCategories.length > 0 && !availableCategories.includes(activeCategory)) {
			setActiveCategory(availableCategories[0]);
		}
	}, [availableCategories, activeCategory]);

	const availableOptions = useMemo(
		() => getAvailableDialogueOptions(dialogueContext, activeCategory),
		[dialogueContext, activeCategory],
	);

	useEffect(() => {
		const node = transcriptRef.current;
		if (!node) return;
		node.scrollTop = node.scrollHeight;
	}, [thread.messages.length]);

	const handleOptionSelect = (option: AvailableDialogueOption) => {
		const result = sendProceduralDialogue({
			profile,
			person,
			intentId: option.intentId,
			targetParty: option.targetParty,
			absoluteDay,
			minutesInDay,
			sessionTracker,
		});

		setSessionTracker(result.updatedSessionTracker);
		setLastResolution(result.resolution);

		patchActiveProfile((_current: CommandProfile) => result.updatedProfile);
	};

	const handleClearChat = () => {
		patchActiveProfile((current: CommandProfile) => ({
			...current,
			future: {
				...current.future,
				communications: clearConversationThread(current.future.communications, person.id),
			},
		}));
		setSessionTracker(createInitialSessionTracker(person.id));
		setLastResolution(null);
	};

	return (
		<div className="crew-conv flex h-full flex-col">
			<div className="crew-profile-toolbar crew-conv-toolbar">
				<button type="button" className="game-btn game-btn--ghost" onClick={onBack}>
					← PROFILE
				</button>
				{thread.messages.length > 0 ? (
					<button type="button" className="game-btn game-btn--ghost" onClick={handleClearChat}>
						CLEAR CHANNEL
					</button>
				) : null}
			</div>

			<header className="crew-conv-header terminal-bevel-sm">
				<div className="crew-conv-header-main">
					<div className="crew-conv-header-icon" aria-hidden="true">
						<Radio size={18} strokeWidth={2} />
					</div>
					<div>
						<p className="crew-conv-channel">SUBSPACE CHANNEL · PROCEDURAL COMMS</p>
						<h3 className="crew-conv-name">{formatPersonnelTitleLine(person)}</h3>
						<p className="crew-conv-meta">
							{roleLabel}
							{' · '}
							{species.name}
							{rank ? ' · ' + rank.abbreviation : ''}
							{dialogueContext.target.isBirthdayToday ? ' · BIRTHDAY TODAY' : ''}
						</p>
					</div>
				</div>
				<div className="crew-conv-chrono">
					<span>{formatClock(shipTime)}</span>
					<span>{formatShipDate(calendarDate)}</span>
				</div>
			</header>

			{import.meta.env.DEV && lastResolution ? (
				<div className="mx-4 mt-2 rounded border border-[var(--panel-border)] bg-black/40 p-2 text-[10px] font-mono">
					<button
						type="button"
						className="flex w-full items-center justify-between text-[var(--accent-gold)]"
						onClick={() => setShowDiagnostics((prev) => !prev)}
					>
						<span className="flex items-center gap-1">
							<Sparkles size={12} />
							<span>DIALOGUE ENGINE DIAGNOSTICS</span>
						</span>
						{showDiagnostics ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
					</button>
					{showDiagnostics ? (
						<div className="mt-2 flex flex-col gap-1 border-t border-[var(--panel-border)] pt-2 text-[var(--module-text-dim)]">
							<p>Intent: <span className="text-[var(--module-text)]">{lastResolution.intentId}</span></p>
							<p>Tone: <span className="text-[var(--accent-cyan)]">{lastResolution.selectedTone}</span></p>
							<p>Template ID: <span className="text-[var(--module-text)]">{lastResolution.templateId}</span></p>
							{lastResolution.appliedEffects.length > 0 ? (
								<p>Effects: <span className="text-[var(--accent-gold)]">{JSON.stringify(lastResolution.appliedEffects)}</span></p>
							) : null}
						</div>
					) : null}
				</div>
			) : null}

			<div ref={transcriptRef} className="crew-conv-transcript terminal-bevel-sm flex-1 overflow-y-auto">
				{thread.messages.length === 0 ? (
					<div className="crew-conv-empty">
						<MessageSquare size={18} strokeWidth={2} aria-hidden="true" />
						<p>No prior traffic on this channel.</p>
						<p className="crew-conv-empty-copy">
							Select a procedural dialogue intent below to communicate with{' '}
							{formatPersonnelDisplayName(person.identity)}.
						</p>
					</div>
				) : (
					thread.messages.map((message) => (
						<div
							key={message.id}
							className={'crew-conv-message crew-conv-message--' + message.role}
						>
							<div className="crew-conv-message-head">
								<span className="crew-conv-message-speaker">
									{message.role === 'captain'
										? 'CAPTAIN'
										: formatPersonnelDisplayName(person.identity).toUpperCase()}
								</span>
								<span className="crew-conv-message-time">
									{formatMessageClock(message.absoluteDay, message.minutesInDay)}
								</span>
							</div>
							<p className="crew-conv-message-text">{message.text}</p>
						</div>
					))
				)}
			</div>

			<div className="crew-conv-compose terminal-bevel-sm p-4">
				<p className="crew-conv-compose-label">Captain Transmission</p>
				
				<div className="mt-2 flex flex-wrap gap-1.5 border-b border-[var(--panel-border)] pb-2">
					{availableCategories.map((cat) => (
						<button
							key={cat}
							type="button"
							className={'rounded-xs px-2.5 py-1 font-mono text-[11px] transition-colors ' + (
								activeCategory === cat
									? 'bg-[var(--accent-gold)] text-black font-semibold'
									: 'bg-[var(--panel-bg-subtle)] text-[var(--module-text-dim)] hover:text-[var(--module-text)] hover:bg-[var(--panel-border)]'
							)}
							onClick={() => setActiveCategory(cat)}
						>
							{CATEGORY_LABELS[cat] ?? cat}
						</button>
					))}
				</div>

				<div className="mt-3 flex max-h-48 flex-col gap-2 overflow-y-auto pr-1">
					{availableOptions.length === 0 ? (
						<p className="font-mono text-[11px] text-[var(--module-text-dim)]">
							No available topics in this category right now.
						</p>
					) : (
						availableOptions.map((opt, idx) => (
							<button
								key={opt.intentId + '-' + idx + '-' + (opt.targetParty?.person.id ?? '')}
								type="button"
								className="group flex flex-col items-start rounded border border-[var(--panel-border)] bg-[var(--panel-bg)] p-2.5 text-left transition-colors hover:border-[var(--accent-gold)] hover:bg-[var(--panel-bg-subtle)]"
								onClick={() => handleOptionSelect(opt)}
							>
								<div className="flex w-full items-center justify-between gap-2">
									<span className="font-mono text-[11px] font-medium text-[var(--accent-gold)] group-hover:text-[var(--accent-gold-bright)]">
										{opt.label}
									</span>
									{opt.targetParty ? (
										<span className="rounded-xs bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-[var(--accent-cyan)]">
											{opt.targetParty.primaryRelationshipLabel}
										</span>
									) : null}
								</div>
								<p className="mt-1 text-[12px] text-[var(--module-text-dim)] group-hover:text-[var(--module-text)]">
									&quot;{opt.playerText}&quot;
								</p>
							</button>
						))
					)}
				</div>
			</div>
		</div>
	);
}