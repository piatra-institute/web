// ---------- helpers ----------
const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const round = (n: number, d = 2) => Number(n.toFixed(d));


// ---------- types ----------

export type PresetKey = 'balanced' | 'wartime' | 'venture' | 'monopoly' | 'breakdown';

export interface Params {
    profitControl: number;
    excessProfitTax: number;
    monopolyRegulation: number;
    subsidy: number;
    publicRD: number;
    procurement: number;
    antitrust: number;
    openScience: number;
    talentMobility: number;
    capitalCost: number;
    safetyIntensity: number;
    energyAbundance: number;
    laborBargaining: number;
    horizon: number;
    preset: PresetKey;
}

export interface Events {
    aiShock: boolean;
    cheapNuclear: boolean;
    cisLunar: boolean;
    rtsc: boolean;
    automationWave: boolean;
}

export interface Metrics {
    frontierIndex: number;
    deploymentIndex: number;
    welfareIndex: number;
    concentrationIndex: number;
    shortageIndex: number;
    resilienceIndex: number;
    stateCapacityIndex: number;
    inequalityIndex: number;
    energyStressIndex: number;
    rentIndex: number;
    scienceStock: number;
}

export interface SimulationRecord {
    year: number;
    frontierIndex: number;
    deploymentIndex: number;
    rentIndex: number;
    concentrationIndex: number;
    shortageIndex: number;
    resilienceIndex: number;
    stateCapacityIndex: number;
    inequalityIndex: number;
    energyStressIndex: number;
    welfareIndex: number;
    scienceStock: number;
    [key: string]: number;
}

export interface SectorTableRow {
    sector: string;
    sectorKey: string;
    innovation: number;
    deployment: number;
    concentration: number;
    profit: number;
    shortage: number;
    resilience: number;
    strategic: number;
    typeFit: number;
    frontierIntensity: number;
}

export interface SectorDiagnostic {
    sector: string;
    bestInstrument: string;
    explanation: string;
}

export interface SimulationResult {
    records: SimulationRecord[];
    final: SimulationRecord;
    sectorTable: SectorTableRow[];
    diagnostics: SectorDiagnostic[];
}

export interface Snapshot {
    params: Params;
    events: Events;
    metrics: Metrics;
    label: string;
}

export interface SweepDatum {
    sweepValue: number;
    welfare: number;
    frontier: number;
    concentration: number;
}

export type SweepableParam = keyof Omit<Params, 'preset' | 'horizon'>;

export interface SensitivityBar {
    label: string;
    low: number;
    high: number;
}


// ---------- sector data ----------

export interface SectorDefinition {
    key: string;
    label: string;
    description: string;
    baseInnovation: number;
    capex: number;
    energy: number;
    monopolyLike: number;
    network: number;
    volatility: number;
    mission: number;
    safety: number;
    spillover: number;
    frontier: number;
}

export const SECTORS: SectorDefinition[] = [
    {
        key: 'AI', label: 'AI',
        description: 'Compute-intensive frontier sector with high network effects and energy demand.',
        baseInnovation: 0.088, capex: 0.62, energy: 0.78, monopolyLike: 0.28, network: 0.84,
        volatility: 0.80, mission: 0.72, safety: 0.72, spillover: 0.92, frontier: 0.95,
    },
    {
        key: 'Robotics', label: 'Robotics',
        description: 'Embodied automation; benefits from AI progress, cheap energy, and manufacturing scale.',
        baseInnovation: 0.072, capex: 0.72, energy: 0.64, monopolyLike: 0.24, network: 0.48,
        volatility: 0.62, mission: 0.66, safety: 0.62, spillover: 0.78, frontier: 0.78,
    },
    {
        key: 'Space', label: 'Private Space',
        description: 'Launch, in-space logistics, lunar systems, and orbital industry.',
        baseInnovation: 0.061, capex: 0.93, energy: 0.52, monopolyLike: 0.18, network: 0.40,
        volatility: 0.70, mission: 0.94, safety: 0.86, spillover: 0.66, frontier: 0.88,
    },
    {
        key: 'Nuclear', label: 'Private Nuclear',
        description: 'SMRs, advanced fission, and high-capital infrastructure with long regulatory horizons.',
        baseInnovation: 0.050, capex: 0.96, energy: 0.15, monopolyLike: 0.64, network: 0.18,
        volatility: 0.45, mission: 0.96, safety: 0.98, spillover: 0.76, frontier: 0.74,
    },
    {
        key: 'Superconductors', label: 'RTSC / Materials',
        description: 'Speculative frontier: materials science, cryogenics, grids, and manufacturing physics.',
        baseInnovation: 0.043, capex: 0.81, energy: 0.30, monopolyLike: 0.12, network: 0.16,
        volatility: 0.94, mission: 0.48, safety: 0.42, spillover: 0.97, frontier: 1.0,
    },
    {
        key: 'Biotech', label: 'Biotech',
        description: 'High-uncertainty translational science with long-cycle payoffs and strong public-good spillovers.',
        baseInnovation: 0.058, capex: 0.68, energy: 0.22, monopolyLike: 0.22, network: 0.26,
        volatility: 0.76, mission: 0.62, safety: 0.84, spillover: 0.88, frontier: 0.86,
    },
];

