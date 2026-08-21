import type { CommandProfile } from '../../types/commandProfile';
import type { PersonnelRecord } from '../../domain/personnel/personnel';
import type { CrewRosterState } from '../../domain/personnel/roster';
import {
	appendConversationMessages,
	createConversationMessage,
	getConversationThread,
	getRecentContextMessages,
	type CommandProfileCommunicationsState,
	type CrewConversationMessage,
} from '../../domain/ai/conversations';
import type { ShipCalendarDate } from '../../utils/shipCalendar';
import { buildCharacterSystemInstruction } from './characterContext';
import { generateGeminiContent, type GeminiContent, type GeminiGenerateContentResult } from './geminiApi';
import { loadGeminiSettings } from '../../utils/geminiSettings';

/** Loads terminal-local credentials at request time. Never persisted on CommandProfile. */
function getTerminalGeminiSettings() {
	return loadGeminiSettings();
}

export interface CrewConversationRequest {
	profile: CommandProfile;
	roster: CrewRosterState;
	person: PersonnelRecord;
	captainMessage: string;
	calendarDate: ShipCalendarDate;
	absoluteDay: number;
	minutesInDay: number;
	shipTime: Date;
	communications: CommandProfileCommunicationsState | undefined;
}

export interface CrewConversationSuccess {
	ok: true;
	captainMessage: CrewConversationMessage;
	characterMessage: CrewConversationMessage;
	communications: CommandProfileCommunicationsState;
}

export interface CrewConversationFailure {
	ok: false;
	errorCode: GeminiGenerateContentResult['errorCode'] | 'empty_message';
	message: string;
}

export type CrewConversationResult = CrewConversationSuccess | CrewConversationFailure;

function toGeminiHistory(messages: CrewConversationMessage[]): GeminiContent[] {
	return messages.map((message) => ({
		role: message.role === 'captain' ? 'user' : 'model',
		parts: [{ text: message.text }],
	}));
}

export { isGeminiConfigured } from '../../utils/geminiSettings';

export async function sendCrewConversationMessage(
	request: CrewConversationRequest,
): Promise<CrewConversationResult> {
	const trimmedMessage = request.captainMessage.trim();
	if (!trimmedMessage) {
		return {
			ok: false,
			errorCode: 'empty_message',
			message: 'Enter a message before transmitting.',
		};
	}

	const settings = getTerminalGeminiSettings();
	if (!settings?.apiKey.trim()) {
		return {
			ok: false,
			errorCode: 'missing_config',
			message: 'Gemini is not configured. Add an API key in Settings.',
		};
	}

	const thread = getConversationThread(request.communications, request.person.id);
	const captainMessage = createConversationMessage(
		'captain',
		trimmedMessage,
		request.absoluteDay,
		request.minutesInDay,
	);
	const history = getRecentContextMessages(thread);
	const systemInstruction = buildCharacterSystemInstruction({
		profile: request.profile,
		roster: request.roster,
		person: request.person,
		calendarDate: request.calendarDate,
		absoluteDay: request.absoluteDay,
		minutesInDay: request.minutesInDay,
		shipTime: request.shipTime,
	});

	const response = await generateGeminiContent({
		modelId: settings.modelId,
		apiKey: settings.apiKey,
		systemInstruction,
		contents: [...toGeminiHistory(history), { role: 'user', parts: [{ text: trimmedMessage }] }],
		maxOutputTokens: 768,
		temperature: 0.85,
	});

	if (!response.ok || !response.text) {
		return {
			ok: false,
			errorCode: response.errorCode ?? 'api',
			message: response.message,
		};
	}

	const characterMessage = createConversationMessage(
		'character',
		response.text,
		request.absoluteDay,
		request.minutesInDay,
	);

	const communications = appendConversationMessages(
		request.communications,
		request.person.id,
		[captainMessage, characterMessage],
	);

	return {
		ok: true,
		captainMessage,
		characterMessage,
		communications,
	};
}
