import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'gait-as-policy',
        statement:
            'gait choice is treated as a discrete policy-selection problem over four options (walk, skip, run, stroll), each scored by an expected free energy G and the lowest-G policy chosen. this casts locomotion as active inference rather than as a continuous biomechanical optimisation.',
        citation:
            'Friston et al., active inference and the free-energy principle; policies as action sequences scored by expected free energy.',
        confidence: 'contested',
        falsifiability:
            'real gait selection is continuous (speed, cadence, step length vary smoothly) and partly reflexive at the spinal level; if a behaviour requires a fifth gait or a continuous interpolation the four-policy model cannot express it.',
    },
    {
        id: 'efe-additive',
        statement:
            'expected free energy is a weighted linear sum of six cost terms (risk, ambiguity, energy, social penalty, injury, arousal mismatch) minus a weighted information-gain term. there are no interaction terms between costs beyond what the component formulas already encode.',
        citation:
            'standard EFE decomposition into risk (pragmatic value) and ambiguity / information gain (epistemic value); the social, injury and arousal terms are this playground’s additions.',
        confidence: 'contested',
        falsifiability:
            'if two costs trade off non-additively (for example energy and injury jointly gating a choice in a way no linear sum captures) the additive form is wrong and the weights cannot be read independently.',
    },
    {
        id: 'exploitation-vs-exploration',
        statement:
            'the only term that lowers G is information gain; every other term raises it. exploration is therefore a genuine drive in the model, not a tie-breaker, and a novel complex gait can win purely on epistemic value when its costs are small.',
        citation:
            'epistemic value in active inference: agents act to resolve uncertainty, not only to reach goals.',
        confidence: 'established',
        falsifiability:
            'set the information weight to zero and every exploratory win disappears; if a clearly curiosity-driven gait choice survives that change, information gain is not what produced it.',
    },
    {
        id: 'policy-specs-handtuned',
        statement:
            'each gait carries six fixed specification numbers (impact, signal amplitude, energy per distance, conspicuousness, complexity, speed) that feed the cost formulas. these constants are hand-chosen for plausibility, not fitted to motion-capture, metabolic, or behavioural data.',
        citation:
            'modelling choice; the values encode ordinal intuitions (running is high impact, skipping is conspicuous and signal-rich) rather than measured quantities.',
        confidence: 'speculative',
        falsifiability:
            'metabolic cost of transport, ground-reaction-force, and arousal measurements would pin these constants down; the current ordering is a hypothesis, and a measured reversal (for example skipping cheaper than walking) would falsify a spec.',
    },
    {
        id: 'normalised-units',
        statement:
            'every context variable and component lives in [0, 1] and weights in roughly [0, 2]; absolute G values are arbitrary and only the ranking across the four policies is meaningful. clamping keeps each term bounded.',
        citation:
            'dimensionless toy formulation; the calibration panel checks the component formulas, not any physical unit.',
        confidence: 'established',
        falsifiability:
            'because units are arbitrary, no claim about absolute free energy in joules or bits is made or testable; only relative comparisons within one parameter setting are defensible.',
    },
    {
        id: 'child-adult-weights',
        statement:
            'the difference between a skipping child and a walking adult is modelled entirely as a change in the weight vector (children weight information up and social cost down, adults the reverse), with the same equation and the same four gaits for both.',
        citation:
            'developmental framing inspired by changing exploration / social-conformity trade-offs across the lifespan; an interpretive overlay, not a measured developmental trajectory.',
        confidence: 'speculative',
        falsifiability:
            'if children and adults differ in their physical specs (limb proportion, strength, balance) rather than only in weights, attributing the crossover purely to weighting is too simple and the weight story is incomplete.',
    },
];
