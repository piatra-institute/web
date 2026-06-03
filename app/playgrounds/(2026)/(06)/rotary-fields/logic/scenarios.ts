import type { SimulationParams } from './model';


export type PresetKey =
    | 'llama'
    | 'longContext'
    | 'shortContext'
    | 'extrapolation'
    | 'neuralPhase';

export const PRESET_KEYS: PresetKey[] = [
    'llama',
    'longContext',
    'shortContext',
    'extrapolation',
    'neuralPhase',
];


export interface ScenarioCase {
    key: PresetKey;
    label: string;
    subtitle: string;
    gloss: string;
    profile: SimulationParams;
    /** target nearby-attention concentration as a percent of peak, 0..100. */
    expectedConcentration: number;
    source: string;
}


export const SCENARIOS: Record<PresetKey, ScenarioCase> = {
    llama: {
        key: 'llama',
        label: 'LLaMA-style head',
        subtitle: 'canonical RoPE configuration in modern decoder-only language models.',
        gloss:
            'the baseline. RoPE base 10000, four embedding pairs, 16-token window. nearby tokens attend strongly, far tokens are softly suppressed. this is the default behaviour every other preset is read against.',
        profile: {
            seqLen: 16,
            pairs: 4,
            base: 10000,
            tokenI: 5,
            tokenJ: 10,
            contentSim: 0.62,
            phaseSlope: 300,
            noise: 0.08,
            gridScale: 8,
            seed: 1337,
        },
        expectedConcentration: 32,
        source: 'Su et al. 2021, RoFormer; LLaMA technical report.',
    },
    longContext: {
        key: 'longContext',
        label: 'long-range head',
        subtitle: 'high base, many pairs. attention spans the full window.',
        gloss:
            'the configuration favoured for long-context LLMs and for attention heads tasked with discourse-level dependencies. larger base flattens the frequency ladder, slow rotations spread the attention mass over longer distances.',
        profile: {
            seqLen: 32,
            pairs: 8,
            base: 50000,
            tokenI: 6,
            tokenJ: 18,
            contentSim: 0.55,
            phaseSlope: 220,
            noise: 0.06,
            gridScale: 10,
            seed: 4242,
        },
        expectedConcentration: 24,
        source: 'after Chen et al. 2023, position interpolation; YaRN and base-scaling literature.',
    },
    shortContext: {
        key: 'shortContext',
        label: 'short-context bias',
        subtitle: 'low base, few pairs. attention sharpens around the diagonal.',
        gloss:
            'an attention head that aggressively localises. small base means fast rotations across positions, which destroys far-token alignment and concentrates the attention mass on adjacent tokens. useful as a syntax-locality head.',
        profile: {
            seqLen: 12,
            pairs: 2,
            base: 500,
            tokenI: 3,
            tokenJ: 7,
            contentSim: 0.7,
            phaseSlope: 360,
            noise: 0.05,
            gridScale: 6,
            seed: 909,
        },
        expectedConcentration: 64,
        source: 'after Voita et al. 2019, syntactic attention heads; classic locality-bias analyses.',
    },
    extrapolation: {
        key: 'extrapolation',
        label: 'extrapolation regime',
        subtitle: 'sequence longer than the typical rotation period. wrap-around effects.',
        gloss:
            'when the sequence length exceeds the longest RoPE wavelength, attention starts wrapping. nearby-distant boundaries become ambiguous. this is the regime where naive RoPE fails to extrapolate and where position interpolation / base scaling tricks help.',
        profile: {
            seqLen: 40,
            pairs: 4,
            base: 10000,
            tokenI: 4,
            tokenJ: 32,
            contentSim: 0.5,
            phaseSlope: 540,
            noise: 0.1,
            gridScale: 12,
            seed: 7113,
        },
        expectedConcentration: 38,
        source: 'after Press et al. 2022, ALiBi; Chen et al. 2023, length extrapolation.',
    },
    neuralPhase: {
        key: 'neuralPhase',
        label: 'place-cell phase code',
        subtitle: 'maximum phase precession across a place field. RoPE\'s biological cousin.',
        gloss:
            'the neural-side analogue. phase slope set to 360 degrees per field, matching O\'Keefe and Recce 1993. the RoPE plane and the place-cell phase wheel encode position as angle in essentially the same way, even though the implementations have nothing in common.',
        profile: {
            seqLen: 20,
            pairs: 3,
            base: 1000,
            tokenI: 4,
            tokenJ: 14,
            contentSim: 0.4,
            phaseSlope: 360,
            noise: 0.12,
            gridScale: 7,
            seed: 2024,
        },
        expectedConcentration: 40,
        source: 'after O\'Keefe and Recce 1993, theta phase precession; Burgess et al. 2007, oscillatory interference grid model.',
    },
};
