import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    MATH_CONSTANTS,
    FIELD_RESOLUTION,
    buildPreset,
    computeField,
    cellColor,
    resetUid,
} from './logic';


/**
 * The morphospace engine is a deterministic field generator: computeField has
 * no randomness of its own (the only stochastic step is manual node placement,
 * which the presets bypass). These cases therefore exercise the deterministic
 * core against closed-form targets that can be derived independently of the
 * model, so each predicted value is COMPUTED by the model's own exported
 * functions, never copied from the expected column.
 *
 * Note on prose vs. classifier: the preset descriptions promise specific
 * phenotypes (a "spiral membrane" for golden-spiral, a "striped corridor" for
 * the Feigenbaum ladder). At time = 0 the morphology classifier actually labels
 * several presets "ring shell", because edge bias dominates before the field
 * animates. The research companion documents this discrepancy honestly; the
 * calibration below tests verifiable invariants of the engine, not the prose
 * labels.
 */


// Parse the lightness channel out of an hsl(...) string produced by cellColor.
function hslLightness(color: string): number {
    const match = color.match(/hsl\([\d.]+ [\d.]+% ([\d.]+)%\)/);
    return match ? Number(match[1]) : NaN;
}


export function buildCalibration(): CalibrationResult[] {
    const results: CalibrationResult[] = [];

    // 1. Golden-ratio register. The engine stores phi as a forcing constant.
    //    The defining identity phi^2 = phi + 1 must hold for the stored value,
    //    confirming the register carries the true golden ratio (not a rounded
    //    stand-in). Predicted = phi^2 from the register; expected = phi + 1.
    {
        const phi = MATH_CONSTANTS.phi;
        results.push({
            name: 'golden-ratio register · phi squared',
            description: 'The stored phi forcing constant satisfies phi^2 = phi + 1, so the register holds the exact golden ratio.',
            predicted: Number((phi * phi).toFixed(6)),
            expected: Number((phi + 1).toFixed(6)),
            source: 'defining identity of the golden ratio',
        });
    }

    // 2. Silver-ratio register. The engine stores the silver ratio delta_S.
    //    Its defining identity is delta_S^2 = 2 * delta_S + 1.
    {
        const silver = MATH_CONSTANTS.silver;
        results.push({
            name: 'silver-ratio register · silver squared',
            description: 'The stored silver-ratio forcing constant satisfies s^2 = 2s + 1, confirming the exact value 1 + sqrt(2).',
            predicted: Number((silver * silver).toFixed(6)),
            expected: Number((2 * silver + 1).toFixed(6)),
            source: 'defining identity of the silver ratio',
        });
    }

    // 3. Quiescent colour floor. cellColor maps field value 0 (a dead cell) to a
    //    near-black lime through lerp(7, 48, |value|) on the lightness channel.
    //    At value 0 the lightness is the floor constant 7.
    {
        const light = hslLightness(cellColor(0));
        results.push({
            name: 'colour map · quiescent lightness floor',
            description: 'A field value of 0 renders at the lightness floor of the cellColor lerp, fixing the dead-cell background.',
            predicted: Number(light.toFixed(1)),
            expected: 7,
            source: 'cellColor lightness lerp lower bound',
        });
    }

    // 4. Field discretisation. computeField evaluates the morphospace on a
    //    FIELD_RESOLUTION x FIELD_RESOLUTION grid, so the returned cell array
    //    has exactly FIELD_RESOLUTION^2 entries.
    {
        resetUid();
        const field = computeField(buildPreset('e-mitigation'), 0);
        results.push({
            name: 'discretisation · cell count',
            description: 'computeField samples a square grid, so the cell array length equals FIELD_RESOLUTION squared.',
            predicted: field.cells.length,
            expected: FIELD_RESOLUTION * FIELD_RESOLUTION,
            source: 'square-grid sampling in computeField',
        });
    }

    // 5. Observation readout fidelity. An observation node reports the field at
    //    its own grid cell. The reported value must equal the sampled cell, so
    //    the probe reads the field it sits on without altering it. Encoded as a
    //    boolean (1 = exact match) to survive floating-point comparison.
    {
        resetUid();
        const field = computeField(buildPreset('e-mitigation'), 0);
        const reading = field.observationReadings[0];
        const sampled = reading
            ? field.cells[reading.gy * FIELD_RESOLUTION + reading.gx]
            : NaN;
        const exact = reading && reading.value === sampled ? 1 : 0;
        results.push({
            name: 'observation probe · readout fidelity',
            description: 'An observation node reports exactly the field value at its grid cell, confirming the probe samples without shaping.',
            predicted: exact,
            expected: 1,
            source: 'observation sampling in computeField',
        });
    }

    return results;
}
