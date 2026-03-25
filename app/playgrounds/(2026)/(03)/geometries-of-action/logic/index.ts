export type Point3D = [number, number, number];
export type Point2D = [number, number];
export type PresetKey = 'motor' | 'timing' | 'species' | 'spinal';
export type ProjectionMode = 'nonlinear' | 'linear';

export interface Params {
    intrinsicDim: number;
    neurons: number;
    curvature: number;
    taskConstraint: number;
    noise: number;
    speed: number;
    cooling: number;
    alignment: number;
    residual: number;
    projectionMode: ProjectionMode;
    preset: PresetKey;
}

export interface Metrics {
    linearRecoverability: number;
    geometryPreserved: number;
    timingBias: number;
    alignmentScore: number;
    decoderConfidence: number;
    populationCoherence: number;
    effectiveSpeed: number;
    sharedTaskGrammar: number;
    crossMapStability: number;
}

export interface ManifoldData {
    label: string;
    curve3D: Point3D[];
    curveFlat: Point2D[];
    surface3D: Point3D[];
    surfaceFlat: Point2D[];
}

export interface Snapshot {
    params: Params;
    metrics: Metrics;
    label: string;
}

export interface SweepDatum {
    sweepValue: number;
    decoderConfidence: number;
    alignmentScore: number;
    linearRecoverability: number;
}

export interface TimelinePoint {
    x: number;
    baseline: number;
    cooled: number;
}

export interface SensitivityBar {
    label: string;
    low: number;
    high: number;
}

export type SweepableParam = 'curvature' | 'taskConstraint' | 'noise' | 'speed' | 'cooling' | 'alignment' | 'residual';

export const PARAM_SPECS: { key: SweepableParam; label: string; min: number; max: number }[] = [
    { key: 'curvature', label: 'curvature', min: 0.05, max: 0.95 },
    { key: 'taskConstraint', label: 'task constraint', min: 0.1, max: 0.98 },
    { key: 'noise', label: 'noise', min: 0.01, max: 0.45 },
    { key: 'speed', label: 'speed', min: 0.15, max: 1.0 },
    { key: 'cooling', label: 'cooling', min: 0.0, max: 0.95 },
    { key: 'alignment', label: 'alignment', min: 0.05, max: 1.0 },
    { key: 'residual', label: 'residual', min: 0.05, max: 1.0 },
];

export const DEFAULT_PARAMS: Params = {
    intrinsicDim: 2,
    neurons: 96,
    curvature: 0.38,
    taskConstraint: 0.72,
    noise: 0.12,
    speed: 0.62,
    cooling: 0.0,
    alignment: 0.58,
    residual: 0.35,
    projectionMode: 'nonlinear',
    preset: 'motor',
};

export const PRESET_DESCRIPTIONS: Record<PresetKey, {
    label: string;
    question: string;
    expectation: string;
    intrinsicDim: number;
    neurons: number;
}> = {
    motor: {
        label: 'Motor cortex reach',
        question: 'Is neural activity during reaching confined to a low-dimensional manifold?',
        expectation: 'A 2D sheet in population state space constrains reach trajectories, making linear projection mostly adequate at low curvature.',
        intrinsicDim: 2,
        neurons: 96,
    },
    timing: {
        label: 'Interval timing + cooling',
        question: 'Can dynamics be slowed without destroying manifold geometry?',
        expectation: 'Cooling the striatum slows traversal speed while largely preserving the 1D timing loop, biasing interval judgments.',
        intrinsicDim: 1,
        neurons: 72,
    },
    species: {
        label: 'Cross-subject / cross-species',
        question: 'Do different individuals share a common latent manifold for the same task?',
        expectation: 'High alignment score despite different individual neurons supports the ontological reality of manifold structure.',
        intrinsicDim: 2,
        neurons: 112,
    },
    spinal: {
        label: 'Residual spinal decoding',
        question: 'Can weak residual motor signals be decoded for neuroprosthetic control?',
        expectation: 'Even with low residual signal, structured low-dimensional activity may be sufficient for cursor control.',
        intrinsicDim: 2,
        neurons: 80,
    },
};

