import type { CalibrationResult } from '@/components/CalibrationPanel';

import { calculateCapacity, calculateModel } from './logic';


/**
 * Each case evaluates the model (the predicted value is computed here, not stored)
 * for inputs whose result is known in closed form: the power-law capacity, the
 * scarcity as users over capacity, and the key qualitative claim, that once the
 * attention ceiling binds, more technology no longer reduces scarcity at all.
 */
export function buildCalibration(): CalibrationResult[] {
    // material regime: T=10, k=1, no friction/corruption -> capacity 100*10 = 1000
    const material = calculateModel(10, 200, 1, 0, 0, 1e9, false);
    // attention-bound regime: ceiling A=50 far below produced capacity
    const techLow = calculateModel(10, 100, 1, 0, 0, 50, true);
    const techHigh = calculateModel(100, 100, 1, 0, 0, 50, true);

    return [
        {
            name: 'capacity (T=10, k=1)',
            description: 'linear-tech capacity with no friction is C0 * T = 100 * 10.',
            predicted: Number(calculateCapacity(10, 1, 0).toFixed(2)),
            expected: 1000,
            source: 'capacity = (1-f) C0 T^k',
        },
        {
            name: 'friction halves capacity',
            description: 'friction f = 0.5 removes half the produced capacity.',
            predicted: Number(calculateCapacity(10, 1, 0.5).toFixed(2)),
            expected: 500,
            source: 'capacity = (1-0.5) * 100 * 10',
        },
        {
            name: 'material scarcity (lambda)',
            description: 'with 200 users sharing capacity 1000, the scarcity multiplier is 0.2.',
            predicted: Number(material.scarcity.toFixed(4)),
            expected: 0.2,
            source: 'scarcity = N / capacity = 200 / 1000',
        },
        {
            name: 'attention ceiling cannot be engineered away',
            description: 'once the attention ceiling binds, raising technology ten-fold leaves scarcity unchanged.',
            predicted: Number((techHigh.scarcity - techLow.scarcity).toFixed(4)),
            expected: 0,
            source: 'scarcity = N/A when A binds, independent of T',
        },
    ];
}
