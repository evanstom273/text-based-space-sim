export const CREW_CONVERSATION_SCHEMA_VERSION = 1 as const;
export const MAX_STORED_MESSAGES_PER_THREAD = 100;

export type CrewConversationRole = 'captain' | 'character';

export interface CrewConversationMessage {
	id: string;
	role: CrewConversationRole;
	text: string;
	absoluteDay: number;
	minutesInDay: number;
	createdAtMs: number;
}

export interface CrewConversationThread {
	personnelId: string;
	messages: CrewConversationMessage[];
	updatedAtMs: number;
}

export interface CommandProfileCommunicationsState {
	schemaVersion: typeof CREW_CONVERSATION_SCHEMA_VERSION;
	threads: Record<string, CrewConversationThread>;
}

export function createEmptyCommunicationsState(): CommandProfileCommunicationsState {
	return {
		schemaVersion: CREW_CONVERSATION_SCHEMA_VERSION,
		threads: {},
	};
}

function isConversationRole(value: unknown): value is CrewConversationRole {
	return value === 'captain' || value === 'character';
}

function sanitizeMessage(raw: unknown): CrewConversationMessage | null {
	if (!raw || typeof raw !== 'object') return null;
	const message = raw as Partial<CrewConversationMessage>;
	if (
		!message.id ||
		!isConversationRole(message.role) ||
		typeof message.text !== 'string' ||
		typeof message.absoluteDay !== 'number' ||
		typeof message.minutesInDay !== 'number'
	) {
		return null;
	}

	const text = message.text.trim();
	if (!text) return null;

	return {
		id: message.id,
		role: message.role,
		text,
		absoluteDay: Math.max(0, Math.round(message.absoluteDay)),
		minutesInDay: Math.max(0, Math.min(1439, Math.round(message.minutesInDay))),
		createdAtMs: typeof message.createdAtMs === 'number' ? message.createdAtMs : Date.now(),
	};
}

function sanitizeThread(raw: unknown): CrewConversationThread | null {
	if (!raw || typeof raw !== 'object') return null;
	const thread = raw as Partial<CrewConversationThread>;
	if (!thread.personnelId || !Array.isArray(thread.messages)) return null;

	const messages = thread.messages
		.map((entry) => sanitizeMessage(entry))
		.filter((entry): entry is CrewConversationMessage => entry !== null)
		.slice(-MAX_STORED_MESSAGES_PER_THREAD);

	return {
		personnelId: thread.personnelId,
		messages,
		updatedAtMs: typeof thread.updatedAtMs === 'number' ? thread.updatedAtMs : Date.now(),
	};
}

export function sanitizeCommunicationsState(
	raw: unknown,
): CommandProfileCommunicationsState | undefined {
	if (!raw || typeof raw !== 'object') return undefined;
	const state = raw as Record<string, unknown>;
	if (state.schemaVersion !== CREW_CONVERSATION_SCHEMA_VERSION) return undefined;
	if (!state.threads || typeof state.threads !== 'object') return undefined;

	const threads: Record<string, CrewConversationThread> = {};
	for (const [personnelId, threadRaw] of Object.entries(state.threads)) {
		const thread = sanitizeThread(threadRaw);
		if (thread && thread.personnelId === personnelId) {
			threads[personnelId] = thread;
		}
	}

	return {
		schemaVersion: CREW_CONVERSATION_SCHEMA_VERSION,
		threads,
	};
}

export function getConversationThread(
	communications: CommandProfileCommunicationsState | undefined,
	personnelId: string,
): CrewConversationThread {
	const existing = communications?.threads[personnelId];
	if (existing) return existing;
	return {
		personnelId,
		messages: [],
		updatedAtMs: Date.now(),
	};
}

export function createConversationMessage(
	role: CrewConversationRole,
	text: string,
	absoluteDay: number,
	minutesInDay: number,
): CrewConversationMessage {
	return {
		id: `msg-${role}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
		role,
		text: text.trim(),
		absoluteDay,
		minutesInDay,
		createdAtMs: Date.now(),
	};
}

export function appendConversationMessages(
	communications: CommandProfileCommunicationsState | undefined,
	personnelId: string,
	messages: CrewConversationMessage[],
): CommandProfileCommunicationsState {
	const base = communications ?? createEmptyCommunicationsState();
	const thread = getConversationThread(base, personnelId);
	const combined = [...thread.messages, ...messages].slice(-MAX_STORED_MESSAGES_PER_THREAD);

	return {
		schemaVersion: CREW_CONVERSATION_SCHEMA_VERSION,
		threads: {
			...base.threads,
			[personnelId]: {
				personnelId,
				messages: combined,
				updatedAtMs: Date.now(),
			},
		},
	};
}

export function clearConversationThread(
	communications: CommandProfileCommunicationsState | undefined,
	personnelId: string,
): CommandProfileCommunicationsState {
	const base = communications ?? createEmptyCommunicationsState();
	if (!base.threads[personnelId]) return base;

	const { [personnelId]: _removed, ...remainingThreads } = base.threads;
	return {
		schemaVersion: CREW_CONVERSATION_SCHEMA_VERSION,
		threads: remainingThreads,
	};
}
