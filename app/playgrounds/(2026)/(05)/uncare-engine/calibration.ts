import { CASES, type CaseKey } from './logic/cases';
import type { Params } from './logic/model';


export interface CalibrationCase {
    name: string;
    description: string;
    params: Params;
    expectedWelfare: number;
    source: string;
}

function build(key: CaseKey, source: string): CalibrationCase {
    const c = CASES[key];
    const params: Params = {
        ...c.canonical,
        case: key,
        preset: 'exhausted',
    };
    return {
        name: c.label,
        description: c.subtitle,
        params,
        expectedWelfare: c.expectedMadness,
        source,
    };
}

export const calibrationCases: CalibrationCase[] = [
    build('veganism', 'after singer, "animal liberation" (1975); foer, "eating animals" (2009).'),
    build('climate', 'after malm, "fossil capital" (2016); haltinner & sarathchandra studies of climate scepticism (2018).'),
    build('speech', 'after norris & inglehart, "cultural backlash" (2019); ronson, "so you\'ve been publicly shamed" (2015).'),
    build('politics', 'after mason, "uncivil agreement" (2018); haidt, "the righteous mind" (2012).'),
    build('craft', 'after sennett, "the craftsman" (2008); pirsig, "zen and the art of motorcycle maintenance" (1974).'),
    build('institutions', 'after mauss, "the gift" (1925); fukuyama, "political order and political decay" (2014).'),
    build('migration', 'after gessen reporting (2018-2024); blee, "inside organized racism" (2002).'),
    build('maintenance', 'after russell & vinsel, "the innovation delusion" (2020); jackson, "rethinking repair" (2014).'),
    build('reputation', 'after ronson (2015); klonick, "the new governors" (2018).'),
    build('algorithm', 'after zuboff, "the age of surveillance capitalism" (2019); seaver, "captivating algorithms" (2019).'),
];
