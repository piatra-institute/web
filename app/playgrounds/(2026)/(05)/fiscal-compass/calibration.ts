import { Params } from './logic';

// Calibration is a teaching device here, not an econometric fit. Each case
// encodes a historical episode as a parameter configuration, with an
// expected welfare score reflecting the rough centre of scholarly judgement
// on whether the tax move "worked". The model's predicted welfare is then
// compared against it. Treat agreement as a sanity check on the argument
// shape, not as a measurement.

export interface CalibrationCase {
    name: string;
    description: string;
    params: Params;
    expectedWelfare: number;
    source: string;
}

export const calibrationCases: CalibrationCase[] = [
    {
        name: 'Nordic welfare states (late 20th c.)',
        description:
            'High tax, high administrative capacity, high public-investment return: the configuration the welfare-state-and-growth literature points to as broadly working.',
        params: {
            school: 'state-capacity', taxRate: 68, inequality: 38, debtPressure: 36,
            investmentReturn: 82, externalityDamage: 44, adminCapacity: 92, preset: 'nordic-model',
        },
        expectedWelfare: 76,
        source: 'Lindert, 2004, Growing Public; Esping-Andersen, 1990',
    },
    {
        name: 'US top marginal rates (1950s)',
        description:
            'Very high statutory top rates against high pre-tax concentration, with a reasonably capable revenue state. Read as a redistribution case.',
        params: {
            school: 'redistribution', taxRate: 70, inequality: 72, debtPressure: 44,
            investmentReturn: 58, externalityDamage: 30, adminCapacity: 70, preset: 'inequality-crisis',
        },
        expectedWelfare: 64,
        source: 'Piketty, Saez & Zucman, 2018, Distributional National Accounts',
    },
    {
        name: 'Swedish carbon tax (1991-)',
        description:
            'A high carbon price phased in by a high-capacity state against a real, well-measured externality. The cleanest standing case for a corrective tax.',
        params: {
            school: 'corrective', taxRate: 46, inequality: 40, debtPressure: 34,
            investmentReturn: 56, externalityDamage: 88, adminCapacity: 86, preset: 'carbon-logic',
        },
        expectedWelfare: 71,
        source: 'Andersson, 2019, Carbon Taxes and CO2 Emissions: Sweden as a Case Study',
    },
    {
        name: 'Greek tax-based austerity (2010-2014)',
        description:
            'Large tax increases into a deep recession with eroding administrative capacity and a hard currency constraint. The pro-cyclical timing failure.',
        params: {
            school: 'consolidation', taxRate: 76, inequality: 60, debtPressure: 88,
            investmentReturn: 28, externalityDamage: 30, adminCapacity: 40, preset: 'austerity-trap',
        },
        expectedWelfare: 30,
        source: 'House, Proebsting & Tesar, 2020, Austerity in the Aftermath of the Great Recession',
    },
    {
        name: 'Weak-capacity development tax push',
        description:
            'A state-capacity rationale attempted before the collection and implementation capacity exists. Revenue does not reliably convert into returns.',
        params: {
            school: 'state-capacity', taxRate: 50, inequality: 56, debtPressure: 52,
            investmentReturn: 60, externalityDamage: 36, adminCapacity: 30, preset: 'high-return-state',
        },
        expectedWelfare: 44,
        source: 'Besley & Persson, 2011, Pillars of Prosperity',
    },
];
