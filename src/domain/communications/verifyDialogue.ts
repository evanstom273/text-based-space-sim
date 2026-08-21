import {
	buildDialogueContext,
	getAvailableCategories,
	sendProceduralDialogue,
} from './index';
import { createPersonnelRecord } from '../personnel/personnel';
import { createInitialSessionTracker } from './state';
import { PERSONNEL_SCHEMA_VERSION } from '../personnel/constants';
import type { CommandProfile } from '../../types/commandProfile';

export function runDialogueVerification(): { ok: boolean; checks: Record<string, boolean>; errors: string[] } {
	const errors: string[] = [];
	const checks: Record<string, boolean> = {};

	const captain = createPersonnelRecord({
		id: 'cap-01',
		identity: { firstName: 'Ed', lastName: 'Mercer' },
		speciesId: 'human',
		personnelKind: 'union',
		rankId: 'captain',
		divisionId: 'command',
		positionId: 'command_officer',
		baseAttributes: { physical: 5, agility: 5, intelligence: 6, perception: 6, charisma: 7, resilience: 6 },
		baseSkills: { piloting: 7, engineering: 4, tactical: 6, medicine: 2, science: 4, diplomacy: 7, command: 8, combat: 6 },
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
		baseAttributes: { physical: 5, agility: 6, intelligence: 9, perception: 7, charisma: 6, resilience: 6 },
		baseSkills: { piloting: 5, engineering: 9, tactical: 4, medicine: 2, science: 7, diplomacy: 4, command: 7, combat: 5 },
	});

	const child = createPersonnelRecord({
		id: 'child-01',
		identity: { firstName: 'Marcus', lastName: 'Finn' },
		speciesId: 'human',
		dateOfBirth: '2412-05-10',
		ageYears: 8,
		personnelKind: 'civilian',
		civilianRoleId: 'child',
		baseAttributes: { physical: 2, agility: 4, intelligence: 4, perception: 5, charisma: 6, resilience: 3 },
		baseSkills: { piloting: 0, engineering: 0, tactical: 0, medicine: 0, science: 1, diplomacy: 2, command: 1, combat: 2 },
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
			absoluteDay: 0,
			minutesInDay: 540,
			tickIntervalSeconds: 10,
			speedMultiplier: 1 as any,
			paused: false,
			dayEndPending: false,
		},
		future: {
			crew: {
				schemaVersion: PERSONNEL_SCHEMA_VERSION,
				personnel: [captain, chiefEngineer, child],
				captainPersonnelId: 'cap-01',
				seniorStaff: {
					byPosition: { chief_engineer: 'eng-01' },
					secondOfficerPersonnelId: null,
				},
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

	const engContext = buildDialogueContext(profile, chiefEngineer, 0, 540);
	const engCategories = getAvailableCategories(engContext);
	checks.seniorStaffCategories = engCategories.includes('duty') && engCategories.includes('command');
	if (!checks.seniorStaffCategories) errors.push('Senior staff missing duty/command categories');

	const childContext = buildDialogueContext(profile, child, 0, 540);
	const childCategories = getAvailableCategories(childContext);
	checks.childCategories = !childCategories.includes('duty') && !childCategories.includes('command') && childCategories.includes('personal');
	if (!checks.childCategories) errors.push('Child has invalid adult categories');

	checks.birthdayDetection = engContext.target.isBirthdayToday === true;
	if (!checks.birthdayDetection) errors.push('Birthday not detected on matching calendar date');

	const sessionTracker = createInitialSessionTracker(chiefEngineer.id);
	const result = sendProceduralDialogue({
		profile,
		person: chiefEngineer,
		intentId: 'ASK_DUTY_STATUS',
		absoluteDay: 0,
		minutesInDay: 540,
		sessionTracker,
	});

	checks.dialogueGeneration =
		result.captainMessage.text.length > 0 &&
		result.characterMessage.text.length > 0 &&
		!result.characterMessage.text.includes('{') &&
		!result.characterMessage.text.includes('}');
	if (!checks.dialogueGeneration) errors.push('Dialogue generation failed or has unresolved placeholders');

	return {
		ok: errors.length === 0,
		checks,
		errors,
	};
}