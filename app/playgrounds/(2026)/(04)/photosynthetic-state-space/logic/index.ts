// Photosynthetic State Space — logic module
//
// Models the Z-scheme light reactions as a controllable landscape
// with species presets (C3, C4, CAM, Cyanobacteria, Red Algae),
// 16 physiological parameters, 3 speculative control nodes,
// and 5 perturbation profiles for exploring path dependence.
//
// Key outputs: carbon fixation proxy, ROS load, homeostasis,
// bifurcation risk, invariant scores, and regime classification.

import { SensitivityBar } from '@/components/SensitivityAnalysis';


// ── Physical constants ─────────────────────────────────────────

const H = 6.62607015e-34;
const C_LIGHT = 299792458;
const AVOGADRO = 6.02214076e23;


// ── Types ──────────────────────────────────────────────────────

export type SpeciesKey = 'C3' | 'C4' | 'CAM' | 'Cyanobacteria' | 'RedAlgae';

export type PerturbationProfile =
    | 'Steady'
    | 'Dawn-Noon-Dusk'
    | 'Cloud Flicker'
    | 'Heat Shock'
    | 'High-Light Pulse';

export interface SpeciesTraits {
    label: string;
    tempOpt: number;
    tempWidth: number;
    waterTolerance: number;
    lightHalfSat: number;
    kCO2: number;
    repairStrength: number;
    baseNPQ: number;
    ccmStrength: number;
    atpTarget: number;
    assimilationBonus: number;
    bifurcationLight: number;
}

export interface Params {
    species: SpeciesKey;
    perturbation: PerturbationProfile;
    // Energy
    lightIntensity: number;
    psiiWavelength: number;
    psiWavelength: number;
    excitationBalance: number;
    // Environment
    temperature: number;
    co2: number;
    waterStress: number;
    nutrients: number;
    // Protection & repair
    npq: number;
    repair: number;
    cyclic: number;
    stomatalControl: number;
    ccm: number;
    antenna: number;
    rosBuffer: number;
    damageMemory: number;
    // Speculative
    adaptiveRouting: boolean;
    dynamicTopology: boolean;
    protonicHomeostasis: boolean;
}

export type AttractorRegime =
    | 'Efficient regime'
    | 'Homeostatic regime'
    | 'Protected regime'
    | 'Transition regime'
    | 'Photoinhibition attractor';

export interface ZSchemeStep {
    stage: string;
    energy: number;
}

export interface Metrics {
    incidentPowerDensity: number;
    psiiEV: number;
    psiEV: number;
    excitationMismatch: number;
    assimilation: number;
    rosIndex: number;
    damageIndex: number;
    homeostasis: number;
    bifurcationRisk: number;
    pathDependence: number;
    invariantScore: number;
    atpNadph: number;
    repairCapacity: number;
    lightUse: number;
    effectiveNPQ: number;
    attractor: AttractorRegime;
    zData: ZSchemeStep[];
}

export interface TrajectoryStep {
    step: number;
    light: number;
    fixation: number;
    ros: number;
    memory: number;
    homeostasis: number;
}

export interface LandscapePoint {
    light: number;
    fixation: number;
    ros: number;
    homeostasis: number;
}

export interface InvariantCheck {
    label: string;
    value: string;
    ok: boolean;
}

export interface Snapshot {
    params: Params;
    metrics: Metrics;
    label: string;
}

export type SweepableParam =
    | 'lightIntensity'
    | 'npq'
    | 'repair'
    | 'cyclic'
    | 'waterStress'
    | 'antenna';

export interface SweepDatum {
    sweepValue: number;
    assimilation: number;
    rosIndex: number;
    homeostasis: number;
}


// ── Constants ──────────────────────────────────────────────────

export const ANIMATION_TOTAL_FRAMES = 70;

export const PERTURBATION_PROFILES: PerturbationProfile[] = [
    'Steady',
    'Dawn-Noon-Dusk',
    'Cloud Flicker',
    'Heat Shock',
    'High-Light Pulse',
];


