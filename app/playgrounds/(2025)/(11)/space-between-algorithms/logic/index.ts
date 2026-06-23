// The model lives in constants.ts (it predates the standard layout). This module
// re-exports it so the calibration and consumers have a clean logic surface.
//
// The "freedom score" of an algorithmic system is a weighted blend of five
// normalized indicators, each in [0,1]: the entropy of its choices (intraEntropy),
// how much its actions shape its future (empowerment), the size of its policy
// manifold (policyVolume), how much higher-level structure emerges
// (causalEmergence), and how compressible its behaviour is
// (descriptiveRegularity). The weights sum to one, so the score is a convex
// combination scaled to 0..100.

export {
    computeFreedomScore,
    PRESETS,
    type SimulationParams,
    type Preset,
    type PresetId,
} from '../constants';

// the component weights of the freedom score, exposed for the calibration
export const FREEDOM_WEIGHTS = {
    intraEntropy: 0.25,
    empowerment: 0.25,
    policyVolume: 0.2,
    causalEmergence: 0.2,
    descriptiveRegularity: 0.1,
} as const;
