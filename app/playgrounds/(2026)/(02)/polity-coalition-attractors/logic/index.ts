// --- Types ---

export interface ModelParams {
    S: number;
    D: number;
    P: number;
    N: number;
    C: number;
    R: number;
    O: number;
}

export interface SimSettings {
    dt: number;
    noise: number;
    steps: number;
    seed: number;
}

export interface InitialConditions {
    x0: number;
    t0: number;
}

export interface BasinSettings {
    grid: number;
    seedSweep: number;
}

export type AttractorClass = 'Inclusive' | 'Mixed' | 'Exclusionary';

export interface StepOutput {
    x: number;
    t: number;
    threat: number;
    piE: number;
    piI: number;
    diff: number;
}

export interface SeriesPoint extends StepOutput {
    k: number;
}

export interface SimulationResult {
    series: SeriesPoint[];
    final: StepOutput;
    avgPathX: number;
}

export interface BasinCell {
    x0: number;
    t0: number;
    cls: AttractorClass;
    avgFinalX: number;
    avgFinalT: number;
    avgPathX: number;
}

export interface Preset {
    id: string;
    label: string;
    when: string;
    note: string;
    params: ModelParams;
    init: InitialConditions;
    sim?: Partial<SimSettings>;
}

export interface PresetGroup {
    label: string;
    presets: Preset[];
}

// --- Constants ---

export const PARAM_KEYS: { key: keyof ModelParams; label: string; hint: string }[] = [
    { key: 'S', label: 'Stress (S)', hint: 'Economic/security shocks; raises threat salience.' },
    { key: 'D', label: 'Diversity (D)', hint: 'Makes group boundaries more salient in this toy model.' },
    { key: 'P', label: 'Polarization (P)', hint: 'Fragmented info space; increases threat amplification.' },
    { key: 'N', label: 'Norms & enforcement (N)', hint: 'Rule-of-law / rights constraints; raises cost of exclusion.' },
    { key: 'C', label: 'Contact / mixing (C)', hint: 'Bridging social capital; reduces perceived threat.' },
    { key: 'R', label: 'Redistribution / inclusion (R)', hint: 'Material inclusion; increases trust and inclusive payoff.' },
    { key: 'O', label: 'Elite opportunism (O)', hint: 'Identity entrepreneurship; strengthens exclusionary narrative feedback.' },
];

export const DEFAULT_PARAMS: ModelParams = {
    S: 0.45, D: 0.55, P: 0.55, N: 0.45, C: 0.45, R: 0.4, O: 0.5,
};

export const DEFAULT_SIM: SimSettings = {
    dt: 0.06, noise: 0.02, steps: 700, seed: 12345,
};

export const DEFAULT_INIT: InitialConditions = {
    x0: 0.35, t0: 0.55,
};

export const DEFAULT_BASIN: BasinSettings = {
    grid: 42, seedSweep: 1,
};

export const ATTRACTOR_COLORS: Record<AttractorClass, string> = {
    Inclusive: '#22c55e',
    Mixed: '#eab308',
    Exclusionary: '#ef4444',
};

// --- Presets ---

