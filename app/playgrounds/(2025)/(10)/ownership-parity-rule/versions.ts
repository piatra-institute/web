import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'October 2025',
        description:
            'first cut. builds the ownership-parity sandbox: a deterministic counterfactual where every dollar spent on a tech product buys a dollar of the issuer equity, valued over bundled monthly price series. supports one-off lump-sum purchases and dollar-cost-averaged subscriptions, a consolidated and per-event view, calibration of terminal multiples against independently derived price ratios, six assumptions, and a research companion.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'October 2025',
        changes: [
            'parity rule: each dollar of product spend is matched by a dollar of equity in the selling firm.',
            'two deployment modes: lump-sum purchase at the purchase-month price, and subscription as monthly dollar-cost averaging across the contract window.',
            'monthly price lookup with backward fill, terminal valuation at the latest available close, fractional shares allowed.',
            'consolidated portfolio view and per-event view with invested, current value, and gain percentage.',
            'calibration: one-off multiples checked against hand-derived latest-over-purchase price ratios, and the subscription multiple checked against an independent dollar-cost-averaging recomputation; all cases reproduce exactly.',
            'six assumptions separating the established mechanics (lump-sum versus DCA, frictionless idealisation) from the contestable framing (the parity rule itself, survivorship and hindsight in the catalog).',
        ],
    },
];
