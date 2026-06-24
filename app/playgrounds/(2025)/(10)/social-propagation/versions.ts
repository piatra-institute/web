import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'October 2025',
        description:
            'mean-field social-propagation sandbox comparing a free-for-all network against a policy-friction network. encodes the branching reproduction number R0 = fan-out × reshare × amplification, the epidemic threshold R_eff = 1, attention-decayed conversion, and a political-manipulation-impact accumulator, with calibration against closed-form epidemic and cascade results.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'October 2025',
        changes: [
            'mean-field propagation model: active shares grow by active × R_eff × (susceptible fraction) plus seed ingress, with logistic saturation against a finite audience.',
            'reproduction numbers: basic R0 = avgDegree × shareProb × amplification, effective R_eff after forward caps, question gating, and coolup ignition damping.',
            'epidemic threshold: cascades are supercritical iff R_eff > 1; the final-size fraction 1 − 1/R_eff bounds eventual reach.',
            'manipulation model: per-exposure conversion decayed by an attention half-life and reduced by gating skepticism, accumulated into a political manipulation impact (PMI) index with a policy-versus-baseline reduction figure.',
            'seven policy levers (cooldown, coolup, election window, forward caps, question gating, identity tiers, slow mode) encoded as multipliers on rate, visibility, fan-out, and conversion.',
            'calibration extracts the deterministic core (R0, threshold, final size, freshness decay, linear-threshold activation, cooldown clamp) and checks it against closed-form epidemic and cascade targets.',
        ],
    },
];
