// Cipolla Quadrant Logic
// Based on Carlo M. Cipolla's "The Basic Laws of Human Stupidity"

export type QuadrantType = 'Intelligent' | 'Helpless' | 'Stupid' | 'Bandit';
export type NetWelfareType = 'net+' | 'net-';

export interface Point {
    id: string;
    x: number;
    y: number;
    tag?: QuadrantType;
}

export interface CountryMacros {
    gdpPcUSD: number;
    gini: number;
    unemploymentPct: number;
    cpi: number; // Corruption Perceptions Index 0-100
    trustPct: number;
    orphanPct: number;
    educationIndex: number;
}

export interface LatentFactors {
    prosperity: number;
    institutions: number;
    inequality: number;
    stress: number;
}

export interface ComponentParams {
    name: QuadrantType;
    signX: number;
    signY: number;
    meanX: number;
    meanY: number;
    stdX: number;
    stdY: number;
    rho: number;
}

export interface CountryModel {
    factors: LatentFactors;
    weights: Record<QuadrantType, number>;
    components: ComponentParams[];
}

export interface PopulationStats {
    n: number;
    meanX: number;
    meanY: number;
    meanNet: number;
    counts: {
        Intelligent: number;
        Helpless: number;
        Stupid: number;
        Bandit: number;
        netPos: number;
        netNeg: number;
        helplessNetPos: number;
        helplessNetNeg: number;
        banditNetPos: number;
        banditNetNeg: number;
    };
}

// Utility functions
export const clamp = (v: number, lo: number, hi: number): number =>
    Math.max(lo, Math.min(hi, v));

// Deterministic PRNG (Mulberry32)
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

// Box-Muller transform for normal distribution
export function boxMuller(rng: () => number): [number, number] {
    let u = 0, v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    const mag = Math.sqrt(-2.0 * Math.log(u));
    const z0 = mag * Math.cos(2.0 * Math.PI * v);
    const z1 = mag * Math.sin(2.0 * Math.PI * v);
    return [z0, z1];
}

// Quadrant classification
export function labelFor(x: number, y: number): QuadrantType {
    if (x >= 0 && y >= 0) return 'Intelligent';
    if (x < 0 && y >= 0) return 'Helpless';
    if (x < 0 && y < 0) return 'Stupid';
    return 'Bandit';
}

// Net welfare classification
export function netWelfareFor(x: number, y: number): NetWelfareType {
    return x + y >= 0 ? 'net+' : 'net-';
}

// Sublabel with net welfare refinement
export function sublabelFor(x: number, y: number): string {
    const base = labelFor(x, y);
    const net = x + y;
    const s = net >= 0 ? 'net+' : 'net-';
    // Only Helpless and Bandit straddle the boundary
    if (base === 'Helpless') return `Helpless (${s})`;
    if (base === 'Bandit') return `Bandit (${s})`;
    return base;
}

// Softmax for mixture weights
export function softmax(logits: number[]): number[] {
    const m = Math.max(...logits);
    const exps = logits.map((z) => Math.exp(z - m));
    const s = exps.reduce((a, b) => a + b, 0);
    if (!Number.isFinite(s) || s <= 0) return logits.map(() => 1 / logits.length);
    return exps.map((e) => e / s);
}

// Normalize GDP (log scale)
function logNormGDP(gdpPcUSD: number): number {
    const lo = Math.log(2000);
    const hi = Math.log(120000);
    const v = Math.log(Math.max(1, gdpPcUSD));
    return clamp((v - lo) / (hi - lo), 0, 1);
}

// Linear normalization
function linNorm(v: number, lo: number, hi: number): number {
    return clamp((v - lo) / (hi - lo), 0, 1);
}

