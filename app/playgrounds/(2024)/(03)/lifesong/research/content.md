# Lifesong: Hearing the Rhythms of Life

## Abstract

Living systems are full of rhythms, heartbeats, circadian cycles, neural
oscillations, spanning frequencies from many per second to one per day. Lifesong
turns those rhythms into music. The artistic mapping from biology to sound is
interpretive, but the tuning underneath, how a frequency becomes a pitch and snaps
to a musical scale, is exact equal-tempered music theory, and the calibration pins
it.

## Sonification

Sonification is the auditory cousin of visualization: representing data as sound
so the ear can pick out structure the eye might miss. The choice of how to map a
biological frequency to an audible pitch is aesthetic, there is no fact that a
circadian rhythm "is" a particular note, but once a mapping is chosen it can be
made precise and consistent, which is what makes the result music rather than
noise.

## The pitch math

Western tuning uses twelve-tone equal temperament. Every pitch corresponds to a
MIDI number, with the anchor A4 = 440 Hz = MIDI 69, and the conversion is

> midi = 69 + 12 * log2(frequency / 440).

Two facts fall straight out, and the calibration checks both: an octave (doubling
the frequency to 880 Hz) raises the MIDI number by exactly twelve semitones, and
MIDI 60 converts back to middle C at 261.63 Hz.

## Snapping to a scale

A raw frequency rarely lands on a musical note. Lifesong quantizes: it converts
the frequency to MIDI, then searches the nearby octaves for the closest pitch
belonging to the chosen scale (pentatonic, major, minor, chromatic, or
whole-tone) and returns that. So the output is always consonant within the scale.
The calibration confirms the snapping: a slightly sharp 263 Hz lands on middle C,
and a slightly sharp 450 Hz lands on A4, both in C major.

Frequencies are also clamped to an audible working band, so a rhythm that is too
slow or too fast to hear is folded into the hearable range rather than reproduced
literally. That is a representational choice, not a distortion of the math.

## Timbre

Each voice is given one of four classic oscillator waveforms, sine, triangle,
sawtooth, square. These are mathematical idealizations with simple spectra, not
the rich, evolving timbres of real biological sounds. They are the synthesis
primitives that make the rhythms audible and distinguishable, nothing more.

## What it is

Lifesong is an instrument, an aesthetic way to hear the structure of rhythms,
not an analysis tool. Its quantitative content is the tuning and quantization;
the meaning you attach to the resulting song is yours. The honest split is simple:
the music theory is exact and checked, the mapping from life to music is an
artistic gesture.

## References

- Hermann, T., Hunt, A., and Neuhoff, J. G. (eds.). The Sonification Handbook.
- Standard references on twelve-tone equal temperament and MIDI tuning.
