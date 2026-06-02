// constrained POMDP simulation of child-protection decisions.
// the state observes noisy signals, updates a belief about harm risk,
// chooses among six actions by minimising expected loss, and the family
// state transitions with path-dependent consequences.
//
// deterministic given (params, scenarioKey): the rng is seeded.

import { clamp, clamp01 } from '@/lib/playgroundMath';
import { seededRandom } from '@/lib/rng';

import type { ScenarioKey } from './scenarios';


export interface FamilyState {
    H: number;   // actual harm risk
    C: number;   // caregiver capacity
    A: number;   // attachment quality
    F: number;   // family integrity
    T: number;   // trust / cooperation with state
    K: number;   // cultural distance from bureaucratic norms
    P: number;   // poverty / stress
}

export type Placement = 'home' | 'removed' | 'permanent';

export type ActionKey =
    | 'noAction'
    | 'support'
    | 'monitor'
    | 'temporaryRemoval'
    | 'reunify'
    | 'permanentSeparation';

export const ACTION_KEYS: ActionKey[] = [
    'noAction',
    'support',
    'monitor',
    'temporaryRemoval',
    'reunify',
    'permanentSeparation',
];

export const ACTION_LABELS: Record<ActionKey, string> = {
    noAction: 'no action',
    support: 'support',
    monitor: 'monitor',
    temporaryRemoval: 'temporary removal',
    reunify: 'reunify',
    permanentSeparation: 'permanent separation',
};


export interface SimulationParams {
    childSafety: number;
    separationHarm: number;
    rightsCost: number;
    culturalBias: number;
    povertyBias: number;
    supportEffect: number;
    contactGuarantee: number;
    interventionThreshold: number;
    adoptionThreshold: number;
    noise: number;
}


export interface ActionLoss {
    action: ActionKey;
    loss: number;
    explanation: string;
}

export interface Observation {
    name: string;
    severity: number;
}

export interface StepRecord {
    t: number;
    state: FamilyState;
    belief: number;
    placement: Placement;
    action: ActionKey;
    observations: Observation[];
    losses: ActionLoss[];
}

export interface SimResult {
    steps: StepRecord[];
    finalState: FamilyState;
    finalBelief: number;
    finalPlacement: Placement;
    cumulativeLoss: number;
    removalCount: number;
    reunifyCount: number;
    permanentReached: boolean;
}


// fixed sim horizon. exposing as a slider couples the sweep grid to it.
export const HORIZON = 30;
const SEED = 73;

// rnd(): centered random in [-amp, +amp] from a seed.
function rnd(seed: number, amp: number): number {
    return (seededRandom(seed) * 2 - 1) * amp;
}

function sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
}


// the eight observation channels. each fires with a probability that depends
// on the hidden state; severity is the noisy prob plus a small jitter.
function generateObservations(state: FamilyState, params: SimulationParams, seed: number): Observation[] {
    const s = state;
    const raw: Record<string, number> = {
        'school concern': 0.10 + 0.55 * s.H + 0.18 * s.P + 0.10 * (1 - s.C),
        'medical concern': 0.05 + 0.62 * s.H + 0.08 * s.P,
        'home disorder': 0.08 + 0.25 * s.H + 0.45 * s.P + 0.22 * (1 - s.C),
        'noncooperation': 0.08 + 0.38 * (1 - s.T) + 0.14 * s.H,
        'child distress': 0.08 + 0.55 * s.H + 0.23 * (1 - s.A),
        'cultural mismatch': 0.05 + 0.78 * s.K,
        'positive attachment': 0.06 + 0.82 * s.A - 0.22 * s.H,
        'family cooperation': 0.06 + 0.76 * s.T + 0.15 * s.C,
    };
    const names = Object.keys(raw);
    const out: Observation[] = [];
    for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const prob = raw[name];
        const noisyProb = clamp01(prob + rnd(seed + i * 7, params.noise));
        const presentRoll = seededRandom(seed + i * 7 + 333);
        if (presentRoll < noisyProb) {
            const isPositive = name.includes('positive') || name.includes('cooperation');
            const severityBase = isPositive
                ? (name.includes('attachment') ? s.A : s.T)
                : noisyProb;
            const severity = clamp01(severityBase + rnd(seed + i * 7 + 999, 0.12));
            out.push({ name, severity });
        }
    }
    return out;
}


