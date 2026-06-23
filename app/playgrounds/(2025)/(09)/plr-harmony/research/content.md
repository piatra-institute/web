# PLR Harmony: The Hidden Group Behind Chord Progressions

## Abstract

Some of the most haunting chord progressions in late-Romantic and film music do
not follow classical key-based rules. Neo-Riemannian theory explains them with a
different idea: three simple transformations that slide one chord into another by
moving a single voice. This playground lets you walk that chord space, and the
structure underneath is exact group theory, which the calibration pins precisely.

## Three moves

Start with any major or minor triad. Three transformations connect it to its
closest neighbours, each holding two notes fixed and moving the third by a small
step:

- **P (parallel)**: swap major and minor on the same root. C major becomes C
  minor.
- **L (leading-tone exchange)**: C major becomes E minor. The root drops to the
  third, the top note slides up a semitone.
- **R (relative)**: C major becomes A minor, its relative minor.

The calibration checks all three on C major: R lands on A minor (root 9), L on E
minor (root 4), and C major's pitch classes {0, 4, 7} sum to 11. These are
ground-truth facts of music theory, not tunable choices.

## Parsimony

The reason these moves sound smooth is parsimony: each changes only one voice, by
a semitone or whole tone, while the other two notes are held. The calibration
verifies this directly, C major and L's result E minor share exactly two of three
pitch classes ({4, 7}). That minimal motion is what makes Neo-Riemannian
progressions feel like the harmony is gliding rather than jumping.

## The group structure

Each transform is an involution: do it twice and you are back where you started
(the calibration checks P(P(t)) = t). More deeply, P, L, and R together generate
the dihedral group of order 24, the same group as the symmetries of a regular
12-gon, and it acts simply transitively on the 24 triads. In plain terms: from
any chord you can reach any other by a sequence of P, L, R moves, and the chord
space has a clean, navigable geometry. That is why the playground can compute a
genuine shortest path between any two triads, which is what the chord-space search
does.

## Scope, honestly

This is voice-leading combinatorics, not acoustics. Pitch classes are taken
modulo 12 (equal temperament), enharmonic spellings are identified, and only major
and minor triads are modelled, no sevenths, no just intonation, no actual sound.
And while Neo-Riemannian analysis illuminates a lot of chromatic music, whether a
particular passage is "really" a PLR walk is an analytic judgement, not something
the group structure decides. The exact, checkable content is the transforms and
their group; the musical interpretation is the lens you bring.

## References

- Cohn, R. (1997). Neo-Riemannian operations, parsimonious trichords, and their
  Tonnetz representations.
- Lewin, D. Generalized Musical Intervals and Transformations.
- Standard references on the dihedral group and pitch-class set theory.
