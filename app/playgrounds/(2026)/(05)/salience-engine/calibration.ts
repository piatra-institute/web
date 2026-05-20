import { OBJECTS, OBJECT_KEYS, type ObjectKey } from './logic/objects';
import { PRESET_DESCRIPTIONS, type Params } from './logic/model';


export interface CalibrationCase {
    key: ObjectKey;
    name: string;
    description: string;
    params: Params;
    expectedSalience: number;
    source: string;
}

function build(key: ObjectKey): CalibrationCase {
    const obj = OBJECTS[key];
    const params: Params = {
        ...PRESET_DESCRIPTIONS.balanced.field,
        object: key,
        regime: 'ambiguous',
        preset: 'balanced',
    };
    return {
        key,
        name: obj.label,
        description: obj.subtitle,
        params,
        expectedSalience: obj.expectedSalience,
        source: obj.source,
    };
}

export const calibrationCases: CalibrationCase[] = OBJECT_KEYS.map(build);
