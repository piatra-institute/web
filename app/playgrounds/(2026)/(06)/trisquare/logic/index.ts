export * from './conformal';
export * from './ward';
export * from './rg';
export * from './correspondence';

import {
    CONFORMAL_PRESETS,
    type ConformalControls,
    type ConformalField,
    type ConformalMetrics,
    type ConformalPreset,
    clampControls,
    computeField,
} from './conformal';
import {
    type WardSummary,
    type WardToggles,
    wardSummary,
} from './ward';
import {
    type RGDatum,
    computeRGFlow,
    landauPole,
} from './rg';


export interface Params extends ConformalControls, WardToggles {
    preset: ConformalPreset;
    /** initial phi-fourth coupling at the reference scale. */
    lambda0: number;
}


export interface Metrics extends ConformalMetrics {
    /** number of independent surviving couplings after the Ward constraints. */
    independentCouplings: number;
    /** the Landau-pole scale t* of the phi-fourth flow. */
    landauPole: number;
}


export interface ModelResult {
    field: ConformalField;
    ward: WardSummary;
    rg: RGDatum[];
    metrics: Metrics;
}


export const PRESET_PROFILES: Record<ConformalPreset, Params> = {
    flat: {
        preset: 'flat',
        amplitude: 0,
        width: 1,
        waveNumber: 2,
        scaleInvariance: false,
        conformalInvariance: false,
        diffeoInvariance: true,
        singleCoupling: false,
        lambda0: 0.6,
    },
    bump: {
        preset: 'bump',
        amplitude: 0.6,
        width: 1,
        waveNumber: 2,
        scaleInvariance: true,
        conformalInvariance: false,
        diffeoInvariance: true,
        singleCoupling: false,
        lambda0: 0.6,
    },
    well: {
        preset: 'well',
        amplitude: 0.6,
        width: 1,
        waveNumber: 2,
        scaleInvariance: true,
        conformalInvariance: false,
        diffeoInvariance: true,
        singleCoupling: false,
        lambda0: 0.6,
    },
    wave: {
        preset: 'wave',
        amplitude: 0.4,
        width: 1,
        waveNumber: 2.5,
        scaleInvariance: true,
        conformalInvariance: true,
        diffeoInvariance: true,
        singleCoupling: false,
        lambda0: 0.8,
    },
    lumpy: {
        preset: 'lumpy',
        amplitude: 0.7,
        width: 0.9,
        waveNumber: 2,
        scaleInvariance: true,
        conformalInvariance: true,
        diffeoInvariance: true,
        singleCoupling: true,
        lambda0: 1.0,
    },
};


export const DEFAULT_PARAMS: Params = PRESET_PROFILES.bump;


export interface PresetDescription {
    label: string;
    question: string;
    expectation: string;
}

export const PRESET_DESCRIPTIONS: Record<ConformalPreset, PresetDescription> = {
    flat: {
        label: 'flat',
        question: 'What does no deformation look like?',
        expectation: 'Omega = 1 everywhere, zero curvature: the Minkowski baseline the other presets deform.',
    },
    bump: {
        label: 'Gaussian bump',
        question: 'What happens when spacetime swells locally?',
        expectation: 'A localized rise in Omega produces a ring of curvature; the metric is still conformally flat.',
    },
    well: {
        label: 'gravitational well',
        question: 'What happens under local contraction?',
        expectation: 'A dip in Omega inverts the curvature sign relative to the bump.',
    },
    wave: {
        label: 'conformal wave',
        question: 'What does an oscillating conformal mode do?',
        expectation: 'Stripes of alternating curvature; conformal and scale invariance are switched on in the Ward game.',
    },
    lumpy: {
        label: 'lumpy universe',
        question: 'What about several deformations at once?',
        expectation: 'A toy inhomogeneous universe with all symmetries and single-coupling mode engaged.',
    },
};


export function controlsOf(p: Params): ConformalControls {
    return { amplitude: p.amplitude, width: p.width, waveNumber: p.waveNumber };
}

export function togglesOf(p: Params): WardToggles {
    return {
        scaleInvariance: p.scaleInvariance,
        conformalInvariance: p.conformalInvariance,
        diffeoInvariance: p.diffeoInvariance,
        singleCoupling: p.singleCoupling,
    };
}


export function runModel(params: Params): ModelResult {
    const field = computeField(params.preset, clampControls(controlsOf(params)));
    const ward = wardSummary(togglesOf(params));
    const rg = computeRGFlow(params.lambda0);
    const metrics: Metrics = {
        ...field.metrics,
        independentCouplings: ward.independentCouplings,
        landauPole: landauPole(params.lambda0),
    };
    return { field, ward, rg, metrics };
}


export function applyPreset(current: Params, key: ConformalPreset): Params {
    return { ...current, ...PRESET_PROFILES[key] };
}


export interface SweepDatum {
    amplitude: number;
    maxAbsK: number;
    meanAbsK: number;
}

/** sweep the deformation amplitude, holding everything else fixed. */
export function computeSweep(params: Params): SweepDatum[] {
    const data: SweepDatum[] = [];
    const base = controlsOf(params);
    for (let i = 0; i <= 24; i++) {
        const amplitude = (0.95 * i) / 24;
        const field = computeField(params.preset, clampControls({ ...base, amplitude }));
        data.push({
            amplitude: Number(amplitude.toFixed(3)),
            maxAbsK: Number(field.metrics.maxAbsK.toFixed(4)),
            meanAbsK: Number(field.metrics.meanAbsK.toFixed(4)),
        });
    }
    return data;
}


export interface Snapshot {
    params: Params;
    metrics: Metrics;
    label: string;
}


export function computeNarrative(params: Params, result: ModelResult): string {
    const { metrics, ward } = result;
    const parts: string[] = [];

    if (params.preset === 'flat' || metrics.maxAbsK < 1e-3) {
        parts.push('The conformal factor is essentially flat, so the curvature vanishes and gravity has nothing to do here.');
    } else {
        const sign = metrics.integralK > 0 ? 'net positive' : 'net negative';
        parts.push(
            `The ${PRESET_DESCRIPTIONS[params.preset].label} gives a peak curvature of ${metrics.maxAbsK.toFixed(2)} with a ${sign} integral over the patch. All of this geometry is carried by one scalar field, the conformal factor.`,
        );
    }

    if (ward.removed === 0) {
        parts.push('No symmetry constraints are active yet, so the full clutter of Lagrangian terms survives.');
    } else {
        parts.push(
            `The active Ward identities have removed ${ward.removed} term${ward.removed === 1 ? '' : 's'} and left ${metrics.independentCouplings} independent coupling${metrics.independentCouplings === 1 ? '' : 's'}${
                params.singleCoupling && ward.merged > 0 ? ', collapsing the dimensionless survivors into one gauge-like coupling' : ''
            }.`,
        );
    }

    return parts.join(' ');
}


export interface ActionTranslationRow {
    term: string;
    gravity: string;
    scalar: string;
}

export const ACTION_TRANSLATION: ActionTranslationRow[] = [
    { term: 'cosmological term', gravity: '\\int \\sqrt{-g}\\,\\Lambda', scalar: 'scalar potential term' },
    { term: 'Einstein-Hilbert', gravity: '\\int \\sqrt{-g}\\,R', scalar: 'derivative terms in \\phi' },
    { term: 'conformal / Weyl', gravity: '\\int \\sqrt{-g}\\,C^2', scalar: 'vanishes for conformally flat metrics' },
    { term: 'quartic scalar', gravity: '\\lambda\\,\\varphi^4', scalar: 'single dimensionless coupling' },
];
