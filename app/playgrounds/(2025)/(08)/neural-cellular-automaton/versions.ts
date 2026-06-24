import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'August 2025',
        description:
            'first cut. a grid of cells, each running a small feedforward network over its eight Moore neighbours, with a hard alive threshold, local Hebbian plasticity, optional mutation, and four descriptive fitness readouts. the deterministic forward-pass core (affine, activation, threshold, complexity density) is factored out as pure functions and pinned by a five-case calibration suite.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'August 2025',
        changes: [
            'per-cell network: nine Moore-neighbour states feed a stack of dense layers (bias plus weighted sum, then a chosen nonlinearity); the first output channel thresholded at 0.5 sets the next discrete state.',
            'activation choices: sigmoid, tanh, ReLU, and leaky ReLU, shared verbatim between the live class and the calibration suite.',
            'local plasticity: a Hebbian rule (rate times output times input) with weight clipping, plus an optional random mutation mask on weights and biases.',
            'toroidal Moore neighbourhood with wrap-around indexing, so every cell has exactly eight neighbours and no boundary.',
            'descriptive fitness readouts (complexity, stability, oscillation, diversity) reported live as densities, not optimisation targets.',
            'pure deterministic core (activate, denseLayer, forwardPass, stateFromOutput, complexityDensity) extracted so the update arithmetic can be hand-checked.',
            'calibration: five hand-computed cases (sigmoid midpoint, tanh identity, ReLU clipping, alive threshold, complexity density) reproduce at zero error.',
        ],
    },
];
