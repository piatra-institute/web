import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'February 2026',
        description:
            'first cut. builds the author-function atlas around Foucault\'s author-function: a replicator-mutator population of quote-variants scored by a logistic cliche index and an entanglement surplus E = a_name - a_src, drifting toward context-collapsed slogans. adds a deterministic calibration of the cliche, entanglement, and fitness cores, six assumptions that separate the discourse framing from the synthetic toy, and a research companion.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'February 2026',
        changes: [
            'population model: ninety seed variants per author, each carrying frequency, dispersion, surprisal, retention, mutability, specificity, name-prestige (a_name), and source-verifiability (a_src).',
            'cliche index C = sigmoid(1.1 ln(f+1) + 0.8 disp - 0.55 surp - 1.0 ret + 0.7 mut), reported per variant and ranked in a top-cliche list.',
            'entanglement surplus E = clamp(a_name - a_src, -1, 1), bucketed into low / mid / high name-minus-source regimes.',
            'replicator-mutator step: exp-fitness growth, frequency renormalisation, perturbed paraphrase mutation, and frequency-capped culling.',
            'scatter atlas over specificity (x) and log-circulation (y) with point size encoding context-loss pressure, plus lineage chains for selected variants.',
            'calibration: deterministic checks on the cliche midpoint, a saturated cliche, the entanglement gap, and fitness monotonicity in generality and prestige (all error 0).',
            'framing kept honest: the corpus is synthetic, the weights are hand-set, and the cliche-attractor drift is an observed tendency of the toy, not a proven fixed point.',
        ],
    },
];
