import {
	CORE_ATTRIBUTES,
	CORE_ATTRIBUTE_IDS,
	type CoreAttributeId,
	type CoreAttributeScores,
} from '../../../domain/personnel/attributes';
import {
	PROFESSIONAL_SKILLS,
	PROFESSIONAL_SKILL_IDS,
	type ProfessionalSkillId,
	type ProfessionalSkillScores,
} from '../../../domain/personnel/skills';
import {
	ALLOCATION_STAT_MAX,
	ALLOCATION_STAT_MIN,
	canDecreaseAllocation,
	canIncreaseAllocation,
	getRemainingAllocationPoints,
} from '../../../domain/personnel/statAllocation';

interface AttributeAllocationPanelProps {
	mode: 'attributes';
	scores: CoreAttributeScores;
	pool: number;
	onChange: (scores: CoreAttributeScores) => void;
}

interface SkillAllocationPanelProps {
	mode: 'skills';
	scores: ProfessionalSkillScores;
	pool: number;
	onChange: (scores: ProfessionalSkillScores) => void;
}

type StatAllocationPanelProps = AttributeAllocationPanelProps | SkillAllocationPanelProps;

export function StatAllocationPanel(props: StatAllocationPanelProps) {
	const remaining = getRemainingAllocationPoints(props.scores, props.pool);
	const ids = props.mode === 'attributes' ? CORE_ATTRIBUTE_IDS : PROFESSIONAL_SKILL_IDS;

	return (
		<div className="allocation-panel">
			<div className="allocation-pool terminal-bevel-sm">
				<span className="allocation-pool-label">POINTS REMAINING</span>
				<span className={`allocation-pool-value ${remaining === 0 ? 'allocation-pool-value--ready' : ''}`}>
					{remaining} / {props.pool}
				</span>
			</div>
			<p className="allocation-rules">
				Base starts at 5. Range {ALLOCATION_STAT_MIN}–{ALLOCATION_STAT_MAX}. Allocate every point before
				continuing.
			</p>

			<div className="allocation-list">
				{ids.map((id) => {
					const value =
						props.mode === 'attributes'
							? props.scores[id as CoreAttributeId]
							: props.scores[id as ProfessionalSkillId];
					const label =
						props.mode === 'attributes'
							? CORE_ATTRIBUTES[id as CoreAttributeId].name
							: PROFESSIONAL_SKILLS[id as ProfessionalSkillId].name;
					const description =
						props.mode === 'attributes'
							? CORE_ATTRIBUTES[id as CoreAttributeId].description
							: PROFESSIONAL_SKILLS[id as ProfessionalSkillId].description;

					const canUp = canIncreaseAllocation(props.scores, id, props.pool);
					const canDown = canDecreaseAllocation(props.scores, id);

					return (
						<div key={id} className="allocation-row terminal-bevel-sm">
							<div className="allocation-row-copy">
								<div className="allocation-row-name">{label}</div>
								<div className="allocation-row-desc">{description}</div>
							</div>
							<div className="allocation-controls">
								<button
									type="button"
									className="allocation-btn"
									disabled={!canDown}
									onClick={() => {
										if (props.mode === 'attributes') {
											props.onChange({
												...props.scores,
												[id]: value - 1,
											});
										} else {
											props.onChange({
												...props.scores,
												[id]: value - 1,
											});
										}
									}}
									aria-label={`Decrease ${label}`}
								>
									−
								</button>
								<span className="allocation-value">{value}</span>
								<button
									type="button"
									className="allocation-btn"
									disabled={!canUp}
									onClick={() => {
										if (props.mode === 'attributes') {
											props.onChange({
												...props.scores,
												[id]: value + 1,
											});
										} else {
											props.onChange({
												...props.scores,
												[id]: value + 1,
											});
										}
									}}
									aria-label={`Increase ${label}`}
								>
									+
								</button>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
