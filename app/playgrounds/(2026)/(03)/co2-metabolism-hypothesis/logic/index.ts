export type ViewMode = 'curves' | 'thresholds' | 'compartments';

export interface RoleProbs {
    pA: number;
    pC: number;
    pB: number;
}

export interface Compartment {
    id: number;
    A: number[];
    C: number[];
    B: number[];
    motif: boolean;
}

export interface TrialResult {
    success: boolean;
    compartments?: Compartment[];
    witness?: WitnessInfo | null;
}

export interface WitnessInfo {
    compartment: number;
    nA: number;
    nC: number;
    nB: number;
}

export interface ThresholdPoint {
    lambda: number;
    threshold: number | null;
}

export interface PowerLawFit {
    a: number;
    b: number;
    label: string;
}

export interface CurveRow {
    N: number;
    [key: string]: number;
}

export interface SimulationResult {
    curve: CurveRow[];
    thresholds: ThresholdPoint[];
    fit: PowerLawFit | null;
}

export interface WitnessResult {
    success: boolean;
    compartments: Compartment[];
    witness: WitnessInfo | null;
}

export interface Params {
    nMin: number;
    nMax: number;
    nStep: number;
    q: number;
    trials: number;
    lambdaCount: number;
    lambdaBase: number;
    targetThreshold: number;
    roleProbs: RoleProbs;
    seed: number;
    viewMode: ViewMode;
}

export const VIEW_MODES: { key: ViewMode; label: string; description: string }[] = [
    { key: 'curves', label: 'curves', description: 'Probability curves P(H_L) vs N' },
    { key: 'thresholds', label: 'thresholds', description: 'Threshold analysis N* vs λ' },
    { key: 'compartments', label: 'compartments', description: 'Witness compartment draw' },
];

export const LAMBDA_COLORS = [
    '#84cc16', // lime-500
    '#a3e635', // lime-400
    '#65a30d', // lime-600
    '#d9f99d', // lime-200
    '#4d7c0f', // lime-700
    '#bef264', // lime-300
];

export const DEFAULT_PARAMS: Params = {
    nMin: 12,
    nMax: 120,
    nStep: 6,
    q: 3,
    trials: 500,
    lambdaCount: 4,
    lambdaBase: 0.10,
    targetThreshold: 0.5,
    roleProbs: { pA: 0.4, pC: 0.3, pB: 0.3 },
    seed: 42,
    viewMode: 'curves',
};

