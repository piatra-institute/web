export interface CalibrationCase {
    name: string;
    description: string;
    params: {
        attenuation: number;
        omissionRate: number;
        warpingBias: number;
        amplificationGain: number;
        recursionStrength: number;
        channelNoise: number;
        priorStrength: number;
        trustInChannel: number;
        motivatedReasoning: number;
    };
    expected: number;
    source: string;
}

export const calibrationCases: CalibrationCase[] = [
    {
        name: 'transparent channel',
        description: 'Full signal, no distortion operators active. Agent should track benchmark closely.',
        params: {
            attenuation: 100, omissionRate: 0, warpingBias: 0,
            amplificationGain: 0, recursionStrength: 0, channelNoise: 0,
            priorStrength: 30, trustInChannel: 80, motivatedReasoning: 0,
        },
        expected: 0.01,
        source: 'Theoretical baseline: Bayesian agent with high-fidelity channel should converge to benchmark',
    },
    {
        name: 'news desert',
        description: 'Severe attenuation, low signal. Agent uncertain but not systematically wrong.',
        params: {
            attenuation: 15, omissionRate: 0, warpingBias: 0,
            amplificationGain: 0, recursionStrength: 0, channelNoise: 20,
            priorStrength: 40, trustInChannel: 60, motivatedReasoning: 0,
        },
        expected: 0.04,
        source: 'News desert research: attenuation produces uncertainty, not directional bias (Darr et al., 2018)',
    },
    {
        name: 'partisan media',
        description: 'Moderate signal with strong warping bias and selective omission.',
        params: {
            attenuation: 60, omissionRate: 40, warpingBias: 50,
            amplificationGain: 0, recursionStrength: 0, channelNoise: 15,
            priorStrength: 30, trustInChannel: 70, motivatedReasoning: 0,
        },
        expected: 0.12,
        source: 'Levendusky, 2013 — partisan media increases polarization and confident miscalibration',
    },
    {
        name: 'algorithmic feed',
        description: 'Strong recursion (personalization) with amplification of engaging content.',
        params: {
            attenuation: 70, omissionRate: 20, warpingBias: 10,
            amplificationGain: 60, recursionStrength: 70, channelNoise: 10,
            priorStrength: 30, trustInChannel: 70, motivatedReasoning: 20,
        },
        expected: 0.15,
        source: 'Pariser, 2011; Bail et al., 2018 — filter bubbles and echo chamber dynamics',
    },
    {
        name: 'high trust + motivated reasoning',
        description: 'Agent fully trusts a distorted channel and resists contradictory evidence.',
        params: {
            attenuation: 60, omissionRate: 30, warpingBias: 40,
            amplificationGain: 0, recursionStrength: 50, channelNoise: 15,
            priorStrength: 50, trustInChannel: 90, motivatedReasoning: 70,
        },
        expected: 0.18,
        source: 'Kahan et al., 2017 — identity-protective cognition amplifies channel distortion',
    },
];