// ── Species Presets ─────────────────────────────────────────────

export const SPECIES: Record<SpeciesKey, SpeciesTraits> = {
    C3: {
        label: 'C3 Leaf',
        tempOpt: 24, tempWidth: 11, waterTolerance: 0.45,
        lightHalfSat: 520, kCO2: 260, repairStrength: 0.58,
        baseNPQ: 0.72, ccmStrength: 0.18, atpTarget: 1.32,
        assimilationBonus: 1.0, bifurcationLight: 1350,
    },
    C4: {
        label: 'C4 Grass',
        tempOpt: 31, tempWidth: 12, waterTolerance: 0.66,
        lightHalfSat: 760, kCO2: 180, repairStrength: 0.72,
        baseNPQ: 0.68, ccmStrength: 0.62, atpTarget: 1.48,
        assimilationBonus: 1.12, bifurcationLight: 1750,
    },
    CAM: {
        label: 'CAM Succulent',
        tempOpt: 30, tempWidth: 14, waterTolerance: 0.86,
        lightHalfSat: 480, kCO2: 240, repairStrength: 0.63,
        baseNPQ: 0.84, ccmStrength: 0.36, atpTarget: 1.42,
        assimilationBonus: 0.82, bifurcationLight: 1600,
    },
    Cyanobacteria: {
        label: 'Cyanobacteria',
        tempOpt: 28, tempWidth: 13, waterTolerance: 0.7,
        lightHalfSat: 610, kCO2: 160, repairStrength: 0.74,
        baseNPQ: 0.64, ccmStrength: 0.72, atpTarget: 1.38,
        assimilationBonus: 1.04, bifurcationLight: 1700,
    },
    RedAlgae: {
        label: 'Red Algae',
        tempOpt: 22, tempWidth: 10, waterTolerance: 0.72,
        lightHalfSat: 340, kCO2: 200, repairStrength: 0.56,
        baseNPQ: 0.74, ccmStrength: 0.4, atpTarget: 1.35,
        assimilationBonus: 0.92, bifurcationLight: 1100,
    },
};

export const SPECIES_DEFAULTS: Record<SpeciesKey, Omit<Params, 'species' | 'perturbation' | 'adaptiveRouting' | 'dynamicTopology' | 'protonicHomeostasis'>> = {
    C3: { lightIntensity: 900, psiiWavelength: 680, psiWavelength: 700, excitationBalance: 0.5, temperature: 25, co2: 420, waterStress: 0.18, nutrients: 0.82, npq: 0.55, repair: 0.58, cyclic: 0.26, stomatalControl: 0.55, ccm: 0.18, antenna: 1.0, rosBuffer: 0.54, damageMemory: 0.18 },
    C4: { lightIntensity: 1300, psiiWavelength: 680, psiWavelength: 700, excitationBalance: 0.52, temperature: 31, co2: 420, waterStress: 0.22, nutrients: 0.84, npq: 0.5, repair: 0.64, cyclic: 0.42, stomatalControl: 0.64, ccm: 0.6, antenna: 0.9, rosBuffer: 0.58, damageMemory: 0.14 },
    CAM: { lightIntensity: 1100, psiiWavelength: 680, psiWavelength: 700, excitationBalance: 0.49, temperature: 30, co2: 420, waterStress: 0.42, nutrients: 0.74, npq: 0.66, repair: 0.57, cyclic: 0.46, stomatalControl: 0.9, ccm: 0.34, antenna: 0.95, rosBuffer: 0.66, damageMemory: 0.28 },
    Cyanobacteria: { lightIntensity: 1000, psiiWavelength: 680, psiWavelength: 700, excitationBalance: 0.51, temperature: 28, co2: 420, waterStress: 0.12, nutrients: 0.86, npq: 0.48, repair: 0.68, cyclic: 0.36, stomatalControl: 0.0, ccm: 0.68, antenna: 1.08, rosBuffer: 0.58, damageMemory: 0.12 },
    RedAlgae: { lightIntensity: 350, psiiWavelength: 675, psiWavelength: 700, excitationBalance: 0.48, temperature: 20, co2: 420, waterStress: 0.04, nutrients: 0.84, npq: 0.61, repair: 0.5, cyclic: 0.28, stomatalControl: 0.0, ccm: 0.36, antenna: 1.16, rosBuffer: 0.52, damageMemory: 0.1 },
};

