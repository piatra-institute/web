import { clamp } from '@/lib/playgroundMath';


export interface Attractor {
    title: string;
    desc: string;
}

export interface ContextFrame {
    name: string;
    /** signed pull toward attractor B (positive) or A (negative), -100..100. */
    score: number;
    hints: string[];
}

export interface Example {
    text: string;
    /** human-assigned contextual polarity, -100..100. */
    score: number;
}

export interface Contronym {
    key: ContronymKey;
    label: string;
    operator: string;
    a: Attractor;
    b: Attractor;
    contexts: ContextFrame[];
    examples: Example[];
}


export type ContronymKey =
    | 'sanction'
    | 'screen'
    | 'dust'
    | 'cleave'
    | 'oversight'
    | 'fast'
    | 'seed'
    | 'clip';

export const CONTRONYM_KEYS: ContronymKey[] = [
    'sanction',
    'screen',
    'dust',
    'cleave',
    'oversight',
    'fast',
    'seed',
    'clip',
];


export const CONTRONYMS: Record<ContronymKey, Contronym> = {
    sanction: {
        key: 'sanction',
        label: 'sanction',
        operator: 'impose institutional force',
        a: { title: 'authorize / permit', desc: 'A body gives official approval, permission, or legitimacy.' },
        b: { title: 'penalize / punish', desc: 'A body imposes a penalty, restriction, or adverse consequence.' },
        contexts: [
            { name: 'law: approval of a treaty', score: -72, hints: ['approved', 'permit', 'authorize', 'treaty', 'license', 'allowed'] },
            { name: 'law: punishment for violation', score: 78, hints: ['penalty', 'punish', 'violation', 'fine', 'breach', 'discipline'] },
            { name: 'institutional ambiguity', score: 0, hints: ['committee', 'official', 'policy', 'rule'] },
        ],
        examples: [
            { text: 'The ministry sanctioned the new import license.', score: -80 },
            { text: 'The regulator sanctioned the company for repeated violations.', score: 85 },
            { text: 'The committee sanctioned the clinic.', score: 0 },
        ],
    },
    screen: {
        key: 'screen',
        label: 'screen',
        operator: 'mediate visibility',
        a: { title: 'show / display', desc: 'To present something to an audience or make it visible.' },
        b: { title: 'hide / protect from view', desc: 'To block, shield, or filter something from visibility.' },
        contexts: [
            { name: 'cinema or media display', score: -82, hints: ['film', 'movie', 'audience', 'festival', 'premiere', 'display'] },
            { name: 'privacy or protection', score: 80, hints: ['shield', 'privacy', 'hide', 'protect', 'curtain', 'view'] },
            { name: 'filtering candidates', score: 20, hints: ['applicants', 'filter', 'test', 'security', 'check'] },
        ],
        examples: [
            { text: 'The festival screened the documentary at noon.', score: -88 },
            { text: 'The hedge screened the garden from the road.', score: 86 },
            { text: 'The firm screened the applicants.', score: 18 },
        ],
    },
    dust: {
        key: 'dust',
        label: 'dust',
        operator: 'change dust-relation',
        a: { title: 'remove dust', desc: 'To clean a surface by taking dust away.' },
        b: { title: 'apply dust / powder', desc: 'To cover lightly with dust, powder, flour, or pesticide.' },
        contexts: [
            { name: 'household cleaning', score: -86, hints: ['furniture', 'shelf', 'clean', 'table', 'room'] },
            { name: 'cooking or agriculture', score: 82, hints: ['flour', 'powder', 'crops', 'sugar', 'pesticide'] },
            { name: 'bare verb', score: 0, hints: ['dust'] },
        ],
        examples: [
            { text: 'She dusted the shelves before dinner.', score: -90 },
            { text: 'He dusted the cake with sugar.', score: 84 },
            { text: 'They dusted the room.', score: -60 },
        ],
    },
    cleave: {
        key: 'cleave',
        label: 'cleave',
        operator: 'govern relation to separation',
        a: { title: 'split apart', desc: 'To cut, divide, or separate into parts.' },
        b: { title: 'adhere / cling', desc: 'To stick closely, remain attached, or be faithful.' },
        contexts: [
            { name: 'cutting or anatomy', score: -84, hints: ['axe', 'split', 'bone', 'cut', 'divide', 'blade'] },
            { name: 'loyalty or attachment', score: 86, hints: ['cling', 'faithful', 'loyal', 'adhere', 'spouse', 'tradition'] },
            { name: 'poetic ambiguity', score: 0, hints: ['heart', 'bond', 'vow'] },
        ],
        examples: [
            { text: 'The axe cleaved the log in two.', score: -90 },
            { text: 'She cleaved to the old doctrine.', score: 88 },
            { text: 'The vow cleaved them.', score: 0 },
        ],
    },
    oversight: {
        key: 'oversight',
        label: 'oversight',
        operator: 'relate to monitoring',
        a: { title: 'supervision', desc: 'Active monitoring, governance, or inspection.' },
        b: { title: 'failure to notice', desc: 'An omission, lapse, or missed detail.' },
        contexts: [
            { name: 'governance or audit', score: -78, hints: ['board', 'audit', 'supervision', 'committee', 'regulator', 'review'] },
            { name: 'mistake or omission', score: 82, hints: ['mistake', 'forgot', 'missed', 'error', 'lapse', 'accident'] },
            { name: 'bureaucratic memo', score: 0, hints: ['office', 'process', 'report'] },
        ],
        examples: [
            { text: 'The audit board provides financial oversight.', score: -86 },
            { text: 'The missing date was an unfortunate oversight.', score: 88 },
            { text: 'The department reported an oversight.', score: 0 },
        ],
    },
    fast: {
        key: 'fast',
        label: 'fast',
        operator: 'constrain motion relative to time or fixation',
        a: { title: 'rapid', desc: 'Moving or occurring quickly.' },
        b: { title: 'fixed / stuck', desc: 'Firmly attached, secure, or immovable.' },
        contexts: [
            { name: 'speed or time', score: -84, hints: ['quick', 'rapid', 'runner', 'car', 'speed', 'soon'] },
            { name: 'attachment or binding', score: 84, hints: ['stuck', 'fixed', 'held', 'anchor', 'rope', 'firm'] },
            { name: 'ambiguous adjective', score: 0, hints: ['fast'] },
        ],
        examples: [
            { text: 'The car was fast on the straight road.', score: -88 },
            { text: 'The rope held fast in the storm.', score: 90 },
            { text: 'The system remained fast.', score: -20 },
        ],
    },
    seed: {
        key: 'seed',
        label: 'seed',
        operator: 'change seed-relation',
        a: { title: 'plant seeds', desc: 'To sow or place seeds into soil or a medium.' },
        b: { title: 'remove seeds', desc: 'To take seeds out of fruit or another object.' },
        contexts: [
            { name: 'farming or gardening', score: -84, hints: ['field', 'soil', 'garden', 'plant', 'sow', 'lawn'] },
            { name: 'food preparation', score: 83, hints: ['melon', 'pepper', 'tomato', 'fruit', 'kitchen', 'recipe'] },
            { name: 'startup or ranking metaphor', score: -25, hints: ['fund', 'tournament', 'startup', 'initial'] },
        ],
        examples: [
            { text: 'They seeded the field after the rain.', score: -86 },
            { text: 'She seeded the peppers before roasting them.', score: 86 },
            { text: 'The investor seeded the project.', score: -40 },
        ],
    },
    clip: {
        key: 'clip',
        label: 'clip',
        operator: 'alter attachment or containment at an edge',
        a: { title: 'attach together', desc: 'To fasten items with a clip or clamp.' },
        b: { title: 'cut off / trim', desc: 'To cut, shorten, or remove part of something.' },
        contexts: [
            { name: 'office fastening', score: -78, hints: ['paper', 'attach', 'folder', 'badge', 'fasten'] },
            { name: 'cutting or trimming', score: 82, hints: ['hair', 'nails', 'wings', 'trim', 'cut'] },
            { name: 'media segment', score: 10, hints: ['video', 'audio', 'segment', 'highlight'] },
        ],
        examples: [
            { text: 'He clipped the papers together.', score: -84 },
            { text: 'She clipped the branches near the fence.', score: 83 },
            { text: 'They clipped the interview for social media.', score: 25 },
        ],
    },
};


