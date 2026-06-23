import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'particles-as-narrative',
        statement:
            'a life or story is pictured as a system of particles whose connections represent narrative integration. it is a visual metaphor for coherence, not a measurement of any real psychological state.',
        citation:
            'narrative-identity theory (McAdams); the particle picture is an illustrative analogy.',
        confidence: 'speculative',
        falsifiability:
            'no claim here is tested against real narrative-coherence data; the mapping from particles to meaning is interpretive.',
    },
    {
        id: 'three-regimes',
        statement:
            'the system has three regimes: harmony (slow, highly connected), burnout (fast, disconnected), and weaving (the user actively builds connections). these encode the rise, collapse, and repair of coherence.',
        citation:
            'design of the playground; the three states are the model\'s qualitative claim.',
        confidence: 'contested',
        falsifiability:
            'real narrative repair is not a single global state switch; richer dynamics would need more than three regimes.',
    },
    {
        id: 'coherence-score',
        statement:
            'the coherence score is deterministic: in harmony it is the connection count over (particles times five) as a percent (clamped to 100), in burnout it is zero, and in weaving it is user links over (particles over two) as a percent. these formulas are exact and checked by the calibration.',
        citation:
            'getCoherenceScore in the logic module.',
        confidence: 'established',
        falsifiability:
            'the calibration verifies each branch against its closed form; a deviation would be an implementation error.',
    },
    {
        id: 'distance-connections',
        statement:
            'automatic connections form between any two particles closer than a fixed distance, so denser clustering yields more connections and a higher harmony score. this is graph-by-proximity, not a model of real social or narrative ties.',
        citation:
            'updateConnections proximity rule.',
        confidence: 'established',
        falsifiability:
            'the proximity rule is exact; reading the resulting graph as a real relationship network is the interpretive step.',
    },
    {
        id: 'stochastic-motion',
        statement:
            'particle velocities are randomized per state and damped each step, so the animation differs every run. the score formulas, not the trajectories, are the reproducible part.',
        citation:
            'use of Math.random for velocities and initial positions.',
        confidence: 'established',
        falsifiability:
            'this is why the calibration targets the score branches rather than a specific frame.',
    },
    {
        id: 'weaving-is-agency',
        statement:
            'in the weaving state the user clicks to forge connections, standing in for the active work of re-integrating a fractured story. the score rewarding user links encodes the claim that coherence can be rebuilt through deliberate effort.',
        citation:
            'narrative-repair framing; the user-connection mechanic.',
        confidence: 'speculative',
        falsifiability:
            'whether deliberate re-narration restores psychological coherence is an empirical question the playground illustrates but does not test.',
    },
];
