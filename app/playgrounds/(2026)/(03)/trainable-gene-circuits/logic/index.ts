// ---------- Types ----------

export type PresetKey = 'associative' | 'toggle' | 'repressilator';

export type StateVec = { a: number; b: number; c: number };

export type Phase = {
    label: string;
    start: number;
    end: number;
    u1: number;
    u2: number;
};

export type Datum = StateVec & {
    t: number;
    u1: number;
    u2: number;
    phase: string;
};

export type Params = {
    dt: number;
    tMax: number;
    mode: PresetKey;
    basalA: number;
    basalB: number;
    basalC: number;
    betaA: number;
    betaB: number;
    betaC: number;
    decayA: number;
    decayB: number;
    decayC: number;
    hillN: number;
    thresholdA: number;
    thresholdB: number;
    thresholdC: number;
    wAA: number;
    wBA: number;
    wCA: number;
    wUA1: number;
    wUA2: number;
    wAB: number;
    wBB: number;
    wCB: number;
    wUB1: number;
    wUB2: number;
    wAC: number;
    wBC: number;
    wCC: number;
    wUC1: number;
    wUC2: number;
    pairStart: number;
    pairEnd: number;
    testStart: number;
    testEnd: number;
    probe: 'u1' | 'u2';
    baseStimulus: number;
    trainStimulus: number;
    testStimulus: number;
    initialA: number;
    initialB: number;
    initialC: number;
};

export type Narrative = {
    label: string;
    blurb: string;
};

// ---------- Helpers ----------

const clamp = (x: number, lo = 0, hi = 3) => Math.max(lo, Math.min(hi, x));

const hillAct = (x: number, K: number, n: number) =>
    Math.pow(Math.max(x, 0), n) / (Math.pow(K, n) + Math.pow(Math.max(x, 0), n) + 1e-9);

const hillRep = (x: number, K: number, n: number) =>
    Math.pow(K, n) / (Math.pow(K, n) + Math.pow(Math.max(x, 0), n) + 1e-9);

const signedHill = (x: number, w: number, K: number, n: number) => {
    const mag = Math.abs(w);
    if (mag < 1e-6) return 1;
    const base = w >= 0 ? hillAct(x, K, n) : hillRep(x, K, n);
    return 1 + mag * (base - 1);
};

// ---------- Presets ----------

export function presetParams(mode: PresetKey): Params {
    if (mode === 'toggle') {
        return {
            dt: 0.05, tMax: 60, mode,
            basalA: 0.02, basalB: 0.02, basalC: 0.0,
            betaA: 1.4, betaB: 1.4, betaC: 0.35,
            decayA: 0.8, decayB: 0.8, decayC: 0.5,
            hillN: 4,
            thresholdA: 0.5, thresholdB: 0.5, thresholdC: 0.5,
            wAA: 1.4, wBA: -1.6, wCA: 0, wUA1: 1.2, wUA2: 0,
            wAB: -1.6, wBB: 1.4, wCB: 0, wUB1: 0, wUB2: 1.2,
            wAC: 0, wBC: 0, wCC: 0, wUC1: 0, wUC2: 0,
            pairStart: 10, pairEnd: 22,
            testStart: 38, testEnd: 46,
            probe: 'u2',
            baseStimulus: 0, trainStimulus: 1, testStimulus: 0.9,
            initialA: 0.1, initialB: 0.1, initialC: 0,
        };
    }

    if (mode === 'repressilator') {
        return {
            dt: 0.03, tMax: 60, mode,
            basalA: 0.01, basalB: 0.01, basalC: 0.01,
            betaA: 1.3, betaB: 1.3, betaC: 1.3,
            decayA: 0.6, decayB: 0.6, decayC: 0.6,
            hillN: 3,
            thresholdA: 0.55, thresholdB: 0.55, thresholdC: 0.55,
            wAA: 0, wBA: 0, wCA: -1.8, wUA1: 0.4, wUA2: 0,
            wAB: -1.8, wBB: 0, wCB: 0, wUB1: 0, wUB2: 0.4,
            wAC: 0, wBC: -1.8, wCC: 0, wUC1: 0, wUC2: 0,
            pairStart: 12, pairEnd: 22,
            testStart: 38, testEnd: 46,
            probe: 'u1',
            baseStimulus: 0, trainStimulus: 0.8, testStimulus: 0.5,
            initialA: 0.2, initialB: 0.7, initialC: 0.4,
        };
    }

    // associative (default)
    return {
        dt: 0.05, tMax: 60, mode,
        basalA: 0.02, basalB: 0.02, basalC: 0.0,
        betaA: 1.8, betaB: 1.2, betaC: 0.95,
        decayA: 1.05, decayB: 0.65, decayC: 0.26,
        hillN: 4,
        thresholdA: 0.55, thresholdB: 0.5, thresholdC: 0.45,
        wAA: 0.9, wBA: 1.0, wCA: 1.25, wUA1: 1.55, wUA2: 0.35,
        wAB: 0.55, wBB: 0.0, wCB: 0.0, wUB1: 0.95, wUB2: 0.0,
        wAC: 0.0, wBC: 1.35, wCC: 0.55, wUC1: 0.0, wUC2: 1.2,
        pairStart: 12, pairEnd: 24,
        testStart: 40, testEnd: 48,
        probe: 'u2',
        baseStimulus: 0, trainStimulus: 1, testStimulus: 0.85,
        initialA: 0.05, initialB: 0.04, initialC: 0.02,
    };
}

