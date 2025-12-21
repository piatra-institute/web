// Types
export type SentenceType =
    | 'CONST_TRUE'
    | 'CONST_FALSE'
    | 'LIAR_SELF'              // "This sentence is false."
    | 'TRUTH_TELLER_SELF'       // "This sentence is true."
    | 'ASSERT_TRUE'             // "Sentence X is true."
    | 'ASSERT_FALSE'            // "Sentence X is false."
    | 'IMPLIES_SELF_IF_TARGET'  // "This sentence is true if X is true." (X -> Self)
    | 'IFF_TARGET'              // "This sentence is true iff X is true." (Self <-> X)
    | 'PERCENT_SELF_CONTROLLER'; // Set self truth to steer window-average toward target

export interface Sentence {
    id: string;
    label: string;
    type: SentenceType;
    targetId?: string;
    percentTarget?: number; // 0..1
    window?: number;        // integer >=1
}

export interface SimulationParams {
    steps: number;
    burnIn: number;
    initMode: 'random' | 'all_false' | 'all_true' | 'checker';
    seed: number;
    noiseFlipProb: number;
}

export interface CycleInfo {
    found: boolean;
    startIndex: number;
    period: number;
}

export interface SentenceStats {
    id: string;
    label: string;
    type: SentenceType;
    mean: number;
    flipRate: number;
    entropyProxy: number;
}

export interface SimulationResult {
    history: boolean[][];
    cycle: CycleInfo;
    stats: {
        perSentence: SentenceStats[];
    };
}

export type PresetId = 'basic' | 'mutual' | 'ring3' | 'ring5' | 'custom';

export interface Preset {
    id: PresetId;
    name: string;
    description: string;
}

export const PRESETS: Preset[] = [
    {
        id: 'basic',
        name: 'Basic examples',
        description: 'Liar, conditional, percent-controller, and truth-teller.',
    },
    {
        id: 'mutual',
        name: 'Mutual negation',
        description: 'Two sentences each claiming the other is false.',
    },
    {
        id: 'ring3',
        name: 'Ring of 3',
        description: 'Three sentences in a circular reference pattern.',
    },
    {
        id: 'ring5',
        name: 'Ring of 5',
        description: 'Five sentences in a circular reference pattern.',
    },
    {
        id: 'custom',
        name: 'Custom',
        description: 'Build your own sentence network.',
    },
];

export const DEFAULT_PARAMS: SimulationParams = {
    steps: 200,
    burnIn: 20,
    initMode: 'random',
    seed: 42,
    noiseFlipProb: 0,
};

