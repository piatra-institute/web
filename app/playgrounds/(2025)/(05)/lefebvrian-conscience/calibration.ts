import type { CalibrationResult } from '@/components/CalibrationPanel';

import { selfEvaluationOf, tendencyOf } from './logic';


/**
 * Lefebvre's algebra gives exact ground truth: each archetype has a fixed
 * self-evaluation, and a tendency that flips with the ethical system. Each case
 * computes one here (not stored) and checks it against the theory: the hero's high
 * self-image, the saint's low one, and the System-1-to-System-2 reversal of the
 * saint's tendency from compromise to conflict.
 */
export function buildCalibration(): CalibrationResult[] {
    return [
        {
            name: 'hero has high self-evaluation',
            description: 'the hero holds a positive self-image, independent of the ethical system.',
            predicted: selfEvaluationOf('hero') === 'high' ? 1 : 0,
            expected: 1,
            source: 'self-evaluation: hero, hypocrite -> high',
        },
        {
            name: 'saint has low self-evaluation',
            description: 'the saint holds a humble (low) self-image.',
            predicted: selfEvaluationOf('saint') === 'low' ? 1 : 0,
            expected: 1,
            source: 'self-evaluation: saint, opportunist -> low',
        },
        {
            name: 'saint compromises in System 1',
            description: 'in the first ethical system, the saint is a compromiser (compromise with good is good).',
            predicted: tendencyOf('saint', 1) === 'compromise' ? 1 : 0,
            expected: 1,
            source: 'System 1: saint, hero -> compromise',
        },
        {
            name: 'saint conflicts in System 2',
            description: 'the polarity flips: in the second system the saint is uncompromising.',
            predicted: tendencyOf('saint', 2) === 'conflict' ? 1 : 0,
            expected: 1,
            source: 'System 2 reverses compromise and conflict',
        },
        {
            name: 'opportunist conflicts in System 1',
            description: 'the low-self-image opportunist takes the conflict tendency in System 1.',
            predicted: tendencyOf('opportunist', 1) === 'conflict' ? 1 : 0,
            expected: 1,
            source: 'System 1: opportunist, hypocrite -> conflict',
        },
    ];
}
