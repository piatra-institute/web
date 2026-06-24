import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'June 2025',
        description:
            'wires the trauma-eustress sandbox to the PiatraBench template. the underlying model is a deterministic linear branch diagram: four post-event trajectories whose positions are weighted sums of four mechanism coefficients plus a constriction-driven baseline offset, with a signed bandwidth axis where positive is distress-narrowing and negative is eustress-expansion. adds calibration of the weighted-sum core and threshold structure, seven assumptions separating attested effect directions from the speculative single-axis framing, and a research companion.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'June 2025',
        changes: [
            'bandwidth axis: a single signed dimension where positive constriction is distress-narrowing and negative is eustress-expansion.',
            'four trajectories (resilience, recovery, chronic, growth) branch from the event node; each position is a linear weighted sum of four mechanism influences.',
            'mechanism coefficients with fixed signs: appraisal and rumination raise chronic narrowing, social support and neuro-flexibility lower it, neuro-flexibility drives growth.',
            'recovery path relaxes below baseline by half the constriction value, modelling the delayed rebound-and-return pattern.',
            'calibration: reproduces the per-trajectory mechanism deltas, the eustress threshold at constriction 0, and the recovery rebound under full distress; all checks are exact structural identities.',
            'seven assumptions made explicit, including the contested single-axis collapse and the static (non-temporal) trajectory endpoints.',
        ],
    },
];
