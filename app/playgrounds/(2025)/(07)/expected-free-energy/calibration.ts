import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    klDivergence,
    entropy,
    softmax,
    gaussianAmbiguity,
    expectedFreeEnergy,
} from './logic';


/**
 * Calibration of the exact, deterministic core of the active-inference model.
 *
 * The live playground is a stochastic Monte Carlo estimator, so we do NOT
 * calibrate its sampled output. Instead we calibrate the closed-form functions
 * the estimator is built from: discrete and Gaussian information measures whose
 * targets are fixed by theorems, not by tuning. Every `predicted` value is
 * COMPUTED by the model functions; every `expected` value is the independently
 * derived analytic target.
 */
export function buildCalibration(): CalibrationResult[] {
    const results: CalibrationResult[] = [];

    // 1. Self-divergence is exactly zero: D_KL(p || p) = 0 for any p.
    const p = [0.1, 0.2, 0.3, 0.4];
    results.push({
        name: 'KL self-divergence',
        description:
            'the Kullback-Leibler divergence of a belief from itself is exactly zero. an agent already at its preferred posterior pays no information cost.',
        predicted: Number(klDivergence(p, p).toFixed(6)),
        expected: 0,
        source: 'Kullback and Leibler 1951: D_KL(p || p) = 0, with equality iff p = q (Gibbs inequality).',
    });

    // 2. Entropy of a uniform distribution over n outcomes equals log(n).
    const n = 4;
    const uniform = Array.from({ length: n }, () => 1 / n);
    results.push({
        name: 'uniform entropy = log(n)',
        description:
            'the maximum-entropy state over n equally likely outcomes carries log(n) nats. this sets the ceiling on epistemic value the agent can resolve.',
        predicted: Number(entropy(uniform).toFixed(6)),
        expected: Number(Math.log(n).toFixed(6)),
        source: 'Shannon 1948: H(uniform over n) = log n; the maximum of H over the simplex.',
    });

    // 3. The policy posterior is a softmax and must sum to 1 (normalisation).
    const logits = [-0.5, 1.2, 0.3, -2.0];
    const policyPosterior = softmax(logits, 1);
    const massSum = policyPosterior.reduce((a, b) => a + b, 0);
    results.push({
        name: 'softmax normalisation',
        description:
            'the policy posterior sigma(-gamma G) is a probability distribution over policies: its total mass is exactly one regardless of the expected free energies.',
        predicted: Number(massSum.toFixed(6)),
        expected: 1,
        source: 'standard softmax normalisation; the active-inference policy prior in Friston et al. 2017.',
    });

    // 4. Gaussian observation ambiguity with unit variance = 0.5 log(2 pi e).
    const ambiguity = gaussianAmbiguity(1);
    results.push({
        name: 'Gaussian ambiguity (var = 1)',
        description:
            'the per-step ambiguity term is the differential entropy of a unit-variance Gaussian observation channel, 0.5 log(2 pi e) nats.',
        predicted: Number(ambiguity.toFixed(6)),
        expected: Number((0.5 * Math.log(2 * Math.PI * Math.E)).toFixed(6)),
        source: 'differential entropy of N(0, 1): 0.5 log(2 pi e variance), Cover and Thomas 2006.',
    });

    // 5. Worked EFE decomposition: horizon 10, riskWeight 2, obsStd 1, goal 0.5.
    // Risk = riskWeight * horizon * goal^2 = 2 * 10 * 0.25 = 5.
    // Ambiguity = horizon * 0.5 log(2 pi e) = 10 * 1.418938... = 14.189385...
    // EFE = 5 + 14.189385... = 19.189385...
    const efe = expectedFreeEnergy(10, 2, 1, 0.5);
    const handEfe = 5 + 10 * 0.5 * Math.log(2 * Math.PI * Math.E);
    results.push({
        name: 'EFE worked example',
        description:
            'expected free energy for a 10-step horizon with risk weight 2, unit observation noise, and goal 0.5: risk 5 plus ambiguity from ten Gaussian steps.',
        predicted: Number(efe.efe.toFixed(6)),
        expected: Number(handEfe.toFixed(6)),
        source: 'closed-form risk-plus-ambiguity decomposition; G = pragmatic (risk) + epistemic (ambiguity).',
    });

    return results;
}
