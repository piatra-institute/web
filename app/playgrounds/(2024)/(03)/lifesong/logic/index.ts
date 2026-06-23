// The pitch math that turns biological rhythms into musical notes. Frequency and
// MIDI are related by the equal-tempered scale (A4 = 440 Hz = MIDI 69), and a raw
// frequency is snapped to the nearest note of a chosen scale. These are the exact,
// reproducible relations behind the audio synthesis; the Viewer uses the same
// formulas. Pure functions used by the calibration.

export const SCALES: Record<string, number[]> = {
    pentatonic: [0, 2, 4, 7, 9],
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    'whole-tone': [0, 2, 4, 6, 8, 10],
};

function clamp(value: number, min: number, max: number): number {
    const v = Number.isFinite(value) ? value : min;
    return Math.max(min, Math.min(max, v));
}

// equal-tempered conversions: 12 semitones per octave, A4 = 440 Hz = MIDI 69
export function frequencyToMidi(frequency: number): number {
    return 69 + 12 * Math.log2(frequency / 440);
}

export function midiToFrequency(midi: number): number {
    return 440 * 2 ** ((midi - 69) / 12);
}

// snap a raw frequency to the nearest pitch of the chosen scale (in any octave),
// then clamp into the audible working range
export function quantizeFrequency(frequency: number, scaleType: string): number {
    const scale = SCALES[scaleType] ?? SCALES.pentatonic;
    const midi = frequencyToMidi(clamp(frequency, 55, 1760));
    const baseOctave = Math.floor(midi / 12);
    let closest = midi;
    let closestDistance = Infinity;
    for (let octave = baseOctave - 1; octave <= baseOctave + 1; octave += 1) {
        for (const pitchClass of scale) {
            const candidate = octave * 12 + pitchClass;
            const distance = Math.abs(candidate - midi);
            if (distance < closestDistance) {
                closest = candidate;
                closestDistance = distance;
            }
        }
    }
    return clamp(midiToFrequency(closest), 70, 1400);
}
