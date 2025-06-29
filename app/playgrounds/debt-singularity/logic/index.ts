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
        description: 'In the late 70s, high inflation was met by the "Volcker Shock"—even higher interest rates to cool the economy, making debt a heavy burden.'
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
