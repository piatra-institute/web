import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'separable-cosine-modes',
        statement:
            'the plate modes are taken to be separable products of cosines, S(x,y) = cos(m pi x) cos(n pi y) +/- cos(n pi x) cos(m pi y). this is the textbook closed form for a square plate with free edges, where the symmetrized and antisymmetrized products are degenerate and combine.',
        citation:
            'Chladni (1787) Entdeckungen ueber die Theorie des Klanges; Rayleigh, Theory of Sound, on combination of degenerate plate modes.',
        confidence: 'established',
        falsifiability:
            'a measured plate whose nodal lines cannot be matched by any sum of these cosine products, even after fitting m, n, and the sign, would break the separable-mode assumption.',
    },
    {
        id: 'ideal-plate',
        statement:
            'the plate is treated as ideal: uniform thickness, homogeneous isotropic material, no internal damping, and perfectly free edges. real plates have varied thickness, anisotropy, clamping, and loss that shift and distort the modes.',
        citation:
            'Kirchhoff-Love thin-plate theory; the free-edge boundary condition is an idealization rarely met exactly in a clamped or supported plate.',
        confidence: 'contested',
        falsifiability:
            'introduce known thickness variation or a clamped edge and the observed nodal pattern departs from the ideal cosine form; the magnitude of the shift falsifies the idealization for that plate.',
    },
    {
        id: 'linear-superposition',
        statement:
            'the second mode is added by linear superposition, amp = |a1 * mode1 + a2 * mode2|, assuming the plate responds linearly so independent modes simply add. driving amplitudes are kept small enough that this holds.',
        citation:
            'linear theory of vibrations: eigenmodes of a linear operator superpose; valid in the small-deflection regime.',
        confidence: 'established',
        falsifiability:
            'at large driving amplitude plates show nonlinear mode coupling and hysteresis; nodal patterns that depend on drive history rather than on the linear sum would falsify superposition.',
    },
    {
        id: 'nodal-lines-from-amplitude',
        statement:
            'nodal lines are identified as the locus where the time-independent amplitude envelope is below a small threshold (|S| < nodeThreshold), rather than exactly zero. the threshold approximates the finite width of a real nodal band.',
        citation:
            'standing-wave theory: nodes are the zero set of the modal shape; the band is a rendering and physical-width approximation.',
        confidence: 'established',
        falsifiability:
            'shrinking the threshold toward zero should collapse the bands onto curves of measure zero; if the pattern instead fragments or disappears, the band model is mis-specified.',
    },
    {
        id: 'sand-as-gradient-descent',
        statement:
            'sand migration is modelled as gradient descent of mass from high-amplitude to lower-amplitude neighbors plus local diffusion, with total mass conserved. this captures the qualitative drift of grains toward nodes but is not derived from the true acceleration-driven particle dynamics.',
        citation:
            'phenomenological transport; the real mechanism (Faraday, 1831) involves vertical acceleration tossing grains away from antinodes, with air streaming effects for very fine powder.',
        confidence: 'speculative',
        falsifiability:
            'very fine powder (lycopodium) collects at antinodes, not nodes, the opposite of this descent rule; that regime is outside what the gradient model predicts.',
    },
    {
        id: 'non-square-shapes-approximate',
        statement:
            'circle, rectangle, and ring geometries reuse the square cosine field clipped by a boundary mask. this is an approximation: a true circular plate has Bessel-function radial modes and a different nodal spectrum, not masked square modes.',
        citation:
            'circular plate vibration uses Bessel functions J_k(kr); the masking here is a visual stand-in, not the correct eigenproblem for those shapes.',
        confidence: 'contested',
        falsifiability:
            'a real circular plate shows concentric and radial Bessel nodal circles that the masked square field cannot reproduce; comparing the two falsifies the masking shortcut for non-square plates.',
    },
];
