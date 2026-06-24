import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'single-bandwidth-axis',
        statement:
            'the entire stress response is collapsed onto one signed bandwidth axis, where positive is narrowing (distress) and negative is expansion (eustress). attention, affect, and behaviour are treated as moving together along this single dimension.',
        citation:
            'narrowing under threat follows the attentional-narrowing literature (Easterbrook 1959); eustress as activating widening follows Selye 1974 and the eustress-distress distinction.',
        confidence: 'contested',
        falsifiability:
            'real responses dissociate: someone can show cognitive narrowing while behaviourally expanding. a case where the dimensions move in opposite directions cannot be represented on one axis.',
    },
    {
        id: 'linear-weighted-sum',
        statement:
            'each trajectory position is a linear weighted sum of four mechanism influences plus a baseline offset. there are no interactions, no saturation, and no feedback between mechanisms.',
        citation:
            'a deliberate linear simplification; additive-risk models are common first approximations in psychopathology.',
        confidence: 'contested',
        falsifiability:
            'if social support only buffers appraisal under high threat (an interaction), or if effects saturate, the additive form mispredicts; any documented multiplicative buffering effect breaks linearity.',
    },
    {
        id: 'fixed-beta-signs',
        statement:
            'the sign of every mechanism coefficient is fixed: appraisal and rumination raise chronic narrowing, social support and neuro-flexibility lower it, and neuro-flexibility dominates growth. magnitudes are illustrative, not fitted.',
        citation:
            'directions taken from Ehlers and Clark 2000 (appraisal), Nolen-Hoeksema 2008 (rumination), Bonanno 2007 (social support), Kalisch 2015 (neuro-flexibility).',
        confidence: 'established',
        falsifiability:
            'the directions are well attested, but a population where rumination predicts faster recovery (deliberate, meaning-making rumination) would flip a sign the model holds constant.',
    },
    {
        id: 'four-discrete-trajectories',
        statement:
            'post-event outcomes are bucketed into four discrete prototypical paths (resilience, recovery, chronic, growth) rather than a continuum of outcomes.',
        citation:
            'the four-trajectory taxonomy follows Bonanno 2004 latent-class growth analyses of loss and trauma.',
        confidence: 'contested',
        falsifiability:
            'latent-class membership is itself debated; if outcomes are better described by a continuous distribution than by discrete classes, the four-node picture is a coarse summary.',
    },
    {
        id: 'eustress-as-negative-distress',
        statement:
            'eustress is modelled as the mirror image of distress on the same axis, reached simply by making the constriction value negative. good stress and bad stress are treated as one quantity with opposite sign.',
        citation:
            'Selye 1974 introduced eustress and distress as poles of stress; the single-quantity framing follows the activation/arousal tradition.',
        confidence: 'speculative',
        falsifiability:
            'eustress and distress may recruit partly distinct appraisal and physiological systems rather than being one signed quantity; evidence of separate mechanisms would refute the mirror assumption.',
    },
    {
        id: 'no-time-dynamics',
        statement:
            'the "trajectories" are static end-state positions, not integrated over time. the horizontal axis is labelled time, but the model computes a final offset directly rather than evolving a state through a differential equation.',
        citation:
            'modelling choice: the playground renders branch endpoints, not a simulated time course.',
        confidence: 'established',
        falsifiability:
            'a genuine recovery dip-and-return is a temporal pattern this static model only gestures at via a fixed offset; it cannot reproduce timing, latency, or rate-of-change claims.',
    },
    {
        id: 'population-not-individual',
        statement:
            'the coefficients describe average directional effects across populations, not a specific person. the model cannot predict any individual outcome and is not a clinical instrument.',
        citation:
            'group-level effect sizes in trauma research are small-to-moderate and noisy; individual prediction is far weaker than group association.',
        confidence: 'established',
        falsifiability:
            'applied to a single case it would frequently be wrong; the panel claims structure, not point prediction, and any individual-level use is outside what the model supports.',
    },
];