// Compute country model from macro indicators
export function computeCountryModel(macros: CountryMacros, sensitivity: number = 1.0): CountryModel {
    const gdp = logNormGDP(macros.gdpPcUSD);
    const gini = linNorm(macros.gini, 20, 60);
    const unemp = linNorm(macros.unemploymentPct, 0, 25);
    const cpi = linNorm(macros.cpi, 0, 100);
    const trust = linNorm(macros.trustPct, 0, 100);
    const orphan = linNorm(macros.orphanPct, 0, 5);
    const edu = linNorm(macros.educationIndex, 0.3, 0.95);

    // Latent factors (0..1)
    const prosperity = clamp(0.45 * gdp + 0.25 * edu + 0.30 * (1 - unemp), 0, 1);
    const institutions = clamp(0.60 * cpi + 0.40 * trust, 0, 1);
    const inequality = gini;
    const stress = clamp(0.35 * unemp + 0.35 * orphan + 0.20 * inequality + 0.10 * (1 - edu), 0, 1);

    // Logits for mixture weights (Intelligent, Helpless, Bandit, Stupid)
    const zI = (1.2 * prosperity + 1.3 * institutions - 1.0 * stress - 0.4 * inequality) * sensitivity;
    const zH = (0.7 * trust + 0.2 * institutions + 0.8 * stress - 0.6 * prosperity) * sensitivity;
    const zB = (0.9 * inequality + 1.1 * (1 - institutions) + 0.4 * prosperity + 0.3 * stress) * sensitivity;
    const zS = (1.2 * stress + 0.8 * (1 - edu) + 0.6 * (1 - trust) - 0.3 * institutions) * sensitivity;

    const w = softmax([zI, zH, zB, zS]);

    // Component means
    const mI = {
        meanX: clamp(2 + 6 * prosperity, 0.5, 9.5),
        meanY: clamp(2 + 6 * institutions, 0.5, 9.5),
    };

    const mH = {
        meanX: -clamp(2 + 4 * (1 - prosperity) + 2 * stress, 0.5, 9.5),
        meanY: clamp(2 + 5 * trust + 1.5 * institutions, 0.5, 9.5),
    };

    const mB = {
        meanX: clamp(2 + 5 * prosperity + 2 * inequality, 0.5, 9.5),
        meanY: -clamp(2 + 6 * (1 - institutions) + 2 * inequality, 0.5, 9.5),
    };

    const mS = {
        meanX: -clamp(2 + 6 * stress + 2 * (1 - edu), 0.5, 9.5),
        meanY: -clamp(2 + 6 * stress + 1.5 * (1 - trust), 0.5, 9.5),
    };

    // Variance and correlation
    const baseSigma = clamp(1.1 + 2.2 * inequality + 1.6 * stress, 0.6, 5.0);
    const hetero = clamp(0.8 + 1.2 * inequality + 0.8 * stress - 0.6 * institutions, 0.3, 2.2);
    const sigmaX = clamp(baseSigma * (0.9 + 0.3 * hetero), 0.5, 6);
    const sigmaY = clamp(baseSigma * (0.9 + 0.3 * hetero), 0.5, 6);
    const rho = clamp(0.55 * institutions - 0.50 * inequality, -0.8, 0.8);

    const components: ComponentParams[] = [
        { name: 'Intelligent', signX: +1, signY: +1, ...mI, stdX: sigmaX, stdY: sigmaY, rho },
        { name: 'Helpless', signX: -1, signY: +1, ...mH, stdX: sigmaX, stdY: sigmaY, rho },
        { name: 'Bandit', signX: +1, signY: -1, ...mB, stdX: sigmaX, stdY: sigmaY, rho },
        { name: 'Stupid', signX: -1, signY: -1, ...mS, stdX: sigmaX, stdY: sigmaY, rho },
    ];

    return {
        factors: { prosperity, institutions, inequality, stress },
        weights: { Intelligent: w[0], Helpless: w[1], Bandit: w[2], Stupid: w[3] },
        components,
    };
}

// Sample from bivariate normal with quadrant enforcement
function sampleFromBivariateNormal(
    params: ComponentParams,
    rng: () => number
): { x: number; y: number } {
    const [z1, z2] = boxMuller(rng);
    const s = Math.sqrt(1 - params.rho * params.rho);
    let x = params.meanX + params.stdX * z1;
    let y = params.meanY + params.stdY * (params.rho * z1 + s * z2);

    // Enforce quadrant membership by reflection
    x = params.signX * Math.abs(x);
    y = params.signY * Math.abs(y);
    return { x, y };
}

