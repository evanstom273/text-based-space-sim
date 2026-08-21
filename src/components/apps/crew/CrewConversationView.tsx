import { formatClock } from '../../../utils/terminalTime';
import type { CommandProfile } from '../../../types/commandProfile';
import { useEffect, useMemo, useRef } from 'react';
import { MessageSquare, Radio } from 'lucide-react';
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
import { sendPresetCrewDialogue } from '../../../domain/communications/crewDialogueService';
import {
	CAPTAIN_PRESETS,
	type CaptainPreset,
	type CaptainPresetCategory,
} from '../../../domain/communications/presets';
import { absoluteDayToCalendar, formatShipDate } from '../../../utils/shipCalendar';

function formatMessageClock(absoluteDay: number, minutesInDay: number): string {
	const calendar = absoluteDayToCalendar(absoluteDay);
	const hours = Math.floor(minutesInDay / 60)
		.toString()
		.padStart(2, '0');
	const minutes = (minutesInDay % 60).toString().padStart(2, '0');
	return `${formatShipDate(calendar)} · ${hours}:${minutes}`;
}

interface CrewConversationViewProps {
	person: PersonnelRecord;
	roleLabel: string;
	onBack: () => void;
}

const PRESET_CATEGORIES: { id: CaptainPresetCategory; label: string }[] = [
	{ id: 'command', label: 'Command' },
	{ id: 'personal', label: 'Personal' },
];

export function CrewConversationView({ person, roleLabel, onBack }: CrewConversationViewProps) {
	const profile = useActiveCommandProfile();
	const { patchActiveProfile } = useGameSession();
	const { shipTime, calendarDate, absoluteDay, minutesInDay } = useShipClock();
	const transcriptRef = useRef<HTMLDivElement>(null);

	const thread = useMemo(
		() => getConversationThread(profile.future.communications, person.id),
		[profile.future.communications, person.id],
	);

	const species = getSpecies(person.speciesId);
	const rank = person.rankId ? getRank(person.rankId) : null;

	const presetsByCategory = useMemo(() => {
		const grouped: Record<CaptainPresetCategory, CaptainPreset[]> = {
			command: [],
			personal: [],
		};
		for (const preset of CAPTAIN_PRESETS) {
			grouped[preset.category].push(preset);
		}
		return grouped;
	}, []);

	useEffect(() => {
		const node = transcriptRef.current;
		if (!node) return;
		node.scrollTop = node.scrollHeight;
	}, [thread.messages.length]);

	const handlePreset = (presetId: CaptainPreset['id']) => {
		const result = sendPresetCrewDialogue({
			profile,
			person,
			presetId,
			absoluteDay,
			minutesInDay,
			communications: profile.future.communications,
		});

		patchActiveProfile((current: CommandProfile) => ({
			...current,
			future: {
				...current.future,
				communications: result.communications,
			},
		}));
	};

	const handleClearChat = () => {
		patchActiveProfile((current: CommandProfile) => ({
			...current,
			future: {
				...current.future,
				communications: clearConversationThread(current.future.communications, person.id),
			},
		}));
	};

	return (
		<div className="crew-conv">
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
						<p className="crew-conv-channel">SUBSPACE CHANNEL · PERSONAL COMMS</p>
						<h3 className="crew-conv-name">{formatPersonnelTitleLine(person)}</h3>
						<p className="crew-conv-meta">
							{roleLabel}
							{' · '}
							{species.name}
							{rank ? ` · ${rank.abbreviation}` : ''}
						</p>
					</div>
				</div>
				<div className="crew-conv-chrono">
					<span>{formatClock(shipTime)}</span>
					<span>{formatShipDate(calendarDate)}</span>
				</div>
			</header>

			<div ref={transcriptRef} className="crew-conv-transcript terminal-bevel-sm">
				{thread.messages.length === 0 ? (
					<div className="crew-conv-empty">
						<MessageSquare size={18} strokeWidth={2} aria-hidden="true" />
						<p>No prior traffic on this channel.</p>
						<p className="crew-conv-empty-copy">
							Select a transmission below to open a line with{' '}
							{formatPersonnelDisplayName(person.identity)}.
						</p>
					</div>
				) : (
					thread.messages.map((message) => (
						<div
							key={message.id}
							className={`crew-conv-message crew-conv-message--${message.role}`}
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

			<div className="crew-conv-compose terminal-bevel-sm">
				<p className="crew-conv-compose-label">Captain transmission</p>
				<p className="crew-conv-compose-copy">
					Choose a preset line. The crew member replies from contextual dialogue fragments.
				</p>

				{PRESET_CATEGORIES.map((category) => (
					<div key={category.id} className="crew-conv-preset-group">
						<p className="crew-conv-preset-group-label">{category.label}</p>
						<div className="crew-conv-presets">
							{presetsByCategory[category.id].map((preset) => (
								<button
									key={preset.id}
									type="button"
									className="crew-conv-preset-btn"
									onClick={() => handlePreset(preset.id)}
								>
									{preset.label}
								</button>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