export function mulberry32(seed: number) {
    let t = seed >>> 0;
    return () => {
        t += 0x6d2b79f5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

export function generateLambdas(count: number, base: number): number[] {
    const lambdas: number[] = [];
    for (let i = 0; i < count; i++) {
        const val = round(base + i * 0.05, 2);
        if (val <= 1) lambdas.push(val);
    }
    return lambdas;
}

function round(x: number, d = 3): number {
    return Number(x.toFixed(d));
}

export function normalizeRoleProbs(pA: number, pC: number, pB: number): RoleProbs {
    const sum = pA + pC + pB;
    if (sum <= 0) return { pA: 0.4, pC: 0.3, pB: 0.3 };
    return { pA: pA / sum, pC: pC / sum, pB: pB / sum };
}

function pickRole(roleProbs: RoleProbs, rnd: number): 'A' | 'C' | 'B' {
    const { pA, pC } = roleProbs;
    if (rnd < pA) return 'A';
    if (rnd < pA + pC) return 'C';
    return 'B';
}

function hasLaneMotifInCompartment(compartment: Compartment, lambda: number, rng: () => number): boolean {
    const nA = compartment.A.length;
    const nC = compartment.C.length;
    const nB = compartment.B.length;
    if (nA === 0 || nC === 0 || nB === 0) return false;

    const candidateTriples = nA * nC * nB;
    const pMotifPerTriple = Math.pow(lambda, 4);
    const pNoMotif = Math.pow(1 - pMotifPerTriple, candidateTriples);
    return rng() > pNoMotif;
}

function simulateTrial({
    N,
    q,
    lambda,
    roleProbs,
    rng,
    returnWitness = false,
}: {
    N: number;
    q: number;
    lambda: number;
    roleProbs: RoleProbs;
    rng: () => number;
    returnWitness?: boolean;
}): TrialResult {
    const compartments: Compartment[] = Array.from({ length: q }, (_, i) => ({
        id: i + 1,
        A: [],
        C: [],
        B: [],
        motif: false,
    }));

    for (let i = 0; i < N; i++) {
        const role = pickRole(roleProbs, rng());
        const c = Math.floor(rng() * q);
        compartments[c][role].push(i);
    }

    let success = false;
    let witness: WitnessInfo | null = null;

    for (const compartment of compartments) {
        const motif = hasLaneMotifInCompartment(compartment, lambda, rng);
        compartment.motif = motif;
        if (motif && !success) {
            success = true;
            witness = {
                compartment: compartment.id,
                nA: compartment.A.length,
                nC: compartment.C.length,
                nB: compartment.B.length,
            };
        }
    }

    return returnWitness ? { success, compartments, witness } : { success };
}

function estimateProbability({
    N,
    q,
    lambda,
    trials,
    roleProbs,
    rng,
}: {
    N: number;
    q: number;
    lambda: number;
    trials: number;
    roleProbs: RoleProbs;
    rng: () => number;
}): number {
    let hits = 0;
    for (let i = 0; i < trials; i++) {
        if (simulateTrial({ N, q, lambda, roleProbs, rng }).success) hits += 1;
    }
    return hits / trials;
}

export function buildProbabilityCurve({
    nMin,
    nMax,
    nStep,
    lambdas,
    q,
    trials,
    roleProbs,
    rng,
}: {
    nMin: number;
    nMax: number;
    nStep: number;
    lambdas: number[];
    q: number;
    trials: number;
    roleProbs: RoleProbs;
    rng: () => number;
}): CurveRow[] {
    const rows: CurveRow[] = [];
    for (let N = nMin; N <= nMax; N += nStep) {
        const row: CurveRow = { N };
        for (const lambda of lambdas) {
            row[`λ=${lambda}`] = round(
                estimateProbability({ N, q, lambda, trials, roleProbs, rng }),
                3,
            );
        }
        rows.push(row);
    }
    return rows;
}

export function estimateThresholds(
    curveRows: CurveRow[],
    lambdas: number[],
    target: number,
): ThresholdPoint[] {
    return lambdas.map((lambda) => {
        const key = `λ=${lambda}`;
        let threshold: number | null = null;
        for (const row of curveRows) {
            if (row[key] >= target) {
                threshold = row.N;
                break;
            }
        }
        return { lambda, threshold };
    });
}

export function fitPowerLaw(thresholdRows: ThresholdPoint[]): PowerLawFit | null {
    const pts = thresholdRows.filter((d) => d.threshold !== null && d.lambda > 0);
    if (pts.length < 2) return null;

    const xs = pts.map((d) => Math.log(d.lambda));
    const ys = pts.map((d) => Math.log(d.threshold!));
    const n = xs.length;
    const mx = xs.reduce((a, b) => a + b, 0) / n;
    const my = ys.reduce((a, b) => a + b, 0) / n;
    const cov = xs.reduce((acc, x, i) => acc + (x - mx) * (ys[i] - my), 0);
    const varx = xs.reduce((acc, x) => acc + Math.pow(x - mx, 2), 0);
    if (varx === 0) return null;
    const slope = cov / varx;
    const intercept = my - slope * mx;
    return {
        a: Math.exp(intercept),
        b: slope,
        label: `N* ≈ ${round(Math.exp(intercept), 2)} · λ^{${round(slope, 2)}}`,
    };
}

export function buildCompartmentWitness({
    N,
    q,
    lambda,
    roleProbs,
    rng,
}: {
    N: number;
    q: number;
    lambda: number;
    roleProbs: RoleProbs;
    rng: () => number;
}): WitnessResult {
    for (let i = 0; i < 500; i++) {
        const outcome = simulateTrial({ N, q, lambda, roleProbs, rng, returnWitness: true });
        if (outcome.success) {
            return {
                success: true,
                compartments: outcome.compartments!,
                witness: outcome.witness!,
            };
        }
    }
    const fallback = simulateTrial({ N, q, lambda, roleProbs, rng, returnWitness: true });
    return {
        success: fallback.success,
        compartments: fallback.compartments!,
        witness: fallback.witness ?? null,
    };
}

export function heuristicMu({
    N,
    q,
    lambda,
    roleProbs,
}: {
    N: number;
    q: number;
    lambda: number;
    roleProbs: RoleProbs;
}): number {
    const { pA, pC, pB } = roleProbs;
    const roleFactor = pA * pC * pB;
    return roleFactor * (Math.pow(N, 3) / Math.pow(q, 2)) * Math.pow(lambda, 4);
}

export function estimateSinglePoint({
    nMin,
    nMax,
    q,
    lambdas,
    trials,
    roleProbs,
    rng,
}: {
    nMin: number;
    nMax: number;
    q: number;
    lambdas: number[];
    trials: number;
    roleProbs: RoleProbs;
    rng: () => number;
}): { lambda: number; Nmid: number; prob: number; mu: number } {
    const lambda = lambdas[Math.floor(lambdas.length / 2)] || 0.25;
    const Nmid = Math.round(nMin + (nMax - nMin) * 0.45);
    const prob = round(
        estimateProbability({
            N: Nmid,
            q,
            lambda,
            trials: Math.max(200, Math.floor(trials / 2)),
            roleProbs,
            rng,
        }),
        3,
    );
    const mu = round(heuristicMu({ N: Nmid, q, lambda, roleProbs }), 2);
    return { lambda, Nmid, prob, mu };
}
