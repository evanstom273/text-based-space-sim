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
	'Keyali', 'Novak', 'Sinclair', 'Haros', 'Darzi',
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

const GELATIN_FIRST = [
	'Yaphit', 'Blort', 'Squel', 'Gloop', 'Plyx', 'Vorm', 'Jell', 'Nurp',
] as const;

const GELATIN_LAST = [
	'Ossium', 'Plasmid', 'Viscin', 'Marrow', 'Cyte', 'Flux',
] as const;

const RETEPSIAN_FIRST = [
	'Darulio', 'Sorella', 'Vennar', 'Lissik', 'Orven', 'Tahlis', 'Mirek',
] as const;

const RETEPSIAN_LAST = [
	'Thenn', 'Orsul', 'Valen', 'Koris', 'Senn', 'Ilyth',
] as const;

const BRUIDIAN_FIRST = [
	'Brava', 'Kestis', 'Ormun', 'Talvek', 'Shira', 'Dorn', 'Veska',
] as const;

const BRUIDIAN_LAST = [
	'Bruin', 'Kesh', 'Varda', 'Tolm', 'Rask', 'Niv',
] as const;

const JANISI_FIRST = [
	'Janel', 'Sorith', 'Calen', 'Mirath', 'Ovesh', 'Tiran', 'Lume',
] as const;

const JANISI_LAST = [
	'Janar', 'Selith', 'Vorr', 'Ameth', 'Quill', 'Nareth',
] as const;

const SARGUN_FIRST = [
	'Lysella', 'Sarga', 'Runek', 'Vasha', 'Torun', 'Mekla', 'Ishar',
] as const;

const SARGUN_LAST = [
	'Sarn', 'Gurek', 'Vash', 'Korr', 'Thun', 'Mek',
] as const;

const NAVARIAN_FIRST = [
	'Nava', 'Runek', 'Vasha', 'Torun', 'Mekla', 'Ishar', 'Dren',
] as const;

const NAVARIAN_LAST = [
	'Navar', 'Gurek', 'Vash', 'Korr', 'Thun', 'Mek',
] as const;

const CALIVON_FIRST = [
	'Caliv', 'Liora', 'Venn', 'Syla', 'Korin', 'Thessa', 'Marek',
] as const;

const CALIVON_LAST = [
	'Calor', 'Veyne', 'Solis', 'Korrin', 'Nydel', 'Ashar',
] as const;

function randomItem<T>(items: readonly T[]): T {
	return items[Math.floor(Math.random() * items.length)] as T;
}

function humanoidName(
	gender: PersonnelGender,
	female: readonly string[],
	male: readonly string[],
	last: readonly string[],
): { firstName: string; lastName: string } {
	const first =
		gender === 'male'
			? randomItem(male)
			: gender === 'female'
				? randomItem(female)
				: gender === 'nonbinary'
					? randomItem(
							female === HUMAN_FIRST_FEMALE && male === HUMAN_FIRST_MALE
								? HUMAN_FIRST_NB
								: [...female, ...male],
						)
					: randomItem([...female, ...male]);
	return { firstName: first, lastName: randomItem(last) };
}

export function pickGenderForSpecies(speciesId: SpeciesId): PersonnelGender {
	if (speciesId === 'moclan') {
		return Math.random() < 0.92 ? 'male' : 'female';
	}

	if (speciesId === 'janisi') {
		return Math.random() < 0.85 ? 'female' : 'male';
	}

	if (speciesId === 'gelatin') {
		return Math.random() < 0.7 ? 'unspecified' : 'nonbinary';
	}

	if (speciesId === 'retepsian') {
		return Math.random() < 0.55 ? 'unspecified' : 'nonbinary';
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
	switch (speciesId) {
		case 'moclan':
			return {
				firstName: randomItem(MOCLAN_FIRST),
				lastName: randomItem(MOCLAN_LAST),
			};
		case 'xelayan':
			return humanoidName(gender, XELAYAN_FIRST_FEMALE, XELAYAN_FIRST_MALE, XELAYAN_LAST);
		case 'gelatin':
			return {
				firstName: randomItem(GELATIN_FIRST),
				lastName: randomItem(GELATIN_LAST),
			};
		case 'retepsian':
			return {
				firstName: randomItem(RETEPSIAN_FIRST),
				lastName: randomItem(RETEPSIAN_LAST),
			};
		case 'bruidian':
			return humanoidName(gender, BRUIDIAN_FIRST, BRUIDIAN_FIRST, BRUIDIAN_LAST);
		case 'janisi':
			return humanoidName(gender, JANISI_FIRST, JANISI_FIRST, JANISI_LAST);
		case 'sargun':
			return humanoidName(gender, SARGUN_FIRST, SARGUN_FIRST, SARGUN_LAST);
		case 'navarian':
			return humanoidName(gender, NAVARIAN_FIRST, NAVARIAN_FIRST, NAVARIAN_LAST);
		case 'calivon':
			return humanoidName(gender, CALIVON_FIRST, CALIVON_FIRST, CALIVON_LAST);
		case 'kaylon':
			return {
				firstName: `Unit-${Math.floor(100 + Math.random() * 900)}`,
				lastName: 'Kaylon',
			};
		case 'human':
		default:
			return humanoidName(gender, HUMAN_FIRST_FEMALE, HUMAN_FIRST_MALE, HUMAN_LAST);
	}
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
