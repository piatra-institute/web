import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'November 2025',
        description:
            'adverse-selection model of institutional closure: as critique is suppressed, the entry cutoff on moral type falls and selection favours corruption-tolerant entrants. Retrofitted with the scientific scaffolding: a logic module re-exporting the model functions, calibration of the rent, amplifier, cutoff, and adverse-selection direction, and assumptions separating the exact cutoff math from the population and signaling choices.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'November 2025',
        changes: [
            'closedness model: linear rents B(k), power-law moral-cost amplifier g(k), and a sharp entry cutoff m* = (B - h) / g.',
            'Beta-distributed moral types with entrant fraction and mean computed by trapezoidal integration up to the cutoff.',
            'optional loyalty-signaling channel adding dissonance cost and identity benefit.',
            'logic module re-exporting the model functions for a clean import surface.',
            'calibration of the rent and amplifier functions, the cutoff formula, the adverse-selection direction, and the fully-open limit.',
        ],
    },
];
