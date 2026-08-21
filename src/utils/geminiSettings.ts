import { generateGeminiContent } from '../services/gemini/geminiApi';

/**
 * Terminal-local Gemini credentials and model selection.
 *
 * Stored under `union-terminal-gemini-settings` in localStorage only.
 * Intentionally separate from Command Profile / exportable save data.
 * Conversation transcripts live on the profile; API keys never do.
 */
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

export const DEFAULT_GEMINI_MODEL_ID: GeminiModelId = GEMINI_MODELS[0].id;

function isGeminiModelId(value: unknown): value is GeminiModelId {
	return typeof value === 'string' && GEMINI_MODELS.some((model) => model.id === value);
}

function sanitizeSettings(raw: Partial<GeminiSettings>): GeminiSettings | null {
	const apiKey = typeof raw.apiKey === 'string' ? raw.apiKey.trim() : '';
	if (!apiKey) return null;

	return {
		apiKey,
		modelId: isGeminiModelId(raw.modelId) ? raw.modelId : DEFAULT_GEMINI_MODEL_ID,
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

export function isGeminiConfigured(): boolean {
	return Boolean(loadGeminiSettings()?.apiKey.trim());
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

	const response = await generateGeminiContent({
		modelId,
		apiKey: trimmedKey,
		contents: [{ role: 'user', parts: [{ text: 'Reply with exactly: OK' }] }],
		maxOutputTokens: 16,
		temperature: 0,
	});

	if (!response.ok || !response.text) {
		return {
			ok: false,
			message: response.message,
		};
	}

	return {
		ok: true,
		message: `Connection verified with ${getGeminiModelLabel(modelId)}.`,
		responseText: response.text,
	};
}
