import { clamp } from '@/lib/playgroundMath';


export const GRID_W = 48;
export const GRID_H = 30;
export const N = GRID_W * GRID_H;


export type TemplateKey = 'single-axis' | 'bifurcated-axis' | 'tri-lobed';

export const TEMPLATE_KEYS: TemplateKey[] = ['single-axis', 'bifurcated-axis', 'tri-lobed'];

export const TEMPLATE_LABELS: Record<TemplateKey, string> = {
    'single-axis': 'single axis',
    'bifurcated-axis': 'bifurcated axis',
    'tri-lobed': 'tri-lobed form',
};

export const TEMPLATE_BLURBS: Record<TemplateKey, string> = {
    'single-axis': 'one head-to-tail body axis, the simplest stored morphology.',
    'bifurcated-axis': 'a two-headed body plan, the classic regenerative double-head target.',
    'tri-lobed': 'three lobes around a suppressed centre, a higher-order form.',
};

export function templateIndex(key: TemplateKey): number {
    return TEMPLATE_KEYS.indexOf(key);
}


function idx(x: number, y: number): number {
    return y * GRID_W + x;
}


/** centre and unit-normalise a pattern (zero mean, unit L2 norm). */
export function normalizePattern(arr: Float32Array): Float32Array {
    let mean = 0;
    for (let i = 0; i < N; i++) mean += arr[i];
    mean /= N;
    let norm = 0;
    for (let i = 0; i < N; i++) {
        arr[i] -= mean;
        norm += arr[i] * arr[i];
    }
    norm = Math.sqrt(norm) || 1;
    for (let i = 0; i < N; i++) arr[i] /= norm;
    return arr;
}


function makeSingleAxis(): Float32Array {
    const a = new Float32Array(N);
    for (let yv = 0; yv < GRID_H; yv++) {
        for (let xv = 0; xv < GRID_W; xv++) {
            const x = (xv / (GRID_W - 1)) * 2 - 1;
            const y = (yv / (GRID_H - 1)) * 2 - 1;
            const body = Math.exp(-((x * x) / 0.75 + (y * y) / 0.12));
            const head = Math.exp(-(((x + 0.55) ** 2) / 0.05 + (y * y) / 0.08));
            const tail = Math.exp(-(((x - 0.6) ** 2) / 0.04 + (y * y) / 0.05));
            a[idx(xv, yv)] = 0.35 * body + 0.95 * head - 0.55 * tail;
        }
    }
    return normalizePattern(a);
}

function makeBifurcatedAxis(): Float32Array {
    const a = new Float32Array(N);
    for (let yv = 0; yv < GRID_H; yv++) {
        for (let xv = 0; xv < GRID_W; xv++) {
            const x = (xv / (GRID_W - 1)) * 2 - 1;
            const y = (yv / (GRID_H - 1)) * 2 - 1;
            const body = Math.exp(-((x * x) / 0.78 + (y * y) / 0.16));
            const head1 = Math.exp(-(((x + 0.62) ** 2) / 0.05 + ((y + 0.34) ** 2) / 0.05));
            const head2 = Math.exp(-(((x + 0.62) ** 2) / 0.05 + ((y - 0.34) ** 2) / 0.05));
            const tail = Math.exp(-(((x - 0.65) ** 2) / 0.05 + (y * y) / 0.08));
            a[idx(xv, yv)] = 0.25 * body + 0.85 * (head1 + head2) - 0.55 * tail;
        }
    }
    return normalizePattern(a);
}

function makeTriLobed(): Float32Array {
    const a = new Float32Array(N);
    const centers: [number, number][] = [
        [0.0, -0.48],
        [-0.45, 0.3],
        [0.45, 0.3],
    ];
    for (let yv = 0; yv < GRID_H; yv++) {
        for (let xv = 0; xv < GRID_W; xv++) {
            const x = (xv / (GRID_W - 1)) * 2 - 1;
            const y = (yv / (GRID_H - 1)) * 2 - 1;
            let v = -0.35 * Math.exp(-(x * x + y * y) / 0.3);
            for (const [cx, cy] of centers) {
                v += 0.95 * Math.exp(-(((x - cx) ** 2) + ((y - cy) ** 2)) / 0.09);
            }
            a[idx(xv, yv)] = v;
        }
    }
    return normalizePattern(a);
}

/**
 * Gram-Schmidt orthonormalisation. Stored patterns are made orthonormal so the
 * low-rank memory term acts as a clean projector onto the stored subspace; this
 * is the orthogonalised-Hopfield variant and removes the crosstalk that
 * correlated raw morphologies would otherwise produce.
 */
