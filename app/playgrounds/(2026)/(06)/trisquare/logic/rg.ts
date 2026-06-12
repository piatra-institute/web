/**
 * One-loop renormalisation-group flow of the 4D phi-fourth coupling:
 *   d(lambda) / d(ln mu) = 3 lambda^2 / (16 pi^2).
 *
 * The closed-form solution is
 *   lambda(t) = lambda0 / (1 - (3 lambda0 / 16 pi^2) t),    t = ln(mu / mu0),
 * which develops a Landau pole at t* = 16 pi^2 / (3 lambda0).
 */

const SIXTEEN_PI_SQ = 16 * Math.PI * Math.PI;


export function betaCoefficient(): number {
    return 3 / SIXTEEN_PI_SQ;
}


export function landauPole(lambda0: number): number {
    if (lambda0 <= 0) return Infinity;
    return SIXTEEN_PI_SQ / (3 * lambda0);
}


export interface RGDatum {
    /** t = ln(mu / mu0), the log of the renormalisation scale. */
    t: number;
    /** running coupling lambda(t). */
    lambda: number;
}


export function lambdaAt(lambda0: number, t: number): number {
    const denom = 1 - betaCoefficient() * lambda0 * t;
    if (denom <= 0) return Infinity;
    return lambda0 / denom;
}


export function computeRGFlow(lambda0: number, tMax = 80, steps = 120): RGDatum[] {
    const data: RGDatum[] = [];
    const pole = landauPole(lambda0);
    // stop a little short of the pole so the chart stays readable.
    const tEnd = Math.min(tMax, pole > 0 && Number.isFinite(pole) ? pole * 0.985 : tMax);
    for (let i = 0; i <= steps; i++) {
        const t = (tEnd * i) / steps;
        const lambda = lambdaAt(lambda0, t);
        if (!Number.isFinite(lambda) || lambda > 50) break;
        data.push({ t: Number(t.toFixed(2)), lambda: Number(lambda.toFixed(4)) });
    }
    return data;
}
