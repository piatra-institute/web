// ── Moral Phase Space ────────────────────────────────────────────
// Three non-crude moral formalisms applied to the same political
// scenario: deontic logic (rights as hard constraints), capability
// lattice (Sen/Nussbaum real freedoms), and a domination/repair
// state-space. A naive utility score is included as a foil.
// ─────────────────────────────────────────────────────────────────

import type { SensitivityBar } from '@/components/SensitivityAnalysis';

// ── Types ────────────────────────────────────────────────────────

export interface Params {
    preset: PresetKey;
    arbitraryDetention: number;
    discrimination: number;
    dueProcess: number;
    politicalParticipation: number;
    bodilyIntegrity: number;
    educationAccess: number;
    healthAccess: number;
    mobility: number;
    speechFreedom: number;
    repairCapacity: number;
    dominationPersistence: number;
    futureWelfarePromise: number;
    targetedGroupBurden: number;
}

export type PresetKey = 'status-quo' | 'segregation' | 'emergency' | 'reparative';

export const PRESET_DESCRIPTIONS: Record<PresetKey, { label: string; question: string; expectation: string }> = {
    'status-quo': {
        label: 'Fragile plural democracy',
        question: 'How does a flawed but functioning democracy score across moral frameworks?',
        expectation: 'Moderate scores with no hard violations, but visible gaps in repair capacity and domination persistence.',
    },
    'segregation': {
        label: 'Segregation regime',
        question: 'Why is segregation wrong even when aggregate welfare metrics look tolerable?',
        expectation: 'Deontic logic flags multiple hard violations. Capability floor collapses. State-space shows entrenched domination basin.',
    },
    'emergency': {
        label: 'Emergency powers / security state',
        question: 'Can future welfare promises justify current rights restrictions?',
        expectation: 'High future-welfare rhetoric masks deontic violations. Naive utility rates it too generously. State-space reveals drift toward domination.',
    },
    'reparative': {
        label: 'Reparative constitutional order',
        question: 'What does a well-functioning rights order look like across all frameworks?',
        expectation: 'No deontic violations. High capability floor. Repair-and-stabilization basin. Naive utility agrees but for shallower reasons.',
    },
};

export function presetParams(key: PresetKey): Params {
    switch (key) {
        case 'segregation':
            return {
                preset: key,
                arbitraryDetention: 42, discrimination: 88, dueProcess: 44,
                politicalParticipation: 36, bodilyIntegrity: 61, educationAccess: 38,
                healthAccess: 45, mobility: 41, speechFreedom: 52,
                repairCapacity: 24, dominationPersistence: 81,
                futureWelfarePromise: 41, targetedGroupBurden: 87,
            };
        case 'emergency':
            return {
                preset: key,
                arbitraryDetention: 63, discrimination: 31, dueProcess: 33,
                politicalParticipation: 49, bodilyIntegrity: 58, educationAccess: 70,
                healthAccess: 68, mobility: 46, speechFreedom: 37,
                repairCapacity: 36, dominationPersistence: 59,
                futureWelfarePromise: 71, targetedGroupBurden: 51,
            };
        case 'reparative':
            return {
                preset: key,
                arbitraryDetention: 6, discrimination: 9, dueProcess: 91,
                politicalParticipation: 86, bodilyIntegrity: 92, educationAccess: 84,
                healthAccess: 81, mobility: 87, speechFreedom: 88,
                repairCapacity: 89, dominationPersistence: 11,
                futureWelfarePromise: 28, targetedGroupBurden: 7,
            };
        default: // status-quo
            return {
                preset: key,
                arbitraryDetention: 12, discrimination: 18, dueProcess: 78,
                politicalParticipation: 76, bodilyIntegrity: 82, educationAccess: 75,
                healthAccess: 72, mobility: 80, speechFreedom: 79,
                repairCapacity: 62, dominationPersistence: 28,
                futureWelfarePromise: 35, targetedGroupBurden: 18,
            };
    }
}

export const DEFAULT_PARAMS: Params = presetParams('status-quo');


// ── Utility ──────────────────────────────────────────────────────

function clamp(v: number, lo = 0, hi = 100): number {
    return Math.max(lo, Math.min(hi, v));
}


// ── Slider specs ─────────────────────────────────────────────────

export interface ParamSpec {
    key: keyof Omit<Params, 'preset'>;
    label: string;
    section: string;
}

