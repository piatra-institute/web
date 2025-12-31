/**
 * Do-Calculus Playground Logic
 * ----------------------------
 * Structural Causal Model (SCM) simulation and analysis.
 * Implements Pearl-style interventions, TPM construction,
 * Granger causality, Transfer Entropy, and synergy detection.
 */

// ============================================
// Types
// ============================================

export interface Node {
    id: string;
    label: string;
    baseRateHz: number;
    clamp: 0 | 1 | null;
    hidden: boolean;
    x: number;
    y: number;
}

export interface Edge {
    id: string;
    from: string;
    to: string;
    delayMs: number;
    weight: number;
}

export interface Synergy {
    id: string;
    a: string;
    b: string;
    to: string;
    delayMs: number;
    prob: number;
}

export interface SimConfig {
    dtMs: number;
    durationMs: number;
    seed: number;
}

export interface SimResult {
    t: number[];
    spikes: number[][];
}

export interface EffectRow {
    kind: 'self' | 'pair' | 'synergy';
    src: string;
    tgt: string;
    metric: string;
    value: number;
}

export interface TPM {
    n: number;
    states: number[];
    mat: number[][];
    rowCounts: number[];
}

// ============================================
// Utilities
// ============================================

export const clamp01 = (x: number): number => {
    if (Number.isNaN(x)) return 0;
    return Math.max(0, Math.min(1, x));
};

export const fmt = (x: number, d = 4): string => {
    if (!Number.isFinite(x)) return '—';
    return x.toFixed(d);
};

export const pct = (x: number): string => `${(100 * x).toFixed(2)}%`;

