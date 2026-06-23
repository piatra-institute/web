import type { CalibrationResult } from '@/components/CalibrationPanel';

import { saturate, simulate, violenceDecay, type Params } from './logic';


const DEFAULT_PARAMS: Params = {
    alpha0: 0.02, alpha1: 0.25, alpha2: 0.30, alpha3: 0.20, alpha4: 0.30, alpha5: 0.10,
    eta: 0.02, beta1: 0.50, beta2: 0.35, beta3: 0.25,
    lambda: 0.60, phi: 0.60, psi: 0.10,
};


/**
 * The predicted values are computed here by running the model, not stored. Two
 * cases check the saturating response in closed form. The other two integrate
 * the full RK4 system with the emotional driver E set to zero: in that regime the
 * violence source term vanishes, so violence must decay as v0 * exp(-lambda T),
 * and the simulator should reproduce that decay regardless of the other states.
 */
export function buildCalibration(): CalibrationResult[] {
    const start = { u: 0.2, t: 0.45, v: 0.5 };
    return [
        {
            name: 'saturation S(1)',
            description: 'the saturating response S(E) = E/(1+E) equals one half at E = 1.',
            predicted: Number(saturate(1).toFixed(4)),
            expected: 0.5,
            source: 'S(E) = E/(1+E)',
        },
        {
            name: 'saturation S(3)',
            description: 'and three quarters at E = 3.',
            predicted: Number(saturate(3).toFixed(4)),
            expected: 0.75,
            source: 'S(E) = E/(1+E)',
        },
        {
            name: 'violence decay, T=2 (E=0)',
            description: 'with no emotional driver, violence support decays exponentially at rate lambda.',
            predicted: Number(simulate(start, DEFAULT_PARAMS, 0, 0.2, 0.6, 0.05, 40).v.toFixed(4)),
            expected: Number(violenceDecay(0.5, 0.6, 2).toFixed(4)),
            source: 'dv/dt = -lambda v when E = 0, so v(T) = v0 exp(-lambda T)',
        },
        {
            name: 'violence decay, T=4 (E=0)',
            description: 'the same pure decay over a longer horizon.',
            predicted: Number(simulate(start, DEFAULT_PARAMS, 0, 0.2, 0.6, 0.05, 80).v.toFixed(4)),
            expected: Number(violenceDecay(0.5, 0.6, 4).toFixed(4)),
            source: 'dv/dt = -lambda v when E = 0, so v(T) = v0 exp(-lambda T)',
        },
    ];
}
