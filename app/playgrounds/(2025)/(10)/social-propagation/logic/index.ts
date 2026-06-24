/**
 * Pure functions for the mean-field social propagation model used by the Viewer.
 *
 * The Viewer runs a discrete-time mean-field branching process. These functions
 * extract the deterministic core of that process so it can be reasoned about,
 * calibrated, and reused. They are the noise-free skeleton of the same dynamics:
 *
 *   - basicReproduction: R0 = avgDegree * shareProb * amplification
 *   - effectiveReproduction: R_eff = R0 * degreeFactor * shareProbFactor * coolupIgnitionDamp
 *   - spreads above the epidemic threshold R_eff = 1
 *   - freshnessFactor: novelty decay 2^(-age / halfLife)
 *   - effectiveConversion: convProb * gatingFactor * freshnessFactor
 *   - logisticFinalSize: saturating final reach against a finite audience
 */


export interface CoreParams {
    avgDegree: number;
    shareProb: number;
    amplification: number;
}

export interface PolicyFactors {
    /** degree multiplier (forward caps halve fan-out) */
    degreeFactor: number;
    /** share-probability multiplier (question gating) */
    shareProbFactor: number;
    /** ignition damping from delayed visibility (coolup) */
    coolupIgnitionDamp: number;
}


/**
 * Basic reproduction number of a fresh seed: how many further shares one share
 * produces in a fully susceptible audience. This is the branching analogue of
 * the epidemic R0 = (contacts) x (transmission probability per contact).
 */
export function basicReproduction(p: CoreParams): number {
    return p.avgDegree * p.shareProb * p.amplification;
}


/**
 * Effective reproduction number after policy friction is applied. R_eff is what
 * actually governs growth once forward caps, gating, and delayed visibility act.
 */
export function effectiveReproduction(p: CoreParams, f: PolicyFactors): number {
    const r0 = basicReproduction(p);
    return Math.max(0, r0 * f.degreeFactor * f.shareProbFactor * f.coolupIgnitionDamp);
}


/**
 * Epidemic threshold test. A cascade is supercritical (self-sustaining, growing)
 * if and only if R_eff > 1; at or below 1 it is subcritical and dies out.
 */
export function isSupercritical(rEff: number): boolean {
    return rEff > 1;
}


/**
 * Novelty / attention decay. Content of a given age has its persuasive potency
 * discounted by a half-life: every halfLife minutes the factor halves.
 */
export function freshnessFactor(ageMinutes: number, halfLifeMinutes: number): number {
    return Math.pow(2, -ageMinutes / Math.max(1, halfLifeMinutes));
}


/**
 * Per-exposure conversion probability after gating skepticism and freshness
 * decay are folded in. This is the per-contact "successful manipulation"
 * probability used by the PMI accumulator.
 */
export function effectiveConversion(
    convProb: number,
    gatingFactor: number,
    ageMinutes: number,
    halfLifeMinutes: number,
): number {
    return convProb * gatingFactor * freshnessFactor(ageMinutes, halfLifeMinutes);
}


/**
 * Final attack-rate fraction for a supercritical cascade: the fraction of the
 * audience eventually reached. In a finite audience the per-step multiplier is
 * R_eff * s with susceptible fraction s = 1 - reach/N, so growth halts at the
 * fixed point where R_eff * s = 1, giving reach* / N = 1 - 1/R_eff. This is the
 * deterministic giant-component size of a branching process above threshold and
 * the social-contagion analogue of the SIR final-size relation. Returns 0 at or
 * below the epidemic threshold R_eff = 1.
 */
export function finalSizeFraction(rEff: number): number {
    if (rEff <= 1) return 0;
    return 1 - 1 / rEff;
}


/**
 * Saturating final reach in absolute users: the final-size fraction scaled by a
 * finite audience N. Above threshold this is N * (1 - 1/R_eff); at or below it,
 * the cascade does not self-sustain and the final reach is taken as 0.
 */
export function logisticFinalSize(rEff: number, audienceSize: number): number {
    return Math.min(audienceSize, audienceSize * finalSizeFraction(rEff));
}


/**
 * Linear-threshold (complex contagion) activation. A node adopts only when the
 * fraction of its neighbours that are already active reaches its threshold theta.
 */
export function thresholdActivation(activeNeighborFraction: number, theta: number): boolean {
    return activeNeighborFraction >= theta;
}


/**
 * Posting rate actually allowed per agent per day once cooldown and election
 * windows clamp the baseline rate. Mirrors the Viewer's seed-ingress logic.
 */
export function allowedPostsPerDay(
    baselinePostsPerDay: number,
    cooldown10h: boolean,
    election1hWindow: boolean,
): number {
    const capPerDay = cooldown10h ? 2.4 : baselinePostsPerDay;
    const electionCap = election1hWindow ? 1 : capPerDay;
    return Math.min(baselinePostsPerDay, electionCap);
}