export const SECTOR_COLORS: Record<string, string> = {
    AI: '#84cc16',
    Robotics: '#a3e635',
    Space: '#f97316',
    Nuclear: '#f472b6',
    Superconductors: '#a78bfa',
    Biotech: '#60a5fa',
};


// ---------- presets ----------

export const PRESET_DESCRIPTIONS: Record<PresetKey, { label: string; question: string; expectation: string }> = {
    balanced: {
        label: 'balanced industrial policy',
        question: 'Can rent-targeting coexist with frontier experimentation?',
        expectation: 'Moderate welfare, broad innovation gains, low shortage risk.',
    },
    wartime: {
        label: 'wartime mobilization',
        question: 'What happens under high procurement, public R&D, and excess-profits capture?',
        expectation: 'Strong state capacity; works best in short mission-defined shocks.',
    },
    venture: {
        label: 'venture frontier',
        question: 'Does light-touch governance maximize frontier progress?',
        expectation: 'Fast scaling and high concentration; public control lags behind.',
    },
    monopoly: {
        label: 'regulated monopoly',
        question: 'Does utility-style regulation fit frontier sectors?',
        expectation: 'Good for natural monopolies; less suited to fast-changing markets.',
    },
    breakdown: {
        label: 'broad controls breakdown',
        question: 'What happens with heavy direct controls in a fragile economy?',
        expectation: 'Shortages, evasion, underinvestment, and welfare collapse.',
    },
};

export function presetParams(key: PresetKey): Params {
    const base = { horizon: 35, preset: key };
    switch (key) {
        case 'balanced':
            return {
                ...base, profitControl: 28, excessProfitTax: 36, monopolyRegulation: 58,
                subsidy: 42, publicRD: 62, procurement: 54, antitrust: 48, openScience: 58,
                talentMobility: 60, capitalCost: 34, safetyIntensity: 50, energyAbundance: 45,
                laborBargaining: 44,
            };
        case 'wartime':
            return {
                ...base, profitControl: 42, excessProfitTax: 72, monopolyRegulation: 62,
                subsidy: 70, publicRD: 86, procurement: 90, antitrust: 36, openScience: 54,
                talentMobility: 70, capitalCost: 28, safetyIntensity: 52, energyAbundance: 62,
                laborBargaining: 58,
            };
        case 'venture':
            return {
                ...base, profitControl: 8, excessProfitTax: 12, monopolyRegulation: 18,
                subsidy: 24, publicRD: 34, procurement: 26, antitrust: 16, openScience: 50,
                talentMobility: 72, capitalCost: 18, safetyIntensity: 24, energyAbundance: 44,
                laborBargaining: 24,
            };
        case 'monopoly':
            return {
                ...base, profitControl: 22, excessProfitTax: 30, monopolyRegulation: 84,
                subsidy: 18, publicRD: 26, procurement: 32, antitrust: 28, openScience: 34,
                talentMobility: 34, capitalCost: 46, safetyIntensity: 68, energyAbundance: 56,
                laborBargaining: 52,
            };
        case 'breakdown':
            return {
                ...base, profitControl: 84, excessProfitTax: 44, monopolyRegulation: 30,
                subsidy: 10, publicRD: 16, procurement: 18, antitrust: 20, openScience: 14,
                talentMobility: 18, capitalCost: 82, safetyIntensity: 62, energyAbundance: 16,
                laborBargaining: 48,
            };
    }
}

