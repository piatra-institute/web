import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'paradox-as-dynamics',
        statement:
            'self-referential sentences are treated as a discrete dynamical system: each updates its truth value from the previous step. a paradox like the Liar becomes not a contradiction but an oscillation in time.',
        citation:
            'the revision theory of truth (Gupta and Belnap); paradox as a non-terminating revision sequence.',
        confidence: 'contested',
        falsifiability:
            'classical bivalent logic forbids assigning the Liar a stable truth value; the dynamical reading is one resolution among several (also gap/glut theories).',
    },
    {
        id: 'synchronous-update',
        statement:
            'all sentences update simultaneously from the previous global state, in discrete time. the dynamics, and which cycles appear, depend on this synchronous, deterministic update.',
        citation:
            'synchronous discrete-time update, as in cellular automata.',
        confidence: 'established',
        falsifiability:
            'asynchronous or randomized update orders can change the attractors; the model fixes the synchronous convention.',
    },
    {
        id: 'exact-update-rules',
        statement:
            'each sentence type has an exact Boolean update: the Liar flips (period 2), a truth-teller holds (period 1), assertions copy or negate a target, and biconditionals compare. these rules are deterministic and checkable.',
        citation:
            'the nextTruth update rules in the logic module.',
        confidence: 'established',
        falsifiability:
            'the calibration verifies the Liar period, the truth-teller fixed point, and the IFF/ASSERT single-step logic; a deviation would be an implementation error.',
    },
    {
        id: 'cycle-detection',
        statement:
            'because the global state is a finite bit vector, the trajectory must eventually repeat; the first repeated state marks an attractor whose length is the period. this is exact.',
        citation:
            'finite-state determinism forces eventual periodicity (pigeonhole).',
        confidence: 'established',
        falsifiability:
            'the calibration checks detected periods against known cycles; the eventual-periodicity guarantee is a theorem for finite deterministic systems.',
    },
    {
        id: 'window-controller-extra',
        statement:
            'one sentence type ("percent controller") depends on a moving average of its own recent history rather than a single previous step, adding memory. its behaviour depends on the window length and target fraction.',
        citation:
            'a windowed-feedback rule layered on the Boolean dynamics.',
        confidence: 'contested',
        falsifiability:
            'changing the window or target changes its cycles; the calibration targets the memoryless rules, where behaviour is unambiguous.',
    },
    {
        id: 'morphogenesis-metaphor',
        statement:
            'calling the resulting temporal patterns "morphogenesis" is a metaphor: stable rhythms and cycles are read as emergent form. it is a conceptual lens on self-reference, not a model of biological development.',
        citation:
            'morphogenesis used metaphorically for pattern formation in logical time.',
        confidence: 'speculative',
        falsifiability:
            'the exact content is the truth-value dynamics; the developmental-form framing is interpretive.',
    },
];
