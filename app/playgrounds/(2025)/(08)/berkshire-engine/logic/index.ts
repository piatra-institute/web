/**
 * Pure financial model for the Berkshire Engine playground.
 *
 * The engine models a Buffett-style insurance-investing compounding loop:
 *   - each year the insurer collects `annualPremiums` of new premium, which
 *     accumulates as `float` (premiums held before claims are paid);
 *   - underwriting throws off (or costs) `annualPremiums * underwritingMargin`;
 *   - the entire float balance earns `investmentReturn` each year;
 *   - portfolio value accumulates underwriting result plus investment gains.
 *
 * All amounts in the simulation are in millions of dollars (the Viewer scales
 * to absolute dollars by multiplying by 1e6 for display only).
 *
 * These are the exact recurrences the Viewer animates, lifted out so they can
 * be unit-tested and calibrated.
 */

export interface EngineParams {
    /** new premium written each year (millions) */
    annualPremiums: number;
    /** underwriting margin as a percent of premium, e.g. 1 means +1% */
    underwritingMargin: number;
    /** annual investment return on float as a percent, e.g. 8 means +8% */
    investmentReturn: number;
    /** number of simulated years */
    years: number;
}

export interface YearPoint {
    year: number;
    /** cumulative float = year * annualPremiums (millions) */
    investableFloat: number;
    /** cumulative underwriting profit/loss (millions) */
    underwritingProfit: number;
    /** cumulative investment gains on float (millions) */
    investmentGains: number;
    /** cumulative portfolio value = underwriting + investment gains (millions) */
    portfolioValue: number;
}

export interface EngineResult {
    points: YearPoint[];
    final: YearPoint;
    /** compound annual growth rate of portfolio value over the horizon */
    cagr: number;
    /** net cost of float as a percent: negative means float is free (a profit) */
    floatCostPercent: number;
}

/**
 * Closed-form future value of a one-time present value compounded annually.
 *   FV = PV * (1 + r)^n
 * `rate` is a fraction (0.08 for 8%), not a percent.
 */
export function compoundValue(present: number, rate: number, years: number): number {
    return present * Math.pow(1 + rate, years);
}

/**
 * Compound annual growth rate from a start and end value over `years`.
 *   CAGR = (end / start)^(1/n) - 1
 * Returns a fraction. Undefined inputs (non-positive start or zero years)
 * return 0.
 */
export function cagr(start: number, end: number, years: number): number {
    if (start <= 0 || years <= 0 || end <= 0) {
        return 0;
    }
    return Math.pow(end / start, 1 / years) - 1;
}

/**
 * Float accumulated after `year` years of constant annual premium writing.
 * In this model float grows linearly: each year's premium is retained.
 *   float(n) = n * annualPremiums
 */
export function floatBalance(annualPremiums: number, year: number): number {
    return annualPremiums * year;
}

/**
 * Investment gain contributed in a single year by a given float balance.
 *   gain = float * investmentReturn
 * `floatNow` in millions, `investmentReturnPercent` as a percent.
 */
export function floatContribution(floatNow: number, investmentReturnPercent: number): number {
    return floatNow * (investmentReturnPercent / 100);
}

/**
 * Underwriting result for one year of premium.
 *   result = annualPremiums * underwritingMargin
 * Positive margin is a profit (negative cost of float); negative is a loss.
 */
export function annualUnderwriting(annualPremiums: number, underwritingMarginPercent: number): number {
    return annualPremiums * (underwritingMarginPercent / 100);
}

/**
 * Cost of float as a percent of the average float balance.
 *
 * Float costs the insurer its cumulative underwriting loss. A positive
 * underwriting profit means a NEGATIVE cost of float (Buffett's "better than
 * free" money). Here we report it relative to the final float balance.
 *   floatCost% = -cumulativeUnderwriting / finalFloat * 100
 */
export function floatCostPercent(cumulativeUnderwriting: number, finalFloat: number): number {
    if (finalFloat <= 0) {
        return 0;
    }
    return (-cumulativeUnderwriting / finalFloat) * 100;
}

/**
 * Run the full deterministic engine, reproducing exactly the recurrence the
 * Viewer animates year by year.
 */
export function runEngine(params: EngineParams): EngineResult {
    const { annualPremiums, underwritingMargin, investmentReturn, years } = params;

    const points: YearPoint[] = [];
    let floatNow = 0;
    let cumulativeUnderwriting = 0;
    let cumulativeInvestment = 0;
    let portfolio = 0;

    for (let year = 1; year <= years; year++) {
        floatNow += annualPremiums;
        cumulativeUnderwriting += annualUnderwriting(annualPremiums, underwritingMargin);
        cumulativeInvestment += floatContribution(floatNow, investmentReturn);
        portfolio = cumulativeUnderwriting + cumulativeInvestment;

        points.push({
            year,
            investableFloat: floatNow,
            underwritingProfit: cumulativeUnderwriting,
            investmentGains: cumulativeInvestment,
            portfolioValue: portfolio,
        });
    }

    const final = points[points.length - 1] ?? {
        year: 0,
        investableFloat: 0,
        underwritingProfit: 0,
        investmentGains: 0,
        portfolioValue: 0,
    };

    // Growth of the float balance itself (the compounding capital base), from
    // the first year's float to the final float.
    const firstFloat = annualPremiums > 0 ? annualPremiums : 1;
    const growthCagr = cagr(firstFloat, final.investableFloat, Math.max(1, years - 1));

    return {
        points,
        final,
        cagr: growthCagr,
        floatCostPercent: floatCostPercent(final.underwritingProfit, final.investableFloat),
    };
}
