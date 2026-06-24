import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'phase-oscillators',
        statement:
            'each element of an observer window is reduced to a single phase variable theta on the unit circle, advanced by an intrinsic frequency omega plus coupling. amplitude, waveform, and conduction physiology are discarded; only relative timing survives.',
        citation:
            'Kuramoto 1975; standard weakly-coupled-oscillator reduction used throughout neural-synchrony modelling.',
        confidence: 'established',
        falsifiability:
            'phenomena that depend on amplitude or non-sinusoidal shape (for example burst coding or cross-frequency amplitude effects beyond a phase term) cannot be expressed by a pure phase model.',
    },
    {
        id: 'synchrony-equals-window',
        statement:
            'an observer window is operationalised as a set of oscillators with high within-set Kuramoto order. the order parameter r = |mean(exp(i*theta))| is used as the direct readout of how integrated a window is.',
        citation:
            'Riddle and Schooler 2024, Nested Observer Windows model; synchrony as the within-window binding mechanism.',
        confidence: 'contested',
        falsifiability:
            'if conscious integration can occur in a desynchronised ensemble, or high synchrony occurs with no integration (as in some seizures), then order parameter is the wrong proxy for a window.',
    },
    {
        id: 'coherence-with-lag',
        statement:
            'communication between peer windows at the same level is modelled as a stable phase relation with a non-zero preferred lag, distinct from zero-lag synchrony. the lag is interpolated from the coherence slider rather than derived from conduction delays.',
        citation:
            'Riddle and Schooler 2024 distinguish zero-lag synchrony (within) from lagged coherence (between); communication-through-coherence lineage (Fries 2005).',
        confidence: 'contested',
        falsifiability:
            'measured inter-area lags that do not track a single coherence scalar, or that reverse sign with task, would break the one-parameter lag law used here.',
    },
    {
        id: 'cfc-as-scalar',
        statement:
            'cross-scale communication is summarised by one phase-amplitude-coupling scalar per parent-child level pair, built from the parent mean phase modulating a child amplitude envelope, then averaged. it is a legibility summary, not a full PAC spectrum.',
        citation:
            'phase-amplitude coupling literature (Canolty and Knight 2010); NOW model cross-frequency coupling as the vertical channel.',
        confidence: 'contested',
        falsifiability:
            'real PAC is frequency-pair and region specific; a single averaged scalar would fail to capture cases where different band pairs couple in opposite directions.',
    },
    {
        id: 'report-stability-law',
        statement:
            'the "report stability" output is a hand-built product of apex synchrony, an apex-bandwidth factor, and average coherence: clamp01(syncApex*(0.55+0.45*B)*(0.6+0.4*C)). it is a heuristic composite, not a measured or derived quantity.',
        citation:
            'modelling choice for this playground; no direct empirical fit. the multiplicative form encodes the claim that all three mechanisms are jointly necessary.',
        confidence: 'speculative',
        falsifiability:
            'any operationalisation of report stability that is not monotone in all three inputs, or that is additive rather than multiplicative, would contradict this law.',
    },
    {
        id: 'apex-is-unitary',
        statement:
            'the hierarchy terminates in a single apex window that stands in for unified subjective experience, and the top level is given exactly one window by construction. the existence of a unique apex is assumed, not produced by the dynamics.',
        citation:
            'Riddle and Schooler 2024 propose an apex integrator; Schooler\'s mosaic metaphor of windows within windows.',
        confidence: 'speculative',
        falsifiability:
            'evidence for multiple simultaneous top-level integrators (split-brain or competing-stream cases) would undercut the single-apex assumption.',
    },
    {
        id: 'metaphor-not-theory',
        statement:
            'the simulation visualises the three NOW mechanisms; it does not test whether the brain is organised this way or whether synchrony causes consciousness. it is an interactive illustration of a hypothesis, not evidence for it.',
        citation:
            'NOW is presented by its authors as a framework and research programme; competing accounts (global workspace, integrated information, higher-order theories) explain the same phenomena differently.',
        confidence: 'established',
        falsifiability:
            'the playground produces no prediction that could distinguish NOW from rival theories; any such test must come from the empirical literature, not this toy.',
    },
];
