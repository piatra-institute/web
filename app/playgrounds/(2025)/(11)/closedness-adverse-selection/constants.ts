export interface SimulationParams {
    // Field structure
    closedness: number;      // k: 0 = open, 1 = closed
    alpha: number;           // curvature of moral-cost amplifier g(k) = k^alpha
    beta0: number;           // base private rents B0
    gamma: number;           // rent slope with closedness
    eta: number;             // baseline cost slope

    // Population distribution
    betaA: number;           // Beta(a,b) shape parameter a
    betaB: number;           // Beta(a,b) shape parameter b

    // Loyalty signaling
    useSignal: boolean;
    signalStrength: number;  // s: strength of loyalty signal
    meanLoyalty: number;     // ell_bar: mean loyalty preference
    phiScale: number;        // dissonance cost scale
    psiScale: number;        // identity benefit scale
}

export type PresetId = 'open' | 'moderate' | 'closed' | 'authoritarian' | 'custom';

export interface Preset {
    id: PresetId;
    name: string;
    description: string;
    params: SimulationParams;
}

export const PRESETS: Preset[] = [
    {
        id: 'open',
        name: 'Open system',
        description: 'Low closedness, critique protected. Broad entry across moral types.',
        params: {
            closedness: 0.15,
            alpha: 1.4,
            beta0: 0.25,
            gamma: 0.6,
            eta: 0.15,
            betaA: 2.0,
            betaB: 3.0,
            useSignal: false,
            signalStrength: 0.0,
            meanLoyalty: 0.4,
            phiScale: 0.8,
            psiScale: 0.6,
        },
    },
    {
        id: 'moderate',
        name: 'Moderate closedness',
        description: 'Some critique suppression. Selection begins to favor lower moral aversion.',
        params: {
            closedness: 0.5,
            alpha: 1.4,
            beta0: 0.25,
            gamma: 0.6,
            eta: 0.15,
            betaA: 2.0,
            betaB: 3.0,
            useSignal: false,
            signalStrength: 0.3,
            meanLoyalty: 0.4,
            phiScale: 0.8,
            psiScale: 0.6,
        },
    },
    {
        id: 'closed',
        name: 'Closed system',
        description: 'High closedness with loyalty signals. Strong adverse selection.',
        params: {
            closedness: 0.75,
            alpha: 1.4,
            beta0: 0.25,
            gamma: 0.6,
            eta: 0.15,
            betaA: 2.0,
            betaB: 3.0,
            useSignal: true,
            signalStrength: 0.5,
            meanLoyalty: 0.4,
            phiScale: 0.8,
            psiScale: 0.6,
        },
    },
    {
        id: 'authoritarian',
        name: 'Authoritarian',
        description: 'Maximum closedness, strong loyalty tests. Only low-m types enter.',
        params: {
            closedness: 0.95,
            alpha: 1.6,
            beta0: 0.3,
            gamma: 0.7,
            eta: 0.1,
            betaA: 2.0,
            betaB: 3.0,
            useSignal: true,
            signalStrength: 0.8,
            meanLoyalty: 0.5,
            phiScale: 1.0,
            psiScale: 0.5,
        },
    },
    {
        id: 'custom',
        name: 'Custom',
        description: 'Tune parameters directly to explore the selection mechanism.',
        params: {
            closedness: 0.5,
            alpha: 1.4,
            beta0: 0.25,
            gamma: 0.6,
            eta: 0.15,
            betaA: 2.0,
            betaB: 3.0,
            useSignal: true,
            signalStrength: 0.5,
            meanLoyalty: 0.4,
            phiScale: 0.8,
            psiScale: 0.6,
        },
    },
];

// Utility functions
function clamp(x: number, a = 0, b = 1): number {
    return Math.max(a, Math.min(b, x));
}

// Log-gamma using Lanczos approximation
function logGamma(z: number): number {
    const g = 7;
    const p = [
        0.99999999999980993, 676.5203681218851, -1259.1392167224028,
        771.32342877765313, -176.61502916214059, 12.507343278686905,
        -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
    ];
    if (z < 0.5) {
        return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
    }
    z -= 1;
    let x = p[0];
    for (let i = 1; i < g + 2; i++) {
        x += p[i] / (z + i);
    }
    const t = z + g + 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x) - Math.log(z + 1);
}