export const PARAM_SPECS: ParamSpec[] = [
    { key: 'arbitraryDetention', label: 'Arbitrary detention', section: 'Rights indicators' },
    { key: 'discrimination', label: 'Discrimination', section: 'Rights indicators' },
    { key: 'dueProcess', label: 'Due process', section: 'Rights indicators' },
    { key: 'speechFreedom', label: 'Speech freedom', section: 'Rights indicators' },
    { key: 'bodilyIntegrity', label: 'Bodily integrity', section: 'Capabilities' },
    { key: 'politicalParticipation', label: 'Political participation', section: 'Capabilities' },
    { key: 'educationAccess', label: 'Education access', section: 'Capabilities' },
    { key: 'healthAccess', label: 'Health access', section: 'Capabilities' },
    { key: 'mobility', label: 'Mobility', section: 'Capabilities' },
    { key: 'repairCapacity', label: 'Repair capacity', section: 'Institutional dynamics' },
    { key: 'dominationPersistence', label: 'Domination persistence', section: 'Institutional dynamics' },
    { key: 'futureWelfarePromise', label: 'Future welfare promise', section: 'Institutional dynamics' },
    { key: 'targetedGroupBurden', label: 'Targeted group burden', section: 'Institutional dynamics' },
];


// ── Deontic logic ────────────────────────────────────────────────

export type DeonticStatus = 'Forbidden' | 'Conditionally permissible' | 'Permissible';

export interface DeonticResult {
    forbidden: boolean;
    status: DeonticStatus;
    severity: number;
    violations: string[];
    obligations: string[];
    permissions: string[];
}

export function scoreDeontic(s: Params): DeonticResult {
    const violations: string[] = [];
    const obligations: string[] = [];
    const permissions: string[] = [];

    if (s.arbitraryDetention > 15) violations.push('No arbitrary detention');
    if (s.discrimination > 20 || s.targetedGroupBurden > 25) violations.push('Equal civic standing / non-discrimination');
    if (s.dueProcess < 65) violations.push('Due process safeguards');
    if (s.bodilyIntegrity < 70) violations.push('Bodily integrity and security');
    if (s.politicalParticipation < 55) violations.push('Political participation and voice');
    if (s.speechFreedom < 55) violations.push('Public speech and dissent');

    if (s.repairCapacity >= 70) obligations.push('Institutional duty to repair and review harms is active');
    if (s.discrimination <= 20 && s.targetedGroupBurden <= 20) obligations.push('Equal protection is being substantively maintained');
    if (s.dueProcess >= 80) obligations.push('Adjudication and review mechanisms are functioning robustly');

    if (violations.length === 0) permissions.push('Policy space remains broadly admissible');
    if (s.futureWelfarePromise > 70 && violations.length > 0) permissions.push('Future welfare rhetoric does not override current prohibitions');
    if (s.futureWelfarePromise > 70 && violations.length === 0) permissions.push('Long-run benefit can matter only after constraints are respected');

    const forbidden = violations.length > 0;
    const severity = clamp(
        violations.length * 14 +
        Math.max(0, s.arbitraryDetention - 10) * 0.25 +
        Math.max(0, s.discrimination - 10) * 0.22 +
        Math.max(0, 70 - s.bodilyIntegrity) * 0.2 +
        Math.max(0, 65 - s.dueProcess) * 0.22 +
        Math.max(0, s.targetedGroupBurden - 20) * 0.25,
    );

    return {
        forbidden,
        status: forbidden ? 'Forbidden' : severity > 18 ? 'Conditionally permissible' : 'Permissible',
        severity,
        violations,
        obligations,
        permissions,
    };
}


// ── Capability lattice ───────────────────────────────────────────

export interface CapabilityDatum {
    key: string;
    label: string;
    value: number;
}

export interface CapabilityResult {
    data: CapabilityDatum[];
    floor: number;
    mean: number;
    adjusted: number;
    antiDominationPenalty: number;
    partialOrderClass: string;
}

export function scoreCapabilities(s: Params): CapabilityResult {
    const data: CapabilityDatum[] = [
        { key: 'bodilyIntegrity', label: 'Body', value: s.bodilyIntegrity },
        { key: 'mobility', label: 'Move', value: s.mobility },
        { key: 'speechFreedom', label: 'Speak', value: s.speechFreedom },
        { key: 'politicalParticipation', label: 'Participate', value: s.politicalParticipation },
        { key: 'educationAccess', label: 'Learn', value: s.educationAccess },
        { key: 'healthAccess', label: 'Health', value: s.healthAccess },
        { key: 'dueProcess', label: 'Contest', value: s.dueProcess },
    ];

    const floor = Math.min(...data.map(d => d.value));
    const mean = data.reduce((acc, d) => acc + d.value, 0) / data.length;
    const antiDominationPenalty = (s.discrimination + s.targetedGroupBurden + s.dominationPersistence) / 3;
    const adjusted = clamp(mean * 0.7 + floor * 0.3 - antiDominationPenalty * 0.28);

    const partialOrderClass =
        floor >= 75 && antiDominationPenalty < 20
            ? 'High floor / robustly superior'
            : floor >= 55 && antiDominationPenalty < 35
            ? 'Mixed but decent'
            : floor >= 35
            ? 'Non-dominated only in some dimensions'
            : 'Dominated / beneath capability floor';

    return { data, floor, mean, adjusted, antiDominationPenalty, partialOrderClass };
}


