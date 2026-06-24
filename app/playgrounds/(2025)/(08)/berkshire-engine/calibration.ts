import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    compoundValue,
    cagr,
    floatContribution,
    annualUnderwriting,
    floatCostPercent,
    runEngine,
} from './logic';


/**
 * Each case checks one identity of the deterministic engine against a value
 * derived independently in closed form, so `predicted` is always computed by
 * the logic functions and `expected` is the analytic answer. No stochastic
 * components exist in this model, so every case is exactly verifiable.
 */
export function buildCalibration(): CalibrationResult[] {
    const results: CalibrationResult[] = [];

    // 1. Compound interest identity: $100 at 20% for 10 years equals 1.2^10 * 100.
    const fv = compoundValue(100, 0.2, 10);
    const fvExpected = Math.pow(1.2, 10) * 100; // 619.1736...
    results.push({
        name: 'compound value · $100 @ 20% · 10y',
        description: 'closed-form future value FV = PV(1+r)^n; the compounding kernel behind the engine.',
        predicted: Number(fv.toFixed(2)),
        expected: Number(fvExpected.toFixed(2)),
        source: 'standard compound-interest identity FV = PV(1+r)^n',
    });

    // 2. CAGR of a doubling over 7 years equals 2^(1/7) - 1 ~= 10.41%.
    const doublingCagr = cagr(100, 200, 7) * 100;
    const doublingExpected = (Math.pow(2, 1 / 7) - 1) * 100; // ~10.409
    results.push({
        name: 'CAGR · double over 7y',
        description: 'a portfolio that doubles in 7 years compounds at 2^(1/7) - 1 per year.',
        predicted: Number(doublingCagr.toFixed(3)),
        expected: Number(doublingExpected.toFixed(3)),
        source: 'rule-of-72 family; exact CAGR = (end/start)^(1/n) - 1',
    });

    // 3. Float identity: with $100M premium per year the cumulative underwriting
    //    profit over 30 years at a 1% margin is 30 * (100 * 0.01) = $30M.
    let cumUnderwriting = 0;
    for (let y = 0; y < 30; y++) {
        cumUnderwriting += annualUnderwriting(100, 1);
    }
    results.push({
        name: 'underwriting · 1% margin · 30y',
        description: 'cumulative underwriting profit at constant premium equals years x premium x margin.',
        predicted: Number(cumUnderwriting.toFixed(2)),
        expected: Number((30 * 100 * 0.01).toFixed(2)),
        source: 'linear accumulation of constant annual underwriting result',
    });

    // 4. Single-year float investment gain: $500M float at 8% yields $40M.
    const gain = floatContribution(500, 8);
    results.push({
        name: 'float gain · $500M @ 8%',
        description: 'one year of investment return on a float balance: gain = float x return.',
        predicted: Number(gain.toFixed(2)),
        expected: Number((500 * 0.08).toFixed(2)),
        source: 'investment return applied to the full retained float',
    });

    // 5. Negative cost of float: a $30M cumulative underwriting profit on a
    //    $3000M final float is a -1% cost of float (better than free money).
    const engine = runEngine({ annualPremiums: 100, underwritingMargin: 1, investmentReturn: 8, years: 30 });
    const cost = floatCostPercent(engine.final.underwritingProfit, engine.final.investableFloat);
    // final float = 30 * 100 = 3000; cumulative underwriting = 30; -30/3000 = -1%.
    results.push({
        name: 'cost of float · Buffett model',
        description: 'profitable underwriting makes float cheaper than free: a negative cost of carry.',
        predicted: Number(cost.toFixed(3)),
        expected: Number(((-30 / 3000) * 100).toFixed(3)),
        source: 'Berkshire annual letters: profitable underwriting yields negative cost of float',
    });

    return results;
}