// Deterministic RNG (Mulberry32)
export function mulberry32(seed: number): () => number {
    let a = seed >>> 0;
    return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function hamming(a: number, b: number): number {
    let x = a ^ b;
    let cnt = 0;
    while (x) {
        cnt += x & 1;
        x >>>= 1;
    }
    return cnt;
}

export function bitmaskToBits(mask: number, n: number): number[] {
    const bits = new Array(n).fill(0);
    for (let i = 0; i < n; i++) bits[i] = (mask >>> i) & 1;
    return bits;
}

export function bitsToBitmask(bits: number[]): number {
    let m = 0;
    for (let i = 0; i < bits.length; i++) if (bits[i]) m |= 1 << i;
    return m;
}

// ============================================
// Simulation
// ============================================

export function simulate(
    nodes: Node[],
    edges: Edge[],
    synergies: Synergy[],
    cfg: SimConfig,
    clampOverride?: Record<string, 0 | 1 | null>
): SimResult {
    const n = nodes.length;
    const steps = Math.floor(cfg.durationMs / cfg.dtMs);
    const idToIdx: Record<string, number> = {};
    nodes.forEach((nd, i) => (idToIdx[nd.id] = i));

    const dtSec = cfg.dtMs / 1000;
    const baseProb = nodes.map((nd) => clamp01((nd.baseRateHz || 0) * dtSec));

    const maxDelay = Math.max(
        0,
        ...edges.map((e) => e.delayMs),
        ...synergies.map((s) => s.delayMs)
    );
    const delaySteps = Math.max(0, Math.floor(maxDelay / cfg.dtMs));

    const spikes: number[][] = Array.from({ length: n }, () => new Array(steps).fill(0));
    const rng = mulberry32(cfg.seed);

    const edgeByTo: Record<number, Edge[]> = {};
    edges.forEach((e) => {
        const to = idToIdx[e.to];
        if (to == null) return;
        (edgeByTo[to] ||= []).push(e);
    });

    const synByTo: Record<number, Synergy[]> = {};
    synergies.forEach((s) => {
        const to = idToIdx[s.to];
        if (to == null) return;
        (synByTo[to] ||= []).push(s);
    });

    for (let t = 0; t < steps; t++) {
        for (let j = 0; j < n; j++) {
            const nd = nodes[j];
            const clampVal = clampOverride?.[nd.id] ?? nd.clamp ?? null;
            if (clampVal === 0 || clampVal === 1) {
                spikes[j][t] = clampVal;
                continue;
            }

            let p = baseProb[j];

            // Delayed edge contributions
            const incoming = edgeByTo[j] || [];
            for (const e of incoming) {
                const di = Math.floor(e.delayMs / cfg.dtMs);
                const srcIdx = idToIdx[e.from];
                if (srcIdx == null) continue;
                if (t - di >= 0 && spikes[srcIdx][t - di] === 1) {
                    p += e.weight;
                }
            }

            // Synergy (coincidence) contributions
            const syns = synByTo[j] || [];
            for (const s of syns) {
                const di = Math.floor(s.delayMs / cfg.dtMs);
                const aIdx = idToIdx[s.a];
                const bIdx = idToIdx[s.b];
                if (aIdx == null || bIdx == null) continue;
                if (t - di >= 0) {
                    if (spikes[aIdx][t - di] === 1 && spikes[bIdx][t - di] === 1) {
                        p = Math.max(p, s.prob);
                    }
                }
            }

            p = clamp01(p);
            spikes[j][t] = rng() < p ? 1 : 0;
        }
    }

    const times = Array.from({ length: steps }, (_, i) => i * cfg.dtMs);
    return { t: times, spikes };
}

// ============================================
// Observational Estimators
// ============================================

export function obsDelta(
    spikes: number[][],
    src: number,
    tgt: number,
    delaySteps: number
): { p1: number; p0: number; delta: number } {
    const T = spikes[0].length;
    const s = spikes[src];
    const y = spikes[tgt];
    let c1 = 0, c0 = 0, y1 = 0, y0 = 0;

    for (let t = 0; t < T - delaySteps; t++) {
        const sv = s[t];
        const yv = y[t + delaySteps];
        if (sv === 1) {
            c1++;
            y1 += yv;
        } else {
            c0++;
            y0 += yv;
        }
    }

    const p1 = c1 ? y1 / c1 : NaN;
    const p0 = c0 ? y0 / c0 : NaN;
    return { p1, p0, delta: p1 - p0 };
}

export function jointSynergyObs(
    spikes: number[][],
    a: number,
    b: number,
    tgt: number,
    delaySteps: number
): { p11: number; p10: number; p01: number; p00: number; synergy: number } {
    const T = spikes[0].length;
    const A = spikes[a], B = spikes[b], Y = spikes[tgt];
    let n11 = 0, n10 = 0, n01 = 0, n00 = 0;
    let y11 = 0, y10 = 0, y01 = 0, y00 = 0;

    for (let t = 0; t < T - delaySteps; t++) {
        const av = A[t];
        const bv = B[t];
        const yv = Y[t + delaySteps];
        if (av === 1 && bv === 1) { n11++; y11 += yv; }
        else if (av === 1 && bv === 0) { n10++; y10 += yv; }
        else if (av === 0 && bv === 1) { n01++; y01 += yv; }
        else { n00++; y00 += yv; }
    }

    const p11 = n11 ? y11 / n11 : NaN;
    const p10 = n10 ? y10 / n10 : NaN;
    const p01 = n01 ? y01 / n01 : NaN;
    const p00 = n00 ? y00 / n00 : NaN;
    const synergy = p11 - Math.max(p10, p01);
    return { p11, p10, p01, p00, synergy };
}

// ============================================
// Transfer Entropy (binary, k=1)
// ============================================

export function transferEntropyBinary(
    src: number[],
    tgt: number[],
    lagSteps: number
): number {
    const T = Math.min(src.length, tgt.length);
    if (T <= lagSteps + 1) return NaN;

    const c = Array.from({ length: 2 }, () =>
        Array.from({ length: 2 }, () => Array.from({ length: 2 }, () => 0))
    );
    let total = 0;

    for (let t = 0; t < T - lagSteps - 1; t++) {
        const x0 = src[t];
        const y0 = tgt[t];
        const y1 = tgt[t + lagSteps];
        c[y1][y0][x0]++;
        total++;
    }

    const log2 = (x: number) => Math.log(x) / Math.log(2);
    let te = 0;

    for (let y1 = 0; y1 <= 1; y1++) {
        for (let y0 = 0; y0 <= 1; y0++) {
            for (let x0 = 0; x0 <= 1; x0++) {
                const n = c[y1][y0][x0];
                if (!n) continue;

                const p_y1y0x0 = n / total;
                const n_y0x0 = c[0][y0][x0] + c[1][y0][x0];
                const n_y1y0 = c[y1][y0][0] + c[y1][y0][1];
                const n_y0 = (c[0][y0][0] + c[0][y0][1]) + (c[1][y0][0] + c[1][y0][1]);

                const p_y1_given_y0x0 = n_y0x0 ? n / n_y0x0 : 0;
                const p_y1_given_y0 = n_y0 ? n_y1y0 / n_y0 : 0;

                if (p_y1_given_y0x0 > 0 && p_y1_given_y0 > 0) {
                    te += p_y1y0x0 * log2(p_y1_given_y0x0 / p_y1_given_y0);
                }
            }
        }
    }
    return te;
}

export function jointTransferEntropyBinary(
    a: number[],
    b: number[],
    tgt: number[],
    lagSteps: number
): number {
    const T = Math.min(a.length, b.length, tgt.length);
    if (T <= lagSteps + 1) return NaN;

    const c = Array.from({ length: 2 }, () =>
        Array.from({ length: 2 }, () => Array.from({ length: 4 }, () => 0))
    );
    let total = 0;

    for (let t = 0; t < T - lagSteps - 1; t++) {
        const x = (a[t] << 1) | b[t];
        const y0 = tgt[t];
        const y1 = tgt[t + lagSteps];
        c[y1][y0][x]++;
        total++;
    }

    const log2 = (x: number) => Math.log(x) / Math.log(2);
    let te = 0;

    for (let y1 = 0; y1 <= 1; y1++) {
        for (let y0 = 0; y0 <= 1; y0++) {
            for (let x = 0; x < 4; x++) {
                const n = c[y1][y0][x];
                if (!n) continue;

                const p_y1y0x = n / total;
                const n_y0x = c[0][y0][x] + c[1][y0][x];
                const n_y1y0 = c[y1][y0].reduce((acc, v) => acc + v, 0);
                const n_y0 = c[0][y0].reduce((acc, v) => acc + v, 0) + c[1][y0].reduce((acc, v) => acc + v, 0);

                const p_y1_given_y0x = n_y0x ? n / n_y0x : 0;
                const p_y1_given_y0 = n_y0 ? n_y1y0 / n_y0 : 0;

                if (p_y1_given_y0x > 0 && p_y1_given_y0 > 0) {
                    te += p_y1y0x * log2(p_y1_given_y0x / p_y1_given_y0);
                }
            }
        }
    }
    return te;
}

// ============================================
// TPM Construction
// ============================================

export function buildTPM(spikes: number[][], delaySteps: number, n: number): TPM {
    const T = spikes[0].length;
    const S = 1 << n;
    const states = Array.from({ length: S }, (_, i) => i);
    const counts = Array.from({ length: S }, () => Array.from({ length: S }, () => 0));
    const rowCounts = Array.from({ length: S }, () => 0);

    for (let t = 0; t < T - delaySteps; t++) {
        const fromBits = new Array(n).fill(0).map((_, i) => spikes[i][t]);
        const toBits = new Array(n).fill(0).map((_, i) => spikes[i][t + delaySteps]);
        const from = bitsToBitmask(fromBits);
        const to = bitsToBitmask(toBits);
        counts[from][to] += 1;
        rowCounts[from] += 1;
    }

    const mat = counts.map((row, i) => {
        const denom = rowCounts[i];
        if (!denom) return row.map(() => 0);
        return row.map((c) => c / denom);
    });

    return { n, states, mat, rowCounts };
}

// ============================================
// Granger Causality (simple OLS)
// ============================================

function olsR2(y: number[], X: number[][]): number {
    const n = y.length;
    const p = X[0]?.length ?? 0;
    const Xc = X.map((row) => [1, ...row]);
    const k = p + 1;

    const XtX = Array.from({ length: k }, () => Array.from({ length: k }, () => 0));
    const Xty = Array.from({ length: k }, () => 0);

    for (let i = 0; i < n; i++) {
        const xi = Xc[i];
        for (let a = 0; a < k; a++) {
            Xty[a] += xi[a] * y[i];
            for (let b = 0; b < k; b++) XtX[a][b] += xi[a] * xi[b];
        }
    }

    const A = XtX.map((row, i) => [...row, Xty[i]]);
    for (let col = 0; col < k; col++) {
        let pivot = col;
        for (let r = col + 1; r < k; r++) if (Math.abs(A[r][col]) > Math.abs(A[pivot][col])) pivot = r;
        const tmp = A[col];
        A[col] = A[pivot];
        A[pivot] = tmp;

        const div = A[col][col];
        if (Math.abs(div) < 1e-12) continue;
        for (let c = col; c <= k; c++) A[col][c] /= div;

        for (let r = 0; r < k; r++) {
            if (r === col) continue;
            const f = A[r][col];
            for (let c = col; c <= k; c++) A[r][c] -= f * A[col][c];
        }
    }

    const beta = A.map((row) => row[k]);

    let yMean = 0;
    for (const v of y) yMean += v;
    yMean /= n;

    let ssTot = 0;
    let ssRes = 0;
    for (let i = 0; i < n; i++) {
        const xi = Xc[i];
        let yhat = 0;
        for (let a = 0; a < k; a++) yhat += beta[a] * xi[a];
        ssTot += (y[i] - yMean) * (y[i] - yMean);
        ssRes += (y[i] - yhat) * (y[i] - yhat);
    }

    if (ssTot <= 1e-12) return 0;
    return 1 - ssRes / ssTot;
}

export function grangerLitePValue(
    src: number[],
    tgt: number[],
    lagSteps: number,
    iters: number,
    seed: number
): { deltaR2: number; p: number } {
    const T = Math.min(src.length, tgt.length);
    const y: number[] = [];
    const xReduced: number[][] = [];
    const xFull: number[][] = [];

    for (let t = 0; t < T - lagSteps; t++) {
        y.push(tgt[t + lagSteps]);
        xReduced.push([tgt[t]]);
        xFull.push([tgt[t], src[t]]);
    }

    const r2Full = olsR2(y, xFull);
    const r2Red = olsR2(y, xReduced);
    const delta = r2Full - r2Red;

    const rng = mulberry32(seed);
    let ge = 0;
    for (let i = 0; i < iters; i++) {
        const perm = src.slice(0, T - lagSteps);
        for (let j = perm.length - 1; j > 0; j--) {
            const k = Math.floor(rng() * (j + 1));
            const tmp = perm[j];
            perm[j] = perm[k];
            perm[k] = tmp;
        }
        const xFullP = xFull.map((row, idx) => [row[0], perm[idx]]);
        const r2FullP = olsR2(y, xFullP);
        const deltaP = r2FullP - r2Red;
        if (deltaP >= delta) ge++;
    }

    const p = (ge + 1) / (iters + 1);
    return { deltaR2: delta, p };
}

// ============================================
// EMD with Hamming distance (for IIT-style)
// ============================================

interface EdgeMCF {
    to: number;
    rev: number;
    cap: number;
    cost: number;
}

function addEdgeMCF(g: EdgeMCF[][], u: number, v: number, cap: number, cost: number): void {
    g[u].push({ to: v, rev: g[v].length, cap, cost });
    g[v].push({ to: u, rev: g[u].length - 1, cap: 0, cost: -cost });
}

function minCostFlow(cost: number[][], supply: number[], demand: number[]): { minCost: number; flow: number } {
    const m = supply.length;
    const n = demand.length;
    const N = 2 + m + n;
    const SRC = 0;
    const SNK = N - 1;
    const g: EdgeMCF[][] = Array.from({ length: N }, () => []);

    const SCALE = 1_000_000;

    const supInt = supply.map((x) => Math.round(x * SCALE));
    const demInt = demand.map((x) => Math.round(x * SCALE));
    const total = supInt.reduce((a, b) => a + b, 0);
    const totalD = demInt.reduce((a, b) => a + b, 0);
    if (total !== totalD) {
        demInt[demInt.length - 1] += total - totalD;
    }

    for (let i = 0; i < m; i++) addEdgeMCF(g, SRC, 1 + i, supInt[i], 0);
    for (let j = 0; j < n; j++) addEdgeMCF(g, 1 + m + j, SNK, demInt[j], 0);
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            addEdgeMCF(g, 1 + i, 1 + m + j, Number.MAX_SAFE_INTEGER, cost[i][j]);
        }
    }

    const pi = new Array(N).fill(0);
    let flow = 0;
    let costSum = 0;

    function dijkstra() {
        const dist = new Array(N).fill(Infinity);
        const pv = new Array(N).fill(-1);
        const pe = new Array(N).fill(-1);
        dist[SRC] = 0;

        const used = new Array(N).fill(false);
        for (let it = 0; it < N; it++) {
            let v = -1;
            for (let i = 0; i < N; i++) {
                if (!used[i] && (v === -1 || dist[i] < dist[v])) v = i;
            }
            if (v === -1 || dist[v] === Infinity) break;
            used[v] = true;

            for (let ei = 0; ei < g[v].length; ei++) {
                const e = g[v][ei];
                if (e.cap <= 0) continue;
                const nd = dist[v] + e.cost + pi[v] - pi[e.to];
                if (nd < dist[e.to]) {
                    dist[e.to] = nd;
                    pv[e.to] = v;
                    pe[e.to] = ei;
                }
            }
        }
        return { dist, pv, pe };
    }

    while (flow < total) {
        const { dist, pv, pe } = dijkstra();
        if (dist[SNK] === Infinity) break;

        for (let v = 0; v < N; v++) {
            if (dist[v] < Infinity) pi[v] += dist[v];
        }

        let add = total - flow;
        for (let v = SNK; v !== SRC; v = pv[v]) {
            const u = pv[v];
            const e = g[u][pe[v]];
            add = Math.min(add, e.cap);
        }

        for (let v = SNK; v !== SRC; v = pv[v]) {
            const u = pv[v];
            const ei = pe[v];
            const e = g[u][ei];
            e.cap -= add;
            g[v][e.rev].cap += add;
            costSum += add * e.cost;
        }

        flow += add;
    }

    return { minCost: costSum / SCALE, flow: flow / SCALE };
}