export const DEFAULT_PARAMS: Params = presetParams('balanced');

export const DEFAULT_EVENTS: Events = {
    aiShock: true,
    cheapNuclear: false,
    cisLunar: false,
    rtsc: false,
    automationWave: true,
};


// ---------- policy metadata ----------

export const POLICY_META: [string, string, string][] = [
    ['profitControl', 'direct profit / margin control', 'Hard administrative control of returns; dangerous in volatile sectors.'],
    ['excessProfitTax', 'excess-profits tax', 'Targets windfalls and rents above normal returns.'],
    ['monopolyRegulation', 'monopoly regulation', 'Rate-of-return or utility-style governance for structural monopolies.'],
    ['subsidy', 'subsidies / tax credits', 'Shifts the private payoff frontier; relevant for capex-heavy sectors.'],
    ['publicRD', 'public R&D', 'Basic research, labs, translational science, long-horizon infrastructure.'],
    ['procurement', 'public procurement', 'Mission demand: defense, health, grid buildout, launch contracts.'],
    ['antitrust', 'antitrust / competition', 'Constrains concentration and platform lock-in.'],
    ['openScience', 'open science', 'Publication, standards, talent circulation, precompetitive diffusion.'],
    ['talentMobility', 'talent mobility', 'Ability of people and teams to move, found firms, recombine knowledge.'],
    ['capitalCost', 'cost of capital', 'High values mean expensive financing; heavy capex sectors suffer most.'],
    ['safetyIntensity', 'safety / licensing intensity', 'Necessary in hazardous sectors, can slow deployment when excessive.'],
    ['energyAbundance', 'energy abundance', 'Cheap available power matters for AI, robotics, and industrial buildout.'],
    ['laborBargaining', 'labor bargaining power', 'Shapes distribution, adoption politics, whether gains become social.'],
];


// ---------- historical cases ----------

export interface HistoricalCase {
    title: string;
    period: string;
    verdict: string;
    why: string;
    label: string;
}

export const HISTORICAL_CASES: HistoricalCase[] = [
    {
        title: 'WWI / WWII Excess-Profits Regimes',
        period: '1917-1945',
        verdict: 'Often good when temporary and targeted',
        why: 'Windfall capture during wartime can tax rents while preserving normal returns and procurement-driven expansion.',
        label: 'Rent capture',
    },
    {
        title: 'Utility Rate-of-Return Regulation',
        period: '20th century onward',
        verdict: 'Often good in natural monopolies',
        why: 'Electricity, water, and grids can justify regulated returns because duplicative competition is structurally wasteful.',
        label: 'Monopoly discipline',
    },
    {
        title: 'Broad Profit / Price Controls',
        period: 'Late 20th / early 21st century',
        verdict: 'Often bad in fragile economies',
        why: 'The state cannot infer replacement costs fast enough; shortages, black markets, and underinvestment emerge.',
        label: 'Control failure',
    },
    {
        title: 'Late-20th-Century Deregulation Waves',
        period: '1980s-2000s',
        verdict: 'Mixed',
        why: 'Can raise efficiency in some sectors, but in networked industries may entrench concentration and rent extraction.',
        label: 'Efficiency vs rent',
    },
];


// ---------- param specs for sweep ----------

export const PARAM_SPECS: { key: SweepableParam; label: string; min: number; max: number }[] = [
    { key: 'profitControl', label: 'profit control', min: 0, max: 100 },
    { key: 'excessProfitTax', label: 'excess-profits tax', min: 0, max: 100 },
    { key: 'monopolyRegulation', label: 'monopoly regulation', min: 0, max: 100 },
    { key: 'subsidy', label: 'subsidies', min: 0, max: 100 },
    { key: 'publicRD', label: 'public R&D', min: 0, max: 100 },
    { key: 'procurement', label: 'procurement', min: 0, max: 100 },
    { key: 'antitrust', label: 'antitrust', min: 0, max: 100 },
    { key: 'openScience', label: 'open science', min: 0, max: 100 },
    { key: 'talentMobility', label: 'talent mobility', min: 0, max: 100 },
    { key: 'capitalCost', label: 'cost of capital', min: 0, max: 100 },
    { key: 'safetyIntensity', label: 'safety intensity', min: 0, max: 100 },
    { key: 'energyAbundance', label: 'energy abundance', min: 0, max: 100 },
    { key: 'laborBargaining', label: 'labor bargaining', min: 0, max: 100 },
];


