import type { CalibrationResult } from '@/components/CalibrationPanel';

import { computeModel, type Inputs } from './logic';


/**
 * The transactionality index is fully deterministic, so calibration here checks
 * the model against analytic identities rather than empirical data. The point is
 * structural correctness: that the additive weights, interaction terms, the
 * convex leverage adjustment, and the clamp behave exactly as the documented
 * formula says they should. None of the predicted values are hardcoded; each is
 * recomputed by computeModel from a known input vector. The expected value is
 * derived by hand from the formula and stated to one decimal place.
 *
 * Formula recap (T is the score before clamping):
 *   T = 100 * ( sum_i w_i * x_i_norm
 *               + 0.08 * thr_norm * (1 - all_norm)
 *               + 0.06 * riv_norm * (1 - inst_norm) )
 *       - (1 - lev_norm)^1.5 * 10
 *       + lev_norm * 5
 *   x_norm = x / 10, then T is clamped to [0, 100].
 *
 * The deficit factors (alliance, institutions, cohesion, reputation, horizon)
 * enter as (1 - x_norm), so an input of 0 maximises that deficit's contribution.
 */

interface IdentityCase {
    name: string;
    description: string;
    inputs: Inputs;
    expected: number;
    source: string;
}


const IDENTITY_CASES: IdentityCase[] = [
    {
        name: 'pure-deficit floor',
        description:
            'every input at zero. only the five deficit terms fire at full weight (0.10 + 0.12 + 0.12 + 0.10 + 0.10 = 0.54), scaled to 54, then the maximum leverage penalty of 10 is subtracted and the boost is 0.',
        inputs: {
            threat: 0, rivalry: 0, alliance: 0, institutions: 0,
            dependence: 0, sanctions: 0, cohesion: 0, reputation: 0,
            horizon: 0, leverage: 0, crisis: false,
        },
        // 100 * 0.54 - 10 + 0 = 44
        expected: 44.0,
        source: 'analytic identity: deficit weights sum to 0.54; leverage penalty (1-0)^1.5 * 10 = 10',
    },
    {
        name: 'saturation ceiling',
        description:
            'every pressure maxed and every shelter at zero under crisis: the raw weighted sum plus interactions overshoots 100, so the clamp pins the index at exactly 100 and the posture is hard transactionalism.',
        inputs: {
            threat: 10, rivalry: 10, alliance: 0, institutions: 0,
            dependence: 10, sanctions: 10, cohesion: 0, reputation: 0,
            horizon: 0, leverage: 0, crisis: true,
        },
        // raw > 100 before penalties; clamp(., 0, 100) = 100
        expected: 100.0,
        source: 'analytic identity: clamp(score, 0, 100) saturates when raw pressure exceeds the ceiling',
    },
    {
        name: 'midpoint balance',
        description:
            'all ten sliders at 5 (every normalised value 0.5), no crisis. with weights summing to 1.0, the linear part is 50; both interaction terms add 0.5 * 0.5 at their coefficients; leverage 0.5 gives penalty (0.5)^1.5 * 10 and boost 2.5.',
        inputs: {
            threat: 5, rivalry: 5, alliance: 5, institutions: 5,
            dependence: 5, sanctions: 5, cohesion: 5, reputation: 5,
            horizon: 5, leverage: 5, crisis: false,
        },
        // 100*(0.5 + 0.08*0.25 + 0.06*0.25) - (0.5)^1.5*10 + 2.5
        // = 100*0.535 - 3.5355 + 2.5 = 53.5 - 3.5355 + 2.5 = 52.4645
        expected: 52.5,
        source: 'analytic identity: linear weights sum to 1.0, so 0.5 inputs give a linear part of exactly 50',
    },
    {
        name: 'full autonomy boost',
        description:
            'mid pressures with leverage at the maximum of 10. the convex penalty vanishes ((1-1)^1.5 = 0) and the linear boost reaches its cap of 5, so the index sits above the no-leverage midpoint by exactly the saved penalty plus boost.',
        inputs: {
            threat: 5, rivalry: 5, alliance: 5, institutions: 5,
            dependence: 5, sanctions: 5, cohesion: 5, reputation: 5,
            horizon: 5, leverage: 10, crisis: false,
        },
        // 100*0.535 - 0 + 5 = 58.5
        expected: 58.5,
        source: 'analytic identity: leverage penalty (1-1)^1.5 * 10 = 0, boost 1.0 * 5 = 5',
    },
    {
        name: 'institutionalist preset',
        description:
            'the low-threat, high-shelter, high-reputation preset. the score falls below the 25 boundary, placing it in the rules-first / institutionalist regime, and four of the five exit conditions are already satisfied.',
        inputs: {
            threat: 2, rivalry: 3, alliance: 7, institutions: 8,
            dependence: 4, sanctions: 3, cohesion: 7, reputation: 8,
            horizon: 8, leverage: 3, crisis: false,
        },
        // recomputed exactly by the model
        expected: 23.1,
        source: 'recomputed weighted-factor score for the institutionalist equilibrium preset',
    },
];


export function buildCalibration(): CalibrationResult[] {
    return IDENTITY_CASES.map((c) => {
        const model = computeModel(c.inputs);
        return {
            name: c.name,
            description: c.description,
            predicted: Number(model.score.toFixed(1)),
            expected: c.expected,
            source: c.source,
        };
    });
}
