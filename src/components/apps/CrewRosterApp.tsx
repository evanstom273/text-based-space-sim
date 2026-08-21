import { useMemo, useState } from 'react';
import { AppIconRenderer } from '../common/AppIconRenderer';
import { useActiveCommandProfile } from '../../context/GameSessionContext';
import {
	CORE_ATTRIBUTE_IDS,
	CORE_ATTRIBUTES,
	DIVISION_LIST,
	formatGenderLabel,
	formatModifierDelta,
	formatPersonnelDisplayName,
	formatPersonnelTitleLine,
	getCommandAppointment,
	getDivision,
	getEffectiveAttributeBreakdown,
	getEffectiveSkillBreakdown,
	getPosition,
	getRank,
	getRelationshipType,
	getRelationshipLabelTowardOther,
	getSpecies,
	listRelationshipsFrom,
	listRosterForDisplay,
	POSITION_LIST,
	PROFESSIONAL_SKILL_IDS,
	PROFESSIONAL_SKILLS,
	RANK_LIST,
	SPECIES_LIST,
	STAT_BASE_MAX,
	type DivisionId,
	type EffectiveStatBreakdown,
	type PersonnelGender,
	type PersonnelRecord,
	type PersonnelRelationship,
	type PositionId,
	type RankId,
	type RosterListEntry,
	type SpeciesId,
} from '../../domain/personnel';

interface CrewRosterAppProps {
	windowId: string;
	appId: string;
}

type RosterCategory =
	| 'all'
	| 'senior_staff'
	| 'command'
	| 'engineering'
	| 'security'
	| 'medical'
	| 'science'
	| 'civilian';

const ROSTER_CATEGORIES: ReadonlyArray<{ id: RosterCategory; label: string }> = [
	{ id: 'all', label: 'All Personnel' },
	{ id: 'senior_staff', label: 'Senior Staff' },
	{ id: 'command', label: 'Command' },
	{ id: 'engineering', label: 'Engineering' },
	{ id: 'security', label: 'Security' },
	{ id: 'medical', label: 'Medical' },
	{ id: 'science', label: 'Science' },
	{ id: 'civilian', label: 'Civilians' },
];

const CATEGORY_DIVISION: Partial<Record<RosterCategory, DivisionId>> = {
	command: 'command',
	engineering: 'engineering',
	security: 'security',
	medical: 'medical',
	science: 'science',
};

interface RosterFilters {
	divisionId: DivisionId | '';
	rankId: RankId | '';
	speciesId: SpeciesId | '';
	gender: PersonnelGender | '';
	positionId: PositionId | '';
}

const EMPTY_FILTERS: RosterFilters = {
	divisionId: '',
	rankId: '',
	speciesId: '',
	gender: '',
	positionId: '',
};

type HierarchyAccent = 'captain' | 'xo' | 'senior' | 'standard';

function getHierarchyAccent(entry: RosterListEntry): HierarchyAccent {
	if (entry.isCaptain) {
		return 'captain';
	}
	if (entry.person.positionId === 'first_officer') {
		return 'xo';
	}
	if (entry.isSeniorStaff || entry.isSecondOfficer) {
		return 'senior';
	}
	return 'standard';
}

function formatStatusLabel(status: PersonnelRecord['status']): string {
	return status.replace(/_/g, ' ');
}

function buildRoleLine(entry: RosterListEntry): string {
	const parts = [entry.roleLabel];
	if (entry.isSecondOfficer) {
		parts.push('Second Officer');
	}
	return parts.join(' · ');
}

function matchesSearch(entry: RosterListEntry, query: string): boolean {
	const trimmed = query.trim().toLowerCase();
	if (!trimmed) {
		return true;
	}

	const person = entry.person;
	const rank = person.rankId ? getRank(person.rankId) : null;
	const division = person.divisionId ? getDivision(person.divisionId) : null;
	const position = person.positionId ? getPosition(person.positionId) : null;
	const species = getSpecies(person.speciesId);
	const name = formatPersonnelDisplayName(person.identity);

	const haystack = [
		name,
		person.identity.firstName,
		person.identity.lastName,
		person.identity.middleName ?? '',
		rank?.name ?? '',
		rank?.abbreviation ?? '',
		division?.name ?? '',
		position?.name ?? '',
		species.name,
		entry.roleLabel,
		person.commandAppointmentId ?? '',
		person.personnelKind ?? '',
		person.civilianRoleId ?? '',
	]
		.join(' ')
		.toLowerCase();

	return haystack.includes(trimmed);
}

