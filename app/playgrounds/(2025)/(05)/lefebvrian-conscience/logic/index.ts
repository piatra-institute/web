// Vladimir Lefebvre's algebra of conscience. Two ethical systems differ in how
// good and evil combine: in System 1 (which Lefebvre associated with the West),
// compromise with good is good but compromise with evil is evil; in System 2,
// the polarity of compromise and conflict is reversed, so uncompromising
// confrontation is the virtuous stance. From this, four moral archetypes fall out
// of two binary attitudes, self-evaluation (high or low) and behavioural tendency
// (compromise or conflict), with the tendency reading flipping between systems.
// These pure functions encode that exact mapping; lib/agent.ts uses the same rule.

export type EthicalSystem = 1 | 2;
export type Archetype = 'saint' | 'hero' | 'opportunist' | 'hypocrite';
export type SelfEvaluation = 'high' | 'low';
export type Tendency = 'compromise' | 'conflict';

// self-evaluation is intrinsic to the archetype and independent of the system:
// hero and hypocrite hold a high self-image, saint and opportunist a low one
export function selfEvaluationOf(archetype: Archetype): SelfEvaluation {
    return archetype === 'hero' || archetype === 'hypocrite' ? 'high' : 'low';
}

// tendency depends on the ethical system: in System 1 saint and hero compromise;
// in System 2 the polarity flips and they conflict
export function tendencyOf(archetype: Archetype, ethicalSystem: EthicalSystem): Tendency {
    const compromisesInSystem1 = archetype === 'saint' || archetype === 'hero';
    if (ethicalSystem === 1) return compromisesInSystem1 ? 'compromise' : 'conflict';
    return compromisesInSystem1 ? 'conflict' : 'compromise';
}

// the (self-evaluation, tendency) profile of an archetype in a given system
export function profileOf(archetype: Archetype, ethicalSystem: EthicalSystem): {
    selfEvaluation: SelfEvaluation;
    tendency: Tendency;
} {
    return {
        selfEvaluation: selfEvaluationOf(archetype),
        tendency: tendencyOf(archetype, ethicalSystem),
    };
}
