const STORAGE_KEY = 'union-terminal-gemini-settings';
const STORAGE_VERSION = 1;

export const GEMINI_MODELS = [
	{
		id: 'gemini-3.1-flash-lite',
		label: 'Gemini 3.1 Flash Lite',
	},
] as const;

export type GeminiModelId = (typeof GEMINI_MODELS)[number]['id'];

export interface GeminiSettings {
	apiKey: string;
	modelId: GeminiModelId;
}

interface PersistedGeminiSettings {
	version: typeof STORAGE_VERSION;
	apiKey: string;
	modelId: GeminiModelId;
}

export interface GeminiValidationResult {
	ok: boolean;
	message: string;
	responseText?: string;
}

const DEFAULT_MODEL_ID: GeminiModelId = GEMINI_MODELS[0].id;

function isGeminiModelId(value: unknown): value is GeminiModelId {
	return typeof value === 'string' && GEMINI_MODELS.some((model) => model.id === value);
}

function sanitizeSettings(raw: Partial<GeminiSettings>): GeminiSettings | null {
	const apiKey = typeof raw.apiKey === 'string' ? raw.apiKey.trim() : '';
	if (!apiKey) return null;

	return {
		apiKey,
		modelId: isGeminiModelId(raw.modelId) ? raw.modelId : DEFAULT_MODEL_ID,
	};
}

export function getGeminiModelLabel(modelId: GeminiModelId): string {
	return GEMINI_MODELS.find((model) => model.id === modelId)?.label ?? modelId;
}

export function loadGeminiSettings(): GeminiSettings | null {
	if (typeof window === 'undefined') return null;

	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;

		const parsed = JSON.parse(raw) as Partial<PersistedGeminiSettings>;
		if (parsed.version !== STORAGE_VERSION) return null;

		return sanitizeSettings(parsed);
	} catch {
		return null;
	}
}

export function saveGeminiSettings(settings: GeminiSettings): boolean {
	if (typeof window === 'undefined') return false;

	const sanitized = sanitizeSettings(settings);
	if (!sanitized) return false;

	try {
		const payload: PersistedGeminiSettings = {
			version: STORAGE_VERSION,
			...sanitized,
		};
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
		return true;
	} catch {
		return false;
	}
}

export function clearGeminiSettings(): void {
	if (typeof window === 'undefined') return;

	try {
		window.localStorage.removeItem(STORAGE_KEY);
	} catch {
		// Ignore privacy mode failures.
	}
}

function extractResponseText(payload: unknown): string | undefined {
	if (!payload || typeof payload !== 'object') return undefined;

	const candidates = (payload as { candidates?: unknown }).candidates;
	if (!Array.isArray(candidates) || candidates.length === 0) return undefined;

	const firstCandidate = candidates[0];
	if (!firstCandidate || typeof firstCandidate !== 'object') return undefined;

	const content = (firstCandidate as { content?: unknown }).content;
	if (!content || typeof content !== 'object') return undefined;

	const parts = (content as { parts?: unknown }).parts;
	if (!Array.isArray(parts)) return undefined;

	const textParts = parts
		.map((part) => {
			if (!part || typeof part !== 'object') return '';
			const text = (part as { text?: unknown }).text;
			return typeof text === 'string' ? text : '';
		})
		.filter(Boolean);

	return textParts.join('').trim() || undefined;
}

function extractErrorMessage(payload: unknown, fallback: string): string {
	if (!payload || typeof payload !== 'object') return fallback;

	const error = (payload as { error?: unknown }).error;
	if (!error || typeof error !== 'object') return fallback;

	const message = (error as { message?: unknown }).message;
	return typeof message === 'string' && message.trim() ? message.trim() : fallback;
}

export async function validateGeminiConnection(
	apiKey: string,
	modelId: GeminiModelId,
): Promise<GeminiValidationResult> {
	const trimmedKey = apiKey.trim();
	if (!trimmedKey) {
		return {
			ok: false,
			message: 'Enter a Gemini API key before validating.',
		};
	}

	if (!isGeminiModelId(modelId)) {
		return {
			ok: false,
			message: 'Select a supported Gemini model.',
		};
	}

	const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`;

	try {
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-goog-api-key': trimmedKey,
			},
			body: JSON.stringify({
				contents: [
					{
						role: 'user',
						parts: [{ text: 'Reply with exactly: OK' }],
					},
				],
				generationConfig: {
					maxOutputTokens: 16,
					temperature: 0,
				},
			}),
		});

		let payload: unknown = null;
		try {
			payload = await response.json();
		} catch {
			payload = null;
		}

		if (!response.ok) {
			return {
				ok: false,
				message: extractErrorMessage(payload, `Gemini API request failed (${response.status}).`),
			};
		}

		const responseText = extractResponseText(payload);
		if (!responseText) {
			return {
				ok: false,
				message: 'Gemini responded, but no text was returned for the validation prompt.',
			};
		}

		return {
			ok: true,
			message: `Connection verified with ${getGeminiModelLabel(modelId)}.`,
			responseText,
		};
	} catch (error) {
		const detail = error instanceof Error ? error.message : 'Unknown network error';
		return {
			ok: false,
			message: `Could not reach Gemini API: ${detail}`,
		};
	}
}
