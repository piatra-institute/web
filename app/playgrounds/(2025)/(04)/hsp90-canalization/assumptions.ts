import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'hsp90-as-capacitor',
        statement:
            'Hsp90 acts as an evolutionary capacitor: under normal conditions it buffers the phenotypic effect of cryptic genetic variation, and when its function is compromised that variation becomes visible. the playground encodes this as a buffering factor that shrinks each phenotype back toward the canalized optimum.',
        citation:
            'Rutherford & Lindquist 1998, Hsp90 as a capacitor for morphological evolution (Nature); Queitsch, Sangster & Lindquist 2002 (Hsp90 and phenotypic variation in Arabidopsis).',
        confidence: 'established',
        falsifiability:
            'if reducing Hsp90 function did not increase phenotypic variance across genotypes, the capacitor interpretation would fail. some later work argues the released variation is partly Hsp90-specific rather than generic cryptic load.',
    },
    {
        id: 'phenotype-as-vector',
        statement:
            'a phenotype is represented as a point in a three-dimensional trait space and its deviation from the optimum is summarized by the radius r. variance is read off as the mean squared radius. this collapses real multivariate, developmentally structured phenotypes into an isotropic distance.',
        citation:
            'standard quantitative-genetics abstraction: phenotype as a point in trait space with a fitness optimum (Lande 1979; Wagner & Altenberg 1996 on genotype-phenotype maps).',
        confidence: 'contested',
        falsifiability:
            'traits with strong correlations, epistasis, or threshold characters are not well described by a single radial distance; a case where buffering is direction-specific would break the isotropic readout.',
    },
    {
        id: 'logistic-buffering',
        statement:
            'buffering is a logistic function of the deviation radius, f(r) = 1 / (1 + exp(-k (r - (1 - C)))). small deviations near the optimum are left alone and large deviations past the threshold radius (1 - C) escape buffering. the threshold and sharpness are free parameters, not measured rate constants.',
        citation:
            'modelling choice. logistic saturation is a generic way to encode a soft capacity limit; the specific form here is for legibility, not fitted to chaperone kinetics.',
        confidence: 'speculative',
        falsifiability:
            'real chaperone load is governed by client-protein stability and abundance, not a single radial threshold; measured buffering that is non-monotonic in deviation would contradict this form.',
    },
    {
        id: 'capacity-direction',
        statement:
            'the capacity parameter C sets the threshold radius (1 - C): higher C lowers the threshold so more of trait space is expressed, lower C raises the threshold so more variation is masked near the optimum. C is an abstract "how spent is the buffer" dial, not a direct readout of Hsp90 protein level.',
        citation:
            'modelling choice consistent with the qualitative direction in Rutherford & Lindquist 1998 (less effective buffering reveals more variation).',
        confidence: 'contested',
        falsifiability:
            'mapping C onto a measurable Hsp90 concentration or activity would require calibration the model does not have; the dial direction is a convention, and the opposite convention would fit the same data with relabelled axes.',
    },
    {
        id: 'anisotropic-genetics',
        statement:
            'genetic variation is anisotropic, concentrated on the first trait axis (scales 1, 0.4, 0.2), while environmental noise is isotropic. this encodes the idea that cryptic genetic variation has a structured, low-dimensional direction distinct from developmental noise.',
        citation:
            'genetic covariance structure (the G matrix) is typically low-rank and anisotropic (Blows 2007); the specific scales here are illustrative.',
        confidence: 'contested',
        falsifiability:
            'if released cryptic variation were isotropic in trait space, the anisotropy assumption would be unnecessary; the chosen scales are not estimated from data.',
    },
    {
        id: 'uniform-draws',
        statement:
            'both genetic and environmental contributions are drawn from bounded uniform distributions on each axis rather than Gaussians. the deterministic calibration integrates over exactly this uniform support, so the variance numbers are a property of a bounded box, not of a normal model.',
        citation:
            'matches the interactive Viewer, which uses uniform spread sampling; a modelling convenience that keeps the support bounded and the quadrature exact.',
        confidence: 'speculative',
        falsifiability:
            'quantitative genetics usually assumes approximately Gaussian trait distributions; switching to Gaussians would change the tail behaviour and the exact variance fractions, though not the qualitative regimes.',
    },
];
