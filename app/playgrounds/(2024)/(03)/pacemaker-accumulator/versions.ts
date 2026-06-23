import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'March 2024',
        description:
            'pacemaker-accumulator model of interval timing: a pulse-emitting clock and a counting accumulator reproduce Scalar Expectancy Theory, including the scalar property (Weber\'s law for time). Retrofitted with the scientific scaffolding: a logic module with the exact timing relationships, calibration of the mean interval and the constant coefficient of variation, and assumptions placing the model among timing theories.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'March 2024',
        changes: [
            'pacemaker emitting near-Poisson pulses with noise and slow adaptation, feeding a counting accumulator with decay.',
            'interval estimates from threshold crossings, with variability tracking.',
            'logic module with the mean-interval (N/r), pulse-probability, and scalar-CV (1/sqrt(N)) relationships.',
            'calibration checks the mean interval, its inverse-rate scaling, the per-step pulse probability, and the scalar property.',
            'assumptions situate the pacemaker-accumulator among interval-timing theories and flag the noise/adaptation as stylized.',
        ],
    },
];
