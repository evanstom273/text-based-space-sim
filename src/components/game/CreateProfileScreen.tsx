import { useMemo, useState } from 'react';
import { ShipInsignia } from '../common/ShipInsignia';
import { useGameSession } from '../../context/GameSessionContext';
import {
	formatDisplayShipName,
	normalizeShipNameInput,
	randomRegistry,
	randomShipName,
} from '../../utils/profileRandomizer';
import {
	CAPTAIN_ATTRIBUTE_POINT_POOL,
	CAPTAIN_SKILL_POINT_POOL,
	createCaptainPersonnel,
	createDefaultAttributeAllocation,
	createDefaultSkillAllocation,
	formatGenderLabel,
	formatPersonnelDisplayName,
	generateSeniorStaffCandidate,
	getSpecies,
	getUnionCrewEligibleSpecies,
	isAllocationComplete,
	randomiseAttributeAllocation,
	randomiseSkillAllocation,
	SENIOR_STAFF_SELECTION_POSITIONS,
	type CoreAttributeScores,
	type PersonnelRecord,
	type PositionId,
	type ProfessionalSkillScores,
	type SpeciesId,
} from '../../domain/personnel';
import { getPosition } from '../../domain/personnel/positions';
import { getRank } from '../../domain/personnel/ranks';
import { StatAllocationPanel } from './create/StatAllocationPanel';
import { SeniorCandidateCard } from './create/SeniorCandidateCard';

type CreateStep =
	| 'details'
	| 'attributes'
	| 'skills'
	| 'senior'
	| 'second'
	| 'review';

const STEP_ORDER: CreateStep[] = [
	'details',
	'attributes',
	'skills',
	'senior',
	'second',
	'review',
];

const STEP_LABELS: Record<CreateStep, string> = {
	details: 'Captain & Vessel',
	attributes: 'Attributes',
	skills: 'Skills',
	senior: 'Senior Staff',
	second: 'Second Officer',
	review: 'Final Review',
};

function createInitialCandidates(): Record<PositionId, PersonnelRecord> {
	const map = {} as Record<PositionId, PersonnelRecord>;
	for (const positionId of SENIOR_STAFF_SELECTION_POSITIONS) {
		map[positionId] = generateSeniorStaffCandidate(positionId);
	}
	return map;
}

