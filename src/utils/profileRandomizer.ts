const SHIP_NAMES = [
	'Clements',
	'Orville',
	'Boone',
	'Mercer',
	'Armstrong',
	'Charon',
	'Dorchester',
	'Franklin',
	'Grissom',
	'Heinlein',
	'Jefferson',
	'Kaylon',
	'Lincoln',
	'Malloy',
	'Newton',
	'Parker',
	'Quimby',
	'Reynolds',
	'Sagan',
	'Titan',
] as const;

const CAPTAIN_FIRST = [
	'Lyra',
	'Ed',
	'Kelly',
	'Gordon',
	'John',
	'Helen',
	'Olivia',
	'Adrian',
	'Marcus',
	'Nadia',
	'Tessa',
	'Rhett',
] as const;

const CAPTAIN_LAST = [
	'Evans',
	'Mercer',
	'Grayson',
	'Malloy',
	'LaMarr',
	'Finn',
	'Palicki',
	'Okuda',
	'Chen',
	'Reyes',
	'Hale',
	'Vance',
] as const;

const LOCATIONS = [
	'Epsilon Eridani Sector',
	'Kepler-442 Station Range',
	'Union Perimeter Grid Seven',
	'Outpost Corridor Theta',
	'Sector 18 Patrol Lane',
] as const;

function randomItem<T>(items: readonly T[]): T {
	return items[Math.floor(Math.random() * items.length)] as T;
}

function randomRegistryNumber(): string {
	const value = 1000 + Math.floor(Math.random() * 9000);
	return `ECV-${value}`;
}

export function randomShipName(): string {
	return randomItem(SHIP_NAMES);
}

export function randomRegistry(): string {
	return randomRegistryNumber();
}

export function randomCaptainName(): string {
	return `${randomItem(CAPTAIN_FIRST)} ${randomItem(CAPTAIN_LAST)}`;
}

export function randomAssignmentLocation(): string {
	return randomItem(LOCATIONS);
}

export function normalizeShipNameInput(value: string): string {
	const trimmed = value.trim();
	if (!trimmed) return '';
	if (/^USS\s+/i.test(trimmed)) {
		return trimmed.replace(/^USS\s+/i, '').trim();
	}
	return trimmed;
}

export function formatDisplayShipName(storedName: string): string {
	const trimmed = storedName.trim();
	if (!trimmed) return 'USS UNKNOWN';
	if (/^USS\s+/i.test(trimmed)) {
		return trimmed.toUpperCase();
	}
	return `USS ${trimmed.toUpperCase()}`;
}

export function formatDisplayRegistry(registry: string): string {
	return registry.trim().toUpperCase();
}

export function formatDisplayCaptain(name: string): string {
	return name.trim().toUpperCase();
}
