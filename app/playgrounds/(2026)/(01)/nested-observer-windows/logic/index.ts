/**
 * Nested Observer Windows (NOW) - Multi-scale Oscillator Simulation
 *
 * Based on Riddle & Schooler (2024) "Hierarchical consciousness: the Nested Observer Windows model"
 *
 * Three signature mechanisms:
 * 1. Synchrony (zero phase lag) - defines coherent "observer window" internally
 * 2. Coherence (non-zero phase lag) - communication within same level (peer windows)
 * 3. Cross-frequency coupling - communication across scales (higher ↔ lower windows)
 */

export interface SimulationParams {
    withinSynchrony: number;
    peerCoherence: number;
    crossFreqCoupling: number;
    noise: number;
    apexBandwidth: number;
}

export interface StructureParams {
    numLevels: number;
    windowsPerLevel: number;
    oscillatorsPerWindow: number;
}

export const DEFAULT_PARAMS: SimulationParams = {
    withinSynchrony: 0.65,
    peerCoherence: 0.55,
    crossFreqCoupling: 0.6,
    noise: 0.22,
    apexBandwidth: 0.65,
};

export const DEFAULT_STRUCTURE: StructureParams = {
    numLevels: 3,
    windowsPerLevel: 2,
    oscillatorsPerWindow: 5,
};

export interface OscillatorWindow {
    phases: number[];
    omega: number; // natural frequency
}

export interface LevelState {
    windows: OscillatorWindow[];
}

export interface SimulationState {
    t: number;
    levels: LevelState[]; // index 0 = apex (top), higher indices = lower levels
}

export interface Metrics {
    syncByLevel: number[];
    cohByLevel: number[];
    cfc: number;
    reportStability: number;
}

export interface TimeSeriesPoint {
    t: number;
    syncApex: number;
    syncAvg: number;
    cohAvg: number;
    cfc: number;
    reportStability: number;
}

export function clamp01(x: number): number {
    return Math.max(0, Math.min(1, x));
}

export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

export function fmtPct(x: number): string {
    return `${Math.round(clamp01(x) * 100)}%`;
}

export function wrapAngleRad(x: number): number {
    const twoPi = Math.PI * 2;
    let y = ((x + Math.PI) % twoPi + twoPi) % twoPi;
    return y - Math.PI;
}

/**
 * Kuramoto order parameter: |mean(exp(i*theta))|
 * Measures phase synchrony within a group of oscillators
 * Returns 1 if all phases aligned, 0 if uniformly distributed
 */
export function kuramotoOrder(phases: number[]): number {
    if (phases.length === 0) return 0;
    let re = 0;
    let im = 0;
    for (const th of phases) {
        re += Math.cos(th);
        im += Math.sin(th);
    }
    re /= phases.length;
    im /= phases.length;
    return Math.sqrt(re * re + im * im);
}

/**
 * Mean angle via vector sum
 */
export function meanAngle(phases: number[]): number {
    if (phases.length === 0) return 0;
    let re = 0;
    let im = 0;
    for (const th of phases) {
        re += Math.cos(th);
        im += Math.sin(th);
    }
    return Math.atan2(im, re);
}

export function createInitialState(structure: StructureParams): SimulationState {
    const { numLevels, windowsPerLevel, oscillatorsPerWindow } = structure;

    const levels: LevelState[] = [];

    for (let lvl = 0; lvl < numLevels; lvl++) {
        // Apex (level 0) has 1 window, other levels have windowsPerLevel windows
        const numWindows = lvl === 0 ? 1 : windowsPerLevel;
        // Higher levels (lower index) have slower frequency
        const baseOmega = 0.6 + lvl * 0.8;
        // Oscillators decrease slightly toward apex
        const numOsc = lvl === 0 ? Math.max(3, oscillatorsPerWindow - 2) : oscillatorsPerWindow;

        const windows: OscillatorWindow[] = [];
        for (let w = 0; w < numWindows; w++) {
            windows.push({
                phases: Array.from({ length: numOsc }, () => Math.random() * Math.PI * 2),
                omega: baseOmega,
            });
        }
        levels.push({ windows });
    }

    return { t: 0, levels };
}

/**
 * Pull oscillators within a window toward their mean phase
 */
function pullWithin(phases: number[], strength: number, jitter: () => number, dt: number): number[] {
    const mean = meanAngle(phases);
    return phases.map((th) => wrapAngleRad(th + strength * wrapAngleRad(mean - th) + jitter() * dt));
}

/**
 * Advance intrinsic oscillations
 */
function advancePhases(phases: number[], omega: number, jitter: () => number, dt: number): number[] {
    return phases.map((th) => wrapAngleRad(th + omega * dt + jitter() * dt));
}

export interface StepResult {
    state: SimulationState;
    metrics: Metrics;
}