export const PRESETS: Preset[] = [
    {
        id: 'baseline',
        label: 'Baseline (neutral)',
        when: 'Generic',
        note: 'Middle-of-the-road settings; use as a reference point.',
        params: { S: 0.45, D: 0.55, P: 0.55, N: 0.45, C: 0.45, R: 0.4, O: 0.5 },
        init: { x0: 0.35, t0: 0.55 },
        sim: { dt: 0.06, noise: 0.02, steps: 700, seed: 12345 },
    },
    {
        id: 'eu_core_1995_2005',
        label: 'EU core (1995\u20132005)',
        when: '1995\u20132005',
        note: 'Lower stress/polarization; strong norms and contact; moderate redistribution.',
        params: { S: 0.25, D: 0.45, P: 0.25, N: 0.7, C: 0.65, R: 0.6, O: 0.3 },
        init: { x0: 0.2, t0: 0.7 },
    },
    {
        id: 'us_2016_2021',
        label: 'United States (2016\u20132021)',
        when: '2016\u20132021',
        note: 'Higher polarization; moderate stress; opportunism relatively high; norms still non-trivial.',
        params: { S: 0.45, D: 0.6, P: 0.75, N: 0.55, C: 0.4, R: 0.35, O: 0.65 },
        init: { x0: 0.45, t0: 0.45 },
    },
    {
        id: 'uk_2015_2019',
        label: 'United Kingdom (2015\u20132019)',
        when: '2015\u20132019',
        note: 'Elevated polarization around identity/sovereignty; moderate norms; middling contact.',
        params: { S: 0.45, D: 0.55, P: 0.65, N: 0.65, C: 0.5, R: 0.45, O: 0.6 },
        init: { x0: 0.35, t0: 0.5 },
    },
    {
        id: 'hungary_2010s',
        label: 'Hungary (2010s)',
        when: '2010s',
        note: 'Lower diversity but higher elite opportunism; weaker constraints; lower trust/contact.',
        params: { S: 0.4, D: 0.35, P: 0.55, N: 0.4, C: 0.35, R: 0.35, O: 0.75 },
        init: { x0: 0.45, t0: 0.45 },
    },
    {
        id: 'sweden_1995_2005',
        label: 'Sweden (1995\u20132005)',
        when: '1995\u20132005',
        note: 'High trust/bridging; strong norms; relatively low polarization and stress.',
        params: { S: 0.2, D: 0.4, P: 0.25, N: 0.8, C: 0.75, R: 0.7, O: 0.25 },
        init: { x0: 0.15, t0: 0.8 },
    },
    {
        id: 'germany_1932_1933',
        label: 'Germany (1932\u20131933)',
        when: '1932\u20131933',
        note: 'Very high stress; high polarization; weak constraints; high opportunism; low trust.',
        params: { S: 0.8, D: 0.35, P: 0.7, N: 0.3, C: 0.25, R: 0.2, O: 0.8 },
        init: { x0: 0.4, t0: 0.25 },
    },
    {
        id: 'rwanda_1993_1994',
        label: 'Rwanda (1993\u20131994)',
        when: '1993\u20131994',
        note: 'Extreme stress/polarization with elite amplification; very weak constraints; low trust/contact.',
        params: { S: 0.85, D: 0.55, P: 0.8, N: 0.2, C: 0.2, R: 0.15, O: 0.85 },
        init: { x0: 0.55, t0: 0.2 },
    },
    {
        id: 'south_africa_1994_2004',
        label: 'South Africa (1994\u20132004)',
        when: '1994\u20132004',
        note: 'High diversity with meaningful inclusion policy; moderate norms/contact; stress still elevated.',
        params: { S: 0.55, D: 0.8, P: 0.45, N: 0.55, C: 0.55, R: 0.6, O: 0.45 },
        init: { x0: 0.25, t0: 0.55 },
    },
    {
        id: 'japan_tokugawa_late_1850s',
        label: 'Japan (Late Tokugawa, 1850s\u20131860s)',
        when: '1850s\u20131860s',
        note: 'Sharp external shock + internal factional conflict; weaker central constraints; trust stressed.',
        params: { S: 0.75, D: 0.25, P: 0.6, N: 0.35, C: 0.35, R: 0.2, O: 0.7 },
        init: { x0: 0.45, t0: 0.3 },
    },
    {
        id: 'japan_meiji_1870s_1900s',
        label: 'Japan (Meiji era, 1870s\u20131900s)',
        when: '1870s\u20131900s',
        note: 'Rapid state-building under external threat; relatively low diversity; elite-driven modernization.',
        params: { S: 0.6, D: 0.25, P: 0.45, N: 0.55, C: 0.4, R: 0.25, O: 0.65 },
        init: { x0: 0.35, t0: 0.45 },
    },
    {
        id: 'china_late_qing_1870s_1890s',
        label: 'China (Late Qing / Self-Strengthening, 1870s\u20131890s)',
        when: '1870s\u20131890s',
        note: 'High external/internal stress; fragmented authority; weaker constraints; low generalized trust.',
        params: { S: 0.75, D: 0.45, P: 0.55, N: 0.3, C: 0.3, R: 0.2, O: 0.7 },
        init: { x0: 0.4, t0: 0.3 },
    },
    {
        id: 'china_reform_1990s_2000s',
        label: 'China (Reform era, 1990s\u20132000s)',
        when: '1990s\u20132000s',
        note: 'Lower stress than crisis periods; high state capacity; rapid growth with uneven redistribution.',
        params: { S: 0.35, D: 0.45, P: 0.35, N: 0.55, C: 0.4, R: 0.35, O: 0.55 },
        init: { x0: 0.25, t0: 0.55 },
    },
    {
        id: 'uk_victorian_1840_1870',
        label: 'United Kingdom (Victorian industrializing, 1840\u20131870)',
        when: '1840\u20131870',
        note: 'Rapid industrialization + urban stress; expanding state capacity; modest redistribution; empire-era identity politics.',
        params: { S: 0.55, D: 0.35, P: 0.35, N: 0.65, C: 0.55, R: 0.25, O: 0.55 },
        init: { x0: 0.35, t0: 0.55 },
    },
    {
        id: 'france_1848_1871',
        label: 'France (Revolution to Commune, 1848\u20131871)',
        when: '1848\u20131871',
        note: 'Repeated regime change + war shock; high polarization; contested legitimacy; redistributive demands rise.',
        params: { S: 0.75, D: 0.35, P: 0.7, N: 0.45, C: 0.55, R: 0.35, O: 0.7 },
        init: { x0: 0.45, t0: 0.35 },
    },
    {
        id: 'us_civil_war_1861_1865',
        label: 'United States (Civil War, 1861\u20131865)',
        when: '1861\u20131865',
        note: 'Extreme stress and polarization; identity cleavage central; institutions strained by conflict.',
        params: { S: 0.9, D: 0.45, P: 0.9, N: 0.35, C: 0.3, R: 0.25, O: 0.75 },
        init: { x0: 0.55, t0: 0.25 },
    },
    {
        id: 'us_reconstruction_gilded_1865_1890',
        label: 'United States (Reconstruction \u2192 Gilded Age, 1865\u20131890)',
        when: '1865\u20131890',
        note: 'Post-conflict rebuilding; uneven inclusion; high elite capture; polarization persists but stress declines.',
        params: { S: 0.55, D: 0.5, P: 0.65, N: 0.5, C: 0.45, R: 0.25, O: 0.75 },
        init: { x0: 0.45, t0: 0.4 },
    },
    {
        id: 'ottoman_tanzimat_1839_1876',
        label: 'Ottoman Empire (Tanzimat reforms, 1839\u20131876)',
        when: '1839\u20131876',
        note: 'High diversity; reform attempts under external pressure; uneven enforcement; elite factionalism.',
        params: { S: 0.7, D: 0.75, P: 0.55, N: 0.4, C: 0.45, R: 0.25, O: 0.7 },
        init: { x0: 0.4, t0: 0.35 },
    },
    {
        id: 'russia_late_empire_1881_1900',
        label: 'Russian Empire (late 19th c., 1881\u20131900)',
        when: '1881\u20131900',
        note: 'Rising social stress + repression; modernization pressures; low rights constraints; high opportunism.',
        params: { S: 0.75, D: 0.45, P: 0.6, N: 0.3, C: 0.35, R: 0.2, O: 0.75 },
        init: { x0: 0.45, t0: 0.3 },
    },
    {
        id: 'germany_unification_1866_1871',
        label: 'Germany (Unification era, 1866\u20131871)',
        when: '1866\u20131871',
        note: 'National consolidation via war; elevated stress; strong state-building; polarization moderated by coercive capacity.',
        params: { S: 0.7, D: 0.35, P: 0.55, N: 0.55, C: 0.45, R: 0.25, O: 0.65 },
        init: { x0: 0.4, t0: 0.4 },
    },
    {
        id: 'roman_republic_late_133_44_bce',
        label: 'Roman Republic (late, 133\u201344 BCE)',
        when: '133\u201344 BCE',
        note: 'Elite competition + mass politics; polarization high; norms contested; expansion-driven inequality.',
        params: { S: 0.65, D: 0.45, P: 0.8, N: 0.35, C: 0.6, R: 0.25, O: 0.8 },
        init: { x0: 0.5, t0: 0.35 },
    },
    {
        id: 'roman_empire_pax_96_180_ce',
        label: 'Roman Empire (Pax Romana, 96\u2013180 CE)',
        when: '96\u2013180 CE',
        note: 'Relative stability; high diversity and contact; strong coercive capacity; redistribution limited but order high.',
        params: { S: 0.25, D: 0.75, P: 0.25, N: 0.7, C: 0.75, R: 0.2, O: 0.45 },
        init: { x0: 0.25, t0: 0.65 },
    },
    {
        id: 'athens_classical_461_404_bce',
        label: 'Athens (classical democracy, 461\u2013404 BCE)',
        when: '461\u2013404 BCE',
        note: 'High civic participation; factional swings; trade/contact high; external war risk drives stress.',
        params: { S: 0.6, D: 0.25, P: 0.55, N: 0.55, C: 0.65, R: 0.35, O: 0.55 },
        init: { x0: 0.35, t0: 0.55 },
    },
    {
        id: 'han_dynasty_141_87_bce',
        label: 'Han China (mid, 141\u201387 BCE)',
        when: '141\u201387 BCE',
        note: 'Centralized state; frontier pressures; moderate diversity; strong bureaucracy; elite court dynamics.',
        params: { S: 0.55, D: 0.4, P: 0.35, N: 0.65, C: 0.45, R: 0.3, O: 0.55 },
        init: { x0: 0.3, t0: 0.55 },
    },
    {
        id: 'achaemenid_persia_522_486_bce',
        label: 'Achaemenid Persia (Darius I, 522\u2013486 BCE)',
        when: '522\u2013486 BCE',
        note: 'Imperial multi-ethnic administration; high diversity; strong infrastructure/contact; cohesion via elite bargains.',
        params: { S: 0.45, D: 0.85, P: 0.35, N: 0.65, C: 0.7, R: 0.2, O: 0.55 },
        init: { x0: 0.25, t0: 0.6 },
    },
    {
        id: 'maurya_ashoka_268_232_bce',
        label: 'Maurya India (Ashoka era, 268\u2013232 BCE)',
        when: '268\u2013232 BCE',
        note: 'Post-conquest consolidation; ideological norm-setting; relatively high inclusion norms; moderate stress.',
        params: { S: 0.45, D: 0.65, P: 0.3, N: 0.6, C: 0.6, R: 0.35, O: 0.4 },
        init: { x0: 0.25, t0: 0.6 },
    },
];

