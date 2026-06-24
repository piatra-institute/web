import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'January 2026',
        description:
            'first cut. builds the kernel-smoothing sandbox: a Gaussian similarity kernel and a softmax-dot kernel, normalized weights, and the Nadaraya-Watson prediction shown live across a kernel-shape plot, a data-and-prediction scatter, and a weight bar chart. adds exact calibration of the kernel axioms (density peak, normalization, symmetry, constant reproduction), six assumptions covering the bias-variance tradeoff, and the attention-as-kernel analogy kept explicitly contested.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'January 2026',
        changes: [
            'kernel model: Gaussian similarity weight K(xq, xi) = exp(-(xq - xi)^2 / 2h^2) with bandwidth h, and a softmax-dot weight exp(xq xi / tau) with temperature tau.',
            'Nadaraya-Watson estimator: normalized weights alpha_i = K / sum K and prediction yHat = sum alpha_i y_i, all derived live from the editable points and query.',
            'added proper probability-kernel forms for calibration: the unit-bandwidth Gaussian density (peak 1 / sqrt(2 pi), unit mass) and the Epanechnikov kernel on compact support.',
            'calibration: density peak K(0), Gaussian and Epanechnikov normalization to mass 1, even-function symmetry K(-u) = K(u), and exact reproduction of a constant signal; every predicted value computed from the logic functions.',
            'six assumptions spanning the bias-variance bandwidth tradeoff, second-order kernel choice, boundary bias, and the attention-as-kernel correspondence marked contested.',
        ],
    },
];
