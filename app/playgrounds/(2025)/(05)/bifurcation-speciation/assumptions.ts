import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'birdsym-model',
        statement:
            'birds are points on a one-dimensional trait axis (e.g. beak size) that move under resource availability and competition, following Ian Stewart\'s BirdSym treatment of sympatric speciation as a symmetry-breaking bifurcation.',
        citation:
            'Stewart, Elmhirst and Cohen, "Bifurcation, Symmetry and Patterns" (2000); the BirdSym model of speciation.',
        confidence: 'contested',
        falsifiability:
            'real speciation involves genetics, mate choice, and geography this one-dimensional trait-dynamics model omits.',
    },
    {
        id: 'gaussian-kernels',
        statement:
            'resource availability and feeding efficiency are Gaussian functions of trait distance: a bird feeds best on seeds matching its trait, and resources are richest near a mean seed size. these are exact and checked by the calibration.',
        citation:
            'Gaussian resource and feeding kernels as defined in the model.',
        confidence: 'established',
        falsifiability:
            'the calibration verifies the kernel peak heights, symmetry, and one-sigma falloff; a deviation would be an implementation error.',
    },
    {
        id: 'symmetry-breaking',
        statement:
            'below a critical value of the bifurcation parameter a single cluster of birds is stable; above it the symmetric state loses stability and the population splits into two trait clusters. this pitchfork bifurcation is the model\'s picture of speciation.',
        citation:
            'equivariant bifurcation theory; speciation as spontaneous symmetry breaking.',
        confidence: 'contested',
        falsifiability:
            'if the split point depended on the random seed rather than the bifurcation parameter, the bifurcation interpretation would be wrong.',
    },
    {
        id: 'deterministic-dynamics-stochastic-init',
        statement:
            'the update rule is deterministic (Euler steps on the trait ODE), but initial positions carry a small random perturbation, so individual runs differ slightly while the qualitative bifurcation is robust.',
        citation:
            'use of Math.random only for initial positions; deterministic iteration thereafter.',
        confidence: 'established',
        falsifiability:
            'this is why the calibration targets the deterministic kernels, not a specific trajectory.',
    },
    {
        id: 'euler-integration',
        statement:
            'positions are advanced by a fixed-step Euler integrator and clamped to [0,1]. step size and clamping affect the detailed trajectory, though not the existence of the bifurcation.',
        citation:
            'forward-Euler integration with boundary clamping.',
        confidence: 'contested',
        falsifiability:
            'too large a time step can produce numerical artifacts that are not features of the underlying ODE.',
    },
    {
        id: 'illustrative-not-empirical',
        statement:
            'parameters are illustrative; the model demonstrates the mechanism of competition-driven trait splitting, not the speciation history of any real population.',
        citation:
            'stylized model scope.',
        confidence: 'speculative',
        falsifiability:
            'fitting to a real adaptive-radiation dataset would test whether the mechanism quantitatively matches nature.',
    },
];