function normalize(dist: number[]): number[] {
    const sum = dist.reduce((a, b) => a + b, 0);
    if (sum <= 0) return dist.map(() => 0);
    return dist.map((x) => x / sum);
}

export function emdHamming(p: number[], q: number[]): number {
    const S = Math.max(p.length, q.length);
    const pp = normalize(p.slice(0, S));
    const qq = normalize(q.slice(0, S));

    const cost = Array.from({ length: S }, (_, i) =>
        Array.from({ length: S }, (_, j) => hamming(i, j))
    );

    const { minCost } = minCostFlow(cost, pp, qq);
    return minCost;
}

// ============================================
// Templates
// ============================================

export type TemplateName = 'maier3' | 'chain4' | 'confounder3';

export function buildTemplate(kind: TemplateName): {
    nodes: Node[];
    edges: Edge[];
    synergies: Synergy[];
} {
    if (kind === 'maier3') {
        const nodes: Node[] = [
            { id: 'N0', label: 'N0', baseRateHz: 12, clamp: null, hidden: false, x: 150, y: 220 },
            { id: 'N1', label: 'N1', baseRateHz: 14, clamp: null, hidden: false, x: 150, y: 90 },
            { id: 'N2', label: 'N2', baseRateHz: 11, clamp: null, hidden: false, x: 520, y: 155 },
        ];
        const edges: Edge[] = [
            { id: 'e0', from: 'N0', to: 'N2', delayMs: 8, weight: 0.08 },
            { id: 'e1', from: 'N1', to: 'N2', delayMs: 8, weight: 0.12 },
            { id: 'e2', from: 'N0', to: 'N0', delayMs: 8, weight: 0.10 },
        ];
        const synergies: Synergy[] = [
            { id: 's0', a: 'N0', b: 'N1', to: 'N2', delayMs: 8, prob: 0.5 },
        ];
        return { nodes, edges, synergies };
    }

    if (kind === 'chain4') {
        const nodes: Node[] = [
            { id: 'A', label: 'A', baseRateHz: 8, clamp: null, hidden: false, x: 120, y: 170 },
            { id: 'B', label: 'B', baseRateHz: 10, clamp: null, hidden: false, x: 320, y: 80 },
            { id: 'C', label: 'C', baseRateHz: 10, clamp: null, hidden: false, x: 320, y: 260 },
            { id: 'D', label: 'D', baseRateHz: 12, clamp: null, hidden: false, x: 560, y: 170 },
        ];
        const edges: Edge[] = [
            { id: 'e0', from: 'A', to: 'B', delayMs: 10, weight: 0.12 },
            { id: 'e1', from: 'A', to: 'C', delayMs: 10, weight: 0.10 },
            { id: 'e2', from: 'B', to: 'D', delayMs: 10, weight: 0.12 },
            { id: 'e3', from: 'C', to: 'D', delayMs: 10, weight: 0.12 },
        ];
        const synergies: Synergy[] = [
            { id: 's0', a: 'B', b: 'C', to: 'D', delayMs: 10, prob: 0.35 },
        ];
        return { nodes, edges, synergies };
    }

    // confounder3
    const nodes: Node[] = [
        { id: 'U', label: 'U', baseRateHz: 6, clamp: null, hidden: true, x: 120, y: 155 },
        { id: 'X', label: 'X', baseRateHz: 10, clamp: null, hidden: false, x: 360, y: 80 },
        { id: 'Y', label: 'Y', baseRateHz: 10, clamp: null, hidden: false, x: 360, y: 230 },
    ];
    const edges: Edge[] = [
        { id: 'e0', from: 'U', to: 'X', delayMs: 8, weight: 0.20 },
        { id: 'e1', from: 'U', to: 'Y', delayMs: 8, weight: 0.20 },
    ];
    const synergies: Synergy[] = [];
    return { nodes, edges, synergies };
}

