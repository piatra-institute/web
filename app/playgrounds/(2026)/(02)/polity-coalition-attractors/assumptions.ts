import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'replicator-core',
        statement:
            'Coalition support evolves by replicator dynamics: dx = dt * x(1-x)(piE - piI). The factor x(1-x) makes change fastest at intermediate shares and stalls at the pure states, so x = 0 and x = 1 are always fixed points and the contest is between two basins.',
        citation:
            'Taylor and Jonker 1978; Hofbauer and Sigmund, Evolutionary Games and Population Dynamics. Replicator dynamics as the canonical model of frequency-dependent selection of strategies.',
        confidence: 'established',
        falsifiability:
            'If real coalition share changed fastest near the extremes rather than in the middle, or never settled toward a boundary, the replicator form would be the wrong skeleton for this process.',
    },
    {
        id: 'two-field-state',
        statement:
            'The polity is reduced to two scalar fields on [0, 1]: x, the exclusionary coalition share, and t, institutional trust. Everything else (economy, security, media, demography) enters only through the seven static parameters S, D, P, N, C, R, O.',
        citation:
            'Standard low-dimensional reduction in political dynamics modelling; compare opinion-dynamics and threshold-cascade models that track one or two aggregate variables.',
        confidence: 'contested',
        falsifiability:
            'Cases where the same two aggregate values predict opposite outcomes would show that the hidden detail compressed into the parameters carries the real causal weight.',
    },
    {
        id: 'threat-feedback',
        statement:
            'Perceived threat is an algebraic function of state and parameters, rising with diversity-times-polarization, stress, and elite opportunism scaled by current exclusionary share, and falling with contact, trust, norms, and redistribution. It is clamped to [0, 1].',
        citation:
            'Intergroup threat theory (Stephan and Stephan 2000); social identity and realistic-conflict traditions on how perceived threat drives out-group hostility.',
        confidence: 'contested',
        falsifiability:
            'The specific weights are illustrative. If contact or redistribution raised rather than lowered perceived threat in well-identified data, the sign structure here would be wrong.',
    },
    {
        id: 'opportunism-amplifier',
        statement:
            'Elite opportunism O multiplies the existing exclusionary share (the O * x term in both threat and the exclusionary payoff), so identity entrepreneurs amplify a cleavage that is already present rather than creating one from nothing.',
        citation:
            'Identity-entrepreneurship and ethnic-outbidding literature (Rabushka and Shepsle 1972; Gagnon on elite manipulation of identity in conflict).',
        confidence: 'contested',
        falsifiability:
            'If exclusionary mobilization routinely arose with no pre-existing base for elites to amplify, the multiplicative O * x coupling would understate elite agency.',
    },
    {
        id: 'trust-erosion',
        statement:
            'Institutional trust has its own slow update that rises with redistribution, contact, and norms, and erodes with polarization, stress, threat, and a high exclusionary share. Falling trust feeds back into a higher exclusionary payoff, giving a self-reinforcing loop.',
        citation:
            'Social-capital and institutional-trust research (Putnam 2000; Rothstein and Stolle on the quality of government and generalized trust).',
        confidence: 'contested',
        falsifiability:
            'If trust were exogenous to coalition share, or recovered quickly under exclusionary dominance, the coupled two-way feedback modelled here would be spurious.',
    },
    {
        id: 'presets-illustrative',
        statement:
            'The historical presets (Sweden, Rwanda, Weimar Germany, and others) are hand-set parameter guesses, not values fitted to data. They illustrate how a regime sits in parameter space; the calibration panel checks only structural, regime-level claims, not numeric reconstruction of history.',
        citation:
            'Modelling choice. Documented in the playground notes and research companion as a toy, not an estimator.',
        confidence: 'speculative',
        falsifiability:
            'Any claim that this model reproduces a specific historical outcome would require mapping measured indicators onto S, D, P, N, C, R, O and fitting; nothing here performs that step.',
    },
];
