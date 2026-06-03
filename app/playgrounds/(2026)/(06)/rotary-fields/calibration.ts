import { SCENARIOS, PRESET_KEYS, type PresetKey } from './logic/scenarios';
import type { Params } from './logic/model';


export interface CalibrationCase {
    key: PresetKey;
    name: string;
    description: string;
    params: Params;
    /** target attention concentration (0-100 percent), reader-assigned. */
    expectedConcentration: number;
    source: string;
}


function build(key: PresetKey): CalibrationCase {
    const cse = SCENARIOS[key];
    return {
        key,
        name: cse.label,
        description: cse.subtitle,
        params: { ...cse.profile, preset: key },
        expectedConcentration: cse.expectedConcentration,
        source: cse.source,
    };
}


export const calibrationCases: CalibrationCase[] = PRESET_KEYS.map(build);
