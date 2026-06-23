import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'plr-transforms',
        statement:
            'the model uses the three Neo-Riemannian transformations P (parallel), L (leading-tone exchange), and R (relative), each a parsimonious move that holds two pitch classes fixed and shifts the third. these are exact definitions, not approximations.',
        citation:
            'Neo-Riemannian theory (Lewin, Cohn); the standard P/L/R operations on triads.',
        confidence: 'established',
        falsifiability:
            'the calibration verifies each transform and the two-shared-notes property; a deviation would be an implementation error.',
    },
    {
        id: 'involution',
        statement:
            'each transform is an involution: applying it twice returns the original triad. so P, L, and R are their own inverses.',
        citation:
            'P, L, R are involutions by construction.',
        confidence: 'established',
        falsifiability:
            'the calibration checks P(P(t)) = t; the same holds for L and R.',
    },
    {
        id: 'dihedral-group',
        statement:
            'P, L, and R generate the dihedral group of order 24, which acts simply transitively on the 24 major and minor triads, so every triad can be reached from every other by a unique-length sequence, and shortest paths are well defined.',
        citation:
            'the PLR group is dihedral of order 24 (Cohn 1997); duality with the T/I group.',
        confidence: 'established',
        falsifiability:
            'if some triad were unreachable by P/L/R, the simple-transitivity claim would fail; the shortest-path search would find no path.',
    },
    {
        id: 'twelve-tone-equal-temperament',
        statement:
            'pitch classes are taken modulo 12 (twelve-tone equal temperament), so enharmonic spellings are identified and only major and minor triads are modelled, not sevenths or other chords.',
        citation:
            'standard pitch-class set theory in twelve-tone equal temperament.',
        confidence: 'contested',
        falsifiability:
            'music using just intonation or richer chords would not be captured by this 24-triad, mod-12 model.',
    },
    {
        id: 'voice-leading-not-acoustics',
        statement:
            'the model is about voice-leading parsimony (how few semitones move between chords), not acoustic consonance or actual audio. the harmony is combinatorial, not a sound model.',
        citation:
            'parsimonious voice leading as the organizing principle.',
        confidence: 'established',
        falsifiability:
            'the invariants are about note membership and movement; they say nothing about how the chords sound.',
    },
    {
        id: 'analytic-tool',
        statement:
            'this is an exact analytic toy for chord-space navigation, used in analyses of late-Romantic and film harmony. its content is the group structure, not a claim about how composers actually wrote.',
        citation:
            'Neo-Riemannian analysis as one lens among several.',
        confidence: 'speculative',
        falsifiability:
            'whether a given piece is best explained by PLR moves is an analytic judgement, not something the group structure settles.',
    },
];
