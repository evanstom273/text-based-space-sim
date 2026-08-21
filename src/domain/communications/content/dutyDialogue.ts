import type { DialogueDefinition } from '../types';
import { isAdult, isSeniorStaff, isUnionOfficer } from '../conditionEvaluator';

export const ASK_DUTY_STATUS_DEFINITION: DialogueDefinition = {
	intentId: 'ASK_DUTY_STATUS',
	category: 'duty',
	title: 'Status report',
	isAvailable: (ctx) => isUnionOfficer(ctx),
	playerVariants: [
		{
			id: 'duty_status_cmd_1',
			label: 'Status report',
			template: 'Give me a brief status report on your section.',
			tones: ['formal', 'professional'],
		},
		{
			id: 'duty_status_cmd_2',
			label: 'Section readiness',
			template: 'How are operations running in your department right now?',
			tones: ['professional'],
		},
	],
	responseVariants: [
		{
			id: 'resp_duty_engineering_1',
			template: 'Main drive coils and environmental scrubbers are nominal. Secondary maintenance queues are on schedule.',
			tones: ['professional'],
			condition: (ctx) => ctx.target.record.divisionId === 'engineering',
			followUpIntentIds: ['FOLLOW_UP_REASON'],
		},
		{
			id: 'resp_duty_engineering_2',
			template: 'Power distribution is balanced across all primary grids. Diagnostic passes show zero anomalous telemetry.',
			tones: ['confident', 'professional'],
			condition: (ctx) => ctx.target.record.divisionId === 'engineering',
		},
		{
			id: 'resp_duty_engineering_3',
			template: 'All auxiliary backup systems are primed. We just finished recalibrating the plasma conduits.',
			tones: ['professional'],
			condition: (ctx) => ctx.target.record.divisionId === 'engineering',
		},
		{
			id: 'resp_duty_security_1',
			template: 'All internal security checkpoints are covered and armory inventories are accounted for. No incidents to report.',
			tones: ['formal', 'professional'],
			condition: (ctx) => ctx.target.record.divisionId === 'security',
		},
		{
			id: 'resp_duty_security_2',
			template: 'Shipboard patrols are on standard watch rotation. Hangar and airlock seals are fully secure.',
			tones: ['confident', 'formal'],
			condition: (ctx) => ctx.target.record.divisionId === 'security',
		},
		{
			id: 'resp_duty_medical_1',
			template: 'Sickbay is quiet. Inpatient beds are clear and bio-filter calibrations were completed this morning.',
			tones: ['professional'],
			condition: (ctx) => ctx.target.record.divisionId === 'medical',
		},
		{
			id: 'resp_duty_medical_2',
			template: 'Medical inventory is fully stocked and emergency trauma response units are on standby.',
			tones: ['professional', 'confident'],
			condition: (ctx) => ctx.target.record.divisionId === 'medical',
		},
		{
			id: 'resp_duty_science_1',
			template: 'Primary stellar cartography arrays and sensor suites are calibrated. Lab backlog is completely manageable.',
			tones: ['professional'],
			condition: (ctx) => ctx.target.record.divisionId === 'science',
		},
		{
			id: 'resp_duty_science_2',
			template: 'Long-range telemetry scans are collecting background astronomical data without disruption.',
			tones: ['professional', 'excited'],
			condition: (ctx) => ctx.target.record.divisionId === 'science',
		},
		{
			id: 'resp_duty_command_1',
			template: 'Bridge rotations and navigation logs are logged and up to date. Vessel speed and telemetry are steady.',
			tones: ['formal', 'professional'],
			condition: (ctx) => ctx.target.record.divisionId === 'command',
		},
		{
			id: 'resp_duty_command_2',
			template: 'Comms channels are clear and sub-light navigational thrusters are operating at peak efficiency.',
			tones: ['confident', 'formal'],
			condition: (ctx) => ctx.target.record.divisionId === 'command',
		},
	],
};

