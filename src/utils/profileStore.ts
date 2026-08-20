import {
	COMMAND_PROFILE_VERSION,
	createDefaultSimulation,
	type CommandProfile,
	type CreateProfileInput,
	type ProfileStoreData,
} from '../types/commandProfile';
import { randomAssignmentLocation } from './profileRandomizer';
import {
	formatDisplayCaptain,
	formatDisplayRegistry,
	normalizeShipNameInput,
} from './profileRandomizer';

const STORAGE_KEY = 'union-terminal-command-profiles';

function createEmptyStore(): ProfileStoreData {
	return {
		version: COMMAND_PROFILE_VERSION,
		profiles: [],
	};
}

function sanitizeProfile(raw: Partial<CommandProfile>): CommandProfile | null {
	if (!raw.id || !raw.captain?.name || !raw.vessel?.name || !raw.vessel?.registry) {
		return null;
	}

	return {
		id: raw.id,
		version: COMMAND_PROFILE_VERSION,
		createdAt: raw.createdAt ?? Date.now(),
		updatedAt: raw.updatedAt ?? Date.now(),
		captain: {
			name: raw.captain.name,
		},
		vessel: {
			name: raw.vessel.name,
			registry: formatDisplayRegistry(raw.vessel.registry),
			location: raw.vessel.location ?? randomAssignmentLocation(),
			alertStatus: raw.vessel.alertStatus ?? 'Nominal',
		},
		simulation: {
			...createDefaultSimulation(),
			...raw.simulation,
		},
		future: raw.future ?? {},
	};
}

export function loadProfileStore(): ProfileStoreData {
	if (typeof window === 'undefined') return createEmptyStore();

	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return createEmptyStore();

		const parsed = JSON.parse(raw) as Partial<ProfileStoreData>;
		if (parsed.version !== COMMAND_PROFILE_VERSION || !Array.isArray(parsed.profiles)) {
			return createEmptyStore();
		}

		const profiles = parsed.profiles
			.map((profile) => sanitizeProfile(profile))
			.filter((profile): profile is CommandProfile => profile !== null);

		return { version: COMMAND_PROFILE_VERSION, profiles };
	} catch {
		return createEmptyStore();
	}
}

export function saveProfileStore(store: ProfileStoreData): void {
	if (typeof window === 'undefined') return;

	window.localStorage.setItem(
		STORAGE_KEY,
		JSON.stringify({
			version: COMMAND_PROFILE_VERSION,
			profiles: store.profiles,
		}),
	);
}

export function createCommandProfile(input: CreateProfileInput): CommandProfile {
	const now = Date.now();
	const shipName = normalizeShipNameInput(input.shipName);

	return {
		id: `profile-${now}-${Math.random().toString(36).slice(2, 8)}`,
		version: COMMAND_PROFILE_VERSION,
		createdAt: now,
		updatedAt: now,
		captain: {
			name: formatDisplayCaptain(input.captainName),
		},
		vessel: {
			name: shipName,
			registry: formatDisplayRegistry(input.registry),
			location: randomAssignmentLocation(),
			alertStatus: 'Nominal',
		},
		simulation: createDefaultSimulation(),
		future: {},
	};
}

export function upsertProfile(store: ProfileStoreData, profile: CommandProfile): ProfileStoreData {
	const profiles = store.profiles.filter((entry) => entry.id !== profile.id).concat(profile);
	return { version: COMMAND_PROFILE_VERSION, profiles };
}

export function deleteProfileFromStore(store: ProfileStoreData, profileId: string): ProfileStoreData {
	return {
		version: COMMAND_PROFILE_VERSION,
		profiles: store.profiles.filter((profile) => profile.id !== profileId),
	};
}

export function getProfileById(store: ProfileStoreData, profileId: string): CommandProfile | undefined {
	return store.profiles.find((profile) => profile.id === profileId);
}

const BOOT_SKIP_KEY = 'union-terminal-fast-boot';

export function loadFastBootPreference(): boolean {
	if (typeof window === 'undefined') return false;
	return window.localStorage.getItem(BOOT_SKIP_KEY) === '1';
}

export function saveFastBootPreference(enabled: boolean): void {
	if (typeof window === 'undefined') return;
	window.localStorage.setItem(BOOT_SKIP_KEY, enabled ? '1' : '0');
}
