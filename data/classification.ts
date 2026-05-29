/**
 * Shared classification dimensions used by playgrounds and papers index pages.
 *
 * Topics are the disciplinary anchor and the only dimension both artifact types
 * share. Operations describe the intellectual move a playground makes
 * (landscape, threshold, …). Kinds describe the artifact a paper takes the
 * shape of (essay, simulation, genealogy, …).
 *
 * Adding a new topic here is additive: existing entries that do not reference
 * it remain valid.
 */


export type Topic =
    | 'mathematics'
    | 'physics'
    | 'chemistry'
    | 'biology'
    | 'neuroscience'
    | 'computer-science'
    | 'economics'
    | 'political-science'
    | 'psychology'
    | 'sociology'
    | 'philosophy'
    | 'aesthetics'
    | 'anthropology'
    | 'history';

export type Operation =
    | 'landscape'
    | 'threshold'
    | 'symmetry'
    | 'morphogenesis'
    | 'anatomy'
    | 'tension';

export type Kind =
    | 'essay'
    | 'simulation'
    | 'genealogy'
    | 'formal'
    | 'programmatic'
    | 'historical';


export const TOPICS: { key: Topic; label: string; description: string }[] = [
    { key: 'mathematics', label: 'mathematics', description: 'pure structures: algebra, topology, geometry, number theory' },
    { key: 'physics', label: 'physics', description: 'matter, energy, and fundamental forces' },
    { key: 'chemistry', label: 'chemistry', description: 'molecular structure, bonding, and reactions' },
    { key: 'biology', label: 'biology', description: 'living systems, evolution, and development' },
    { key: 'neuroscience', label: 'neuroscience', description: 'brain, perception, and consciousness' },
    { key: 'computer-science', label: 'computer science', description: 'algorithms, computation, and information' },
    { key: 'economics', label: 'economics', description: 'markets, incentives, and resource allocation' },
    { key: 'political-science', label: 'political science', description: 'governance, power, and collective choice' },
    { key: 'psychology', label: 'psychology', description: 'mind, behavior, and cognition' },
    { key: 'sociology', label: 'sociology', description: 'social structures and collective dynamics' },
    { key: 'philosophy', label: 'philosophy', description: 'logic, ethics, and epistemology' },
    { key: 'aesthetics', label: 'aesthetics', description: 'pattern, harmony, and form' },
    { key: 'anthropology', label: 'anthropology', description: 'humans, cultures, and the long history of becoming human' },
    { key: 'history', label: 'history', description: 'change in time of institutions, ideas, and forms' },
];

export const OPERATIONS: { key: Operation; label: string; description: string; question: string }[] = [
    { key: 'landscape', label: 'landscape', description: 'mapping a possibility space', question: 'what does the terrain look like?' },
    { key: 'threshold', label: 'threshold', description: 'finding where a system changes regime', question: 'when does it flip?' },
    { key: 'symmetry', label: 'symmetry', description: 'what stays the same under transformation', question: 'what is preserved?' },
    { key: 'morphogenesis', label: 'morphogenesis', description: 'watching form emerge from process', question: 'how does form arise?' },
    { key: 'anatomy', label: 'anatomy', description: 'dissecting structure into working parts', question: 'what\'s inside?' },
    { key: 'tension', label: 'tension', description: 'tracing opposing forces that hold a system together', question: 'what pulls against what?' },
];

export const KINDS: { key: Kind; label: string; description: string }[] = [
    { key: 'essay', label: 'essay', description: 'pure argument: a written reading without an accompanying computational model' },
    { key: 'simulation', label: 'simulation', description: 'paper carries a small computational model that audits its claim' },
    { key: 'genealogy', label: 'genealogy', description: 'traces a concept across historical strata' },
    { key: 'formal', label: 'formal', description: 'uses formal mathematics, category theory, sheaves, or similar machinery' },
    { key: 'programmatic', label: 'programmatic', description: 'proposes a software or methodology that other work can implement' },
    { key: 'historical', label: 'historical', description: 'historical reading of a specific number, event, constant, or boundary' },
];
