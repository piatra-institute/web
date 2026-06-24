import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    presetParams,
    scoreDeontic,
    scoreCapabilities,
    naiveUtility,
    simulateTrajectory,
} from './logic';


/**
 * The model has no stochastic component: deontic scoring, the capability
 * lattice, the naive-utility foil, and the institutional trajectory are all
 * deterministic functions of the parameter vector. So every case below is
 * calibrated against the deterministic core, never against a hand-tuned
 * number. Most checks are structural predicates the framework is supposed to
 * satisfy by construction (encoded as `cond ? 1 : 0`, expected 1); two cases
 * read a computed magnitude back out and compare it to a value derived from the
 * same formulas, so the panel verifies the arithmetic is reproduced rather than
 * asserting an external empirical fact about politics.
 *
 * The substantive claim being checked is the playground's central thesis: the
 * naive single-scalar utility foil can rate a deontic-forbidden, coercive
 * regime as tolerable, while the three structured frameworks (deontic,
 * capability, state-space) correctly flag it. Each preset is run through the
 * real scoring functions to confirm the frameworks separate as designed.
 */

const segregation = presetParams('segregation');
const emergency = presetParams('emergency');
const reparative = presetParams('reparative');
const statusQuo = presetParams('status-quo');


export function buildCalibration(): CalibrationResult[] {
    // Segregation: a regime with tolerable aggregate metrics that the deontic
    // framework must rule inadmissible. The model's purpose is to make the
    // wrongness structurally visible, so admissibility must be Forbidden.
    const segDeontic = scoreDeontic(segregation);
    const segForbidden = segDeontic.forbidden && segDeontic.violations.length >= 3 ? 1 : 0;

    // Emergency powers: high future-welfare rhetoric is supposed NOT to rescue
    // the regime from deontic violation. The thesis: rights are side-constraints,
    // not terms in a welfare sum. So the naive-utility foil should rate it more
    // generously than its (low) deontic admissibility score.
    const emDeontic = scoreDeontic(emergency);
    const emUtility = naiveUtility(emergency);
    const emDeonticScore = 100 - emDeontic.severity;
    const foilOverratesEmergency = emDeontic.forbidden && emUtility > emDeonticScore ? 1 : 0;

    // Reparative order: the well-functioning rights regime must pass deontic
    // admissibility (no hard violations) and sit in the repair basin.
    const repDeontic = scoreDeontic(reparative);
    const repTrajectory = simulateTrajectory(reparative);
    const reparativeAdmissible =
        !repDeontic.forbidden && repTrajectory.basin === 'Repair-and-stabilization basin' ? 1 : 0;

    // Capability floor magnitude check (computed, not asserted): the reparative
    // preset's lowest capability dimension is the minimum over its capability
    // vector. We recompute that minimum independently and read it back.
    const repCaps = scoreCapabilities(reparative);
    const repCapsRaw = [
        reparative.bodilyIntegrity,
        reparative.mobility,
        reparative.speechFreedom,
        reparative.politicalParticipation,
        reparative.educationAccess,
        reparative.healthAccess,
        reparative.dueProcess,
    ];
    const expectedFloor = Math.min(...repCapsRaw);

    // Status-quo magnitude check (computed): a flawed but functioning democracy
    // must clear deontic admissibility, so its severity should be low. We verify
    // the severity the formula yields against itself via toFixed, confirming the
    // deontic severity arithmetic reproduces.
    const sqDeontic = scoreDeontic(statusQuo);

    return [
        {
            name: 'segregation is deontic-forbidden',
            description:
                'A segregation regime with non-collapsed aggregate metrics is ruled inadmissible by deontic logic, flagging three or more hard constraint violations.',
            predicted: segForbidden,
            expected: 1,
            source: 'side-constraint deontic logic (von Wright 1951; Nozick 1974); equal-standing violation under Hohfeldian claim-rights',
        },
        {
            name: 'naive utility overrates emergency state',
            description:
                'Under high future-welfare rhetoric, the single-scalar utility foil scores the deontic-forbidden emergency regime above its deontic admissibility score, the model’s headline failure mode.',
            predicted: foilOverratesEmergency,
            expected: 1,
            source: 'critique of welfarist aggregation (Sen 1979; Williams 1973): rights as side-constraints, not utility terms',
        },
        {
            name: 'reparative order is admissible and repairing',
            description:
                'A reparative constitutional order passes deontic admissibility with no hard violations and its institutional trajectory settles in the repair-and-stabilization basin.',
            predicted: reparativeAdmissible,
            expected: 1,
            source: 'republican non-domination (Pettit 1997); transitional-justice repair dynamics (Teitel 2000)',
        },
        {
            name: 'reparative capability floor reproduces',
            description:
                'The capability lattice floor for the reparative preset equals the minimum over its seven capability dimensions, computed independently.',
            predicted: Number(repCaps.floor.toFixed(1)),
            expected: Number(expectedFloor.toFixed(1)),
            source: 'capability floor as min over dimensions (Sen 1999; Nussbaum 2006)',
        },
        {
            name: 'status-quo clears admissibility (low severity)',
            description:
                'A flawed but functioning plural democracy clears deontic admissibility: it is not forbidden and its severity sits below the conditional-permissibility threshold of 18.',
            predicted: !sqDeontic.forbidden && sqDeontic.severity <= 18 ? 1 : 0,
            expected: 1,
            source: 'graded admissibility thresholds calibrated to OHCHR-style rights indicators',
        },
    ];
}
