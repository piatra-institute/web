import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    kuramotoOrder,
    reportStabilityLaw,
    evenlySpacedPhases,
    alignedPhases,
} from './logic';

/**
 * The live simulation is stochastic: phases are seeded randomly and a noise
 * jitter is added every step, so a full run is not reproducible. What IS exact
 * and reproducible is the deterministic core the model is built on, so the
 * calibration targets that core rather than any particular noisy trajectory.
 *
 * Two laws are checked:
 *
 *  - the Kuramoto order parameter r = |mean(exp(i*theta))|, which has known
 *    closed-form values for aligned phases (r = 1) and for phases spread
 *    evenly around the circle (r = 0);
 *
 *  - the report-stability law,
 *    reportStability = clamp01( syncApex * (0.55 + 0.45*B) * (0.6 + 0.4*C) ),
 *    evaluated at hand-worked operating points.
 *
 * Every `predicted` below is computed by the logic functions; the `expected`
 * column is the analytic ground truth worked out independently.
 */


interface KuramotoCase {
    name: string;
    phases: number[];
    expected: number;
    description: string;
}

interface ReportCase {
    name: string;
    syncApex: number;
    bandwidth: number;
    avgCoh: number;
    expected: number;
    description: string;
}


// --- Kuramoto order parameter, exact endpoints -----------------------------

const KURAMOTO_CASES: KuramotoCase[] = [
    {
        name: 'sync · aligned ensemble (r = 1)',
        phases: alignedPhases(8),
        expected: 1,
        description:
            'eight oscillators at identical phase. all unit vectors point the same way, so the order parameter is exactly 1 (a maximally coherent observer window).',
    },
    {
        name: 'sync · evenly spread (r = 0)',
        phases: evenlySpacedPhases(6),
        expected: 0,
        description:
            'six phases spaced 60 degrees apart cancel by symmetry, giving order 0 (an incoherent window that cannot integrate).',
    },
    {
        name: 'sync · antiphase pair (r = 0)',
        phases: [0, Math.PI],
        expected: 0,
        description:
            'two oscillators exactly out of phase sum to the zero vector, the smallest degenerate observer window.',
    },
];


// --- Report-stability law, hand-worked operating points --------------------

const REPORT_CASES: ReportCase[] = [
    {
        name: 'report · apex collapse',
        syncApex: 0,
        bandwidth: 0.65,
        avgCoh: 0.6,
        expected: 0,
        description:
            'with zero apex synchrony the product is zero: no coherent top-level window means no stable report, whatever the bandwidth.',
    },
    {
        name: 'report · saturated apex',
        syncApex: 1,
        bandwidth: 1,
        avgCoh: 1,
        expected: 1,
        description:
            'perfect apex synchrony, full bandwidth, full coherence: 1 * 1.0 * 1.0 = 1, the ceiling of a unitary report.',
    },
    {
        name: 'report · mid operating point',
        syncApex: 0.8,
        bandwidth: 0.65,
        avgCoh: 0.6,
        expected: 0.5662,
        description:
            'a typical run: 0.8 * (0.55 + 0.45*0.65) * (0.6 + 0.4*0.6) = 0.8 * 0.8425 * 0.84.',
    },
    {
        name: 'report · narrow bandwidth floor',
        syncApex: 0.5,
        bandwidth: 0,
        avgCoh: 0,
        expected: 0.165,
        description:
            'half apex synchrony with bandwidth and coherence at their floors: 0.5 * 0.55 * 0.6, the minimum non-trivial report.',
    },
];


export function buildCalibration(): CalibrationResult[] {
    const kuramoto: CalibrationResult[] = KURAMOTO_CASES.map((c) => ({
        name: c.name,
        description: c.description,
        predicted: Number(kuramotoOrder(c.phases).toFixed(4)),
        expected: c.expected,
        source: 'Kuramoto order parameter r = |(1/N) sum exp(i*theta_j)|; exact endpoints',
    }));

    const report: CalibrationResult[] = REPORT_CASES.map((c) => ({
        name: c.name,
        description: c.description,
        predicted: Number(reportStabilityLaw(c.syncApex, c.bandwidth, c.avgCoh).toFixed(4)),
        expected: c.expected,
        source: 'report-stability law: clamp01(syncApex*(0.55+0.45*B)*(0.6+0.4*C))',
    }));

    return [...kuramoto, ...report];
}
