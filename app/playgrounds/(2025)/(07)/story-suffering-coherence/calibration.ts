import type { CalibrationResult } from '@/components/CalibrationPanel';

import { ParticleSystem } from './logic';


/**
 * Particle motion is stochastic, so trajectories are not reproducible. What is
 * deterministic is the coherence score: a pure function of the connection counts
 * and the configuration. Each case sets a known connection state on the system
 * and checks the score the model computes (the predicted value is computed here
 * by getCoherenceScore, not stored), including the burnout floor and the
 * harmony clamp at 100.
 */
function makeSystem(): ParticleSystem {
    return new ParticleSystem(800, 600, { particleCount: 100 });
}

export function buildCalibration(): CalibrationResult[] {
    const burnout = makeSystem();
    burnout.setState('burnout');

    const harmony = makeSystem();
    harmony.setState('harmony');
    harmony.connections = new Array(250).fill(null).map(() => ({} as never));

    const harmonyClamp = makeSystem();
    harmonyClamp.setState('harmony');
    harmonyClamp.connections = new Array(1000).fill(null).map(() => ({} as never));

    const weaving = makeSystem();
    weaving.setState('weaving');
    weaving.userConnections = new Array(10).fill(null).map(() => ({} as never));

    return [
        {
            name: 'burnout coherence is zero',
            description: 'in the burnout state the integration collapses, so the coherence score is exactly zero.',
            predicted: burnout.getCoherenceScore(),
            expected: 0,
            source: 'getCoherenceScore returns 0 for burnout',
        },
        {
            name: 'harmony coherence (250 connections, N=100)',
            description: 'harmony score is connections / (count * 5) as a percent: 250 / 500 = 50%.',
            predicted: harmony.getCoherenceScore(),
            expected: 50,
            source: '(250 / (100 * 5)) * 100',
        },
        {
            name: 'harmony coherence clamps at 100',
            description: 'a very high connection count cannot push the score above 100.',
            predicted: harmonyClamp.getCoherenceScore(),
            expected: 100,
            source: 'min(100, (1000/500)*100)',
        },
        {
            name: 'weaving coherence (10 user links, N=100)',
            description: 'weaving score is user links / (count / 2) as a percent: 10 / 50 = 20%.',
            predicted: weaving.getCoherenceScore(),
            expected: 20,
            source: '(10 / (100 / 2)) * 100',
        },
    ];
}
