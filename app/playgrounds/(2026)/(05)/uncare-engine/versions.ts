import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.7',
        date: 'May 2026',
        description:
            'first cut. six-axis composite madness score with derived inversion pressure, monstrosity potential, escape velocity, care capacity, and backlash risk. ten domain cases. six stages from ordinary load to monstrous uncare.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'May 2026',
        changes: [
            'expanded the original four-input model (load, shame, exit, tribe) to six axes by adding moral inflation and isolation from private correction.',
            'replaced the single madness index with a six-metric panel: madness, escape velocity, inversion pressure, monstrosity potential, care capacity, backlash risk.',
            'six stages keep the original demo\'s shape but are split into ordinary, saturation, defensive minimisation, ressentiment, counter-moral inversion, monstrous uncare.',
            'ten domain cases up from six, adding migration, maintenance, reputation, algorithm.',
            'every case carries a canonical axis profile and an expected madness used by the calibration table.',
            'signature visualisation: a pressure x capture phase plot with the six stage bands, plus a horizontal wagon line.',
            'sweep, sensitivity, and snapshot comparison added throughout.',
            'four presets: calm, exhausted, captured, abyss.',
        ],
    },
];
