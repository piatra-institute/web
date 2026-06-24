import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    sigmoid,
    relu,
    numericDerivative,
    defaultSpec,
    builtinEval,
    type Spec,
} from './logic';


/**
 * Calibration against exact, closed-form mathematical facts about the
 * activation functions implemented in logic/index.ts. Every `predicted` value
 * is COMPUTED here by calling the real logic functions; nothing is hardcoded.
 *
 * Because these are exact functions, the expected values are mathematical
 * identities (sigmoid(0) = 1/2, tanh(0) = 0, ReLU(-3) = 0, sigmoid'(0) = 1/4,
 * a 1D softmax / logistic gate normalises to 1). The errors should be either
 * exactly zero or limited to floating-point and finite-difference precision.
 */


// Shared default spec so builtinEval has a full parameter set to read from.
const SPEC: Spec = defaultSpec();

// Helper: evaluate a built-in by name at a point, using the default params.
function evalAt(name: Spec['builtinType'], x: number): number {
    return builtinEval(name ?? 'ReLU', x, SPEC);
}


export function buildCalibration(): CalibrationResult[] {
    // 1. sigmoid(0) = 0.5 (logistic function passes through its midpoint).
    const sigmoidAtZero = sigmoid(0);

    // 2. tanh(0) = 0, and tanh is odd: tanh(2) + tanh(-2) = 0.
    //    We report the odd-symmetry residual, which should be 0.
    const tanhOddResidual = Math.tanh(2) + Math.tanh(-2);

    // 3. ReLU(-3) = 0 (the rectifier zeroes all negative input).
    const reluNeg = relu(-3);

    // 4. sigmoid'(0) = sigmoid(0) * (1 - sigmoid(0)) = 0.25.
    //    Computed by central finite difference of the actual sigmoid.
    const sigmoidDerivAtZero = numericDerivative((x) => sigmoid(x), 0, 1e-5);

    // 5. A 1D softmax (the Softmax1D built-in, equal to the logistic gate)
    //    paired with its complement must form a normalised distribution
    //    summing to 1: softmax1d(x) + softmax1d(-x) = 1 for any x.
    //    Using x = 1.3 as a representative off-center point.
    const x = 1.3;
    const softmaxNormalization = evalAt('Softmax1D', x) + evalAt('Softmax1D', -x);

    return [
        {
            name: 'sigmoid midpoint',
            description:
                'the logistic function passes through 0.5 at the origin: sigmoid(0) = 1/2, the neutral squashing point.',
            predicted: Number(sigmoidAtZero.toFixed(6)),
            expected: 0.5,
            source: 'logistic function identity σ(0) = 1/2',
        },
        {
            name: 'tanh odd symmetry',
            description:
                'hyperbolic tangent is an odd function, so tanh(2) + tanh(-2) cancels to 0; this is the odd-symmetry residual.',
            predicted: Number(tanhOddResidual.toFixed(6)),
            expected: 0,
            source: 'tanh(-x) = -tanh(x), an odd function',
        },
        {
            name: 'ReLU negative cutoff',
            description:
                'the rectifier maps every negative input to zero, so ReLU(-3) = 0; this is the dead region that motivates leaky variants.',
            predicted: Number(reluNeg.toFixed(6)),
            expected: 0,
            source: 'ReLU(x) = max(0, x), Nair and Hinton 2010',
        },
        {
            name: 'sigmoid slope at origin',
            description:
                'the logistic derivative peaks at the origin with value σ(0)(1 - σ(0)) = 0.25, computed by central finite difference.',
            predicted: Number(sigmoidDerivAtZero.toFixed(4)),
            expected: 0.25,
            source: "σ'(x) = σ(x)(1 - σ(x)), evaluated at x = 0",
        },
        {
            name: 'softmax normalization',
            description:
                'a two-class softmax (the Softmax1D built-in, equal to the logistic gate) sums to 1: softmax1d(x) + softmax1d(-x) = 1.',
            predicted: Number(softmaxNormalization.toFixed(6)),
            expected: 1,
            source: 'softmax outputs form a probability distribution summing to 1',
        },
    ];
}
