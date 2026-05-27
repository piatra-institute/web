import { SCENARIOS, SCENARIO_KEYS, type ScenarioKey } from './logic/scenarios';
import type { Params } from './logic/model';


export interface CalibrationCase {
    key: ScenarioKey;
    name: string;
    description: string;
    params: Params;
    expectedFinal: number;
    source: string;
}

function build(key: ScenarioKey): CalibrationCase {
    const cse = SCENARIOS[key];
    return {
        key,
        name: cse.label,
        description: cse.subtitle,
        params: { ...cse.profile, case: key },
        expectedFinal: cse.expectedFinal,
        source: cse.source,
    };
}

export const calibrationCases: CalibrationCase[] = SCENARIO_KEYS.map(build);
