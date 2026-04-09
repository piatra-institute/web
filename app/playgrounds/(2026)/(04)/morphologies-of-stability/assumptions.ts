import { Assumption } from '@/components/AssumptionPanel';

export const assumptions: Assumption[] = [
    {
        id: 'lyapunov-stability',
        statement: 'A system is stable if a Lyapunov function exists that decreases along trajectories, guaranteeing convergence to an attractor.',
        citation: 'Lyapunov, 1892 — The General Problem of the Stability of Motion; Strogatz, 2015 — Nonlinear Dynamics and Chaos, Ch. 7',
        confidence: 'established',
        falsifiability: 'Finding a system that converges to an attractor without any decreasing energy-like function would challenge the universality of Lyapunov theory (though not its validity).',
    },
    {
        id: 'linear-restoring',
        statement: 'The point attractor uses a linear restoring force dx/dt = -k(x - x*). Real attractors may have nonlinear restoring dynamics.',
        citation: 'Strogatz, 2015 — Nonlinear Dynamics and Chaos, Ch. 2; linearization is valid near fixed points by Hartman-Grobman theorem',
        confidence: 'established',
        falsifiability: 'If the system operates far from the fixed point, nonlinear terms dominate and the linear model underestimates recovery time or misses qualitative behavior.',
    },
    {
        id: 'double-well-kramers',
        statement: 'Noise-driven transitions between bistable wells follow Kramers escape theory: rate ∝ exp(-2ΔV/σ²).',
        citation: 'Kramers, 1940 — Brownian motion in a field of force; Hänggi et al., 1990 — Reaction-rate theory: fifty years after Kramers',
        confidence: 'established',
        falsifiability: 'Kramers theory assumes thermal equilibrium and Markovian noise. Colored noise, non-equilibrium driving, or quantum tunneling would produce different escape statistics.',
    },
    {
        id: 'hopf-normal-form',
        statement: 'The limit cycle uses the normal form of a supercritical Hopf bifurcation. Real oscillatory systems may have additional higher-order terms.',
        citation: 'Hopf, 1942 — Bifurcation of a periodic solution; Kuznetsov, 2004 — Elements of Applied Bifurcation Theory, Ch. 3',
        confidence: 'established',
        falsifiability: 'If the bifurcation is subcritical (hysteretic), the normal form predicts wrong behavior near the transition. Observable as hard oscillation onset rather than gradual growth.',
    },
    {
        id: 'degroot-consensus',
        statement: 'The consensus model follows DeGroot dynamics: agents update toward the group mean with coupling strength c.',
        citation: 'DeGroot, 1974 — Reaching a Consensus; Olfati-Saber & Murray, 2004 — Consensus Problems in Networks',
        confidence: 'established',
        falsifiability: 'Real opinion dynamics involve bounded confidence (Hegselmann-Krause), contrarianism, network topology, and non-mean-field interactions. The all-to-all coupling is a simplification.',
    },
    {
        id: 'noise-as-gaussian',
        statement: 'Noise is modeled as additive Gaussian white noise scaled by a single intensity parameter.',
        citation: 'van Kampen, 2007 — Stochastic Processes in Physics and Chemistry, Ch. 1',
        confidence: 'contested',
        falsifiability: 'Many real systems exhibit multiplicative noise (state-dependent intensity), Lévy flights (heavy tails), or colored noise (temporal correlations). Qualitative dynamics can differ.',
    },
    {
        id: 'floquet-radial',
        statement: 'The limit cycle Lyapunov exponent is approximated as -2μ (the Floquet exponent for radial perturbations in Hopf normal form).',
        citation: 'Guckenheimer & Holmes, 1983 — Nonlinear Oscillations, Dynamical Systems, and Bifurcations of Vector Fields, Ch. 3',
        confidence: 'established',
        falsifiability: 'This holds exactly for the normal form. For systems with higher-order terms, the actual Floquet multiplier may differ, especially near the bifurcation point.',
    },
    {
        id: 'stability-index-heuristic',
        statement: 'The stability index (ratio of restoring strength to effective disturbance) is a heuristic, not a rigorous measure of basin stability.',
        citation: 'Menck et al., 2013 — How basin stability complements the linear-stability paradigm; concept adapted for pedagogical purposes',
        confidence: 'speculative',
        falsifiability: 'Rigorous basin stability requires Monte Carlo sampling of initial conditions. The heuristic ratio may disagree with actual basin volume, especially in nonlinear regimes.',
    },
];
