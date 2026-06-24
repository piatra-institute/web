/**
 * Pure model for placebo / nocebo dynamics.
 *
 * A predictive-coding / Bayesian precision-weighting account of expectation-driven
 * pain modulation. Top-down priors (context, suggestion, conditioning) and bottom-up
 * nociceptive evidence are combined with a precision weight w. Analgesia recruits two
 * parallel pathways (mu-opioid and CB1), nocebo hyperalgesia runs through a CCK-like
 * pathway, and each pathway is squashed by a signed saturating nonlinearity. The net
 * signed effect is analgesia minus nocebo as a function of cue-drug similarity.
 *
 * Every function here is deterministic and side-effect free so the Viewer, the
 * Settings prior-weight readout, and the calibration panel all share one source of
 * truth for the formulas.
 */

export interface SimulationParams {
    priorPrecision: number;
    sensoryPrecision: number;
    attention: number;
    rOpioid: number;
    rCB1: number;
    rCCK: number;
    conditioning: number;
    naloxone: number;
    rimonabant: number;
    proglumide: number;
}

export interface DataPoint {
    s: number;
    Analgesia: number;
    Hyperalgesia: number;
    Net: number;
    PriorWeight: number;
}

export const DEFAULT_PARAMS: SimulationParams = {
    priorPrecision: 2.0,
    sensoryPrecision: 1.5,
    attention: 0.0,
    rOpioid: 1.0,
    rCB1: 0.8,
    rCCK: 0.8,
    conditioning: 0.7,
    naloxone: 0.0,
    rimonabant: 0.0,
    proglumide: 0.0,
};

/**
 * Signed saturating nonlinearity. Bounds every pathway to the open interval
 * (-1, 1), capturing the biological ceiling and floor of pain modulation.
 * saturate(x) = x / (1 + |x|).
 */
export function saturate(x: number): number {
    return x / (1 + Math.abs(x));
}

/**
 * Sensory precision after attentional gain. Attention multiplicatively raises the
 * reliability assigned to bottom-up nociceptive input.
 */
export function sensoryPrecisionEffective(params: SimulationParams): number {
    return params.sensoryPrecision * (1 + params.attention);
}

/**
 * Precision weight on the prior, w = Pi_p / (Pi_p + Pi_y), with Pi_y already raised
 * by attention. High prior precision moves w toward 1 (top-down control); high
 * sensory precision or attention moves it toward 0 (bottom-up control).
 */
export function priorWeight(params: SimulationParams): number {
    const piY = sensoryPrecisionEffective(params);
    return params.priorPrecision / (params.priorPrecision + piY);
}

/**
 * Effective analgesic gain after pharmacological blockade. The mu-opioid branch is
 * reduced by naloxone; the CB1 branch is reduced by rimonabant and gated by learned
 * conditioning. Returns r_mu(1 - naloxone) + r_CB1(1 - rimonabant) * conditioning.
 */
export function analgesicGain(params: SimulationParams): number {
    const rO = params.rOpioid * (1 - params.naloxone);
    const rC = params.rCB1 * (1 - params.rimonabant) * params.conditioning;
    return rO + rC;
}

/**
 * Effective nocebo gain after blockade. The CCK-like branch is reduced by
 * proglumide. Returns r_CCK(1 - proglumide).
 */
export function noceboGain(params: SimulationParams): number {
    return params.rCCK * (1 - params.proglumide);
}

/**
 * Analgesia at a single cue-drug similarity s in [-1, 1]. Only the positive part of
 * the cue drives analgesia.
 */
export function analgesiaAt(params: SimulationParams, s: number): number {
    const w = priorWeight(params);
    const sPos = Math.max(0, s);
    return saturate(w * sPos * analgesicGain(params));
}

/**
 * Nocebo hyperalgesia at a single similarity s. Only the negative part of the cue
 * drives nocebo. Returned as a non-negative magnitude.
 */
export function noceboAt(params: SimulationParams, s: number): number {
    const w = priorWeight(params);
    const sNeg = Math.max(0, -s);
    return saturate(w * sNeg * noceboGain(params));
}

/**
 * Net signed effect at a single similarity s. Positive is analgesia, negative is
 * hyperalgesia. net = analgesia - nocebo.
 */
export function netEffectAt(params: SimulationParams, s: number): number {
    return analgesiaAt(params, s) - noceboAt(params, s);
}

/**
 * Sweep similarity from -1 to +1 and return the full landscape used by the Viewer.
 * Hyperalgesia is reported as a negative number so it plots below the axis.
 */
export function simulate(params: SimulationParams, points = 201): DataPoint[] {
    const w = priorWeight(params);
    const data: DataPoint[] = [];
    for (let i = 0; i < points; i++) {
        const s = -1 + (2 * i) / (points - 1);
        const analgesia = analgesiaAt(params, s);
        const hyper = noceboAt(params, s);
        data.push({
            s: Number(s.toFixed(3)),
            Analgesia: Number(analgesia.toFixed(4)),
            Hyperalgesia: Number((-hyper).toFixed(4)),
            Net: Number((analgesia - hyper).toFixed(4)),
            PriorWeight: Number(w.toFixed(3)),
        });
    }
    return data;
}
