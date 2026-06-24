import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'newtonian-core',
        statement:
            'the classical side is exact Newtonian mechanics on an inclined plane: a = g sin(theta) minus mu g cos(theta), integrated frame by frame with explicit Euler and a quadratic air-drag term. position and velocity form a complete instantaneous state.',
        citation:
            'Newton, Principia (1687); standard rigid-body mechanics on an inclined plane with Coulomb friction.',
        confidence: 'established',
        falsifiability:
            'if the reported acceleration at rest ever departed from g sin(theta) minus mu g cos(theta), or the clamp failed to hold a block when tan(theta) is below mu, the implementation would be wrong; the calibration panel checks both.',
    },
    {
        id: 'euler-integration',
        statement:
            'the trajectory uses fixed-form explicit Euler with a capped timestep. this is a faithful but first-order integrator, so the path is the qualitatively correct solution of the differential equation rather than a high-accuracy one.',
        citation:
            'Euler method; the timestep is clamped to 0.05 s per frame to keep the integration stable.',
        confidence: 'established',
        falsifiability:
            'shrinking the timestep should converge the trajectory; if the qualitative behaviour changed under refinement, the integrator would be unreliable in that regime.',
    },
    {
        id: 's3-partition-function',
        statement:
            'the TQFT readout Z(S^3) = sqrt(2/(k+2)) sin(pi/(k+2)) is the exact SU(2) level-k Chern-Simons partition function on the three-sphere, not an approximation.',
        citation:
            'Witten 1989, Quantum field theory and the Jones polynomial; Reshetikhin-Turaev invariants.',
        confidence: 'established',
        falsifiability:
            'this is a closed-form identity; any deviation in the computed value at a given level is a coding error, checked at k = 1 in the calibration panel.',
    },
    {
        id: 'braiding-unitary',
        statement:
            'braiding is represented by a pure phase exp(2 pi i h times braids), so the amplitude of the unknotted two-strand state always has unit modulus. only the phase, set by the conformal weight h = j(j+1)/(k+2), carries information.',
        citation:
            'unitarity of the modular representation of the braid group in a rational TQFT.',
        confidence: 'established',
        falsifiability:
            'a modulus other than 1 for the trivial two-strand braid would violate unitarity; the calibration panel verifies |Z| = 1 across levels and crossing counts.',
    },
    {
        id: 'spin-from-mass',
        statement:
            'the playground identifies classical mass with TQFT spin via j = mass / 2, so the heavier block carries a higher spin representation. this is a chosen dictionary entry for legibility, not a physical equivalence.',
        citation:
            'modelling choice connecting the two panels; spin-j primaries label the anyon type in SU(2)_k.',
        confidence: 'speculative',
        falsifiability:
            'there is no physical law equating gravitational mass with SU(2) spin; the mapping is a pedagogical device and any quantitative reading across the two panels is not meaningful.',
    },
    {
        id: 'simulation-braid-coupling',
        statement:
            'while the block slides, the playground adds floor(position / 5) crossings to the braid count, letting the classical trajectory drive the topological picture. this coupling is illustrative and has no derivation from either theory.',
        citation:
            'a presentational link between the two panels so the visualisation animates together.',
        confidence: 'speculative',
        falsifiability:
            'the crossing count is an arbitrary function of position; nothing in mechanics or Chern-Simons theory implies that a sliding block braids worldlines, so this should not be read as a physical prediction.',
    },
    {
        id: 'analogy-not-identity',
        statement:
            'the central claim is an analogy, not an identity: the classical action principle (a path that extremises an action) and the TQFT bordism principle (an invariant assigned to a cobordism) are two ways of turning a process into a number, but they live in different mathematical categories.',
        citation:
            'Atiyah 1988, Topological quantum field theories; Baez and Dolan on the cobordism hypothesis; Freed lectures on extended TQFT.',
        confidence: 'contested',
        falsifiability:
            'treating the dimensionless TQFT amplitude as if it had mechanical units, or vice versa, would be a category error; the panels deliberately report incommensurable quantities.',
    },
    {
        id: 'toy-not-quantization',
        statement:
            'this is a toy model. it does not quantise the classical system, does not compute a path integral, and does not derive the TQFT from the mechanics. it places a faithful mechanics simulation beside a faithful set of closed-form TQFT invariants for comparison.',
        citation:
            'modelling scope; the heavy machinery of geometric quantisation and the path integral is intentionally omitted.',
        confidence: 'established',
        falsifiability:
            'any expectation that the TQFT amplitude is the quantum amplitude of this particular sliding block would be unfounded; the two computations are independent.',
    },
];