export function speciesParams(key: SpeciesKey): Params {
    return {
        species: key,
        perturbation: 'Dawn-Noon-Dusk',
        adaptiveRouting: false,
        dynamicTopology: false,
        protonicHomeostasis: false,
        ...SPECIES_DEFAULTS[key],
    };
}

export const SPECIES_DESCRIPTIONS: Record<SpeciesKey, { label: string; question: string; expectation: string }> = {
    C3: {
        label: 'C3 Leaf',
        question: 'How does the most common photosynthetic strategy handle light stress?',
        expectation: 'Moderate light saturation, moderate NPQ. Vulnerable to photorespiration at high temperature and low CO2.',
    },
    C4: {
        label: 'C4 Grass',
        question: 'How does CO2 concentration via bundle-sheath cells change the landscape?',
        expectation: 'Higher light saturation, strong CCM. Better performance in hot, bright conditions but higher ATP demand.',
    },
    CAM: {
        label: 'CAM Succulent',
        question: 'How does temporal separation of CO2 fixation change water-stress tolerance?',
        expectation: 'High water tolerance, strong stomatal control. Lower peak assimilation but broader viable region under drought.',
    },
    Cyanobacteria: {
        label: 'Cyanobacteria',
        question: 'How does the prokaryotic photosynthetic design differ?',
        expectation: 'Strong CCM and repair. No stomata. High bifurcation threshold with fast D1 turnover.',
    },
    RedAlgae: {
        label: 'Red Algae',
        question: 'How does a low-light adapted organism handle its energy budget?',
        expectation: 'Large antenna, low light saturation. Efficient in dim conditions but vulnerable to photoinhibition under bright light.',
    },
};


// ── Helpers ────────────────────────────────────────────────────

const clamp = (x: number, min: number, max: number) => Math.min(max, Math.max(min, x));
const gauss = (x: number, mu: number, sigma: number) => Math.exp(-((x - mu) ** 2) / (2 * sigma ** 2));
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

function photonEnergyEV(wavelengthNm: number): number {
    return 1240 / wavelengthNm;
}

function photonEnergyJ(wavelengthNm: number): number {
    return (H * C_LIGHT) / (wavelengthNm * 1e-9);
}


// ── Core Simulation ─────────────────────────────────────────────

