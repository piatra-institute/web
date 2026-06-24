import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    presetParams,
    buildActualSeries,
    buildComparison,
    computeKpis,
    decomposePolicy,
    blendedPolicy,
    normalizeBlend,
    COUNTRIES,
    YEARS,
    YEAR_START,
} from './logic';


/**
 * Every `predicted` value here is COMPUTED by calling the model functions,
 * then checked against an `expected` target that is derived independently
 * (closed-form compounding, a structural identity, or a weighted average).
 * The growth model is fully deterministic, so the whole engine is calibratable.
 */
export function buildCalibration(): CalibrationResult[] {
    const results: CalibrationResult[] = [];

    // 1. Closed-form compound growth.
    //    The actual series is FV = PV * prod_{t}(1 + g_t). We recompute the
    //    same product by hand and compare to buildActualSeries' last value.
    const roActual = buildActualSeries('ROU');
    const roPredicted = roActual[roActual.length - 1].gdpPc;
    let roClosedForm = COUNTRIES.ROU.gdpPc1990;
    for (const year of YEARS) {
        if (year === YEAR_START) continue;
        const g = year <= 1994 ? -0.035
            : year <= 2007 ? 0.029
            : year <= 2010 ? -0.055
            : year <= 2019 ? 0.028
            : 0.022;
        roClosedForm *= 1 + g;
    }
    results.push({
        name: 'compound growth · Romania actual 2024',
        description: 'buildActualSeries compounds the regime growth rates; checked against the closed-form product PV·∏(1+g).',
        predicted: Number(roPredicted.toFixed(2)),
        expected: Number(roClosedForm.toFixed(2)),
        source: 'closed-form compounding of the Romanian growth-anchor regimes (1990 base $5,000)',
    });

    // 2. Zero-intensity identity.
    //    With transfer intensity 0 the counterfactual must collapse onto the
    //    target's own trajectory, so the 2024 lift is exactly 0%.
    const idleParams = { ...presetParams('ro-under-pl'), transferIntensity: 0 };
    const idleKpis = computeKpis(buildComparison(idleParams));
    results.push({
        name: 'identity · zero-intensity transfer',
        description: 'At transfer intensity 0 no model growth is adopted and the convergence drag vanishes, so the counterfactual equals the baseline.',
        predicted: Number(idleKpis.pctLift.toFixed(2)),
        expected: 0,
        source: 'structural identity of the transfer interpolation at intensity 0',
    });

    // 3. Reverse-framing target swap.
    //    Reverse framing on "Romania under Poland" swaps the baseline to be
    //    Poland's own actual series, so the 2024 baseline GDP must equal
    //    Poland's actual 2024 GDP.
    const reverseParams = { ...presetParams('ro-under-pl'), reverseFraming: true };
    const reverseKpis = computeKpis(buildComparison(reverseParams));
    const polActual = buildActualSeries('POL');
    const polActual2024B = polActual[polActual.length - 1].gdp / 1e9;
    results.push({
        name: 'symmetry · reverse-framing baseline',
        description: 'Reverse framing swaps which country supplies the baseline; the 2024 baseline must equal Poland’s own actual GDP.',
        predicted: Number(reverseKpis.latestActualGDPB.toFixed(2)),
        expected: Number(polActual2024B.toFixed(2)),
        source: 'Poland actual 2024 GDP from buildActualSeries (billions, constant 2010 USD)',
    });

    // 4. Blended (synthetic-control) policy weighting.
    //    The institutions score of a normalized 40/35/25 Poland/Czechia/Slovakia
    //    blend must equal the weighted average of the three institution scores.
    const synthBlend = normalizeBlend({ POL: 0.4, CZE: 0.35, SVK: 0.25 });
    const blendInstitutions = blendedPolicy(synthBlend).institutions;
    const expectedInstitutions =
        0.4 * COUNTRIES.POL.policy.institutions
        + 0.35 * COUNTRIES.CZE.policy.institutions
        + 0.25 * COUNTRIES.SVK.policy.institutions;
    results.push({
        name: 'synthetic control · blended institutions',
        description: 'A weighted blend of donor countries must yield the weighted average of their policy scores on each dimension.',
        predicted: Number(blendInstitutions.toFixed(2)),
        expected: Number(expectedInstitutions.toFixed(2)),
        source: 'weighted average of donor institution scores (Poland 70, Czechia 78, Slovakia 64)',
    });

    // 5. Policy-gap decomposition closure.
    //    The per-dimension contributions are shares of the total positive gap,
    //    so for any scenario with a positive gap they must sum to 100%.
    const decomp = decomposePolicy(presetParams('ro-under-pl'));
    const contribSum = decomp.reduce((s, d) => s + d.contribution, 0);
    results.push({
        name: 'decomposition · contribution closure',
        description: 'Per-dimension policy-gap contributions are shares of the total positive gap and must sum to 100%.',
        predicted: Number(contribSum.toFixed(2)),
        expected: 100,
        source: 'normalization identity of the policy-gap decomposition',
    });

    return results;
}
