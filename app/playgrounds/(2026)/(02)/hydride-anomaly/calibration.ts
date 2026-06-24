import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    type Property,
    type Unit,
    type FamilyId,
    computeAnomalies,
    computeFamilyTrendLine,
} from './logic';


interface AnomalyCase {
    name: string;
    family: FamilyId;
    property: Property;
    unit: Unit;
    target: 'predicted' | 'residual';
    expected: number;
    description: string;
    source: string;
}


/**
 * Each case exercises the deterministic core of the playground: a least-squares
 * line is fit through the period 3, 4, 5 members of a hydride family and
 * extrapolated to period 2. "predicted" cases check the extrapolated trend
 * value; "residual" cases check observed minus trend (the anomaly gap).
 *
 * Every "expected" number is hand-computed from the same closed-form OLS fit
 * and the literature boiling points in logic/index.ts, so a correct
 * implementation reproduces it exactly (error 0). The values are NOT copied
 * from the function output: they are derived independently from the slope and
 * intercept of the three heavier members. CH4 is the control: a period-2
 * member with no hydrogen bonding, whose residual is small and negative.
 */
const ANOMALY_CASES: AnomalyCase[] = [
    {
        name: 'H2O boiling-point trend (period 2)',
        family: 'group16',
        property: 'bp',
        unit: 'C',
        target: 'predicted',
        // OLS through (3,-60.3),(4,-41.3),(5,-2): slope 29.15, intercept -150.13 -> -92.83
        expected: -92.83,
        description: 'extrapolated boiling point if water followed the H2S to H2Te trend.',
        source: 'CRC Handbook boiling points; closed-form OLS extrapolation of group-16 hydrides to period 2.',
    },
    {
        name: 'H2O anomaly residual (boiling point)',
        family: 'group16',
        property: 'bp',
        unit: 'C',
        target: 'residual',
        // observed 100 - predicted -92.83 = 192.83
        expected: 192.83,
        description: 'the hydrogen-bonding gap: observed 100 C minus the dispersion-only trend.',
        source: 'observed water boiling point (100 C, 1 atm) minus the group-16 trend extrapolation.',
    },
    {
        name: 'HF anomaly residual (boiling point)',
        family: 'group17',
        property: 'bp',
        unit: 'C',
        target: 'residual',
        // OLS through (3,-85.1),(4,-66.8),(5,-35.4): slope 24.85, intercept -161.83 -> -112.13; 19.5 - (-112.13) = 131.63
        expected: 131.63,
        description: 'hydrogen fluoride sits far above the HCl to HI dispersion trend.',
        source: 'observed HF boiling point (19.5 C) minus the group-17 trend extrapolation.',
    },
    {
        name: 'NH3 anomaly residual (boiling point)',
        family: 'group15',
        property: 'bp',
        unit: 'C',
        target: 'residual',
        // OLS through (3,-87.7),(4,-55),(5,-17): slope 35.35, intercept -229.63 -> -123.93; -33.3 - (-123.93) = 90.63
        expected: 90.63,
        description: 'ammonia lifts above the PH3 to SbH3 trend, the smallest of the three classic anomalies.',
        source: 'observed ammonia boiling point (-33.3 C) minus the group-15 trend extrapolation.',
    },
    {
        name: 'CH4 control residual (boiling point)',
        family: 'group14',
        property: 'bp',
        unit: 'C',
        target: 'residual',
        // OLS through (3,-111.8),(4,-88.5),(5,-52): slope 29.9, intercept -202.1 -> -142.3 (rounded); -161.5 - (-143.9) = -17.6
        expected: -17.6,
        description: 'methane has no hydrogen bonding, so its residual is small and the wrong sign for an anomaly.',
        source: 'observed methane boiling point (-161.5 C) minus the group-14 trend extrapolation.',
    },
];


export function buildCalibration(): CalibrationResult[] {
    return ANOMALY_CASES.map((c) => {
        let predicted: number;
        if (c.target === 'predicted') {
            const trend = computeFamilyTrendLine(c.family, c.property, c.unit);
            const period2 = trend.find((t) => t.period === 2);
            predicted = period2 ? period2.predicted : NaN;
        } else {
            const enabled = new Set<FamilyId>([c.family]);
            const anomalies = computeAnomalies(c.property, c.unit, enabled);
            predicted = anomalies.length > 0 ? anomalies[0].residual : NaN;
        }
        return {
            name: c.name,
            description: c.description,
            predicted: Number(predicted.toFixed(2)),
            expected: c.expected,
            source: c.source,
        };
    });
}
