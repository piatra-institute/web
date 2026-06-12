import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'conformally-flat-only',
        statement:
            'the whole playground works in the conformally flat sector: the metric is g = Omega^2 * eta, a single scalar conformal factor times flat space. the genuinely spin-2 part of gravity (gravitational waves, generic black holes, the Weyl tensor) is excluded.',
        citation:
            'this is exactly the caveat Turok flags: the correspondence is shown "so far, only for conformally flat metrics".',
        confidence: 'established',
        falsifiability:
            'a metric with non-vanishing Weyl tensor is by definition outside this sector. the playground simply does not model it.',
    },
    {
        id: 'curvature-formula',
        statement:
            'for the 2D slice ds^2 = Omega^2 (dx^2 + dy^2), the Gaussian curvature is K = -Omega^{-2} * Laplacian(ln Omega) and the scalar curvature is R = 2K. the heatmap computes this with a five-point finite-difference Laplacian.',
        citation:
            'standard 2D conformal geometry. validated in the calibration panel against constant-curvature sphere and Poincare-disk metrics.',
        confidence: 'established',
        falsifiability:
            'the calibration table would show large errors if the discretisation were wrong; it agrees with the analytic values to better than one percent.',
    },
    {
        id: 'two-d-toy',
        statement:
            'curvature is visualised on a 2D Euclidean slice, not in 4D Lorentzian spacetime. the 2D slice is a faithful toy for "geometry reduces to one scalar field" but is not the physical 4D problem.',
        citation:
            'modelling choice for legibility. the conformal-factor story is dimension-independent; the specific curvature formula is the 2D one.',
        confidence: 'established',
        falsifiability:
            'the 4D conformal curvature has extra terms; a 4D version would change the numbers but not the "one scalar field" reduction.',
    },
    {
        id: 'ward-game-is-schematic',
        statement:
            'the Ward identity game classifies a fixed menu of Lagrangian terms as kept, merged, or removed using simple rules: scale invariance forbids dimensionful couplings, conformal invariance forbids non-Weyl curvature couplings, diffeomorphism invariance forbids frame-fixed terms, single-coupling merges the dimensionless survivors.',
        citation:
            'a schematic of the claim that the Ward identity restricts the form of the Lagrangian in the UV. real Ward identities are constraints on correlation functions, not a checklist on terms.',
        confidence: 'contested',
        falsifiability:
            'a careful derivation would treat anomalies, operator mixing, and scheme dependence; the toy keeps only the leading "symmetry deletes terms" intuition.',
    },
    {
        id: 'phi4-beta',
        statement:
            'the running coupling uses the one-loop 4D phi-fourth beta function d(lambda)/d(ln mu) = 3 lambda^2 / (16 pi^2), with its closed-form Landau pole.',
        citation:
            'standard perturbative result. it is the textbook phi-fourth toy, not the claimed full gravity correspondence.',
        confidence: 'established',
        falsifiability:
            'higher-loop corrections shift the pole; the qualitative "coupling grows in the UV, single coupling matters" picture is robust at one loop.',
    },
    {
        id: 'perfect-square-claim',
        statement:
            'the central claim, that constrained quantum gravity equals a perfect-square scalar theory which maps to 4D phi-fourth, is a research-level conjecture, not established physics. the playground marks every edge of the correspondence triangle with its status.',
        citation:
            'Boyle and Turok, dimension-zero scalar program, arXiv:2110.06258.',
        confidence: 'speculative',
        falsifiability:
            'the conjecture would be settled by a complete derivation valid beyond conformally flat metrics, or by an explicit counterexample. neither exists yet in published, peer-reviewed form.',
    },
    {
        id: 'negative-norm-states',
        statement:
            'the dimension-zero four-derivative scalar construction has negative-norm states in canonical quantization. the program claims these are removed by an infinite-dimensional symmetry or superselection rule; the playground does not model the quantization.',
        citation:
            'Turok\'s program; standard concern for higher-derivative (Weyl-invariant) actions.',
        confidence: 'contested',
        falsifiability:
            'whether the ghost states are truly removed is one of the open technical questions of the program.',
    },
    {
        id: 'single-coupling-analogy',
        statement:
            'the "single coupling, cf. gauge theory" idea is treated as an analogy: one dimensionless coupling controlling the structure, like g_s in QCD. the playground merges couplings by fiat in single-coupling mode rather than deriving the merge.',
        citation:
            'the "single coupling cf. gauge theory" idea in Turok\'s proposal. the merge is asserted, not computed here.',
        confidence: 'speculative',
        falsifiability:
            'a real derivation would show the couplings are related by the symmetry; the toy only illustrates what such a collapse would look like.',
    },
    {
        id: 'no-matter-content',
        statement:
            'the playground ignores the Standard Model content of the broader program (the 36 conformally coupled dimension-zero scalars, three generations, composite Higgs). it isolates the geometry-to-scalar correspondence only.',
        citation:
            'Boyle and Turok cosmology and particle-content papers, arXiv:2110.06258, arXiv:2302.00344.',
        confidence: 'established',
        falsifiability:
            'those claims are separate and are neither tested nor assumed here.',
    },
];
