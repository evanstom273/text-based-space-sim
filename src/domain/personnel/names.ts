import type { PersonnelGender } from './personnel';
import type { SpeciesId } from './species';

const HUMAN_FIRST_FEMALE = [
	'Lyra', 'Kelly', 'Helen', 'Olivia', 'Nadia', 'Tessa', 'Claire', 'Ava', 'Maya', 'Irene', 'Sophia', 'Elena',
] as const;

const HUMAN_FIRST_MALE = [
	'Ed', 'Gordon', 'John', 'Adrian', 'Marcus', 'Rhett', 'Isaac', 'Nathan', 'Cole', 'Owen', 'Felix', 'Victor',
] as const;

const HUMAN_FIRST_NB = [
	'Alex', 'Jordan', 'Casey', 'Riley', 'Quinn', 'Morgan', 'Avery', 'Reese',
] as const;

const HUMAN_LAST = [
	'Evans', 'Mercer', 'Grayson', 'Malloy', 'LaMarr', 'Finn', 'Palicki', 'Okuda', 'Chen', 'Reyes', 'Hale', 'Vance',
	'Keyali', 'Bortus', 'Kitan', 'Yaphit', 'Haros', 'Darzi', 'Novak', 'Sinclair',
] as const;

const MOCLAN_FIRST = [
	'Bortus', 'Klyden', 'Gathmok', 'Dorahl', 'Kemlac', 'Tarrun', 'Voshek', 'Mardok', 'Jenok', 'Harlok',
] as const;

const MOCLAN_LAST = [
	'Kitan', 'Darmek', 'Volnar', 'Shek', 'Torm', 'Grel', 'Mak', 'Nerok', 'Vash', 'Korun',
] as const;

const XELAYAN_FIRST_FEMALE = [
	'Alara', 'Talla', 'Sera', 'Nyra', 'Liora', 'Vela', 'Kira', 'Amara',
] as const;

const XELAYAN_FIRST_MALE = [
	'Orin', 'Kael', 'Daven', 'Riven', 'Torin', 'Jarek', 'Solan',
] as const;

const XELAYAN_LAST = [
	'Kitan', 'Veyra', 'Solen', 'Tharis', 'Quen', 'Ilyra', 'Nex', 'Auren',
] as const;

function randomItem<T>(items: readonly T[]): T {
	return items[Math.floor(Math.random() * items.length)] as T;
}

export function pickGenderForSpecies(speciesId: SpeciesId): PersonnelGender {
	if (speciesId === 'moclan') {
		// Moclan society is overwhelmingly male-presenting; rare exceptions possible.
		return Math.random() < 0.92 ? 'male' : 'female';
	}

	const roll = Math.random();
	if (roll < 0.46) return 'female';
	if (roll < 0.92) return 'male';
	return 'nonbinary';
}

export function generatePersonnelName(
	speciesId: SpeciesId,
	gender: PersonnelGender,
): { firstName: string; lastName: string } {
	if (speciesId === 'moclan') {
		return {
			firstName: randomItem(MOCLAN_FIRST),
			lastName: randomItem(MOCLAN_LAST),
		};
	}

	if (speciesId === 'xelayan') {
		const first =
			gender === 'male'
				? randomItem(XELAYAN_FIRST_MALE)
				: gender === 'female'
					? randomItem(XELAYAN_FIRST_FEMALE)
					: randomItem([...XELAYAN_FIRST_FEMALE, ...XELAYAN_FIRST_MALE]);
		return {
			firstName: first,
			lastName: randomItem(XELAYAN_LAST),
		};
	}

	const first =
		gender === 'male'
			? randomItem(HUMAN_FIRST_MALE)
			: gender === 'female'
				? randomItem(HUMAN_FIRST_FEMALE)
				: randomItem(HUMAN_FIRST_NB);

	return {
		firstName: first,
		lastName: randomItem(HUMAN_LAST),
	};
}

export function formatGenderLabel(gender: PersonnelGender): string {
	switch (gender) {
		case 'female':
			return 'Female';
		case 'male':
			return 'Male';
		case 'nonbinary':
			return 'Non-binary';
		case 'other':
			return 'Other';
		default:
			return 'Unspecified';
	}
}
