import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'January 2026',
        description:
            'first cut. builds the activation lab: a library of more than fifty exact built-in activations across classic, smooth, hard, bounded, soft, parametric, exponential, oscillating, and hybrid families, each plotted with its central-difference derivative; a composer mode that gates a base activation; an expression parser for custom curves; shape diagnostics (Lipschitz estimate, dead fraction, symmetry); a dimensional landscape view; calibration against exact mathematical identities; and assumptions that keep the closed-form facts apart from the contested question of which activation is best.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'January 2026',
        changes: [
            'activation library: exact closed-form implementations of ReLU, LeakyReLU, PReLU, ELU, SELU, CELU, GELU, Swish, SiLU, Mish, Tanh, Sigmoid, Softplus, Softmax1D, and more than forty further variants, grouped into families.',
            'each curve drawn with its derivative computed by central finite difference, exposing saturation, dead regions, and Lipschitz behaviour.',
            'composer mode multiplies a base activation by a sigmoid, hard-sigmoid, tanh, softplus, or step gate, echoing gated units such as GLU and SwiGLU.',
            'expression mode: a small tokeniser and recursive-descent parser compile user-written formulas over x using relu, sigmoid, gelu, swish, mish, softplus, and standard math.',
            'landscape view projects all activations into a selectable three-dimensional feature space (negative region, smoothness, symmetry, saturation, curvature, and more).',
            'calibration: five exact identities (sigmoid(0) = 0.5, tanh odd symmetry, ReLU(-3) = 0, sigmoid prime at 0 = 0.25, two-class softmax sums to 1) computed by calling the real logic functions.',
            'framing kept honest: the closed forms are established mathematics, while which activation trains best, and the strength of the vanishing-gradient story, are marked contested.',
        ],
    },
];