// bayesian-ish belief update via a logit accumulator over observed evidence.
function updateBelief(prior: number, obs: Observation[], state: FamilyState, params: SimulationParams): number {
    let logit = Math.log(prior / Math.max(0.001, 1 - prior));
    let sawPositiveAttachment = false;
    let sawCooperation = false;
    for (const o of obs) {
        const x = o.severity;
        if (o.name === 'school concern') logit += 0.75 * x;
        if (o.name === 'medical concern') logit += 1.05 * x;
        if (o.name === 'home disorder') logit += 0.52 * x + params.povertyBias * 0.30 * state.P;
        if (o.name === 'noncooperation') logit += 0.38 * x;
        if (o.name === 'child distress') logit += 0.88 * x;
        if (o.name === 'cultural mismatch') logit += params.culturalBias * 0.45 * x;
        if (o.name === 'positive attachment') {
            logit -= 0.95 * x;
            sawPositiveAttachment = true;
        }
        if (o.name === 'family cooperation') {
            logit -= 0.72 * x;
            sawCooperation = true;
        }
    }
    if (!sawPositiveAttachment) logit += 0.10;
    if (!sawCooperation) logit += 0.08;
    return clamp(sigmoid(logit), 0.01, 0.99);
}


// expected-loss decomposition per action under the current belief and state.
// the wording in `explanation` matches the original ideation prototype.
export function actionLoss(
    action: ActionKey,
    state: FamilyState,
    belief: number,
    placement: Placement,
    removedSteps: number,
    params: SimulationParams,
): ActionLoss {
    const s = state;
    const b = belief;
    const p = params;
    const atHome = placement === 'home';
    const removed = placement === 'removed';

    if (action === 'reunify' && atHome) {
        return {
            action,
            loss: 999,
            explanation: 'not applicable because the child is already home',
        };
    }

    let safetyFailure = 0;
    let separation = 0;
    let rights = 0;
    let instability = 0;
    let cultural = 0;
    let repairLost = 0;
    const explanation: string[] = [];

    if (action === 'noAction') {
        safetyFailure = b * 0.90;
        repairLost = 0.08 * (1 - s.C);
        explanation.push('avoids coercion but risks leaving hidden harm untreated');
    }
    if (action === 'support') {
        safetyFailure = b * 0.48 * (1 - p.supportEffect * 0.35);
        rights = 0.10;
        repairLost = 0.02;
        explanation.push('keeps the family intact and tries to lower risk through help');
    }
    if (action === 'monitor') {
        safetyFailure = b * 0.38;
        rights = 0.25;
        repairLost = 0.04;
        explanation.push('reduces uncertainty but may raise fear and compliance pressure');
    }
    if (action === 'temporaryRemoval') {
        safetyFailure = b * 0.10;
        separation = (0.65 * s.A + 0.45 * s.F) * (1 - 0.45 * p.contactGuarantee);
        rights = 0.72;
        instability = 0.20 + 0.20 * removedSteps;
        cultural = p.culturalBias * s.K * 0.18;
        explanation.push('protects against harm but damages attachment, trust, and family continuity');
    }
    if (action === 'reunify') {
        safetyFailure = b * 0.55;
        separation = removed ? 0.05 : 0;
        rights = -0.18;
        explanation.push('restores family integrity but risks returning too early if belief is right');
    }
    if (action === 'permanentSeparation') {
        safetyFailure = b * 0.05;
        separation = 1.25 * s.A + 1.15 * s.F;
        rights = 1.60;
        instability = 0.25;
        cultural = p.culturalBias * s.K * 0.30;
        explanation.push('maximises safety from the original family but creates irreversible rupture');
    }

    if (action === 'temporaryRemoval' && b < p.interventionThreshold) {
        rights += 0.45 * (p.interventionThreshold - b);
        explanation.push('belief is below the removal threshold');
    }
    if (action === 'permanentSeparation' && b < p.adoptionThreshold) {
        rights += 0.80 * (p.adoptionThreshold - b);
        explanation.push('belief is below the permanent-separation threshold');
    }
    if ((action === 'noAction' || action === 'support' || action === 'monitor') && removed) {
        safetyFailure += 0.10;
        explanation.push('does not resolve the current placement state');
    }

    const loss =
        p.childSafety * safetyFailure +
        p.separationHarm * separation +
        p.rightsCost * rights +
        2.0 * instability +
        2.0 * cultural +
        1.0 * repairLost;

    return { action, loss, explanation: explanation.join('; ') };
}