function matchesFilters(entry: RosterListEntry, filters: RosterFilters): boolean {
	const { person } = entry;
	if (filters.divisionId && person.divisionId !== filters.divisionId) {
		return false;
	}
	if (filters.rankId && person.rankId !== filters.rankId) {
		return false;
	}
	if (filters.speciesId && person.speciesId !== filters.speciesId) {
		return false;
	}
	if (filters.gender && person.gender !== filters.gender) {
		return false;
	}
	if (filters.positionId && person.positionId !== filters.positionId) {
		return false;
	}
	return true;
}

function matchesCategory(entry: RosterListEntry, category: RosterCategory): boolean {
	if (category === 'all') {
		return true;
	}
	if (category === 'senior_staff') {
		return entry.isCaptain || entry.isSeniorStaff;
	}
	if (category === 'civilian') {
		return entry.person.personnelKind === 'civilian';
	}
	return entry.person.divisionId === CATEGORY_DIVISION[category];
}

function countActiveFilters(filters: RosterFilters): number {
	return Object.values(filters).filter((value) => value !== '').length;
}

function StatMeter({
	label,
	breakdown,
}: {
	label: string;
	breakdown: EffectiveStatBreakdown;
}) {
	const fillPercent = Math.max(
		0,
		Math.min(100, (breakdown.effective / STAT_BASE_MAX) * 100),
	);
	const hasModifier = breakdown.totalModifier !== 0;

	return (
		<div className="crew-meter">
			<div className="crew-meter-head">
				<span className="crew-meter-label">{label}</span>
				<span className="crew-meter-values">
					<span className="crew-meter-base">{breakdown.base}</span>
					{hasModifier ? (
						<span className="crew-meter-mod">
							({formatModifierDelta(breakdown.totalModifier)})
						</span>
					) : null}
					<span className="crew-meter-arrow" aria-hidden="true">
						→
					</span>
					<strong className="crew-meter-effective">{breakdown.effective}</strong>
				</span>
			</div>
			<div
				className="crew-meter-track"
				role="meter"
				aria-label={label}
				aria-valuemin={0}
				aria-valuemax={STAT_BASE_MAX}
				aria-valuenow={breakdown.effective}
			>
				<div className="crew-meter-fill" style={{ width: `${fillPercent}%` }} />
			</div>
		</div>
	);
}