// ============================================
// Analysis Helpers
// ============================================

export function computeEffects(
    sim: SimResult,
    nodes: Node[],
    edges: Edge[],
    synergies: Synergy[],
    delaySteps: number,
    cfg: SimConfig
): EffectRow[] {
    const sp = sim.spikes;
    const rows: EffectRow[] = [];

    const idx = nodes.map((nd, i) => ({ nd, i })).filter(({ nd }) => !nd.hidden);
    const obsIdx = idx.map((x) => x.i);

    // Observational deltas
    for (const a of obsIdx) {
        const self = obsDelta(sp, a, a, delaySteps);
        rows.push({ kind: 'self', src: nodes[a].label, tgt: nodes[a].label, metric: 'ΔP_obs', value: self.delta });
        for (const b of obsIdx) {
            if (a === b) continue;
            const r = obsDelta(sp, a, b, delaySteps);
            rows.push({ kind: 'pair', src: nodes[a].label, tgt: nodes[b].label, metric: 'ΔP_obs', value: r.delta });
        }
    }

    // Synergy observational
    for (let ia = 0; ia < obsIdx.length; ia++) {
        for (let ib = ia + 1; ib < obsIdx.length; ib++) {
            for (const tg of obsIdx) {
                const a = obsIdx[ia], b = obsIdx[ib];
                if (tg === a || tg === b) continue;
                const r = jointSynergyObs(sp, a, b, tg, delaySteps);
                rows.push({
                    kind: 'synergy',
                    src: `${nodes[a].label}&${nodes[b].label}`,
                    tgt: nodes[tg].label,
                    metric: 'Synergy_obs',
                    value: r.synergy,
                });
            }
        }
    }

    // Interventional (do) effects
    const simCfg = { ...cfg, seed: cfg.seed + 999 };
    for (const srcIdx of obsIdx) {
        const srcId = nodes[srcIdx].id;
        const simOn = simulate(nodes, edges, synergies, simCfg, { [srcId]: 1 });
        const simOff = simulate(nodes, edges, synergies, simCfg, { [srcId]: 0 });

        for (const tgtIdx of obsIdx) {
            const yOn = simOn.spikes[tgtIdx].slice(delaySteps).reduce((a, b) => a + b, 0) /
                (simOn.spikes[tgtIdx].length - delaySteps);
            const yOff = simOff.spikes[tgtIdx].slice(delaySteps).reduce((a, b) => a + b, 0) /
                (simOff.spikes[tgtIdx].length - delaySteps);
            rows.push({
                kind: srcIdx === tgtIdx ? 'self' : 'pair',
                src: nodes[srcIdx].label,
                tgt: nodes[tgtIdx].label,
                metric: 'ΔP_do',
                value: yOn - yOff,
            });
        }
    }

    return rows;
}

