import { numericKAtOrigin } from './logic';
import type { CalibrationResult } from '@/components/CalibrationPanel';


/**
 * Validate the finite-difference curvature method against conformal metrics of
 * known constant Gaussian curvature. For ds^2 = Omega^2 (dx^2 + dy^2):
 *   Omega = 2c / (1 + r^2)  has constant K = +1 / c^2  (round sphere),
 *   Omega = 2  / (1 - r^2)  has constant K = -1         (Poincare disk).
 * The model reads only Omega(x, y); the expected value is the analytic K.
 */
export interface CurvatureCase {
    name: string;
    description: string;
    omega: (x: number, y: number) => number;
    expected: number;
    source: string;
}


export const CURVATURE_CASES: CurvatureCase[] = [
    {
        name: 'round sphere (R = 1)',
        description: 'Omega = 2 / (1 + r^2), constant K = +1',
        omega: (x, y) => 2 / (1 + x * x + y * y),
        expected: 1,
        source: 'stereographic projection of the unit sphere',
    },
    {
        name: 'round sphere (R = 2)',
        description: 'Omega = 4 / (1 + r^2), constant K = +1/4',
        omega: (x, y) => 4 / (1 + x * x + y * y),
        expected: 0.25,
        source: 'stereographic projection, radius 2',
    },
    {
        name: 'round sphere (R = 1/2)',
        description: 'Omega = 1 / (1 + r^2), constant K = +4',
        omega: (x, y) => 1 / (1 + x * x + y * y),
        expected: 4,
        source: 'stereographic projection, radius 1/2',
    },
    {
        name: 'Poincare disk',
        description: 'Omega = 2 / (1 - r^2), constant K = -1',
        omega: (x, y) => 2 / (1 - (x * x + y * y)),
        expected: -1,
        source: 'hyperbolic plane, conformal disk model',
    },
];


export function buildCalibration(): CalibrationResult[] {
    return CURVATURE_CASES.map((c) => ({
        name: c.name,
        description: c.description,
        predicted: Number(numericKAtOrigin(c.omega).toFixed(4)),
        expected: c.expected,
        source: c.source,
    }));
}
