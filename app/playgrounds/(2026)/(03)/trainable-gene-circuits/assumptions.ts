import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'grn-as-ode',
        statement:
            'a gene regulatory network is modelled as three coupled production-degradation ODEs, dx_i/dt = basal_i + beta_i * regulation_i(x, u) - decay_i * x_i, with saturating Hill terms for every regulatory edge. cell behaviour is read off the resulting trajectories and attractors.',
        citation:
            'standard chemical-rate-law GRN modelling; Alon, An Introduction to Systems Biology; the Levin-lab framing treats GRNs as continuous nonlinear dynamical systems on expression space.',
        confidence: 'established',
        falsifiability:
            'a regulatory behaviour that depends on discrete molecule counts, spatial diffusion, or transcriptional bursting cannot be captured by these three mean-field ODEs; such a case would break the deterministic continuum picture.',
    },
    {
        id: 'hill-regulation',
        statement:
            'activation and repression are saturating Hill functions sharing a single coefficient n and per-gene thresholds K. higher n gives a sharper, more switch-like response, and at x = K each curve passes through one half of its range.',
        citation:
            'Hill 1910; the half-maximal landmark and the n-dependent sharpness are textbook properties verified in the calibration panel.',
        confidence: 'established',
        falsifiability:
            'measured dose-response curves with non-monotone or non-sigmoidal shape, or cooperativity that changes with concentration, would not fit a fixed-n Hill term.',
    },
    {
        id: 'memory-is-slow-variable',
        statement:
            'in the associative preset, learning is not parameter learning. gene C is a slow state variable whose decay is low, so paired stimulation during training leaves an elevated residual that lets a later weak probe drive the output. this is history-dependent state change, not weight update.',
        citation:
            'Fernando et al. 2009; Biswas, Manicka, Levin 2023 on pathway-level memory; Levin frames GRN learning as basin switching and slow-variable hysteresis rather than gradient descent.',
        confidence: 'contested',
        falsifiability:
            'if the trained and untrained probe responses were equal the conditioning claim would fail; the calibration shows a trained-to-untrained ratio above one, so the trace exists in this regime but is parameter-dependent.',
    },
    {
        id: 'toggle-bistability',
        statement:
            'the toggle preset relies on mutual repression plus self-activation to create two stable attractors. a transient pulse commits the system to one basin, where it stays after the stimulus is removed. memory equals which basin is occupied.',
        citation:
            'Gardner, Cantor, Collins 2000, the genetic toggle switch; lambda phage lysis-lysogeny as the canonical bistable GRN.',
        confidence: 'established',
        falsifiability:
            'if the final separation between the two genes collapsed toward zero the switch would be monostable; the calibration measures a large separation, but weak or brief pulses can leave the toggle uncommitted.',
    },
    {
        id: 'oscillatory-memory',
        statement:
            'the repressilator preset stores state in a sustained oscillation rather than a fixed point, so memory lives in phase and amplitude. a three-gene repression loop with sufficient gain and sharpness sustains a limit cycle.',
        citation:
            'Elowitz and Leibler 2000, the synthetic repressilator; oscillatory attractors as a distinct memory mode from point attractors.',
        confidence: 'contested',
        falsifiability:
            'too little loop gain or too small a Hill coefficient damps the oscillation to a fixed point; the regime is real but narrow, and the deterministic toy omits the molecular noise that perturbs real oscillator phase.',
    },
    {
        id: 'learning-metaphor-not-mechanism',
        statement:
            'the word learning is used in the dynamical-systems sense throughout. the network never rewires its topology or descends a loss; conditioning, commitment, and oscillation all arise from the dynamics of fixed equations under timed stimulation.',
        citation:
            'Levin-lab papers explicitly contrast trainable GRN behaviour with topology rewiring or machine-learning weight updates; the analogy to synaptic plasticity is interpretive.',
        confidence: 'speculative',
        falsifiability:
            'reading the slow variable as a literal synaptic weight predicts properties (additive accumulation, generalisation across cues) the three-node ODE does not have; the playground demonstrates the metaphor, it does not establish cognition.',
    },
];