function orthonormalize(patterns: Float32Array[]): Float32Array[] {
    for (let k = 0; k < patterns.length; k++) {
        for (let j = 0; j < k; j++) {
            let d = 0;
            for (let i = 0; i < N; i++) d += patterns[k][i] * patterns[j][i];
            for (let i = 0; i < N; i++) patterns[k][i] -= d * patterns[j][i];
        }
        let norm = 0;
        for (let i = 0; i < N; i++) norm += patterns[k][i] * patterns[k][i];
        norm = Math.sqrt(norm) || 1;
        for (let i = 0; i < N; i++) patterns[k][i] /= norm;
    }
    return patterns;
}

/** the three stored morphologies, orthonormalised, in TEMPLATE_KEYS order. */
export function makeTemplates(): Float32Array[] {
    return orthonormalize([makeSingleAxis(), makeBifurcatedAxis(), makeTriLobed()]);
}


export interface Params {
    template: TemplateKey;
    /** associative-memory strength alpha. */
    memory: number;
    /** diffusion coupling D. */
    diffusion: number;
    /** activation gain g in y = tanh(g u). */
    gain: number;
    /** stochastic drive sigma. */
    noise: number;
    /** integration step dt. */
    dt: number;
    /** whether the relaxation loop is running. */
    running: boolean;
}

export const DEFAULT_PARAMS: Params = {
    template: 'single-axis',
    memory: 1.1,
    diffusion: 0.28,
    gain: 1.7,
    noise: 0.02,
    dt: 0.08,
    running: true,
};


export type PresetKey = 'recover' | 'forget' | 'rigid' | 'fluid' | 'noisy';

export const PRESET_DESCRIPTIONS: Record<PresetKey, { label: string; question: string; expectation: string }> = {
    recover: {
        label: 'recover',
        question: 'Can the tissue rebuild its target after a lesion?',
        expectation: 'Strong memory and moderate diffusion: a lesioned form fills back in and the matching overlap bar climbs back toward its pre-injury value.',
    },
    forget: {
        label: 'forget',
        question: 'What happens when the stored memory is too weak to hold a form?',
        expectation: 'Memory below the retrieval threshold: the state decays toward the blank fixed point and no template dominates.',
    },
    rigid: {
        label: 'rigid',
        question: 'What does a stiff, low-diffusion tissue look like?',
        expectation: 'High memory, low diffusion: sharp basins, fast snap-back, but a lesion can leave a frozen scar that local coupling cannot smooth out.',
    },
    fluid: {
        label: 'fluid',
        question: 'How does strong local coupling reshape recovery?',
        expectation: 'High diffusion: edges blur and the form spreads, trading crisp anatomy for smooth, robust filling.',
    },
    noisy: {
        label: 'noisy',
        question: 'Is the attractor stable under fluctuation?',
        expectation: 'High noise: the state jitters around the stored form. A real attractor is only metastable, not a fixed point.',
    },
};

export function presetParams(key: PresetKey, template: TemplateKey): Params {
    const base: Params = { ...DEFAULT_PARAMS, template, running: true };
    switch (key) {
        case 'recover':
            return { ...base, memory: 1.3, diffusion: 0.3, gain: 1.8, noise: 0.02 };
        case 'forget':
            return { ...base, memory: 0.35, diffusion: 0.25, gain: 1.6, noise: 0.02 };
        case 'rigid':
            return { ...base, memory: 2.2, diffusion: 0.06, gain: 2.6, noise: 0.01 };
        case 'fluid':
            return { ...base, memory: 1.2, diffusion: 1.1, gain: 1.6, noise: 0.02 };
        case 'noisy':
            return { ...base, memory: 1.3, diffusion: 0.3, gain: 1.8, noise: 0.16 };
    }
}


export interface FieldState {
    u: Float32Array;
    y: Float32Array;
    lap: Float32Array;
}

export function makeState(): FieldState {
    return {
        u: new Float32Array(N),
        y: new Float32Array(N),
        lap: new Float32Array(N),
    };
}

export function activation(u: number, gain: number): number {
    return Math.tanh(gain * u);
}

export function seedFromTemplate(state: FieldState, pattern: Float32Array): void {
    for (let i = 0; i < N; i++) state.u[i] = 1.25 * pattern[i];
}

