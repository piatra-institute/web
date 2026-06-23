import type { CalibrationResult } from '@/components/CalibrationPanel';
import type { SimulationParams } from './constants';

import { B_of_k, cutoffMStar, g_of_k, summarizeEntrants } from './logic';


/**
 * The model is deterministic, so these cases reproduce it exactly (the predicted
 * values are computed here, not stored): the rent and moral-cost functions, the
 * entry cutoff m* = (B - h) / g, the adverse-selection direction (more closedness
 * lowers the cutoff under a convex amplifier), and the fully-open limit where the
 * whole population enters.
 */
const base: SimulationParams = {
    closedness: 0.5, alpha: 1, beta0: 0.25, gamma: 0.6, eta: 0.15,
    betaA: 2, betaB: 3,
    useSignal: false, signalStrength: 0, meanLoyalty: 0.4, phiScale: 0.8, psiScale: 0.6,
};

export function buildCalibration(): CalibrationResult[] {
    const low = { ...base, alpha: 1.4, closedness: 0.2 };
    const high = { ...base, alpha: 1.4, closedness: 0.8 };
    const fullyOpen = { ...base, closedness: 0.5, alpha: 1 }; // m* = 0.95, but use a cutoff-1 case below

    return [
        {
            name: 'private rents B(k)',
            description: 'rents rise linearly with closedness: B = beta0 + gamma*k.',
            predicted: Number(B_of_k(0.5, 0.25, 0.6).toFixed(4)),
            expected: 0.55,
            source: '0.25 + 0.6 * 0.5',
        },
        {
            name: 'moral-cost amplifier g(k)',
            description: 'the convex amplifier g(k) = k^alpha at k = 0.5, alpha = 2.',
            predicted: Number(g_of_k(0.5, 2).toFixed(4)),
            expected: 0.25,
            source: '0.5^2',
        },
        {
            name: 'entry cutoff m*',
            description: 'the cutoff m* = (B - h) / g for k = 0.5, alpha = 1.',
            predicted: Number(cutoffMStar(base).toFixed(4)),
            expected: 0.95,
            source: '(0.55 - 0.075) / 0.5',
        },
        {
            name: 'adverse selection: closedness lowers the cutoff',
            description: 'under a convex amplifier, raising closedness from 0.2 to 0.8 lowers the entry cutoff.',
            predicted: cutoffMStar(low) > cutoffMStar(high) ? 1 : 0,
            expected: 1,
            source: 'm*(0.2) = 1 > m*(0.8) = 0.834',
        },
        {
            name: 'fully-open limit: everyone enters',
            description: 'when the cutoff is at the top of the range, the whole population enters.',
            predicted: Number(summarizeEntrants({ ...fullyOpen, closedness: 0.01, alpha: 1, gamma: 0.6, beta0: 0.99 }).fracEnter.toFixed(2)),
            expected: 1,
            source: 'cutoff clamps to 1, so fraction entering = 1',
        },
    ];
}
