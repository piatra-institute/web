import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'July 2025',
        description:
            'particle simulation of Terrence Deacon\'s autogen: an autocatalytic set that builds a self-bounding capsule and rebuilds it when disrupted, framed as a minimal Peircean act of interpretation. Retrofitted with the scientific scaffolding: calibration of the deterministic core (the distance metric and the autocatalytic reaction table), and assumptions separating that exact core from the autogen, semiotic, and teleodynamic interpretations.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'July 2025',
        changes: [
            'particle simulation with molecule types C, F, A, D, G; proximity-based reactions; an autogen capsule; and a binding template.',
            'autocatalytic reaction set: C regenerates from A, and F turns D into G.',
            'self-repair: disrupting the autogen releases its catalysts, which rebuild it.',
            'calibration of the deterministic core: the distance metric and the reaction table (including reactions switching off beyond level 3).',
            'assumptions separate that core from the autogen construct and the Peircean / teleodynamic interpretation of meaning.',
        ],
    },
];
