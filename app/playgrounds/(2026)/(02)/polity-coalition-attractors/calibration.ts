import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    DEFAULT_PARAMS,
    DEFAULT_SIM,
    PRESETS,
    SimSettings,
    classifyAttractor,
    computePerceivedThreat,
    simulate,
} from './logic';

/**
 * Calibration anchors for the deterministic core of the model.
 *
 * The live playground adds a small stochastic kick to dx each step, so any
 * single run is path dependent. Here we switch noise off (noise = 0) and check
 * properties that are guaranteed by the structure of the dynamics rather than
 * by a lucky seed:
 *
 *  - The replicator factor x(1-x) vanishes at x = 0 and x = 1, so both pure
 *    states are fixed points: a polity that starts with zero exclusionary
 *    support keeps zero, and one that starts saturated stays saturated.
 *  - Strongly inclusive parameter regimes (high trust, contact, norms,
 *    redistribution; low stress, polarization, opportunism) flow to the
 *    inclusive attractor; the mirror-image crisis regime flows to the
 *    exclusionary attractor.
 *  - Perceived threat is passed through clamp01, so it can never exceed 1 even
 *    when every threat-raising term is maxed.
 *
 * Every `predicted` value is computed from the model functions at call time;
 * none is hardcoded. Boolean structural checks return 1 when satisfied and are
 * compared against an expected value of 1.
 */

const NOISE_FREE: SimSettings = { ...DEFAULT_SIM, noise: 0 };

function preset(id: string) {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) {
        throw new Error(`missing preset ${id}`);
    }
    return p;
}

export function buildCalibration(): CalibrationResult[] {
    // 1. Lower fixed point: x0 = 0 is a fixed point of the replicator term.
    const lower = simulate(0, 0.5, DEFAULT_PARAMS, NOISE_FREE);
    const lowerFixed = lower.final.x < 1e-6 ? 1 : 0;

    // 2. Upper fixed point: x0 = 1 is a fixed point of the replicator term.
    const upper = simulate(1, 0.5, DEFAULT_PARAMS, NOISE_FREE);
    const upperFixed = upper.final.x > 1 - 1e-6 ? 1 : 0;

    // 3. Inclusive regime (Sweden 1995-2005) settles to the inclusive basin.
    const sweden = preset('sweden_1995_2005');
    const inclusiveRun = simulate(sweden.init.x0, sweden.init.t0, sweden.params, NOISE_FREE);
    const inclusiveHit = classifyAttractor(inclusiveRun.final.x) === 'Inclusive' ? 1 : 0;

    // 4. Crisis regime (Rwanda 1993-1994) settles to the exclusionary basin.
    const rwanda = preset('rwanda_1993_1994');
    const exclusionaryRun = simulate(rwanda.init.x0, rwanda.init.t0, rwanda.params, NOISE_FREE);
    const exclusionaryHit = classifyAttractor(exclusionaryRun.final.x) === 'Exclusionary' ? 1 : 0;

    // 5. Threat saturation: clamp01 caps perceived threat at 1 even at the
    //    worst-case state under the crisis regime.
    const threatCap = computePerceivedThreat({ x: 1, t: 0 }, rwanda.params);

    return [
        {
            name: 'lower fixed point (x0 = 0 stays inclusive)',
            description:
                'With no exclusionary support the replicator factor x(1-x) is zero, so the share cannot grow: a polity at the inclusive edge stays there.',
            predicted: lowerFixed,
            expected: 1,
            source: 'replicator dynamics; boundary equilibrium x* = 0',
        },
        {
            name: 'upper fixed point (x0 = 1 stays exclusionary)',
            description:
                'At full exclusionary support x(1-x) is again zero, so the share is pinned at the exclusionary edge under the noise-free dynamics.',
            predicted: upperFixed,
            expected: 1,
            source: 'replicator dynamics; boundary equilibrium x* = 1',
        },
        {
            name: 'inclusive basin (Sweden 1995-2005)',
            description:
                'A high-trust, high-contact, low-stress regime started near the inclusive corner flows to the inclusive attractor (final x < 0.2).',
            predicted: inclusiveHit,
            expected: 1,
            source: 'attractor classification on noise-free trajectory',
        },
        {
            name: 'exclusionary basin (Rwanda 1993-1994)',
            description:
                'An extreme stress and opportunism regime with weak constraints flows to the exclusionary attractor (final x > 0.8).',
            predicted: exclusionaryHit,
            expected: 1,
            source: 'attractor classification on noise-free trajectory',
        },
        {
            name: 'perceived threat saturates at 1',
            description:
                'Perceived threat is passed through clamp01, so the worst-case state under the crisis regime caps at 1 rather than overshooting.',
            predicted: Number(threatCap.toFixed(3)),
            expected: 1,
            source: 'clamp01 bound on computePerceivedThreat',
        },
    ];
}
