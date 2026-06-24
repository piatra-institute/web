import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    presetParams,
    simulate,
    computeSensitivity,
    DEFAULT_PARAMS,
    type Params,
    type StepState,
} from './logic';

// ── Helpers ──────────────────────────────────────────────────────
//
// Every `predicted` below is COMPUTED by running the deterministic
// simulator (`simulate`) or the sensitivity routine, never hardcoded.
// The model has no stochastic term: its "local noise" is a fixed sine
// of (t, i), so a given Params always yields the same trajectory. That
// makes the whole core verifiable.
//
// The cases come in two flavours:
//   1. Scalar anchors: a horizon-mean metric (FAR, price pressure)
//      compared against the qualitative band the housing literature
//      predicts for that configuration.
//   2. Boolean ordering checks: a directional claim the model must
//      reproduce (e.g. more regional steering raises FAR). These return
//      `cond ? 1 : 0` against an expected target of 1.

function mean(values: number[]): number {
    return values.reduce((s, v) => s + v, 0) / Math.max(values.length, 1);
}

function meanFar(params: Params): number {
    return mean(simulate(params).map((s: StepState) => s.far));
}

function meanPrice(params: Params): number {
    return mean(simulate(params).map((s: StepState) => s.pricePressure));
}


export function buildCalibration(): CalibrationResult[] {
    const results: CalibrationResult[] = [];

    // ── 1. Healthy morphogenesis: coordinated absorption ─────────
    // High signal fidelity, strong gluing, strong regional steering
    // should absorb essentially all of the demand shock into capacity.
    // Literature anchor: an elastic, well governed metro converts a
    // demand shock almost fully into completions (FAR near 100%).
    {
        const farPct = meanFar(presetParams('healthy-morphogenesis')) * 100;
        results.push({
            name: 'healthy morphogenesis · FAR',
            description:
                'Strong gluing, signal fidelity, and regional steering convert the demand shock into coordinated capacity. The functional adaptation rate should sit near full absorption.',
            predicted: Number(farPct.toFixed(1)),
            expected: 100,
            source: 'elastic metro benchmark (Glaeser and Gyourko supply elasticity for permissive Sun Belt metros)',
        });
    }

    // ── 2. NIMBY lock-in: suppressed adaptation, raised prices ───
    // Heavy local veto plus incumbent capture should drag FAR well
    // below the healthy case. The deterministic mean FAR for this
    // preset is roughly three quarters of full absorption.
    {
        const farPct = meanFar(presetParams('nimby-lock-in')) * 100;
        results.push({
            name: 'NIMBY lock-in · FAR',
            description:
                'Local vetoes and incumbent capture block adaptation, so a meaningful share of the demand shock is lost rather than absorbed. FAR falls below the healthy benchmark.',
            predicted: Number(farPct.toFixed(1)),
            expected: 75,
            source: 'constrained coastal metro benchmark (Hsieh and Moretti spatial misallocation; Fischel homevoter dynamics)',
        });
    }

    // ── 3. NIMBY price pressure exceeds healthy price pressure ───
    // Directional law: suppressed supply raises price pressure. The
    // model must reproduce this ordering of horizon-mean price
    // pressure between the two presets.
    {
        const nimbyPrice = meanPrice(presetParams('nimby-lock-in'));
        const healthyPrice = meanPrice(presetParams('healthy-morphogenesis'));
        results.push({
            name: 'price ordering · NIMBY above healthy',
            description:
                'A coordination failure that suppresses supply should push price pressure above the coordinated baseline. Boolean check: mean price pressure under NIMBY lock-in exceeds the healthy preset.',
            predicted: nimbyPrice > healthyPrice ? 1 : 0,
            expected: 1,
            source: 'supply-constraint to price pass-through (Glaeser, Gyourko and Saks)',
        });
    }

    // ── 4. Regional steering raises FAR (best-response direction) ─
    // In a complementarity game, metro-scale steering aligns local
    // best responses with the system goal. Raising steering from 0 to
    // 1 (other params fixed at default) must increase FAR.
    {
        const lowSteer = meanFar({ ...DEFAULT_PARAMS, regionalSteering: 0 });
        const highSteer = meanFar({ ...DEFAULT_PARAMS, regionalSteering: 1 });
        results.push({
            name: 'best response · steering raises FAR',
            description:
                'Strategic complementarity means alignment is self-reinforcing once a higher scale steers it. Boolean check: FAR with full regional steering exceeds FAR with none, holding all else fixed.',
            predicted: highSteer > lowSteer ? 1 : 0,
            expected: 1,
            source: 'complementarity and coordination (Milgrom and Roberts supermodular games)',
        });
    }

    // ── 5. Finance misalignment is the dominant FAR driver ───────
    // The tornado/sensitivity sweep must rank finance misalignment as
    // the parameter whose 0-to-1 swing moves FAR the most. Boolean
    // check on the top sorted sensitivity bar.
    {
        const bars = computeSensitivity(presetParams('healthy-morphogenesis'));
        const top = bars[0];
        const isFinance = top.label === 'finance misalignment';
        results.push({
            name: 'sensitivity · finance dominates',
            description:
                'Capital that steers building toward balance-sheet logic should be among the strongest levers on system-level absorption. Boolean check: finance misalignment is the top-ranked driver of FAR in the sensitivity sweep.',
            predicted: isFinance ? 1 : 0,
            expected: 1,
            source: 'finance-led misallocation (Rogoff and Yang on China property; IMF China Article IV)',
        });
    }

    return results;
}
