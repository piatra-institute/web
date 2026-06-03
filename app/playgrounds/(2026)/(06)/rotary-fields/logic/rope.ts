import { clamp01 } from '@/lib/playgroundMath';
import { gaussian } from '@/lib/rng';


/**
 * RoPE math: rotate pairs of vector dimensions by an angle that depends on
 * token position and a per-pair frequency, then dot-product the rotated query
 * and key. The rotation factors at i and j cancel into a relative rotation
 * R(j - i), so the score depends on j - i, not on i and j separately.
 */


/** angular frequency for the m-th dimension pair in RoPE. */
export function pairFrequency(m: number, pairs: number, base: number): number {
    return 1 / Math.pow(base, (2 * m) / (pairs * 2));
}

/** full frequency ladder, ordered from highest (m=0) to lowest (m=pairs-1). */
export function frequencyLadder(pairs: number, base: number): number[] {
    const out: number[] = [];
    for (let m = 0; m < pairs; m++) out.push(pairFrequency(m, pairs, base));
    return out;
}

/** rotate `vec` (length = 2 * pairs) by position `pos` using the RoPE ladder. */
export function ropeRotate(vec: number[], pos: number, freqs: number[]): number[] {
    const out = vec.slice();
    for (let m = 0; m < freqs.length; m++) {
        const x = vec[2 * m];
        const y = vec[2 * m + 1];
        const a = pos * freqs[m];
        const c = Math.cos(a);
        const s = Math.sin(a);
        out[2 * m] = c * x - s * y;
        out[2 * m + 1] = s * x + c * y;
    }
    return out;
}

/** dot product of two equal-length vectors. */
export function dot(a: number[], b: number[]): number {
    let s = 0;
    for (let i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
}

/** L2 norm. */
export function norm(v: number[]): number {
    let s = 0;
    for (let i = 0; i < v.length; i++) s += v[i] * v[i];
    return Math.sqrt(s);
}

/** divide `v` by its L2 norm (no-op if zero). */
export function normalize(v: number[]): number[] {
    const n = norm(v) || 1;
    return v.map((x) => x / n);
}

/** standard-normal vector of length `dim`, deterministic from `seed`. */
export function randnVector(seed: number, dim: number): number[] {
    const v: number[] = [];
    for (let i = 0; i < dim; i++) v.push(gaussian(seed + i * 977));
    return v;
}


export interface QKBank {
    q: number[][];
    k: number[][];
}


/**
 * generate per-position query and key vectors.
 *
 * a shared content direction `qBase` is reused at every position, and the key
 * direction is `qBase * cs + orthoMag * noiseDir`, with `cs` derived from
 * `contentSim` and a single shared `noiseDir` so the off-diagonal term has a
 * consistent sign. tying content to a shared direction lets the RoPE rotation
 * dominate: the only thing that changes from position to position is the
 * rotation angle, so the score isolates the position-as-angle effect cleanly.
 *
 * a small per-position content jitter (controlled by `seed`) is mixed in so
 * randomizing the seed produces visibly different attention patterns without
 * destroying the locality structure.
 */
export function buildQKBank(
    seqLen: number,
    pairs: number,
    contentSim: number,
    seed: number,
): QKBank {
    const dim = pairs * 2;
    const sim = clamp01((contentSim + 1) / 2);
    const cs = 2 * sim - 1;
    const orthoMag = Math.sqrt(Math.max(0, 1 - cs * cs));
    const jitterAmp = 0.18;

    const qBase = normalize(randnVector(seed, dim));
    const noiseDir = normalize(randnVector(seed + 1009, dim));
    const kBase = normalize(qBase.map((x, idx) => cs * x + orthoMag * noiseDir[idx]));

    const q: number[][] = [];
    const k: number[][] = [];
    for (let i = 0; i < seqLen; i++) {
        const jitterQ = randnVector(seed + 311 * i + 13, dim);
        const jitterK = randnVector(seed + 311 * i + 29, dim);
        const qi = normalize(qBase.map((x, idx) => x + jitterAmp * jitterQ[idx]));
        const ki = normalize(kBase.map((x, idx) => x + jitterAmp * jitterK[idx]));
        q.push(qi);
        k.push(ki);
    }
    return { q, k };
}


/**
 * RoPE-rotated attention score between query at position i and key at j,
 * using the supplied bank and frequency ladder.
 */
export function ropeScore(
    bank: QKBank,
    freqs: number[],
    i: number,
    j: number,
): number {
    const qi = ropeRotate(bank.q[i], i, freqs);
    const kj = ropeRotate(bank.k[j], j, freqs);
    return dot(qi, kj);
}


/** raw (pre-rotation) query-key similarity at positions i, j. */
export function rawScore(bank: QKBank, i: number, j: number): number {
    return dot(bank.q[i], bank.k[j]);
}


/** the full N x N RoPE attention score matrix for the given bank. */
export function attentionMatrix(bank: QKBank, freqs: number[]): number[][] {
    const n = bank.q.length;
    const rotQ: number[][] = [];
    const rotK: number[][] = [];
    for (let p = 0; p < n; p++) {
        rotQ.push(ropeRotate(bank.q[p], p, freqs));
        rotK.push(ropeRotate(bank.k[p], p, freqs));
    }
    const m: number[][] = [];
    for (let i = 0; i < n; i++) {
        const row: number[] = [];
        for (let j = 0; j < n; j++) row.push(dot(rotQ[i], rotK[j]));
        m.push(row);
    }
    return m;
}


/**
 * mean |score(i, j) - score(i + k, j + k)| over all valid (i, j) for a fixed
 * shift k. measures the per-shift translation-invariance drift.
 *
 * theoretically zero for true RoPE on the same content vectors. nonzero here
 * because content vectors are position-specific (each token has its own
 * random q, k), so this records how much of the residual structure depends on
 * absolute position rather than the relative offset.
 */
export function translationDrift(matrix: number[][], shift: number): number {
    const n = matrix.length;
    let sum = 0;
    let count = 0;
    for (let i = 0; i + shift < n; i++) {
        for (let j = 0; j + shift < n; j++) {
            sum += Math.abs(matrix[i][j] - matrix[i + shift][j + shift]);
            count++;
        }
    }
    return count === 0 ? 0 : sum / count;
}


/**
 * relative angle in degrees between query at i and key at j in the first 2D
 * RoPE plane (m = 0). wrapped into [-180, 180].
 */
export function firstPlaneRelativeAngle(
    bank: QKBank,
    freqs: number[],
    i: number,
    j: number,
): number {
    const q = bank.q[i];
    const k = bank.k[j];
    const f0 = freqs[0];
    const qAng = Math.atan2(q[1], q[0]) + i * f0;
    const kAng = Math.atan2(k[1], k[0]) + j * f0;
    const rel = ((kAng - qAng + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    return (rel * 180) / Math.PI;
}
