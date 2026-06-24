import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'March 2026',
        description:
            'first cut. an accelerant-and-aggregation sandbox for the Great Divergence: nine illustrative factors scored per region across ten time bins, three nested aggregators (additive, Cobb-Douglas, CES), difference and ratio gap modes, Monte Carlo Shapley attribution, a deterministic calibration of the aggregation identities, and six assumptions that keep the model-conditioned credit split honest about its own limits.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'March 2026',
        changes: [
            'region score: a composite over nine accelerants, each a value in [0, 1], with weights renormalised to sum to one.',
            'three aggregators: additive (perfect substitutes), multiplicative Cobb-Douglas (weighted geometric mean), and CES with a tunable rho that nests both.',
            'gap modes: North minus South (difference) and North over South (ratio), plotted across ten historical time bins from early agrarian states to the post-2008 multipolar period.',
            'Shapley attribution: Monte Carlo over factor orderings allocates the gap among accelerants given the chosen aggregator, with a deterministic per-bin seed.',
            'calibration: five deterministic checks pin the aggregation identities (additive normalisation, CES rho = 1 nests additive, multiplicative geometric mean, ratio gap, takeoff-versus-antiquity divergence) to zero error; the stochastic Shapley layer is left out of scope.',
            'framing kept honest: factor values are illustrative placeholders, the credit split is conditional on the aggregator, and there is no model-free cause decomposition.',
        ],
    },
];
