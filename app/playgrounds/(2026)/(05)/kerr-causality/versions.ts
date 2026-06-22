import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'May 2026',
        description:
            'first cut. ports the ideation demo to the playground conventions: PlaygroundLayout, controlled-component state, black-and-lime palette, six named scenarios, snapshot comparison, parameter sweep, sensitivity tornado, calibration against closed-form turning points, ten assumptions, and a research companion.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'May 2026',
        changes: [
            'ported the demo SchematicPenrose to a black-and-lime SVG tile diagram with an animated photon dot and a snapshot ghost overlay.',
            'ported the radial-potential plot to a black-and-lime SVG with translucent allowed bands under R(r).',
            'added six named scenarios: figure-like ergoregion, positive-energy, negative-energy ergoregion, Schwarzschild limit, near-extremal, polar plunge.',
            'replaced the single-status readout with a four-tier regime classification (unbounded escape, captured outside, trapped across horizons, trapped inside r-).',
            'added the standard scientific panel suite: sweep across each of {a, E, L, Q}, sensitivity tornado on allowed corridor span, calibration table against closed-form and reader-assigned expected spans, ten assumption entries.',
            'snapshot comparison: save a configuration, change parameters, see the dashed-orange ghost overlay on both the causal diagram and the radial-potential plot.',
            'auto-play animation pattern: parameter changes restart the photon phase, with manual play/pause/replay and a scrub slider.',
        ],
    },
];
