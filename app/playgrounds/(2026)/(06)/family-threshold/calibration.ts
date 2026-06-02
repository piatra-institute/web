import { SCENARIOS, SCENARIO_KEYS, type ScenarioKey } from './logic/scenarios';
import type { Params } from './logic/model';


export interface CalibrationCase {
    key: ScenarioKey;
    name: string;
    description: string;
    params: Params;
    /** target final family integrity (0-100 percent), reader-assigned. */
    expectedFamily: number;
    source: string;
}


function build(key: ScenarioKey): CalibrationCase {
    const cse = SCENARIOS[key];
    return {
        key,
        name: cse.label,
        description: cse.subtitle,
        params: { ...cse.profile, case: key },
        expectedFamily: cse.expectedFamily,
        source: cse.source,
    };
}


export const calibrationCases: CalibrationCase[] = SCENARIO_KEYS.map(build);
