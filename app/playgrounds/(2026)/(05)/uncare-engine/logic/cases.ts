import type { AxisValues } from './model';


export type CaseKey =
    | 'veganism'
    | 'climate'
    | 'speech'
    | 'politics'
    | 'craft'
    | 'institutions'
    | 'migration'
    | 'maintenance'
    | 'reputation'
    | 'algorithm';

export const CASE_KEYS: CaseKey[] = [
    'veganism',
    'climate',
    'speech',
    'politics',
    'craft',
    'institutions',
    'migration',
    'maintenance',
    'reputation',
    'algorithm',
];

export interface DomainCase {
    key: CaseKey;
    label: string;
    subtitle: string;
    accusation: string;
    chain: string;
    inversion: string;
    objects: string[];
    canonical: AxisValues;
    expectedMadness: number;
    expectedStage: number;
}

export const CASES: Record<CaseKey, DomainCase> = {
    veganism: {
        key: 'veganism',
        label: 'veganism',
        subtitle: 'when the smell of meat becomes a flag.',
        accusation: 'industrial slaughter is unnecessary and you participate in it.',
        chain: 'i cannot avoid all harm. animal suffering is exaggerated. eating more meat becomes defiance.',
        inversion: 'cruelty toward animals reframed as refusal of moral blackmail.',
        objects: ['the factory farm', 'the steak as identity prop', 'the joke about vegans', 'the carnivore subculture', 'the proudly red plate'],
        canonical: {
            load: 70,
            shame: 55,
            exit: 60,
            tribe: 60,
            inflation: 55,
            isolation: 35,
        },
        expectedMadness: 48,
        expectedStage: 2,
    },
    climate: {
        key: 'climate',
        label: 'climate',
        subtitle: 'when emissions become a moral diet you cannot keep.',
        accusation: 'your ordinary life emits carbon and helps make a less liveable planet.',
        chain: 'my whole life emits carbon. climate ethics is control. waste becomes freedom.',
        inversion: 'rolling coal, performative waste, climate denial as masculinity.',
        objects: ['the long-haul flight', 'the suv as protest', 'the burn pile', 'the climate sceptic forum', 'the energy bill spike'],
        canonical: {
            load: 82,
            shame: 60,
            exit: 35,
            tribe: 65,
            inflation: 70,
            isolation: 55,
        },
        expectedMadness: 65,
        expectedStage: 3,
    },
    speech: {
        key: 'speech',
        label: 'speech',
        subtitle: 'when the forbidden word becomes a sacrament.',
        accusation: 'your speech can wound, exclude, or replicate hierarchies.',
        chain: 'words can harm. language rules are humiliation. saying the forbidden word becomes authenticity.',
        inversion: 'the slur as proof of freedom from the censorious mob.',
        objects: ['the public callout', 'the slur reclaimed in reverse', 'the irony shield', 'the 4chan style guide', 'the apology-refused thread'],
        canonical: {
            load: 60,
            shame: 80,
            exit: 30,
            tribe: 75,
            inflation: 80,
            isolation: 50,
        },
        expectedMadness: 70,
        expectedStage: 4,
    },
    politics: {
        key: 'politics',
        label: 'politics',
        subtitle: 'when defending your team starts to require defending the indefensible.',
        accusation: 'your faction did something that wounds your moral self-image.',
        chain: 'my side did wrong. criticism helps the enemy. the wrong becomes necessary.',
        inversion: 'the cover-up rebranded as discipline; cruelty as strategic clarity.',
        objects: ['the partisan podcast', 'the closed group chat', 'the disowned moderate', 'the loyalty test', 'the rewritten timeline'],
        canonical: {
            load: 75,
            shame: 70,
            exit: 25,
            tribe: 90,
            inflation: 70,
            isolation: 60,
        },
        expectedMadness: 76,
        expectedStage: 4,
    },
    craft: {
        key: 'craft',
        label: 'craft',
        subtitle: 'when standards become an attack on the worker.',
        accusation: 'your slipshod work harms an unseen user, future maintainer, or system.',
        chain: 'everything i build has consequences. standards are oppressive. bad work becomes rebellion.',
        inversion: 'broken tolerances treated as authenticity against the spec-class.',
        objects: ['the overtightened nut', 'the missing test', 'the disabled alarm', 'the silenced linter', 'the proud shortcut'],
        canonical: {
            load: 50,
            shame: 35,
            exit: 65,
            tribe: 30,
            inflation: 30,
            isolation: 45,
        },
        expectedMadness: 32,
        expectedStage: 1,
    },
    institutions: {
        key: 'institutions',
        label: 'institutions',
        subtitle: 'when procedures stop being protection and become persecution.',
        accusation: 'the office, the form, the audit exist because someone got hurt.',
        chain: 'every procedure encodes a value. accountability is persecution. corruption becomes realism.',
        inversion: 'graft framed as competence; norm-violation as candour.',
        objects: ['the unsigned form', 'the bypassed inspector', 'the captured regulator', 'the leak that never leaks', 'the cynical handshake'],
        canonical: {
            load: 65,
            shame: 50,
            exit: 30,
            tribe: 55,
            inflation: 60,
            isolation: 65,
        },
        expectedMadness: 58,
        expectedStage: 3,
    },
    migration: {
        key: 'migration',
        label: 'migration',
        subtitle: 'when the obligation to strangers becomes a wound.',
        accusation: 'distant suffering keeps arriving at your borders, asking something of you.',
        chain: 'migration creates obligation. care exhausts me. cruelty toward strangers becomes pride.',
        inversion: 'pushback violence reframed as defence of the home.',
        objects: ['the boat at the horizon', 'the camp behind the wall', 'the deportation flight', 'the proud rejection speech', 'the meme of the cliff'],
        canonical: {
            load: 78,
            shame: 65,
            exit: 30,
            tribe: 78,
            inflation: 75,
            isolation: 50,
        },
        expectedMadness: 72,
        expectedStage: 4,
    },
    maintenance: {
        key: 'maintenance',
        label: 'maintenance',
        subtitle: 'when caring for what already exists feels like punishment.',
        accusation: 'the world only runs because invisible people keep fixing it.',
        chain: 'every system needs care. maintenance is invisible. letting it break becomes a kind of revenge.',
        inversion: 'collapse aestheticised as honesty; rot framed as authenticity.',
        objects: ['the unread service log', 'the postponed audit', 'the legacy code shrine', 'the rusted handrail', 'the silenced ticket'],
        canonical: {
            load: 55,
            shame: 30,
            exit: 50,
            tribe: 25,
            inflation: 35,
            isolation: 70,
        },
        expectedMadness: 40,
        expectedStage: 2,
    },
    reputation: {
        key: 'reputation',
        label: 'reputation',
        subtitle: 'when no apology can clear the record.',
        accusation: 'the screenshot, the quote, the receipt has already arrived.',
        chain: 'public correction can ruin me. no apology suffices. saying the worst thing becomes the move.',
        inversion: 'cancel-baiting as identity; the worse you say it, the freer you look.',
        objects: ['the screenshot thread', 'the unread apology', 'the doubling-down podcast', 'the receipts folder', 'the public meltdown'],
        canonical: {
            load: 72,
            shame: 92,
            exit: 20,
            tribe: 80,
            inflation: 85,
            isolation: 70,
        },
        expectedMadness: 84,
        expectedStage: 5,
    },
    algorithm: {
        key: 'algorithm',
        label: 'algorithm',
        subtitle: 'when the recommender is a moral agent and the engineer is not.',
        accusation: 'your code shapes attention, sleep, mood, polarisation, and revenue.',
        chain: 'code shapes lives. all responsibility is diffuse. maximum engagement becomes the only honesty.',
        inversion: 'dark patterns reframed as honest engineering against sentimental users.',
        objects: ['the engagement dashboard', 'the dark-pattern modal', 'the autoplay tuned for grief', 'the ranked feed', 'the kpi that ate the team'],
        canonical: {
            load: 80,
            shame: 50,
            exit: 30,
            tribe: 60,
            inflation: 60,
            isolation: 60,
        },
        expectedMadness: 62,
        expectedStage: 3,
    },
};
