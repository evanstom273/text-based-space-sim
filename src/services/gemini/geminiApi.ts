import type { GeminiModelId } from '../../utils/geminiSettings';

export type GeminiContentRole = 'user' | 'model';

export interface GeminiContentPart {
	text: string;
}

export interface GeminiContent {
	role: GeminiContentRole;
	parts: GeminiContentPart[];
}

export type GeminiApiErrorCode =
	| 'missing_config'
	| 'invalid_model'
	| 'auth'
	| 'rate_limit'
	| 'network'
	| 'api'
	| 'empty_response';

export interface GeminiGenerateContentInput {
	modelId: GeminiModelId;
	apiKey: string;
	systemInstruction?: string;
	contents: GeminiContent[];
	maxOutputTokens?: number;
	temperature?: number;
}

export interface GeminiGenerateContentResult {
	ok: boolean;
	text?: string;
	errorCode?: GeminiApiErrorCode;
	message: string;
	httpStatus?: number;
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

function classifyHttpError(status: number): GeminiApiErrorCode {
	if (status === 401 || status === 403) return 'auth';
	if (status === 429) return 'rate_limit';
	return 'api';
}

function classifyHttpMessage(status: number, apiMessage: string): string {
	if (status === 401 || status === 403) {
		return 'Gemini rejected the API key. Check Settings and validate your key again.';
	}
	if (status === 429) {
		return 'Gemini rate limit reached. Wait a moment and try again.';
	}
	return apiMessage;
}

export async function generateGeminiContent(
	input: GeminiGenerateContentInput,
): Promise<GeminiGenerateContentResult> {
	const trimmedKey = input.apiKey.trim();
	if (!trimmedKey) {
		return {
			ok: false,
			errorCode: 'missing_config',
			message: 'No Gemini API key configured.',
		};
	}

	if (!input.modelId.trim()) {
		return {
			ok: false,
			errorCode: 'invalid_model',
			message: 'No Gemini model selected.',
		};
	}

	const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${input.modelId}:generateContent`;

	try {
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-goog-api-key': trimmedKey,
			},
			body: JSON.stringify({
				systemInstruction: input.systemInstruction
					? { parts: [{ text: input.systemInstruction }] }
					: undefined,
				contents: input.contents,
				generationConfig: {
					maxOutputTokens: input.maxOutputTokens ?? 768,
					temperature: input.temperature ?? 0.85,
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
			const apiMessage = extractErrorMessage(
				payload,
				`Gemini API request failed (${response.status}).`,
			);
			return {
				ok: false,
				errorCode: classifyHttpError(response.status),
				message: classifyHttpMessage(response.status, apiMessage),
				httpStatus: response.status,
			};
		}

		const text = extractResponseText(payload);
		if (!text) {
			return {
				ok: false,
				errorCode: 'empty_response',
				message: 'Gemini responded, but no dialogue text was returned.',
				httpStatus: response.status,
			};
		}

		return {
			ok: true,
			text,
			message: 'OK',
			httpStatus: response.status,
		};
	} catch (error) {
		const detail = error instanceof Error ? error.message : 'Unknown network error';
		return {
			ok: false,
			errorCode: 'network',
			message: `Could not reach Gemini API: ${detail}`,
		};
	}
}
