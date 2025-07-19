export interface Agent {
    alpha: number; // weight on agency returns
    beta: number; // weight on signaling returns
    risk: number; // exploration noise
}

export interface SimulationState {
    agents: Agent[];
    H: number; // fragmentation entropy
    O: number; // opportunity
    B: number; // baseline salience
    m: number; // amplification
    lambdaRefine: number;
    thetaRef: number;
    fragDecay: number;
    alphaCoalition: number;
    Cstar: number;
    dFactor: number;
    infoGain: number;
    baseD: number;
    w1: number;
    w2: number;
    w3: number;
    w4: number;
    w5: number;
    thetaCMS: number;
    prev: StepResult | null;
}

export interface StepResult {
    S: number; // signaling
    A: number; // agency
    H: number; // fragmentation
    C: number; // coalition
    D: number; // distortion
    X: number; // outcome
    MRA: number; // marginal return agency
    MRS: number; // marginal return signaling
    pSuccess: number; // success probability
}

export interface DataPoint extends StepResult {
    t: number;
    SI: number; // substitution index
    CMS: number; // composite mobilization score
    phase: 'Emancipatory' | 'Anesthetic' | 'Neutral';
    B: number;
    O: number;
}

export const sigmoid = (x: number): number => 1 / (1 + Math.exp(-x));

export function initAgents(n: number): Agent[] {
    return Array.from({ length: n }, () => ({
        alpha: 0.6 + 0.4 * Math.random(),
        beta: 0.6 + 0.4 * Math.random(),
        risk: 0.8 + 0.4 * Math.random(),
    }));
}

export function simulateStep(state: SimulationState): StepResult {
    const {
        agents, H, O, B, m, lambdaRefine, thetaRef, fragDecay,
        alphaCoalition, Cstar, dFactor, infoGain, baseD, prev,
    } = state;

    const prevS = prev ? prev.S : 0.3;
    const prevA = prev ? prev.A : 0.3;
    const prevH = prev ? prev.H : H;

    // Coalition effectiveness shaped by fragmentation
    const coalitionFactor = sigmoid(alphaCoalition * (prevA * (1 - prevH)));
    const MRA = coalitionFactor * O * (1 + 0.5 * B);
    const purityPressure = sigmoid(prevS / (prevA + 0.01) - thetaRef);
    const MRS = m * (1 + 0.5 * B) * (0.5 + purityPressure);

    // Each agent sets s_i proportionally to MRS/(MRA+MRS)
    let sumS = 0, sumA = 0;
    agents.forEach(a => {
        const total = MRA + MRS + 1e-6;
        const prefAgency = a.alpha * MRA / total;
        const prefSignal = a.beta * MRS / total;
        let s_i = prefSignal / (prefAgency + prefSignal + 1e-6);
        s_i += (Math.random() - 0.5) * 0.1 * a.risk;
        s_i = Math.min(0.99, Math.max(0.01, s_i));
        const a_i = 1 - s_i;
        sumS += s_i;
        sumA += a_i;
    });

    const S = sumS / agents.length;
    const A = sumA / agents.length;

    // Update fragmentation entropy
    const refine = lambdaRefine * sigmoid(S / (A + 0.01) - thetaRef);
    const Hnew = prevH + refine - fragDecay * prevH;
    const Hclamped = Math.min(0.99, Math.max(0.0, Hnew));

    // Coalition size
    const C = A * (1 - Hclamped);

    // Distortion
    const D = baseD + dFactor * (S / (A + 0.01)) - infoGain * O;

    // Outcome success probability
    const pSuccess = sigmoid(4 * (C - Cstar));
    const X = Math.random() < pSuccess ? 1 : 0;

    return {
        S, A, H: Hclamped, C, D, X,
        MRA, MRS, pSuccess
    };
}

export function rollingExpectation(series: number[], Bs: number[], window: number = 10): number {
    if (series.length < 2) return 0;
    const n = Math.min(window, series.length);
    let sumB = 0, sumS = 0, sumBB = 0, sumBS = 0;

    for (let i = series.length - n; i < series.length; i++) {
        const B = Bs[i];
        const S = series[i];
        sumB += B; sumS += S; sumBB += B * B; sumBS += B * S;
    }

    const denom = n * sumBB - sumB * sumB;
    if (Math.abs(denom) < 1e-6) return sumS / n;

    const beta1 = (n * sumBS - sumB * sumS) / denom;
    const beta0 = (sumS - beta1 * sumB) / n;
    const Blast = Bs[Bs.length - 1];

    return beta0 + beta1 * Blast;
}

export function calculateMetrics(
    res: StepResult,
    prev: StepResult | null,
    Sarr: number[],
    Aarr: number[],
    Barr: number[],
    weights: { w1: number; w2: number; w3: number; w4: number; w5: number },
    thetaCMS: number
): { SI: number; CMS: number; phase: 'Emancipatory' | 'Anesthetic' | 'Neutral' } {
    const expS = rollingExpectation(Sarr, Barr);
    const expA = rollingExpectation(Aarr, Barr);
    const eps = 1e-3;
    const SI = (res.S - expS) / ((res.A - expA) + eps);

    if (!prev) {
        return { SI, CMS: 0, phase: 'Neutral' };
    }

    const dA = res.A - prev.A;
    const dC = res.C - prev.C;
    const dX = res.X - prev.X;
    const dH = res.H - prev.H;
    const dD = res.D - prev.D;

    const CMS = weights.w1 * dA + weights.w2 * dC + weights.w3 * dX - weights.w4 * dH - weights.w5 * dD;
    const Srise = res.S - prev.S > 0.005;

    let phase: 'Emancipatory' | 'Anesthetic' | 'Neutral' = 'Neutral';
    if (Srise && CMS >= thetaCMS) phase = 'Emancipatory';
    else if (Srise && CMS < thetaCMS) phase = 'Anesthetic';

    return { SI, CMS, phase };
}
