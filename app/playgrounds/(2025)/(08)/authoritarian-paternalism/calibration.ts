import type { CalibrationResult } from '@/components/CalibrationPanel';

import { iterateF, iterateOrder, sigmoid, steadyF, steadyOrder, varShare } from './logic';


/**
 * Each case runs the model's own recurrence forward (the predicted value is
 * computed here, not stored) and checks it against the closed-form target. The
 * paternal-signaling and order states are linear AR(1) processes, so they
 * converge to F* = eta*p/(1-rho) and Order* = psi*r/(1-phi); the calibration
 * confirms the iterated state lands on those steady states.
 */
export function buildCalibration(): CalibrationResult[] {
    return [
        {
            name: 'paternal signaling F* (defaults)',
            description: 'iterated F converges to eta*p/(1-rho) with rho=0.9, eta=0.6, p=0.7.',
            predicted: Number(iterateF(0.5, 0.9, 0.6, 0.7, 500).toFixed(3)),
            expected: Number(steadyF(0.9, 0.6, 0.7).toFixed(3)),
            source: 'steady state of F[t+1] = rho*F + eta*p',
        },
        {
            name: 'order Order* (defaults)',
            description: 'iterated order converges to psi*r/(1-phi) with phi=0.85, psi=0.3, r=0.5.',
            predicted: Number(iterateOrder(0.5, 0.85, 0.3, 0.5, 500).toFixed(3)),
            expected: Number(steadyOrder(0.85, 0.3, 0.5).toFixed(3)),
            source: 'steady state of Order[t+1] = phi*Order + psi*r',
        },
        {
            name: 'paternal signaling F* (slow build)',
            description: 'a different regime, rho=0.8, eta=0.5, p=1.0, settles at a higher F*.',
            predicted: Number(iterateF(0.0, 0.8, 0.5, 1.0, 500).toFixed(3)),
            expected: Number(steadyF(0.8, 0.5, 1.0).toFixed(3)),
            source: 'steady state of F[t+1] = rho*F + eta*p',
        },
        {
            name: 'support at zero utility gap',
            description: 'when the utility gap is zero, the logit support probability is exactly one half.',
            predicted: Number(sigmoid(0).toFixed(3)),
            expected: 0.5,
            source: 'logit choice: sigma(0) = 1/2',
        },
        {
            name: 'variance share, noise to zero',
            description: 'as idiosyncratic noise vanishes, preference heterogeneity explains all the variance.',
            predicted: Number(varShare(1, 4.2, 1, 0.001).toFixed(3)),
            expected: 1,
            source: 'Var(c theta F) / (Var(c theta F) + sigma_eps^2) -> 1 as sigma_eps -> 0',
        },
    ];
}
