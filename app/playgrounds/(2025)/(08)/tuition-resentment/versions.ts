import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'August 2025',
        description:
            'first cut of the tuition-resentment attribution model: a deterministic discrete-time loop in which expectation (driven by cost, marketing, prestige, and reputation) clashes with grade-inflated observed quality to produce dissonance, an attribution mixer lambda splits that dissonance into self-blame and institutional blame, complaints feed a damped reputation recurrence, and scenario switches (aid shock, ranking drop, grade audit, quality program) perturb the trajectory. ships with closed-form calibration of the four exact sub-formulas and six assumptions separating exact math from interpretation.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'August 2025',
        changes: [
            'expectation formation E = b0 + b1*tuition + b2*marketing + b3*prestige + b4*reputation, clamped to [0,100].',
            'observed quality Q_obs = trueQuality + gammaG*leniency, where grade leniency inflates the signal above true quality.',
            'rectified dissonance D = max(0, E - Q_obs) channelled through the logistic attribution mixer lambda into self-resentment and institutional resentment.',
            'complaint propensity as a logistic of institutional resentment damped by power asymmetry, feeding a damped reputation recurrence with quality lift, complaint drag, and audit penalties.',
            'four scenario switches: aid shock (t>=4), ranking drop (t=6), grade audit penalty above leniency 65, and a quality program (t>=5).',
            'calibration against the closed-form expectation, observed-quality, dissonance, and penalty formulas, plus six assumptions and a research companion.',
        ],
    },
];