export function stepSimulation(
    state: SimulationState,
    params: SimulationParams,
    dt: number
): StepResult {
    const { withinSynchrony, peerCoherence, crossFreqCoupling, noise, apexBandwidth } = params;

    const jitter = () => (Math.random() * 2 - 1) * noise * 0.9;

    // Clone state
    const newState: SimulationState = {
        t: state.t + dt,
        levels: state.levels.map(level => ({
            windows: level.windows.map(w => ({
                ...w,
                phases: [...w.phases],
            })),
        })),
    };

    const numLevels = newState.levels.length;

    // Apply within-window synchrony (stronger at lower levels)
    for (let lvl = 0; lvl < numLevels; lvl++) {
        const levelFactor = 1 - lvl * 0.1; // slightly weaker at higher indices
        const withinStrength = withinSynchrony * 0.9 * levelFactor * dt;

        newState.levels[lvl].windows = newState.levels[lvl].windows.map(w => ({
            ...w,
            phases: pullWithin(w.phases, withinStrength, jitter, dt),
        }));
    }

    // Advance intrinsic oscillations
    for (let lvl = 0; lvl < numLevels; lvl++) {
        newState.levels[lvl].windows = newState.levels[lvl].windows.map(w => ({
            ...w,
            phases: advancePhases(w.phases, w.omega, jitter, dt),
        }));
    }

    // Peer coherence: pull window means toward each other within same level
    const peerStrength = peerCoherence * 0.8 * dt;

    for (let lvl = 0; lvl < numLevels; lvl++) {
        const level = newState.levels[lvl];
        if (level.windows.length < 2) continue;

        const lag = lerp(0.8, 0.2, peerCoherence) * (1 - lvl * 0.1);
        const means = level.windows.map(w => meanAngle(w.phases));

        // Calculate average mean for all windows to pull toward
        const avgMean = meanAngle(means);

        const newMeans = means.map((m, i) => {
            // Pull toward neighbors with preferred lag
            const nextIdx = (i + 1) % means.length;
            const target = means[nextIdx] + lag;
            return wrapAngleRad(m + peerStrength * wrapAngleRad(target - m) + jitter() * dt);
        });

        newState.levels[lvl].windows = level.windows.map((w, i) => {
            const delta = wrapAngleRad(newMeans[i] - means[i]);
            return { ...w, phases: w.phases.map(th => wrapAngleRad(th + delta)) };
        });
    }

    // Calculate metrics
    const syncByLevel: number[] = [];
    const cohByLevel: number[] = [];

    for (let lvl = 0; lvl < numLevels; lvl++) {
        const level = newState.levels[lvl];

        // Synchrony: average Kuramoto order across windows
        const syncSum = level.windows.reduce((sum, w) => sum + kuramotoOrder(w.phases), 0);
        syncByLevel.push(syncSum / level.windows.length);

        // Coherence: stability of phase relations between peer windows
        if (level.windows.length >= 2) {
            const means = level.windows.map(w => meanAngle(w.phases));
            const lag = lerp(0.8, 0.2, peerCoherence) * (1 - lvl * 0.1);
            let cohSum = 0;
            for (let i = 0; i < means.length; i++) {
                const nextIdx = (i + 1) % means.length;
                cohSum += 1 - Math.abs(wrapAngleRad(means[i] - means[nextIdx] - lag)) / Math.PI;
            }
            cohByLevel.push(clamp01(cohSum / means.length));
        } else {
            cohByLevel.push(1); // Single window = perfect coherence with itself
        }
    }

    // Cross-frequency coupling metric
    let cfcSum = 0;
    let cfcCount = 0;

    for (let lvl = 0; lvl < numLevels - 1; lvl++) {
        const parentLevel = newState.levels[lvl];
        const childLevel = newState.levels[lvl + 1];

        const parentMean = meanAngle(parentLevel.windows.flatMap(w => w.phases));

        for (const childWindow of childLevel.windows) {
            const childMean = meanAngle(childWindow.phases);
            const env = 0.5 + 0.5 * Math.cos(parentMean);
            const base = 0.6 + 0.4 * Math.cos(childMean);
            const amp = clamp01(lerp(base, base * env, crossFreqCoupling));
            cfcSum += clamp01(0.5 + 0.5 * Math.sin(parentMean) * (amp - 0.5));
            cfcCount++;
        }
    }

    const cfc = cfcCount > 0 ? clamp01(cfcSum / cfcCount) : 0;

    // Report stability: apex synchrony × bandwidth × average coherence
    const syncApex = syncByLevel[0] || 0;
    const avgCoh = cohByLevel.length > 0 ? cohByLevel.reduce((a, b) => a + b, 0) / cohByLevel.length : 0;
    const reportStability = clamp01(syncApex * (0.55 + 0.45 * apexBandwidth) * (0.6 + 0.4 * avgCoh));

    const metrics: Metrics = {
        syncByLevel,
        cohByLevel,
        cfc,
        reportStability,
    };

    return { state: newState, metrics };
}

/**
 * Get level name for display
 */
export function getLevelName(levelIndex: number, totalLevels: number): string {
    if (levelIndex === 0) return 'Apex';
    if (levelIndex === totalLevels - 1) return 'Base';
    return `Level ${totalLevels - levelIndex}`;
}

/**
 * Get color for level
 */
export function getLevelColor(levelIndex: number, totalLevels: number): string {
    const colors = ['#f472b6', '#fb923c', '#84cc16', '#22d3ee', '#a78bfa', '#f87171'];
    return colors[levelIndex % colors.length];
}