export function randomize(state: FieldState, rand: () => number): void {
    for (let i = 0; i < N; i++) state.u[i] = (rand() * 2 - 1) * 0.25;
}

export function lesion(state: FieldState, cxFrac = 0.52, cyFrac = 0.5, rxFrac = 0.15, ryFrac = 0.22): void {
    const cx = Math.floor(GRID_W * cxFrac);
    const cy = Math.floor(GRID_H * cyFrac);
    const rx = Math.max(1, Math.floor(GRID_W * rxFrac));
    const ry = Math.max(1, Math.floor(GRID_H * ryFrac));
    for (let yv = 0; yv < GRID_H; yv++) {
        for (let xv = 0; xv < GRID_W; xv++) {
            const dx = (xv - cx) / rx;
            const dy = (yv - cy) / ry;
            if (dx * dx + dy * dy < 1) state.u[idx(xv, yv)] = 0;
        }
    }
}

/** Hebbian imprint: overwrite a stored template with the current stabilised output. */
export function imprint(state: FieldState, patterns: Float32Array[], k: number): void {
    const t = new Float32Array(N);
    for (let i = 0; i < N; i++) t[i] = state.y[i];
    patterns[k] = normalizePattern(t);
}


/** template overlaps m_k = <pattern_k, y>; also fills state.y from state.u. */
export function overlaps(state: FieldState, patterns: Float32Array[], gain: number): number[] {
    for (let i = 0; i < N; i++) state.y[i] = activation(state.u[i], gain);
    return patterns.map((p) => {
        let s = 0;
        for (let i = 0; i < N; i++) s += p[i] * state.y[i];
        return s;
    });
}


/**
 * One Euler step of the continuous associative-memory field:
 *   du_i/dt = -u_i + alpha * sum_k p_k[i] * <p_k, y> + D * lap(y)_i + sigma * noise.
 * Returns the template overlaps after the step. Mutates state in place.
 */
export function stepField(
    state: FieldState,
    patterns: Float32Array[],
    p: Pick<Params, 'memory' | 'diffusion' | 'gain' | 'noise' | 'dt'>,
    randn: () => number,
): number[] {
    const ov = overlaps(state, patterns, p.gain);

    // discrete Laplacian of y with clamped (no-flux) boundaries.
    const { y, lap, u } = state;
    for (let yy = 0; yy < GRID_H; yy++) {
        for (let xx = 0; xx < GRID_W; xx++) {
            const c = idx(xx, yy);
            const xm = Math.max(0, xx - 1);
            const xp = Math.min(GRID_W - 1, xx + 1);
            const ym = Math.max(0, yy - 1);
            const yp = Math.min(GRID_H - 1, yy + 1);
            lap[c] = y[idx(xm, yy)] + y[idx(xp, yy)] + y[idx(xx, ym)] + y[idx(xx, yp)] - 4 * y[c];
        }
    }

    for (let i = 0; i < N; i++) {
        let memoryField = 0;
        for (let k = 0; k < patterns.length; k++) {
            memoryField += patterns[k][i] * ov[k];
        }
        const du = -u[i] + p.memory * memoryField + p.diffusion * lap[i] + p.noise * randn();
        u[i] = clamp(u[i] + p.dt * du, -3, 3);
    }

    return ov;
}


/** L2 norm of the activation vector. */
function activationNorm(state: FieldState): number {
    let s = 0;
    for (let i = 0; i < N; i++) s += state.y[i] * state.y[i];
    return Math.sqrt(s);
}

/**
 * Cosine similarity between the current output and a stored template, in [0, 1]
 * (clamped). 1 means the form is fully recalled; near 0 means it is absent.
 */
export function recovery(state: FieldState, patterns: Float32Array[], k: number, gain: number): number {
    for (let i = 0; i < N; i++) state.y[i] = activation(state.u[i], gain);
    let dot = 0;
    for (let i = 0; i < N; i++) dot += patterns[k][i] * state.y[i];
    const norm = activationNorm(state) || 1e-9;
    return clamp(dot / norm, 0, 1);
}


/**
 * Lyapunov-style energy of the field for symmetric low-rank coupling:
 *   E = -(alpha/2) sum_k m_k^2 + (D/2) sum_<ij> (y_i - y_j)^2.
 * The dynamics descend this functional in the deterministic (noise-free) limit.
 */
