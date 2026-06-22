import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'halley-iteration',
        statement:
            'the method updates z by z - 2 f f\' / (2 f\'^2 - f f\'\'), using the first and second derivatives to reach third-order (cubic) convergence near a simple root, faster than Newton\'s second order.',
        citation:
            'Halley (1694); standard numerical-analysis treatment of Halley\'s method and its convergence order.',
        confidence: 'established',
        falsifiability:
            'at a repeated (multiple) root, f\' vanishes there and the cubic convergence rate degrades to linear.',
    },
    {
        id: 'polynomial-z-n-minus-1',
        statement:
            'the rendered family is p(z) = z^n - 1, whose roots are the n-th roots of unity, equally spaced on the unit circle. the calibration checks convergence to exactly these roots.',
        citation:
            'the WebGL shader computes f(z) = z^n - 1; roots of unity are a standard exact-root test case.',
        confidence: 'established',
        falsifiability:
            'a converged value with modulus far from 1, or off the n-fold symmetric positions, would mean the iteration is not solving this polynomial.',
    },
    {
        id: 'generalized-constant',
        statement:
            'the "constant" control weights the second-derivative term. at weight 1 the iteration is standard Halley; at weight 0 it reduces exactly to Newton\'s method; other values are non-standard variants with no general convergence guarantee.',
        citation:
            'derivation: with the f f\'\' term removed the update becomes z - f/f\', which is Newton\'s method.',
        confidence: 'contested',
        falsifiability:
            'large weights can make the iteration diverge or settle on spurious points rather than the polynomial\'s roots.',
    },
    {
        id: 'basins-of-attraction',
        statement:
            'colouring each starting point by the root it converges to partitions the plane into basins of attraction whose boundaries are fractal, the same phenomenon as Newton fractals and Julia sets in complex dynamics.',
        citation:
            'Cayley\'s problem (1879) and the theory of Newton/Halley fractals in complex dynamics.',
        confidence: 'established',
        falsifiability:
            'if basin boundaries were smooth curves rather than self-similar fractal sets, the complex-dynamics framing would be wrong.',
    },
    {
        id: 'pixel-iteration-estimate',
        statement:
            'the image is computed per pixel with a finite iteration cap and a bailout radius, so the basin boundaries are resolution-limited and iteration-limited approximations, not exact sets.',
        citation:
            'standard escape-time fractal rendering; a finite-budget approximation of an infinite limit.',
        confidence: 'established',
        falsifiability:
            'raising the iteration cap and resolution reveals further detail near boundaries, confirming the rendered edge is an approximation.',
    },
    {
        id: 'float-precision',
        statement:
            'the shader uses single-precision floating point, so very deep zooms accumulate rounding error and show artifacts rather than true fractal detail.',
        citation:
            'GPU float precision limits; a known constraint of real-time fractal shaders.',
        confidence: 'established',
        falsifiability:
            'zooming far enough produces banding and blocky artifacts that are numerical, not features of the mathematics.',
    },
];
