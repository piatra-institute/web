import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'parity-rule',
        statement:
            'the core rule is one-to-one: every dollar spent on a product is matched by one dollar of equity in the firm that sold it. the playground computes the counterfactual value of those parity investments, not an optimal portfolio.',
        citation:
            'consumer-equity parity principle (CEPP), the framing premise of this playground; a thought experiment, not an established financial doctrine.',
        confidence: 'speculative',
        falsifiability:
            'the rule is a stipulation, so it cannot be falsified; what can fail is the claim that it is a sensible policy, since it concentrates capital in the firms a consumer already pays and ignores diversification.',
    },
    {
        id: 'lump-vs-dca',
        statement:
            'a one-off purchase buys all shares at the purchase-month price (a lump sum); a subscription spreads the payment evenly across the contract window, buying shares each month at that month price (dollar-cost averaging).',
        citation:
            'standard distinction between lump-sum and dollar-cost-averaged entry; the choice materially changes the cost basis in volatile series.',
        confidence: 'established',
        falsifiability:
            'a real subscriber might cancel, change tiers, or pay annually; the fixed even monthly schedule here is a simplification of actual cash flows.',
    },
    {
        id: 'monthly-granularity',
        statement:
            'prices are monthly closes keyed by year and month. a trade in a month with no datum executes at the most recent earlier close, and valuation uses the latest available close in the series.',
        citation:
            'monthly-resolution series; intra-month timing, opening versus closing prices, and exact trade dates are not modelled.',
        confidence: 'established',
        falsifiability:
            'a buyer transacting on a local intra-month spike or trough would get a different cost basis than the monthly close implies; the coarser the data, the larger this gap.',
    },
    {
        id: 'split-adjusted-illustrative',
        statement:
            'the bundled price files are split-adjusted, annualised-then-interpolated approximations chosen for legibility, not vendor-grade tick data. they are adequate for showing orders of magnitude, not for precise return attribution.',
        citation:
            'stated methodology of the bundled series; the original outro already flags them as illustrative.',
        confidence: 'contested',
        falsifiability:
            'reconciling any case against an authoritative adjusted-close source would reveal discrepancies; the qualitative ranking of outcomes is more trustworthy than any single multiple.',
    },
    {
        id: 'frictionless-market',
        statement:
            'the simulation assumes frictionless execution: no transaction costs, no taxes, no bid-ask spread, perfect liquidity, and no dividend reinvestment. fractional shares are allowed.',
        citation:
            'idealising assumptions common to back-of-envelope counterfactuals; each one biases the reported return upward relative to a real investor.',
        confidence: 'established',
        falsifiability:
            'adding realistic fees, capital-gains tax, and dividend treatment would change every terminal value; dividend omission understates total return for payers and overstates it for the parity story relative to price-only growth.',
    },
    {
        id: 'survivorship-and-hindsight',
        statement:
            'the product catalog and ticker set are chosen with hindsight and are dominated by survivors and large winners. the rule is presented as if applied prospectively, but the examples are selected after the outcomes are known.',
        citation:
            'survivorship bias and hindsight bias, well-documented hazards in retrospective investment narratives.',
        confidence: 'established',
        falsifiability:
            'including firms that delisted, went bankrupt, or stagnated (the Intel case hints at this) would lower the average multiple and is the honest control against cherry-picking.',
    },
];
