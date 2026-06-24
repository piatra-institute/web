import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    computePolicy,
    DEFAULT_WEIGHTS,
    POLICY_SPECS,
    type Context,
    type PolicyType,
} from './logic';


const clamp = (x: number, min = 0, max = 1) => Math.max(min, Math.min(max, x));

// A neutral context with every variable at 0.5, perturbed per case.
const NEUTRAL: Context = {
    crowd: 0.5,
    distance: 0.5,
    surfaceHard: 0.5,
    hurry: 0.5,
    mastery: 0.5,
    normPressure: 0.5,
    currentArousal: 0.5,
    desiredArousal: 0.5,
    novelty: 0.5,
    carryingLoad: 0.5,
};


interface ComponentCase {
    name: string;
    policy: PolicyType;
    ctx: Context;
    // pulls the model's computed value for this component out of PolicyComponents
    read: (c: ReturnType<typeof computePolicy>['components']) => number;
    // the same value derived from the closed form, independently of the model
    expected: number;
    description: string;
}


/**
 * The expected-free-energy model has no fitted parameters, so there is no
 * external empirical target to match. What is genuinely verifiable is that each
 * deterministic EFE component reproduces its own closed-form definition exactly.
 * Every `expected` here is hand-derived from the published formula (not read
 * back from the model), and every `predicted` is the value the live
 * `computePolicy` function returns for the same context. Agreement to four
 * decimals confirms the implementation matches the documented equations. The
 * stochastic time-stepping (stepSimulation) is left out; only the deterministic
 * scoring core is calibrated here.
 */
function buildCases(): ComponentCase[] {
    const run = POLICY_SPECS.run;
    const walk = POLICY_SPECS.walk;
    const skip = POLICY_SPECS.skip;

    return [
        {
            name: 'injury probability · run on a crowd',
            policy: 'run',
            ctx: { ...NEUTRAL },
            read: (c) => c.injuryProb,
            expected: clamp(
                0.05 +
                    0.55 * run.impact * (0.35 + 0.65 * 0.5) * (0.3 + 0.7 * 0.5) *
                    (0.55 + 0.45 * 0.5) * (1 - 0.75 * 0.5),
            ),
            description:
                'running with high impact on a moderately hard, moderately crowded surface; injury rises with impact, surface, crowd and load, and falls with mastery.',
        },
        {
            name: 'energy cost · walk, long trip, hands free',
            policy: 'walk',
            ctx: { ...NEUTRAL, distance: 0.8, carryingLoad: 0 },
            read: (c) => c.energyCost,
            expected: clamp((0.15 + 0.85 * 0.8) * walk.energyPerDist * (0.7 + 0.6 * 0)),
            description:
                'energy scales linearly with trip distance and the per-distance cost of the gait, with a load multiplier of one when nothing is carried.',
        },
        {
            name: 'social penalty · skipping in a crowd',
            policy: 'skip',
            ctx: { ...NEUTRAL, crowd: 0.8, normPressure: 0.9 },
            read: (c) => c.socialPenalty,
            expected: clamp(skip.conspicuous * (0.15 + 0.85 * 0.8) * (0.1 + 0.9 * 0.9)),
            description:
                'the conspicuous gait (skip) is penalised most where the crowd is dense and the social norm pressure is high.',
        },
        {
            name: 'predicted arousal · skip lifts energy',
            policy: 'skip',
            ctx: { ...NEUTRAL, currentArousal: 0.3, distance: 0.4 },
            read: (c) => c.predictedArousal,
            expected: clamp(0.3 + 0.45 * skip.signalAmp + 0.25 * skip.impact - 0.1 * 0.4),
            description:
                'predicted arousal starts from current arousal, rises with proprioceptive signal and impact, and decays slightly over distance.',
        },
        {
            name: 'information gain · novel run for a novice',
            policy: 'run',
            ctx: { ...NEUTRAL, novelty: 0.9, mastery: 0.2, crowd: 0.1 },
            read: (c) => c.infoGain,
            expected: clamp(
                0.9 * run.complexity * (1 - 0.2) * (0.35 + 0.65 * run.signalAmp) * (1 - 0.55 * 0.1),
            ),
            description:
                'information gain is largest when novelty is high, mastery is low, the gait is complex and signal-rich, and the crowd is sparse enough to attend to it.',
        },
    ];
}


export function buildCalibration(): CalibrationResult[] {
    return buildCases().map((c) => {
        const result = computePolicy(c.policy, c.ctx, DEFAULT_WEIGHTS);
        const predicted = c.read(result.components);
        return {
            name: c.name,
            description: c.description,
            predicted: Number(predicted.toFixed(4)),
            expected: Number(c.expected.toFixed(4)),
            source: 'closed-form EFE component definition (Friston active inference; this playground’s logic/index.ts)',
        };
    });
}
