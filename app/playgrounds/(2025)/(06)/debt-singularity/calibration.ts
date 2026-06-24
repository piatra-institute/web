import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    runSimulation,
    realDebtValue,
    nominalFixedPoint,
    realHalfLifeYears,
} from './logic';


/**
 * Calibration checks the iterative simulator (runSimulation, which steps the
 * balance map year by year) against analytic closed forms derived from the
 * exact same recurrence:
 *
 *     B_{t+1} = (1 + r) B_t - P,    real_t = B_t / (1 + i)^t.
 *
 * "predicted" is always read off the simulator's output array; "expected" is
 * the closed-form value. Because both come from one recurrence, a correct
 * simulator reproduces the analytic value to floating-point precision, so any
 * non-trivial error would expose a drift bug in the iteration. The model is
 * fully deterministic, so no stochastic reduction is needed.
 *
 * The named scenarios use historically motivated interest / inflation pairs,
 * but the verified quantity in every row is "does the loop match the formula",
 * not a claim about real-world economies.
 */


// One named scenario plus the quantity being verified.
interface DebtCase {
    name: string;
    description: string;
    initialDebt: number;
    annualPayment: number;
    // Stored as percentages, matching the UI sliders.
    interestPct: number;
    inflationPct: number;
    years: number;
    // Which closed form to check at the final year.
    metric: 'realValue' | 'fixedPoint' | 'halfLife';
    source: string;
}


const DEBT_CASES: DebtCase[] = [
    {
        name: 'liability phase · real growth',
        description:
            'interest above inflation (5% vs 2%) with no payments: the real value of the debt grows. iterated balance matched against the closed-form real value at year 20.',
        initialDebt: 100000,
        annualPayment: 0,
        interestPct: 5,
        inflationPct: 2,
        years: 20,
        metric: 'realValue',
        source: 'affine balance map B_t = (1+r)^t B_0 with real deflation by (1+i)^t (Fisher).',
    },
    {
        name: 'asset phase · inflated away',
        description:
            'post-WWII financial repression: rate 2.5%, inflation 14.5%, no payments. inflation outruns interest so the real debt decays toward zero. checked against the closed form at year 15.',
        initialDebt: 100000,
        annualPayment: 0,
        interestPct: 2.5,
        inflationPct: 14.5,
        years: 15,
        metric: 'realValue',
        source: 'historical scenario (US 1947 financial repression); quantity verified is loop vs formula.',
    },
    {
        name: 'serviced loan · with payments',
        description:
            'a serviced loan: 7% interest, 3% inflation, $8,000 annual payment over 25 years. the affine map with a non-zero payment term, real value compared to closed form.',
        initialDebt: 100000,
        annualPayment: 8000,
        interestPct: 7,
        inflationPct: 3,
        years: 25,
        metric: 'realValue',
        source: 'affine map B_{t+1} = (1+r)B_t - P, fixed point B* = P/r.',
    },
    {
        name: 'balanced edge · interest equals payment yield',
        description:
            'a knife-edge: annual payment exactly services interest (payment = r x principal), so the nominal balance stays flat at its fixed point P/r forever. simulated balance at the fixed point checked against P/r.',
        initialDebt: 80000,
        annualPayment: 4000,
        interestPct: 5,
        inflationPct: 0,
        years: 10,
        metric: 'fixedPoint',
        source: 'fixed point of the affine balance map, B* = P/r = 4000/0.05 = 80000.',
    },
    {
        name: 'half-life · ZIRP-style decay',
        description:
            'zero-payment debt with inflation (4%) above interest (1%): the real value halves with a fixed half-life. the simulated year at which real value first drops below half is checked against the analytic half-life.',
        initialDebt: 100000,
        annualPayment: 0,
        interestPct: 1,
        inflationPct: 4,
        years: 60,
        metric: 'halfLife',
        source: 'real half-life t = ln 2 / ln((1+i)/(1+r)) for a zero-payment debt.',
    },
];


export function buildCalibration(): CalibrationResult[] {
    return DEBT_CASES.map((c) => {
        const r = c.interestPct / 100;
        const i = c.inflationPct / 100;

        const sim = runSimulation(c.initialDebt, c.annualPayment, r, i, c.years);

        let predicted: number;
        let expected: number;

        if (c.metric === 'realValue') {
            // Simulator's real value at the final year vs closed form.
            predicted = sim.dataPoints[c.years];
            expected = realDebtValue(c.initialDebt, c.annualPayment, r, i, c.years);
        } else if (c.metric === 'fixedPoint') {
            // runSimulation reports the real (deflated) value; with zero inflation
            // the real value equals the nominal balance, which must sit on the
            // fixed point P/r every year.
            predicted = sim.dataPoints[c.years];
            expected = nominalFixedPoint(c.annualPayment, r);
        } else {
            // First whole year the deflated value drops below half, read from the
            // simulator, vs the analytic half-life rounded up to a whole year.
            const half = c.initialDebt / 2;
            let crossing = c.years;
            for (let t = 0; t <= c.years; t++) {
                if (sim.dataPoints[t] <= half) {
                    crossing = t;
                    break;
                }
            }
            predicted = crossing;
            expected = Math.ceil(realHalfLifeYears(r, i));
        }

        return {
            name: c.name,
            description: c.description,
            predicted: Number(predicted.toFixed(2)),
            expected: Number(expected.toFixed(2)),
            source: c.source,
        };
    });
}
