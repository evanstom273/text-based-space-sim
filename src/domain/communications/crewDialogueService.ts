import type { CommandProfile } from '../../types/commandProfile';
import type { PersonnelRecord } from '../personnel/personnel';
import {
	appendConversationMessages,
	createConversationMessage,
	getConversationThread,
	type CommandProfileCommunicationsState,
	type CrewConversationMessage,
} from './conversations';
import { getCaptainPreset, type CaptainPresetId } from './presets';
import { buildPresetCharacterResponse } from './responseEngine';

export interface PresetCrewDialogueRequest {
	profile: CommandProfile;
	person: PersonnelRecord;
	presetId: CaptainPresetId;
	absoluteDay: number;
	minutesInDay: number;
	communications: CommandProfileCommunicationsState | undefined;
}

export interface PresetCrewDialogueResult {
	captainMessage: CrewConversationMessage;
	characterMessage: CrewConversationMessage;
	communications: CommandProfileCommunicationsState;
}

export function sendPresetCrewDialogue(
	request: PresetCrewDialogueRequest,
): PresetCrewDialogueResult {
	const preset = getCaptainPreset(request.presetId);
	const thread = getConversationThread(request.communications, request.person.id);
	const exchangeIndex = thread.messages.filter((message) => message.role === 'captain').length;

	const captainMessage = createConversationMessage(
		'captain',
		preset.captainText,
		request.absoluteDay,
		request.minutesInDay,
	);

	const characterText = buildPresetCharacterResponse({
		person: request.person,
		profile: request.profile,
		presetId: request.presetId,
		exchangeIndex,
	});

	const characterMessage = createConversationMessage(
		'character',
		characterText,
		request.absoluteDay,
		request.minutesInDay,
	);

	const communications = appendConversationMessages(
		request.communications,
		request.person.id,
		[captainMessage, characterMessage],
	);

	return {
		captainMessage,
		characterMessage,
		communications,
	};
}
