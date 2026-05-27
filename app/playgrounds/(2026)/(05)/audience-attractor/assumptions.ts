import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'log-scale',
        statement:
            'audience size is best read on a log scale. going from 10 to 20 viewers is qualitatively different from going from 10,000 to 10,010, and the attractor structure lives in log-viewership.',
        citation:
            'standard treatment in audience economics; Salganik, Dodds and Watts (Science 2006) on multiplicative dynamics in cultural markets.',
        confidence: 'established',
        falsifiability:
            'a population of creators whose growth dynamics fit a linear model better than a log-linear one would weaken this. unlikely at the high tail.',
    },
    {
        id: 'two-pool',
        statement:
            'a two-pool decomposition (slow-moving core plus fast-moving casual audience) captures most of the dynamics that matter. richer audience graphs are not needed to recover floors and ceilings.',
        citation:
            'a modelling commitment. consistent with parasocial-attachment and habit-formation literatures.',
        confidence: 'contested',
        falsifiability:
            'a population where audiences cluster into three or more behaviourally distinct strata, with the two-pool model systematically mis-predicting retention, would falsify this.',
    },
    {
        id: 'metastable-basins',
        statement:
            'audience trajectories show metastable basins rather than smooth growth: dwell time concentrates in bands, and shocks can move the system between bands. this is the attractor hypothesis the playground exists to test.',
        citation:
            'after the 2026 arXiv preprint decomposing livestream loyalty into stability, competition resistance, post-peak retention, and floor ratio across 2.94 million minute-level observations and 18 channels.',
        confidence: 'speculative',
        falsifiability:
            'minute-level data across a large set of channels showing dwell distributions indistinguishable from a single log-normal would weaken this. the wandering regime in the playground is the in-model falsifier.',
    },
    {
        id: 'cumulative-advantage',
        statement:
            'popularity itself generates more popularity, with diminishing returns at the niche capacity. cumulative advantage is real but bounded.',
        citation:
            'after Salganik, Dodds and Watts (2006); Rosen on superstar economics (American Economic Review 1981).',
        confidence: 'established',
        falsifiability:
            'a setting where exposure shocks at high viewership produce no above-baseline conversion to core audience would weaken the cumulative-advantage term.',
    },
    {
        id: 'identity-lock-in',
        statement:
            'persona and audience expectations act as a partial barrier to crossing into a larger basin. the format that produced the existing floor can prevent escape into a larger market.',
        citation:
            'after Bourdieu on field reconversion (1979); platform pivot case studies; identity-lock-in literature.',
        confidence: 'contested',
        falsifiability:
            'large numbers of documented basin transitions with no identity-related friction would weaken the lock-in term.',
    },
    {
        id: 'shocks-are-bounded',
        statement:
            'platform pushes, raids, collaborations, and controversies act as bounded shocks: they shift the trajectory inside the landscape but rarely rewrite the landscape itself.',
        citation:
            'inferred from creator-economy case studies and platform-recommendation research.',
        confidence: 'contested',
        falsifiability:
            'a documented platform-policy change that durably shifted the entire dwell-band distribution for a creator population would partly falsify this.',
    },
    {
        id: 'no-time',
        statement:
            'the model has a fixed horizon of 180 periods and no calendar time. real seasonal effects, weekday patterns, and year-on-year trends are absent.',
        citation:
            'a deliberate compression. matches the ideation prototype.',
        confidence: 'established',
        falsifiability:
            'strong weekly or seasonal periodicities in real data that the model cannot reproduce would mark a scope limit, not a falsification of the basin structure itself.',
    },
    {
        id: 'no-content-cost',
        statement:
            'the playground has no production cost or burnout model. quality is a slow trait you can tune, but the simulation does not track creator effort.',
        citation: 'scoping choice.',
        confidence: 'established',
        falsifiability:
            'a regime where burnout produced cliff-like quality drops would require an extra dynamic. the playground simulates the audience side only.',
    },
    {
        id: 'seed-determinism',
        statement:
            'the simulation is deterministic given (params, scenario): the rng is seeded. results are reproducible, but a single seed is one path through the noise distribution, not the distribution.',
        citation: 'modelling commitment.',
        confidence: 'established',
        falsifiability:
            'this is a feature, not a hypothesis. a multi-seed extension would produce dwell distributions instead of single dwell shares.',
    },
    {
        id: 'platform-agnostic',
        statement:
            'the attractor structure is claimed to generalise across personality-driven media: Twitch, talk radio, talk shows, podcasts, political commentators. the playground uses Twitch terminology but the dynamics are not Twitch-specific.',
        citation:
            'after Lobato on television defaults and routines (2024); cross-medium audience research on habit and parasocial attachment.',
        confidence: 'contested',
        falsifiability:
            'a medium-specific mechanism (for example a hard subscription gate) that breaks the two-pool structure would localise the model to one platform family.',
    },
];
