import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    effectiveStiffness,
    lateralStrain,
    nonlinearFactor,
    springForce,
    strain,
} from './logic';


/**
 * Calibration of the deterministic core of the lattice mechanics.
 *
 * Every `predicted` value below is COMPUTED by calling the pure functions in
 * ./logic; the `expected` values are hand-worked closed forms of the same
 * physics (Hooke's law, the auxetic stiffness law, the Poisson lateral-strain
 * relation). The stochastic parts of the viewer (random fixed nodes, random
 * connectivity, environmental forcing) are deliberately not calibrated here,
 * only the noise-free spring response is.
 *
 * Geometry note: rest length R = cellSize = 15, the lattice spacing used by the
 * viewer, so a spring at L = R carries no force and no strain.
 */

const REST = 15;
const BASE_STIFFNESS = 100;

export function buildCalibration(): CalibrationResult[] {
    // Case 1 - equilibrium: a spring at its rest length stores no strain.
    const equilibriumStrain = strain(REST, REST);

    // Case 2 - Hooke at rest: zero force at rest length, ordinary material.
    const restForce = springForce(REST, REST, BASE_STIFFNESS, 0, 0);

    // Case 3 - Hooke under 20% tension: L = 18, R = 15, nu = 0.
    // F = k (L - R) / L = 100 * (18 - 15) / 18 = 16.6667.
    const tensileForce = springForce(18, REST, BASE_STIFFNESS, 0, 0);

    // Case 4 - auxetic stiffening: nu = -0.5 with stored strain 0.2 raises
    // the effective stiffness to k (1 + 0.5 * 0.2) = 110.
    const auxeticStiffness = effectiveStiffness(BASE_STIFFNESS, -0.5, 0.2);

    // Case 5 - linear limit: with nonlinearity 0 the stiffening factor is
    // exactly 1, so the spring response is purely Hookean.
    const linearFactor = nonlinearFactor(18, 0);

    // Case 6 - auxetic lateral response: a negative Poisson ratio expands the
    // lattice sideways under stretch. nu = -0.5, axial 0.1 -> lateral +0.05,
    // reported per mille (x1000 = 50) so the target is comfortably above unity.
    const auxeticLateral = lateralStrain(0.1, -0.5) * 1000;

    return [
        {
            name: 'rest strain',
            description: 'a spring held at its rest length carries zero engineering strain.',
            predicted: Number(equilibriumStrain.toFixed(4)),
            expected: 0,
            source: 'definition of engineering strain |L - R| / R at L = R',
        },
        {
            name: 'rest force (Hooke)',
            description: 'no restoring force at the natural length, ordinary (non-auxetic) material.',
            predicted: Number(restForce.toFixed(4)),
            expected: 0,
            source: "Hooke's law F = k (L - R) / L vanishes at L = R",
        },
        {
            name: 'tensile force, 20% stretch',
            description: 'L = 18, R = 15, k = 100: the Hookean restoring coefficient is k (L - R) / L.',
            predicted: Number(tensileForce.toFixed(2)),
            expected: 16.67,
            source: "Hooke's law: 100 * (18 - 15) / 18 = 16.667",
        },
        {
            name: 'auxetic stiffening',
            description: 'negative Poisson ratio nu = -0.5 at stored strain 0.2 raises effective stiffness.',
            predicted: Number(auxeticStiffness.toFixed(2)),
            expected: 110,
            source: 'k_eff = k (1 + |nu| * |strain|) = 100 * (1 + 0.5 * 0.2) = 110',
        },
        {
            name: 'linear limit',
            description: 'with nonlinearity set to zero the stiffening factor reduces to exactly one.',
            predicted: Number(linearFactor.toFixed(4)),
            expected: 1,
            source: 'factor = 1 + nonlinearity * sin(L * 0.1), nonlinearity = 0',
        },
        {
            name: 'auxetic lateral strain (per mille)',
            description: 'nu = -0.5, axial strain 0.1: the auxetic lattice expands sideways (positive lateral strain).',
            predicted: Number(auxeticLateral.toFixed(2)),
            expected: 50,
            source: 'epsilon_lateral = -nu * epsilon_axial = 0.5 * 0.1 = 0.05 (x1000)',
        },
    ];
}
