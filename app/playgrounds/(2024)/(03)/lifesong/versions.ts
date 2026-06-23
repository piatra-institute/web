import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'March 2024',
        description:
            'sonification instrument that turns biological rhythms into music by mapping rhythm frequencies to equal-tempered pitches and snapping them to a chosen scale. Retrofitted with the scientific scaffolding: a logic module holding the exact pitch math (frequency-MIDI conversion and scale quantization), calibration against music-theory ground truth, and assumptions separating that exact tuning from the artistic rhythm-to-sound mapping.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'March 2024',
        changes: [
            'rhythm-to-music sonification with multiple scales, waveforms, color modes, and audio/video export.',
            'logic module with equal-tempered frequency-to-MIDI conversion and scale quantization.',
            'calibration against music-theory ground truth: the A4 = 440 Hz anchor, the octave, middle C, and scale snapping.',
            'assumptions separate the exact pitch math from the artistic mapping of rhythms to sound.',
        ],
    },
];
