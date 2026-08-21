import { formatPersonnelDisplayName, getDivision, getPosition, getRank, getSpecies } from '../personnel';
import type { DialogueContext, ThirdPartyCandidate } from './types';

export function resolveTemplateVariables(
	template: string,
	context: DialogueContext,
	targetParty?: ThirdPartyCandidate,
): string | null {
	const { target, captain, vessel } = context;
	const person = target.record;
	const rank = person.rankId ? getRank(person.rankId) : null;
	const position = person.positionId ? getPosition(person.positionId) : null;
	const division = person.divisionId ? getDivision(person.divisionId) : null;
	const species = getSpecies(person.speciesId);

	const superior = target.directSuperior ?? target.departmentChief;
	const superiorRank = superior?.rankId ? getRank(superior.rankId) : null;
	const superiorName = superior
		? (superiorRank ? superiorRank.abbreviation + ' ' : '') + superior.identity.lastName
		: 'my chief';

	const subordinate = target.directSubordinates[0];
	const subordinateRank = subordinate?.rankId ? getRank(subordinate.rankId) : null;
	const subordinateName = subordinate
		? (subordinateRank ? subordinateRank.abbreviation + ' ' : '') + subordinate.identity.lastName
		: 'the team';

	const spouse = target.spouse;
	const spouseName = spouse ? formatPersonnelDisplayName(spouse.identity) : 'my partner';

	const childrenNames = target.children.length > 0
		? target.children.map((c) => c.identity.firstName).join(' and ')
		: 'the kids';

	const childName = target.children.length > 0
		? target.children[0].identity.firstName
		: 'my child';

	const personName = targetParty
		? formatPersonnelDisplayName(targetParty.person.identity)
		: person.identity.firstName;

	const personRank = targetParty?.person.rankId ? getRank(targetParty.person.rankId) : null;
	const personTitleName = targetParty
		? (personRank ? personRank.abbreviation + ' ' : '') + targetParty.person.identity.lastName
		: personName;

	const subjectPronoun = person.gender === 'female' ? 'she' : person.gender === 'male' ? 'he' : 'they';
	const objectPronoun = person.gender === 'female' ? 'her' : person.gender === 'male' ? 'him' : 'them';
	const possessivePronoun = person.gender === 'female' ? 'her' : person.gender === 'male' ? 'his' : 'their';

	const departmentName = division ? division.name : 'the ship';

	const replacements: Record<string, string> = {
		firstName: person.identity.firstName,
		lastName: person.identity.lastName,
		fullName: formatPersonnelDisplayName(person.identity),
		rank: rank ? rank.name : '',
		rankAbbr: rank ? rank.abbreviation : '',
		position: position ? position.name : 'Crew member',
		division: division ? division.name : 'Ship Operations',
		species: species.name,
		captainName: captain.name,
		shipName: vessel.name,
		spouseName,
		childName,
		childrenNames,
		superiorName,
		subordinateName,
		personName,
		personTitleName,
		currentDate: target.shipDateFormatted,
		currentTime: target.shipTimeFormatted,
		departmentName,
		subjectPronoun,
		objectPronoun,
		possessivePronoun,
	};

	let result = template;
	for (const [key, value] of Object.entries(replacements)) {
		const pattern = new RegExp('\\{' + key + '\\}', 'g');
		result = result.replace(pattern, value);
	}

	if (/\{[a-zA-Z0-9_-]+\}/.test(result)) {
		return null;
	}

	return result.trim();
}