export function computeGrangerAndTE(
    sim: SimResult,
    nodes: Node[],
    delaySteps: number,
    seed: number
): { granger: EffectRow[]; te: EffectRow[] } {
    const sp = sim.spikes;
    const idx = nodes.map((nd, i) => ({ nd, i })).filter(({ nd }) => !nd.hidden).map((x) => x.i);

    const gRows: EffectRow[] = [];
    const tRows: EffectRow[] = [];

    for (const a of idx) {
        for (const b of idx) {
            if (a === b) continue;
            const g = grangerLitePValue(sp[a], sp[b], delaySteps, 50, seed + 202);
            gRows.push({
                kind: 'pair',
                src: nodes[a].label,
                tgt: nodes[b].label,
                metric: `ΔR² (p=${fmt(g.p, 3)})`,
                value: g.deltaR2,
            });

            const te = transferEntropyBinary(sp[a], sp[b], delaySteps);
            tRows.push({
                kind: 'pair',
                src: nodes[a].label,
                tgt: nodes[b].label,
                metric: 'TE (bits)',
                value: te,
            });
        }
    }

    // Joint TE for synergy
    if (idx.length >= 3) {
        const a = idx[0], b = idx[1], y = idx[2];
        const te0 = transferEntropyBinary(sp[a], sp[y], delaySteps);
        const te1 = transferEntropyBinary(sp[b], sp[y], delaySteps);
        const tej = jointTransferEntropyBinary(sp[a], sp[b], sp[y], delaySteps);
        const syn = tej - (te0 + te1);

        tRows.push({
            kind: 'synergy',
            src: `${nodes[a].label}&${nodes[b].label}`,
            tgt: nodes[y].label,
            metric: 'Joint TE',
            value: tej,
        });
        tRows.push({
            kind: 'synergy',
            src: `${nodes[a].label}&${nodes[b].label}`,
            tgt: nodes[y].label,
            metric: 'TE synergy',
            value: syn,
        });
    }

    return { granger: gRows, te: tRows };
}
