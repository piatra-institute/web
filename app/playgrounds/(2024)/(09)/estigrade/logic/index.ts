// The estigrade rule. A student estimates their exam score before sitting it;
// the final grade rewards a close estimate and penalizes a far one:
//   final = exam + reward * (100 - |exam - estimate|) - penalty * |exam - estimate|
// truncated to an integer, matching the original calculator. Pure functions used
// by both the calculator and the calibration.

export interface EstigradeParams {
    estimatedGrade: number;
    examGrade: number;
    reward: number;
    penalty: number;
}

export function gradeDifference(examGrade: number, estimatedGrade: number): number {
    return Math.abs(examGrade - estimatedGrade);
}

export function computeFinalGrade(p: EstigradeParams): number {
    const diff = gradeDifference(p.examGrade, p.estimatedGrade);
    const raw = p.examGrade + p.reward * (100 - diff) - p.penalty * diff;
    return parseInt(raw.toFixed(2), 10);
}