// ── State-space trajectory ───────────────────────────────────────

export interface TrajectoryPoint {
    step: number;
    domination: number;
    repair: number;
    risk: number;
    size: number;
}

export interface TrajectoryResult {
    points: TrajectoryPoint[];
    basin: string;
    currentRisk: number;
}

export function simulateTrajectory(s: Params): TrajectoryResult {
    const startDom = clamp(s.dominationPersistence * 0.85 + s.discrimination * 0.15);
    const startRepair = clamp(s.repairCapacity * 0.9 + s.dueProcess * 0.1);

    const points: TrajectoryPoint[] = [];
    let dom = startDom;
    let repair = startRepair;

    for (let t = 0; t < 8; t++) {
        const coercionPush = s.arbitraryDetention * 0.06 + s.targetedGroupBurden * 0.05;
        const legitimationPush = s.futureWelfarePromise * 0.03;
        const repairPull = repair * 0.07;
        const rightsPull = (s.dueProcess + s.bodilyIntegrity + s.speechFreedom) / 3 * 0.045;

        dom = clamp(dom + coercionPush + legitimationPush - repairPull - rightsPull + (t > 3 ? 2 : 0));
        repair = clamp(repair + s.repairCapacity * 0.045 + s.politicalParticipation * 0.025 - dom * 0.03);

        points.push({
            step: t,
            domination: Math.round(dom),
            repair: Math.round(repair),
            risk: Math.round(clamp(dom - repair + s.targetedGroupBurden * 0.2)),
            size: Math.round(clamp(8 + Math.abs(dom - repair) * 0.18, 8, 22)),
        });
    }

    const last = points[points.length - 1];
    const basin =
        last.domination >= 65 && last.repair < 45
            ? 'Entrenched domination basin'
            : last.repair >= 65 && last.domination < 35
            ? 'Repair-and-stabilization basin'
            : 'Contested transitional basin';

    return { points, basin, currentRisk: last.risk };
}


// ── Naive utility (foil) ─────────────────────────────────────────

export function naiveUtility(s: Params): number {
    return clamp(
        s.futureWelfarePromise * 0.34 +
        s.healthAccess * 0.12 +
        s.educationAccess * 0.1 +
        s.mobility * 0.08 +
        s.politicalParticipation * 0.06 +
        s.speechFreedom * 0.05 -
        s.arbitraryDetention * 0.1 -
        s.discrimination * 0.08 -
        s.targetedGroupBurden * 0.07,
    );
}


// ── Framework summary ────────────────────────────────────────────

export interface FrameworkRow {
    framework: string;
    value: number;
    note: string;
}

export function frameworkSummary(s: Params): FrameworkRow[] {
    const d = scoreDeontic(s);
    const c = scoreCapabilities(s);
    const st = simulateTrajectory(s);
    const u = naiveUtility(s);

    return [
        {
            framework: 'Deontic logic',
            value: 100 - d.severity,
            note: d.forbidden ? 'Inadmissible because constraints are breached' : 'Admissible before further comparison',
        },
        {
            framework: 'Capability lattice',
            value: c.adjusted,
            note: `${c.partialOrderClass}; floor = ${c.floor}`,
        },
        {
            framework: 'State-space',
            value: 100 - st.currentRisk,
            note: st.basin,
        },
        {
            framework: 'Naive utility',
            value: u,
            note: 'Included as foil: can rate coercive systems too generously',
        },
    ];
}


// ── Aggregate metrics ────────────────────────────────────────────

export interface Metrics {
    deontic: DeonticResult;
    capabilities: CapabilityResult;
    trajectory: TrajectoryResult;
    utility: number;
    summary: FrameworkRow[];
}

export function computeMetrics(params: Params): Metrics {
    return {
        deontic: scoreDeontic(params),
        capabilities: scoreCapabilities(params),
        trajectory: simulateTrajectory(params),
        utility: naiveUtility(params),
        summary: frameworkSummary(params),
    };
}


// ── Sensitivity ──────────────────────────────────────────────────

type SweepableParam = keyof Omit<Params, 'preset'>;

