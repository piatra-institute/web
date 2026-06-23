// Eye evolution as a fitness-driven walk through eye types. Organisms carry three
// continuous traits (visual acuity, light sensitivity, field of view); their
// composite determines an eye type along Nilsson and Pelger's classic sequence
// (no eye -> eyespot -> pit -> pinhole -> lens), and fitness combines a per-type
// base with environmental bonuses minus a metabolic penalty. These pure functions
// mirror the exact formulas the Viewer uses; the simulation drives mutation and
// selection on top of them.

export enum EyeType {
    None = 'None',
    Eyespot = 'Eyespot',
    PitEye = 'Pit Eye',
    PinholeEye = 'Pinhole Eye',
    LensEye = 'Lens Eye',
    CompoundEye = 'Compound Eye',
}

export const clamp = (x: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, x));

export interface Thresholds {
    eyespot: number; pitEye: number; pinhole: number; lens: number; compound: number;
}

export interface Environment {
    lightIntensity: number;
    environmentComplexity: number;
    predatorPresence: number;
}

// classify by the mean of the three traits against ascending thresholds
export function determineEyeType(
    visualAcuity: number, lightSensitivity: number, fieldOfView: number, t: Thresholds,
): EyeType {
    const compositeScore = (visualAcuity + lightSensitivity + fieldOfView) / 3;
    if (compositeScore < t.eyespot) return EyeType.None;
    if (compositeScore < t.pitEye) return EyeType.Eyespot;
    if (compositeScore < t.pinhole) return EyeType.PitEye;
    if (compositeScore < t.lens) return EyeType.PinholeEye;
    if (compositeScore < t.compound) return EyeType.LensEye;
    return EyeType.CompoundEye;
}

const BASE_FITNESS: Record<EyeType, number> = {
    [EyeType.None]: 0.1,
    [EyeType.Eyespot]: 0.3,
    [EyeType.PitEye]: 0.5,
    [EyeType.PinholeEye]: 0.7,
    [EyeType.LensEye]: 0.85,
    [EyeType.CompoundEye]: 0.8,
};

export interface Traits {
    eyeType: EyeType;
    visualAcuity: number;
    lightSensitivity: number;
    fieldOfView: number;
    metabolicCost: number;
}

// fitness = base(eyeType) + light + complexity + predator bonuses - metabolic cost, clamped to [0,1]
export function calculateFitness(t: Traits, env: Environment): number {
    const base = BASE_FITNESS[t.eyeType];
    const lightBonus = env.lightIntensity * (t.lightSensitivity * 0.3);
    const complexityBonus = env.environmentComplexity * (t.visualAcuity * 0.4);
    const predatorBonus = env.predatorPresence * (t.fieldOfView * 0.3);
    const metabolicPenalty = t.metabolicCost * 0.2;
    return clamp(base + lightBonus + complexityBonus + predatorBonus - metabolicPenalty, 0, 1);
}
