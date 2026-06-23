import type { CalibrationResult } from '@/components/CalibrationPanel';

import { axialTranslation, whorlExpansion } from './logic';


/**
 * Each case evaluates the canonical Raup spiral (the predicted value is computed
 * here, not stored) and checks a geometric relation that follows from the
 * definition: the radius grows by exactly W per whorl, by W^n over n whorls, and
 * the axial translation after one whorl is T times the current radius.
 */
export function buildCalibration(): CalibrationResult[] {
    return [
        {
            name: 'expansion over one whorl (W=2)',
            description: 'the spiral radius grows by exactly W per full revolution.',
            predicted: Number(whorlExpansion(2, 1).toFixed(4)),
            expected: 2,
            source: 'r(2pi)/r(0) = W for r = r0 exp(theta ln W / 2pi)',
        },
        {
            name: 'expansion over two whorls (W=1.5)',
            description: 'over n whorls the radius grows by W to the n.',
            predicted: Number(whorlExpansion(1.5, 2).toFixed(4)),
            expected: 2.25,
            source: 'r(2pi n)/r(0) = W^n; 1.5^2 = 2.25',
        },
        {
            name: 'expansion over half a whorl (W=4)',
            description: 'half a revolution multiplies the radius by the square root of W.',
            predicted: Number(whorlExpansion(4, 0.5).toFixed(4)),
            expected: 2,
            source: 'r(pi)/r(0) = sqrt(W); sqrt(4) = 2',
        },
        {
            name: 'axial translation after one whorl (W=2, T=0.6)',
            description: 'after one whorl the axial offset is T times the radius reached.',
            predicted: Number(axialTranslation(2 * Math.PI, 2, 0.6, 1).toFixed(4)),
            expected: 1.2,
            source: 'z(2pi) = T * r(2pi) = 0.6 * 2',
        },
    ];
}