export function simulate(params: Params): Metrics {
    const sp = SPECIES[params.species];

    const psiiEV = photonEnergyEV(params.psiiWavelength);
    const psiEV = photonEnergyEV(params.psiWavelength);
    const avgPhotonJ = (photonEnergyJ(params.psiiWavelength) + photonEnergyJ(params.psiWavelength)) / 2;

    const absorbedPhotonFluxMol = params.lightIntensity * 1e-6 * clamp(0.82 * params.antenna, 0.45, 1.45);
    const incidentPowerDensity = absorbedPhotonFluxMol * AVOGADRO * avgPhotonJ;

    const excitationMismatch = Math.abs(params.excitationBalance - 0.5) * 2;
    const excitationFactor = clamp(1 - 0.86 * excitationMismatch, 0.22, 1);
    const effectiveNPQ = clamp(
        params.npq * sp.baseNPQ * (params.adaptiveRouting ? 1.08 : 1),
        0, 1.25,
    );

    const tempFactor = gauss(params.temperature, sp.tempOpt, sp.tempWidth);
    const co2Effective = params.co2 * (1 + params.ccm * sp.ccmStrength);
    const co2Factor = co2Effective / (co2Effective + sp.kCO2);
    const waterFactor = clamp(1 - params.waterStress * (1 - sp.waterTolerance), 0.05, 1);
    const nutrientFactor = clamp(0.42 + 0.58 * params.nutrients, 0.2, 1);
    const stomatalFactor = clamp(1 - 0.35 * params.waterStress + 0.22 * params.stomatalControl, 0.45, 1.12);
    const lightUse = (params.lightIntensity * params.antenna) /
        (params.lightIntensity * params.antenna + sp.lightHalfSat * (1 + 0.7 * effectiveNPQ));

    const stressDemand = clamp(
        0.22 + params.waterStress * 0.55 + Math.max(0, params.temperature - sp.tempOpt) / 22 + excitationMismatch * 0.45,
        0, 1.4,
    );
    const cyclicBenefit = 1 + params.cyclic * stressDemand * 0.34;
    const cyclicCost = 1 - 0.18 * params.cyclic;

    const repairCapacity = clamp(
        params.repair * sp.repairStrength + 0.28 * params.rosBuffer
        + (params.dynamicTopology ? 0.08 : 0) + (params.protonicHomeostasis ? 0.06 : 0),
        0, 1.6,
    );

    const rosLoad = clamp(
        (params.lightIntensity / 2100)
        * (0.52 + 0.72 * excitationMismatch + 0.5 * params.waterStress + Math.max(0, params.temperature - sp.tempOpt) / 18)
        * (1 - 0.62 * effectiveNPQ)
        * (1 - 0.2 * params.rosBuffer),
        0, 2.2,
    );

    const preconditioningGain = gauss(params.damageMemory, 0.24, 0.18) * repairCapacity * 0.13;
    const damagePenalty = clamp(params.damageMemory - repairCapacity * 0.42, 0, 1);

    const speculativeGain =
        (params.adaptiveRouting ? 0.04 : 0)
        + (params.dynamicTopology ? 0.05 : 0)
        + (params.protonicHomeostasis ? 0.04 : 0);

    const assimilation = clamp(
        100 * sp.assimilationBonus * lightUse * tempFactor * co2Factor * waterFactor * nutrientFactor
        * stomatalFactor * excitationFactor * cyclicCost * cyclicBenefit
        * (1 - 0.1 * effectiveNPQ)
        * (1 - 0.38 * damagePenalty + preconditioningGain + speculativeGain),
        0, 100,
    );

    const rosIndex = clamp(100 * clamp(rosLoad * (1 - 0.46 * repairCapacity) * (1 + params.damageMemory * 0.75), 0, 1.6), 0, 100);
    const damageIndex = clamp(100 * clamp((rosLoad - repairCapacity * 0.75) * (1 + 0.95 * params.damageMemory), 0, 1.4), 0, 100);

    const atpNadph = 1.22 + 0.42 * params.cyclic + 0.06 * stressDemand - 0.14 * co2Factor;
    const invariantDeviation = Math.abs(atpNadph - sp.atpTarget);
    const invariantScore = clamp(100 * clamp(1 - invariantDeviation / 0.85 - excitationMismatch * 0.32, 0, 1), 0, 100);

    const homeostasis = clamp(100 * clamp(
        0.98 - 0.28 * excitationMismatch
        - 0.35 * Math.max(0, rosLoad - repairCapacity * 0.66)
        - 0.18 * Math.abs(atpNadph - sp.atpTarget)
        - 0.08 * Math.abs(params.cyclic - 0.36)
        - 0.1 * params.damageMemory,
        0, 1,
    ), 0, 100);

    const bifurcationRisk = clamp(100 * sigmoid(
        4.4 * (
            (rosLoad - repairCapacity * 0.86)
            + 0.32 * params.damageMemory
            + Math.max(0, params.lightIntensity - sp.bifurcationLight) / 700
        ),
    ), 0, 100);

    const pathDependence = clamp(100 * clamp(
        0.24 + 0.58 * params.damageMemory + 0.12 * excitationMismatch - 0.18 * repairCapacity,
        0, 1,
    ), 0, 100);

    let attractor: AttractorRegime = 'Transition regime';
    if (bifurcationRisk > 78 || damageIndex > 55) attractor = 'Photoinhibition attractor';
    else if (homeostasis > 72 && rosIndex < 28) attractor = 'Homeostatic regime';
    else if (rosIndex > 34 || effectiveNPQ > 0.7) attractor = 'Protected regime';
    else if (assimilation > 60 && homeostasis > 55) attractor = 'Efficient regime';

    const zData: ZSchemeStep[] = [
        { stage: 'H₂O', energy: 0.15 },
        { stage: 'PSII*', energy: 0.15 + psiiEV },
        { stage: 'PQ', energy: 1.25 },
        { stage: 'Cyt b6f', energy: 0.92 },
        { stage: 'PC', energy: 0.74 },
        { stage: 'PSI*', energy: 0.74 + psiEV },
        { stage: 'Fd', energy: 1.55 },
        { stage: 'NADPH', energy: 1.18 },
    ];

    return {
        incidentPowerDensity, psiiEV, psiEV, excitationMismatch,
        assimilation, rosIndex, damageIndex, homeostasis,
        bifurcationRisk, pathDependence, invariantScore,
        atpNadph, repairCapacity, lightUse, effectiveNPQ,
        attractor, zData,
    };
}


