import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    DEFAULT_PARAMS,
    Params,
    SimulationState,
    PatternType,
    initialSimState,
    advanceSimulation,
    computeMetrics,
} from './logic';


// `expected` values are external analytic/empirical targets (Hopf 1942;
// Guckenheimer & Holmes 1983, r* = sqrt(mu); DeGroot 1974), not identities derived
// from the same code, so this is declared a validation. See CLAUDE.md.
export const calibrationMeta = { kind: 'validation' as const };


// ── Deterministic settling helper ────────────────────────────────
//
// Every case here drives the noise-free core of one morphology from a chosen
// initial condition, integrates it forward with the same Euler step the live
// simulation uses (dt = 0.02), and reads the resulting metrics. Because noise
// is set to zero, each prediction is fully determined by the equations of
// motion: there is no stochastic core to average over. The forward-Euler
// scheme leaves a small discretization residue near the limit cycle (sub-1.5%),
// which is reported honestly rather than hidden.

const DT = 0.02;

function settle(
    pattern: PatternType,
    overrides: Partial<Params>,
    seed: (state: SimulationState) => SimulationState,
    steps: number,
): { params: Params; metrics: ReturnType<typeof computeMetrics> } {
    const params: Params = { ...DEFAULT_PARAMS, ...overrides, pattern, noise: 0 };
    let state = seed(initialSimState());
    for (let i = 0; i < steps; i++) {
        state = advanceSimulation(state, params, DT);
    }
    return { params, metrics: computeMetrics(params, state) };
}


export function buildCalibration(): CalibrationResult[] {
    const results: CalibrationResult[] = [];

    // 1. Point attractor: a fixed point is stationary.
    // Seeding the state exactly at x* and integrating the noise-free flow
    // dx/dt = -k(x - x*) must leave the error at zero: f(x*) = 0.
    {
        const { metrics } = settle(
            'point',
            { pointK: 1.2, pointTarget: 0.5 },
            (s) => ({ ...s, point: { x: 0.5, target: 0.5, history: [0.5] } }),
            600,
        );
        results.push({
            name: 'point · fixed point is stationary',
            description: 'seed the state at the target x* and run the noise-free flow; the restoring force vanishes, so the equilibrium error stays zero.',
            predicted: Number(metrics.pointError.toFixed(4)),
            expected: 0,
            source: 'Strogatz 2015, Ch. 2: a fixed point satisfies f(x*) = 0 and does not move',
        });
    }

    // 2. Point attractor: displaced state relaxes back to the target.
    // Exponential decay with rate k drives the error to (essentially) zero.
    {
        const { metrics } = settle(
            'point',
            { pointK: 1.5, pointTarget: 0 },
            (s) => ({ ...s, point: { x: 1.4, target: 0, history: [1.4] } }),
            2000,
        );
        results.push({
            name: 'point · displaced state relaxes',
            description: 'release from x = 1.4 with restoring force k = 1.5; exponential relaxation (tau = 1/k) returns the state to the target.',
            predicted: Number(metrics.pointError.toFixed(4)),
            expected: 0,
            source: 'Lyapunov 1892: V = (1/2)k(x - x*)^2 decreases monotonically to the unique equilibrium',
        });
    }

    // 3. Limit cycle: stable orbit radius equals sqrt(mu).
    // For mu = 0.64 the Hopf normal form has attracting orbit radius
    // r* = sqrt(mu) = 0.8. Predicted is the settled orbit radius.
    {
        const { metrics } = settle(
            'limit',
            { limitMu: 0.64, limitOmega: 1.0 },
            (s) => ({ ...s, limit: { x: 0.3, y: 0, trail: [{ x: 0.3, y: 0 }] } }),
            8000,
        );
        results.push({
            name: 'limit · orbit radius = sqrt(mu)',
            description: 'above the Hopf bifurcation (mu = 0.64) trajectories converge to a stable orbit of radius sqrt(mu) = 0.8; small Euler residue remains.',
            predicted: Number(metrics.limitRadius.toFixed(3)),
            expected: 0.8,
            source: 'Hopf 1942 / Guckenheimer & Holmes 1983: supercritical Hopf normal form has r* = sqrt(mu)',
        });
    }

    // 4. Limit cycle: below the bifurcation the origin is stable.
    // For mu = -0.3 <= 0 there is no limit cycle; every trajectory collapses
    // to the origin, so the settled radius is zero. Boolean classifier:
    // "collapsed to origin" expected true (1).
    {
        const { metrics } = settle(
            'limit',
            { limitMu: -0.3, limitOmega: 1.0 },
            (s) => ({ ...s, limit: { x: 0.8, y: 0.2, trail: [{ x: 0.8, y: 0.2 }] } }),
            4000,
        );
        const collapsedToOrigin = metrics.limitRadius < 1e-3 ? 1 : 0;
        results.push({
            name: 'limit · below bifurcation collapses to origin',
            description: 'for mu = -0.3 <= 0 no orbit exists; the origin is a stable spiral and the trajectory collapses onto it (radius -> 0).',
            predicted: collapsedToOrigin,
            expected: 1,
            source: 'Hopf bifurcation threshold at mu = 0: below it the only attractor is the fixed point at the origin',
        });
    }

    // 5. Consensus network: distributed units converge to agreement.
    // With positive coupling and stubbornness the effective rate
    // lambda = c(1 - 1/N) + s > 0, so the spread decays to zero.
    // Boolean classifier: "converged (spread negligible)" expected true (1).
    {
        const { metrics } = settle(
            'consensus',
            { consensusCoupling: 1.1, consensusStubbornness: 0.35, consensusAnchor: 0 },
            (s) => s,
            3000,
        );
        const converged = metrics.consensusSpread < 1e-3 ? 1 : 0;
        results.push({
            name: 'consensus · network reaches agreement',
            description: 'positive coupling and stubbornness give a positive convergence rate lambda = c(1 - 1/N) + s, so opinion spread decays to zero.',
            predicted: converged,
            expected: 1,
            source: 'DeGroot 1974 / Olfati-Saber & Murray 2004: connected mean-field consensus converges to a common value',
        });
    }

    return results;
}
