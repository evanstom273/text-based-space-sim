import { test, expect } from '@playwright/test';
import {
	buildDialogueContext,
	getAvailableCategories,
	getAvailableDialogueOptions,
	sendProceduralDialogue,
} from '../src/domain/communications';
import { createPersonnelRecord } from '../src/domain/personnel/personnel';
import { createInitialSessionTracker } from '../src/domain/communications/state';
import type { CommandProfile } from '../src/types/commandProfile';

test('Procedural Dialogue Engine comprehensive domain verification', async () => {
	const captain = createPersonnelRecord({
		id: 'cap-01',
		identity: { firstName: 'Ed', lastName: 'Mercer' },
		speciesId: 'human',
		personnelKind: 'union',
		rankId: 'captain',
		divisionId: 'command',
		positionId: 'commanding_officer',
		baseAttributes: { strength: 5, agility: 5, endurance: 5, intellect: 6, perception: 6, charisma: 7, willpower: 6 },
		baseSkills: { piloting: 7, engineering: 4, tactical: 6, medical: 2, science: 4, diplomacy: 7, leadership: 8, discipline: 6, investigation: 5 },
	});

	const chiefEngineer = createPersonnelRecord({
		id: 'eng-01',
		identity: { firstName: 'John', lastName: 'LaMarr' },
		speciesId: 'human',
		dateOfBirth: '2390-01-01',
		ageYears: 30,
		personnelKind: 'union',
		rankId: 'lieutenant_commander',
		divisionId: 'engineering',
		positionId: 'chief_engineer',
		baseAttributes: { strength: 5, agility: 6, endurance: 5, intellect: 9, perception: 7, charisma: 6, willpower: 6 },
		baseSkills: { piloting: 5, engineering: 9, tactical: 4, medical: 2, science: 7, diplomacy: 4, leadership: 7, discipline: 5, investigation: 6 },
	});

	const child = createPersonnelRecord({
		id: 'child-01',
		identity: { firstName: 'Marcus', lastName: 'Finn' },
		speciesId: 'human',
		dateOfBirth: '2412-05-10',
		ageYears: 8,
		personnelKind: 'civilian',
		civilianRoleId: 'child',
		baseAttributes: { strength: 2, agility: 4, endurance: 3, intellect: 4, perception: 5, charisma: 6, willpower: 3 },
		baseSkills: { piloting: 0, engineering: 0, tactical: 0, medical: 0, science: 1, diplomacy: 2, leadership: 1, discipline: 2, investigation: 2 },
	});

	const profile: CommandProfile = {
		id: 'prof-01',
		version: 1,
		createdAt: Date.now(),
		updatedAt: Date.now(),
		captain: {
			name: 'Ed Mercer',
			personnelId: 'cap-01',
		},
		vessel: {
			name: 'USS Orville',
			registry: 'ECV-197',
			location: 'Sector 4',
			alertStatus: 'normal',
		},
		simulation: {
			absoluteDay: 0, // Jan 1, 2420
			minutesInDay: 540,
			tickIntervalSeconds: 10,
			speedMultiplier: 1 as any,
			paused: false,
			dayEndPending: false,
		},
		future: {
			crew: {
				roster: [captain, chiefEngineer, child],
				relationships: [
					{
						id: 'rel-1',
						fromPersonnelId: 'eng-01',
						toPersonnelId: 'cap-01',
						typeId: 'senior_staff_colleague',
						affinity: 40,
					},
					{
						id: 'rel-2',
						fromPersonnelId: 'cap-01',
						toPersonnelId: 'eng-01',
						typeId: 'senior_staff_colleague',
						affinity: 40,
					},
				],
			},
			communications: {
				schemaVersion: 1,
				threads: {},
			},
		},
	};

	// Test 1: Senior Officer has duty & command categories
	const engContext = buildDialogueContext(profile, chiefEngineer, 0, 540);
	const engCategories = getAvailableCategories(engContext);
	expect(engCategories).toContain('duty');
	expect(engCategories).toContain('command');

	// Test 2: Child does NOT have duty or command categories
	const childContext = buildDialogueContext(profile, child, 0, 540);
	const childCategories = getAvailableCategories(childContext);
	expect(childCategories).not.toContain('duty');
	expect(childCategories).not.toContain('command');
	expect(childCategories).toContain('personal');

	// Test 3: Chief Engineer birthday check
	// Chief Engineer DOB is 2390-01-01 -> Absolute Day 0 is Jan 1 -> Birthday today!
	expect(engContext.target.isBirthdayToday).toBe(true);
	const birthdayOptions = getAvailableDialogueOptions(engContext, 'contextual');
	expect(birthdayOptions.some((o) => o.intentId === 'WISH_HAPPY_BIRTHDAY')).toBe(true);

	// Test 4: Procedural dialogue execution & variable substitution
	const sessionTracker = createInitialSessionTracker(chiefEngineer.id);
	const result = sendProceduralDialogue({
		profile,
		person: chiefEngineer,
		intentId: 'ASK_DUTY_STATUS',
		absoluteDay: 0,
		minutesInDay: 540,
		sessionTracker,
	});

	expect(result.captainMessage.text.length).toBeGreaterThan(0);
	expect(result.characterMessage.text.length).toBeGreaterThan(0);
	expect(result.characterMessage.text).not.toContain('{');
	expect(result.characterMessage.text).not.toContain('}');
});