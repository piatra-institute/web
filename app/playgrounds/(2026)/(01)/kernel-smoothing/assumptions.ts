import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'kernel-is-density',
        statement:
            'a kernel K is a symmetric, non-negative weighting function that integrates to 1. the Gaussian density and the Epanechnikov kernel used here both satisfy this; the playground also exposes an unnormalized Gaussian similarity weight, exp(-(xq - xi)^2 / 2h^2), whose peak is 1 rather than 1 / sqrt(2 pi).',
        citation:
            'Silverman 1986, Density Estimation; Wand and Jones 1995, Kernel Smoothing. the normalization and symmetry conditions are definitional.',
        confidence: 'established',
        falsifiability:
            'a weighting function that integrates to a value other than 1, or that is not even, is not a kernel in this sense; the calibration panel checks both conditions numerically.',
    },
    {
        id: 'nadaraya-watson-constants',
        statement:
            'the Nadaraya-Watson estimator is a locally weighted average: yHat(xq) = sum_i alpha_i y_i with alpha_i = K(xq, xi) / sum_j K(xq, xj). because the weights sum to 1, smoothing a constant signal returns that constant exactly at every query, independent of bandwidth.',
        citation:
            'Nadaraya 1964; Watson 1964. the partition-of-unity property of normalized weights is exact.',
        confidence: 'established',
        falsifiability:
            'if a constant target were not reproduced, the weights would not sum to 1; the calibration panel verifies reproduction of a flat signal to machine precision.',
    },
    {
        id: 'bandwidth-tradeoff',
        statement:
            'bandwidth h sets the bias-variance tradeoff. a small h tracks the data closely (low bias, high variance, undersmoothing); a large h averages over many points (high bias, low variance, oversmoothing). the optimal h scales roughly as n to the power -1/5 for a fixed kernel.',
        citation:
            'Wand and Jones 1995; Hastie, Tibshirani and Friedman 2009 (The Elements of Statistical Learning). the rate follows from minimizing asymptotic mean integrated squared error.',
        confidence: 'established',
        falsifiability:
            'plug-in or cross-validated bandwidth selectors recover the n^(-1/5) rate on smooth densities; data with discontinuities or heavy tails can violate the asymptotic assumptions and shift the optimum.',
    },
    {
        id: 'kernel-choice-second-order',
        statement:
            'the choice of kernel shape (Gaussian, Epanechnikov, triangular, uniform) matters far less than the bandwidth. the Epanechnikov kernel is asymptotically optimal in mean integrated squared error, but its efficiency advantage over the Gaussian is only a few percent.',
        citation:
            'Epanechnikov 1969; Wand and Jones 1995. relative kernel efficiencies are tabulated and cluster near 1.',
        confidence: 'established',
        falsifiability:
            'if swapping a Gaussian for an Epanechnikov kernel at matched bandwidth changed estimates drastically, the second-order claim would fail; in practice the curves nearly coincide.',
    },
    {
        id: 'attention-as-kernel',
        statement:
            'scaled dot-product attention is a Nadaraya-Watson smoother with a learned, data-dependent kernel: softmax(q . k_i / sqrt(d_k)) are normalized weights over values v_i. the query maps to xq, keys to sample locations, values to responses, and temperature sqrt(d_k) to bandwidth.',
        citation:
            'Vaswani et al. 2017 (Attention Is All You Need); Tsai et al. 2019 reframe attention through the kernel lens. the correspondence is structural, not a derivation that attention must be a kernel.',
        confidence: 'contested',
        falsifiability:
            'the softmax-dot weight is not a symmetric translation-invariant kernel and need not integrate to a fixed mass over key space; calling it a kernel is an analogy that breaks where learned projections make the geometry non-stationary.',
    },
    {
        id: 'boundary-and-sparsity',
        statement:
            'kernel smoothing is biased near the boundary of the data and degrades where samples are sparse or unevenly spaced, because the local average is taken over an asymmetric or near-empty neighbourhood. the toy uses a handful of 1D points and does not correct for this.',
        citation:
            'Fan and Gijbels 1996 (Local Polynomial Modelling) show local-constant fits carry boundary bias that local-linear fits reduce.',
        confidence: 'contested',
        falsifiability:
            'moving the query past the outermost data point makes the estimate flat toward the nearest value; a local-linear estimator would extrapolate the trend instead, exposing the boundary bias directly.',
    },
];
