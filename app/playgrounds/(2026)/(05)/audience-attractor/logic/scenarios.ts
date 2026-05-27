import type { SimulationParams } from './simulation';


export type ScenarioKey =
    | 'baseline'
    | 'breakout'
    | 'pivot'
    | 'scandal'
    | 'collapse'
    | 'decay';

export const SCENARIO_KEYS: ScenarioKey[] = [
    'baseline',
    'breakout',
    'pivot',
    'scandal',
    'collapse',
    'decay',
];

export interface ScenarioCase {
    key: ScenarioKey;
    label: string;
    subtitle: string;
    gloss: string;
    profile: SimulationParams;
    expectedFinal: number;
    expectedDwellShare: number;
    expectedRegimeIndex: number;
    source: string;
}

export const SCENARIOS: Record<ScenarioKey, ScenarioCase> = {
    baseline: {
        key: 'baseline',
        label: 'baseline sticky band',
        subtitle: 'no major events. the floor and ceiling do most of the work.',
        gloss:
            'a streamer or talk-radio host running on habit and parasocial attachment. small noise around a single dwell band; neither a breakout nor a collapse. this is the regime the attractor metaphor was built for, and the cleanest baseline against which to read every other scenario.',
        profile: {
            initialFloor: 850,
            capacity: 6200,
            habit: 7,
            parasocial: 6,
            discoverability: 5.2,
            cumulativeAdvantage: 5,
            saturation: 6.8,
            identityLock: 5.8,
            quality: 5.4,
            noise: 2.2,
            shockProbability: 5,
            shockStrength: 18,
        },
        expectedFinal: 800,
        expectedDwellShare: 0.78,
        expectedRegimeIndex: 2,
        source: 'after Salganik, Dodds and Watts, experimental study of inequality and unpredictability in an artificial cultural market (Science 2006); Twitch popularity power-law analyses (2022).',
    },
    breakout: {
        key: 'breakout',
        label: 'breakout campaign',
        subtitle: 'a collab window opens; discoverability jumps for a fraction of the run.',
        gloss:
            'around 20 percent of the way through the simulation a collaboration, raid, or platform push doubles discoverability for the middle quarter of the run. the question is whether the audience settles into a higher band after the window closes, or relaxes back to the prior floor. this is the classic test of whether a transient shock can move the system between basins.',
        profile: {
            initialFloor: 850,
            capacity: 6200,
            habit: 7,
            parasocial: 6,
            discoverability: 5.2,
            cumulativeAdvantage: 5,
            saturation: 6.8,
            identityLock: 5.8,
            quality: 5.4,
            noise: 2.2,
            shockProbability: 5,
            shockStrength: 18,
        },
        expectedFinal: 1050,
        expectedDwellShare: 0.7,
        expectedRegimeIndex: 2,
        source: 'after Rosen, the economics of superstars (American Economic Review 1981); platform raid and collaboration network studies.',
    },
    pivot: {
        key: 'pivot',
        label: 'format pivot',
        subtitle: 'a format change mid-run lifts the effective niche capacity and quality.',
        gloss:
            'the streamer changes format around the 35 percent mark: capacity rises by 65 percent and quality lifts by about a point. an identity-lock-in cost in the existing fanbase competes with the new ceiling. whether the pivot actually moves the system depends on whether the saturation drag clears in time for the cumulative-advantage term to do work in the new basin.',
        profile: {
            initialFloor: 850,
            capacity: 6200,
            habit: 6.5,
            parasocial: 6,
            discoverability: 5.5,
            cumulativeAdvantage: 5.5,
            saturation: 6.0,
            identityLock: 6.5,
            quality: 5.6,
            noise: 2.2,
            shockProbability: 5,
            shockStrength: 18,
        },
        expectedFinal: 960,
        expectedDwellShare: 0.7,
        expectedRegimeIndex: 2,
        source: 'after Bourdieu on field reconversion (1979); platform pivot case studies in creator-economy reporting.',
    },
    scandal: {
        key: 'scandal',
        label: 'trust shock',
        subtitle: 'a controversy injects negative drift for a portion of the run.',
        gloss:
            'a scandal applies a sustained negative drift over roughly ten percent of the run. retention is not directly broken, but viewers leak. the test is whether the core audience, kept by habit and parasocial attachment, holds the floor and the trajectory returns to its band, or whether the floor itself drops to a lower basin.',
        profile: {
            initialFloor: 850,
            capacity: 6200,
            habit: 7,
            parasocial: 6,
            discoverability: 5.2,
            cumulativeAdvantage: 5,
            saturation: 6.8,
            identityLock: 5.8,
            quality: 5.4,
            noise: 2.2,
            shockProbability: 5,
            shockStrength: 18,
        },
        expectedFinal: 540,
        expectedDwellShare: 0.48,
        expectedRegimeIndex: 0,
        source: 'after Braithwaite on reintegrative shaming (1989); audience research on scandal-recovery dynamics in talk media.',
    },
    collapse: {
        key: 'collapse',
        label: 'schedule collapse',
        subtitle: 'the streamer stops being reliable; habit retention drops by half.',
        gloss:
            'a quarter of the way into the run the host loses their schedule. habit retention is multiplied by roughly 0.52, cutting the slow-decay term in the core-audience equation. this isolates the role of routine: when the schedule goes, how fast does the floor go with it, and where does the system come to rest.',
        profile: {
            initialFloor: 850,
            capacity: 6200,
            habit: 7,
            parasocial: 6,
            discoverability: 5.2,
            cumulativeAdvantage: 5,
            saturation: 6.8,
            identityLock: 5.8,
            quality: 5.4,
            noise: 2.2,
            shockProbability: 5,
            shockStrength: 18,
        },
        expectedFinal: 300,
        expectedDwellShare: 0.55,
        expectedRegimeIndex: 0,
        source: 'after Lobato on television defaults and routines (2024); cumulative behavioural-default research in audience studies.',
    },
    decay: {
        key: 'decay',
        label: 'slow decay',
        subtitle: 'low discoverability with strong habit. the floor erodes without a shock.',
        gloss:
            'no event, no scandal, no breakout. discoverability is low, quality drift is flat, but habit and parasocial attachment are still high. the trajectory tests whether the floor is genuinely sticky or whether it slowly slides downward in the absence of new acquisition. a clean falsification target: if even this scenario settles into a band, the attractor reading is doing real work.',
        profile: {
            initialFloor: 1500,
            capacity: 4500,
            habit: 7.5,
            parasocial: 6.5,
            discoverability: 2.4,
            cumulativeAdvantage: 4,
            saturation: 7.5,
            identityLock: 6.2,
            quality: 4.6,
            noise: 1.8,
            shockProbability: 2,
            shockStrength: 12,
        },
        expectedFinal: 160,
        expectedDwellShare: 0.55,
        expectedRegimeIndex: 0,
        source: 'after Salganik et al. (2006) on social influence and inequality; long-tail decay analyses of legacy talk-radio properties.',
    },
};
