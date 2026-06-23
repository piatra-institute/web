import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'rhythm-to-pitch',
        statement:
            'biological rhythms are sonified by mapping their frequencies onto audible pitches. the mapping is a deliberate artistic choice, not a claim that organisms literally produce these tones.',
        citation:
            'data sonification practice; the rhythm-to-pitch mapping is illustrative.',
        confidence: 'speculative',
        falsifiability:
            'the sound is a representation; there is no biological fact that a circadian rhythm "is" a particular musical note.',
    },
    {
        id: 'equal-temperament',
        statement:
            'pitch is computed in twelve-tone equal temperament with A4 = 440 Hz = MIDI 69, so an octave is a factor of two in frequency and twelve equal semitones. these conversions are exact.',
        citation:
            'standard equal-tempered tuning; midi = 69 + 12 log2(f/440).',
        confidence: 'established',
        falsifiability:
            'the calibration checks the 440 Hz anchor, the octave, and middle C against music-theory values; a deviation would be an implementation error.',
    },
    {
        id: 'scale-quantization',
        statement:
            'a raw frequency is snapped to the nearest note of a chosen scale (pentatonic, major, minor, chromatic, whole-tone), so the output is always musically consonant within that scale.',
        citation:
            'pitch quantization to a scale; a standard sonification technique.',
        confidence: 'established',
        falsifiability:
            'the calibration verifies that off-pitch inputs snap to the correct nearest scale note; the snapping rule is exact.',
    },
    {
        id: 'working-range-clamp',
        statement:
            'frequencies are clamped to an audible working range before and after quantization, so very slow or very fast rhythms are folded into a hearable band rather than reproduced literally.',
        citation:
            'range clamping for audibility; a presentation choice.',
        confidence: 'established',
        falsifiability:
            'rhythms outside the band are not represented at their true frequency, by design; this is a representational limit, not a model claim.',
    },
    {
        id: 'waveform-timbre',
        statement:
            'timbre is selected from a small set of basic waveforms (sine, triangle, sawtooth, square). these are mathematical idealizations, not the spectra of real biological sounds.',
        citation:
            'classic oscillator waveforms; idealized synthesis primitives.',
        confidence: 'contested',
        falsifiability:
            'real sounds have rich, evolving spectra these four static waveforms cannot capture.',
    },
    {
        id: 'aesthetic-sandbox',
        statement:
            'lifesong is an aesthetic instrument for hearing the structure of rhythms, not an analysis tool. its quantitative content is the pitch math; the meaning attached to the music is interpretive.',
        citation:
            'stated scope; a sonification sandbox.',
        confidence: 'established',
        falsifiability:
            'no claim about biology is tested by the audio; the exact, checkable part is the tuning and quantization.',
    },
];
