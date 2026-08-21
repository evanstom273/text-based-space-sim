export type CaptainPresetId =
	| 'status_report'
	| 'wellbeing'
	| 'concerns'
	| 'good_work'
	| 'stand_by'
	| 'dismissed'
	| 'acknowledged'
	| 'anything_needed';

export type CaptainPresetCategory = 'command' | 'personal';

export interface CaptainPreset {
	id: CaptainPresetId;
	label: string;
	captainText: string;
	category: CaptainPresetCategory;
}

export const CAPTAIN_PRESETS: readonly CaptainPreset[] = [
	{
		id: 'status_report',
		label: 'Status report',
		captainText: 'Give me a brief status report.',
		category: 'command',
	},
	{
		id: 'concerns',
		label: 'Any concerns?',
		captainText: 'Any concerns I should know about?',
		category: 'command',
	},
	{
		id: 'acknowledged',
		label: 'Acknowledged',
		captainText: 'Acknowledged.',
		category: 'command',
	},
	{
		id: 'stand_by',
		label: 'Stand by',
		captainText: 'Stand by for further orders.',
		category: 'command',
	},
	{
		id: 'dismissed',
		label: 'Dismissed',
		captainText: 'That will be all. Dismissed.',
		category: 'command',
	},
	{
		id: 'wellbeing',
		label: 'Check in',
		captainText: 'How are you holding up?',
		category: 'personal',
	},
	{
		id: 'good_work',
		label: 'Good work',
		captainText: 'Good work lately.',
		category: 'personal',
	},
	{
		id: 'anything_needed',
		label: 'Need anything?',
		captainText: 'Do you need anything from me?',
		category: 'personal',
	},
] as const;

export function getCaptainPreset(id: CaptainPresetId): CaptainPreset {
	const preset = CAPTAIN_PRESETS.find((entry) => entry.id === id);
	if (!preset) {
		throw new Error(`Unknown captain preset: ${id}`);
	}
	return preset;
}