// Utilities
export function uid(prefix = 's'): string {
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function clamp01(x: number): number {
    return Math.max(0, Math.min(1, x));
}

function mulberry32(seed: number): () => number {
    let t = seed >>> 0;
    return function () {
        t += 0x6d2b79f5;
        let x = Math.imul(t ^ (t >>> 15), 1 | t);
        x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
}

function bitKey(bits: boolean[]): string {
    return bits.map((b) => (b ? '1' : '0')).join('');
}

function computeWindowAverage(
    history: boolean[][],
    sentenceIndex: number,
    window: number
): number {
    const w = Math.max(1, Math.floor(window));
    const end = history.length - 1;
    const start = Math.max(0, end - w + 1);
    let sum = 0;
    let count = 0;
    for (let t = start; t <= end; t++) {
        sum += history[t][sentenceIndex] ? 1 : 0;
        count++;
    }
    return count === 0 ? 0.5 : sum / count;
}

function detectCycle(history: boolean[][]): CycleInfo {
    const seen = new Map<string, number>();
    for (let t = 0; t < history.length; t++) {
        const k = bitKey(history[t]);
        const prev = seen.get(k);
        if (prev !== undefined) {
            return { found: true, startIndex: prev, period: t - prev };
        }
        seen.set(k, t);
    }
    return { found: false, startIndex: 0, period: 0 };
}

// Core dynamics
function nextTruth(
    s: Sentence,
    i: number,
    prev: boolean[],
    history: boolean[][],
    idToIndex: Map<string, number>
): boolean {
    const selfPrev = prev[i];
    const targetIdx = s.targetId ? idToIndex.get(s.targetId) : undefined;
    const targetPrev = targetIdx !== undefined ? prev[targetIdx] : false;

    switch (s.type) {
        case 'CONST_TRUE':
            return true;
        case 'CONST_FALSE':
            return false;
        case 'LIAR_SELF':
            return !selfPrev;
        case 'TRUTH_TELLER_SELF':
            return selfPrev;
        case 'ASSERT_TRUE':
            return targetPrev;
        case 'ASSERT_FALSE':
            return !targetPrev;
        case 'IMPLIES_SELF_IF_TARGET':
            return !targetPrev || selfPrev;
        case 'IFF_TARGET':
            return selfPrev === targetPrev;
        case 'PERCENT_SELF_CONTROLLER': {
            const p = clamp01(s.percentTarget ?? 0.7);
            const w = Math.max(1, Math.floor(s.window ?? 50));
            const avg = computeWindowAverage(history, i, w);
            return avg < p;
        }
        default:
            return false;
    }
}

export function simulate(sentences: Sentence[], config: SimulationParams): SimulationResult {
    const n = sentences.length;
    if (n === 0) {
        return {
            history: [],
            cycle: { found: false, startIndex: 0, period: 0 },
            stats: { perSentence: [] },
        };
    }

    const rng = mulberry32(config.seed);
    const idToIndex = new Map<string, number>();
    sentences.forEach((s, i) => idToIndex.set(s.id, i));

    const init: boolean[] = new Array(n).fill(false);
    if (config.initMode === 'all_true') {
        for (let i = 0; i < n; i++) init[i] = true;
    } else if (config.initMode === 'checker') {
        for (let i = 0; i < n; i++) init[i] = i % 2 === 0;
    } else if (config.initMode === 'random') {
        for (let i = 0; i < n; i++) init[i] = rng() < 0.5;
    }

    const history: boolean[][] = [init];

    for (let t = 1; t < config.steps; t++) {
        const prev = history[t - 1];
        const next: boolean[] = new Array(n).fill(false);
        for (let i = 0; i < n; i++) {
            let v = nextTruth(sentences[i], i, prev, history, idToIndex);
            if (config.noiseFlipProb > 0 && rng() < config.noiseFlipProb) v = !v;
            next[i] = v;
        }
        history.push(next);
    }

    const cycle = detectCycle(history);

    const burn = Math.max(0, Math.min(config.burnIn, history.length - 1));
    const post = history.slice(burn);

    const perSentence: SentenceStats[] = sentences.map((s, i) => {
        let ones = 0;
        let flips = 0;
        for (let t = 0; t < post.length; t++) {
            if (post[t][i]) ones++;
            if (t > 0 && post[t][i] !== post[t - 1][i]) flips++;
        }
        const mean = post.length ? ones / post.length : 0;
        const flipRate = post.length > 1 ? flips / (post.length - 1) : 0;
        const entropyProxy = 4 * mean * (1 - mean);

        return {
            id: s.id,
            label: s.label,
            type: s.type,
            mean,
            flipRate,
            entropyProxy,
        };
    });

    return {
        history,
        cycle,
        stats: { perSentence },
    };
}

// Presets
export function presetBasicExamples(): Sentence[] {
    const s1: Sentence = {
        id: uid(),
        label: 'Liar',
        type: 'LIAR_SELF',
    };
    const s2: Sentence = {
        id: uid(),
        label: 'If Liar then Self',
        type: 'IMPLIES_SELF_IF_TARGET',
        targetId: s1.id,
    };
    const s3: Sentence = {
        id: uid(),
        label: '70% true',
        type: 'PERCENT_SELF_CONTROLLER',
        percentTarget: 0.7,
        window: 60,
    };
    const s4: Sentence = {
        id: uid(),
        label: 'Truth-teller',
        type: 'TRUTH_TELLER_SELF',
    };
    return [s1, s2, s3, s4];
}

export function presetMutualNegation(): Sentence[] {
    const a: Sentence = { id: uid(), label: 'A', type: 'ASSERT_FALSE' };
    const b: Sentence = { id: uid(), label: 'B', type: 'ASSERT_FALSE' };
    a.targetId = b.id;
    b.targetId = a.id;
    return [a, b];
}

export function presetRing(n: number): Sentence[] {
    const arr: Sentence[] = Array.from({ length: n }, (_, i) => ({
        id: uid(),
        label: `Ring-${i + 1}`,
        type: i % 2 === 0 ? 'ASSERT_TRUE' : 'ASSERT_FALSE',
    }));
    for (let i = 0; i < n; i++) {
        arr[i].targetId = arr[(i + 1) % n].id;
    }
    return arr;
}

export function getSentencesForPreset(presetId: PresetId): Sentence[] {
    switch (presetId) {
        case 'basic':
            return presetBasicExamples();
        case 'mutual':
            return presetMutualNegation();
        case 'ring3':
            return presetRing(3);
        case 'ring5':
            return presetRing(5);
        case 'custom':
            return presetBasicExamples();
        default:
            return presetBasicExamples();
    }
}

export function renderSentenceText(s: Sentence, sentences: Sentence[]): string {
    const targetLabel = s.targetId
        ? sentences.find((x) => x.id === s.targetId)?.label || '(missing)'
        : '(none)';

    switch (s.type) {
        case 'CONST_TRUE':
            return 'Always true.';
        case 'CONST_FALSE':
            return 'Always false.';
        case 'LIAR_SELF':
            return 'This sentence is false.';
        case 'TRUTH_TELLER_SELF':
            return 'This sentence is true.';
        case 'ASSERT_TRUE':
            return `"${targetLabel}" is true.`;
        case 'ASSERT_FALSE':
            return `"${targetLabel}" is false.`;
        case 'IMPLIES_SELF_IF_TARGET':
            return `This is true if "${targetLabel}" is true.`;
        case 'IFF_TARGET':
            return `This is true iff "${targetLabel}" is true.`;
        case 'PERCENT_SELF_CONTROLLER':
            return `This sentence is ${Math.round((s.percentTarget ?? 0.7) * 100)}% true.`;
        default:
            return '(unknown)';
    }
}

export function getTypeBadge(type: SentenceType): string {
    switch (type) {
        case 'LIAR_SELF':
            return 'LIAR';
        case 'TRUTH_TELLER_SELF':
            return 'TT';
        case 'PERCENT_SELF_CONTROLLER':
            return 'P%';
        case 'IMPLIES_SELF_IF_TARGET':
            return '→';
        case 'IFF_TARGET':
            return '↔';
        case 'ASSERT_TRUE':
            return 'X=T';
        case 'ASSERT_FALSE':
            return 'X=F';
        case 'CONST_TRUE':
            return '⊤';
        case 'CONST_FALSE':
            return '⊥';
        default:
            return '?';
    }
}

export const SENTENCE_TEMPLATES: Array<{
    value: SentenceType;
    label: string;
    needsTarget?: boolean;
    needsPercent?: boolean;
}> = [
    { value: 'LIAR_SELF', label: 'This sentence is false (oscillator)' },
    { value: 'TRUTH_TELLER_SELF', label: 'This sentence is true (fixed point)' },
    { value: 'CONST_TRUE', label: 'Always true' },
    { value: 'CONST_FALSE', label: 'Always false' },
    { value: 'ASSERT_TRUE', label: 'X is true', needsTarget: true },
    { value: 'ASSERT_FALSE', label: 'X is false', needsTarget: true },
    { value: 'IMPLIES_SELF_IF_TARGET', label: 'Self is true if X is true (X → Self)', needsTarget: true },
    { value: 'IFF_TARGET', label: 'Self is true iff X is true (Self ↔ X)', needsTarget: true },
    { value: 'PERCENT_SELF_CONTROLLER', label: 'Self is p% true (controller)', needsPercent: true },
];

// ============================================
// Infinite-valued logic attractor simulation
// Based on Grim et al. 1993 paper
// ============================================

export type AttractorType = 'dualist' | 'dualist_sequential' | 'minerva' | 'triplist';

export interface AttractorParams {
    type: AttractorType;
    iterations: number;
    initialX: number;
    initialY: number;
    initialZ: number;
    factor: number; // For triplist variations (.5 for Minerva, .25 for variation)
}

export const DEFAULT_ATTRACTOR_PARAMS: AttractorParams = {
    type: 'dualist',
    iterations: 5000,
    initialX: 0.6,
    initialY: 0.7,
    initialZ: 0.6,
    factor: 0.5,
};

export interface AttractorPoint {
    x: number;
    y: number;
    z: number;
}

export interface AttractorResult {
    points: AttractorPoint[];
    is3D: boolean;
}

// Chaotic Dualist (simultaneous):
// X: "X is as false as Y is true"
// Y: "Y is as true as X is"
// X_{n+1} = 1 - ||(1 - Y_n) - X_n||
// Y_{n+1} = 1 - ||X_n - Y_n||
function dualistStep(x: number, y: number): [number, number] {
    const xNext = 1 - Math.abs((1 - y) - x);
    const yNext = 1 - Math.abs(x - y);
    return [xNext, yNext];
}

// Chaotic Dualist (sequential):
// Same semantics but sequential reasoning
// X_{n+1} = 1 - ||(1 - Y_n) - X_n||
// Y_{n+1} = 1 - ||X_{n+1} - Y_n||
function dualistSequentialStep(x: number, y: number): [number, number] {
    const xNext = 1 - Math.abs((1 - y) - x);
    const yNext = 1 - Math.abs(xNext - y);
    return [xNext, yNext];
}

// Triplist / Minerva attractor:
// Each sentence asserts it is (factor) as true as the difference between the other two
// x_{n+1} = 1 - ||factor * ||y_n - z_n|| - x_n||
// y_{n+1} = 1 - ||factor * ||x_{n+1} - z_n|| - y_n||
// z_{n+1} = 1 - ||factor * ||x_{n+1} - y_{n+1}|| - z_n||
function triplistStep(x: number, y: number, z: number, factor: number): [number, number, number] {
    const xNext = 1 - Math.abs(factor * Math.abs(y - z) - x);
    const yNext = 1 - Math.abs(factor * Math.abs(xNext - z) - y);
    const zNext = 1 - Math.abs(factor * Math.abs(xNext - yNext) - z);
    return [xNext, yNext, zNext];
}

export function simulateAttractor(params: AttractorParams): AttractorResult {
    const points: AttractorPoint[] = [];
    let x = params.initialX;
    let y = params.initialY;
    let z = params.initialZ;

    const burnIn = Math.floor(params.iterations * 0.1);

    for (let i = 0; i < params.iterations; i++) {
        if (params.type === 'dualist') {
            [x, y] = dualistStep(x, y);
            z = 0;
        } else if (params.type === 'dualist_sequential') {
            [x, y] = dualistSequentialStep(x, y);
            z = 0;
        } else if (params.type === 'minerva') {
            [x, y, z] = triplistStep(x, y, z, 0.5);
        } else if (params.type === 'triplist') {
            [x, y, z] = triplistStep(x, y, z, params.factor);
        }

        // Only record after burn-in
        if (i >= burnIn) {
            points.push({ x, y, z });
        }
    }

    const is3D = params.type === 'minerva' || params.type === 'triplist';

    return { points, is3D };
}

// Generate escape-time data for the Dualist
// Each point (x, y) in the unit square is colored by iterations to escape
export interface EscapeTimePoint {
    x: number;
    y: number;
    iterations: number;
}

export function generateEscapeTime(
    resolution: number = 100,
    maxIterations: number = 100,
    escapeDistance: number = 1.03,
    type: 'dualist' | 'dualist_sequential' = 'dualist'
): EscapeTimePoint[] {
    const points: EscapeTimePoint[] = [];

    for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
            let x = i / (resolution - 1);
            let y = j / (resolution - 1);

            let iter = 0;
            while (iter < maxIterations) {
                const dist = Math.sqrt(x * x + y * y);
                if (dist > escapeDistance) break;

                if (type === 'dualist') {
                    [x, y] = dualistStep(x, y);
                } else {
                    [x, y] = dualistSequentialStep(x, y);
                }
                iter++;
            }

            points.push({
                x: i / (resolution - 1),
                y: j / (resolution - 1),
                iterations: iter,
            });
        }
    }

    return points;
}

export const ATTRACTOR_PRESETS: Array<{ id: AttractorType; name: string; description: string }> = [
    {
        id: 'dualist',
        name: 'Chaotic Dualist',
        description: 'X: "X is as false as Y is true", Y: "Y is as true as X is" (simultaneous)',
    },
    {
        id: 'dualist_sequential',
        name: 'Dualist Sequential',
        description: 'Same semantics with sequential reasoning pattern',
    },
    {
        id: 'minerva',
        name: 'Minerva (Triplist)',
        description: 'Three sentences, each half as true as the difference between the other two',
    },
    {
        id: 'triplist',
        name: 'Triplist Variation',
        description: 'Triplist with adjustable factor (0.25 gives different attractor)',
    },
];
