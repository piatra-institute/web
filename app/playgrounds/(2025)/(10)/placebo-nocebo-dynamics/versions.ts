import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'October 2025',
        description:
            'precision-weighting placebo / nocebo landscape: a Bayesian prior-vs-evidence weight feeds two analgesic pathways (mu-opioid and conditioning-gated CB1) and a CCK nocebo pathway, each passed through a signed saturation, with pharmacological blockers, a calibration panel anchored to the closed-form algebra, six assumptions, and a research companion.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'October 2025',
        changes: [
            'precision weight w = Pi_p / (Pi_p + Pi_y) with attention multiplicatively raising sensory precision.',
            'two analgesic branches: mu-opioid (reversible by naloxone) and CB1 (blocked by rimonabant, gated by conditioning).',
            'CCK nocebo branch (reduced by proglumide) on negative cues; net signed effect = analgesia minus nocebo across the cue-drug similarity axis.',
            'signed saturating nonlinearity x / (1 + |x|) bounding every pathway to (-1, 1).',
            'extracted the model into a pure logic module shared by the viewer, the prior-weight readout, and calibration.',
            'calibration panel with predicted values computed by the logic functions and checked against hand-derived targets (balanced precision, attention cancellation, zero-expectation, saturation limit, net subtraction).',
            'six assumptions with confidence levels and falsifiability conditions, plus a research companion on predictive-coding accounts of placebo analgesia.',
        ],
    },
];