export function CreateProfileScreen() {
	const { cancelCreateProfile, createAndAssumeCommand } = useGameSession();
	const eligibleSpecies = useMemo(() => getUnionCrewEligibleSpecies(), []);

	const [step, setStep] = useState<CreateStep>('details');
	const [captainName, setCaptainName] = useState('');
	const [speciesId, setSpeciesId] = useState<SpeciesId>(eligibleSpecies[0]?.id ?? 'human');
	const [shipName, setShipName] = useState('');
	const [registry, setRegistry] = useState('');
	const [attributes, setAttributes] = useState<CoreAttributeScores>(createDefaultAttributeAllocation);
	const [skills, setSkills] = useState<ProfessionalSkillScores>(createDefaultSkillAllocation);
	const [candidates, setCandidates] = useState<Record<PositionId, PersonnelRecord>>(createInitialCandidates);
	const [lockedPositions, setLockedPositions] = useState<Partial<Record<PositionId, boolean>>>({});
	const [secondOfficerId, setSecondOfficerId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const stepIndex = STEP_ORDER.indexOf(step);
	const allSeniorLocked = SENIOR_STAFF_SELECTION_POSITIONS.every((id) => lockedPositions[id]);

	const lockedOfficers = useMemo(
		() => SENIOR_STAFF_SELECTION_POSITIONS.map((id) => candidates[id]).filter(Boolean) as PersonnelRecord[],
		[candidates],
	);

	const secondOfficerEligible = useMemo(
		() =>
			SENIOR_STAFF_SELECTION_POSITIONS.filter((id) => id !== 'first_officer' && lockedPositions[id]).map(
				(id) => candidates[id],
			).filter(Boolean) as PersonnelRecord[],
		[candidates, lockedPositions],
	);

	const goNext = () => {
		setError(null);

		if (step === 'details') {
			if (!captainName.trim()) {
				setError('Captain name is required.');
				return;
			}
			if (!normalizeShipNameInput(shipName)) {
				setError('Vessel name is required.');
				return;
			}
			if (!registry.trim()) {
				setError('Registry number is required.');
				return;
			}
			if (!eligibleSpecies.some((species) => species.id === speciesId)) {
				setError('Select an eligible Planetary Union species.');
				return;
			}
		}

		if (step === 'attributes' && !isAllocationComplete(attributes, CAPTAIN_ATTRIBUTE_POINT_POOL)) {
			setError('Allocate all attribute points before continuing.');
			return;
		}

		if (step === 'skills' && !isAllocationComplete(skills, CAPTAIN_SKILL_POINT_POOL)) {
			setError('Allocate all skill points before continuing.');
			return;
		}

		if (step === 'senior' && !allSeniorLocked) {
			setError('Lock in a candidate for every senior staff position.');
			return;
		}

		if (step === 'second') {
			if (!secondOfficerId) {
				setError('Designate a Second Officer.');
				return;
			}
			if (candidates.first_officer?.id === secondOfficerId) {
				setError('First Officer cannot also be Second Officer.');
				return;
			}
		}

		const next = STEP_ORDER[stepIndex + 1];
		if (next) setStep(next);
	};

	const goBack = () => {
		setError(null);
		const prev = STEP_ORDER[stepIndex - 1];
		if (prev) setStep(prev);
	};

	const handleAssumeCommand = () => {
		if (!secondOfficerId || !allSeniorLocked) {
			setError('Complete senior staff and Second Officer selection.');
			return;
		}

		const captainPersonnel = createCaptainPersonnel({
			fullName: captainName.trim(),
			speciesId,
			attributes,
			skills,
		});

		const seniorStaff = SENIOR_STAFF_SELECTION_POSITIONS.map((id) => candidates[id]).filter(
			(officer): officer is PersonnelRecord => Boolean(officer),
		);

		createAndAssumeCommand({
			captainName: captainName.trim(),
			shipName: normalizeShipNameInput(shipName),
			registry: registry.trim(),
			captainPersonnel,
			seniorStaff,
			secondOfficerPersonnelId: secondOfficerId,
		});
	};

	const rerollCandidate = (positionId: PositionId) => {
		setCandidates((current) => ({
			...current,
			[positionId]: generateSeniorStaffCandidate(positionId),
		}));
		setLockedPositions((current) => ({
			...current,
			[positionId]: false,
		}));
		if (secondOfficerId && candidates[positionId]?.id === secondOfficerId) {
			setSecondOfficerId(null);
		}
	};

	return (
		<div className="game-screen create-screen">
			<div className="create-screen-header terminal-chrome terminal-bevel-sm">
				<div className="profile-screen-brand">
					<ShipInsignia size={32} className="text-[var(--accent-gold-bright)]" />
					<div>
						<h1 className="profile-screen-title">NEW COMMAND ASSIGNMENT</h1>
						<p className="profile-screen-subtitle">
							Planetary Union · Establish command identity and senior staff
						</p>
					</div>
				</div>
			</div>

			<nav className="create-stepper" aria-label="Assignment steps">
				{STEP_ORDER.map((entry, index) => (
					<div
						key={entry}
						className={`create-stepper-item ${index === stepIndex ? 'create-stepper-item--active' : ''} ${index < stepIndex ? 'create-stepper-item--done' : ''}`}
					>
						<span className="create-stepper-index">{index + 1}</span>
						<span className="create-stepper-label">{STEP_LABELS[entry]}</span>
					</div>
				))}
			</nav>

			<div className="create-screen-body">
				{step === 'details' ? (
					<>
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
							<label className="create-field">
								<span className="create-label">Species</span>
								<select
									className="create-input create-select"
									value={speciesId}
									onChange={(event) => setSpeciesId(event.target.value as SpeciesId)}
								>
									{eligibleSpecies.map((species) => (
										<option key={species.id} value={species.id}>
											{species.name}
										</option>
									))}
								</select>
								<span className="create-preview">{getSpecies(speciesId).description}</span>
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
					</>
				) : null}

				{step === 'attributes' ? (
					<section className="create-section terminal-bevel-sm">
						<div className="create-section-toolbar">
							<h2 className="create-section-title">CAPTAIN CORE ATTRIBUTES</h2>
							<div className="create-random-row">
								<button
									type="button"
									className="game-btn game-btn--ghost"
									onClick={() => setAttributes(createDefaultAttributeAllocation())}
								>
									RESET
								</button>
								<button
									type="button"
									className="game-btn game-btn--ghost"
									onClick={() => setAttributes(randomiseAttributeAllocation())}
								>
									RANDOMISE
								</button>
							</div>
						</div>
						<StatAllocationPanel
							mode="attributes"
							scores={attributes}
							pool={CAPTAIN_ATTRIBUTE_POINT_POOL}
							onChange={setAttributes}
						/>
					</section>
				) : null}

				{step === 'skills' ? (
					<section className="create-section terminal-bevel-sm">
						<div className="create-section-toolbar">
							<h2 className="create-section-title">CAPTAIN PROFESSIONAL SKILLS</h2>
							<div className="create-random-row">
								<button
									type="button"
									className="game-btn game-btn--ghost"
									onClick={() => setSkills(createDefaultSkillAllocation())}
								>
									RESET
								</button>
								<button
									type="button"
									className="game-btn game-btn--ghost"
									onClick={() => setSkills(randomiseSkillAllocation())}
								>
									RANDOMISE
								</button>
							</div>
						</div>
						<StatAllocationPanel
							mode="skills"
							scores={skills}
							pool={CAPTAIN_SKILL_POINT_POOL}
							onChange={setSkills}
						/>
					</section>
				) : null}

				{step === 'senior' ? (
					<section className="create-section create-section--wide terminal-bevel-sm">
						<h2 className="create-section-title">SENIOR STAFF ASSIGNMENTS</h2>
						<p className="create-section-lede">
							Review Planetary Union personnel candidates. Accept to lock a candidate, or reroll for a
							new officer. Locked selections are preserved.
						</p>
						<div className="candidate-grid">
							{SENIOR_STAFF_SELECTION_POSITIONS.map((positionId) => {
								const candidate = candidates[positionId];
								if (!candidate) return null;
								return (
									<SeniorCandidateCard
										key={positionId}
										candidate={candidate}
										locked={Boolean(lockedPositions[positionId])}
										onAccept={() =>
											setLockedPositions((current) => ({
												...current,
												[positionId]: true,
											}))
										}
										onReroll={() => rerollCandidate(positionId)}
									/>
								);
							})}
						</div>
					</section>
				) : null}

				{step === 'second' ? (
					<section className="create-section terminal-bevel-sm">
						<h2 className="create-section-title">SECOND OFFICER DESIGNATION</h2>
						<p className="create-section-lede">
							Designate one senior officer as Second Officer. This is a command appointment in addition
							to their departmental role. The First Officer is not eligible.
						</p>
						<div className="second-officer-list">
							{secondOfficerEligible.map((officer) => {
								const selected = secondOfficerId === officer.id;
								const rank = getRank(officer.rankId!);
								const position = getPosition(officer.positionId!);
								return (
									<button
										key={officer.id}
										type="button"
										className={`second-officer-card terminal-bevel-sm ${selected ? 'second-officer-card--selected' : ''}`}
										onClick={() => setSecondOfficerId(officer.id)}
									>
										<div className="second-officer-card-title">
											{rank.abbreviation} {formatPersonnelDisplayName(officer.identity)}
										</div>
										<div className="second-officer-card-meta">
											{getSpecies(officer.speciesId).name} · {position.name} ·{' '}
											{formatGenderLabel(officer.gender)}
											{officer.ageYears ? ` · Age ${officer.ageYears}` : ''}
										</div>
									</button>
								);
							})}
						</div>
					</section>
				) : null}

				{step === 'review' ? (
					<section className="create-section terminal-bevel-sm">
						<h2 className="create-section-title">FINAL COMMAND REVIEW</h2>
						<div className="review-grid">
							<div className="review-block">
								<div className="review-label">Captain</div>
								<div className="review-value">{captainName.trim().toUpperCase()}</div>
								<div className="review-sub">{getSpecies(speciesId).name}</div>
							</div>
							<div className="review-block">
								<div className="review-label">Vessel</div>
								<div className="review-value">{formatDisplayShipName(normalizeShipNameInput(shipName))}</div>
								<div className="review-sub">{registry.trim().toUpperCase()}</div>
							</div>
							{SENIOR_STAFF_SELECTION_POSITIONS.map((positionId) => {
								const officer = candidates[positionId];
								if (!officer) return null;
								const rank = getRank(officer.rankId!);
								const isSecond = officer.id === secondOfficerId;
								return (
									<div key={positionId} className="review-block">
										<div className="review-label">{getPosition(positionId).name}</div>
										<div className="review-value">
											{rank.abbreviation} {formatPersonnelDisplayName(officer.identity)}
										</div>
										<div className="review-sub">
											{getSpecies(officer.speciesId).name}
											{isSecond ? ' · Second Officer' : ''}
										</div>
									</div>
								);
							})}
							<div className="review-block review-block--accent">
								<div className="review-label">Second Officer</div>
								<div className="review-value">
									{(() => {
										const officer = lockedOfficers.find((entry) => entry.id === secondOfficerId);
										if (!officer) return '—';
										return `${getRank(officer.rankId!).abbreviation} ${formatPersonnelDisplayName(officer.identity)}`;
									})()}
								</div>
								<div className="review-sub">Command appointment</div>
							</div>
						</div>
					</section>
				) : null}

				{error ? <p className="create-error">{error}</p> : null}

				<div className="create-actions">
					{stepIndex === 0 ? (
						<button type="button" className="game-btn game-btn--ghost" onClick={cancelCreateProfile}>
							CANCEL
						</button>
					) : (
						<button type="button" className="game-btn game-btn--ghost" onClick={goBack}>
							BACK
						</button>
					)}

					{step === 'review' ? (
						<button type="button" className="game-btn game-btn--primary" onClick={handleAssumeCommand}>
							ASSUME COMMAND
						</button>
					) : (
						<button type="button" className="game-btn game-btn--primary" onClick={goNext}>
							CONTINUE
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