// Sample population from country model
export function sampleMixturePoints(
    model: CountryModel,
    n: number,
    seed: number,
    bounds: { XMIN: number; XMAX: number; YMIN: number; YMAX: number }
): Point[] {
    const rng = mulberry32(seed);
    const keys: QuadrantType[] = ['Intelligent', 'Helpless', 'Bandit', 'Stupid'];
    const wArr = keys.map((k) => model.weights[k]);
    const cum: number[] = [];
    let s = 0;
    for (const ww of wArr) {
        s += ww;
        cum.push(s);
    }

    const pts: Point[] = [];
    for (let i = 0; i < n; i++) {
        const u = rng();
        let idx = 0;
        while (idx < cum.length && u > cum[idx]) idx++;
        idx = clamp(idx, 0, model.components.length - 1);

        const p = sampleFromBivariateNormal(model.components[idx], rng);
        pts.push({
            id: Math.random().toString(36).slice(2, 10),
            x: clamp(p.x, bounds.XMIN, bounds.XMAX),
            y: clamp(p.y, bounds.YMIN, bounds.YMAX),
            tag: model.components[idx].name,
        });
    }

    return pts;
}

// Calculate population statistics
export function calcStats(points: Point[]): PopulationStats {
    const n = points.length;
    const counts = {
        Intelligent: 0,
        Helpless: 0,
        Stupid: 0,
        Bandit: 0,
        netPos: 0,
        netNeg: 0,
        helplessNetPos: 0,
        helplessNetNeg: 0,
        banditNetPos: 0,
        banditNetNeg: 0,
    };
    let sumX = 0, sumY = 0, sumNet = 0;

    for (const p of points) {
        const q = labelFor(p.x, p.y);
        counts[q]++;
        const net = p.x + p.y;
        sumX += p.x;
        sumY += p.y;
        sumNet += net;
        if (net >= 0) counts.netPos++;
        else counts.netNeg++;
        if (q === 'Helpless') {
            if (net >= 0) counts.helplessNetPos++;
            else counts.helplessNetNeg++;
        }
        if (q === 'Bandit') {
            if (net >= 0) counts.banditNetPos++;
            else counts.banditNetNeg++;
        }
    }

    return {
        n,
        meanX: n ? sumX / n : 0,
        meanY: n ? sumY / n : 0,
        meanNet: n ? sumNet / n : 0,
        counts,
    };
}

// Build net-positive polygon for shading (Sutherland-Hodgman clip)
export function buildNetPositivePolygon(bounds: {
    XMIN: number;
    XMAX: number;
    YMIN: number;
    YMAX: number;
}): { x: number; y: number }[] {
    const corners = [
        { x: bounds.XMIN, y: bounds.YMIN },
        { x: bounds.XMAX, y: bounds.YMIN },
        { x: bounds.XMAX, y: bounds.YMAX },
        { x: bounds.XMIN, y: bounds.YMAX },
    ];

    const inside = (pt: { x: number; y: number }) => pt.x + pt.y >= 0;
    const intersect = (a: { x: number; y: number }, b: { x: number; y: number }) => {
        const da = a.x + a.y;
        const db = b.x + b.y;
        const denom = db - da;
        if (Math.abs(denom) < 1e-12) return null;
        const t = -da / denom;
        if (t < 0 || t > 1) return null;
        return { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
    };

    const input = corners;
    const output: { x: number; y: number }[] = [];

    for (let i = 0; i < input.length; i++) {
        const A = input[i];
        const B = input[(i + 1) % input.length];
        const Ain = inside(A);
        const Bin = inside(B);

        if (Ain && Bin) {
            output.push(B);
        } else if (Ain && !Bin) {
            const I = intersect(A, B);
            if (I) output.push(I);
        } else if (!Ain && Bin) {
            const I = intersect(A, B);
            if (I) output.push(I);
            output.push(B);
        }
    }

    return output;
}

// Country presets
export const COUNTRY_PRESETS: Record<string, CountryMacros> = {
    'High-trust Nordic': {
        gdpPcUSD: 65000,
        gini: 27,
        unemploymentPct: 4,
        cpi: 80,
        trustPct: 65,
        orphanPct: 0.2,
        educationIndex: 0.90,
    },
    'High-inequality': {
        gdpPcUSD: 35000,
        gini: 50,
        unemploymentPct: 8,
        cpi: 35,
        trustPct: 22,
        orphanPct: 1.5,
        educationIndex: 0.70,
    },
    'High-stress developing': {
        gdpPcUSD: 6000,
        gini: 42,
        unemploymentPct: 18,
        cpi: 25,
        trustPct: 15,
        orphanPct: 3.5,
        educationIndex: 0.55,
    },
};

// Format number for display
export function fmt(n: number): string {
    if (!Number.isFinite(n)) return '—';
    const abs = Math.abs(n);
    if (abs >= 100) return n.toFixed(0);
    if (abs >= 10) return n.toFixed(1);
    return n.toFixed(2);
}
