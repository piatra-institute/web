import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'February 2025',
        description:
            'interactive Galton board (quincunx) with editable, adaptive pegs, bead physics, and a drawable target curve. Retrofitted with the scientific scaffolding: a binomial / central-limit logic module, calibration of the bin distribution against the binomial law and the normal approximation, and assumptions separating the idealized Bernoulli process from the physical simulation.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'February 2025',
        changes: [
            'three.js / react-three-fiber Galton board: beads fall through a lattice of pegs into bins, forming a histogram.',
            'editable pegs, an adaptive stress-sharing system that nudges pegs toward a drawn target curve, and bias controls.',
            'probability model: bins follow Binomial(n, p); the histogram approaches a normal curve by the central limit theorem.',
            'calibration of the bin mean, spread, and central mass against the binomial law and the normal approximation.',
            'assumptions separate the idealized independent-Bernoulli process from the physical simulation and its correlations.',
        ],
    },
];
