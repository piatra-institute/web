import type { CalibrationResult } from '@/components/CalibrationPanel';

import { baseData, calculateOutcomes } from './logic';


/**
 * The calibration here checks the deterministic accounting and pricing identities
 * that the model is built on, not the empirical magnitudes of the Ivaldi, Sokullu
 * and Toru (2015) study. Each predicted value is computed from the model functions
 * (calculateOutcomes / baseData), never hardcoded, and compared against an
 * arithmetic target that must hold if the model is internally consistent.
 *
 * The two load-bearing facts are:
 *   1. social welfare is consumer surplus plus producer surplus (profits). This
 *      Marshallian accounting identity holds exactly in the published baseData.
 *   2. with the welfare weight lambda fixed at its neutral midpoint (0.5) and no
 *      network effect, calculateOutcomes must reproduce the observed consumer
 *      surplus exactly, because every multiplier collapses to 1.
 *
 * A boolean identity check is encoded as 1 (holds) vs expected 1.
 */


/** True when a is within eps of b. */
function near(a: number, b: number, eps = 1e-6): boolean {
    return Math.abs(a - b) <= eps;
}


export function buildCalibration(): CalibrationResult[] {
    const results: CalibrationResult[] = [];

    // 1. Welfare accounting identity in the observed (current) data: welfare = cs + profits.
    {
        const codes = Object.keys(baseData);
        const allHold = codes.every((c) =>
            near(baseData[c].current.cs + baseData[c].current.profits, baseData[c].current.welfare, 1e-3),
        );
        results.push({
            name: 'welfare identity · current data',
            description:
                'for every airport in the observed data, social welfare equals consumer surplus plus producer surplus (profits). This Marshallian accounting identity is exact in the published table.',
            predicted: allHold ? 1 : 0,
            expected: 1,
            source: 'Ivaldi, Sokullu and Toru (2015), welfare decomposition W = CS + PS',
        });
    }

    // 2. Welfare identity in the simulated privatized branch (pure profit max): welfare = cs + profits.
    {
        const o = calculateOutcomes('ATL', 0.5, 0);
        const holds = near(o.private.welfare, o.private.cs + o.private.profits);
        results.push({
            name: 'welfare identity · privatized branch',
            description:
                'in the profit-maximizing privatized branch, welfare is reported as the plain sum of consumer surplus and profit, with no welfare weighting. The model output must satisfy that sum exactly.',
            predicted: holds ? 1 : 0,
            expected: 1,
            source: 'unweighted surplus sum, privatized monopoly benchmark',
        });
    }

    // 3. Neutral parameters reproduce the observed consumer surplus for ATL (network effect 0 => multiplier 1).
    {
        const o = calculateOutcomes('ATL', 0.5, 0);
        const holds = near(o.current.cs, baseData['ATL'].current.cs);
        results.push({
            name: 'identity at neutral parameters · ATL CS',
            description:
                'with the network effect set to zero, the consumer-surplus multiplier (1 + e/100) collapses to 1, so the model reproduces the observed ATL consumer surplus exactly.',
            predicted: holds ? 1 : 0,
            expected: 1,
            source: 'calculateOutcomes(ATL, 0.5, 0) versus baseData ATL current CS',
        });
    }

    // 4. Network effect is linear and symmetric: +10% raises current CS by exactly 10% over baseline.
    {
        const base = baseData['JFK'].current.cs;
        const o = calculateOutcomes('JFK', 0.5, 10);
        // predicted percentage uplift, expected 10
        const uplift = base > 0 ? ((o.current.cs - base) / base) * 100 : 0;
        results.push({
            name: 'network effect linearity · JFK CS uplift (%)',
            description:
                'a passenger network effect of +10% must raise consumer surplus by exactly 10% over the observed baseline, because the surplus is scaled by the linear factor (1 + e/100).',
            predicted: Number(uplift.toFixed(4)),
            expected: 10,
            source: 'linear two-sided network scaling, CS * (1 + e/100)',
        });
    }

    // 5. Ramsey welfare weight at lambda = 1 gives the full-weight Marshallian welfare: cs + profits.
    {
        const lambda = 1;
        const o = calculateOutcomes('ORD', lambda, 0);
        // at lambda=1: currentProfits = base.profits * (1 - 0.5); welfare = cs + profits*1
        const holds = near(o.current.welfare, o.current.cs + o.current.profits);
        results.push({
            name: 'full welfare weight · ORD (lambda = 1)',
            description:
                'at maximum welfare weight (lambda = 1) the welfare term gives profits a coefficient of one, so current welfare reduces to the plain sum of consumer surplus and the (weighted) profit. The model output must satisfy that sum.',
            predicted: holds ? 1 : 0,
            expected: 1,
            source: 'Ramsey welfare functional W = CS + lambda * PS at lambda = 1',
        });
    }

    return results;
}
