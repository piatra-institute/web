import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    activate,
    complexityDensity,
    forwardPass,
    stateFromOutput,
} from './logic';


/**
 * Calibration for the neural cellular automaton.
 *
 * The live grid is stochastic in two places only: the random initial weights and
 * the random mutation mask. The per-cell update itself (the dense affine, the
 * activation nonlinearity, the alive threshold, and the complexity fitness
 * density) is fully deterministic. These cases pin that deterministic core
 * against hand-computed values, so every `predicted` is produced by the same
 * functions the running automaton uses, never typed in by hand.
 */
export function buildCalibration(): CalibrationResult[] {
    const results: CalibrationResult[] = [];

    // 1. Sigmoid at the origin. 1 / (1 + e^0) = 0.5 exactly.
    {
        const predicted = Number(activate(0, 'sigmoid').toFixed(4));
        results.push({
            name: 'sigmoid(0)',
            description: 'the sigmoid nonlinearity at zero pre-activation sits at its midpoint, 1 / (1 + e^0).',
            predicted,
            expected: 0.5,
            source: 'logistic function identity sigma(0) = 1/2',
        });
    }

    // 2. tanh identity layer at input 1. A one-neuron layer with weight 1 and
    //    zero bias passes the input through, then tanh: tanh(1) = 0.76159...
    {
        const out = forwardPass([1], [[[1]]], [0], 'tanh');
        const predicted = Number(out[0].toFixed(4));
        results.push({
            name: 'tanh identity layer at x = 1',
            description: 'a single tanh neuron with unit weight and zero bias maps an input of 1 to tanh(1).',
            predicted,
            expected: 0.7616,
            source: 'hyperbolic tangent: tanh(1) = (e^2 - 1) / (e^2 + 1)',
        });
    }

    // 3. ReLU rectifies a negative pre-activation to exactly zero. Input -3,
    //    weight 1, bias 0, relu -> max(0, -3) = 0.
    {
        const out = forwardPass([-3], [[[1]]], [0], 'relu');
        const predicted = Number(out[0].toFixed(4));
        results.push({
            name: 'relu clips negative drive',
            description: 'a ReLU neuron driven by a negative pre-activation outputs exactly zero (the dead half-plane).',
            predicted,
            expected: 0,
            source: 'ReLU definition: max(0, x) = 0 for x < 0',
        });
    }

    // 4. Alive threshold under a saturating Moore neighbourhood. Nine living
    //    neighbours through one sigmoid neuron with unit weights and zero bias
    //    give sigma(9) ~ 0.99988 > 0.5, so the cell is alive (state 1).
    {
        const neighbors = new Array(9).fill(1);
        const weights = [new Array(9).fill(1)];
        const out = forwardPass(neighbors, [weights], [0], 'sigmoid');
        const predicted = stateFromOutput(out);
        results.push({
            name: 'alive threshold (saturated)',
            description: 'a fully alive Moore neighbourhood drives the first sigmoid channel above 0.5, so the centre cell stays alive.',
            predicted,
            expected: 1,
            source: 'state rule: alive when output[0] > 0.5; sigma(9) > 0.999',
        });
    }

    // 5. Complexity fitness density. A centre cell of state 1 with four of its
    //    eight Moore neighbours alive and four dead differs from exactly four,
    //    so the per-cell complexity summand is 4/8 = 0.5.
    {
        const neighbors = [1, 1, 1, 1, 0, 0, 0, 0];
        const predicted = Number(complexityDensity(1, neighbors).toFixed(4));
        results.push({
            name: 'complexity density (half-different)',
            description: 'a live centre cell with four matching and four differing Moore neighbours contributes a complexity density of 4/8.',
            predicted,
            expected: 0.5,
            source: 'complexity fitness summand: (differing neighbours) / 8',
        });
    }

    return results;
}
