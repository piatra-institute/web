import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    contactNormalForce,
    nandBit,
    grainRadius,
    nandRowsMatched,
    nand,
    outputCorrect,
} from './logic';


/**
 * Every `predicted` below is COMPUTED by the pure functions in ./logic, never
 * hand-written. The stochastic packing and the live time-integration are not
 * calibrated (they depend on Math.random and on accumulated state); instead we
 * calibrate the deterministic core the whole playground is built around: the
 * contact normal-force law, the NAND truth table, the output correctness check,
 * and the packing-geometry estimate. Expected values are exact analytic targets.
 */
export function buildCalibration(): CalibrationResult[] {
    const results: CalibrationResult[] = [];

    // 1. Contact force at a known overlap. With overlap = 0.25 and stiffness =
    //    1000, the square-root law gives sqrt(0.25)*1000 = 0.5*1000 = 500.
    {
        const predicted = contactNormalForce(0.25, 1000);
        results.push({
            name: 'contact force · sqrt law',
            description:
                'Hertz-style normal force at overlap 0.25, stiffness 1000: sqrt(0.25)*1000.',
            predicted: Number(predicted.toFixed(2)),
            expected: 500,
            source: 'square-root contact law F = sqrt(overlap) * k used by the granular Viewer',
        });
    }

    // 2. No contact, no force. Grains that do not overlap transmit nothing, so
    //    the force is exactly zero at the moment of separation.
    {
        const predicted = contactNormalForce(0, 1000);
        results.push({
            name: 'no overlap · no force',
            description:
                'two grains exactly touching (overlap 0) transmit no normal force.',
            predicted: Number(predicted.toFixed(2)),
            expected: 0,
            source: 'contact law returns 0 for overlap <= 0 (no force without contact)',
        });
    }

    // 3. NAND on the all-ones row. NAND(1,1) = 0, the one input that pulls the
    //    gate output low; this is the row that distinguishes NAND from a constant.
    {
        const predicted = nandBit(true, true);
        results.push({
            name: 'NAND · both inputs high',
            description:
                'the output grain reports 0 only when both inputs are high: NAND(1,1) = 0.',
            predicted,
            expected: 0,
            source: 'NAND truth table; the single low row of the gate',
        });
    }

    // 4. NAND is functionally complete only if it matches all four rows. The
    //    candidate gate must reproduce every row of the reference NAND, scoring 4.
    {
        const predicted = nandRowsMatched(nand);
        results.push({
            name: 'NAND · all four rows',
            description:
                'an evolved channel implements NAND only if it matches all four truth-table rows.',
            predicted,
            expected: 4,
            source: 'exhaustive check over {00, 01, 10, 11} against the reference NAND',
        });
    }

    // 5. Packing geometry. With packing fraction 0.64 over a unit-area container
    //    and 64 grains, each grain occupies area 0.64/64 = 0.01, giving radius
    //    sqrt(0.01/pi) ~= 0.0564. We re-derive the count from that radius and
    //    expect to recover 64 grains, certifying the geometry round-trips.
    {
        const r = grainRadius(0.64, 1, 64);
        const grainArea = Math.PI * r * r;
        const recoveredCount = (0.64 * 1) / grainArea;
        results.push({
            name: 'packing geometry · round trip',
            description:
                'radius from packing fraction 0.64 over 64 grains, then count re-derived from that radius.',
            predicted: Number(recoveredCount.toFixed(2)),
            expected: 64,
            source: 'random close packing phi ~ 0.64; area conservation phi*A = N*pi*r^2',
        });
    }

    // 6. Output correctness. When both channels report exactly the NAND target
    //    for their inputs, the output grain is correct (returns 1).
    {
        const in1 = { a: true, b: false };
        const in2 = { a: true, b: true };
        const reported1 = nandBit(in1.a, in1.b); // 1
        const reported2 = nandBit(in2.a, in2.b); // 0
        const predicted = outputCorrect(reported1, reported2, in1, in2);
        results.push({
            name: 'output grain · correct multiplex',
            description:
                'both frequency channels reporting their NAND targets yields a correct output (1).',
            predicted,
            expected: 1,
            source: 'output correctness = channel-1 bit and channel-2 bit both match NAND',
        });
    }

    return results;
}
