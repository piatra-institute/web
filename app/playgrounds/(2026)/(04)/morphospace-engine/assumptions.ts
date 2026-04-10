import type { Assumption } from '@/components/AssumptionPanel';

export const assumptions: Assumption[] = [
    {
        id: 'morphospace-platonic',
        statement: 'Biological morphology can be usefully modeled as navigation through a pre-existing space of possible forms (a morphospace), rather than arising solely from bottom-up molecular interactions.',
        citation: 'Levin 2019 \u2014 The computational boundary of a "self": developmental bioelectricity drives multicellularity and scale-free cognition; Raup 1966 \u2014 Geometric analysis of shell coiling',
        confidence: 'contested' as const,
        falsifiability: 'Falsified if every observed morphology can be fully predicted from local molecular rules without reference to global attractors or morphospace geometry.',
    },
    {
        id: 'constraint-causation',
        statement: 'Constraints are not merely boundary conditions but are causally efficacious \u2014 they channel and enable pattern formation as enabling conditions rather than efficient causes.',
        citation: 'Juarrero 1999 \u2014 Dynamics in Action: Intentional Behavior as a Complex System; Deacon 2011 \u2014 Incomplete Nature',
        confidence: 'contested' as const,
        falsifiability: 'Falsified if removing structural constraints from a morphogenetic system has no effect on the resulting pattern beyond what is explained by the loss of material boundary conditions.',
    },
    {
        id: 'mathematical-forcing',
        statement: 'Mathematical constants (e, \u03C0, \u03C6, Feigenbaum \u03B4) are treated as "forcing terms" whose irrational structure generates spatial patterns when projected into a field. This is a conceptual device, not a claim about physical mechanism.',
        citation: 'Strogatz 2001 \u2014 Nonlinear Dynamics and Chaos (Feigenbaum universality); Livio 2002 \u2014 The Golden Ratio',
        confidence: 'speculative' as const,
        falsifiability: 'Falsified if replacing mathematical constants with arbitrary irrational numbers produces indistinguishable morphologies (suggesting the specific constant plays no structural role).',
    },
    {
        id: 'gaussian-locality',
        statement: 'Each node\'s spatial influence decays as a Gaussian function of distance from its position, modeling the biophysical principle that morphogenetic signals attenuate with distance.',
        citation: 'Wolpert 1969 \u2014 Positional information and the spatial pattern of cellular differentiation; Turing 1952 \u2014 The chemical basis of morphogenesis',
        confidence: 'established' as const,
        falsifiability: 'Falsified if morphogenetic signals are shown to propagate without spatial attenuation in all biological systems.',
    },
    {
        id: 'graph-composition',
        statement: 'The morphology arises from additive superposition of individual node contributions, modulated by multiplicative damping from constraints. Node interactions are mediated through edge weights that boost effective strength.',
        citation: 'Kauffman 1993 \u2014 The Origins of Order: Self-Organization and Selection in Evolution (random Boolean networks as compositional systems)',
        confidence: 'speculative' as const,
        falsifiability: 'Falsified if the additive model fails to capture qualitative morphological transitions that require nonlinear coupling terms between node contributions.',
    },
    {
        id: 'attractor-memory',
        statement: 'Attractor nodes act as recursive memory sinks that stabilize nascent patterns. This models the biological concept of developmental canalization \u2014 the tendency of development to follow well-worn paths.',
        citation: 'Waddington 1957 \u2014 The Strategy of the Genes; Huang 2009 \u2014 Cell fates as high-dimensional attractor states of a complex gene regulatory network',
        confidence: 'established' as const,
        falsifiability: 'Falsified if developmental trajectories show no memory effects and are fully determined by instantaneous conditions.',
    },
    {
        id: 'coherence-metric',
        statement: 'Morphological organization is measured by spatial coherence (neighbor agreement), which serves as a proxy for biological pattern quality and developmental robustness.',
        citation: 'Kondo & Miura 2010 \u2014 Reaction-diffusion model as a framework for understanding biological pattern formation',
        confidence: 'established' as const,
        falsifiability: 'Falsified if biologically functional morphologies are shown to require low spatial coherence (high-frequency noise) as a necessary feature.',
    },
    {
        id: 'observation-coupling',
        statement: 'Observation nodes are modeled as weakly coupled probes that read but do not significantly shape the field. This idealizes the distinction between measurement and intervention in biological systems.',
        citation: 'Levin 2021 \u2014 Bioelectric signaling: Reprogrammable circuits underlying embryogenesis, regeneration, and cancer',
        confidence: 'speculative' as const,
        falsifiability: 'Falsified if all biological measurement systems (voltage reporters, fluorescent markers) are shown to significantly perturb the systems they observe.',
    },
];