export function presetParams(key: PresetKey): Params {
    const desc = PRESET_DESCRIPTIONS[key];
    switch (key) {
        case 'motor':
            return { ...DEFAULT_PARAMS, intrinsicDim: desc.intrinsicDim, neurons: desc.neurons, curvature: 0.38, taskConstraint: 0.72, noise: 0.12, speed: 0.62, cooling: 0.0, alignment: 0.58, residual: 0.35, preset: key };
        case 'timing':
            return { ...DEFAULT_PARAMS, intrinsicDim: desc.intrinsicDim, neurons: desc.neurons, curvature: 0.26, taskConstraint: 0.86, noise: 0.10, speed: 0.48, cooling: 0.62, alignment: 0.42, residual: 0.22, preset: key };
        case 'species':
            return { ...DEFAULT_PARAMS, intrinsicDim: desc.intrinsicDim, neurons: desc.neurons, curvature: 0.54, taskConstraint: 0.68, noise: 0.15, speed: 0.56, cooling: 0.08, alignment: 0.86, residual: 0.28, preset: key };
        case 'spinal':
            return { ...DEFAULT_PARAMS, intrinsicDim: desc.intrinsicDim, neurons: desc.neurons, curvature: 0.34, taskConstraint: 0.74, noise: 0.16, speed: 0.58, cooling: 0.06, alignment: 0.52, residual: 0.78, preset: key };
    }
}

export function clamp(v: number, lo: number, hi: number): number {
    return Math.max(lo, Math.min(hi, v));
}

export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

export function generateManifold(params: Params): ManifoldData {
    const { intrinsicDim, curvature, taskConstraint } = params;

    if (intrinsicDim === 1) {
        const curve3D: Point3D[] = [];
        const curveFlat: Point2D[] = [];
        for (let i = 0; i < 240; i++) {
            const s = i / 239;
            const theta = s * Math.PI * 2;
            const radius = 1 + 0.18 * taskConstraint * Math.cos(theta * 3);
            const x = radius * Math.cos(theta);
            const y = radius * Math.sin(theta);
            const z = 0.9 * curvature * Math.sin(theta * 2) + 0.22 * taskConstraint * Math.cos(theta);
            curve3D.push([x, y, z]);
            curveFlat.push([s * 2 - 1, 0]);
        }
        return { label: '1D timing loop', curve3D, curveFlat, surface3D: curve3D, surfaceFlat: curveFlat };
    }

    const surface3D: Point3D[] = [];
    const surfaceFlat: Point2D[] = [];
    const nU = 22;
    const nV = 14;
    for (let iu = 0; iu < nU; iu++) {
        for (let iv = 0; iv < nV; iv++) {
            const u = (iu / (nU - 1)) * 2 - 1;
            const v = (iv / (nV - 1)) * 2 - 1;
            const x = u + 0.08 * taskConstraint * Math.sin(Math.PI * v);
            const y = v;
            const z = curvature * 0.96 * Math.sin(Math.PI * u) * Math.cos(Math.PI * v) + 0.18 * taskConstraint * u * v;
            surface3D.push([x, y, z]);
            surfaceFlat.push([u, v]);
        }
    }

    const curve3D: Point3D[] = [];
    const curveFlat: Point2D[] = [];
    for (let i = 0; i < 260; i++) {
        const t = (i / 259) * Math.PI * 2;
        const u = 0.82 * Math.sin(t);
        const v = 0.56 * Math.sin(0.7 * t + 0.9);
        const x = u + 0.08 * taskConstraint * Math.sin(Math.PI * v);
        const y = v;
        const z = curvature * 0.96 * Math.sin(Math.PI * u) * Math.cos(Math.PI * v) + 0.18 * taskConstraint * u * v;
        curve3D.push([x, y, z]);
        curveFlat.push([u, v]);
    }

    return { label: '2D motor sheet', curve3D, curveFlat, surface3D, surfaceFlat };
}

export function pointAt(manifold: ManifoldData, t: number): { idx: number; point: Point3D; flat: Point2D } {
    const len = manifold.curve3D.length;
    const idx = ((Math.floor(t * len) % len) + len) % len;
    return { idx, point: manifold.curve3D[idx], flat: manifold.curveFlat[idx] };
}

