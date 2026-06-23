import type { CalibrationResult } from '@/components/CalibrationPanel';

import { energyDriftBroken, energyDriftSymmetric, oscillatorEnergy } from './logic';


/**
 * The field visualization is illustrative, so it is not what gets calibrated.
 * What is checked here is the real physics the playground is about: Noether's
 * theorem, that a continuous symmetry implies a conserved quantity, made concrete
 * on a harmonic oscillator. The predicted values are computed here, not stored:
 * the energy of a known state in closed form, the near-zero energy drift under
 * time-translation symmetry, and the fact that breaking the symmetry destroys the
 * conservation.
 */
export function buildCalibration(): CalibrationResult[] {
    const symDrift = energyDriftSymmetric({ x: 1, v: 0 }, 2, 0.01, 2000);
    const brokenDrift = energyDriftBroken({ x: 1, v: 0 }, 2, 0.5, 0.01, 2000);
    return [
        {
            name: 'oscillator energy (x=1, v=0, w=2)',
            description: 'energy of a unit-mass oscillator: E = 1/2 v^2 + 1/2 w^2 x^2.',
            predicted: Number(oscillatorEnergy({ x: 1, v: 0 }, 2).toFixed(4)),
            expected: 2,
            source: '0.5 * 2^2 * 1^2 = 2',
        },
        {
            name: 'oscillator energy (x=0, v=3)',
            description: 'pure kinetic energy at the equilibrium point.',
            predicted: Number(oscillatorEnergy({ x: 0, v: 3 }, 2).toFixed(4)),
            expected: 4.5,
            source: '0.5 * 3^2 = 4.5',
        },
        {
            name: 'Noether: symmetry conserves energy',
            description: 'with time-translation symmetry, the relative energy drift over 2000 steps is essentially zero.',
            predicted: Number(symDrift.toFixed(4)),
            expected: 0,
            source: 'constant-stiffness oscillator: energy is the conserved Noether charge',
        },
        {
            name: 'Noether: broken symmetry loses conservation',
            description: 'ramping the stiffness in time breaks the symmetry, so energy is no longer conserved (drift far exceeds the symmetric case).',
            predicted: brokenDrift > 100 * symDrift ? 1 : 0,
            expected: 1,
            source: 'time-dependent stiffness: no time-translation symmetry, no conserved energy',
        },
    ];
}
