import type { CalibrationResult } from '@/components/CalibrationPanel';

import { classify } from './logic';


interface QuadrantCase {
    name: string;
    self: number;
    other: number;
    quadrant: 'intelligent' | 'helpless' | 'bandit' | 'stupid';
    description: string;
}


/**
 * The calibration checks the deterministic core of the model: the classifier
 * that maps a point on Cipolla's two payoff axes (gain to self, gain to others)
 * into one of the four quadrants. Each case places a point unambiguously inside
 * one quadrant and asks whether classify returns the quadrant Cipolla's
 * definitions require. predicted is computed by calling classify, never
 * hardcoded; a correct label scores 1 against the expected target of 1.
 *
 * The stochastic population sampler (a four-component bivariate mixture) and the
 * country-to-quadrant macro model are not calibrated here: they are pedagogical
 * and have no ground-truth target. Only the deterministic classifier is
 * falsifiable against Cipolla's own definitions, so only it is tested.
 */
const QUADRANT_CASES: QuadrantCase[] = [
    {
        name: 'intelligent · helps self and others',
        self: 1,
        other: 1,
        quadrant: 'intelligent',
        description:
            'a person whose action benefits both themselves and society. Cipolla places gain to self and gain to others both positive.',
    },
    {
        name: 'bandit · gains by harming others',
        self: 1,
        other: -1,
        quadrant: 'bandit',
        description:
            'a person who profits while imposing a loss on others. Positive gain to self, negative gain to others.',
    },
    {
        name: 'helpless · harms self, helps others',
        self: -1,
        other: 1,
        quadrant: 'helpless',
        description:
            'the naive or helpless actor who is exploited: a loss to self while others benefit. Negative gain to self, positive gain to others.',
    },
    {
        name: 'stupid · harms self and others',
        self: -1,
        other: -1,
        quadrant: 'stupid',
        description:
            'Cipolla\'s defining case of stupidity: an action that damages both self and others at once. Both axes negative.',
    },
    {
        name: 'origin · weak-positive boundary',
        self: 0,
        other: 0,
        quadrant: 'intelligent',
        description:
            'a boundary check. A point exactly at the origin is treated as the non-harmful case and lands in the intelligent quadrant by the closed >= 0 convention.',
    },
];


export function buildCalibration(): CalibrationResult[] {
    return QUADRANT_CASES.map((c) => {
        const label = classify(c.self, c.other);
        const correct = label === c.quadrant ? 1 : 0;
        return {
            name: c.name,
            description: c.description,
            predicted: correct,
            expected: 1,
            source: 'Cipolla, The Basic Laws of Human Stupidity (1976): the four quadrants of the gain-to-self by gain-to-others plane.',
        };
    });
}
