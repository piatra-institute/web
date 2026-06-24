import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'July 2025',
        description:
            'first cut. builds an interactive Ramsey-pricing sandbox for airport economics from the Ivaldi, Sokullu and Toru (2015) two-sided market study: nine US hub airports, an observed current-regulation benchmark against a simulated privatized benchmark, a welfare-weight slider lambda, a passenger network-effect slider, a grouped bar chart of welfare, profit, and consumer surplus, calibration of the welfare accounting identities, seven assumptions separating the established Ramsey-pricing framing from the simplified toy coupling, and a research companion.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'July 2025',
        changes: [
            'model: weighted-welfare benchmark W = CS + lambda * PS over nine US hub airports, with an observed "current" branch and a profit-maximizing "privatized" branch.',
            'welfare weight lambda discounts current-operator profit focus and reweights profit inside welfare; passenger network effect scales consumer surplus and privatized profit by linear multipliers.',
            'grouped bar chart comparing social welfare, total profit, and consumer surplus across the two branches, plus per-branch summary cards.',
            'calibration: checks the Marshallian welfare identity W = CS + PS on both the observed data and the model output, the neutral-parameter reproduction of observed consumer surplus, and the linearity of the network effect.',
            'framing kept honest: Ramsey here is optimal-pricing theory, not Ramsey-number combinatorics; the privatized branch is a counterfactual, and the lambda coupling is a legibility simplification rather than a re-solved constrained program.',
        ],
    },
];