export const ASK_DEPARTMENT_STATUS_DEFINITION: DialogueDefinition = {
	intentId: 'ASK_DEPARTMENT_STATUS',
	category: 'duty',
	title: 'Department overview',
	isAvailable: (ctx) => isSeniorStaff(ctx),
	playerVariants: [
		{
			id: 'dept_overview_1',
			label: 'Department performance',
			template: 'How is the {departmentName} division holding up overall?',
			tones: ['professional'],
		},
		{
			id: 'dept_overview_2',
			label: 'Staffing review',
			template: 'Are all shifts in {departmentName} performing according to expectations?',
			tones: ['formal'],
		},
	],
	responseVariants: [
		{
			id: 'resp_dept_chief_good_1',
			template: 'Morale in {departmentName} is steady, Captain. Personnel are handling the watch rotations without issue.',
			tones: ['professional', 'proud'],
			condition: (ctx) => ctx.target.isDepartmentChief || ctx.target.isFirstOfficer,
			followUpIntentIds: ['FOLLOW_UP_ASSISTANCE'],
		},
		{
			id: 'resp_dept_chief_good_2',
			template: 'Everyone in our section is pulling their weight. Duty evaluations for the current cycle are very encouraging.',
			tones: ['confident', 'proud'],
			condition: (ctx) => ctx.target.isDepartmentChief,
		},
		{
			id: 'resp_dept_xo',
			template: 'Shipwide division coordination is running cleanly. Watch schedules across all sections are balanced.',
			tones: ['formal', 'professional'],
			condition: (ctx) => ctx.target.isFirstOfficer,
		},
	],
};

export const ASK_READINESS_DEFINITION: DialogueDefinition = {
	intentId: 'ASK_READINESS',
	category: 'duty',
	title: 'Operational readiness',
	isAvailable: (ctx) => isUnionOfficer(ctx),
	playerVariants: [
		{
			id: 'readiness_check_1',
			label: 'Operational readiness',
			template: 'Are you and your team ready if we encounter unexpected contingencies?',
			tones: ['formal', 'professional'],
		},
		{
			id: 'readiness_check_2',
			label: 'Emergency response posture',
			template: 'How quickly can your station respond in the event of an emergency alert?',
			tones: ['professional'],
		},
	],
	responseVariants: [
		{
			id: 'resp_readiness_confident_1',
			template: 'Fully prepared, Captain. Duty drills are up to date and all emergency protocols are verified.',
			tones: ['confident', 'formal'],
			condition: (ctx) => isAdult(ctx),
		},
		{
			id: 'resp_readiness_confident_2',
			template: 'We run regular readiness simulations. Our station can be at full battle stations within thirty seconds.',
			tones: ['confident', 'professional'],
			condition: (ctx) => isAdult(ctx),
		},
	],
};

export const ASK_WORKLOAD_DEFINITION: DialogueDefinition = {
	intentId: 'ASK_WORKLOAD',
	category: 'duty',
	title: 'Workload & staffing',
	isAvailable: (ctx) => isUnionOfficer(ctx),
	playerVariants: [
		{
			id: 'workload_check_1',
			label: 'Workload assessment',
			template: 'Are you overwhelmed with current tasking in {departmentName}?',
			tones: ['concerned', 'professional'],
		},
		{
			id: 'workload_check_2',
			label: 'Shift fatigue check',
			template: 'How are you pacing yourself during this operational cycle?',
			tones: ['warm', 'concerned'],
		},
	],
	responseVariants: [
		{
			id: 'resp_workload_balanced_1',
			template: 'The workload is brisk, but manageable. We are keeping pace with our operational checklist.',
			tones: ['professional'],
		},
		{
			id: 'resp_workload_balanced_2',
			template: 'Everything is well structured. The shift rotations give us adequate downtime between demanding watches.',
			tones: ['warm', 'professional'],
		},
		{
			id: 'resp_workload_busy',
			template: 'We have a lot on our plates right now, but {superiorName} has organized our task priorities well.',
			tones: ['tired', 'professional'],
			condition: (ctx) => Boolean(ctx.target.directSuperior),
			followUpIntentIds: ['FOLLOW_UP_SUPPORT'],
		},
	],
};
