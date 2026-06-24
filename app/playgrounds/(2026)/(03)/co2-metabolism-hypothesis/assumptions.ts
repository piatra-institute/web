import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'vent-as-reactor',
        statement:
            'alkaline hydrothermal vents are treated as the setting where carbon fixation first occurred: H2-rich serpentinization fluid meeting CO2-laden ocean water across thin mineral barriers supplies both a reductant and a natural proton gradient, the same chemistry the acetyl-CoA (Wood-Ljungdahl) pathway uses in modern acetogens and methanogens.',
        citation:
            'Lane and Martin 2012, The origin of membrane bioenergetics (Cell); Martin and Russell 2007 on serpentinization-driven CO2 reduction.',
        confidence: 'contested',
        falsifiability:
            'a demonstration that abiotic CO2 fixation cannot run at vent pH and temperature without enzymes, or strong evidence for an alternative cradle (surface ponds, hot springs), would undercut the setting.',
    },
    {
        id: 'role-abstraction',
        statement:
            'real molecules are abstracted into just three roles: A (activated carbon intermediate), C (catalyst or cofactor) and B (boundary precursor). a proto-metabolic core is declared present when a compartment holds at least one of each and the four catalytic edges all fire.',
        citation:
            'modelling abstraction inspired by the minimal autocatalytic-set literature (Kauffman 1986; Hordijk and Steel 2004) rather than a specific reaction network.',
        confidence: 'speculative',
        falsifiability:
            'if proto-metabolism requires many more distinct species or a specific ordered assembly that three interchangeable roles cannot capture, the abstraction misrepresents the chemistry.',
    },
    {
        id: 'lambda-as-catalysis',
        statement:
            'a single parameter lambda in [0, 1] is the probability that a given molecular interaction actually catalyses its reaction; the closure of one four-edge motif then has probability lambda^4, treating the four catalytic events as independent.',
        citation:
            'simplifying assumption; one independent Bernoulli factor per catalytic edge.',
        confidence: 'speculative',
        falsifiability:
            'catalytic edges in a real network are correlated (shared cofactors, autocatalytic feedback), so independence overstates how cleanly probability factorises; a measured network with strong edge correlations would break the lambda^4 form.',
    },
    {
        id: 'closed-form-mu',
        statement:
            'the expected number of proto-cores across the vent scales as mu = p_A p_C p_B (N^3 / q^2) lambda^4. this follows exactly from independent role assignment and independent compartment placement, and is what the calibration panel checks against the simulator core.',
        citation:
            'combinatorial derivation in this work; verified case-by-case against the heuristicMu function.',
        confidence: 'established',
        falsifiability:
            'the law is exact for the stated independence assumptions; it fails only if those assumptions fail (correlated placement, depletion of molecules as motifs form, finite-size saturation at small q).',
    },
    {
        id: 'threshold-scaling',
        statement:
            'because mu is cubic in N and quartic in lambda, the molecule count N* at which proto-cores become probable scales as N* ~ lambda^(-4/3). higher catalytic density sharply lowers the molecular threshold for emergence.',
        citation:
            'analytic consequence of mu(N*) = const; the simulator recovers the same exponent by log-log fitting estimated thresholds.',
        confidence: 'established',
        falsifiability:
            'an empirical threshold that scaled with a markedly different exponent would indicate the underlying counting law is wrong, not merely noisy.',
    },
    {
        id: 'no-chemistry',
        statement:
            'this is a counting and threshold model, not a chemical one. it contains no stoichiometry, no Gibbs free energies, no rate constants and no equilibrium constants; it asks only how the probability of a minimal proto-core depends on molecule count, catalytic density and compartmentation.',
        citation:
            'explicit scope statement; the live simulation is a single Monte-Carlo ensemble, not a kinetic integrator.',
        confidence: 'established',
        falsifiability:
            'any claim about reaction yields, energetics or timescales is outside what this model can support; only the qualitative sharpness of the possible-to-likely transition is in scope.',
    },
];
