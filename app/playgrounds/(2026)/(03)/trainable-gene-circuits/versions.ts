import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'March 2026',
        description:
            'first cut. three coupled production-degradation ODEs with shared Hill regulation, integrated by fourth-order Runge-Kutta under a five-phase stimulation protocol (baseline, training, washout, probe, after). three presets cover the canonical learning regimes: a slow-variable associative trace, a bistable toggle, and a repressilator oscillator. a narrative panel labels each run, and the calibration verifies the deterministic primitives plus the conditioning, commitment, and oscillation outcomes against recomputed targets.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'March 2026',
        changes: [
            'three-gene model: dx_i/dt = basal_i + beta_i * regulation_i(x, u) - decay_i * x_i with signed Hill regulation on every edge.',
            'five-phase stimulation protocol so a transient training pulse can be probed after a washout, separating durable memory from transient response.',
            'associative preset where gene C is a low-decay slow variable that stores paired stimulation and gates the output, after the Fernando-Levin conditioning circuit.',
            'toggle preset using mutual repression plus self-activation for bistable basin commitment, and a repressilator preset that stores state as a sustained oscillation.',
            'narrative inference labels each run as conditioning-like, committed, oscillatory, or no durable learning, computed from probe-window statistics.',
            'calibration: exact Hill half-saturation and zero-weight identities, plus deterministic conditioning gain, toggle dominance, and oscillation amplitude recomputed from the live logic.',
            'framing kept honest: learning means history-dependent state change under timed stimulation, not topology rewiring or gradient descent.',
        ],
    },
];
