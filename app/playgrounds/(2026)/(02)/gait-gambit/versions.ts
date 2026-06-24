import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'February 2026',
        description:
            'first cut. builds the gait-gambit sandbox as an active-inference policy selector: four gaits (walk, skip, run, stroll) each scored by an expected free energy made of six weighted cost terms minus information gain, with a 2D winner heatmap, crossover sweep, radar of raw components, an EFE waterfall for the winner, a sensitivity ranking, and a stick-figure preview. calibration verifies that every deterministic EFE component reproduces its closed-form definition exactly, and six assumptions keep the active-inference framing apart from the hand-tuned, unit-free specifications.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'February 2026',
        changes: [
            'policy model: G(pi) = sum_k w_k C_k(pi) minus w_info InfoGain(pi) over four gaits; lowest G wins.',
            'six cost terms (risk, ambiguity, energy, social penalty, injury, arousal mismatch) plus an information-gain reward, each a clamped closed form over ten [0,1] context variables.',
            'per-gait specification table (impact, signal amplitude, energy per distance, conspicuousness, complexity, speed) feeding the cost formulas.',
            'visual suite: winner heatmap over any two context axes, crossover sweep along one axis, raw-component radar, weighted EFE waterfall for the winning gait, and a stick-figure preview.',
            'sensitivity ranking by perturbing each context variable by plus or minus 0.05 and flagging whether the winning gait flips.',
            'calibration: every deterministic EFE component checked against its hand-derived closed form, reproducing to four decimals; the stochastic time-stepping is left out of the calibration on purpose.',
            'framing kept honest: the active-inference equation is principled but the gait specs are hand-tuned and unit-free, and the child-versus-adult crossover is an interpretive weight change, not fitted data.',
        ],
    },
];