// ---------- Phases ----------

export function buildPhases(p: Params): Phase[] {
    const testU1 = p.probe === 'u1' ? p.testStimulus : 0;
    const testU2 = p.probe === 'u2' ? p.testStimulus : 0;
    return [
        { label: 'baseline', start: 0, end: p.pairStart, u1: p.baseStimulus, u2: p.baseStimulus },
        { label: 'training', start: p.pairStart, end: p.pairEnd, u1: p.trainStimulus, u2: p.trainStimulus },
        { label: 'washout', start: p.pairEnd, end: p.testStart, u1: p.baseStimulus, u2: p.baseStimulus },
        { label: 'probe', start: p.testStart, end: p.testEnd, u1: testU1, u2: testU2 },
        { label: 'after', start: p.testEnd, end: p.tMax, u1: p.baseStimulus, u2: p.baseStimulus },
    ];
}

function getStimulus(t: number, phases: Phase[]) {
    const phase = phases.find((ph) => t >= ph.start && t < ph.end) ?? phases[phases.length - 1];
    return { u1: phase.u1, u2: phase.u2, phase: phase.label };
}

// ---------- ODE ----------

function derivatives(x: StateVec, p: Params, u1: number, u2: number): StateVec {
    const n = p.hillN;

    if (p.mode === 'associative') {
        const memoryBoost = signedHill(x.c, p.wCA, p.thresholdC, n);
        const aReg = signedHill(x.a, p.wAA, p.thresholdA, n) * signedHill(x.b, p.wBA, p.thresholdB, n) * memoryBoost;
        const aInput = 1 + p.wUA1 * hillAct(u1, 0.2, 2) + p.wUA2 * hillAct(u2, 0.2, 2);
        const bReg = signedHill(x.a, p.wAB, p.thresholdA, n);
        const bInput = 1 + p.wUB1 * hillAct(u1, 0.2, 2) + p.wUB2 * hillAct(u2, 0.2, 2);
        const cReg = signedHill(x.b, p.wBC, p.thresholdB, n) * signedHill(x.c, p.wCC, p.thresholdC, n);
        const cInput = 1 + p.wUC1 * hillAct(u1, 0.2, 2) + p.wUC2 * hillAct(u2, 0.2, 2);
        return {
            a: p.basalA + p.betaA * aReg * aInput - p.decayA * x.a,
            b: p.basalB + p.betaB * bReg * bInput - p.decayB * x.b,
            c: p.basalC + p.betaC * cReg * cInput - p.decayC * x.c,
        };
    }

    if (p.mode === 'toggle') {
        const uA = p.wUA1 * hillAct(u1, 0.2, 2) + p.wUA2 * hillAct(u2, 0.2, 2);
        const uB = p.wUB1 * hillAct(u1, 0.2, 2) + p.wUB2 * hillAct(u2, 0.2, 2);
        const prodA = p.basalA + p.betaA * hillAct(x.a + uA, p.thresholdA, n) * hillRep(x.b, p.thresholdB, n);
        const prodB = p.basalB + p.betaB * hillAct(x.b + uB, p.thresholdB, n) * hillRep(x.a, p.thresholdA, n);
        const prodC = p.basalC + p.betaC * Math.abs(x.a - x.b);
        return {
            a: prodA - p.decayA * x.a,
            b: prodB - p.decayB * x.b,
            c: prodC - p.decayC * x.c,
        };
    }

    // repressilator
    const prodA = p.basalA + p.betaA * hillRep(x.c, p.thresholdC, n) + p.wUA1 * hillAct(u1, 0.2, 2);
    const prodB = p.basalB + p.betaB * hillRep(x.a, p.thresholdA, n) + p.wUB2 * hillAct(u2, 0.2, 2);
    const prodC = p.basalC + p.betaC * hillRep(x.b, p.thresholdB, n);
    return {
        a: prodA - p.decayA * x.a,
        b: prodB - p.decayB * x.b,
        c: prodC - p.decayC * x.c,
    };
}

// ---------- RK4 ----------