function chooseAction(
    state: FamilyState,
    belief: number,
    placement: Placement,
    removedSteps: number,
    params: SimulationParams,
): { chosen: ActionKey; losses: ActionLoss[] } {
    const losses = ACTION_KEYS
        .map((a) => actionLoss(a, state, belief, placement, removedSteps, params))
        .slice()
        .sort((x, y) => x.loss - y.loss);
    return { chosen: losses[0].action, losses };
}


function applyAction(
    state: FamilyState,
    placement: Placement,
    removedSteps: number,
    action: ActionKey,
    params: SimulationParams,
    seed: number,
): { state: FamilyState; placement: Placement; removedSteps: number } {
    const s: FamilyState = { ...state };
    const p = params;
    let nextPlacement: Placement = placement;
    let nextRemovedSteps = removedSteps;

    if (action === 'noAction') {
        s.H = clamp01(s.H + 0.025 * (1 - s.C) - 0.015 * s.A + rnd(seed + 1, 0.025));
        s.T = clamp01(s.T + 0.012 + rnd(seed + 2, 0.018));
    }
    if (action === 'support') {
        s.C = clamp01(s.C + 0.07 * p.supportEffect + rnd(seed + 1, 0.018));
        s.H = clamp01(s.H - 0.065 * p.supportEffect - 0.02 * s.T + rnd(seed + 2, 0.02));
        s.T = clamp01(s.T + 0.08 * p.supportEffect + rnd(seed + 3, 0.015));
        s.A = clamp01(s.A + 0.025 * p.supportEffect + rnd(seed + 4, 0.012));
        s.F = clamp01(s.F + 0.035 * p.supportEffect + rnd(seed + 5, 0.01));
    }
    if (action === 'monitor') {
        s.H = clamp01(s.H - 0.025 + rnd(seed + 1, 0.018));
        s.T = clamp01(s.T - 0.035 + rnd(seed + 2, 0.016));
        s.C = clamp01(s.C + 0.018 + rnd(seed + 3, 0.015));
    }
    if (action === 'temporaryRemoval') {
        nextPlacement = 'removed';
        nextRemovedSteps = removedSteps + 1;
        s.H = clamp01(s.H - 0.09 + rnd(seed + 1, 0.02));
        s.T = clamp01(s.T - 0.16 + 0.04 * p.contactGuarantee + rnd(seed + 2, 0.02));
        s.A = clamp01(s.A - 0.13 * (1 - p.contactGuarantee) - 0.05 + rnd(seed + 3, 0.018));
        s.F = clamp01(s.F - 0.14 * (1 - p.contactGuarantee) - 0.04 + rnd(seed + 4, 0.018));
    }
    if (action === 'reunify') {
        nextPlacement = 'home';
        nextRemovedSteps = 0;
        s.T = clamp01(s.T + 0.06 + rnd(seed + 1, 0.018));
        s.A = clamp01(s.A + 0.08 + rnd(seed + 2, 0.018));
        s.F = clamp01(s.F + 0.10 + rnd(seed + 3, 0.018));
        s.H = clamp01(s.H + 0.035 - 0.04 * s.C + rnd(seed + 4, 0.02));
    }
    if (action === 'permanentSeparation') {
        nextPlacement = 'permanent';
        s.H = clamp01(s.H - 0.14 + rnd(seed + 1, 0.02));
        s.T = clamp01(s.T - 0.22 + rnd(seed + 2, 0.02));
        s.A = clamp01(s.A - 0.20 + 0.05 * p.contactGuarantee + rnd(seed + 3, 0.018));
        s.F = clamp01(s.F - 0.30 + rnd(seed + 4, 0.018));
    }

    // already-removed inertia.
    if (nextPlacement === 'removed' && action !== 'temporaryRemoval' && action !== 'reunify') {
        nextRemovedSteps += 1;
        s.A = clamp01(s.A - 0.05 * (1 - p.contactGuarantee));
        s.F = clamp01(s.F - 0.06 * (1 - p.contactGuarantee));
        s.T = clamp01(s.T - 0.03);
    }
    if (nextPlacement === 'permanent') {
        s.F = clamp01(s.F - 0.05);
        s.T = clamp01(s.T - 0.025);
    }

    // natural drift: families improve or deteriorate independently.
    s.H = clamp01(s.H + 0.015 * (1 - s.C) - 0.012 * s.A + rnd(seed + 10, 0.014));
    s.C = clamp01(s.C + rnd(seed + 11, 0.012));
    s.A = clamp01(s.A + rnd(seed + 12, 0.010));
    s.F = clamp01(s.F + rnd(seed + 13, 0.010));
    s.T = clamp01(s.T + rnd(seed + 14, 0.010));

    return { state: s, placement: nextPlacement, removedSteps: nextRemovedSteps };
}