export function energy(
    state: FieldState,
    patterns: Float32Array[],
    p: Pick<Params, 'memory' | 'diffusion' | 'gain'>,
): number {
    const ov = overlaps(state, patterns, p.gain);
    let memTerm = 0;
    for (const m of ov) memTerm += m * m;
    let diffTerm = 0;
    const { y } = state;
    for (let yy = 0; yy < GRID_H; yy++) {
        for (let xx = 0; xx < GRID_W; xx++) {
            const c = idx(xx, yy);
            if (xx + 1 < GRID_W) {
                const d = y[c] - y[idx(xx + 1, yy)];
                diffTerm += d * d;
            }
            if (yy + 1 < GRID_H) {
                const d = y[c] - y[idx(xx, yy + 1)];
                diffTerm += d * d;
            }
        }
    }
    return -0.5 * p.memory * memTerm + 0.5 * p.diffusion * diffTerm;
}


export interface Metrics {
    overlaps: number[];
    dominant: number;
    recovery: number;
    energy: number;
}

export function blankMetrics(): Metrics {
    return { overlaps: [0, 0, 0], dominant: 0, recovery: 0, energy: 0 };
}


/**
 * Deterministic relaxation used by calibration and the parameter sweep: seed the
 * active template, optionally lesion it, then run the noise-free dynamics for a
 * fixed number of steps and report the final recovery overlap with that template.
 */
export function relaxRecovery(
    patterns: Float32Array[],
    k: number,
    p: Pick<Params, 'memory' | 'diffusion' | 'gain'>,
    opts: { lesion?: boolean; steps?: number } = {},
): number {
    const state = makeState();
    seedFromTemplate(state, patterns[k]);
    if (opts.lesion) lesion(state);
    const steps = opts.steps ?? 260;
    const noFluct = () => 0;
    for (let s = 0; s < steps; s++) {
        stepField(state, patterns, { ...p, noise: 0, dt: 0.1 }, noFluct);
    }
    return recovery(state, patterns, k, p.gain);
}


export interface SweepDatum {
    memory: number;
    recovery: number;
    recoveryNoLesion: number;
}

/** sweep the memory strength alpha and measure deterministic recovery after a lesion. */
export function computeSweep(params: Params): SweepDatum[] {
    // a fresh template bank each call so an in-app imprint never leaks into the sweep.
    const patterns = makeTemplates();
    const k = templateIndex(params.template);
    const data: SweepDatum[] = [];
    for (let i = 0; i <= 40; i++) {
        const memory = (3.0 * i) / 40;
        const p = { memory, diffusion: params.diffusion, gain: params.gain };
        data.push({
            memory: Number(memory.toFixed(3)),
            recovery: Number((relaxRecovery(patterns, k, p, { lesion: true }) * 100).toFixed(1)),
            recoveryNoLesion: Number((relaxRecovery(patterns, k, p, { lesion: false }) * 100).toFixed(1)),
        });
    }
    return data;
}


export function computeNarrative(metrics: Metrics, params: Params): string {
    const active = templateIndex(params.template);
    const dominantLabel = TEMPLATE_LABELS[TEMPLATE_KEYS[metrics.dominant]];
    const rec = Math.round(metrics.recovery * 100);

    if (params.memory < 0.5) {
        return `Memory strength ${params.memory.toFixed(2)} is below the retrieval threshold. The associative pull is too weak to hold any stored form, so the state drifts toward the blank fixed point and no morphology dominates. This is the "forgetting" regime: an attractor that exists in the energy landscape only when the coupling is strong enough.`;
    }
    if (metrics.dominant === active && metrics.recovery > 0.6) {
        return `The tissue sits in the basin of the ${dominantLabel}, recalled at about ${rec}% overlap. Perturb it with a lesion and the same low-rank memory pulls the state back to this target: regeneration as descent into a stored attractor. The arithmetic-dynamics analogy is exact in spirit only: here the "orbit" is an approximate, dissipative, noise-tolerant basin, not a discrete periodic point.`;
    }
    if (metrics.dominant !== active) {
        return `The dominant overlap is the ${dominantLabel}, not the selected target. Competing stored patterns and diffusion have pulled the state into a neighbouring basin or a mixed (spurious) state, the associative-memory analogue of landing in the wrong attractor. Re-seed the target or raise memory strength to deepen its basin.`;
    }
    return `The state is between basins at about ${rec}% overlap with the ${dominantLabel}. Memory, diffusion, and noise are competing; nudge memory up for a sharper attractor or diffusion up for a smoother, more robust form.`;
}


export interface Snapshot {
    params: Params;
    metrics: Metrics;
    label: string;
}