function rk4Step(x: StateVec, p: Params, t: number, phases: Phase[]): StateVec {
    const h = p.dt;
    const s1 = getStimulus(t, phases);
    const k1 = derivatives(x, p, s1.u1, s1.u2);

    const x2: StateVec = { a: x.a + (h / 2) * k1.a, b: x.b + (h / 2) * k1.b, c: x.c + (h / 2) * k1.c };
    const s2 = getStimulus(t + h / 2, phases);
    const k2 = derivatives(x2, p, s2.u1, s2.u2);

    const x3: StateVec = { a: x.a + (h / 2) * k2.a, b: x.b + (h / 2) * k2.b, c: x.c + (h / 2) * k2.c };
    const k3 = derivatives(x3, p, s2.u1, s2.u2);

    const x4: StateVec = { a: x.a + h * k3.a, b: x.b + h * k3.b, c: x.c + h * k3.c };
    const s4 = getStimulus(t + h, phases);
    const k4 = derivatives(x4, p, s4.u1, s4.u2);

    return {
        a: clamp(x.a + (h / 6) * (k1.a + 2 * k2.a + 2 * k3.a + k4.a)),
        b: clamp(x.b + (h / 6) * (k1.b + 2 * k2.b + 2 * k3.b + k4.b)),
        c: clamp(x.c + (h / 6) * (k1.c + 2 * k2.c + 2 * k3.c + k4.c)),
    };
}

// ---------- Simulate ----------

export interface SimResult {
    data: Datum[];
    phases: Phase[];
}

export function simulate(p: Params): SimResult {
    const phases = buildPhases(p);
    const out: Datum[] = [];
    let x: StateVec = { a: p.initialA, b: p.initialB, c: p.initialC };
    for (let t = 0; t <= p.tMax + 1e-9; t += p.dt) {
        const stim = getStimulus(t, phases);
        out.push({
            t: Number(t.toFixed(2)),
            a: x.a, b: x.b, c: x.c,
            u1: stim.u1, u2: stim.u2,
            phase: stim.phase,
        });
        x = rk4Step(x, p, t, phases);
    }
    return { data: out, phases };
}

// ---------- Narrative inference ----------

export function inferNarrative(data: Datum[], p: Params): Narrative {
    const beforeProbe = data.find((d) => d.t >= p.testStart - 0.5) ?? data[0];
    const endProbe = data.find((d) => d.t >= p.testEnd) ?? data[data.length - 1];
    const peakDuringProbe = data
        .filter((d) => d.t >= p.testStart && d.t <= p.testEnd)
        .reduce((m, d) => Math.max(m, d.a), -Infinity);
    const memoryDelta = endProbe.c - beforeProbe.c;
    const responseDelta = peakDuringProbe - beforeProbe.a;

    if (p.mode === 'associative') {
        if (responseDelta > 0.35 && endProbe.c > 0.45) {
            return {
                label: 'conditioning-like response',
                blurb: 'The probe stimulus evokes a strong output because the slow variable retained a training trace.',
            };
        }
        if (memoryDelta > 0.2) {
            return {
                label: 'partial memory',
                blurb: 'Training leaves a residual trace, but the probe is not sufficient to fully trigger the output.',
            };
        }
        return {
            label: 'no durable learning',
            blurb: 'The paired pulses perturb the system transiently, but it relaxes back without a persistent memory.',
        };
    }

    if (p.mode === 'toggle') {
        const dominance = endProbe.a - endProbe.b;
        if (Math.abs(dominance) > 0.45) {
            return {
                label: 'committed attractor',
                blurb: 'The system crossed a threshold and locked into one basin - the simplest GRN memory mechanism.',
            };
        }
        return {
            label: 'uncommitted toggle',
            blurb: 'The pulses were not large or long enough to lock the network into one branch.',
        };
    }

    const oscAmp = Math.max(...data.map((d) => d.a)) - Math.min(...data.map((d) => d.a));
    return oscAmp > 0.4
        ? {
            label: 'persistent oscillation',
            blurb: 'The circuit encodes state as phase and amplitude rather than a fixed attractor - dynamic memory.',
        }
        : {
            label: 'damped oscillation',
            blurb: 'The loop is too weak or lossy to sustain a stable cyclical regime.',
        };
}

// ---------- Stats ----------

export interface SimStats {
    peakA: number;
    peakC: number;
    finalA: number;
    finalB: number;
    finalC: number;
    probeMeanA: number;
}

export function computeStats(data: Datum[], p: Params): SimStats {
    const probeData = data.filter((d) => d.t >= p.testStart && d.t <= p.testEnd);
    const final = data[data.length - 1];
    return {
        peakA: Math.max(...data.map((d) => d.a)),
        peakC: Math.max(...data.map((d) => d.c)),
        finalA: final.a,
        finalB: final.b,
        finalC: final.c,
        probeMeanA: probeData.length > 0
            ? probeData.reduce((s, d) => s + d.a, 0) / probeData.length
            : 0,
    };
}
