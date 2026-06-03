import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.7',
        date: 'June 2026',
        description:
            'first cut. ports the RoPE-and-neural-phase ideation prototype to playground conventions: PlaygroundLayout, black-and-lime palette, five named presets, snapshot comparison, parameter sweep, sensitivity tornado, calibration table against attention concentration, ten assumptions.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'June 2026',
        changes: [
            'ported the RoPE math from the ideation prototype: per-pair frequency ladder, position-dependent rotation, dot-product attention.',
            'added the place-cell phase-precession side: rate-by-phase plot, spike scatter, three-oscillation grid interference, side-by-side bridge view.',
            'classified the design space into five presets: LLaMA-style head, long-range head, short-context bias, extrapolation regime, place-cell phase code.',
            'calibration metric: attention concentration measured against a reader-assigned canonical concentration for each preset.',
            'added the standard scientific panel suite: sweep across seven params, sensitivity tornado on concentration, calibration table, ten assumptions, narrative and reading.',
            'snapshot comparison: save a configuration, change parameters, see dashed-orange cells in the attention heatmap where the new score differs from the saved one by more than 25%.',
        ],
    },
];
