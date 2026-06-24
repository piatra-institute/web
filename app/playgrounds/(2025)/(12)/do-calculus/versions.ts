import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'December 2025',
        description:
            'first cut. pairs a stochastic spiking sandbox (do-interventions, transfer entropy, Granger causality, synergy detection) with a deterministic discrete backdoor model. the backdoor model fixes U -> X -> Y and U -> Y over binary variables, computes P(Y|do(X)) by the adjustment formula, contrasts it with the naive observational conditional, and exposes the confounding bias. calibration checks the closed-form arithmetic against hand-worked values; six assumptions keep the no-unmeasured-confounders crux explicit.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'December 2025',
        changes: [
            'spiking SCM sandbox: Poisson-baseline neurons with delayed excitatory edges and coincidence (synergy) edges, three templates (Maier triad, diamond chain, hidden confounder).',
            'do-operator as clamp-and-simulate: a node is held at 0 or 1 and the network is re-run, contrasted with the natural run in the spike raster.',
            'observational measures for comparison: transfer entropy and a permutation Granger test, illustrating where prediction diverges from causation.',
            'deterministic discrete backdoor model added: binary U, X, Y with explicit conditional probability tables and closed-form P(Y|do(X)) by adjustment.',
            'naive observational conditional and confounding bias computed in closed form, so seeing-versus-doing is exact rather than sampled.',
            'calibration of the backdoor arithmetic against hand computations: pure-confounder zero effect, confounder-plus-effect, the no-confounder identity, and a normalization check.',
            'six assumptions with falsifiability, marking no-unmeasured-confounders as the contested crux and the spiking simulation as illustrative only.',
        ],
    },
];
