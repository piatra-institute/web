import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'neural-mass-model',
        statement:
            'the model is a two-population neural-mass system (excitatory E and inhibitory I) with synaptic conductances and thalamic drive, integrated over time. it is a coarse mean-field caricature of cortical dynamics, not a detailed network of neurons.',
        citation:
            'Wilson-Cowan / neural-mass modelling of cortical populations.',
        confidence: 'contested',
        falsifiability:
            'phenomena requiring spatial structure or individual-neuron detail cannot be captured by a two-population mean field.',
    },
    {
        id: 'sigmoid-firing',
        statement:
            'population firing rate is a sigmoid (logistic) function of input, with a gain and a threshold. this is the standard saturating input-output curve and is exact in the model.',
        citation:
            'sigmoidal firing-rate function, standard in neural-mass models.',
        confidence: 'established',
        falsifiability:
            'the calibration checks the sigmoid at and away from threshold; a deviation would be an implementation error.',
    },
    {
        id: 'synchrony-as-correlation',
        statement:
            'synchrony between the excitatory and inhibitory signals is measured by their Pearson correlation, which is +1 for aligned activity, -1 for opposed, and near 0 for unrelated. this is exact.',
        citation:
            'Pearson correlation as a synchrony index.',
        confidence: 'established',
        falsifiability:
            'the calibration verifies the correlation on aligned, opposed, and unrelated signals; failing it would be a bug.',
    },
    {
        id: 'access-probability-proxy',
        statement:
            'the "access probability" metric is a heuristic proxy for sustained, synchronized high activity (a stand-in for global ignition in consciousness theories), not a measured probability of awareness.',
        citation:
            'global-workspace / ignition theories of consciousness (Dehaene); used here illustratively.',
        confidence: 'speculative',
        falsifiability:
            'the proxy is defined on model signals; it is not validated against any measurement of conscious access.',
    },
    {
        id: 'stochastic-noise',
        statement:
            'the dynamics are driven by random noise, so each run differs and the on-screen trajectory and metrics are single-sample estimates, not expectations.',
        citation:
            'noise terms via Gaussian random draws in the integrator.',
        confidence: 'established',
        falsifiability:
            'this is why the calibration targets the deterministic primitives rather than a specific simulated trajectory.',
    },
    {
        id: 'conceptual-not-clinical',
        statement:
            'the model maps regimes (waking, sleep, anesthesia) to qualitative regions of state space for exploration. it is conceptual and must not be read as a clinical or diagnostic model.',
        citation:
            'stated scope; a conceptual neuroscience sandbox.',
        confidence: 'speculative',
        falsifiability:
            'matching real EEG or clinical states would require fitting the model to data, which it does not do.',
    },
];