const SWEEP_SPECS: { key: SweepableParam; label: string }[] = [
    { key: 'arbitraryDetention', label: 'arbitrary detention' },
    { key: 'discrimination', label: 'discrimination' },
    { key: 'dueProcess', label: 'due process' },
    { key: 'bodilyIntegrity', label: 'bodily integrity' },
    { key: 'speechFreedom', label: 'speech freedom' },
    { key: 'repairCapacity', label: 'repair capacity' },
    { key: 'dominationPersistence', label: 'domination persistence' },
    { key: 'futureWelfarePromise', label: 'future welfare promise' },
    { key: 'targetedGroupBurden', label: 'targeted group burden' },
];

export function computeSensitivity(params: Params): SensitivityBar[] {
    const bars: SensitivityBar[] = [];
    for (const spec of SWEEP_SPECS) {
        const lowParams = { ...params, [spec.key]: 0 };
        const highParams = { ...params, [spec.key]: 100 };
        const lowDeontic = scoreDeontic(lowParams);
        const highDeontic = scoreDeontic(highParams);
        bars.push({
            label: spec.label,
            low: 100 - lowDeontic.severity,
            high: 100 - highDeontic.severity,
        });
    }
    bars.sort((a, b) => Math.abs(b.high - b.low) - Math.abs(a.high - a.low));
    return bars;
}


// ── Sweep ────────────────────────────────────────────────────────

export interface SweepDatum {
    sweepValue: number;
    deontic: number;
    capability: number;
    stateSpace: number;
    utility: number;
}

export type SweepableKey = keyof Omit<Params, 'preset'>;

export const SWEEP_PARAM_SPECS: { key: SweepableKey; label: string }[] = [
    { key: 'arbitraryDetention', label: 'arbitrary detention' },
    { key: 'discrimination', label: 'discrimination' },
    { key: 'dueProcess', label: 'due process' },
    { key: 'bodilyIntegrity', label: 'bodily integrity' },
    { key: 'speechFreedom', label: 'speech freedom' },
    { key: 'repairCapacity', label: 'repair capacity' },
    { key: 'dominationPersistence', label: 'domination persistence' },
    { key: 'futureWelfarePromise', label: 'future welfare promise' },
    { key: 'targetedGroupBurden', label: 'targeted group burden' },
];

export function computeSweep(params: Params, sweepKey: SweepableKey): SweepDatum[] {
    const data: SweepDatum[] = [];
    for (let i = 0; i <= 50; i++) {
        const v = (i / 50) * 100;
        const swept = { ...params, [sweepKey]: v };
        const d = scoreDeontic(swept);
        const c = scoreCapabilities(swept);
        const st = simulateTrajectory(swept);
        const u = naiveUtility(swept);
        data.push({
            sweepValue: v,
            deontic: 100 - d.severity,
            capability: c.adjusted,
            stateSpace: 100 - st.currentRisk,
            utility: u,
        });
    }
    return data;
}


// ── Narrative ────────────────────────────────────────────────────

export function computeNarrative(metrics: Metrics, params: Params): string {
    const parts: string[] = [];
    const d = metrics.deontic;
    const c = metrics.capabilities;
    const st = metrics.trajectory;

    if (d.forbidden) {
        parts.push(`This scenario is deontic-forbidden: ${d.violations.length} hard constraint${d.violations.length > 1 ? 's are' : ' is'} breached (severity ${d.severity.toFixed(0)}).`);
        if (params.futureWelfarePromise > 50) {
            parts.push('The high future-welfare promise does not override these prohibitions \u2014 rights enter as side-constraints, not terms in a utility sum.');
        }
    } else {
        parts.push(`The scenario passes deontic admissibility (severity ${d.severity.toFixed(0)}).`);
    }

    parts.push(`The capability floor is ${c.floor} (${c.partialOrderClass}).`);

    if (c.antiDominationPenalty > 40) {
        parts.push(`High anti-domination penalty (${c.antiDominationPenalty.toFixed(0)}) drags down adjusted standing even if some individual capabilities look adequate.`);
    }

    parts.push(`Institutional trajectory lands in the ${st.basin.toLowerCase()} with risk ${st.currentRisk}.`);

    const u = metrics.utility;
    if (d.forbidden && u > 40) {
        parts.push(`Note: naive utility scores this at ${u.toFixed(0)} \u2014 demonstrating why single-scalar optimization is dangerous. It rates a rights-violating scenario as tolerable.`);
    }

    return parts.join(' ');
}


// ── Easing ───────────────────────────────────────────────────────

export function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export const ANIMATION_TOTAL_FRAMES = 70;
