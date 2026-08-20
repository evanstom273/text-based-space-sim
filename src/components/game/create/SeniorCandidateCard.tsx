import {
	CORE_ATTRIBUTE_IDS,
	CORE_ATTRIBUTES,
} from '../../../domain/personnel/attributes';
import {
	formatPersonnelDisplayName,
	type PersonnelRecord,
} from '../../../domain/personnel/personnel';
import { getDivision } from '../../../domain/personnel/divisions';
import { getPosition } from '../../../domain/personnel/positions';
import { getRank } from '../../../domain/personnel/ranks';
import {
	PROFESSIONAL_SKILL_IDS,
	PROFESSIONAL_SKILLS,
} from '../../../domain/personnel/skills';
import { getSpecies } from '../../../domain/personnel/species';
import { formatGenderLabel } from '../../../domain/personnel/names';
import {
	getEffectiveAttributeBreakdown,
	getEffectiveSkillBreakdown,
} from '../../../domain/personnel/effectiveValues';
import { formatStatWithModifier } from '../../../domain/personnel/display';

interface SeniorCandidateCardProps {
	candidate: PersonnelRecord;
	locked: boolean;
	onAccept: () => void;
	onReroll: () => void;
}

export function SeniorCandidateCard({
	candidate,
	locked,
	onAccept,
	onReroll,
}: SeniorCandidateCardProps) {
	const rank = getRank(candidate.rankId);
	const species = getSpecies(candidate.speciesId);
	const division = getDivision(candidate.divisionId);
	const position = getPosition(candidate.positionId);

	return (
		<article className={`candidate-card terminal-bevel-sm ${locked ? 'candidate-card--locked' : ''}`}>
			<header className="candidate-card-header">
				<div>
					<div className="candidate-card-position">{position.name}</div>
					<div className="candidate-card-name">
						{rank.abbreviation} {formatPersonnelDisplayName(candidate.identity)}
					</div>
				</div>
				{locked ? <span className="candidate-lock-badge">LOCKED IN</span> : null}
			</header>

			<div className="candidate-meta">
				<span>{species.name}</span>
				<span>{formatGenderLabel(candidate.gender)}</span>
				<span>{candidate.ageYears ? `Age ${candidate.ageYears}` : 'Age —'}</span>
				<span>{division.name}</span>
			</div>

			<div className="candidate-stats">
				<div>
					<div className="candidate-stats-title">CORE ATTRIBUTES</div>
					<div className="candidate-stats-grid">
						{CORE_ATTRIBUTE_IDS.map((id) => {
							const breakdown = getEffectiveAttributeBreakdown(candidate, id);
							return (
								<div key={id} className="candidate-stat">
									<span>{CORE_ATTRIBUTES[id].name}</span>
									<strong>{formatStatWithModifier(breakdown)}</strong>
								</div>
							);
						})}
					</div>
				</div>
				<div>
					<div className="candidate-stats-title">PROFESSIONAL SKILLS</div>
					<div className="candidate-stats-grid">
						{PROFESSIONAL_SKILL_IDS.map((id) => {
							const breakdown = getEffectiveSkillBreakdown(candidate, id);
							return (
								<div key={id} className="candidate-stat">
									<span>{PROFESSIONAL_SKILLS[id].name}</span>
									<strong>{formatStatWithModifier(breakdown)}</strong>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			<div className="candidate-actions">
				{locked ? (
					<button type="button" className="game-btn game-btn--ghost" onClick={onReroll}>
						UNLOCK & REROLL
					</button>
				) : (
					<>
						<button type="button" className="game-btn game-btn--ghost" onClick={onReroll}>
							REROLL CANDIDATE
						</button>
						<button type="button" className="game-btn game-btn--primary" onClick={onAccept}>
							ACCEPT / LOCK IN
						</button>
					</>
				)}
			</div>
		</article>
	);
}
