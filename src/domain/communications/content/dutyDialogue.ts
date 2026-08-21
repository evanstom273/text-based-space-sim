import type { DialogueDefinition } from '../types';
import { isAdult, isSeniorStaff, isUnionOfficer } from '../conditionEvaluator';

export const ASK_DUTY_STATUS_DEFINITION: DialogueDefinition = {
	intentId: 'ASK_DUTY_STATUS',
	category: 'duty',
	title: 'Status report',
	isAvailable: (ctx) => isUnionOfficer(ctx),
	playerVariants: [
		{
			id: 'duty_status_cmd',
			label: 'Status report',
			template: 'Give me a brief status report on your section.',
			tones: ['formal', 'professional'],
		},
	],
	responseVariants: [
		{
			id: 'resp_duty_engineering',
			template: 'Main drive coils and environmental scrubbers are nominal. Secondary maintenance queues are on schedule.',
			tones: ['professional'],
			condition: (ctx) => ctx.target.record.divisionId === 'engineering',
			followUpIntentIds: ['FOLLOW_UP_REASON'],
		},
		{
			id: 'resp_duty_security',
			template: 'All internal security checkpoints are covered and armory inventories are accounted for. No incidents to report.',
			tones: ['formal', 'professional'],
			condition: (ctx) => ctx.target.record.divisionId === 'security',
		},
		{
			id: 'resp_duty_medical',
			template: 'Sickbay is quiet. Inpatient beds are clear and bio-filter calibrations were completed this morning.',
			tones: ['professional'],
			condition: (ctx) => ctx.target.record.divisionId === 'medical',
		},
		{
			id: 'resp_duty_science',
			template: 'Primary stellar cartography arrays and sensor suites are calibrated. Lab backlog is completely manageable.',
			tones: ['professional'],
			condition: (ctx) => ctx.target.record.divisionId === 'science',
		},
		{
			id: 'resp_duty_command',
			template: 'Bridge rotations and navigation logs are logged and up to date. Vessel speed and telemetry are steady.',
			tones: ['formal', 'professional'],
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
			id: 'dept_overview',
			label: 'Department performance',
			template: 'How is the {departmentName} division holding up overall?',
			tones: ['professional'],
		},
	],
	responseVariants: [
		{
			id: 'resp_dept_chief_good',
			template: 'Morale in {departmentName} is steady, Captain. Personnel are handling the watch rotations without issue.',
			tones: ['professional', 'proud'],
			condition: (ctx) => ctx.target.isDepartmentChief || ctx.target.isFirstOfficer,
			followUpIntentIds: ['FOLLOW_UP_ASSISTANCE'],
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
			id: 'readiness_check',
			label: 'Operational readiness',
			template: 'Are you and your team ready if we encounter unexpected contingencies?',
			tones: ['formal', 'professional'],
		},
	],
	responseVariants: [
		{
			id: 'resp_readiness_confident',
			template: 'Fully prepared, Captain. Duty drills are up to date and all emergency protocols are verified.',
			tones: ['confident', 'formal'],
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
			id: 'workload_check',
			label: 'Workload assessment',
			template: 'Are you overwhelmed with current tasking in {departmentName}?',
			tones: ['concerned', 'professional'],
		},
	],
	responseVariants: [
		{
			id: 'resp_workload_balanced',
			template: 'The workload is brisk, but manageable. We are keeping pace with our operational checklist.',
			tones: ['professional'],
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