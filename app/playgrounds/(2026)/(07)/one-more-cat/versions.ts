import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude fable 5',
        date: 'July 2026',
        description:
            'first cut. turns the "how does a household reach 120 cats" question into a monthly systems model: a care-load ratio rho = required care / effective capacity that governs welfare instead of raw count, a logistic one-more-cat decision driven by solicitation, rescue identity, and marginal-cost underestimation, endogenous referral feedback, a Nutter-anchored reproduction module, attachment hysteresis in rehoming, six presets from rural mouser to managed sanctuary, expected / stochastic / Monte-Carlo ensemble modes, a threshold scanner with cliff detection, a two-parameter phase map, and an intervention lab.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'July 2026',
        changes: [
            'state: monthly population update n(t+1) = n + accepted arrivals + births - rehomed - deaths, with expected fractional flows or stochastic integer draws (Poisson / binomial) from a seeded PRNG.',
            'care system: rho = load / effective capacity, where load combines routinizable care with limited economies of scale, irreducible individual monitoring, and density / monitoring / disease multipliers that grow super-linearly past their thresholds.',
            'decision: P(accept) = logistic[2.7 * (benefit - perceived cost)]; benefit spans companionship, a second-cat bonus, rescue identity, solicitation, and reputation; perceived cost is discounted by habituation and raised by recognized overload and an intake-capacity gate.',
            'reproduction: literature-anchored 1.4 litters/yr and 3 kittens/litter, scaled by intensity, kitten survival, sterilized share, and current welfare.',
            'rehoming: attachment-based surrender aversion, crisis motivation, chaos penalty, and network factor, producing hysteresis between refusing and relinquishing.',
            'regimes: none / single / pair / stable multi-cat / rescue network / managed sanctuary / overload / accumulation crisis, with first-crossing threshold events at 1, 2, 5, 20, 50, 100, and 120 cats and at rho = 1.',
            'analysis surfaces: expected and stochastic timelines, a 200-run Monte-Carlo ensemble with quantile bands and overload / reach-120 probabilities, a 1-D threshold scanner with automatic cliff detection, a 2-D regime phase map, and an intervention lab (timed sterilization, rehoming, capacity, and intake boosts) with a no-intervention counterfactual.',
        ],
    },
];
