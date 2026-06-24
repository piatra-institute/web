import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    applyCPT,
    conjugateC,
    cptInvariant,
    matterAntimatterAsymmetry,
    parityP,
    referenceState,
    stateDistance,
    statesEqual,
    timeReversalT,
} from './logic';


/**
 * Each case checks an exact algebraic property of the discrete C, P, T
 * operators against the value group theory requires. Every `predicted` is
 * computed from the logic module, never hardcoded.
 *
 * - P, T and C are involutions, so squaring them returns the identity and the
 *   distance to the original state is 0.
 * - CPT applied to a reference state returns the analytically known CPT image
 *   (charge and species flipped, position inverted, momentum unchanged), so the
 *   distance to that image is 0.
 * - The CPT scalar invariant is preserved under CPT, so its change is 0.
 * - Exact CPT (eps = 0) leaves matter and antimatter balanced, so the
 *   asymmetry is 0.
 */
export function buildCalibration(): CalibrationResult[] {
    const s = referenceState();

    // P is an involution: P(P(s)) == s
    const ppDist = stateDistance(parityP(parityP(s)), s);

    // T is an involution: T(T(s)) == s
    const ttDist = stateDistance(timeReversalT(timeReversalT(s)), s);

    // C is an involution at the level of charge and species (boolean check)
    const ccBack = conjugateC(conjugateC(s));
    const ccIdentity = statesEqual(ccBack, s) ? 1 : 0;

    // CPT applied to s equals the analytically known image: charge -> -1,
    // species -> antimatter, position inverted, momentum unchanged.
    const cptImage = {
        x: -s.x,
        y: -s.y,
        vx: s.vx,
        vy: s.vy,
        charge: -s.charge,
        species: 'antimatter' as const,
    };
    const cptDist = stateDistance(applyCPT(s), cptImage);

    // CPT scalar invariant is preserved.
    const invariantDrift = Math.abs(cptInvariant(applyCPT(s)) - cptInvariant(s));

    // Exact CPT leaves matter and antimatter perfectly balanced.
    const balanced = matterAntimatterAsymmetry(0);

    return [
        {
            name: 'P is an involution',
            description: 'applying parity inversion twice returns the original state; distance to origin is 0.',
            predicted: Number(ppDist.toFixed(6)),
            expected: 0,
            source: 'parity is a Z2 reflection, P squared = identity (standard QFT)',
        },
        {
            name: 'T is an involution',
            description: 'reversing momenta twice restores the original state; distance is 0.',
            predicted: Number(ttDist.toFixed(6)),
            expected: 0,
            source: 'classical time reversal flips momentum; T squared = identity on this state',
        },
        {
            name: 'C is an involution',
            description: 'charge conjugation applied twice returns the same charge and species (boolean check, 1 = holds).',
            predicted: ccIdentity,
            expected: 1,
            source: 'particle / antiparticle exchange is self-inverse, C squared = identity',
        },
        {
            name: 'CPT maps to known image',
            description: 'C then P then T sends the reference state to its analytic CPT image; distance is 0.',
            predicted: Number(cptDist.toFixed(6)),
            expected: 0,
            source: 'composition of the three discrete operators (Luders, Pauli CPT theorem)',
        },
        {
            name: 'CPT invariant preserved',
            description: 'the scalar (charge times species sign) plus momentum-squared minus position-squared is unchanged by CPT.',
            predicted: Number(invariantDrift.toFixed(6)),
            expected: 0,
            source: 'CPT theorem: physical scalars are invariant under the combined operation',
        },
        {
            name: 'exact CPT balances species',
            description: 'with zero CPT-violating parameter, matter and antimatter fractions are equal, asymmetry is 0.',
            predicted: Number(balanced.toFixed(6)),
            expected: 0,
            source: 'unbroken CPT forbids a baryon asymmetry from the symmetry alone',
        },
    ];
}
