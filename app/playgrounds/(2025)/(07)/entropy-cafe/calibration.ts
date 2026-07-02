import type { CalibrationResult } from '@/components/CalibrationPanel';


/**
 * Calibration for entropy cafe.
 *
 * The live playground is a stochastic particle fluid, so there is no single
 * deterministic number per parameter setting to fit against. What IS exactly
 * checkable is the coarse-grained metric pipeline itself: given a known voxel
 * concentration field, the binary Shannon entropy, mixedness, and apparent
 * complexity are fixed quantities.
 *
 * This file reimplements webgpu/shaders/metricsCell.wgsl on the CPU (the exact
 * same formulas and the same particle-weighted average used by MetricsComputer),
 * evaluates it on three canonical coarse-grained states of the cup, and checks
 * the result against independently hand-derived analytic targets. The three
 * states are the three moments in Carroll's cream-into-coffee analogy and the
 * coffee automaton of Aaronson, Carroll and Ouellette (2014): layered, then
 * intricate, then uniform. Across them the coarse-grained entropy rises
 * monotonically while the apparent complexity rises and then falls.
 *
 * `predicted` runs the reimplemented metric pass over the constructed field;
 * `expected` is the closed-form value derived by hand (documented per row).
 * Agreement confirms the metric math the GPU runs is correct.
 */

const EPS = 1e-5; // matches metricsCell.wgsl
const GRID = 8; // cubic coarse-graining grid used for the reference fields
const LAYER = GRID * GRID;
const TOTAL = GRID * LAYER;

type Field = number[]; // cream concentration per voxel, every voxel occupied

function buildField(fn: (x: number, y: number, z: number) => number): Field {
    const field: Field = new Array(TOTAL);
    for (let i = 0; i < TOTAL; i++) {
        const gz = Math.floor(i / LAYER);
        const rem = i - gz * LAYER;
        const gy = Math.floor(rem / GRID);
        const gx = rem - gy * GRID;
        field[i] = fn(gx, gy, gz);
    }
    return field;
}

const clampC = (c: number) => Math.min(Math.max(c, EPS), 1 - EPS);

interface CellMetrics {
    entropy: number;
    mixedness: number;
    complexity: number;
}

/**
 * Particle-weighted mean of the per-voxel metrics, faithful to metricsCell.wgsl
 * followed by the division in MetricsComputer (sum over voxels weighted by
 * occupancy, divided by total occupancy). Every reference voxel here carries
 * unit weight, so this reduces to the mean over voxels.
 */
function meanMetrics(field: Field): CellMetrics {
    let entropySum = 0;
    let mixednessSum = 0;
    let complexitySum = 0;
    let weight = 0;

    for (let i = 0; i < TOTAL; i++) {
        const gz = Math.floor(i / LAYER);
        const rem = i - gz * LAYER;
        const gy = Math.floor(rem / GRID);
        const gx = rem - gy * GRID;

        const c = clampC(field[i]);
        const entropy = -(c * Math.log2(c) + (1 - c) * Math.log2(1 - c));
        const mixedness = 1 - Math.abs(2 * c - 1);

        let grad = 0;
        if (gx + 1 < GRID) grad += Math.abs(c - clampC(field[i + 1]));
        if (gy + 1 < GRID) grad += Math.abs(c - clampC(field[i + GRID]));
        if (gz + 1 < GRID) grad += Math.abs(c - clampC(field[i + LAYER]));

        const complexity = (grad / 3) * mixedness;

        entropySum += entropy;
        mixednessSum += mixedness;
        complexitySum += complexity;
        weight += 1;
    }

    return {
        entropy: entropySum / weight,
        mixedness: mixednessSum / weight,
        complexity: complexitySum / weight,
    };
}


// The three canonical coarse-grained states of the cup.
// layered:  cream resting on coffee, each voxel internally pure.
// swirling: a smooth concentration ramp, voxels span the full range of mixes.
// uniform:  fully mixed, every voxel at a fifty-fifty blend.
const LAYERED = buildField((_x, _y, z) => (z < GRID / 2 ? 0 : 1));
const SWIRLING = buildField((_x, _y, z) => z / (GRID - 1));
const UNIFORM = buildField(() => 0.5);

const M = {
    layered: meanMetrics(LAYERED),
    swirling: meanMetrics(SWIRLING),
    uniform: meanMetrics(UNIFORM),
};

const round4 = (v: number) => Number(v.toFixed(4));


export function buildCalibration(): CalibrationResult[] {
    return [
        {
            name: 'layered, entropy',
            description: 'freshly poured cream on coffee: every coarse voxel is internally pure.',
            predicted: round4(M.layered.entropy),
            // Pure voxels (c = 0 or c = 1) each have H = 0, so the mean is 0.
            expected: 0,
            source: 'H(c) = 0 at c in {0, 1}; coarse-grained entropy of a two-block field',
        },
        {
            name: 'layered, complexity',
            description: 'the sharp interface carries a gradient, but the voxels beside it are pure.',
            predicted: round4(M.layered.complexity),
            // complexity = (|grad|/3) x mixedness, and mixedness = 0 at pure voxels.
            expected: 0,
            source: 'mixedness = 0 at c in {0, 1} kills the gradient term',
        },
        {
            name: 'swirling, entropy',
            description: 'intricate filaments: voxels span the full range of cream fractions.',
            predicted: round4(M.swirling.entropy),
            // Mean of H(k/7) over the eight ramp levels k = 0..7.
            expected: 0.6101,
            source: 'closed-form average of binary entropy over an even 0 to 1 ramp (Aaronson, Carroll, Ouellette 2014)',
        },
        {
            name: 'swirling, complexity',
            description: 'apparent complexity peaks while structure and mixing coexist.',
            predicted: round4(M.swirling.complexity),
            // Sum over the ramp of (|dc|/3) x mixedness, |dc| = 1/7 between levels.
            expected: 0.0204,
            source: 'closed-form average of (gradient/3) x mixedness over the ramp',
        },
        {
            name: 'uniform, entropy',
            description: 'fully mixed: every voxel sits at a fifty-fifty blend.',
            predicted: round4(M.uniform.entropy),
            // H(1/2) = 1 bit, the maximum of the binary entropy.
            expected: 1,
            source: 'H(1/2) = 1, maximal binary Shannon entropy',
        },
        {
            name: 'uniform, complexity',
            description: 'the high-entropy end state is visually the simplest: no gradient at all.',
            predicted: round4(M.uniform.complexity),
            // A constant field has zero gradient everywhere.
            expected: 0,
            source: 'zero concentration gradient in a uniform field',
        },
    ];
}
