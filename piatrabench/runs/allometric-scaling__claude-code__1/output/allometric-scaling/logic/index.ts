// Allometric scaling: Kleiber's law model and the animal dataset.
// B = B0 * M^a, with mass M in kg and metabolic rate B in watts. Every metric
// here is a pure function of params, so the playground derives them with useMemo
// and never stores derived state.

export interface Params {
    exponent: number;     // a
    coefficient: number;  // B0, watts at 1 kg
    preset: PresetKey;
}

export interface Metrics {
    rmseLog: number;  // root-mean-square of log10 residuals
    mape: number;     // mean absolute percentage error, %
    r2: number;       // coefficient of determination in log space
}

export interface Animal {
    name: string;
    mass: number;  // kg
    bmr: number;   // measured basal metabolic rate, W
}

export interface SweepDatum {
    exponent: number;
    rmseLog: number;
}

export interface Snapshot {
    params: Params;
    metrics: Metrics;
    label: string;
}

export type PresetKey = 'kleiber' | 'surface' | 'isometric' | 'best-fit';

// Representative literature basal metabolic rates. These are order-of-magnitude
// values from standard physiology tables, used to show the scaling pattern; see
// assumptions.ts for the caveat about treating them as a curated dataset.
export const ANIMALS: Animal[] = [
    { name: 'mouse', mass: 0.02, bmr: 0.21 },
    { name: 'rat', mass: 0.3, bmr: 1.6 },
    { name: 'rabbit', mass: 2, bmr: 5.6 },
    { name: 'cat', mass: 4, bmr: 9.5 },
    { name: 'dog', mass: 15, bmr: 24 },
    { name: 'sheep', mass: 50, bmr: 65 },
    { name: 'human', mass: 70, bmr: 84 },
    { name: 'horse', mass: 450, bmr: 330 },
    { name: 'cow', mass: 500, bmr: 360 },
    { name: 'elephant', mass: 4000, bmr: 1700 },
];

export const KLEIBER_EXPONENT = 0.75;
export const SURFACE_EXPONENT = 2 / 3;
// Watts at 1 kg, from the classic BMR estimate of about 70 kcal/day * M^0.75.
export const KLEIBER_COEFFICIENT = 3.4;

export function metabolicRate(mass: number, coefficient: number, exponent: number): number {
    return coefficient * Math.pow(mass, exponent);
}

// Ordinary-least-squares fit in log10 space: the slope is the best-fit exponent
// and 10^intercept is the best-fit coefficient, computed from ANIMALS.
export function bestFit(): { exponent: number; coefficient: number } {
    const xs = ANIMALS.map((a) => Math.log10(a.mass));
    const ys = ANIMALS.map((a) => Math.log10(a.bmr));
    const n = xs.length;
    const mx = xs.reduce((s, x) => s + x, 0) / n;
    const my = ys.reduce((s, y) => s + y, 0) / n;
    let sxy = 0;
    let sxx = 0;
    for (let i = 0; i < n; i++) {
        sxy += (xs[i] - mx) * (ys[i] - my);
        sxx += (xs[i] - mx) ** 2;
    }
    const slope = sxx > 0 ? sxy / sxx : 0;
    const intercept = my - slope * mx;
    return { exponent: slope, coefficient: Math.pow(10, intercept) };
}

export function computeMetrics(params: Params): Metrics {
    const { coefficient, exponent } = params;
    const logRes: number[] = [];
    let apeSum = 0;
    for (const a of ANIMALS) {
        const pred = metabolicRate(a.mass, coefficient, exponent);
        logRes.push(Math.log10(a.bmr) - Math.log10(pred));
        apeSum += Math.abs(pred - a.bmr) / a.bmr;
    }
    const n = ANIMALS.length;
    const ssRes = logRes.reduce((s, r) => s + r * r, 0);
    const rmseLog = Math.sqrt(ssRes / n);
    const mape = (apeSum / n) * 100;
    const ys = ANIMALS.map((a) => Math.log10(a.bmr));
    const my = ys.reduce((s, y) => s + y, 0) / n;
    const ssTot = ys.reduce((s, y) => s + (y - my) ** 2, 0);
    const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;
    return { rmseLog, mape, r2 };
}

// Sweep the exponent across its plausible range with the coefficient fixed,
// tracing the log-residual error so the viewer can show where it bottoms out.
export function computeSweep(coefficient: number): SweepDatum[] {
    const out: SweepDatum[] = [];
    for (let i = 0; i <= 50; i++) {
        const exponent = 0.5 + (1.1 - 0.5) * (i / 50);
        out.push({
            exponent,
            rmseLog: computeMetrics({ coefficient, exponent, preset: 'kleiber' }).rmseLog,
        });
    }
    return out;
}

export const PRESET_DESCRIPTIONS: Record<PresetKey, { label: string; question: string; expectation: string }> = {
    'kleiber': {
        label: 'Kleiber 3/4',
        question: 'Does the three-quarter-power law track the data?',
        expectation: 'A coefficient near 3.4 W and an exponent of 0.75 hug the measured points across the whole mass range.',
    },
    'surface': {
        label: 'surface 2/3',
        question: 'What does the naive surface-to-volume law predict?',
        expectation: 'An exponent of 2/3 is too shallow, drifting away from the points at the extremes of mass.',
    },
    'isometric': {
        label: 'isometric 1',
        question: 'What if metabolism scaled linearly with mass?',
        expectation: 'An exponent of 1 is far too steep, and large animals would run impossibly hot.',
    },
    'best-fit': {
        label: 'best fit',
        question: 'What exponent does ordinary least squares pick?',
        expectation: 'The log-log regression lands near 0.73 to 0.75, closer to Kleiber than to the surface law.',
    },
};

export function presetParams(key: PresetKey): Params {
    if (key === 'kleiber') return { exponent: KLEIBER_EXPONENT, coefficient: KLEIBER_COEFFICIENT, preset: key };
    if (key === 'surface') return { exponent: SURFACE_EXPONENT, coefficient: KLEIBER_COEFFICIENT, preset: key };
    if (key === 'isometric') return { exponent: 1, coefficient: 0.8, preset: key };
    const fit = bestFit();
    return { exponent: Number(fit.exponent.toFixed(3)), coefficient: Number(fit.coefficient.toFixed(3)), preset: key };
}

export const DEFAULT_PARAMS: Params = presetParams('kleiber');

export function computeNarrative(metrics: Metrics, params: Params): string {
    const parts: string[] = [];
    const fitWord = metrics.mape < 20 ? 'tracks the data well'
        : metrics.mape < 50 ? 'roughly tracks the data'
            : 'fits the data poorly';
    parts.push(`At exponent ${params.exponent.toFixed(2)} the model ${fitWord}: mean absolute error ${metrics.mape.toFixed(0)}%, log R² ${metrics.r2.toFixed(2)}.`);
    const d34 = Math.abs(params.exponent - KLEIBER_EXPONENT);
    const d23 = Math.abs(params.exponent - SURFACE_EXPONENT);
    if (d34 < 0.03) parts.push('This is the Kleiber three-quarter exponent that resource-network theory predicts.');
    else if (d23 < 0.03) parts.push('This is the two-thirds surface-law exponent, which the data tend to reject in favour of a steeper slope.');
    else if (params.exponent > 0.9) parts.push('Near-linear scaling would make large animals metabolically impossible.');
    return parts.join(' ');
}