// ---------- simulation ----------

interface SectorState {
    knowledge: number;
    deployment: number;
    concentration: number;
    profitability: number;
    shortage: number;
    resilience: number;
    strategic: number;
    breakthrough: number;
}

export function simulate(params: Params, events: Events, years?: number): SimulationResult {
    const startYear = 2026;
    const nYears = years ?? params.horizon;
    const records: SimulationRecord[] = [];
    const sectorState: Record<string, SectorState> = {};

    SECTORS.forEach((s) => {
        sectorState[s.key] = {
            knowledge: 0.18 + s.baseInnovation,
            deployment: 0.12,
            concentration: 0.32 + s.network * 0.18,
            profitability: 0.16,
            shortage: 0,
            resilience: 0.22,
            strategic: 0.16,
            breakthrough: 0,
        };
    });

    let cumulativeScience = 0.24;

    for (let i = 0; i < nYears; i++) {
        const year = startYear + i;

        const eventPulse = {
            aiShock: events.aiShock && year >= 2030 ? 1 : 0,
            cheapNuclear: events.cheapNuclear && year >= 2034 ? 1 : 0,
            cisLunar: events.cisLunar && year >= 2036 ? 1 : 0,
            rtsc: events.rtsc && year >= 2038 ? 1 : 0,
            automationWave: events.automationWave && year >= 2031 ? 1 : 0,
        };

        let totalInnovation = 0;
        let totalDeployment = 0;
        let totalConcentration = 0;
        let totalProfit = 0;
        let totalShortage = 0;
        let totalWelfare = 0;
        let totalStateCapacity = 0;
        let totalInequality = 0;
        let totalEnergyStress = 0;
        let totalResilience = 0;

        const snapshot: Record<string, number> = { year };

        const aiKnowledgeSpill = sectorState.AI.knowledge;
        const nuclearDeployment = sectorState.Nuclear.deployment;
        const materialsKnowledge = sectorState.Superconductors.knowledge;

        SECTORS.forEach((s) => {
            const st = sectorState[s.key];

            const controlPenalty = (params.profitControl / 100) * s.volatility * 0.88;
            const windfallTaxPenalty = (params.excessProfitTax / 100) * (1 - s.monopolyLike) * 0.16;
            const monopolyBenefit = (params.monopolyRegulation / 100) * s.monopolyLike * 0.52;
            const subsidyBoost = (params.subsidy / 100) * (0.38 + s.capex * 0.5);
            const publicScienceBoost = (params.publicRD / 100) * (0.42 + s.spillover * 0.46);
            const procurementBoost = (params.procurement / 100) * s.mission * 0.58;
            const antitrustBenefit = (params.antitrust / 100) * (0.20 + s.network * 0.36);
            const openScienceBoost = (params.openScience / 100) * (0.34 + s.spillover * 0.34);
            const talentBoost = (params.talentMobility / 100) * (0.28 + s.frontier * 0.28);
            const capitalPenalty = (params.capitalCost / 100) * s.capex * 0.76;
            const safetyPenalty = (params.safetyIntensity / 100) * s.safety * 0.44;
            const safetyBenefit = (params.safetyIntensity / 100) * s.safety * 0.26;
            const energyBoost = (params.energyAbundance / 100) * s.energy * 0.72;
            const laborDistribution = (params.laborBargaining / 100) * (0.14 + s.network * 0.12);

            const AIExternality = aiKnowledgeSpill * (s.key === 'AI' ? 0.22 : s.key === 'Robotics' ? 0.34 : 0.12);
            const nuclearExternality = nuclearDeployment * (s.energy * 0.18);
            const materialsExternality = materialsKnowledge * (s.key === 'AI' || s.key === 'Robotics' ? 0.12 : 0.07);

            const eventBoost =
                (eventPulse.aiShock ? (s.key === 'AI' ? 0.16 : s.key === 'Robotics' ? 0.09 : 0.03) : 0) +
                (eventPulse.cheapNuclear ? (s.key === 'Nuclear' ? 0.20 : s.energy * 0.08) : 0) +
                (eventPulse.cisLunar ? (s.key === 'Space' ? 0.22 : s.key === 'AI' ? 0.03 : 0) : 0) +
                (eventPulse.rtsc ? (s.key === 'Superconductors' ? 0.26 : s.key === 'AI' || s.key === 'Robotics' ? 0.08 : 0.02) : 0) +
                (eventPulse.automationWave ? (s.key === 'Robotics' ? 0.16 : s.key === 'AI' ? 0.07 : 0.01) : 0);

            const scienceImpulse =
                s.baseInnovation +
                subsidyBoost +
                publicScienceBoost +
                procurementBoost +
                openScienceBoost +
                talentBoost +
                energyBoost +
                AIExternality +
                nuclearExternality +
                materialsExternality +
                eventBoost -
                controlPenalty -
                windfallTaxPenalty -
                capitalPenalty -
                safetyPenalty -
                st.concentration * 0.11;

            const innovation = clamp(
                st.knowledge + scienceImpulse * (1 - st.knowledge) * 0.18,
                0, 1.6,
            );

            const scaleReadiness =
                0.32 * innovation +
                0.26 * procurementBoost +
                0.22 * subsidyBoost +
                0.18 * energyBoost -
                0.20 * capitalPenalty -
                0.14 * safetyPenalty;

            const deployment = clamp(
                st.deployment + sigmoid(scaleReadiness - 0.34) * 0.10 + monopolyBenefit * 0.03,
                0, 1.4,
            );

            const structuralRent = clamp(
                0.28 + s.network * 0.30 + s.monopolyLike * 0.22 + deployment * 0.10 - antitrustBenefit * 0.12,
                0, 1,
            );

            const profitability = clamp(
                0.18 +
                deployment * 0.28 +
                innovation * 0.12 +
                structuralRent * 0.26 -
                (params.excessProfitTax / 100) * structuralRent * 0.24 -
                (params.profitControl / 100) * s.volatility * 0.30 -
                laborDistribution * 0.10,
                0, 1.2,
            );

            const concentration = clamp(
                st.concentration +
                s.network * 0.035 +
                profitability * 0.024 -
                antitrustBenefit * 0.038 -
                monopolyBenefit * 0.010,
                0, 1,
            );

            const shortage = clamp(
                (params.profitControl / 100) * s.volatility * (1 - params.energyAbundance / 100) * 0.58 +
                (params.capitalCost / 100) * s.capex * 0.22 -
                subsidyBoost * 0.14 -
                procurementBoost * 0.08,
                0, 1,
            );

            const resilience = clamp(
                st.resilience +
                publicScienceBoost * 0.06 +
                monopolyBenefit * 0.03 +
                safetyBenefit * 0.05 +
                openScienceBoost * 0.03 -
                concentration * 0.04,
                0, 1.4,
            );

            const strategic = clamp(
                st.strategic + procurementBoost * 0.08 + publicScienceBoost * 0.04 + deployment * 0.03,
                0, 1.5,
            );

            const breakthrough = clamp(
                st.breakthrough +
                (s.key === 'Superconductors' ? (innovation * 0.06 + (events.rtsc ? 0.03 : 0)) : 0) +
                (s.key === 'AI' ? innovation * 0.015 : 0),
                0, 1,
            );

            const consumerBenefit = deployment * 0.34 + innovation * 0.24 + energyBoost * 0.10 - shortage * 0.24;
            const inequality = clamp(profitability * 0.30 + concentration * 0.26 - laborDistribution * 0.18, 0, 1);
            const welfare = consumerBenefit + strategic * 0.14 + resilience * 0.12 - inequality * 0.24;
            const energyStress = clamp(
                (s.energy * deployment * 0.50) - (params.energyAbundance / 100) * 0.38 - nuclearExternality * 0.18 - materialsExternality * 0.08,
                0, 1,
            );

            sectorState[s.key] = {
                knowledge: innovation,
                deployment,
                concentration,
                profitability,
                shortage,
                resilience,
                strategic,
                breakthrough,
            };

            snapshot[`${s.key}_innovation`] = round(innovation * 100, 1);
            snapshot[`${s.key}_deployment`] = round(deployment * 100, 1);
            snapshot[`${s.key}_concentration`] = round(concentration * 100, 1);
            snapshot[`${s.key}_profit`] = round(profitability * 100, 1);
            snapshot[`${s.key}_shortage`] = round(shortage * 100, 1);
            snapshot[`${s.key}_resilience`] = round(resilience * 100, 1);
            snapshot[`${s.key}_strategic`] = round(strategic * 100, 1);

            totalInnovation += innovation;
            totalDeployment += deployment;
            totalConcentration += concentration;
            totalProfit += profitability;
            totalShortage += shortage;
            totalWelfare += welfare;
            totalStateCapacity += strategic;
            totalInequality += inequality;
            totalEnergyStress += energyStress;
            totalResilience += resilience;
        });

        cumulativeScience = clamp(cumulativeScience + totalInnovation * 0.006, 0, 3);

        snapshot.frontierIndex = round((totalInnovation / SECTORS.length) * 100, 1);
        snapshot.deploymentIndex = round((totalDeployment / SECTORS.length) * 100, 1);
        snapshot.rentIndex = round((totalProfit / SECTORS.length) * 100, 1);
        snapshot.concentrationIndex = round((totalConcentration / SECTORS.length) * 100, 1);
        snapshot.shortageIndex = round((totalShortage / SECTORS.length) * 100, 1);
        snapshot.resilienceIndex = round((totalResilience / SECTORS.length) * 100, 1);
        snapshot.stateCapacityIndex = round((totalStateCapacity / SECTORS.length) * 100, 1);
        snapshot.inequalityIndex = round((totalInequality / SECTORS.length) * 100, 1);
        snapshot.energyStressIndex = round((totalEnergyStress / SECTORS.length) * 100, 1);
        snapshot.welfareIndex = round((totalWelfare / SECTORS.length) * 100, 1);
        snapshot.scienceStock = round(cumulativeScience * 100, 1);

        records.push(snapshot as unknown as SimulationRecord);
    }

    const final = records[records.length - 1];

    const sectorTable: SectorTableRow[] = SECTORS.map((s) => ({
        sector: s.label,
        sectorKey: s.key,
        innovation: final[`${s.key}_innovation`],
        deployment: final[`${s.key}_deployment`],
        concentration: final[`${s.key}_concentration`],
        profit: final[`${s.key}_profit`],
        shortage: final[`${s.key}_shortage`],
        resilience: final[`${s.key}_resilience`],
        strategic: final[`${s.key}_strategic`],
        typeFit: round(s.monopolyLike * 100, 0),
        frontierIntensity: round(s.frontier * 100, 0),
    }));

    const diagnostics: SectorDiagnostic[] = SECTORS.map((s) => {
        const controlFit = s.monopolyLike * 0.72 - s.volatility * 0.38;
        const rentTaxFit = s.network * 0.30 + s.monopolyLike * 0.26;
        const innovationStateFit = s.frontier * 0.42 + s.spillover * 0.30 + s.capex * 0.16;
        const utilityFit = s.monopolyLike * 0.82;

        const candidates = [
            { k: 'Direct control', v: controlFit },
            { k: 'Excess-profits tax', v: rentTaxFit },
            { k: 'Public R&D + procurement', v: innovationStateFit },
            { k: 'Utility-style regulation', v: utilityFit },
        ].sort((a, b) => b.v - a.v);
        const winner = candidates[0];

        return {
            sector: s.label,
            bestInstrument: winner.k,
            explanation:
                winner.k === 'Direct control'
                    ? 'Only conditionally defensible; this sector is still vulnerable to shortages if controls are too blunt.'
                    : winner.k === 'Excess-profits tax'
                        ? 'Best when profits reflect network rents or shock windfalls more than true innovation margins.'
                        : winner.k === 'Utility-style regulation'
                            ? 'Best when the sector behaves like essential infrastructure or a natural monopoly.'
                            : 'Best when the problem is frontier uncertainty and positive spillovers rather than monopoly pricing.',
        };
    });

    return { records, final, sectorTable, diagnostics };
}


