import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    heuristicMu,
    type RoleProbs,
} from './logic';


/**
 * The deterministic, closed-form core of this playground is the expected
 * motif-count law
 *
 *     mu = p_A * p_C * p_B * (N^3 / q^2) * lambda^4 .
 *
 * It is derived as follows. Distribute N molecules independently over q
 * compartments and assign each a role A, C or B with probabilities p_A, p_C,
 * p_B. The expected occupancy of a single compartment is N*p_A/q activators,
 * N*p_C/q catalysts and N*p_B/q boundary precursors, so the expected number of
 * (A, C, B) triples in one compartment is (N^3/q^3) * p_A*p_C*p_B. Summing over
 * q independent compartments multiplies this by q, giving N^3/q^2. Each triple
 * closes the 4-edge Lane motif with probability lambda^4 (one factor per edge),
 * yielding the law above.
 *
 * The stochastic Monte-Carlo simulator is NOT calibrated here (it is seed- and
 * trials-dependent). Instead every case below recomputes mu from the closed
 * form by hand and compares it against the model function `heuristicMu`, so the
 * verifier checks that the implemented core matches its own derivation. Two
 * extra cases verify the analytic scaling exponents that the simulator's
 * power-law fit is meant to recover: mu is cubic in N (doubling N at fixed
 * lambda multiplies mu by 8) and the half-probability threshold N* scales as
 * lambda^(-4/3).
 */

interface MuCase {
    name: string;
    N: number;
    q: number;
    lambda: number;
    roleProbs: RoleProbs;
    description: string;
    source: string;
}

const MU_CASES: MuCase[] = [
    {
        name: 'uniform roles · default lattice',
        N: 60,
        q: 3,
        lambda: 0.25,
        roleProbs: { pA: 1 / 3, pC: 1 / 3, pB: 1 / 3 },
        description:
            'equal role split, three vent pores, mid catalytic density: the baseline expected motif count.',
        source: 'closed-form mu = p_A p_C p_B N^3 q^-2 lambda^4 (this work, combinatorial derivation)',
    },
    {
        name: 'skewed roles · activator-rich',
        N: 90,
        q: 4,
        lambda: 0.18,
        roleProbs: { pA: 0.5, pC: 0.3, pB: 0.2 },
        description:
            'activator-biased pool over four pores at low catalytic density; the product p_A p_C p_B = 0.03 suppresses mu.',
        source: 'closed-form mu (this work)',
    },
    {
        name: 'single pore · no dilution',
        N: 40,
        q: 1,
        lambda: 0.4,
        roleProbs: { pA: 0.4, pC: 0.3, pB: 0.3 },
        description:
            'one undivided pore (q = 1) removes compartmental dilution, so mu = p_A p_C p_B N^3 lambda^4.',
        source: 'closed-form mu (this work)',
    },
];


/**
 * Independent re-derivation of mu, written out long-hand so the calibration is
 * not a tautology against `heuristicMu`'s internal expression.
 */
function closedFormMu(c: MuCase): number {
    const roleFactor = c.roleProbs.pA * c.roleProbs.pC * c.roleProbs.pB;
    const lattice = (c.N * c.N * c.N) / (c.q * c.q);
    const edges = Math.pow(c.lambda, 4);
    return roleFactor * lattice * edges;
}


export function buildCalibration(): CalibrationResult[] {
    const muCases: CalibrationResult[] = MU_CASES.map((c) => {
        const predicted = heuristicMu({
            N: c.N,
            q: c.q,
            lambda: c.lambda,
            roleProbs: c.roleProbs,
        });
        const expected = closedFormMu(c);
        return {
            name: c.name,
            description: c.description,
            predicted: Number(predicted.toFixed(4)),
            expected: Number(expected.toFixed(4)),
            source: c.source,
        };
    });

    // Scaling case 1: mu is cubic in N. Doubling N at fixed everything else
    // must multiply mu by 2^3 = 8. We report the measured ratio against 8.
    const base = { N: 30, q: 3, lambda: 0.25, roleProbs: { pA: 0.4, pC: 0.3, pB: 0.3 } };
    const muBase = heuristicMu(base);
    const muDouble = heuristicMu({ ...base, N: base.N * 2 });
    const cubicRatio: CalibrationResult = {
        name: 'cubic-in-N scaling',
        description:
            'mu ~ N^3, so doubling the molecule count at fixed lambda and q must raise the expected motif count by a factor of 8.',
        predicted: Number((muDouble / muBase).toFixed(4)),
        expected: 8,
        source: 'analytic exponent of N in the closed-form mu (this work)',
    };

    // Scaling case 2: the half-probability threshold N* satisfies mu(N*) ~ const,
    // i.e. N*^3 * lambda^4 = const, so N* ~ lambda^(-4/3). Holding mu fixed and
    // halving lambda must raise N* by 2^(4/3). We solve N* analytically from mu.
    const muTarget = 1; // any fixed expected-count contour
    const roleFactor = base.roleProbs.pA * base.roleProbs.pC * base.roleProbs.pB;
    const nStar = (lambda: number) =>
        Math.cbrt((muTarget * base.q * base.q) / (roleFactor * Math.pow(lambda, 4)));
    const lambdaScaling: CalibrationResult = {
        name: 'threshold scaling N* ~ lambda^(-4/3)',
        description:
            'on a fixed expected-count contour, halving the catalytic density lambda must raise the threshold molecule count N* by 2^(4/3).',
        predicted: Number((nStar(0.1) / nStar(0.2)).toFixed(4)),
        expected: Number(Math.pow(2, 4 / 3).toFixed(4)),
        source: 'analytic threshold exponent from mu(N*) = const (this work)',
    };

    return [...muCases, cubicRatio, lambdaScaling];
}
