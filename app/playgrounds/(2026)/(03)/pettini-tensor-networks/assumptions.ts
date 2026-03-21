import { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'tensor-compression',
        statement: 'High-dimensional biological state spaces admit low-rank tensor compression when correlations have bounded range.',
        citation: 'Verstraete & Cirac, 2006; Orús, 2014 — area-law entanglement implies efficient MPS representation',
        confidence: 'established',
        falsifiability: 'A biologically relevant search process whose mutual information between distant sites grows faster than logarithmically with separation.',
    },
    {
        id: 'facilitated-diffusion',
        statement: 'DNA-protein target search involves facilitated diffusion: alternating 3D excursions in solvent with 1D sliding along the DNA contour.',
        citation: 'Berg, Winter & von Hippel, 1981; Halford & Marko, 2004 — experimental measurement of lac repressor search kinetics',
        confidence: 'established',
        falsifiability: 'Single-molecule tracking showing that proteins reach targets without any 1D sliding phase.',
    },
    {
        id: 'short-range-recognition',
        statement: 'Final target recognition is driven by short-range chemical complementarity (hydrogen bonds, van der Waals, electrostatics at contact distance).',
        citation: 'Rohs et al., 2010 — structural basis of DNA readout',
        confidence: 'established',
        falsifiability: 'A protein-DNA complex whose binding affinity is insensitive to contact-distance chemical modifications.',
    },
    {
        id: 'tensor-factorization',
        statement: 'The joint probability distribution over protein state and all DNA site states approximately factorizes into a tensor-train (MPS) form with finite bond dimension.',
        citation: 'Computational assumption — analogous to DMRG success in 1D quantum chains (White, 1992)',
        confidence: 'contested',
        falsifiability: 'Numerical demonstration that the bond dimension required to represent the search distribution grows polynomially or faster with system size.',
    },
    {
        id: 'long-range-ed',
        statement: 'Long-range electrodynamic (dipolar) interactions between biomolecules can bias encounter rates beyond what diffusion alone predicts.',
        citation: 'Pettini et al., 2022 — experimental evidence for long-distance electrodynamic intermolecular forces (in vitro)',
        confidence: 'contested',
        falsifiability: 'Repeating the Pettini experiments with rigorous controls for convection, depletion forces, and dielectrophoresis and finding no residual long-range effect.',
    },
    {
        id: 'resonance-selectivity',
        statement: 'Frequency matching between protein collective modes and DNA site vibrational modes enables selective long-range recruitment toward cognate targets.',
        citation: 'Hypothesized mechanism inspired by Fröhlich, 1968 and Pettini group theoretical models',
        confidence: 'speculative',
        falsifiability: 'Measuring the vibrational spectra of cognate vs. non-cognate protein-DNA pairs and finding no systematic frequency correlation.',
    },
    {
        id: 'cellular-vibrational-modes',
        statement: 'Collective vibrational modes of sufficient coherence and lifetime can be sustained inside living cells despite crowding, ionic screening, and thermal noise.',
        citation: 'Lundholm et al., 2015 — terahertz spectroscopy of protein crystals; extrapolation to cellular conditions is uncertain',
        confidence: 'speculative',
        falsifiability: 'In-cell terahertz or neutron scattering measurements showing that collective mode lifetimes are orders of magnitude shorter than the timescale needed for recruitment.',
    },
    {
        id: 'linear-dna-lattice',
        statement: 'DNA is modeled as a linear 1D lattice of discrete sites with uniform spacing. Supercoiling, looping, and 3D genome organization are neglected.',
        citation: 'Standard simplification in facilitated diffusion models — Berg & von Hippel, 1985; Mirny et al., 2009',
        confidence: 'established',
        falsifiability: 'Demonstration that 3D chromatin contacts dominate target-finding kinetics over 1D sliding for the protein class being modeled.',
    },
    {
        id: 'steady-state-distribution',
        statement: 'The search process reaches a steady-state probability distribution before target binding occurs. Transient dynamics are not captured.',
        citation: 'Standard assumption in facilitated diffusion theory — Halford & Marko, 2004; Kolomeisky, 2011',
        confidence: 'established',
        falsifiability: 'Single-molecule experiments showing that target-finding kinetics are dominated by early transient search phases that never reach steady state.',
    },
    {
        id: 'binary-recognition',
        statement: 'Target recognition is binary: the protein either binds specifically or continues searching. Multi-step recognition, partial binding, and conformational proofreading are not modeled.',
        citation: 'Simplification of the multi-step recognition process described in Savir & Tlusty, 2007',
        confidence: 'established',
        falsifiability: 'Evidence that intermediate recognition states (partial binding, conformational testing) dominate the overall search time budget.',
    },
];
