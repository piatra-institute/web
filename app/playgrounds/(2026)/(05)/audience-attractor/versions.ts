import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'May 2026',
        description:
            'first cut. ports the ideation prototype to the playground conventions: PlaygroundLayout, controlled-component state, black-and-lime palette, six named scenarios, snapshot comparison, parameter sweep, sensitivity tornado, calibration table, ten assumptions, and a research companion.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'May 2026',
        changes: [
            'ported the potential-landscape signature visualisation to a black-and-lime SVG with dwell histogram overlaid on the wells.',
            'ported the trajectory chart, drift curve, and band histogram to the black-and-lime palette via recharts.',
            'expanded the prototype five scenarios to six by adding a slow-decay scenario as a falsification target for the floor.',
            'replaced the prototype dwell-band readout with a four-tier regime classification (collapsed, wandering, stable basin, transitioned).',
            'added the standard scientific panel suite: sweep across each of twelve parameters, sensitivity tornado on final viewers, calibration table with reader-assigned expected finals, ten assumption entries.',
            'snapshot comparison: save a configuration, change parameters, see the dashed-orange ghost on both the landscape and the trajectory.',
            'narrative and reading generators tuned to the basin language (dominant band, dwell share, basin transitions, falsification).',
        ],
    },
];
