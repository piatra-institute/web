import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'December 2025',
        description:
            'first cut. builds the Chladni-figure sandbox: separable square-plate cosine modes S(x,y) = cos(m pi x) cos(n pi y) +/- cos(n pi x) cos(m pi y), optional two-mode superposition, four plate geometries via boundary masking, a conserving sand-migration model, nodal-line highlighting, a pure chladni() function with five analytic calibration cases (corner amplitude, antisymmetric diagonal node, fundamental center node, m<->n symmetry, edge nodal crossing), six assumptions separating the established mode theory from the idealized plate and phenomenological sand model, and a research companion.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'December 2025',
        changes: [
            'modal model: square-plate free-edge cosine modes, symmetric (+) and antisymmetric (-) combinations selectable per mode.',
            'two-mode superposition with independent amplitudes, demonstrating combined nodal geometry.',
            'four plate geometries (square, rectangle, circle, ring) rendered by masking the square cosine field; non-square shapes flagged as approximations in the assumptions.',
            'sand migration as mass-conserving gradient descent toward nodes plus local diffusion, on a seeded reproducible field.',
            'nodal-line highlighting by amplitude threshold and a tone-mapped grayscale render.',
            'calibration: a pure chladni() function checked against five analytic facts (corner value 2, diagonal node of the antisymmetric mode, center node of the fundamental, m<->n permutation symmetry, and the (2,2) edge zero), each predicted value computed by the function.',
            'framing kept honest: the cosine modes and linear superposition are established; the ideal-plate, masked non-square shapes, and the gradient-descent sand rule (grains drift to nodes, while very fine powder collects at antinodes) are marked as idealizations.',
        ],
    },
];
