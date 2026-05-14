import { Params, Metrics, scoreModel, SCHOOLS } from './model';

// Parameter sweep, sensitivity tornado, and a plain-language narrative.

export type SweepableParam = keyof Omit<Params, 'school' | 'preset'>;

export const PARAM_SPECS: {
    key: SweepableParam;
    label: string;
    min: number;
    max: number;
    step: number;
    hint: string;
}[] = [
    { key: 'taxRate', label: 'tax intensity', min: 0, max: 100, step: 1, hint: 'how aggressive the tax package is' },
    { key: 'inequality', label: 'inequality', min: 0, max: 100, step: 1, hint: 'how damaging concentration is assumed to be' },
    { key: 'debtPressure', label: 'debt pressure', min: 0, max: 100, step: 1, hint: 'how binding deficits and market pressure are' },
    { key: 'investmentReturn', label: 'investment return', min: 0, max: 100, step: 1, hint: 'expected social return on public spending' },
    { key: 'externalityDamage', label: 'externality damage', min: 0, max: 100, step: 1, hint: 'scale of pollution, congestion, or health harms' },
    { key: 'adminCapacity', label: 'admin capacity', min: 0, max: 100, step: 1, hint: 'ability to collect taxes and spend competently' },
];

export interface SweepDatum {
    sweepValue: number;
    welfare: number;
    growth: number;
    equality: number;
    fiscalRepair: number;
    legitimacy: number;
}

export function computeSweep(params: Params, key: SweepableParam): SweepDatum[] {
    const spec = PARAM_SPECS.find((s) => s.key === key);
    if (!spec) return [];
    const steps = 41;
    const data: SweepDatum[] = [];
    for (let i = 0; i < steps; i++) {
        const v = spec.min + (spec.max - spec.min) * (i / (steps - 1));
        const m = scoreModel({ ...params, [key]: v });
        data.push({
            sweepValue: v,
            welfare: m.welfare,
            growth: m.growth,
            equality: m.equality,
            fiscalRepair: m.fiscalRepair,
            legitimacy: m.legitimacy,
        });
    }
    return data;
}

export interface SensitivityBar {
    label: string;
    low: number;
    high: number;
}

// How far welfare moves when each parameter is swept min->max, others held.
export function computeSensitivity(params: Params): SensitivityBar[] {
    return PARAM_SPECS.map((spec) => {
        const atLow = scoreModel({ ...params, [spec.key]: spec.min }).welfare;
        const atHigh = scoreModel({ ...params, [spec.key]: spec.max }).welfare;
        return {
            label: spec.label,
            low: Math.min(atLow, atHigh),
            high: Math.max(atLow, atHigh),
        };
    }).sort((a, b) => (b.high - b.low) - (a.high - a.low));
}

export function computeNarrative(params: Params, metrics: Metrics): string {
    // baseline: the same world, but with only a token tax increase
    const baseline = scoreModel({ ...params, taxRate: 10 });
    const welfareDelta = metrics.welfare - baseline.welfare;
    const school = SCHOOLS[params.school];
    const parts: string[] = [];

    if (welfareDelta > 6) {
        parts.push(
            `Under the ${school.label} rationale this package raises modelled welfare by ${welfareDelta} points over a token tax increase.`,
        );
    } else if (welfareDelta < -6) {
        parts.push(
            `Under the ${school.label} rationale this package lowers modelled welfare by ${Math.abs(welfareDelta)} points relative to a token tax increase: the burden is outrunning the returns.`,
        );
    } else {
        parts.push(
            `Under the ${school.label} rationale this package barely moves modelled welfare against a token tax increase.`,
        );
    }

    if (metrics.distortion > 45) {
        parts.push(
            `Deadweight loss is high (${metrics.distortion}): the package is aggressive relative to administrative capacity.`,
        );
    }
    if (metrics.legitimacy < 40) {
        parts.push(
            `Political durability is weak (${metrics.legitimacy}); without compensation or gradualism the package is fragile.`,
        );
    } else if (metrics.legitimacy > 65) {
        parts.push(`Political durability is comfortable (${metrics.legitimacy}).`);
    }
    if (params.school === 'consolidation' && metrics.growth < 45) {
        parts.push(
            'Consolidation into a weak economy is dragging growth: this is the pro-cyclical timing failure.',
        );
    }
    if (params.school === 'state-capacity' && params.adminCapacity < 50) {
        parts.push(
            'The investment case rests on capacity the state does not yet have: revenue may not convert into returns.',
        );
    }
    return parts.join(' ');
}