// ── Landscape & Trajectory ──────────────────────────────────────

export function generateLandscape(params: Params): LandscapePoint[] {
    const points: LandscapePoint[] = [];
    for (let light = 0; light <= 2400; light += 100) {
        const m = simulate({ ...params, lightIntensity: light });
        points.push({
            light,
            fixation: Number(m.assimilation.toFixed(2)),
            ros: Number(m.rosIndex.toFixed(2)),
            homeostasis: Number(m.homeostasis.toFixed(2)),
        });
    }
    return points;
}

function profileLight(profile: PerturbationProfile, t: number, base: number): number {
    switch (profile) {
        case 'Steady': return base;
        case 'Dawn-Noon-Dusk': return base * Math.sin(Math.PI * t / 47) ** 1.7;
        case 'Cloud Flicker': return base * (0.45 + 0.4 * Math.sin(t * 0.31) ** 2 + 0.2 * Math.sin(t * 1.17 + 1.1) ** 2);
        case 'Heat Shock': return t < 14 ? base * 0.7 : t < 32 ? base * 1.15 : base * 0.8;
        case 'High-Light Pulse': return t > 18 && t < 30 ? base * 1.7 : base * 0.65;
    }
}

function profileTemp(profile: PerturbationProfile, t: number, base: number): number {
    switch (profile) {
        case 'Heat Shock': return t < 18 ? base : t < 34 ? base + 10 : base + 3;
        case 'Dawn-Noon-Dusk': return base + 6 * Math.sin(Math.PI * t / 47) ** 2;
        default: return base;
    }
}

export function generateTrajectory(params: Params): TrajectoryStep[] {
    const steps: TrajectoryStep[] = [];
    let memory = params.damageMemory;

    for (let t = 0; t < 48; t++) {
        const localParams: Params = {
            ...params,
            lightIntensity: profileLight(params.perturbation, t, params.lightIntensity),
            temperature: profileTemp(params.perturbation, t, params.temperature),
            damageMemory: memory,
        };
        const m = simulate(localParams);
        const netStress = clamp(m.rosIndex / 100 - m.repairCapacity * 0.36, -0.3, 0.9);
        memory = clamp(memory + netStress * 0.06 - params.repair * 0.015, 0, 1);

        steps.push({
            step: t,
            light: Number(localParams.lightIntensity.toFixed(0)),
            fixation: Number(m.assimilation.toFixed(2)),
            ros: Number(m.rosIndex.toFixed(2)),
            memory: Number((memory * 100).toFixed(2)),
            homeostasis: Number(m.homeostasis.toFixed(2)),
        });
    }
    return steps;
}


// ── Invariants ──────────────────────────────────────────────────

