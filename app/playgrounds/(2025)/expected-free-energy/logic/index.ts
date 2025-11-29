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

function klDivergenceGaussian(mu1: number, var1: number, mu2: number, var2: number): number {
    if (var1 <= 0 || var2 <= 0) return 0;
    const term1 = 0.5 * Math.log(var2 / var1);
    const term2 = (var1 + Math.pow(mu1 - mu2, 2)) / (2 * var2);
    return term1 + term2 - 0.5;
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
    const ambiguity_per_step = 0.5 * Math.log(2 * Math.PI * Math.E * obs_variance);
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
