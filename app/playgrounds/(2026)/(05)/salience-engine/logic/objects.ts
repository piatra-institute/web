export type ObjectKey =
    | 'dopamine'
    | 'glucose'
    | 'notification'
    | 'song'
    | 'beloved'
    | 'rival';

export const OBJECT_KEYS: ObjectKey[] = [
    'dopamine',
    'glucose',
    'notification',
    'song',
    'beloved',
    'rival',
];

export const OBJECT_DIM_KEYS = [
    'matter',
    'constraint',
    'proto',
    'sign',
    'reward',
    'affect',
    'cognition',
    'narrative',
] as const;

export type ObjectDimKey = typeof OBJECT_DIM_KEYS[number];

export const OBJECT_DIM_LABELS: Record<ObjectDimKey, string> = {
    matter: 'physical difference',
    constraint: 'constraint relevance',
    proto: 'proto-salience',
    sign: 'sign function',
    reward: 'incentive reward',
    affect: 'affective charge',
    cognition: 'cognitive capture',
    narrative: 'narrative meaning',
};

export type ObjectProfile = Record<ObjectDimKey, number>;

export interface SalienceObject {
    key: ObjectKey;
    label: string;
    subtitle: string;
    gloss: string;
    profile: ObjectProfile;
    expectedSalience: number;
    expectedStatus: number;
    source: string;
}

export const OBJECTS: Record<ObjectKey, SalienceObject> = {
    dopamine: {
        key: 'dopamine',
        label: 'dopamine molecule',
        subtitle: 'matter that has not yet become a sign.',
        gloss:
            'a dopamine molecule is not the good chemical. on its own it is pure matter. it becomes value-relevant only because organisms wire it into loops that update attention, learning, and pursuit. it says reorganise behaviour around this, not this is good.',
        profile: {
            matter: 95,
            constraint: 42,
            proto: 34,
            sign: 16,
            reward: 26,
            affect: 16,
            cognition: 10,
            narrative: 4,
        },
        expectedSalience: 12,
        expectedStatus: 0,
        source: 'after schultz, reward prediction error (1997, 2016); berridge and robinson, incentive sensitization (2016).',
    },
    glucose: {
        key: 'glucose',
        label: 'glucose cue',
        subtitle: 'a regulatory sign inside a metabolic control system.',
        gloss:
            'a glucose cue is more than chemistry and less than human meaning. it is a biological sign: it stands for a hidden metabolic state and changes what the system must do next. proto-salience and constraint relevance are high; narrative is near zero.',
        profile: {
            matter: 86,
            constraint: 74,
            proto: 64,
            sign: 40,
            reward: 50,
            affect: 31,
            cognition: 22,
            narrative: 6,
        },
        expectedSalience: 42,
        expectedStatus: 1,
        source: 'after deacon, how molecules became signs (2021); regulatory-sign accounts in biosemiotics.',
    },
    notification: {
        key: 'notification',
        label: 'phone notification',
        subtitle: 'the cue that became more charged than the thing it signals.',
        gloss:
            'a phone notification is a near-pure incentive cue. its physical content is trivial, but intermittent reinforcement has made it a motivational command. the sign now carries more charge than the conversation it points to. this is the casino structure.',
        profile: {
            matter: 34,
            constraint: 36,
            proto: 44,
            sign: 70,
            reward: 64,
            affect: 58,
            cognition: 72,
            narrative: 38,
        },
        expectedSalience: 64,
        expectedStatus: 2,
        source: 'after berridge and robinson, incentive sensitization (2016); intermittent-reinforcement literature.',
    },
    song: {
        key: 'song',
        label: 'a shared song',
        subtitle: 'a cultural cue heavy with narrative binding.',
        gloss:
            'a shared song is a cue bound into a self-story. its reward and uncertainty are moderate, but its narrative meaning is high: it stands for a remembered relationship. it shows that narrative binding alone can lift a low-reward object far up the ladder.',
        profile: {
            matter: 30,
            constraint: 40,
            proto: 48,
            sign: 60,
            reward: 52,
            affect: 70,
            cognition: 55,
            narrative: 78,
        },
        expectedSalience: 70,
        expectedStatus: 2,
        source: 'after narrative-identity work, mcadams (2001); cue-reactivity studies of music and autobiographical memory.',
    },
    beloved: {
        key: 'beloved',
        label: 'the beloved person',
        subtitle: 'the full ladder, from matter to world-filter.',
        gloss:
            'the beloved person scores high on every dimension. reward, affect, cognition, and narrative all reinforce one another. their texts, pauses, and absences become absurdly meaningful. under an uncertain regime this object runs away into over-salience: a private oracle through which the world is read.',
        profile: {
            matter: 31,
            constraint: 68,
            proto: 72,
            sign: 82,
            reward: 90,
            affect: 92,
            cognition: 88,
            narrative: 90,
        },
        expectedSalience: 88,
        expectedStatus: 3,
        source: 'after fisher et al., romantic love as a mate-choice drive (2006); tennov, love and limerence (1979).',
    },
    rival: {
        key: 'rival',
        label: 'a possible rival',
        subtitle: 'threat modelling: high cognition, low reward.',
        gloss:
            'a possible rival is a cue with high cognitive capture and affective charge but low incentive reward. it shows that salience is not the same as liking. an object you do not want can still seize attention, because uncertainty and threat keep the prediction loop running.',
        profile: {
            matter: 28,
            constraint: 60,
            proto: 66,
            sign: 78,
            reward: 40,
            affect: 76,
            cognition: 82,
            narrative: 66,
        },
        expectedSalience: 72,
        expectedStatus: 2,
        source: 'after jealousy and threat-monitoring literature; active-inference accounts of uncertainty reduction.',
    },
};
