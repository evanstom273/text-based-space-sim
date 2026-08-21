import { formatClock } from '../../../utils/terminalTime';
import type { CommandProfile } from '../../../types/commandProfile';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { getConversationThread } from '../../../domain/ai/conversations';
import { sendCrewConversationMessage } from '../../../services/gemini/crewConversationService';
import { isGeminiConfigured } from '../../../utils/geminiSettings';
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

type ConversationFeedbackTone = 'idle' | 'error';

export function CrewConversationView({ person, roleLabel, onBack }: CrewConversationViewProps) {
	const profile = useActiveCommandProfile();
	const { patchActiveProfile } = useGameSession();
	const { shipTime, calendarDate, absoluteDay, minutesInDay } = useShipClock();
	const [draftMessage, setDraftMessage] = useState('');
	const [isSending, setIsSending] = useState(false);
	const [feedbackTone, setFeedbackTone] = useState<ConversationFeedbackTone>('idle');
	const [feedbackMessage, setFeedbackMessage] = useState('');
	const transcriptRef = useRef<HTMLDivElement>(null);
	const geminiReady = isGeminiConfigured();

	const roster = profile.future.crew;
	const thread = useMemo(
		() => getConversationThread(profile.future.communications, person.id),
		[profile.future.communications, person.id],
	);

	const species = getSpecies(person.speciesId);
	const rank = person.rankId ? getRank(person.rankId) : null;

	useEffect(() => {
		const node = transcriptRef.current;
		if (!node) return;
		node.scrollTop = node.scrollHeight;
	}, [thread.messages.length, isSending]);

	const handleSend = async () => {
		if (!geminiReady || isSending || !draftMessage.trim() || !roster) return;

		setIsSending(true);
		setFeedbackTone('idle');
		setFeedbackMessage('');

		const result = await sendCrewConversationMessage({
			profile,
			roster,
			person,
			captainMessage: draftMessage,
			calendarDate,
			absoluteDay,
			minutesInDay,
			shipTime,
			communications: profile.future.communications,
		});

		setIsSending(false);

		if (!result.ok) {
			setFeedbackTone('error');
			setFeedbackMessage(result.message);
			return;
		}

		setDraftMessage('');
		patchActiveProfile((current: CommandProfile) => ({
			...current,
			future: {
				...current.future,
				communications: result.communications,
			},
		}));
	};

	const feedbackClassName =
		feedbackTone === 'error' ? 'crew-conv-feedback--error' : 'crew-conv-feedback--idle';

	return (
		<div className="crew-conv">
			<div className="crew-profile-toolbar">
				<button type="button" className="game-btn game-btn--ghost" onClick={onBack}>
					← PROFILE
				</button>
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

			{!geminiReady ? (
				<section className="crew-conv-notice terminal-bevel-sm">
					<p className="crew-conv-notice-title">Gemini not configured</p>
					<p className="crew-conv-notice-copy">
						Add and validate a Gemini API key in Settings to open live crew communication.
					</p>
				</section>
			) : null}

			<div ref={transcriptRef} className="crew-conv-transcript terminal-bevel-sm">
				{thread.messages.length === 0 ? (
					<div className="crew-conv-empty">
						<MessageSquare size={18} strokeWidth={2} aria-hidden="true" />
						<p>No prior traffic on this channel.</p>
						<p className="crew-conv-empty-copy">
							Open a direct line to {formatPersonnelDisplayName(person.identity)}. Responses stay
							in character using live ship context.
						</p>
					</div>
				) : (
					thread.messages.map((message) => (
						<div
							key={message.id}
							className={`crew-conv-message crew-conv-message--${message.role}${isSending && message.id === thread.messages.at(-1)?.id ? '' : ''}`}
						>
							<div className="crew-conv-message-head">
								<span className="crew-conv-message-speaker">
									{message.role === 'captain' ? 'CAPTAIN' : formatPersonnelDisplayName(person.identity).toUpperCase()}
								</span>
								<span className="crew-conv-message-time">
									{formatMessageClock(message.absoluteDay, message.minutesInDay)}
								</span>
							</div>
							<p className="crew-conv-message-text">{message.text}</p>
						</div>
					))
				)}

				{isSending ? (
					<div className="crew-conv-message crew-conv-message--character crew-conv-message--pending">
						<div className="crew-conv-message-head">
							<span className="crew-conv-message-speaker">
								{formatPersonnelDisplayName(person.identity).toUpperCase()}
							</span>
							<span className="crew-conv-message-time">RECEIVING…</span>
						</div>
						<p className="crew-conv-message-text crew-conv-message-text--pending">
							Awaiting response on subspace channel…
						</p>
					</div>
				) : null}
			</div>

			<div className="crew-conv-compose terminal-bevel-sm">
				<label className="crew-conv-compose-label" htmlFor={`crew-conv-input-${person.id}`}>
					Captain transmission
				</label>
				<textarea
					id={`crew-conv-input-${person.id}`}
					className="crew-conv-input"
					value={draftMessage}
					onChange={(event) => setDraftMessage(event.target.value)}
					placeholder={
						geminiReady
							? 'Type your message to this crew member…'
							: 'Configure Gemini in Settings to transmit.'
					}
					disabled={!geminiReady || isSending}
					rows={3}
					onKeyDown={(event) => {
						if (event.key === 'Enter' && !event.shiftKey) {
							event.preventDefault();
							void handleSend();
						}
					}}
				/>
				<div className="crew-conv-compose-actions">
					<button
						type="button"
						className="game-btn game-btn--primary"
						onClick={() => void handleSend()}
						disabled={!geminiReady || isSending || !draftMessage.trim()}
					>
						{isSending ? 'TRANSMITTING…' : 'TRANSMIT'}
					</button>
				</div>
				{feedbackMessage ? (
					<p className={`crew-conv-feedback ${feedbackClassName}`}>{feedbackMessage}</p>
				) : null}
			</div>
		</div>
	);
}