// Beta distribution PDF
export function betaPdf(x: number, a: number, b: number): number {
    if (x <= 0 || x >= 1) return 0;
    const logB = logGamma(a) + logGamma(b) - logGamma(a + b);
    return Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - logB);
}

export function linspace(n: number, a = 0, b = 1): number[] {
    const arr = new Array(n);
    for (let i = 0; i < n; i++) {
        arr[i] = a + (i / (n - 1)) * (b - a);
    }
    return arr;
}

// Model functions
// B(k) = beta0 + gamma * k : private rents rising with closedness
export function B_of_k(k: number, beta0: number, gamma: number): number {
    return beta0 + gamma * k;
}

// g(k) = k^alpha : moral cost amplifier
export function g_of_k(k: number, alpha: number): number {
    return Math.pow(Math.max(k, 1e-6), alpha);
}

// h(k) = eta * k : baseline psychic/sanction cost
export function h_of_k(k: number, eta: number): number {
    return eta * k;
}

// Cutoff m* without loyalty signaling
export function cutoffMStar(params: SimulationParams): number {
    const { closedness: k, alpha, beta0, gamma, eta } = params;
    const B = B_of_k(k, beta0, gamma);
    const g = g_of_k(k, alpha);
    const h = h_of_k(k, eta);
    const numer = B - h;
    const denom = g;
    const mstar = numer / denom;
    return clamp(mstar, 0, 1);
}

// Cutoff m* with loyalty signaling
export function cutoffWithSignal(params: SimulationParams): number {
    const {
        closedness: k,
        alpha,
        beta0,
        gamma,
        eta,
        signalStrength: s,
        meanLoyalty: ellBar,
        phiScale,
        psiScale,
    } = params;

    const B = B_of_k(k, beta0, gamma);
    const g = g_of_k(k, alpha);
    const h = h_of_k(k, eta);

    // phi: dissonance cost increases with s and k
    const phi = phiScale * s * (1 + k);
    // psi: identity benefit increases with s and mildly with k
    const psi = psiScale * s * (1 + 0.5 * k);

    const numer = B - h + ellBar * psi;
    const denom = g + phi;
    const mtilde = numer / denom;
    return clamp(mtilde, 0, 1);
}

// Get effective cutoff based on whether signaling is enabled
export function getEffectiveCutoff(params: SimulationParams): number {
    if (params.useSignal) {
        return cutoffWithSignal(params);
    }
    return cutoffMStar(params);
}

// Summary statistics for entrants
export interface EntrantStats {
    fracEnter: number;      // fraction of population entering
    meanM_pop: number;      // mean m in population
    meanM_enter: number;    // mean m among entrants
    cutoff: number;         // m* cutoff
}

export function summarizeEntrants(params: SimulationParams, gridSize = 801): EntrantStats {
    const mstar = getEffectiveCutoff(params);
    const { betaA: a, betaB: b } = params;

    const xs = linspace(gridSize, 0, 1);
    let Z = 0, Zc = 0, meanPop = 0, meanEntr = 0;

    for (let i = 0; i < xs.length; i++) {
        const x = xs[i];
        const w = i === 0 || i === xs.length - 1 ? 0.5 : 1; // trapezoid weights
        const p = betaPdf(x, a, b);
        Z += w * p;
        meanPop += w * p * x;
        if (x <= mstar) {
            Zc += w * p;
            meanEntr += w * p * x;
        }
    }

    const dx = 1 / (xs.length - 1);
    Z *= dx;
    meanPop *= dx;
    Zc *= dx;
    meanEntr *= dx;

    const fracEnter = Z > 0 ? Zc / Z : 0;
    const meanM_pop = Z > 0 ? meanPop / Z : 0;
    const meanM_enter = Zc > 0 ? meanEntr / Zc : 0;

    return { fracEnter, meanM_pop, meanM_enter, cutoff: mstar };
}

// Generate plot data for PDF charts
export interface PlotPoint {
    x: number;
    pdf: number;
    entrantPdf: number;
}

export function generatePlotData(params: SimulationParams, gridSize = 401): PlotPoint[] {
    const mstar = getEffectiveCutoff(params);
    const { betaA: a, betaB: b } = params;
    const xs = linspace(gridSize, 0, 1);

    return xs.map((x) => {
        const pdf = betaPdf(x, a, b);
        const entrantPdf = x <= mstar ? pdf : 0;
        return { x, pdf, entrantPdf };
    });
}
