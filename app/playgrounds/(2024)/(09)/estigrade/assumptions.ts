import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'mechanism-not-empirical',
        statement:
            'estigrade is a proposed grading rule, not a model fitted to data. the claim that it improves metacognition or learning outcomes is a hypothesis the calculator does not test.',
        citation:
            'design proposal; the pedagogical benefit is asserted, not measured.',
        confidence: 'speculative',
        falsifiability:
            'a classroom study could find no effect on self-assessment accuracy or learning, which the formula alone cannot rule out.',
    },
    {
        id: 'linear-reward-penalty',
        statement:
            'the adjustment is linear in the estimation error: a reward proportional to closeness (100 minus the gap) and a penalty proportional to the gap. it is the exact definition of the rule, not an approximation.',
        citation:
            'the estigrade formula final = exam + r*(100-|gap|) - p*|gap|.',
        confidence: 'established',
        falsifiability:
            'the calibration checks specific inputs against this formula; any deviation would be a bug, not a modelling choice.',
    },
    {
        id: 'final-grade-unbounded',
        statement:
            'the formula does not clamp the final grade to [0,100]: a large reward factor with a perfect estimate can push the final grade above 100, and a large penalty can push it below 0.',
        citation:
            'direct consequence of the unclamped formula.',
        confidence: 'contested',
        falsifiability:
            'set reward high with a perfect estimate and the final grade exceeds 100, so the rule needs an explicit cap to be usable as stated.',
    },
    {
        id: 'incentive-compatibility',
        statement:
            'whether honest self-assessment is actually the score-maximizing strategy depends on the reward and penalty factors and on the student\'s uncertainty; the rule is not guaranteed to be incentive-compatible for all settings.',
        citation:
            'scoring-rule / mechanism-design reasoning; truthfulness is a property to be checked, not assumed.',
        confidence: 'contested',
        falsifiability:
            'for some reward/penalty ratios a risk-averse student maximizes their expected grade by deliberately under- or over-estimating, breaking truthful reporting.',
    },
    {
        id: 'single-shot-deterministic',
        statement:
            'the calculator evaluates one exam with a single estimate and a deterministic formula; it does not model the distribution of a student\'s true ability or repeated assessments.',
        citation:
            'modelling scope of the calculator.',
        confidence: 'established',
        falsifiability:
            'a probabilistic treatment (estimate vs a distribution of outcomes) would change which estimate is optimal and is outside this tool.',
    },
];
