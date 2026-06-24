export interface SimulationResult {
    meanEFE: number;
    meanKL: number;
    trajectories: Trajectory[];
    boundaryWidth: number;
}

export interface Trajectory {
    path: Point[];
}

export interface Point {
    t: number;
    s: number;
}

function randomNormal(): number {
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export function klDivergenceGaussian(mu1: number, var1: number, mu2: number, var2: number): number {
    if (var1 <= 0 || var2 <= 0) return 0;
    const term1 = 0.5 * Math.log(var2 / var1);
    const term2 = (var1 + Math.pow(mu1 - mu2, 2)) / (2 * var2);
    return term1 + term2 - 0.5;
}

/**
 * Discrete Kullback-Leibler divergence D_KL(p || q) in nats. Both inputs are
 * treated as probability vectors over the same support. Terms where p_i is zero
 * contribute nothing (0 * log 0 := 0). This is the exact information-theoretic
 * core that the EFE risk term reduces to in the discrete setting, and it
 * satisfies D_KL(p || p) = 0 for any p.
 */
export function klDivergence(p: number[], q: number[]): number {
    let sum = 0;
    for (let i = 0; i < p.length; i++) {
        if (p[i] > 0 && q[i] > 0) {
            sum += p[i] * Math.log(p[i] / q[i]);
        }
    }
    return sum;
}

/**
 * Shannon entropy H(p) = -sum p_i log p_i in nats. For a uniform distribution
 * over n outcomes this equals log(n). It is the ambiguity-style quantity that
 * an active-inference agent reduces when it seeks informative observations.
 */
export function entropy(p: number[]): number {
    let sum = 0;
    for (const pi of p) {
        if (pi > 0) sum -= pi * Math.log(pi);
    }
    return sum;
}

/**
 * Softmax over a logit vector, returning a normalised probability vector. In
 * active inference the policy posterior is sigma(-gamma * G), the softmax of the
 * negative expected free energies. The output always sums to 1.
 */
export function softmax(logits: number[], temperature: number = 1): number[] {
    const scaled = logits.map((x) => x / temperature);
    const max = Math.max(...scaled);
    const exps = scaled.map((x) => Math.exp(x - max));
    const total = exps.reduce((a, b) => a + b, 0);
    return exps.map((e) => e / total);
}

/**
 * Differential entropy of a 1D Gaussian observation channel with the given
 * variance, in nats: 0.5 * log(2 pi e variance). This is the per-step ambiguity
 * (expected conditional entropy of observations given states) used by the
 * Monte Carlo simulation above.
 */
export function gaussianAmbiguity(variance: number): number {
    return 0.5 * Math.log(2 * Math.PI * Math.E * variance);
}

/**
 * Closed-form expected free energy decomposition for one policy in the Gaussian
 * setting used by this playground. The agent integrates a state from 0 under a
 * random walk with per-step variance stateNoiseStd^2; the risk term is the
 * squared deviation of the expected observation from the goal summed over the
 * horizon, weighted by riskWeight; the ambiguity term is the per-step
 * observation entropy times the horizon. With expected observation mean equal to
 * the integrated state mean (0 under a zero-drift walk), the deterministic risk
 * is riskWeight * horizon * goal^2.
 */
export function expectedFreeEnergy(
    horizon: number,
    riskWeight: number,
    observationNoiseStd: number,
    goalState: number,
): { risk: number; ambiguity: number; efe: number } {
    const ambiguityPerStep = gaussianAmbiguity(Math.pow(observationNoiseStd, 2));
    const ambiguity = horizon * ambiguityPerStep;
    // Expected hidden-state mean is 0 (zero-drift random walk), so the expected
    // observation deviation from the goal is (0 - goalState).
    const risk = riskWeight * horizon * Math.pow(0 - goalState, 2);
    return { risk, ambiguity, efe: risk + ambiguity };
}

export function runSimulation(
    horizon: number,
    samples: number,
    riskWeight: number,
    boundaryWidth: number,
    stateNoise: number = 0.1,
    observationNoise: number = 0.1,
    goalState: number = 0.0
): SimulationResult {
    const state_noise_std = stateNoise;
    const obs_noise_std = observationNoise;
    const goal_obs = goalState;
    const goal_state_mu = goalState;
    const goal_state_var = Math.pow(0.01, 2);

    let totalEFE = 0, totalKL = 0;
    const trajectories: Trajectory[] = [];
    const MAX_TRAJ_TO_DRAW = 200;

    const obs_variance = Math.pow(obs_noise_std, 2);
    const ambiguity_per_step = gaussianAmbiguity(obs_variance);
    const total_ambiguity = horizon * ambiguity_per_step;

    for (let i = 0; i < samples; i++) {
        let s = 0.0;
        let trajectory_risk = 0, trajectory_kl = 0;
        const path: Point[] = [{t: 0, s: 0.0}];

        for (let t = 1; t <= horizon; t++) {
            s += randomNormal() * state_noise_std;
            if (i < MAX_TRAJ_TO_DRAW) path.push({t, s});

            const o = s + randomNormal() * obs_noise_std;
            trajectory_risk += Math.pow(o - goal_obs, 2);

            const state_variance_t = t * Math.pow(state_noise_std, 2);
            trajectory_kl += klDivergenceGaussian(0, state_variance_t, goal_state_mu, goal_state_var);
        }

        if (i < MAX_TRAJ_TO_DRAW) trajectories.push({ path });
        totalEFE += (riskWeight * trajectory_risk) + total_ambiguity;
        totalKL += trajectory_kl;
    }

    return {
        meanEFE: totalEFE / samples,
        meanKL: totalKL / samples,
        trajectories,
        boundaryWidth
    };
}
