import { useState } from 'react';
import {
	DEFAULT_TICK_INTERVAL_SECONDS,
	MAX_TICK_INTERVAL_SECONDS,
	MIN_TICK_INTERVAL_SECONDS,
	MINUTES_PER_CHRONO_TICK,
} from '../../utils/shipCalendar';
import { useShipClock } from '../../context/ClockContext';
import { formatClock } from '../../utils/terminalTime';
import { formatShipDate } from '../../utils/shipCalendar';
import { AppIconRenderer } from '../common/AppIconRenderer';
import { useGameSession } from '../../context/GameSessionContext';
import { useRelinquishCommand } from '../../hooks/useRelinquishCommand';
import { formatDisplayShipName } from '../../utils/profileRandomizer';
import {
	GEMINI_MODELS,
	clearGeminiSettings,
	type GeminiModelId,
	type GeminiSettings,
	isGeminiConfigured,
	loadGeminiSettings,
	saveGeminiSettings,
	validateGeminiConnection,
} from '../../utils/geminiSettings';

interface SettingsAppProps {
	windowId: string;
	appId: string;
}

type GeminiFeedbackTone = 'idle' | 'testing' | 'success' | 'error' | 'saved';

export function SettingsApp(_props: SettingsAppProps) {
	const { shipTime, calendarDate, tickIntervalSeconds, setTickIntervalSeconds } = useShipClock();
	const { activeProfile } = useGameSession();
	const handleRelinquishCommand = useRelinquishCommand();

	const [savedGeminiSettings, setSavedGeminiSettings] = useState<GeminiSettings | null>(() =>
		loadGeminiSettings(),
	);
	const [draftApiKey, setDraftApiKey] = useState(() => loadGeminiSettings()?.apiKey ?? '');
	const [draftModelId, setDraftModelId] = useState<GeminiModelId>(
		() => loadGeminiSettings()?.modelId ?? GEMINI_MODELS[0].id,
	);
	const [geminiFeedbackTone, setGeminiFeedbackTone] = useState<GeminiFeedbackTone>('idle');
	const [geminiFeedbackMessage, setGeminiFeedbackMessage] = useState('');
	const [geminiResponsePreview, setGeminiResponsePreview] = useState('');
	const [geminiDraftValidated, setGeminiDraftValidated] = useState(false);
	const [isValidatingGemini, setIsValidatingGemini] = useState(false);
	const [isSavingGemini, setIsSavingGemini] = useState(false);

	const resetGeminiFeedback = () => {
		setGeminiDraftValidated(false);
		setGeminiFeedbackTone('idle');
		setGeminiFeedbackMessage('');
		setGeminiResponsePreview('');
	};

	const handleDraftApiKeyChange = (value: string) => {
		setDraftApiKey(value);
		resetGeminiFeedback();
	};

	const handleDraftModelChange = (value: GeminiModelId) => {
		setDraftModelId(value);
		resetGeminiFeedback();
	};

	const handleValidateGemini = async () => {
		setIsValidatingGemini(true);
		setGeminiFeedbackTone('testing');
		setGeminiFeedbackMessage('Contacting Gemini API…');
		setGeminiResponsePreview('');
		setGeminiDraftValidated(false);

		const result = await validateGeminiConnection(draftApiKey, draftModelId);

		setIsValidatingGemini(false);
		setGeminiFeedbackTone(result.ok ? 'success' : 'error');
		setGeminiFeedbackMessage(result.message);
		setGeminiResponsePreview(result.responseText ?? '');
		setGeminiDraftValidated(result.ok);
	};

	const handleSaveGemini = () => {
		if (!geminiDraftValidated) {
			setGeminiFeedbackTone('error');
			setGeminiFeedbackMessage('Validate the current API key and model before saving.');
			return;
		}

		setIsSavingGemini(true);

		const nextSettings: GeminiSettings = {
			apiKey: draftApiKey.trim(),
			modelId: draftModelId,
		};
		const didSave = saveGeminiSettings(nextSettings);

		setIsSavingGemini(false);

		if (!didSave) {
			setGeminiFeedbackTone('error');
			setGeminiFeedbackMessage('Could not save Gemini settings to local storage.');
			return;
		}

		setSavedGeminiSettings(nextSettings);
		setGeminiFeedbackTone('saved');
		setGeminiFeedbackMessage('Gemini settings saved for this terminal.');
	};

	const handleRemoveGemini = () => {
		clearGeminiSettings();
		setSavedGeminiSettings(null);
		setDraftApiKey('');
		setDraftModelId(GEMINI_MODELS[0].id);
		resetGeminiFeedback();
		setGeminiFeedbackTone('saved');
		setGeminiFeedbackMessage('Gemini API key removed from this terminal.');
	};

	const geminiAvailability = isGeminiConfigured()
		? 'Available for crew communication'
		: 'Not configured — crew communication disabled';

	const geminiFeedbackClassName =
		geminiFeedbackTone === 'success' || geminiFeedbackTone === 'saved'
			? 'text-[var(--accent-gold)]'
			: geminiFeedbackTone === 'error'
				? 'text-[#f08a8a]'
				: 'text-[var(--module-text-dim)]';

	return (
		<div className="module-shell module-workspace select-text">
			<div className="module-header px-6 py-4">
				<div className="flex items-center gap-3">
					<div className="module-icon-frame terminal-bevel-sm">
						<AppIconRenderer icon="settings" size={20} />
					</div>
					<div>
						<h2 className="module-title">Settings</h2>
						<p className="module-subtitle">ADM-01</p>
					</div>
				</div>
			</div>

			<div className="module-body flex flex-col gap-6 overflow-y-auto px-6 py-6">
				<section className="module-panel rounded-sm p-4 terminal-bevel-sm">
					<div className="mb-4 flex items-center justify-between gap-3">
						<div>
							<h3 className="module-heading">Ship chronometer</h3>
							<p className="module-copy-muted mt-1">
								Calendar begins 01 Jan 2420 at 09:00. Each cycle advances{' '}
								{MINUTES_PER_CHRONO_TICK} minutes of ship time.
							</p>
						</div>
						<div className="module-inset rounded-sm px-3 py-2 text-right terminal-bevel-sm">
							<p className="font-mono text-lg font-medium text-[var(--module-text)]">
								{formatClock(shipTime)}
							</p>
							<p className="font-mono text-[10px] text-[var(--module-text-dim)]">
								{formatShipDate(calendarDate)}
							</p>
						</div>
					</div>

					<label className="block">
						<div className="mb-2 flex items-center justify-between gap-3">
							<span className="module-label">Seconds between chrono cycles</span>
							<span className="font-mono text-[11px] text-[var(--accent-purple-dim)]">
								{tickIntervalSeconds}s / {MINUTES_PER_CHRONO_TICK} min
							</span>
						</div>
						<input
							type="range"
							min={MIN_TICK_INTERVAL_SECONDS}
							max={MAX_TICK_INTERVAL_SECONDS}
							step={1}
							value={tickIntervalSeconds}
							onChange={(event) => setTickIntervalSeconds(Number(event.target.value))}
							className="settings-slider w-full"
						/>
						<div className="module-meta mt-2 flex justify-between">
							<span>{MIN_TICK_INTERVAL_SECONDS}s</span>
							<span>Default {DEFAULT_TICK_INTERVAL_SECONDS}s</span>
							<span>{MAX_TICK_INTERVAL_SECONDS}s</span>
						</div>
					</label>
				</section>

				<section className="module-panel rounded-sm p-4 terminal-bevel-sm">
					<h3 className="module-heading">Gemini integration</h3>
					<p className="module-copy-muted mt-1">
						Store a Google Gemini API key on this terminal for optional AI-assisted crew
						communication. Validate the key against the selected model, then save it locally.
					</p>

					<div className="module-inset mt-3 rounded-sm px-3 py-2 terminal-bevel-sm">
						<p className="module-label">Availability</p>
						<p
							className={`mt-1 font-mono text-[11px] ${
								isGeminiConfigured()
									? 'text-[var(--accent-gold)]'
									: 'text-[var(--module-text-dim)]'
							}`}
						>
							{geminiAvailability}
						</p>
					</div>

					{savedGeminiSettings ? (
						<p className="module-copy mt-3">
							Saved key on file ·{' '}
							{GEMINI_MODELS.find((model) => model.id === savedGeminiSettings.modelId)?.label}
						</p>
					) : (
						<p className="module-copy mt-3">No Gemini key saved on this terminal.</p>
					)}

					<div className="mt-4 grid gap-4">
						<label className="block">
							<span className="module-label">Gemini API key</span>
							<input
								type="password"
								autoComplete="off"
								spellCheck={false}
								value={draftApiKey}
								onChange={(event) => handleDraftApiKeyChange(event.target.value)}
								placeholder="AIza..."
								className="create-input mt-2"
							/>
						</label>

						<label className="block">
							<span className="module-label">Model</span>
							<select
								value={draftModelId}
								onChange={(event) => handleDraftModelChange(event.target.value as GeminiModelId)}
								className="create-input create-select mt-2"
							>
								{GEMINI_MODELS.map((model) => (
									<option key={model.id} value={model.id}>
										{model.label}
									</option>
								))}
							</select>
						</label>
					</div>

					<div className="mt-4 flex flex-wrap gap-3">
						<button
							type="button"
							className="game-btn game-btn--ghost"
							onClick={() => void handleValidateGemini()}
							disabled={isValidatingGemini || isSavingGemini || !draftApiKey.trim()}
						>
							{isValidatingGemini ? 'VALIDATING…' : 'VALIDATE & TEST'}
						</button>
						<button
							type="button"
							className="game-btn game-btn--primary"
							onClick={handleSaveGemini}
							disabled={isValidatingGemini || isSavingGemini || !geminiDraftValidated}
						>
							{isSavingGemini ? 'SAVING…' : 'SAVE GEMINI SETTINGS'}
						</button>
						{savedGeminiSettings ? (
							<button
								type="button"
								className="game-btn game-btn--ghost"
								onClick={handleRemoveGemini}
								disabled={isValidatingGemini || isSavingGemini}
							>
								REMOVE API KEY
							</button>
						) : null}
					</div>

					{geminiFeedbackMessage ? (
						<div className={`mt-4 font-mono text-[11px] ${geminiFeedbackClassName}`}>
							<p>{geminiFeedbackMessage}</p>
							{geminiResponsePreview ? (
								<p className="mt-2 text-[var(--module-text-dim)]">
									Model reply: {geminiResponsePreview}
								</p>
							) : null}
						</div>
					) : null}
				</section>

				{activeProfile ? (
					<section className="module-panel rounded-sm p-4 terminal-bevel-sm">
						<h3 className="module-heading">Command profile</h3>
						<p className="module-copy-muted mt-1">
							Active assignment: {activeProfile.captain.name} ·{' '}
							{formatDisplayShipName(activeProfile.vessel.name)} ({activeProfile.vessel.registry})
						</p>
						<button
							type="button"
							className="game-btn game-btn--ghost mt-4"
							onClick={handleRelinquishCommand}
						>
							RELINQUISH COMMAND
						</button>
					</section>
				) : null}
			</div>
		</div>
	);
}
