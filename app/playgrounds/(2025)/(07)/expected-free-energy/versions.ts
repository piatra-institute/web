import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'July 2025',
        description:
            'first cut. a Monte Carlo visualisation of expected free energy under a linear-Gaussian active-inference model: a random-walk hidden state, Gaussian observations, a risk term measuring divergence from the goal, and a constant per-step ambiguity term. exposes the exact information-theoretic core (discrete KL, Shannon entropy, softmax, Gaussian differential entropy, and the closed-form risk-plus-ambiguity EFE) so the deterministic part can be calibrated against analytic targets.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'July 2025',
        changes: [
            'generative model: zero-drift random-walk hidden state s_{t+1} = s_t + epsilon with Gaussian state noise, and Gaussian observation channel o_t = s_t + eta.',
            'expected free energy decomposed into a pragmatic risk term (squared deviation of observations from the goal, weighted by lambda) and an epistemic ambiguity term (per-step observation entropy times the horizon).',
            'Monte Carlo estimator over up to one thousand sampled trajectories, with the sampled paths drawn on a canvas against the goal boundary.',
            'side-by-side comparison of estimated EFE against a Gaussian KL divergence, making the epistemic (ambiguity) contribution visible.',
            'exact core extracted as pure functions: discrete KL divergence, Shannon entropy, softmax policy normalisation, Gaussian differential entropy, and a closed-form EFE decomposition.',
            'calibration of that core against five analytic targets (KL self-divergence = 0, uniform entropy = log n, softmax mass = 1, unit-variance ambiguity = 0.5 log(2 pi e), and a worked EFE value).',
        ],
    },
];
