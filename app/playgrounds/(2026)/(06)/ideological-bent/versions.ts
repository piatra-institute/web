import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'June 2026',
        description:
            'first cut. ports the Bent Test prototype to playground conventions: PlaygroundLayout, black-and-lime palette, a softmax-logit baseline forecast, an editable forecast board, the actor-swap diagnostics (identity likelihood ratio, Bent Score, Jensen-Shannon brittleness, identity dominance ratio, counterfactual inadmissibility), an evidence-debt panel, a causal map, an assumption sweep, calibration of the formulas, and nine assumptions.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'June 2026',
        changes: [
            'baseline forecast: a multinomial-logit model, softmax over log-priors shifted by assumption sliders times hand-tuned weights.',
            'forecast board: editable per-actor, per-outcome probabilities with live baseline bars and normalise / copy-baseline helpers.',
            'diagnostics: identity likelihood ratio, Bent Score (logit actor-effect gap), ideological brittleness (Jensen-Shannon), identity dominance ratio, and counterfactual inadmissibility in bits.',
            'evidence debt: selected reasons supply an odds multiplier checked against the multiplier your deviation requires.',
            'blind-label mode hides actor identities so the facts lead; the diagnostics are symmetric across the swap.',
            'assumption sweep, sensitivity table, causal map, and timeline decomposition to keep distinct outcomes from collapsing.',
            'calibration verifies the diagnostic formulas against hand-computed values rather than empirical data.',
        ],
    },
];
