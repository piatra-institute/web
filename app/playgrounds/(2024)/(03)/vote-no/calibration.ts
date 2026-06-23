import type { CalibrationResult } from '@/components/CalibrationPanel';

import { consensusStrength, isVetoed, passes, rejectionRate } from './logic';


/**
 * Member votes are drawn stochastically, so the network animation is not
 * reproducible. The decision rules it applies are deterministic, and these cases
 * check them (the predicted values are computed here, not stored): the rejection
 * rate, the veto and pass thresholds, and the consensus-strength curve that peaks
 * at an even split.
 */
export function buildCalibration(): CalibrationResult[] {
    return [
        {
            name: 'rejection rate (30 of 50)',
            description: 'the rejection rate is rejection votes over active members.',
            predicted: Number(rejectionRate(30, 50).toFixed(4)),
            expected: 0.6,
            source: '30 / 50',
        },
        {
            name: 'veto fires above threshold',
            description: 'a 60% rejection rate exceeds a 50% veto threshold, so the proposal is vetoed.',
            predicted: isVetoed(0.6, 0.5) ? 1 : 0,
            expected: 1,
            source: 'rate 0.6 > vetoThreshold 0.5',
        },
        {
            name: 'mature, low-rejection proposal passes',
            description: 'an aged proposal with rejection below (1 - consensusThreshold) passes.',
            predicted: passes(0.2, 6, 0.7) ? 1 : 0,
            expected: 1,
            source: 'age 6 > 5 and rate 0.2 < 1 - 0.7',
        },
        {
            name: 'consensus strongest at an even split',
            description: 'consensus strength is maximal (1) when the community is evenly divided.',
            predicted: Number(consensusStrength(0.5).toFixed(4)),
            expected: 1,
            source: '1 - |0.5 - 0.5| * 2',
        },
        {
            name: 'consensus zero at unanimity',
            description: 'consensus strength falls to zero when everyone rejects.',
            predicted: Number(consensusStrength(1).toFixed(4)),
            expected: 0,
            source: '1 - |0.5 - 1| * 2',
        },
    ];
}