function PersonnelProfileView({
	person,
	roleLabel,
	isCaptain,
	isSecondOfficer,
	relationships,
	personnelById,
	onBack,
}: {
	person: PersonnelRecord;
	roleLabel: string;
	isCaptain: boolean;
	isSecondOfficer: boolean;
	relationships: readonly PersonnelRelationship[];
	personnelById: ReadonlyMap<string, PersonnelRecord>;
	onBack: () => void;
}) {
	const species = getSpecies(person.speciesId);
	const rank = person.rankId ? getRank(person.rankId) : null;
	const division = person.divisionId ? getDivision(person.divisionId) : null;
	const position = person.positionId ? getPosition(person.positionId) : null;
	const appointment =
		person.commandAppointmentId != null
			? getCommandAppointment(person.commandAppointmentId)
			: isSecondOfficer
				? getCommandAppointment('second_officer')
				: null;

	const accent: HierarchyAccent = isCaptain
		? 'captain'
		: person.positionId === 'first_officer'
			? 'xo'
			: 'senior';

	const personRelationships = listRelationshipsFrom(relationships, person.id)
		.map((relationship) => {
			const other = personnelById.get(relationship.toPersonnelId);
			if (!other) return null;
			const type = getRelationshipType(relationship.typeId);
			return {
				id: relationship.id,
				label: getRelationshipLabelTowardOther(relationship.typeId),
				category: type.category,
				otherName: formatPersonnelDisplayName(other.identity),
			};
		})
		.filter((entry): entry is NonNullable<typeof entry> => entry !== null);
	const professionalLinks = personRelationships.filter((entry) => entry.category === 'professional');
	const personalLinks = personRelationships.filter((entry) => entry.category === 'personal');


	return (
		<div className="crew-profile">
			<div className="crew-profile-toolbar">
				<button type="button" className="game-btn game-btn--ghost" onClick={onBack}>
					← ROSTER
				</button>
			</div>

			<header className={`crew-dossier crew-dossier--${accent} terminal-bevel-sm`}>
				<div className="crew-dossier-topline">
					<span className="crew-dossier-role">
						{roleLabel.toUpperCase()}
						{isSecondOfficer ? ' · SECOND OFFICER' : ''}
					</span>
					{person.service.serviceNumber ? (
						<span className="crew-dossier-id">ID {person.service.serviceNumber}</span>
					) : null}
				</div>
				<h3 className="crew-dossier-name">{formatPersonnelTitleLine(person)}</h3>
				<p className="crew-dossier-identity">
					{species.name}
					{person.dateOfBirth ? ` · DOB ${person.dateOfBirth}` : ''}
					{person.ageYears != null ? ` · Age ${person.ageYears}` : ''}
					{` · ${formatGenderLabel(person.gender)}`}
				</p>
				<div className="crew-dossier-grid">
					<div>
						<span className="crew-meta-label">Rank</span>
						<span className="crew-meta-value">{rank?.name ?? (person.personnelKind === 'civilian' ? 'Civilian' : '—')}</span>
					</div>
					<div>
						<span className="crew-meta-label">Division</span>
						<span className="crew-meta-value">{division?.name ?? (person.personnelKind === 'civilian' ? 'Civilian' : '—')}</span>
					</div>
					<div>
						<span className="crew-meta-label">Position</span>
						<span className="crew-meta-value">{position?.name ?? (person.personnelKind === 'civilian' ? 'Civilian' : '—')}</span>
					</div>
					{appointment ? (
						<div>
							<span className="crew-meta-label">Appointment</span>
							<span className="crew-meta-value crew-meta-value--gold">
								{appointment.name}
							</span>
						</div>
					) : null}
					<div>
						<span className="crew-meta-label">Status</span>
						<span className="crew-meta-value">{formatStatusLabel(person.status)}</span>
					</div>
				</div>
			</header>

			<section className="crew-section terminal-bevel-sm">
				<h4 className="crew-section-title">Core Attributes</h4>
				<div className="crew-meter-list">
					{CORE_ATTRIBUTE_IDS.map((id) => (
						<StatMeter
							key={id}
							label={CORE_ATTRIBUTES[id].name}
							breakdown={getEffectiveAttributeBreakdown(person, id)}
						/>
					))}
				</div>
			</section>

			<section className="crew-section terminal-bevel-sm">
				<h4 className="crew-section-title">Professional Skills</h4>
				<div className="crew-meter-list">
					{PROFESSIONAL_SKILL_IDS.map((id) => (
						<StatMeter
							key={id}
							label={PROFESSIONAL_SKILLS[id].name}
							breakdown={getEffectiveSkillBreakdown(person, id)}
						/>
					))}
				</div>
			</section>

			<section className="crew-section terminal-bevel-sm">
				<h4 className="crew-section-title">Species Profile</h4>
				<p className="crew-section-copy">{species.description}</p>
				{species.biologyNotes ? (
					<p className="crew-section-copy crew-section-copy--dim">{species.biologyNotes}</p>
				) : null}
			</section>

			
			<section className="crew-section terminal-bevel-sm">
				<h4 className="crew-section-title">Professional Relationships</h4>
				{professionalLinks.length > 0 ? (
					<ul className="crew-relationship-list">
						{professionalLinks.map((link) => (
							<li key={link.id}>
								{link.label}: {link.otherName}
							</li>
						))}
					</ul>
				) : (
					<p className="crew-section-copy crew-section-copy--dim">
						No professional relationships on file.
					</p>
				)}
			</section>

			<section className="crew-section terminal-bevel-sm">
				<h4 className="crew-section-title">Personal Relationships</h4>
				{personalLinks.length > 0 ? (
					<ul className="crew-relationship-list">
						{personalLinks.map((link) => (
							<li key={link.id}>
								{link.label}: {link.otherName}
							</li>
						))}
					</ul>
				) : (
					<p className="crew-section-copy crew-section-copy--dim">
						No personal relationships on file.
					</p>
				)}
			</section>

			{!isCaptain ? (
				<section className="crew-section crew-section--actions terminal-bevel-sm">
					<h4 className="crew-section-title">Command Actions</h4>
					<p className="crew-section-copy crew-section-copy--dim">
						Command interaction protocols reserved for future systems.
					</p>
				</section>
			) : null}
		</div>
	);
}

