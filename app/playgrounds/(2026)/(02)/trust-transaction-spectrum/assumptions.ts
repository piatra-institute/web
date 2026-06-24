import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'weights-elicited',
        statement:
            'the nine factor weights are expert-elicited, not regression-derived. they sum to 1.0 by construction and encode a prior about which pressures push a small state toward transactional behaviour, in the same methodological family as composite indices like the Fragile States Index.',
        citation:
            'Fragile States Index methodology (Fund for Peace); elicited-weight composites are a standard, openly subjective IR tool.',
        confidence: 'speculative',
        falsifiability:
            'if a regression on coded small-state behaviour returned weights far from these (for example, dependence dominating threat), the elicited prior would be the weaker estimate for that sample.',
    },
    {
        id: 'linear-plus-interactions',
        statement:
            'transactional pressure is modelled as a weighted linear sum of normalised factors plus two multiplicative interaction terms (threat times alliance deficit, rivalry times shelter deficit). the linear part assumes factors are mostly separable; the interactions add the two compounding effects the literature flags most strongly.',
        citation:
            'Walt, balance-of-threat (threat without a credible ally is qualitatively worse); Thorhallsson, shelter theory (rivalry without institutional cover compounds).',
        confidence: 'contested',
        falsifiability:
            'real strategic choice plausibly has many more interactions and threshold effects; a case where two low-pressure factors jointly trigger a sharp shift would not be captured by these two product terms.',
    },
    {
        id: 'convex-leverage',
        statement:
            'relative autonomy enters asymmetrically: a convex penalty (1 - leverage)^1.5 times 10 for low autonomy, and a linear boost of leverage times 5 for high autonomy. the claim is that partners discount unreliable weak actors faster than they reward strong ones.',
        citation:
            'reputation-erosion intuition from credibility literature; the convex exponent of 1.5 is a chosen shape, not a measured elasticity.',
        confidence: 'speculative',
        falsifiability:
            'the exponent and the 10 / 5 scaling are free parameters; a different but equally defensible curve would reorder some mid-range scores, so any claim resting on the exact penalty shape is fragile.',
    },
    {
        id: 'reputation-matters',
        statement:
            'the model treats reputational capital as a real, decaying asset whose deficit raises transactional pressure. this takes a side in an active dispute about whether reputations actually shape state behaviour.',
        citation:
            'Weisiger and Yarhi-Milo argue reputations matter; Press and Mercer argue they matter far less than commonly assumed.',
        confidence: 'contested',
        falsifiability:
            'if past inconsistency reliably failed to predict how partners treat a state, the reputational-capital factor would be spurious and its weight should be near zero.',
    },
    {
        id: 'crisis-reallocation',
        statement:
            'the crisis flag reallocates a small amount of weight mass: the institutional shelter deficit weight rises by 0.02 while the reputational capital deficit weight falls by 0.03, on the theory that shelter is most critical and reputation least affordable during an acute crisis.',
        citation:
            'Thorhallsson 2011 on shelter being most needed in crises; short-horizon survival logic for the reputation discount.',
        confidence: 'contested',
        falsifiability:
            'the specific magnitudes are stipulated; a state that doubled down on reputation precisely during crisis would contradict the direction, not just the size, of this reallocation.',
    },
    {
        id: 'thresholds-heuristic',
        statement:
            'the four posture regimes are cut at scores of 25, 45, and 65. these are decision-theoretic boundaries chosen for legibility, not empirically observed cutpoints where state behaviour actually changes regime.',
        citation:
            'modelling choice; the taxonomy maps loosely onto Kuik\'s hedging spectrum but the numeric cuts are not from his data.',
        confidence: 'speculative',
        falsifiability:
            'a state scoring 44 versus 46 is labelled differently for a one-point change with no behavioural discontinuity behind it; observed posture transitions clustering at other scores would refute the cuts.',
    },
    {
        id: 'sanctions-endogeneity',
        statement:
            'sanctions exposure is entered as an input that raises transactional pressure, but it is partly a consequence of posture rather than a clean cause of it. the model knowingly tolerates this endogeneity for simplicity.',
        citation:
            'standard endogeneity caution in geo-economic statecraft (weaponised interdependence literature, Farrell and Newman).',
        confidence: 'established',
        falsifiability:
            'a proper causal estimate would instrument sanctions on exogenous shocks; treating the observed exposure as a pure input will bias the score whenever posture itself provoked the sanctions.',
    },
    {
        id: 'no-domain-resolution',
        statement:
            'the index is a single scalar per state, so it cannot represent a state that is transactional on one domain (energy security) and rules-first on another (border norms). all sectors are collapsed into one posture.',
        citation:
            'modelling simplification; domain-specific variation is a documented feature of real hedging behaviour.',
        confidence: 'established',
        falsifiability:
            'any state with strongly divergent sector postures is mislabelled by a single score; a sector-weighted extension would be required to express it.',
    },
];
