export type LadderKey =
    | 'matter'
    | 'constraint'
    | 'proto'
    | 'sign'
    | 'value'
    | 'attention'
    | 'narrative'
    | 'oversalience';

export interface LadderLevel {
    key: LadderKey;
    index: number;
    title: string;
    formula: string;
    color: string;
    description: string;
}

export const LADDER: LadderLevel[] = [
    {
        key: 'matter',
        index: 0,
        title: 'matter',
        formula: 'difference',
        color: '#365314',
        description:
            'a molecule, pulse, gesture, sound, or light pattern exists as a physical difference. nothing about it is a sign yet.',
    },
    {
        key: 'constraint',
        index: 1,
        title: 'constraint',
        formula: 'difference x system need',
        color: '#4d7c0f',
        description:
            'the difference begins to matter because some self-maintaining system is organised around survival, repair, pursuit, or regulation.',
    },
    {
        key: 'proto',
        index: 2,
        title: 'proto-salience',
        formula: 'relevance before awareness',
        color: '#65a30d',
        description:
            'the system treats the difference as action-relevant before it becomes an explicit thought. relevance precedes consciousness.',
    },
    {
        key: 'sign',
        index: 3,
        title: 'sign',
        formula: 'cue stands for hidden state',
        color: '#84cc16',
        description:
            'the cue now stands for a hidden condition: nutrient, threat, reward, attachment, rejection, opportunity. a molecule has become a sign.',
    },
    {
        key: 'value',
        index: 4,
        title: 'value',
        formula: 'prediction + reward update',
        color: '#a3e635',
        description:
            'reward learning gives the sign motivational force. dopamine is closer to update this and pursue this than to pure pleasure.',
    },
    {
        key: 'attention',
        index: 5,
        title: 'attention',
        formula: 'softmax(salience / tau)',
        color: '#facc15',
        description:
            'attention is allocated toward the highest-salience objects. low temperature makes the allocation winner-takes-most.',
    },
    {
        key: 'narrative',
        index: 6,
        title: 'narrative',
        formula: 'self-model binding',
        color: '#f59e0b',
        description:
            'the sign is bound into personal meaning: future, identity, safety, worth, destiny. the cue is now part of a self-story.',
    },
    {
        key: 'oversalience',
        index: 7,
        title: 'over-salience',
        formula: 'object becomes world-filter',
        color: '#ea580c',
        description:
            'the object dominates interpretation far beyond its evidential weight. it stops being one item in the world and becomes the filter the world is read through. this is the limerent edge.',
    },
];

export const LADDER_BY_KEY: Record<LadderKey, LadderLevel> = LADDER.reduce(
    (acc, l) => {
        acc[l.key] = l;
        return acc;
    },
    {} as Record<LadderKey, LadderLevel>,
);


export type StatusKey = 'ordinary' | 'charged' | 'captured' | 'runaway';

export interface StatusDef {
    key: StatusKey;
    index: number;
    title: string;
    label: string;
    range: [number, number];
    color: string;
    description: string;
    tells: string[];
    intervention: string;
    aphorism: string;
}

export const STATUSES: StatusDef[] = [
    {
        key: 'ordinary',
        index: 0,
        title: 'ordinary',
        label: 'one object among many',
        range: [0, 32],
        color: '#a3e635',
        description:
            'the object is interpreted at roughly its evidential weight. attention can leave it without resistance. it informs the world model but does not govern it.',
        tells: [
            'attention returns to other objects on its own',
            'absence of the cue is not distressing',
            'evidence about the cue is read literally, not symbolically',
            'the cue can be forgotten for hours',
        ],
        intervention:
            'nothing is wrong. this is the baseline a healthy salience field returns to between episodes.',
        aphorism: 'an ordinary sign points at the world; it does not replace it.',
    },
    {
        key: 'charged',
        index: 1,
        title: 'charged',
        label: 'the cue starts to glow',
        range: [33, 58],
        color: '#84cc16',
        description:
            'the object now carries surplus meaning. small signals from it feel large. attention drifts back to it more often than the evidence warrants, but the loop is still escapable.',
        tells: [
            'rereading or rechecking the cue',
            'minor signals get long interpretations',
            'mild relief when the cue appears',
            'the cue colours unrelated moods',
        ],
        intervention:
            'name the surplus. ask what hidden state the cue is being asked to settle, and whether any other evidence could settle it instead.',
        aphorism: 'a charged sign is a question the system keeps asking the wrong object.',
    },
    {
        key: 'captured',
        index: 2,
        title: 'captured',
        label: 'attention will not let go',
        range: [59, 80],
        color: '#f59e0b',
        description:
            'the object has captured the attention budget. wanting has outrun liking. uncertainty keeps the prediction loop alive, and the cue can trigger craving even when it brings no reward.',
        tells: [
            'intrusive return to the object',
            'checking behaviour to reduce uncertainty',
            'the notification feels larger than the conversation',
            'other goals are deferred around the object',
        ],
        intervention:
            'raise reality correction and habituation. introduce competing salient objects. reduce the intermittency that is feeding the uncertainty term.',
        aphorism: 'capture is when the cue outshines the thing it was a cue for.',
    },
    {
        key: 'runaway',
        index: 3,
        title: 'runaway',
        label: 'the object becomes the world-filter',
        range: [81, 100],
        color: '#ea580c',
        description:
            'over-salience. the object is now the lens the whole world is interpreted through. it has become the answer to a hidden question about safety, worth, and the future. this is the limerent and addictive edge.',
        tells: [
            'every neutral event is read as a message about the object',
            'the object decides whether reality feels bearable',
            'fantasy and rumination replace contact',
            'evidence against the object is reinterpreted, not absorbed',
        ],
        intervention:
            'do not argue with the interpretation. lower the loop instead: cut intermittent reinforcement, restore sleep and other relations, and let habituation and reality correction do slow work.',
        aphorism: 'a runaway sign is no longer in the world; the world is now inside it.',
    },
];

export function getStatusByScore(score: number): StatusDef {
    const clamped = Math.max(0, Math.min(100, score));
    for (const s of STATUSES) {
        if (clamped >= s.range[0] && clamped <= s.range[1]) return s;
    }
    return STATUSES[0];
}