function RosterEntryButton({
	entry,
	onSelect,
}: {
	entry: RosterListEntry;
	onSelect: (id: string) => void;
}) {
	const species = getSpecies(entry.person.speciesId);
	const rank = entry.person.rankId ? getRank(entry.person.rankId) : null;
	const accent = getHierarchyAccent(entry);

	return (
		<button
			type="button"
			className={`crew-entry crew-entry--${accent} terminal-bevel-sm`}
			onClick={() => onSelect(entry.person.id)}
		>
			<span className="crew-entry-accent" aria-hidden="true" />
			<div className="crew-entry-body">
				<div className="crew-entry-role">{buildRoleLine(entry)}</div>
				<div className="crew-entry-name">
					{rank ? `${rank.abbreviation} ` : ''}{formatPersonnelDisplayName(entry.person.identity)}
				</div>
				<div className="crew-entry-meta">
					{species.name}
					{entry.person.ageYears != null ? ` · Age ${entry.person.ageYears}` : ''}
					{` · ${formatGenderLabel(entry.person.gender)}`}
				</div>
			</div>
			<span className="crew-entry-chevron" aria-hidden="true">
				›
			</span>
		</button>
	);
}

export function CrewRosterApp(_props: CrewRosterAppProps) {
	const profile = useActiveCommandProfile();
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [category, setCategory] = useState<RosterCategory>('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [filters, setFilters] = useState<RosterFilters>(EMPTY_FILTERS);
	const [filtersOpen, setFiltersOpen] = useState(false);

	const roster = profile.future.crew;
	const entries = useMemo(() => (roster ? listRosterForDisplay(roster) : []), [roster]);
	const personnelById = useMemo(() => {
		const map = new Map<string, PersonnelRecord>();
		for (const entry of entries) {
			map.set(entry.person.id, entry.person);
		}
		return map;
	}, [entries]);

	const selectedEntry = entries.find((entry) => entry.person.id === selectedId) ?? null;

	const genderOptions = useMemo(() => {
		const seen = new Set<PersonnelGender>();
		for (const entry of entries) {
			seen.add(entry.person.gender);
		}
		return Array.from(seen).sort();
	}, [entries]);

	const speciesOptions = useMemo(() => {
		const present = new Set(entries.map((entry) => entry.person.speciesId));
		const fromRoster = SPECIES_LIST.filter((species) => present.has(species.id));
		return fromRoster.length > 0 ? fromRoster : SPECIES_LIST;
	}, [entries]);

	const filteredEntries = useMemo(() => {
		return entries.filter(
			(entry) =>
				matchesCategory(entry, category) &&
				matchesSearch(entry, searchQuery) &&
				matchesFilters(entry, filters),
		);
	}, [entries, category, searchQuery, filters]);

	const activeFilterCount = countActiveFilters(filters);
	const hasQueryOrFilters = searchQuery.trim().length > 0 || activeFilterCount > 0;

	const clearFilters = () => {
		setFilters(EMPTY_FILTERS);
		setSearchQuery('');
	};

	const updateFilter = <K extends keyof RosterFilters>(key: K, value: RosterFilters[K]) => {
		setFilters((current) => ({ ...current, [key]: value }));
	};

	return (
		<div className="module-shell module-workspace select-text">
			<div className="module-header px-4 py-3 sm:px-6 sm:py-4">
				<div className="flex items-center gap-3">
					<div className="module-icon-frame terminal-bevel-sm">
						<AppIconRenderer icon="users" size={20} />
					</div>
					<div>
						<h2 className="module-title">Crew Roster</h2>
						<p className="module-subtitle">
							REC-01 ·{' '}
							{roster
								? `${entries.length} personnel aboard · ${roster.relationships.length} relationships`
								: 'Personnel records'}
						</p>
					</div>
				</div>
			</div>

			<div className="module-body flex min-h-0 flex-col gap-3 overflow-y-auto px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">
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
						isCaptain={selectedEntry.isCaptain}
						isSecondOfficer={selectedEntry.isSecondOfficer}
						relationships={roster.relationships}
						personnelById={personnelById}
						onBack={() => setSelectedId(null)}
					/>
				) : (
					<>
						<nav className="crew-cat-nav" aria-label="Roster categories">
							{ROSTER_CATEGORIES.map((item) => (
								<button
									key={item.id}
									type="button"
									className={
										category === item.id
											? 'crew-cat-tab crew-cat-tab--active'
											: 'crew-cat-tab'
									}
									onClick={() => setCategory(item.id)}
								>
									{item.label}
								</button>
							))}
						</nav>

						<div className="crew-toolbar">
							<label className="crew-search">
								<span className="crew-search-label">Search</span>
								<input
									type="search"
									className="crew-search-input"
									placeholder="Name, rank, position, species…"
									value={searchQuery}
									onChange={(event) => setSearchQuery(event.target.value)}
								/>
							</label>
							<button
								type="button"
								className={
									filtersOpen || activeFilterCount > 0
										? 'crew-filter-toggle crew-filter-toggle--active'
										: 'crew-filter-toggle'
								}
								onClick={() => setFiltersOpen((open) => !open)}
								aria-expanded={filtersOpen}
							>
								Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
							</button>
						</div>

						{filtersOpen ? (
							<div className="crew-filter-panel terminal-bevel-sm">
								<div className="crew-filter-grid">
									<label className="crew-filter-field">
										<span>Division</span>
										<select
											value={filters.divisionId}
											onChange={(event) =>
												updateFilter(
													'divisionId',
													event.target.value as DivisionId | '',
												)
											}
										>
											<option value="">All</option>
											{DIVISION_LIST.map((division) => (
												<option key={division.id} value={division.id}>
													{division.name}
												</option>
											))}
										</select>
									</label>
									<label className="crew-filter-field">
										<span>Rank</span>
										<select
											value={filters.rankId}
											onChange={(event) =>
												updateFilter('rankId', event.target.value as RankId | '')
											}
										>
											<option value="">All</option>
											{RANK_LIST.map((rank) => (
												<option key={rank.id} value={rank.id}>
													{rank.name}
												</option>
											))}
										</select>
									</label>
									<label className="crew-filter-field">
										<span>Species</span>
										<select
											value={filters.speciesId}
											onChange={(event) =>
												updateFilter(
													'speciesId',
													event.target.value as SpeciesId | '',
												)
											}
										>
											<option value="">All</option>
											{speciesOptions.map((species) => (
												<option key={species.id} value={species.id}>
													{species.name}
												</option>
											))}
										</select>
									</label>
									<label className="crew-filter-field">
										<span>Gender</span>
										<select
											value={filters.gender}
											onChange={(event) =>
												updateFilter(
													'gender',
													event.target.value as PersonnelGender | '',
												)
											}
										>
											<option value="">All</option>
											{genderOptions.map((gender) => (
												<option key={gender} value={gender}>
													{formatGenderLabel(gender)}
												</option>
											))}
										</select>
									</label>
									<label className="crew-filter-field">
										<span>Position</span>
										<select
											value={filters.positionId}
											onChange={(event) =>
												updateFilter(
													'positionId',
													event.target.value as PositionId | '',
												)
											}
										>
											<option value="">All</option>
											{POSITION_LIST.map((position) => (
												<option key={position.id} value={position.id}>
													{position.name}
												</option>
											))}
										</select>
									</label>
								</div>
								{hasQueryOrFilters ? (
									<div className="crew-filter-actions">
										<button
											type="button"
											className="game-btn game-btn--ghost"
											onClick={clearFilters}
										>
											Clear Filters
										</button>
									</div>
								) : null}
							</div>
						) : null}

						{hasQueryOrFilters && !filtersOpen ? (
							<div className="crew-active-filters">
								<span className="crew-active-filters-label">Active</span>
								{searchQuery.trim() ? (
									<span className="crew-chip">Search: {searchQuery.trim()}</span>
								) : null}
								{filters.divisionId ? (
									<span className="crew-chip">
										{getDivision(filters.divisionId).name}
									</span>
								) : null}
								{filters.rankId ? (
									<span className="crew-chip">{getRank(filters.rankId).name}</span>
								) : null}
								{filters.speciesId ? (
									<span className="crew-chip">
										{getSpecies(filters.speciesId).name}
									</span>
								) : null}
								{filters.gender ? (
									<span className="crew-chip">{formatGenderLabel(filters.gender)}</span>
								) : null}
								{filters.positionId ? (
									<span className="crew-chip">
										{getPosition(filters.positionId).name}
									</span>
								) : null}
								<button
									type="button"
									className="crew-chip-clear"
									onClick={clearFilters}
								>
									Clear
								</button>
							</div>
						) : null}

						<section className="crew-roster-section">
							<div className="crew-roster-section-head">
								<h3 className="crew-roster-section-title">
									{ROSTER_CATEGORIES.find((item) => item.id === category)?.label ??
										'Senior Staff'}
								</h3>
								<span className="crew-roster-count">
									{filteredEntries.length}
									{category === 'all' ? '' : ` of ${entries.length}`} personnel
								</span>
							</div>

							{filteredEntries.length === 0 ? (
								<div className="crew-empty terminal-bevel-sm">
									<p className="module-copy">No personnel match current criteria.</p>
									<p className="module-copy-muted mt-1">
										Try All Personnel, another division, or clear search/filters.
									</p>
								</div>
							) : (
								<div className="crew-roster-list">
									{filteredEntries.map((entry) => (
										<RosterEntryButton
											key={entry.person.id}
											entry={entry}
											onSelect={setSelectedId}
										/>
									))}
								</div>
							)}
						</section>
					</>
				)}
			</div>
		</div>
	);
}
