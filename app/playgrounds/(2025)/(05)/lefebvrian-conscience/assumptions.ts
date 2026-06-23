import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'two-ethical-systems',
        statement:
            'Lefebvre posits two ethical systems that differ in how good and evil combine. In System 1, compromise with good is good and compromise with evil is evil; in System 2 the polarity flips, so uncompromising confrontation is the moral stance. The model encodes this exact reversal.',
        citation:
            'Lefebvre, Algebra of Conscience (1982); the two ethical systems and their Boolean composition.',
        confidence: 'contested',
        falsifiability:
            'Lefebvre claimed empirical correlates (US vs Soviet moral intuitions); whether two systems exhaust real moral cognition is debated.',
    },
    {
        id: 'four-archetypes',
        statement:
            'four moral archetypes (saint, hero, opportunist, hypocrite) arise from two binary attitudes: self-evaluation (high or low) and behavioural tendency (compromise or conflict). this 2x2 is exact and checked by the calibration.',
        citation:
            'the archetype-to-attitude mapping derived from Lefebvre\'s framework.',
        confidence: 'established',
        falsifiability:
            'the calibration verifies each archetype\'s self-evaluation and its tendency in both systems; a deviation would be an implementation error.',
    },
    {
        id: 'tendency-flips-with-system',
        statement:
            'self-evaluation is intrinsic to an archetype, but the behavioural tendency depends on the ethical system: the saint compromises in System 1 and conflicts in System 2. this flip is the formal heart of the model.',
        citation:
            'the System-dependent tendency rule.',
        confidence: 'established',
        falsifiability:
            'the calibration checks the saint\'s tendency reversal across systems; the flip is a theorem of the encoding, not a tunable parameter.',
    },
    {
        id: 'agent-resource-dynamics',
        statement:
            'the on-screen agents help or harm neighbours with fixed costs and benefits, modulated by in-group factors and awareness. these resource dynamics are a stylized illustration layered on the formal ethics, not part of Lefebvre\'s algebra.',
        citation:
            'the agent help/harm resource model in lib/agent.ts.',
        confidence: 'contested',
        falsifiability:
            'the specific costs, benefits, and in-group factors are modelling choices; different values change the emergent behaviour without touching the underlying algebra.',
    },
    {
        id: 'stochastic-agents',
        statement:
            'agents move and interact randomly, so each simulation run differs. the aggregate statistics are single-sample estimates, while the archetype algebra is exact and deterministic.',
        citation:
            'random initial positions and interaction draws.',
        confidence: 'established',
        falsifiability:
            'this is why the calibration targets the deterministic Lefebvre mapping, not the emergent simulation outcomes.',
    },
    {
        id: 'formal-not-prescriptive',
        statement:
            'the model formalizes how moral stances compose, not which is correct. mapping System 1 and 2 to real cultures is Lefebvre\'s interpretive claim, offered for exploration rather than endorsed.',
        citation:
            'Lefebvre\'s cultural interpretation of the two systems.',
        confidence: 'speculative',
        falsifiability:
            'the exact content is the algebra; the cultural mapping is an empirical claim the playground does not test.',
    },
];
