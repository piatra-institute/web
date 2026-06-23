import type { CalibrationResult } from '@/components/CalibrationPanel';

import { detectCycle, iterateSelf, nextTruth } from './logic';


/**
 * The truth-value dynamics are deterministic, so these cases reproduce them
 * exactly (the predicted values are computed here, not stored): the Liar
 * oscillates with period 2, a truth-teller is a fixed point (period 1), the
 * single-step logic of the IFF rule, and a constructed two-state cycle whose
 * detected period is known.
 */

// build a global-state history that alternates between two states A and B
function alternating(a: boolean[], b: boolean[], steps: number): boolean[][] {
    const out: boolean[][] = [];
    for (let t = 0; t < steps; t++) out.push(t % 2 === 0 ? a : b);
    return out;
}

export function buildCalibration(): CalibrationResult[] {
    const liar = iterateSelf('LIAR_SELF', true, 20);
    const liarCycle = detectCycle(liar.map((b) => [b]));
    const tellerCycle = detectCycle(iterateSelf('TRUTH_TELLER_SELF', true, 20).map((b) => [b]));
    const twoStateCycle = detectCycle(alternating([true, false], [false, true], 20));

    return [
        {
            name: 'Liar oscillates with period 2',
            description: '"this sentence is false" flips each step, giving a period-2 cycle.',
            predicted: liarCycle.period,
            expected: 2,
            source: 'LIAR_SELF: x -> not x',
        },
        {
            name: 'truth-teller is a fixed point',
            description: '"this sentence is true" holds its value, a period-1 cycle.',
            predicted: tellerCycle.period,
            expected: 1,
            source: 'TRUTH_TELLER_SELF: x -> x',
        },
        {
            name: 'IFF rule single step',
            description: 'the biconditional sentence is true exactly when self and target agree.',
            predicted: nextTruth('IFF_TARGET', true, true) ? 1 : 0,
            expected: 1,
            source: 'IFF_TARGET(true, true) = (true == true)',
        },
        {
            name: 'ASSERT_FALSE negates the target',
            description: '"that sentence is false" returns the negation of the target value.',
            predicted: nextTruth('ASSERT_FALSE', false, true) ? 1 : 0,
            expected: 0,
            source: 'ASSERT_FALSE(_, true) = not true = false',
        },
        {
            name: 'two-state network cycle has period 2',
            description: 'a network alternating between two distinct global states is detected as period 2.',
            predicted: twoStateCycle.period,
            expected: 2,
            source: 'first repeat of a 2-state alternation is at distance 2',
        },
    ];
}