// ---------- metrics from final record ----------

export function extractMetrics(final: SimulationRecord): Metrics {
    return {
        frontierIndex: final.frontierIndex,
        deploymentIndex: final.deploymentIndex,
        welfareIndex: final.welfareIndex,
        concentrationIndex: final.concentrationIndex,
        shortageIndex: final.shortageIndex,
        resilienceIndex: final.resilienceIndex,
        stateCapacityIndex: final.stateCapacityIndex,
        inequalityIndex: final.inequalityIndex,
        energyStressIndex: final.energyStressIndex,
        rentIndex: final.rentIndex,
        scienceStock: final.scienceStock,
    };
}


// ---------- narrative ----------

export function computeNarrative(metrics: Metrics, params: Params): string {
    const parts: string[] = [];

    if (metrics.welfareIndex > 30) {
        parts.push(`Welfare index at ${metrics.welfareIndex.toFixed(1)} indicates a productive governance regime.`);
    } else if (metrics.welfareIndex > 10) {
        parts.push(`Welfare index at ${metrics.welfareIndex.toFixed(1)} is moderate; gains exist but are constrained.`);
    } else {
        parts.push(`Welfare index at ${metrics.welfareIndex.toFixed(1)} signals governance failure or severe imbalance.`);
    }

    if (params.profitControl > 60) {
        parts.push('High direct profit control is suppressing supply in volatile sectors.');
    }

    if (metrics.shortageIndex > 15) {
        parts.push(`Shortage risk at ${metrics.shortageIndex.toFixed(1)} suggests administrative friction is binding.`);
    }

    if (metrics.concentrationIndex > 55) {
        parts.push(`Concentration at ${metrics.concentrationIndex.toFixed(1)} raises monopoly rent concerns.`);
    }

    if (params.publicRD > 70 && params.procurement > 70) {
        parts.push('Strong public R&D and procurement are driving frontier science but may crowd out private experimentation.');
    }

    if (metrics.frontierIndex > 60) {
        parts.push('Frontier innovation is thriving across sectors.');
    }

    if (params.energyAbundance < 25) {
        parts.push('Energy scarcity is a binding constraint on compute-intensive and industrial sectors.');
    }

    return parts.join(' ');
}


