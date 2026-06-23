import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'November 2025',
        description:
            'composite-index explorer for algorithmic "freedom": a weighted blend of choice entropy, empowerment, policy-manifold volume, causal emergence, and descriptive regularity, comparing systems from a sorting routine to a human. Retrofitted with the scientific scaffolding: a logic module re-exporting the score, calibration of its floor, ceiling, convexity, and a worked case, and assumptions making clear that the index is a constructed measure, not a claim about free will.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'November 2025',
        changes: [
            'freedom score as a weighted blend of five normalized indicators (weights summing to one, scaled to 0..100).',
            'presets placing example systems (sorting, fixed/learning neural nets, cell, human) on the indicators.',
            'logic module re-exporting the score and exposing the component weights.',
            'calibration of the score floor, ceiling, weight-sum convexity, and a worked intermediate case.',
            'assumptions make clear the index is a constructed comparison measure, not a claim about free will or consciousness.',
        ],
    },
];
