import { CASES, CASE_KEYS, type CaseKey } from './logic/cases';
import type { Params } from './logic/model';


export interface CalibrationCase {
    key: CaseKey;
    name: string;
    description: string;
    params: Params;
    expectedAllowedSpan: number;
    source: string;
}

function build(key: CaseKey): CalibrationCase {
    const cse = CASES[key];
    const params: Params = {
        M: 1,
        ...cse.profile,
        case: key,
    };
    return {
        key,
        name: cse.label,
        description: cse.subtitle,
        params,
        expectedAllowedSpan: cse.expectedAllowedSpan,
        source: cse.source,
    };
}

export const calibrationCases: CalibrationCase[] = CASE_KEYS.map(build);