export function velocityAt(curve: Point3D[], idx: number): Point3D {
    const a = curve[idx];
    const b = curve[(idx + 1) % curve.length];
    return [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
}

export function project3D(p: Point3D, w: number, h: number, zoom = 1): { x: number; y: number } {
    const px = (p[0] - 0.34 * p[1]) * zoom;
    const py = (p[2] + 0.46 * p[1]) * zoom;
    return { x: w / 2 + px * w * 0.24, y: h / 2 - py * h * 0.24 };
}

export function projectLinear(p: Point3D, w: number, h: number): { x: number; y: number } {
    return {
        x: w / 2 + (0.92 * p[0] + 0.18 * p[2]) * w * 0.24,
        y: h / 2 - (0.88 * p[1] - 0.12 * p[2]) * h * 0.24,
    };
}

export function flatProject(w: number, h: number): (p: Point2D) => { x: number; y: number } {
    return ([u, v]) => ({
        x: w / 2 + u * w * 0.28,
        y: h / 2 - (v || 0) * h * 0.26,
    });
}

export function transformSubjectB(curve: Point3D[], params: Params): Point3D[] {
    const misalign = 1 - params.alignment;
    const angle = 0.85 * misalign;
    const ca = Math.cos(angle);
    const sa = Math.sin(angle);
    return curve.map(([x, y, z]) => {
        const xr = ca * x - sa * y;
        const yr = sa * x + ca * y;
        const zr = z + 0.26 * misalign * Math.sin(2.8 * x) - 0.1 * misalign * y;
        const warped: Point3D = [1.06 * xr + 0.08 * misalign, 0.92 * yr - 0.06 * misalign, zr];
        return [
            lerp(warped[0], x, params.alignment * 0.92),
            lerp(warped[1], y, params.alignment * 0.92),
            lerp(warped[2], z, params.alignment * 0.92),
        ] as Point3D;
    });
}

export function neuronActivity(point: Point3D, neuronIndex: number, params: Params, t: number): number {
    const [x, y, z] = point;
    const w1 = Math.sin((neuronIndex + 1) * 1.37) * 0.9;
    const w2 = Math.cos((neuronIndex + 1) * 0.73) * 0.8;
    const w3 = Math.sin((neuronIndex + 1) * 0.51 + 1.2) * 0.7;
    const linear = w1 * x + w2 * y + w3 * z;
    const nonlinear =
        0.42 * params.taskConstraint * Math.sin(1.8 * x * (neuronIndex + 1) * 0.14) +
        0.3 * params.curvature * Math.cos(2.2 * z + neuronIndex * 0.2);
    const noiseTerm = params.noise * 0.9 * Math.sin(t * 6 + neuronIndex * 0.45);
    return Math.tanh(1.1 * linear + nonlinear + noiseTerm);
}

function dist2(a: Point2D, b: Point2D): number {
    return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

export function manifoldDistortion(manifold: ManifoldData, mode: 'linear' | 'nonlinear'): number {
    const samples = 16;
    let total = 0;
    let count = 0;
    for (let i = 0; i < samples; i++) {
        for (let j = i + 1; j < samples; j++) {
            const ia = Math.floor((i / (samples - 1)) * (manifold.curve3D.length - 1));
            const ib = Math.floor((j / (samples - 1)) * (manifold.curve3D.length - 1));
            const ref = dist2(manifold.curveFlat[ia], manifold.curveFlat[ib]);
            const pa = manifold.curve3D[ia];
            const pb = manifold.curve3D[ib];
            const projA = mode === 'linear'
                ? [0.92 * pa[0] + 0.18 * pa[2], 0.88 * pa[1] - 0.12 * pa[2]] as Point2D
                : manifold.curveFlat[ia];
            const projB = mode === 'linear'
                ? [0.92 * pb[0] + 0.18 * pb[2], 0.88 * pb[1] - 0.12 * pb[2]] as Point2D
                : manifold.curveFlat[ib];
            total += Math.abs(ref - dist2(projA, projB));
            count += 1;
        }
    }
    const raw = total / Math.max(count, 1);
    return clamp(mode === 'linear' ? raw * 100 : raw * 28, 1, 100);
}

export function computeMetrics(params: Params): Metrics {
    const linearRecoverability = clamp(
        100 * (1 - params.curvature * 0.52 - params.noise * 0.46 - (params.intrinsicDim === 2 ? 0.1 : 0) + params.taskConstraint * 0.15),
        8, 98,
    );
    const geometryPreserved = clamp(99 - params.cooling * 3.5 - params.noise * 16, 76, 99);
    const timingBias = clamp(params.cooling * 72 + params.noise * 22, 0, 98);
    const alignmentScore = clamp(28 + params.alignment * 66 - params.noise * 12, 6, 99);
    const decoderConfidence = clamp(14 + params.residual * 78 - params.noise * 18, 0, 99);
    const populationCoherence = clamp(84 - params.noise * 70 + params.taskConstraint * 12, 10, 99);
    const effectiveSpeed = params.speed * (1 - params.cooling * 0.85) * 100;
    const sharedTaskGrammar = clamp(22 + params.taskConstraint * 72, 0, 99);
    const crossMapStability = clamp(alignmentScore - params.noise * 20, 0, 99);

    return {
        linearRecoverability,
        geometryPreserved,
        timingBias,
        alignmentScore,
        decoderConfidence,
        populationCoherence,
        effectiveSpeed,
        sharedTaskGrammar,
        crossMapStability,
    };
}

export function computeHeatmap(
    manifold: ManifoldData,
    params: Params,
    phase: number,
    displayedNeurons: number,
): number[][] {
    const cols = 34;
    const out: number[][] = [];
    for (let n = 0; n < displayedNeurons; n++) {
        const row: number[] = [];
        for (let c = 0; c < cols; c++) {
            const t = (phase - (cols - c) * 0.008 + 1) % 1;
            const sample = pointAt(manifold, t).point;
            row.push(neuronActivity(sample, n, params, t));
        }
        out.push(row);
    }
    return out;
}

export function computeSingleNeuronTrace(manifold: ManifoldData, params: Params, phase: number): number[] {
    return Array.from({ length: 72 }, (_, i) => {
        const t = (phase - (71 - i) * 0.009 + 1) % 1;
        const p = pointAt(manifold, t).point;
        return neuronActivity(p, 2, params, t);
    });
}

export function computeTimeline(params: Params): TimelinePoint[] {
    return Array.from({ length: 50 }, (_, i) => {
        const x = i / 49;
        const baseline = 0.58 + 0.12 * Math.sin(6 * x);
        const cooled = baseline * (1 - params.cooling * 0.72);
        return { x, baseline, cooled };
    });
}

export function pathFromProjected(
    points: Point3D[] | Point2D[],
    projector: (p: never) => { x: number; y: number },
): string {
    return (points as never[])
        .map((p, i) => {
            const q = projector(p);
            return `${i === 0 ? 'M' : 'L'}${q.x.toFixed(2)},${q.y.toFixed(2)}`;
        })
        .join(' ');
}

export function computeNarrative(metrics: Metrics, params: Params): string {
    const parts: string[] = [];

    if (metrics.linearRecoverability < 50) {
        parts.push(`Linear projection recovers only ${metrics.linearRecoverability.toFixed(0)}% of manifold structure \u2014 PCA substantially misrepresents the latent geometry.`);
    } else if (metrics.linearRecoverability > 80) {
        parts.push(`At ${metrics.linearRecoverability.toFixed(0)}% linear recoverability, PCA adequately captures this manifold configuration.`);
    }

    if (params.cooling > 0.3) {
        parts.push(`Cooling slows traversal to ${metrics.effectiveSpeed.toFixed(0)}% of baseline while preserving ${metrics.geometryPreserved.toFixed(0)}% of geometry \u2014 dynamics and structure dissociate.`);
    }

    if (metrics.alignmentScore > 70) {
        parts.push(`Cross-subject alignment at ${metrics.alignmentScore.toFixed(0)}% supports the manifold invariance hypothesis.`);
    } else if (metrics.alignmentScore < 40) {
        parts.push(`Alignment at ${metrics.alignmentScore.toFixed(0)}% is weak \u2014 shared latent structure may not generalize here.`);
    }

    if (metrics.decoderConfidence > 60) {
        parts.push(`Residual signal yields ${metrics.decoderConfidence.toFixed(0)}% decoder confidence, sufficient for basic neuroprosthetic control.`);
    } else if (metrics.decoderConfidence < 30) {
        parts.push(`Decoder confidence at only ${metrics.decoderConfidence.toFixed(0)}% \u2014 residual structure is too weak for reliable control.`);
    }

    return parts.join(' ') || 'Adjust parameters to explore the neural manifold framework.';
}

export function computeSweep(params: Params, sweepKey: SweepableParam): SweepDatum[] {
    const spec = PARAM_SPECS.find(s => s.key === sweepKey)!;
    const data: SweepDatum[] = [];
    for (let i = 0; i < 51; i++) {
        const v = spec.min + (spec.max - spec.min) * (i / 50);
        const m = computeMetrics({ ...params, [sweepKey]: v });
        data.push({
            sweepValue: v,
            decoderConfidence: m.decoderConfidence,
            alignmentScore: m.alignmentScore,
            linearRecoverability: m.linearRecoverability,
        });
    }
    return data;
}

export function computeSensitivity(params: Params): SensitivityBar[] {
    return PARAM_SPECS.map(spec => {
        const atMin = computeMetrics({ ...params, [spec.key]: spec.min }).decoderConfidence;
        const atMax = computeMetrics({ ...params, [spec.key]: spec.max }).decoderConfidence;
        return { label: spec.label, low: Math.min(atMin, atMax), high: Math.max(atMin, atMax) };
    }).sort((a, b) => (b.high - b.low) - (a.high - a.low));
}