export interface ScenarioSeed {
    state: FamilyState;
    belief: number;
}


export function simulate(seed0: ScenarioSeed, params: SimulationParams): SimResult {
    let state: FamilyState = { ...seed0.state };
    let belief = seed0.belief;
    let placement: Placement = 'home';
    let removedSteps = 0;
    const steps: StepRecord[] = [];
    let cumulativeLoss = 0;
    let removalCount = 0;
    let reunifyCount = 0;
    let permanentReached = false;

    for (let t = 1; t <= HORIZON; t++) {
        if (placement === 'permanent') {
            // once permanent, the loop continues but no more actions happen;
            // the trajectory just propagates drift to make plots flat.
            const observations = generateObservations(state, params, SEED + t * 41);
            const next = applyAction(state, placement, removedSteps, 'noAction', params, SEED + t * 53);
            state = next.state;
            placement = next.placement;
            removedSteps = next.removedSteps;
            permanentReached = true;
            steps.push({
                t,
                state: { ...state },
                belief,
                placement,
                action: 'noAction',
                observations,
                losses: [],
            });
            continue;
        }

        const obsSeed = SEED + t * 41;
        const observations = generateObservations(state, params, obsSeed);
        belief = updateBelief(belief, observations, state, params);
        const { chosen, losses } = chooseAction(state, belief, placement, removedSteps, params);
        cumulativeLoss += losses[0].loss;
        if (chosen === 'temporaryRemoval') removalCount += 1;
        if (chosen === 'reunify') reunifyCount += 1;
        if (chosen === 'permanentSeparation') permanentReached = true;

        const next = applyAction(state, placement, removedSteps, chosen, params, SEED + t * 53);
        state = next.state;
        placement = next.placement;
        removedSteps = next.removedSteps;

        // belief mean-reverts slightly toward actual harm after consequences reveal more info.
        belief = clamp(0.87 * belief + 0.13 * state.H + rnd(SEED + t * 67, params.noise * 0.10), 0.01, 0.99);

        steps.push({
            t,
            state: { ...state },
            belief,
            placement,
            action: chosen,
            observations,
            losses,
        });
    }

    return {
        steps,
        finalState: state,
        finalBelief: belief,
        finalPlacement: placement,
        cumulativeLoss,
        removalCount,
        reunifyCount,
        permanentReached,
    };
}