export const PRESET_GROUPS: PresetGroup[] = [
    {
        label: 'Modern (1995\u20132021)',
        presets: PRESETS.filter((p) => [
            'baseline', 'eu_core_1995_2005', 'us_2016_2021', 'uk_2015_2019',
            'hungary_2010s', 'sweden_1995_2005', 'germany_1932_1933',
            'rwanda_1993_1994', 'south_africa_1994_2004',
        ].includes(p.id)),
    },
    {
        label: 'East Asian (1850s\u20132000s)',
        presets: PRESETS.filter((p) => [
            'japan_tokugawa_late_1850s', 'japan_meiji_1870s_1900s',
            'china_late_qing_1870s_1890s', 'china_reform_1990s_2000s',
        ].includes(p.id)),
    },
    {
        label: '19th Century (1839\u20131900)',
        presets: PRESETS.filter((p) => [
            'uk_victorian_1840_1870', 'france_1848_1871', 'us_civil_war_1861_1865',
            'us_reconstruction_gilded_1865_1890', 'ottoman_tanzimat_1839_1876',
            'russia_late_empire_1881_1900', 'germany_unification_1866_1871',
        ].includes(p.id)),
    },
    {
        label: 'Ancient / Classical',
        presets: PRESETS.filter((p) => [
            'roman_republic_late_133_44_bce', 'roman_empire_pax_96_180_ce',
            'athens_classical_461_404_bce', 'han_dynasty_141_87_bce',
            'achaemenid_persia_522_486_bce', 'maurya_ashoka_268_232_bce',
        ].includes(p.id)),
    },
];

