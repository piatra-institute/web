import { Params, Events, presetParams, DEFAULT_EVENTS } from './logic';


export interface CalibrationCase {
    name: string;
    description: string;
    params: Params;
    events: Events;
    expected: number;
    source: string;
}

export const calibrationCases: CalibrationCase[] = [
    {
        name: 'intact balanced policy',
        description: 'Moderate rent-targeting with active public R&D and frontier subsidies; no extreme controls',
        params: presetParams('balanced'),
        events: DEFAULT_EVENTS,
        expected: 35,
        source: 'Stylized: mixed-economy industrial policy (Scandinavian / East Asian developmental state baseline)',
    },
    {
        name: 'Venezuelan-style controls',
        description: 'High direct profit control, weak subsidies, expensive capital, low energy abundance',
        params: presetParams('breakdown'),
        events: { aiShock: false, cheapNuclear: false, cisLunar: false, rtsc: false, automationWave: false },
        expected: -10,
        source: 'Venezuela Fair Prices Law 2014; Norton Rose Fulbright; IMF country reports',
    },
    {
        name: 'wartime mobilization',
        description: 'High procurement, public R&D, and excess-profits capture in a mission context',
        params: presetParams('wartime'),
        events: { aiShock: true, cheapNuclear: false, cisLunar: false, rtsc: false, automationWave: true },
        expected: 30,
        source: 'US WWII war production; IMF 2022 excess-profits tax review',
    },
    {
        name: 'venture hypergrowth',
        description: 'Minimal controls, low capital cost, fast scaling, high concentration risk',
        params: presetParams('venture'),
        events: { aiShock: true, cheapNuclear: false, cisLunar: false, rtsc: false, automationWave: true },
        expected: 25,
        source: 'Stylized: US tech sector 2010-2024 light-touch governance',
    },
];
