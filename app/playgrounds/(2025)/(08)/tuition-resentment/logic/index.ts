/**
 * Deterministic core of the tuition-resentment attribution model.
 *
 * The Viewer steps a discrete-time loop, but every quantity it plots is a pure,
 * deterministic function of the parameters and the current reputation. There is
 * no randomness anywhere in the model, so the whole core is reproducible and
 * calibratable. These functions replicate, term for term, the math the Viewer
 * computes in calculateStep.
 */

export const clamp = (x: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, x));

export const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));


/** Fixed model coefficients, mirrored from the Viewer. */
export const coefficients = {
    b0: 5,
    b1: 0.0005,
    b2: 0.5,
    b3: 0.5,
    b4: 0.6,
    theta0: -5,
    theta1: 0.05,
    theta2: 0.05,
    theta3: 0.04,
    gammaG: 0.35,
    rho: 0.90,
    psi1: 0.15,
    psi2: 8.0,
    psi4: 6.0,
    gradePenaltyThreshold: 65,
} as const;


export interface ModelInputs {
    tuition: number;
    marketing: number;
    prestige: number;
    gradeLeniency: number;
    qualityInvest: number;
    powerAsymmetry: number;
    identityInternalization: number;
    socialComparison: number;
    gradeAudit: boolean;
    aidShock: boolean;
    rankingDrop: boolean;
    qualityProgram: boolean;
}

export interface StepResult {
    t: number;
    tuition: number;
    expectation: number;
    trueQuality: number;
    observedQuality: number;
    dissonance: number;
    lambda: number;
    internalResentment: number;
    externalResentment: number;
    complaints: number;
    reputation: number;
    nextReputation: number;
    penalty: number;
}


/** Expectation E, the cost-and-signal-driven anticipated value, clamped to [0,100]. */
export function expectation(
    tuition: number,
    marketing: number,
    prestige: number,
    reputation: number,
): number {
    return clamp(
        coefficients.b0 +
            coefficients.b1 * tuition +
            coefficients.b2 * marketing +
            coefficients.b3 * prestige +
            coefficients.b4 * reputation,
        0,
        100,
    );
}

/** True (hidden) quality as a function of genuine quality investment. */
export function trueQuality(qualityInvest: number): number {
    return clamp(50 + 0.5 * qualityInvest, 0, 100);
}

/** Observed quality: true quality lifted by grade leniency (grade inflation). */
export function observedQuality(qualityInvest: number, gradeLeniency: number): number {
    return clamp(trueQuality(qualityInvest) + coefficients.gammaG * gradeLeniency, 0, 100);
}

/** Dissonance D = max(0, E - Q_observed). */
export function dissonance(exp: number, obs: number): number {
    return Math.max(0, exp - obs);
}

/**
 * Attribution mixer lambda = sigma(theta0 + theta1*Power + theta2*Identity +
 * theta3*SocialComparison). lambda -> 1 is self-blame, lambda -> 0 is
 * institutional blame.
 */
export function lambda(
    powerAsymmetry: number,
    identityInternalization: number,
    socialComparison: number,
): number {
    return sigmoid(
        coefficients.theta0 +
            coefficients.theta1 * powerAsymmetry +
            coefficients.theta2 * identityInternalization +
            coefficients.theta3 * socialComparison,
    );
}

/** Complaint propensity in percent, raised by external resentment, damped by power. */
export function complaints(externalResentment: number, powerAsymmetry: number): number {
    return sigmoid(-2.0 + 0.08 * externalResentment - 0.05 * powerAsymmetry) * 100;
}

/** Reputation penalty applied when a grade audit catches leniency above threshold. */
export function gradePenalty(gradeLeniency: number, gradeAudit: boolean): number {
    return gradeAudit && gradeLeniency > coefficients.gradePenaltyThreshold
        ? (gradeLeniency - coefficients.gradePenaltyThreshold) / 5
        : 0;
}


/**
 * One deterministic timestep, identical to the Viewer's calculateStep. Scenario
 * switches (aid shock at t>=4, ranking drop at t==6, quality program at t>=5)
 * are applied here so the closed-form core stays the single source of truth.
 */
export function calculateStep(t: number, reputation: number, inputs: ModelInputs): StepResult {
    const currentTuition = inputs.aidShock && t >= 4 ? inputs.tuition * 0.8 : inputs.tuition;
    const currentPrestige = inputs.prestige + (inputs.rankingDrop && t === 6 ? -20 : 0);
    const currentQualityInvest =
        inputs.qualityProgram && t >= 5
            ? clamp(inputs.qualityInvest + 15, 0, 100)
            : inputs.qualityInvest;

    const exp = expectation(currentTuition, inputs.marketing, currentPrestige, reputation);
    const tq = trueQuality(currentQualityInvest);
    const obs = observedQuality(currentQualityInvest, inputs.gradeLeniency);
    const diss = dissonance(exp, obs);
    const lam = lambda(inputs.powerAsymmetry, inputs.identityInternalization, inputs.socialComparison);
    const internalResentment = lam * diss;
    const externalResentment = (1 - lam) * diss;
    const comp = complaints(externalResentment, inputs.powerAsymmetry);

    const penalty = gradePenalty(inputs.gradeLeniency, inputs.gradeAudit);
    const placement = 0.1 * (tq - 50);
    const nextReputation = clamp(
        coefficients.rho * reputation +
            coefficients.psi1 * (tq - 50) -
            coefficients.psi2 * (comp / 100) -
            coefficients.psi4 * penalty +
            placement,
        0,
        100,
    );

    return {
        t,
        tuition: currentTuition,
        expectation: exp,
        trueQuality: tq,
        observedQuality: obs,
        dissonance: diss,
        lambda: lam,
        internalResentment,
        externalResentment,
        complaints: comp,
        reputation,
        nextReputation,
        penalty,
    };
}