// --- Utility functions ---

export function clamp01(v: number): number {
    return Math.max(0, Math.min(1, v));
}

export function seededRng(seed: number): () => number {
    let t = (seed >>> 0) || 1;
    return function () {
        t += 0x6d2b79f5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

export function fmt(n: number, d: number = 2): string {
    return Number.isFinite(n) ? n.toFixed(d) : '\u2014';
}

// --- Model functions ---

export function computePerceivedThreat(
    state: { x: number; t: number },
    params: ModelParams,
): number {
    const { x, t } = state;
    const { S, D, P, N, C, R, O } = params;
    const raw =
        0.15 +
        0.85 * D * (0.35 + 0.65 * P) +
        0.55 * O * x +
        0.35 * S +
        0.15 * P -
        0.55 * C -
        0.35 * t -
        0.2 * N -
        0.1 * R;
    return clamp01(raw);
}

export function computePayoffs(
    state: { x: number; t: number },
    params: ModelParams,
): { piE: number; piI: number; threat: number } {
    const { x, t } = state;
    const { S, P, N, C, R, O } = params;
    const threat = computePerceivedThreat(state, params);

    const piE =
        0.1 +
        0.95 * S +
        0.95 * threat +
        0.35 * P +
        0.55 * (1 - t) +
        0.25 * O * (0.5 + x) -
        0.85 * N -
        0.55 * R -
        0.2 * C;

    const piI =
        0.1 +
        0.7 * t +
        0.7 * C +
        0.55 * R +
        0.35 * (1 - S) -
        0.7 * threat -
        0.35 * P -
        0.15 * (1 - N);

    return { piE, piI, threat };
}

export function stepDynamics(
    state: { x: number; t: number },
    params: ModelParams,
    sim: { dt: number; noise: number },
    rng: () => number,
): StepOutput {
    const { x, t } = state;
    const { S, P, N, C, R } = params;

    const { piE, piI, threat } = computePayoffs({ x, t }, params);
    const diff = piE - piI;

    const stochastic = (rng() - 0.5) * 2 * sim.noise;
    const dx = sim.dt * x * (1 - x) * diff + sim.dt * stochastic;

    const dtTrust =
        sim.dt *
        (0.55 * R +
            0.45 * C +
            0.25 * N -
            0.55 * P -
            0.65 * x -
            0.45 * S -
            0.2 * threat);

    const xNext = clamp01(x + dx);
    const tNext = clamp01(t + dtTrust);

    return { x: xNext, t: tNext, threat, piE, piI, diff };
}

export function simulate(
    x0: number,
    t0: number,
    params: ModelParams,
    sim: SimSettings,
): SimulationResult {
    const rng = seededRng(sim.seed);
    let x = clamp01(x0);
    let t = clamp01(t0);

    const series: SeriesPoint[] = [];
    let last: StepOutput | null = null;
    let sumX = 0;

    for (let i = 0; i < sim.steps; i++) {
        const out = stepDynamics({ x, t }, params, sim, rng);
        x = out.x;
        t = out.t;
        last = out;
        sumX += x;
        series.push({ k: i, ...out });
    }

    return {
        series,
        final: last ?? { x, t, threat: 0, piE: 0, piI: 0, diff: 0 },
        avgPathX: sim.steps > 0 ? sumX / sim.steps : x,
    };
}

export function classifyAttractor(finalX: number): AttractorClass {
    if (finalX < 0.2) return 'Inclusive';
    if (finalX > 0.8) return 'Exclusionary';
    return 'Mixed';
}

export function computeBasinMap(
    params: ModelParams,
    sim: SimSettings,
    basin: BasinSettings,
): BasinCell[] {
    const safeGrid = Math.max(2, Math.floor(basin.grid));
    const safeSweep = Math.max(1, Math.floor(basin.seedSweep));
    const cells: BasinCell[] = [];

    for (let j = 0; j < safeGrid; j++) {
        const t0 = j / (safeGrid - 1);
        for (let i = 0; i < safeGrid; i++) {
            const x0 = i / (safeGrid - 1);

            const scores: Record<AttractorClass, number> = {
                Exclusionary: 0,
                Inclusive: 0,
                Mixed: 0,
            };
            const finals: { x: number; t: number; pathX: number }[] = [];

            for (let s = 0; s < safeSweep; s++) {
                const res = simulate(x0, t0, params, {
                    ...sim,
                    seed: (sim.seed ?? 1) + s * 1000,
                });
                const cls = classifyAttractor(res.final.x);
                scores[cls] += 1;
                finals.push({ x: res.final.x, t: res.final.t, pathX: res.avgPathX });
            }

            let cls: AttractorClass = 'Mixed';
            if (scores.Exclusionary >= scores.Inclusive && scores.Exclusionary >= scores.Mixed) {
                cls = 'Exclusionary';
            } else if (scores.Inclusive >= scores.Exclusionary && scores.Inclusive >= scores.Mixed) {
                cls = 'Inclusive';
            }

            const n = finals.length;
            const avg = finals.reduce(
                (acc, f) => ({ x: acc.x + f.x / n, t: acc.t + f.t / n, pathX: acc.pathX + f.pathX / n }),
                { x: 0, t: 0, pathX: 0 },
            );

            cells.push({ x0, t0, cls, avgFinalX: avg.x, avgFinalT: avg.t, avgPathX: avg.pathX });
        }
    }

    return cells;
}
