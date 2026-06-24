import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'float-as-permanent-capital',
        statement:
            'insurance float (premiums collected before claims are paid) behaves as a stable, investable pool of capital. in the model the entire float balance earns the investment return every year, as if it never had to be paid out.',
        citation:
            'Buffett, Berkshire Hathaway annual letters: float as "money we hold but do not own", repeatedly described as a durable funding source.',
        confidence: 'contested',
        falsifiability:
            'a single large catastrophe year, a reserve strengthening, or a run of policy non-renewals can shrink float sharply; treating it as permanent fails whenever claims spike or premium volume falls.',
    },
    {
        id: 'constant-return-idealisation',
        statement:
            'the investment return on float is a single fixed percent applied identically every year, with no drawdowns, no volatility, and no sequence-of-returns risk.',
        citation:
            'a deterministic compounding idealisation; real returns vary year to year and compounding is path dependent.',
        confidence: 'contested',
        falsifiability:
            'historical equity and bond returns are volatile; a model with the same average return but realistic variance produces a wide outcome distribution, not the single smooth curve shown here.',
    },
    {
        id: 'linear-float-growth',
        statement:
            'float grows linearly: each year adds exactly annualPremiums to the balance, so float after n years is n times annual premium. premium volume is held constant and no float is ever released.',
        citation:
            'modelling simplification. real float grows with the book of business and is partly consumed as claims are paid.',
        confidence: 'speculative',
        falsifiability:
            'in practice float turns over: claims are paid from it continuously, so the balance reflects net reserves, not the simple sum of all premiums ever written.',
    },
    {
        id: 'underwriting-margin-on-premium',
        statement:
            'underwriting profit or loss is a fixed percent of the year\'s premium (annualPremiums times margin), independent of the claims actually incurred or the investment book.',
        citation:
            'combined-ratio accounting: an underwriting margin is one minus the combined ratio applied to earned premium.',
        confidence: 'established',
        falsifiability:
            'underwriting results are driven by realised loss experience and reserve development, which are stochastic and correlated across lines; a flat margin ignores the insurance cycle.',
    },
    {
        id: 'compounding-is-the-engine',
        statement:
            'long-run portfolio value is dominated by compounding investment gains on a growing float base, with the small underwriting margin acting mainly to lower the cost of that capital. compounding, not underwriting, drives the headline number.',
        citation:
            'compound-interest mathematics FV = PV(1+r)^n; Buffett emphasis on long horizons and the cost of float.',
        confidence: 'established',
        falsifiability:
            'over short horizons or with low returns the underwriting term can dominate; the compounding story only holds when both the horizon and the return are large.',
    },
    {
        id: 'no-leverage-or-tax-frictions',
        statement:
            'the model abstracts away taxes, regulatory capital requirements, reinsurance costs, and the deferred-tax and acquisition-cost drags that real insurers carry. it is a frictionless compounding loop.',
        citation:
            'simplification. real insurers face statutory capital rules, taxes on realised gains, and acquisition expenses.',
        confidence: 'established',
        falsifiability:
            'add realistic tax on gains and a capital charge on float and the effective compounding rate drops; the frictionless curve overstates achievable growth.',
    },
];
