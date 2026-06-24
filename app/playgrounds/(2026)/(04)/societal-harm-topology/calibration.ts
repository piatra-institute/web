import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    DIMENSIONS,
    DEFAULT_PARAMS,
    DimensionKey,
    HarmVector,
    Params,
    Sector,
    computeMetrics,
    vectorGini,
} from './logic';


/**
 * Calibration of the deterministic core of the harm-topology model.
 *
 * The model is fully deterministic (no stochastic sampling), so every
 * calibration target is an exact analytic property of the pipeline rather
 * than an empirical fit to outside data. Each case recomputes the property
 * from the logic functions and checks it against the value the mathematics
 * forces. Boolean structural checks return 1 when the invariant holds; the
 * Gini case checks a closed-form value for a maximally concentrated vector.
 */

function zeroVector(): HarmVector {
    const v = {} as HarmVector;
    for (const d of DIMENSIONS) v[d.key as DimensionKey] = 0;
    return v;
}

// A single isolated sector with round numbers, used to check the closed-form
// exposure factor exposure = (pop/100)*(centrality/100)*(leverage/100).
function makeSingleSector(): Sector {
    return {
        id: 'probe',
        name: 'Probe sector',
        population: 50,
        centrality: 80,
        leverage: 100,
        benefit: 0,
        uncertainty: 0,
        gluing: 100,
        harms: { ...zeroVector(), material: 100 },
    };
}

function withSectors(sectors: Sector[]): Params {
    return {
        ...DEFAULT_PARAMS,
        sectors: sectors.map((s) => ({ ...s, harms: { ...s.harms } })),
        selectedSector: sectors[0].id,
    };
}


export function buildCalibration(): CalibrationResult[] {
    const results: CalibrationResult[] = [];

    // 1. Exposure closed form. exposure should equal the product of the three
    // normalized reach factors. With pop=50, centrality=80, leverage=100:
    // 0.5 * 0.8 * 1.0 = 0.4.
    const probe = makeSingleSector();
    const m1 = computeMetrics(withSectors([probe]));
    const expectedExposure =
        (probe.population / 100) * (probe.centrality / 100) * (probe.leverage / 100);
    const exposureOk =
        Math.abs(m1.local[0].exposure - expectedExposure) < 1e-9 ? 1 : 0;
    results.push({
        name: 'exposure closed form',
        description:
            'exposure of a probe sector equals (pop/100) x (centrality/100) x (leverage/100); here 0.5 x 0.8 x 1.0 = 0.40.',
        predicted: exposureOk,
        expected: 1,
        source: 'reach-as-product decomposition (population x network centrality x institutional leverage)',
    });

    // 2. Global vector additivity. The global harm vector must be the exact
    // sum of the per-sector dimension vectors across all dimensions.
    const mDef = computeMetrics(DEFAULT_PARAMS);
    let additive = 1;
    for (const d of DIMENSIONS) {
        const k = d.key as DimensionKey;
        const summed = mDef.local.reduce((acc, s) => acc + s.dimensionScores[k], 0);
        if (Math.abs(mDef.globalVector[k] - summed) > 1e-7) additive = 0;
    }
    results.push({
        name: 'global vector additivity',
        description:
            'the global harm vector equals the componentwise sum of every sector vector, for all 8 dimensions.',
        predicted: additive,
        expected: 1,
        source: 'linear aggregation of local harm sections (sum over the open cover)',
    });

    // 3. Obstruction complementarity. obstruction = 100 - sheafConsistency by
    // construction; the two must always sum to exactly 100.
    const complementOk =
        Math.abs(mDef.sheafConsistency + mDef.obstruction - 100) < 1e-9 ? 1 : 0;
    results.push({
        name: 'obstruction complementarity',
        description:
            'sheaf consistency and topological obstruction are complementary and sum to 100 for any configuration.',
        predicted: complementOk,
        expected: 1,
        source: 'H^1 obstruction defined as the complement of global gluing consistency',
    });

    // 4. Repair monotonicity. Raising repairCapacity can only reduce (never
    // increase) the net total harm; the scalar index is derived from net harm.
    const low = computeMetrics({ ...DEFAULT_PARAMS, repairCapacity: 0 });
    const high = computeMetrics({ ...DEFAULT_PARAMS, repairCapacity: 100 });
    const monotoneOk = high.netTotal <= low.netTotal + 1e-9 ? 1 : 0;
    results.push({
        name: 'repair monotonicity',
        description:
            'net harm is non-increasing in repair capacity: maximal counter-power yields net total no larger than zero repair.',
        predicted: monotoneOk,
        expected: 1,
        source: 'repair adjustment as a subtractive offset on net harm',
    });

    // 5. Gini of a maximally concentrated vector. For a vector with one nonzero
    // entry out of n=8 equal candidates, the Gini coefficient has the closed
    // form (n-1)/n = 7/8 = 0.875.
    const concentrated: HarmVector = { ...zeroVector(), tail: 100 };
    const gini = vectorGini(concentrated);
    const n = DIMENSIONS.length;
    const expectedGini = (n - 1) / n;
    const giniOk = Math.abs(gini - expectedGini) < 1e-9 ? 1 : 0;
    results.push({
        name: 'concentration Gini',
        description:
            'Gini of a vector with all mass in one of 8 dimensions equals the closed form (n-1)/n = 7/8 = 0.875.',
        predicted: giniOk,
        expected: 1,
        source: 'Gini of a single-spike distribution over n equal slots',
    });

    return results;
}
