import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'mean-field-mixing',
        statement:
            'propagation is modelled as a mean-field branching process on aggregate state variables (active shares, cumulative reach), not on an explicit network. every active share is assumed to meet a representative sample of the audience, so one R_eff governs everyone.',
        citation:
            'standard mean-field epidemic approximation; Anderson and May 1991, Infectious Diseases of Humans.',
        confidence: 'contested',
        falsifiability:
            'real social graphs are clustered and heavy-tailed, so hubs and communities make a single R_eff wrong; a cascade whose spread depends on which node ignites would break the mean-field collapse.',
    },
    {
        id: 'r0-product-form',
        statement:
            'the basic reproduction number factorises as R0 = avgDegree × shareProb × amplification, the product of fan-out, per-viewer reshare probability, and an algorithmic boost. this is the branching analogue of R0 = contacts × transmission probability.',
        citation:
            'next-generation R0 for branching contagion; Diekmann, Heesterbeek and Metz 1990.',
        confidence: 'established',
        falsifiability:
            'if reshare probability depends on content age, source identity, or saturation in a non-multiplicative way, the clean product form fails and R0 is no longer a single constant.',
    },
    {
        id: 'epidemic-threshold',
        statement:
            'a cascade is self-sustaining if and only if R_eff > 1; at or below 1 it dies out. policy levers are read as multipliers on R_eff, so their job is to push a supercritical cascade below the threshold.',
        citation:
            'epidemic threshold theorem; Pastor-Satorras and Vespignani 2001 for networked spreading.',
        confidence: 'established',
        falsifiability:
            'on strongly heterogeneous networks the threshold can vanish (always-spreading regime), so a single R_eff = 1 boundary is itself an artefact of the mixing assumption.',
    },
    {
        id: 'simple-not-complex-contagion',
        statement:
            'the live simulator uses simple contagion: each exposure reshares independently with probability shareProb. it does not require multiple reinforcing exposures. the linear-threshold (complex contagion) rule is provided in the logic and calibration as a contrast, not in the running model.',
        citation:
            'Centola and Macy 2007 distinguish simple from complex contagion; Granovetter 1978 threshold model.',
        confidence: 'contested',
        falsifiability:
            'much political and behavioural adoption is complex (needs social proof from several peers); where adoption is threshold-gated, the simple-contagion reach here overestimates spread.',
    },
    {
        id: 'attention-decay',
        statement:
            'persuasive potency decays with content age by a fixed half-life, freshness = 2 to the power of minus age over half-life. delayed-visibility policies (coolup) work partly by ageing content before it is seen.',
        citation:
            'novelty and attention decay in online sharing; Wu and Huberman 2007 on collective attention.',
        confidence: 'contested',
        falsifiability:
            'some manipulative content gains potency with repetition rather than losing it (illusory-truth effect), in which case a monotone decay understates late-stage harm.',
    },
    {
        id: 'final-size-relation',
        statement:
            'in a finite audience, growth saturates as susceptibles deplete, and a supercritical cascade reaches a fraction 1 − 1/R_eff of the audience. this final-size fraction is the deterministic skeleton the stochastic run fluctuates around.',
        citation:
            'Kermack and McKendrick 1927 final-size relation; branching giant-component size.',
        confidence: 'established',
        falsifiability:
            'finite stochastic runs can go extinct early even when R_eff > 1 (stochastic fade-out), so the deterministic 1 − 1/R_eff is only the expectation over surviving cascades.',
    },
    {
        id: 'policy-as-multipliers',
        statement:
            'each intervention is encoded as an independent multiplier (forward caps halve degree, gating scales share probability, coolup damps ignition) and the effects compose multiplicatively. there is no adaptive adversary that re-optimises against the policy.',
        citation:
            'modelling simplification; adversarial-robustness critiques of static moderation models.',
        confidence: 'speculative',
        falsifiability:
            'real spammers adapt (buy aged accounts, change timing, evade caps), so measured policy effectiveness erodes over time in a way this static-multiplier model cannot show.',
    },
    {
        id: 'pmi-as-proxy',
        statement:
            'political manipulation impact is a proxy: it accumulates exposures times effective per-exposure conversion probability. it does not model belief change, persuasion heterogeneity, or downstream behaviour, only an expected count of successful conversions.',
        citation:
            'modelling choice; treated as a comparative index rather than a calibrated count.',
        confidence: 'speculative',
        falsifiability:
            'actual persuasion depends on prior beliefs, message-audience fit, and repeated exposure; a single per-exposure probability cannot be validated against field persuasion data here.',
    },
];