// ---------- sweep ----------

export function computeSweep(
    params: Params,
    events: Events,
    sweepKey: SweepableParam,
): SweepDatum[] {
    const spec = PARAM_SPECS.find(s => s.key === sweepKey);
    if (!spec) return [];
    const data: SweepDatum[] = [];
    for (let i = 0; i <= 50; i++) {
        const v = spec.min + (spec.max - spec.min) * (i / 50);
        const sim = simulate({ ...params, [sweepKey]: v }, events);
        const f = sim.final;
        data.push({
            sweepValue: round(v, 1),
            welfare: f.welfareIndex,
            frontier: f.frontierIndex,
            concentration: f.concentrationIndex,
        });
    }
    return data;
}


// ---------- sensitivity ----------

export function computeSensitivity(params: Params, events: Events): SensitivityBar[] {
    const baseWelfare = simulate(params, events).final.welfareIndex;
    const bars: SensitivityBar[] = [];

    for (const spec of PARAM_SPECS) {
        const lowSim = simulate({ ...params, [spec.key]: spec.min }, events);
        const highSim = simulate({ ...params, [spec.key]: spec.max }, events);
        bars.push({
            label: spec.label,
            low: lowSim.final.welfareIndex,
            high: highSim.final.welfareIndex,
        });
    }

    bars.sort((a, b) => Math.abs(b.high - b.low) - Math.abs(a.high - a.low));
    void baseWelfare;
    return bars;
}


// ---------- focus metric options ----------

export const FOCUS_METRICS: { key: string; label: string }[] = [
    { key: 'welfareIndex', label: 'Welfare index' },
    { key: 'frontierIndex', label: 'Frontier index' },
    { key: 'deploymentIndex', label: 'Deployment index' },
    { key: 'concentrationIndex', label: 'Concentration index' },
    { key: 'shortageIndex', label: 'Shortage index' },
    { key: 'stateCapacityIndex', label: 'State capacity' },
    { key: 'energyStressIndex', label: 'Energy stress' },
    { key: 'inequalityIndex', label: 'Inequality index' },
];