export interface Params {
    word: ContronymKey;
    /** index into the selected word's context frames. */
    contextIndex: number;
    /** manual contextual pull, -100..100. */
    manualPull: number;
    /** collapse context into a single dictionary entry (paradox mode). */
    collapse: boolean;
    /** free-text sentence the keyword scorer reads. */
    customText: string;
}


export const DEFAULT_PARAMS: Params = {
    word: 'sanction',
    contextIndex: 0,
    manualPull: 0,
    collapse: false,
    customText: 'The committee sanctioned the clinic.',
};


export type Basin = 'A' | 'B' | 'none';

export interface Metrics {
    /** signed semantic polarity, -100 (attractor A) .. +100 (attractor B). */
    polarity: number;
    /** how strongly context selects a basin, 0..100. */
    confidence: number;
    /** which attractor the context selects, or none when underdetermined. */
    basin: Basin;
    /** true when context is collapsed and both readings are forced together. */
    contradiction: boolean;
}


/** keyword scorer: sums hint matches weighted by each context frame's polarity. */
export function keywordScore(text: string, word: Contronym): number {
    const lower = text.toLowerCase();
    let score = 0;
    for (const c of word.contexts) {
        for (const h of c.hints) {
            if (lower.includes(h.toLowerCase())) {
                score += c.score * 0.22;
            }
        }
    }
    return clamp(score, -100, 100);
}


