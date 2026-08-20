import { useMemo, useState } from 'react';
import { AppIconRenderer } from '../common/AppIconRenderer';
import { useActiveCommandProfile } from '../../context/GameSessionContext';
import {
	CORE_ATTRIBUTE_IDS,
	CORE_ATTRIBUTES,
	formatGenderLabel,
	formatPersonnelDisplayName,
	formatPersonnelTitleLine,
	formatStatWithModifier,
	getCommandAppointment,
	getDivision,
	getEffectiveAttributeBreakdown,
	getEffectiveSkillBreakdown,
	getPosition,
	getRank,
	getSpecies,
	listRosterForDisplay,
	PROFESSIONAL_SKILL_IDS,
	PROFESSIONAL_SKILLS,
	type PersonnelRecord,
} from '../../domain/personnel';

interface CrewRosterAppProps {
	windowId: string;
	appId: string;
}

function PersonnelProfileView({
	person,
	roleLabel,
	isSecondOfficer,
	onBack,
}: {
	person: PersonnelRecord;
	roleLabel: string;
	isSecondOfficer: boolean;
	onBack: () => void;
}) {
	const species = getSpecies(person.speciesId);
	const rank = getRank(person.rankId);
	const division = getDivision(person.divisionId);
	const position = getPosition(person.positionId);
	const appointment =
		person.commandAppointmentId != null
			? getCommandAppointment(person.commandAppointmentId)
			: isSecondOfficer
				? getCommandAppointment('second_officer')
				: null;

	return (
		<div className="crew-profile flex flex-col gap-4">
			<div>
				<button type="button" className="game-btn game-btn--ghost" onClick={onBack}>
					← ROSTER
				</button>
			</div>

			<section className="module-panel rounded-sm p-4 terminal-bevel-sm">
				<p className="crew-profile-role">{roleLabel.toUpperCase()}</p>
				<h3 className="crew-profile-name">{formatPersonnelTitleLine(person)}</h3>
				<p className="module-copy-muted mt-1">
					{species.name} · {formatGenderLabel(person.gender)}
					{person.ageYears != null ? ` · Age ${person.ageYears}` : ''}
				</p>
				<div className="crew-profile-meta mt-4">
					<div>
						<span className="crew-meta-label">Rank</span>
						<span className="crew-meta-value">{rank.name}</span>
					</div>
					<div>
						<span className="crew-meta-label">Division</span>
						<span className="crew-meta-value">{division.name}</span>
					</div>
					<div>
						<span className="crew-meta-label">Position</span>
						<span className="crew-meta-value">{position.name}</span>
					</div>
					{appointment ? (
						<div>
							<span className="crew-meta-label">Appointment</span>
							<span className="crew-meta-value crew-meta-value--gold">{appointment.name}</span>
						</div>
					) : null}
					<div>
						<span className="crew-meta-label">Status</span>
						<span className="crew-meta-value">{person.status}</span>
					</div>
				</div>
			</section>

			<section className="module-panel rounded-sm p-4 terminal-bevel-sm">
				<h4 className="module-heading">Core Attributes</h4>
				<div className="crew-stat-grid mt-3">
					{CORE_ATTRIBUTE_IDS.map((id) => (
						<div key={id} className="crew-stat-row">
							<span>{CORE_ATTRIBUTES[id].name}</span>
							<strong>{formatStatWithModifier(getEffectiveAttributeBreakdown(person, id))}</strong>
						</div>
					))}
				</div>
			</section>

			<section className="module-panel rounded-sm p-4 terminal-bevel-sm">
				<h4 className="module-heading">Professional Skills</h4>
				<div className="crew-stat-grid mt-3">
					{PROFESSIONAL_SKILL_IDS.map((id) => (
						<div key={id} className="crew-stat-row">
							<span>{PROFESSIONAL_SKILLS[id].name}</span>
							<strong>{formatStatWithModifier(getEffectiveSkillBreakdown(person, id))}</strong>
						</div>
					))}
				</div>
			</section>

			<section className="module-panel rounded-sm p-4 terminal-bevel-sm">
				<h4 className="module-heading">Species Notes</h4>
				<p className="module-copy-muted mt-2">{species.description}</p>
				{species.biologyNotes ? (
					<p className="module-copy-muted mt-2">{species.biologyNotes}</p>
				) : null}
			</section>
		</div>
	);
}

export function CrewRosterApp(_props: CrewRosterAppProps) {
	const profile = useActiveCommandProfile();
	const [selectedId, setSelectedId] = useState<string | null>(null);

	const roster = profile.future.crew;
	const entries = useMemo(() => (roster ? listRosterForDisplay(roster) : []), [roster]);
	const selectedEntry = entries.find((entry) => entry.person.id === selectedId) ?? null;

	return (
		<div className="module-shell module-workspace select-text">
			<div className="module-header px-6 py-4">
				<div className="flex items-center gap-3">
					<div className="module-icon-frame terminal-bevel-sm">
						<AppIconRenderer icon="users" size={20} />
					</div>
					<div>
						<h2 className="module-title">Crew Roster</h2>
						<p className="module-subtitle">REC-01 · Personnel records</p>
					</div>
				</div>
			</div>

			<div className="module-body flex flex-col gap-4 overflow-y-auto px-6 py-6">
				{!roster || entries.length === 0 ? (
					<section className="module-panel rounded-sm p-6 text-center terminal-bevel-sm">
						<p className="module-copy">No personnel records on file for this command.</p>
						<p className="module-copy-muted mt-2">
							Senior staff assigned during New Command Assignment will appear here.
						</p>
					</section>
				) : selectedEntry ? (
					<PersonnelProfileView
						person={selectedEntry.person}
						roleLabel={selectedEntry.roleLabel}
						isSecondOfficer={selectedEntry.isSecondOfficer}
						onBack={() => setSelectedId(null)}
					/>
				) : (
					<>
						<p className="crew-roster-lede">
							Planetary Union personnel assigned to this vessel. Select an officer to open their
							service profile.
						</p>
						<section className="crew-roster-section">
							<h3 className="crew-roster-section-title">COMMAND & SENIOR STAFF</h3>
							<div className="crew-roster-list">
								{entries.map((entry) => {
									const species = getSpecies(entry.person.speciesId);
									const rank = getRank(entry.person.rankId);
									return (
										<button
											key={entry.person.id}
											type="button"
											className="crew-roster-row terminal-bevel-sm"
											onClick={() => setSelectedId(entry.person.id)}
										>
											<div className="crew-roster-row-main">
												<div className="crew-roster-row-role">
													{entry.roleLabel}
													{entry.isSecondOfficer ? ' · Second Officer' : ''}
												</div>
												<div className="crew-roster-row-name">
													{rank.abbreviation}{' '}
													{formatPersonnelDisplayName(entry.person.identity)}
												</div>
												<div className="crew-roster-row-meta">
													{species.name}
													{entry.person.ageYears != null
														? ` · Age ${entry.person.ageYears}`
														: ''}
													{' · '}
													{formatGenderLabel(entry.person.gender)}
												</div>
											</div>
											<span className="crew-roster-row-chevron" aria-hidden="true">
												›
											</span>
										</button>
									);
								})}
							</div>
						</section>
					</>
				)}
			</div>
		</div>
	);
}
