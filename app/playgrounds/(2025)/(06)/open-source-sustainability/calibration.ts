import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    calculatePhaseCoordinates,
    determineLicenseState,
    defaultCoefficients,
} from './logic';


/**
 * The live playground has two halves: a deterministic core and a stochastic
 * sandbox loop. The sandbox (Math.random shocks, drifting cloud pressure) is not
 * calibratable. The deterministic core is: calculatePhaseCoordinates maps the
 * four state variables (community, donations, cloud, maturity) to a (pressure,
 * support) point, and determineLicenseState applies the resource-shifted phase
 * boundary to that point. Both are pure functions with no randomness, so this
 * file calibrates only them.
 *
 * Two kinds of case appear below. Float cases pin an exact closed-form output
 * (a support or pressure score) so any drift in the formula is caught. Boolean
 * cases check that the license verdict for a configuration matches the regime
 * the model is meant to express (permissive when support clears the boundary,
 * restrictive when it does not); these report 1 when the verdict matches.
 *
 * Honesty note: with the default coefficients the support term saturates at 100
 * and the squared, resistance-damped pressure term stays low, so well-resourced
 * real projects (Redis, Elastic, MongoDB at their license-change endpoints) are
 * all scored "permissive" by this core even though they moved to restrictive
 * licences. The model reproduces the permissive/restrictive split only for the
 * resource extremes, not for those mid-range commercial cases. The boolean
 * cases here are therefore configurations the core actually separates, not the
 * historical transitions it fails to capture.
 */


const C = defaultCoefficients;


interface FloatCase {
    kind: 'float';
    name: string;
    description: string;
    source: string;
    expected: number;
    compute: () => number;
}

interface BoolCase {
    kind: 'bool';
    name: string;
    description: string;
    source: string;
    compute: () => boolean;
}

type Case = FloatCase | BoolCase;


const CASES: Case[] = [
    {
        kind: 'float',
        name: 'support score · neutral state',
        description:
            'with every variable at the midpoint (50) the support score is sqrt of the averaged community and donation effects times the synergy factor, capped at 100.',
        source: 'closed form: 100 * sqrt((communityEffect + donationEffect) / 200 * synergyFactor)',
        expected: 76.65,
        compute: () => calculatePhaseCoordinates(50, 50, 50, 50, C).y,
    },
    {
        kind: 'float',
        name: 'pressure score · PostgreSQL endpoint',
        description:
            'a high-maturity, strong-community, low-funding project (community 98, funding 60, cloud 60, maturity 98) keeps pressure low because the multiplicative resistance damps the squared cloud term.',
        source: 'pressureScore = (cloud * communityResistance * financialBuffer * maturityInertia)^2 / 100',
        expected: 5.16,
        compute: () => calculatePhaseCoordinates(98, 60, 60, 98, C).x,
    },
    {
        kind: 'float',
        name: 'pressure score · abandoned project',
        description:
            'a weak project under maximal cloud competition (community 10, funding 10, cloud 100, maturity 10) has almost no resistance, so the squared cloud term dominates and pressure climbs.',
        source: 'pressureScore with near-unit resistance factors',
        expected: 85.86,
        compute: () => calculatePhaseCoordinates(10, 10, 100, 10, C).x,
    },
    {
        kind: 'float',
        name: 'support score · mature donor-light project',
        description:
            'high community and maturity with modest funding (community 90, funding 30, cloud 40, maturity 90) still produce strong support because the community effect is scaled up by maturity.',
        source: 'supportScore with maturity-amplified community and donation effects',
        expected: 89.72,
        compute: () => calculatePhaseCoordinates(90, 30, 40, 90, C).y,
    },
    {
        kind: 'bool',
        name: 'verdict · well-resourced stays permissive',
        description:
            'a mature, strong-community project under light pressure (community 90, funding 30, cloud 40, maturity 90) clears the resource-shifted boundary and is scored permissive.',
        source: 'determineLicenseState on the computed (support, pressure) point; expected permissive',
        compute: () => {
            const r = calculatePhaseCoordinates(90, 30, 40, 90, C);
            return determineLicenseState(r.y, r.x, 90, 90, 30).isPermissive === true;
        },
    },
    {
        kind: 'bool',
        name: 'verdict · weak project under pressure goes restrictive',
        description:
            'a fragile project facing heavy cloud competition (community 20, funding 15, cloud 95, maturity 15) falls below the boundary and is scored restrictive.',
        source: 'determineLicenseState on the computed point; expected restrictive (not permissive)',
        compute: () => {
            const r = calculatePhaseCoordinates(20, 15, 95, 15, C);
            return determineLicenseState(r.y, r.x, 15, 20, 15).isPermissive === false;
        },
    },
];


export function buildCalibration(): CalibrationResult[] {
    return CASES.map((c) => {
        if (c.kind === 'float') {
            return {
                name: c.name,
                description: c.description,
                predicted: Number(c.compute().toFixed(2)),
                expected: c.expected,
                source: c.source,
            };
        }
        return {
            name: c.name,
            description: c.description,
            predicted: c.compute() ? 1 : 0,
            expected: 1,
            source: c.source,
        };
    });
}
