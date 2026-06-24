export const historicalScenarios: Record<string, { interest: number; inflation: number; description: string }> = {
    custom: {
        interest: 5,
        inflation: 2,
        description: 'Select a scenario to see its description and parameters, or set custom values with the sliders.'
    },
    postWw2: {
        interest: 2.5,
        inflation: 14.5,
        description: 'After WWII, the US gov used "financial repression," keeping interest rates low despite high inflation to reduce the real value of its massive war debt.'
    },
    greatInflation: {
        interest: 13,
        inflation: 11.5,
        description: 'In the late 70s, high inflation was met by the "Volcker Shock", even higher interest rates to cool the economy, making debt a heavy burden.'
    },
    japanLostDecade: {
        interest: 0.5,
        inflation: -0.2,
        description: 'Japan faced a period of deflation (negative inflation). Even with near-zero interest rates, the real value of debt slowly increased.'
    },
    weimar: {
        interest: 15,
        inflation: 50,
        description: 'In 1923, German hyperinflation was astronomical (often thousands of percent per month). Rates couldn\'t keep up, making debt worthless overnight. (Note: Inflation is capped at 50% in this model for scale).'
    },
    zirp: {
        interest: 0.25,
        inflation: 1.5,
        description: 'The Zero Interest-Rate Policy (ZIRP) era after 2008. Rates were near zero, but with low inflation, debt values decayed very slowly.'
    },
    recentInflation: {
        interest: 4.0,
        inflation: 8.0,
        description: 'A recent inflation spike forced central banks to raise rates. With inflation still higher than rates, debt value initially decreased.'
    }
};

export function runSimulation(
    initialDebt: number,
    annualPayment: number,
    interestRate: number,
    inflationRate: number,
    years: number
): { labels: number[]; dataPoints: number[] } {
    const labels = Array.from({ length: years + 1 }, (_, i) => i);
    const dataPoints: number[] = [];

    let currentNominalBalance = initialDebt;
    dataPoints.push(initialDebt); // Year 0

    for (let t = 1; t <= years; t++) {
        if (currentNominalBalance <= 0) {
            dataPoints.push(0);
            continue;
        }

        const interestAccrued = currentNominalBalance * interestRate;
        currentNominalBalance += interestAccrued;
        currentNominalBalance -= annualPayment;
        currentNominalBalance = Math.max(0, currentNominalBalance); // Debt can't be negative

        const realValue = currentNominalBalance / Math.pow(1 + inflationRate, t);
        dataPoints.push(realValue);
    }

    return { labels, dataPoints };
}

// ---------------------------------------------------------------------------
// Deterministic, closed-form quantities derived from the same recurrence used
// in runSimulation. These exist so the calibration panel can compare the
// simulator's numeric output against an analytic target rather than against a
// hand-typed number.
//
// The nominal balance evolves by the affine map
//     B_{t+1} = (1 + r) B_t - P
// whose unique fixed point (where the balance neither grows nor shrinks) is
//     B* = P / r          (for r != 0).
// Iterating the affine map from B_0 gives the closed form
//     B_t = (1 + r)^t (B_0 - B*) + B*.
// The real (inflation-adjusted) value is B_t / (1 + i)^t.
// ---------------------------------------------------------------------------

// Nominal balance after t years, closed form. r and i are fractions (0.05 = 5%).
export function nominalBalance(
    initialDebt: number,
    annualPayment: number,
    interestRate: number,
    t: number,
): number {
    if (interestRate === 0) {
        return Math.max(0, initialDebt - annualPayment * t);
    }
    const fixedPoint = annualPayment / interestRate;
    const value = Math.pow(1 + interestRate, t) * (initialDebt - fixedPoint) + fixedPoint;
    return Math.max(0, value);
}

// Nominal fixed point of the balance map: the payment that exactly services
// interest, leaving the principal flat year over year.
export function nominalFixedPoint(annualPayment: number, interestRate: number): number {
    if (interestRate === 0) return Infinity;
    return annualPayment / interestRate;
}

// Real (inflation-adjusted) value of the debt after t years, closed form.
export function realDebtValue(
    initialDebt: number,
    annualPayment: number,
    interestRate: number,
    inflationRate: number,
    t: number,
): number {
    const nominal = nominalBalance(initialDebt, annualPayment, interestRate, t);
    return nominal / Math.pow(1 + inflationRate, t);
}

// The real interest rate is the order parameter of the phase transition.
// Using the exact (Fisher) form: (1 + r) / (1 + i) - 1.
export function realInterestRate(interestRate: number, inflationRate: number): number {
    return (1 + interestRate) / (1 + inflationRate) - 1;
}

// Number of whole years until a zero-payment debt's real value falls to half
// its initial value, when inflation outruns interest. Closed form from
// real_t = D * ((1+r)/(1+i))^t = D/2  ->  t = ln(2) / ln((1+i)/(1+r)).
// Returns Infinity when the real rate is non-negative (debt never decays).
export function realHalfLifeYears(interestRate: number, inflationRate: number): number {
    const growth = (1 + interestRate) / (1 + inflationRate);
    if (growth >= 1) return Infinity;
    return Math.log(2) / Math.log(1 / growth);
}
