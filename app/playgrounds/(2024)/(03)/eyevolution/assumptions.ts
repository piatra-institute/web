import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'nilsson-pelger-sequence',
        statement:
            'eyes are arranged along a graded sequence (no eye, eyespot, pit, pinhole, lens) in which each step is a small improvement reachable from the last. this follows Nilsson and Pelger\'s argument that a complex eye can evolve through many slight, advantageous stages.',
        citation:
            'Nilsson and Pelger (1994), A pessimistic estimate of the time required for an eye to evolve.',
        confidence: 'established',
        falsifiability:
            'an eye type that cannot be reached by small advantageous steps from a simpler one would break the gradualist sequence.',
    },
    {
        id: 'three-trait-composite',
        statement:
            'an organism is reduced to three continuous traits, visual acuity, light sensitivity, and field of view, and its eye type is decided by their mean crossing ascending thresholds. this is a coarse stand-in for real eye morphology.',
        citation:
            'the composite-score classifier in the model.',
        confidence: 'contested',
        falsifiability:
            'real eye type depends on structure (aperture, lens, retina) not captured by a three-number average; the calibration checks the classifier, not its biological validity.',
    },
    {
        id: 'fitness-function',
        statement:
            'fitness is a per-type base value plus environmental bonuses (light, complexity, predation weighted by the matching trait) minus a metabolic cost, clamped to [0,1]. the weights and bases are modelling choices.',
        citation:
            'the calculateFitness formula in the model.',
        confidence: 'contested',
        falsifiability:
            'the calibration verifies the fitness arithmetic exactly; whether these particular weights reflect real selective pressures is not tested.',
    },
    {
        id: 'mutation-selection',
        statement:
            'evolution proceeds by mutating traits with Gaussian noise and selecting higher-fitness offspring. the population dynamics are stochastic, so each run differs.',
        citation:
            'a standard mutation-selection genetic algorithm.',
        confidence: 'established',
        falsifiability:
            'this is why the calibration targets the deterministic fitness and classification functions, not a specific evolutionary trajectory.',
    },
    {
        id: 'convergent-evolution',
        statement:
            'separate lineages can independently arrive at the same eye type, a nod to the real convergent evolution of eyes (e.g. camera eyes in vertebrates and cephalopods). the model flags such convergence events.',
        citation:
            'convergent evolution of eyes across phyla.',
        confidence: 'contested',
        falsifiability:
            'convergence here is a consequence of the shared fitness landscape; real convergence has more contingent causes the model omits.',
    },
    {
        id: 'illustrative-not-phylogenetic',
        statement:
            'parameters and thresholds are illustrative. the model demonstrates the logic of graded, selection-driven eye improvement, not the actual phylogeny or timing of any lineage.',
        citation:
            'stated scope; an evo-devo sandbox.',
        confidence: 'speculative',
        falsifiability:
            'real timing and order would require fitting to comparative and fossil data the model does not use.',
    },
];
