import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'visualization-is-illustrative',
        statement:
            'the on-screen field, particle, and spacetime animation is illustrative, not a solved physical model. particle positions, masses, and field strengths are randomized for visual effect; the sliders shape the picture, not a derived prediction.',
        citation:
            'implementation: the renderer uses Math.random for particle and field properties.',
        confidence: 'established',
        falsifiability:
            'reading any specific number off the animation as a physical quantity would be unfounded; that is why the calibration targets a separate, exact relation instead.',
    },
    {
        id: 'noether-theorem',
        statement:
            'the one exact, checkable claim is Noether\'s theorem: a continuous symmetry of the dynamics implies a conserved quantity. the calibration realizes this on a harmonic oscillator, where time-translation symmetry implies conservation of energy.',
        citation:
            'Noether (1918); the foundational symmetry-conservation correspondence.',
        confidence: 'established',
        falsifiability:
            'the calibration checks that energy is conserved to high precision under the symmetry and is lost when the symmetry is broken; a failure would contradict the theorem or the integrator.',
    },
    {
        id: 'symplectic-integrator',
        statement:
            'energy conservation is checked with a velocity-Verlet (symplectic) integrator, which bounds the energy error over long runs. a naive Euler step would drift even with the symmetry intact, so the integrator choice matters for the test.',
        citation:
            'symplectic integration of Hamiltonian systems; velocity-Verlet bounds energy error.',
        confidence: 'established',
        falsifiability:
            'switching to non-symplectic Euler would show spurious drift even in the symmetric case, an artifact of the method rather than broken symmetry.',
    },
    {
        id: 'no-unified-equation',
        statement:
            'the framing, that all of physics might follow from one equation, is an open aspiration in fundamental physics, not a result. no such equation is implemented or claimed here.',
        citation:
            'the search for unification (Weinberg, Carroll); an unsolved problem.',
        confidence: 'speculative',
        falsifiability:
            'whether a single unifying equation exists is undecided; nothing in this playground bears on it.',
    },
    {
        id: 'standard-model-gravity-gap',
        statement:
            'the listed phenomena (quantum field theory, general relativity, gauge forces) are real and well tested individually, but reconciling quantum mechanics with gravity remains unsolved. the playground gestures at the landscape, it does not bridge the gap.',
        citation:
            'the quantum-gravity problem; a central open question.',
        confidence: 'established',
        falsifiability:
            'a working theory of quantum gravity would change the framing; the playground takes no position on candidates.',
    },
    {
        id: 'conceptual-sandbox',
        statement:
            'this is a conceptual and aesthetic sandbox for thinking about emergence, symmetry, and scale in physics, not a simulator with predictive content beyond the Noether relation it calibrates.',
        citation:
            'stated scope of the playground.',
        confidence: 'established',
        falsifiability:
            'predictive claims would require an actual field-theory solver, which this is not.',
    },
];
