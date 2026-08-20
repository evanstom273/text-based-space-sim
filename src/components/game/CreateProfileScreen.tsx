import { useState } from 'react';
import { ShipInsignia } from '../common/ShipInsignia';
import { useGameSession } from '../../context/GameSessionContext';
import {
	formatDisplayShipName,
	normalizeShipNameInput,
	randomRegistry,
	randomShipName,
} from '../../utils/profileRandomizer';

export function CreateProfileScreen() {
	const { cancelCreateProfile, createAndAssumeCommand } = useGameSession();
	const [captainName, setCaptainName] = useState('');
	const [shipName, setShipName] = useState('');
	const [registry, setRegistry] = useState('');
	const [error, setError] = useState<string | null>(null);

	const handleAssumeCommand = () => {
		const trimmedCaptain = captainName.trim();
		const trimmedShip = normalizeShipNameInput(shipName);
		const trimmedRegistry = registry.trim();

		if (!trimmedCaptain) {
			setError('Captain name is required.');
			return;
		}
		if (!trimmedShip) {
			setError('Vessel name is required.');
			return;
		}
		if (!trimmedRegistry) {
			setError('Registry number is required.');
			return;
		}

		setError(null);
		createAndAssumeCommand({
			captainName: trimmedCaptain,
			shipName: trimmedShip,
			registry: trimmedRegistry,
		});
	};

	return (
		<div className="game-screen create-screen">
			<div className="create-screen-header terminal-chrome terminal-bevel-sm">
				<div className="profile-screen-brand">
					<ShipInsignia size={32} className="text-[var(--accent-gold-bright)]" />
					<div>
						<h1 className="profile-screen-title">NEW COMMAND ASSIGNMENT</h1>
						<p className="profile-screen-subtitle">Establish captain identity and vessel registration</p>
					</div>
				</div>
			</div>

			<div className="create-screen-body">
				<section className="create-section terminal-bevel-sm">
					<h2 className="create-section-title">CAPTAIN DETAILS</h2>
					<label className="create-field">
						<span className="create-label">Captain name</span>
						<input
							type="text"
							className="create-input"
							value={captainName}
							onChange={(event) => setCaptainName(event.target.value)}
							placeholder="Lyra Evans"
							autoComplete="off"
							spellCheck={false}
						/>
					</label>
				</section>

				<section className="create-section terminal-bevel-sm">
					<h2 className="create-section-title">VESSEL ASSIGNMENT</h2>

					<label className="create-field">
						<span className="create-label">Ship name</span>
						<div className="create-input-prefix-wrap">
							<span className="create-input-prefix">USS</span>
							<input
								type="text"
								className="create-input create-input--prefixed"
								value={shipName}
								onChange={(event) => setShipName(event.target.value)}
								placeholder="Clements"
								autoComplete="off"
								spellCheck={false}
							/>
						</div>
						{shipName.trim() ? (
							<span className="create-preview">
								Display: {formatDisplayShipName(normalizeShipNameInput(shipName))}
							</span>
						) : null}
					</label>

					<label className="create-field">
						<span className="create-label">Registry number</span>
						<input
							type="text"
							className="create-input"
							value={registry}
							onChange={(event) => setRegistry(event.target.value)}
							placeholder="ECV-1987"
							autoComplete="off"
							spellCheck={false}
						/>
					</label>

					<div className="create-random-row">
						<button
							type="button"
							className="game-btn game-btn--ghost"
							onClick={() => setShipName(randomShipName())}
						>
							RANDOMISE SHIP
						</button>
						<button
							type="button"
							className="game-btn game-btn--ghost"
							onClick={() => setRegistry(randomRegistry())}
						>
							RANDOMISE REGISTRY
						</button>
						<button
							type="button"
							className="game-btn game-btn--ghost"
							onClick={() => {
								setShipName(randomShipName());
								setRegistry(randomRegistry());
							}}
						>
							RANDOMISE BOTH
						</button>
					</div>
				</section>

				{error ? <p className="create-error">{error}</p> : null}

				<div className="create-actions">
					<button type="button" className="game-btn game-btn--ghost" onClick={cancelCreateProfile}>
						CANCEL
					</button>
					<button type="button" className="game-btn game-btn--primary" onClick={handleAssumeCommand}>
						ASSUME COMMAND
					</button>
				</div>
			</div>
		</div>
	);
}
