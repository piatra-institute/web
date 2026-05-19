export type StageKey =
    | 'ordinary'
    | 'saturation'
    | 'defensive'
    | 'ressentiment'
    | 'inversion'
    | 'monstrous';

export interface StageDef {
    key: StageKey;
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

export const STAGES: StageDef[] = [
    {
        key: 'ordinary',
        index: 0,
        title: 'ordinary moral load',
        label: 'care is still proportional',
        range: [0, 18],
        color: '#a3e635',
        description:
            'the person recognises harm, duty, tradeoffs, and limits. they can say: i am responsible where i have agency.',
        tells: [
            'can rank duties',
            'admits imperfection without flinching',
            'does not need purity to act',
            'still distinguishes mistake from malice',
        ],
        intervention:
            'keep moral demands concrete: who is harmed, by what, through which mechanism, and what action is actually available?',
        aphorism: 'bounded care is the load a person can carry without dropping the world.',
    },
    {
        key: 'saturation',
        index: 1,
        title: 'moral saturation',
        label: 'everything starts to accuse',
        range: [19, 36],
        color: '#84cc16',
        description:
            'the person begins to experience normal life as a field of hidden complicity. food, money, work, jokes, consumption, silence, affiliation all carry signal.',
        tells: [
            'uses totalising language',
            'feels watched by norms',
            'cannot separate local guilt from structural implication',
            'asks, half rhetorically, so everything is bad now?',
        ],
        intervention:
            'separate implication from guilt. being inside a damaged system is not the same as personally willing every harm it produces.',
        aphorism: 'when every object speaks, the room becomes a courtroom.',
    },
    {
        key: 'defensive',
        index: 2,
        title: 'defensive minimisation',
        label: 'the first escape hatch',
        range: [37, 52],
        color: '#65a30d',
        description:
            'the person does not yet defend the indefensible. they first shrink the moral object: animals do not really suffer, exploitation is exaggerated, victims are manipulative, the problem is fake.',
        tells: [
            'demands impossible proof of harm',
            'frames care as sentimentality',
            'treats every critic as hypocritical',
            'retreats into jokes and technicalities',
        ],
        intervention:
            're-anchor in one undeniable concrete case and one feasible responsibility. do not yet escalate to condemnation.',
        aphorism: 'the first lie is not about the act, but about whether the act could possibly matter.',
    },
    {
        key: 'ressentiment',
        index: 3,
        title: 'ressentiment switch',
        label: 'accusation becomes identity threat',
        range: [53, 68],
        color: '#f59e0b',
        description:
            'the moral demand is now felt as humiliation. the person no longer asks whether the claim is true. they ask who has the right to demand anything from them.',
        tells: [
            'says: i am tired of being lectured',
            'codes care as weakness',
            'rebrands cruelty as honesty',
            'treats transgression as proof of freedom',
        ],
        intervention:
            'remove the theatre of submission. give the person a way to preserve agency while accepting a bounded duty.',
        aphorism: 'when correction feels like conquest, the corrected become combatants.',
    },
    {
        key: 'inversion',
        index: 4,
        title: 'counter-moral inversion',
        label: 'the indefensible becomes noble',
        range: [69, 84],
        color: '#f97316',
        description:
            'the person starts defending the indefensible not despite its cruelty, but because cruelty now functions as strength, realism, loyalty, or anti-hypocrisy.',
        tells: [
            'blames victims for existing',
            'aestheticises harm',
            'mocks the old norm as slave morality',
            'treats the more forbidden as the more sacred',
        ],
        intervention:
            'attack the inversion, not just the conclusion. ask what virtue the person thinks they are performing by defending harm.',
        aphorism: 'the worst values often arrive dressed as virtues that have been stolen back.',
    },
    {
        key: 'monstrous',
        index: 5,
        title: 'monstrous uncare',
        label: 'refusal becomes appetite',
        range: [85, 100],
        color: '#ea580c',
        description:
            'this is the abyss. the person turns the impossibility of caring about everything into permission to care about nothing. they may take pleasure in making protected things suffer, symbolically or literally.',
        tells: [
            'says: good, i hope it gets worse',
            'practises deliberate cruelty as style',
            'treats moral injury as entertainment',
            'collapses the line between hypocrisy and goodness',
        ],
        intervention:
            'do not debate as if this is normal disagreement. reduce power, enforce boundaries, protect targets, and only then look for exits.',
        aphorism: 'the monster is not who fails to care about everything, but who turns that failure into a license.',
    },
];

export const STAGE_BY_KEY: Record<StageKey, StageDef> = STAGES.reduce(
    (acc, s) => {
        acc[s.key] = s;
        return acc;
    },
    {} as Record<StageKey, StageDef>,
);

export function getStageByScore(score: number): StageDef {
    const clamped = Math.max(0, Math.min(100, score));
    for (const s of STAGES) {
        if (clamped >= s.range[0] && clamped <= s.range[1]) {
            return s;
        }
    }
    return STAGES[0];
}

export interface TriggerDef {
    name: string;
    description: string;
    axes: string[];
}

export const TRIGGERS: TriggerDef[] = [
    {
        name: 'total guilt',
        description: 'every ordinary action is framed as complicity.',
        axes: ['load', 'inflation'],
    },
    {
        name: 'no exit',
        description: 'the person sees no realistic path to being clean.',
        axes: ['exit'],
    },
    {
        name: 'public shame',
        description: 'correction is staged as humiliation rather than private repair.',
        axes: ['shame', 'isolation'],
    },
    {
        name: 'status loss',
        description: 'care is coded as surrender to an enemy class.',
        axes: ['tribe', 'shame'],
    },
    {
        name: 'moral inflation',
        description: 'all faults are described with maximum-charge language.',
        axes: ['inflation', 'shame'],
    },
    {
        name: 'tribal shelter',
        description: 'a group rewards defiance, cruelty, and refusal as loyalty.',
        axes: ['tribe', 'isolation'],
    },
];