export function computeInvariants(metrics: Metrics, species: SpeciesTraits): InvariantCheck[] {
    return [
        {
            label: 'ATP:NADPH window',
            value: `${metrics.atpNadph.toFixed(2)} : 1`,
            ok: Math.abs(metrics.atpNadph - species.atpTarget) < 0.16,
        },
        {
            label: 'Excitation balance',
            value: `${((1 - metrics.excitationMismatch) * 100).toFixed(0)}% aligned`,
            ok: metrics.excitationMismatch < 0.2,
        },
        {
            label: 'Repair vs ROS',
            value: `${metrics.repairCapacity.toFixed(2)} vs ${(metrics.rosIndex / 100).toFixed(2)}`,
            ok: metrics.damageIndex < 35,
        },
        {
            label: 'Homeostatic slack',
            value: `${metrics.homeostasis.toFixed(0)} / 100`,
            ok: metrics.homeostasis > 65,
        },
    ];
}


// ── Narrative ──────────────────────────────────────────────────

export function computeNarrative(metrics: Metrics, params: Params): string {
    const parts: string[] = [];

    parts.push(`Regime: ${metrics.attractor}.`);

    if (metrics.rosIndex > 35 && params.npq < 0.65) {
        parts.push('Raise NPQ or enlarge the dissipative antenna fraction before pushing light harder.');
    }
    if (params.waterStress > 0.35 && params.stomatalControl < 0.7) {
        parts.push('Water stress is dominating. Stronger stomatal timing or CAM-like separation may help.');
    }
    if (metrics.excitationMismatch > 0.18) {
        parts.push('PSII/PSI excitation is imbalanced. Move balance closer to 0.50 to reduce ROS.');
    }
    if (metrics.damageIndex > 40 && params.repair < 0.65) {
        parts.push('D1 repair turnover is the bottleneck. Increase repair before increasing light or antenna.');
    }
    if (metrics.homeostasis < 55 && params.cyclic < 0.35) {
        parts.push('Cyclic electron flow is too low for this stress regime.');
    }
    if (parts.length === 1) {
        parts.push('This configuration is near a broad optimum. Probe path dependence via perturbation profiles.');
    }

    return parts.join(' ');
}


// ── Sweep & Sensitivity ────────────────────────────────────────

export const PARAM_SPECS: { key: SweepableParam; label: string; min: number; max: number }[] = [
    { key: 'lightIntensity', label: 'light intensity', min: 0, max: 2400 },
    { key: 'npq', label: 'NPQ', min: 0, max: 1 },
    { key: 'repair', label: 'repair', min: 0, max: 1 },
    { key: 'cyclic', label: 'cyclic e⁻ flow', min: 0, max: 1 },
    { key: 'waterStress', label: 'water stress', min: 0, max: 1 },
    { key: 'antenna', label: 'antenna size', min: 0.6, max: 1.4 },
];

export function computeSweep(params: Params, sweepKey: SweepableParam): SweepDatum[] {
    const spec = PARAM_SPECS.find(s => s.key === sweepKey);
    if (!spec) return [];

    const data: SweepDatum[] = [];
    for (let i = 0; i <= 50; i++) {
        const v = spec.min + (spec.max - spec.min) * (i / 50);
        const m = simulate({ ...params, [sweepKey]: v });
        data.push({
            sweepValue: v,
            assimilation: m.assimilation,
            rosIndex: m.rosIndex,
            homeostasis: m.homeostasis,
        });
    }
    return data;
}

export function computeSensitivity(params: Params): SensitivityBar[] {
    return PARAM_SPECS
        .map(spec => {
            const atMin = simulate({ ...params, [spec.key]: spec.min }).assimilation;
            const atMax = simulate({ ...params, [spec.key]: spec.max }).assimilation;
            return {
                label: spec.label,
                low: Math.min(atMin, atMax),
                high: Math.max(atMin, atMax),
            };
        })
        .sort((a, b) => (b.high - b.low) - (a.high - a.low));
}


// ── Animation ──────────────────────────────────────────────────

export function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