/** combined polarity from the chosen frame, the manual pull, and the free text. */
export function currentScore(params: Params): number {
    const word = CONTRONYMS[params.word];
    const frame = word.contexts[params.contextIndex] ?? word.contexts[0];
    const textScore = params.customText.trim() ? keywordScore(params.customText, word) : 0;
    return clamp(frame.score * 0.5 + params.manualPull * 0.38 + textScore * 0.55, -100, 100);
}


export function confidenceFromScore(score: number): number {
    return Math.round(Math.min(99, 50 + Math.abs(score) * 0.49));
}


export function basinFromScore(score: number): Basin {
    if (score < -8) return 'A';
    if (score > 8) return 'B';
    return 'none';
}


export function computeMetrics(params: Params): Metrics {
    const polarity = currentScore(params);
    return {
        polarity,
        confidence: confidenceFromScore(polarity),
        basin: basinFromScore(polarity),
        contradiction: params.collapse,
    };
}


export function chosenAttractor(params: Params): Attractor | null {
    const word = CONTRONYMS[params.word];
    const basin = basinFromScore(currentScore(params));
    if (basin === 'A') return word.a;
    if (basin === 'B') return word.b;
    return null;
}


export function applyWord(params: Params, key: ContronymKey): Params {
    const word = CONTRONYMS[key];
    const ex = word.examples[0];
    return {
        ...params,
        word: key,
        contextIndex: 0,
        manualPull: ex.score,
        customText: ex.text,
    };
}


export function computeNarrative(params: Params, metrics: Metrics): string {
    const word = CONTRONYMS[params.word];
    if (metrics.contradiction) {
        return `Context is collapsed. The model forces ${word.label} to carry both "${word.a.title}" and "${word.b.title}" in a single context-free slot, so it reads as P and not-P at once. This is the lexical analogue of a paradox produced by totalization, not a property of the word itself.`;
    }
    const chosen = chosenAttractor(params);
    if (!chosen) {
        return `The current context does not strongly select either basin for ${word.label}. Its deep operator (${word.operator}) is active but underdetermined; add sentence clues, change the frame, or move the contextual pull to commit a direction.`;
    }
    return `Context selects "${chosen.title}" with about ${metrics.confidence}% confidence. ${word.label} is not contradictory here; the token is indexed to one context. Its deep operator (${word.operator}) is fixed and context supplies the direction.`;
}


export interface SweepDatum {
    pull: number;
    polarity: number;
    confidence: number;
}

/** sweep the manual pull across its range, holding frame and text fixed. */
export function computeSweep(params: Params): SweepDatum[] {
    const data: SweepDatum[] = [];
    for (let i = 0; i <= 40; i++) {
        const pull = -100 + (200 * i) / 40;
        const polarity = currentScore({ ...params, manualPull: pull });
        data.push({
            pull: Math.round(pull),
            polarity: Number(polarity.toFixed(1)),
            confidence: confidenceFromScore(polarity),
        });
    }
    return data;
}


export interface Snapshot {
    params: Params;
    metrics: Metrics;
    label: string;
}


export interface LexiconRow {
    key: ContronymKey;
    label: string;
    operator: string;
    a: string;
    b: string;
}

export function lexiconRows(): LexiconRow[] {
    return CONTRONYM_KEYS.map((key) => {
        const w = CONTRONYMS[key];
        return { key, label: w.label, operator: w.operator, a: w.a.title, b: w.b.title };
    });
}
