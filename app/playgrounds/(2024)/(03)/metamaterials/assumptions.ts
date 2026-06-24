import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'spring-network',
        statement:
            'the metamaterial is modelled as a 2D mass-spring network: nodes are point masses and connections are linear (Hookean) springs with restoring coefficient k (L - R) / L. the engineered microstructure is reduced to a graph of springs at the unit-cell spacing.',
        citation:
            'standard discrete elastic-network model; Bertoldi et al. 2017, Flexible mechanical metamaterials (Nature Reviews Materials), reviews lattice-based mechanical metamaterials.',
        confidence: 'established',
        falsifiability:
            'real lattices bend, buckle, and store rotational energy at hinges that a central-force spring graph omits; a behaviour driven by beam bending or contact would not be captured.',
    },
    {
        id: 'auxetic-stiffening',
        statement:
            'auxetic (negative Poisson ratio) behaviour is encoded as a strain-dependent stiffening, k_eff = k (1 + |nu| * |strain|), so that an auxetic lattice resists indentation more as it deforms. ordinary materials (nu >= 0) keep constant stiffness.',
        citation:
            'Lakes 1987 (Science) first reported foams with negative Poisson ratio; enhanced indentation resistance is a textbook auxetic signature.',
        confidence: 'contested',
        falsifiability:
            'true auxeticity arises from re-entrant or rotating-unit geometry, not from a scalar stiffness multiplier; a lattice whose lateral expansion does not track this law would falsify the shortcut.',
    },
    {
        id: 'negative-poisson-lateral',
        statement:
            'the Poisson relation epsilon_lateral = -nu * epsilon_axial is taken to hold, so a negative nu means tensile stretching produces sideways expansion rather than necking. this is the defining property the auxetic lattice type is meant to display.',
        citation:
            'linear elasticity; Evans and Alderson 2000 (Advanced Materials), Auxetic materials: functional materials and structures from lateral thinking.',
        confidence: 'established',
        falsifiability:
            'Poisson ratio is strictly defined only in the small-strain linear regime; at large deformation the linear relation breaks and nu becomes strain-dependent.',
    },
    {
        id: 'life-like-as-rules',
        statement:
            'the "life-like" behaviours (self-assembly, adaptation, self-healing, memory) are hand-written update rules layered on the spring dynamics, not emergent consequences of the microstructure. they are illustrative analogies for active and programmable metamaterials.',
        citation:
            'active and shape-programmable metamaterials, so any genuine self-organisation requires embedded actuation or instability; Coulais et al. 2016 (Nature) on combinatorial mechanical design.',
        confidence: 'speculative',
        falsifiability:
            'a passive elastic lattice does not heal or remember on its own; switching the toggles off removes the behaviour, showing it is imposed rather than intrinsic.',
    },
    {
        id: 'overdamped-explicit',
        statement:
            'the dynamics use explicit forward integration with a velocity-damping factor (1 - damping) and a small time step. this is a stability device, not a calibrated material model; numbers report relative trends, not physical units.',
        citation:
            'standard semi-implicit Euler with linear damping; a modelling choice for an interactive canvas.',
        confidence: 'established',
        falsifiability:
            'large stiffness or step size makes explicit integration blow up; the boundary clamp hides this, so absolute energy values should not be read as physical.',
    },
    {
        id: 'random-microstructure',
        statement:
            'connectivity and fixed (boundary) nodes are sampled randomly each time the lattice is built, so each run is one stochastic realisation of a disordered network rather than a fixed periodic crystal.',
        citation:
            'modelling choice; disordered spring networks are a recognised route to tunable mechanical response (e.g. allosteric and topological metamaterials).',
        confidence: 'contested',
        falsifiability:
            'engineered metamaterials are usually periodic and deterministic; the randomised graph here trades reproducibility for visual variety and is calibrated only in its noise-free spring limit.',
    },
];
