import type { CalibrationResult } from '@/components/CalibrationPanel';

import { frequencyToMidi, midiToFrequency, quantizeFrequency } from './logic';


/**
 * The synthesis is real-time audio, but the pitch math behind it is exact and
 * reproducible. Each case computes a value here (not stored) and checks it against
 * music-theory ground truth: the A4 = 440 Hz = MIDI 69 anchor, the octave (a
 * factor of two is twelve semitones), middle C, and the snapping of an off-pitch
 * frequency onto the nearest note of a scale.
 */
export function buildCalibration(): CalibrationResult[] {
    return [
        {
            name: 'A4 is MIDI 69',
            description: 'the equal-tempered anchor: 440 Hz maps to MIDI note 69.',
            predicted: Number(frequencyToMidi(440).toFixed(4)),
            expected: 69,
            source: 'midi = 69 + 12 log2(f/440)',
        },
        {
            name: 'octave is twelve semitones',
            description: 'doubling the frequency to 880 Hz raises the MIDI number by exactly twelve.',
            predicted: Number(frequencyToMidi(880).toFixed(4)),
            expected: 81,
            source: 'one octave = 12 semitones, 69 + 12',
        },
        {
            name: 'middle C frequency (MIDI 60)',
            description: 'MIDI 60 converts back to the standard middle-C frequency.',
            predicted: Number(midiToFrequency(60).toFixed(2)),
            expected: 261.63,
            source: '440 * 2^((60-69)/12)',
        },
        {
            name: 'quantize 263 Hz to C major -> middle C',
            description: 'a slightly sharp 263 Hz snaps to the nearest scale note, middle C at 261.63 Hz.',
            predicted: Number(quantizeFrequency(263, 'major').toFixed(2)),
            expected: 261.63,
            source: 'nearest C-major pitch to 263 Hz is C4',
        },
        {
            name: 'quantize 450 Hz to C major -> A4',
            description: 'a slightly sharp 450 Hz snaps to A4 at 440 Hz.',
            predicted: Number(quantizeFrequency(450, 'major').toFixed(2)),
            expected: 440,
            source: 'nearest C-major pitch to 450 Hz is A4',
        },
    ];
}
