// ---------- math utils ----------

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
export const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function mulberry32(seed: number) {
    let t = seed >>> 0;
    return function rand() {
        t += 0x6d2b79f5;
        let x = Math.imul(t ^ (t >>> 15), 1 | t);
        x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
}

export function normal(rand: () => number) {
    let u = 0,
        v = 0;
    while (u === 0) u = rand();
    while (v === 0) v = rand();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// ---------- domain model ----------

export interface Variant {
    id: string;
    author: string;
    text: string;
    freq: number;
    specificity: number;
    dispersion: number;
    surprisal: number;
    retention: number;
    mutability: number;
    a_name: number;
    a_src: number;
    lengthWords: number;
    drift: number;
    createdAt: number;
    parentId?: string;
    generation: number;
}

export interface DerivedVariant extends Variant {
    cliche: number;
    entanglement: number;
    x: number;
    y: number;
    z: number;
    bucket: string;
}

export interface Params {
    amp: number;
    brevityPenalty: number;
    generalityReward: number;
    mutationRate: number;
    prestigeBonus: number;
    contextCollapse: number;
    misattributionPressure: number;
    noise: number;
}

export const DEFAULT_PARAMS: Params = {
    amp: 0.7,
    brevityPenalty: 0.45,
    generalityReward: 0.65,
    mutationRate: 0.35,
    prestigeBonus: 0.55,
    contextCollapse: 0.55,
    misattributionPressure: 0.35,
    noise: 0.15,
};

export const AUTHORS = [
    'Harari',
    'Shakespeare',
    'Einstein',
    'Rumi',
    'Wilde',
    'Anonymous',
] as const;

export type AuthorName = (typeof AUTHORS)[number];

export const SEEDS: Record<AuthorName, readonly string[]> = {
    Harari: ['Humans are storytellers', 'Data will save us', 'History is a network'],
    Shakespeare: ['To be or not to be', 'All the world\'s a stage', 'Brevity is the soul'],
    Einstein: ['Imagination is more important', 'Insanity is doing the same thing', 'Everything should be made simple'],
    Rumi: ['What you seek is seeking you', 'The wound is where light enters', 'Let yourself be silently drawn'],
    Wilde: ['Be yourself everyone else is taken', 'To live is the rarest thing', 'We are all in the gutter'],
    Anonymous: ['It is what it is', 'At the end of the day', 'We live in a society'],
};

// ---------- helpers ----------

export function makeId(rand: () => number) {
    return Math.floor(rand() * 1e9).toString(36) + '-' + Math.floor(rand() * 1e9).toString(36);
}

export function makeTextStub(seedPhrase: string, rand: () => number, lengthWords: number) {
    const fillers = [
        'in the end',
        'by design',
        'as we know',
        'in essence',
        'for better or worse',
        'at scale',
        'in modern life',
        'in practice',
        'more than ever',
        'in a way',
    ];
    const tokens = seedPhrase.split(/\s+/);
    while (tokens.length < lengthWords) {
        const f = fillers[Math.floor(rand() * fillers.length)].split(' ');
        tokens.push(...f);
        if (tokens.length > lengthWords) tokens.length = lengthWords;
    }
    return tokens.join(' ');
}

// ---------- core algorithms ----------

export function computeClicheIndex(v: Variant) {
    const alpha = 1.1;
    const beta = 0.8;
    const gamma = 0.55;
    const delta = 1.0;
    const epsilon = 0.7;

    const score =
        alpha * Math.log(v.freq + 1) +
        beta * v.dispersion -
        gamma * v.surprisal -
        delta * v.retention +
        epsilon * v.mutability;

    return clamp01(sigmoid(score));
}

export function entanglementSurplus(v: Variant) {
    return clamp(v.a_name - v.a_src, -1, 1);
}

export function fitness(v: Variant, p: Params) {
    const generality = 1 - v.specificity;
    const brevity = 1 / Math.sqrt(Math.max(1, v.lengthWords));
    const nameToken = v.a_name;

    const portability = 0.45 * generality + 0.35 * v.dispersion + 0.2 * (1 - v.retention);
    const shortBonus = brevity;

    return (
        p.amp * portability +
        p.generalityReward * generality +
        p.prestigeBonus * nameToken +
        0.25 * shortBonus -
        p.brevityPenalty * (v.lengthWords / 30)
    );
}

export function initializePopulation(author: AuthorName, seed: number) {
    const rand = mulberry32(seed);
    const baseSeeds = SEEDS[author] ?? SEEDS.Anonymous;

    const pop: Variant[] = [];
    const N = 90;
    for (let i = 0; i < N; i++) {
        const seedPhrase = baseSeeds[Math.floor(rand() * baseSeeds.length)];
        const lengthWords = Math.floor(5 + rand() * 18);
        const text = makeTextStub(seedPhrase, rand, lengthWords);

        const prestige =
            author === 'Einstein' ? 0.85
            : author === 'Shakespeare' ? 0.8
            : author === 'Wilde' ? 0.65
            : author === 'Rumi' ? 0.6
            : author === 'Harari' ? 0.5
            : 0.15;

        const v: Variant = {
            id: makeId(rand),
            author,
            text,
            freq: Math.max(0.05, rand() * 1.2),
            specificity: clamp01(0.25 + 0.6 * rand()),
            dispersion: clamp01(0.1 + 0.8 * rand()),
            surprisal: clamp(1.2 + 6.0 * rand(), 0, 10),
            retention: clamp01(0.25 + 0.65 * rand()),
            mutability: clamp01(0.15 + 0.6 * rand()),
            a_name: clamp01(prestige + 0.25 * normal(rand)),
            a_src: clamp01(0.35 + 0.35 * rand() - 0.15 * normal(rand)),
            lengthWords,
            drift: clamp(0.05 + 0.35 * rand(), 0, 5),
            createdAt: 0,
            generation: 0,
        };

        pop.push(v);
    }

    return { pop, rand };
}

export function stepPopulation(pop: Variant[], p: Params, rand: () => number, tick: number) {
    const maxPop = 220;

    const fits = pop.map((v) => fitness(v, p));
    const meanF = fits.reduce((a, b) => a + b, 0) / Math.max(1, fits.length);

    for (let i = 0; i < pop.length; i++) {
        const v = pop[i];
        const noise = p.noise * normal(rand);
        const growth = Math.exp(0.22 * (fits[i] - meanF) + noise * 0.08);
        v.freq = Math.max(0, v.freq * growth);

        v.dispersion = clamp01(v.dispersion + 0.03 * sigmoid(Math.log(v.freq + 1)) + 0.01 * normal(rand));

        const collapse = p.contextCollapse * sigmoid(Math.log(v.freq + 1) - 0.5);
        v.retention = clamp01(v.retention - 0.05 * collapse + 0.008 * normal(rand));

        const misatt = p.misattributionPressure * sigmoid(Math.log(v.freq + 1) - 0.2);
        v.a_src = clamp01(v.a_src - 0.04 * misatt + 0.006 * normal(rand));
        v.a_name = clamp01(v.a_name + 0.02 * p.prestigeBonus * sigmoid(Math.log(v.freq + 1)) + 0.006 * normal(rand));

        const generalityDrift = 0.03 * p.generalityReward * sigmoid(Math.log(v.freq + 1) - 0.3);
        v.specificity = clamp01(v.specificity - generalityDrift + 0.01 * normal(rand));

        v.surprisal = clamp(v.surprisal - 0.05 * sigmoid(Math.log(v.freq + 1)) + 0.02 * normal(rand), 0, 10);

        v.mutability = clamp01(v.mutability + 0.03 * (1 - v.retention) - 0.01 * v.specificity + 0.01 * normal(rand));

        if (rand() < 0.07 * sigmoid(Math.log(v.freq + 1))) {
            v.lengthWords = clamp(Math.round(v.lengthWords - 1), 3, 30);
        }
    }

    const total = pop.reduce((s, v) => s + v.freq, 0);
    if (total > 0) {
        for (const v of pop) v.freq = (v.freq / total) * pop.length;
    }

    const newOnes: Variant[] = [];
    for (const v of pop) {
        const prob = p.mutationRate * v.mutability * sigmoid(Math.log(v.freq + 1));
        if (rand() < prob * 0.12) {
            const child: Variant = {
                ...v,
                id: makeId(rand),
                text: v.text,
                parentId: v.id,
                createdAt: tick,
                generation: v.generation + 1,
                freq: Math.max(0.02, v.freq * (0.15 + 0.35 * rand())),
                dispersion: clamp01(v.dispersion + 0.08 * normal(rand)),
                retention: clamp01(v.retention - 0.12 * rand()),
                a_src: clamp01(v.a_src - 0.18 * rand()),
                a_name: clamp01(v.a_name + 0.08 * normal(rand)),
                specificity: clamp01(v.specificity - 0.15 * rand() + 0.06 * normal(rand)),
                surprisal: clamp(v.surprisal + 0.55 * rand() - 0.25 * rand(), 0, 10),
                lengthWords: clamp(Math.round(v.lengthWords + 2 * normal(rand)), 3, 30),
                drift: clamp(v.drift + Math.abs(0.25 * normal(rand)) + 0.06 * rand(), 0, 10),
            };

            const tokens = child.text.split(/\s+/);
            if (tokens.length > 4 && rand() < 0.55) {
                tokens.splice(Math.floor(rand() * tokens.length), 1);
            }
            if (rand() < 0.25) {
                tokens.push('in essence');
            }
            child.text = tokens.slice(0, child.lengthWords).join(' ');

            newOnes.push(child);
        }
    }

    let merged = pop.concat(newOnes);

    merged = merged.filter((v) => v.freq > 0.002);

    if (merged.length > maxPop) {
        const byFreq = [...merged].sort((a, b) => b.freq - a.freq);
        const keepTop = byFreq.slice(0, Math.floor(maxPop * 0.7));

        const rest = byFreq.slice(Math.floor(maxPop * 0.7));
        const keepRest: Variant[] = [];
        for (const v of rest) {
            if (keepRest.length >= maxPop - keepTop.length) break;
            if (rand() < 0.22) keepRest.push(v);
        }

        merged = keepTop.concat(keepRest);
        merged = merged.slice(0, maxPop);
    }

    return merged;
}

// ---------- UI helpers ----------

export function fmt(x: number, digits = 2) {
    if (!Number.isFinite(x)) return '\u2013';
    return x.toFixed(digits);
}

export function tagFromSurplus(e: number) {
    if (e > 0.35) return 'Brand-token surplus';
    if (e < -0.15) return 'Source-heavy';
    return 'Balanced';
}

export function colorBucket(e: number) {
    if (e > 0.35) return 'High';
    if (e < -0.15) return 'Low';
    return 'Mid';
}
