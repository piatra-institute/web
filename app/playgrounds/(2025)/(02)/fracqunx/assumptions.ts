import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'independent-bernoulli',
        statement:
            'each peg a bead meets is an independent left-or-right choice with a fixed probability p of going right, so the bin a bead lands in follows a Binomial(n, p) distribution over n rows.',
        citation:
            'Galton 1889 (the quincunx / bean machine); standard treatment of the binomial as a sum of independent Bernoulli trials.',
        confidence: 'established',
        falsifiability:
            'if a bead\'s direction at one peg depended on its path through earlier pegs, the bounces would be correlated and the bin counts would no longer be binomial.',
    },
    {
        id: 'clt-normal',
        statement:
            'as the number of rows grows, the binomial bin distribution approaches a normal (bell) curve with mean n*p and variance n*p*(1-p). this is the de Moivre-Laplace central limit theorem.',
        citation:
            'de Moivre (1733) and Laplace; the central limit theorem for sums of independent Bernoulli variables.',
        confidence: 'established',
        falsifiability:
            'with few rows, or a strong bias p far from 0.5, the histogram stays visibly skewed and discrete rather than normal.',
    },
    {
        id: 'symmetric-pegs',
        statement:
            'the clean bell curve assumes identical, unbiased pegs (p = 0.5). this board lets you move and bias pegs, so the global distribution is then a mixture, not a single Binomial(n, 0.5).',
        citation:
            'modelling choice of this playground; standard quincunx assumes a regular symmetric lattice.',
        confidence: 'contested',
        falsifiability:
            'tilting the board or editing pegs visibly shifts and distorts the histogram away from the symmetric binomial.',
    },
    {
        id: 'physics-vs-idealization',
        statement:
            'the on-screen board is an approximate physical simulation (discrete time steps, restitution, finite peg and bead radius, bead-bead collisions), not the abstract Bernoulli process. the adaptive "stress" pegs add further correlation.',
        citation:
            'rigid-body simulation via three.js / react-three-fiber; a discretised approximation of Newtonian contact dynamics.',
        confidence: 'contested',
        falsifiability:
            'when beads pile up or the adaptive pegs react, the simulated histogram can deviate measurably from Binomial(n, 0.5).',
    },
    {
        id: 'finite-sample',
        statement:
            'the histogram is an estimate built from finitely many beads, so it fluctuates around the true distribution rather than matching it exactly.',
        citation:
            'standard sampling theory; a histogram is a Monte Carlo estimate of the underlying pmf.',
        confidence: 'established',
        falsifiability:
            'small bead counts produce ragged histograms that smooth out only as more beads are dropped.',
    },
    {
        id: 'fractional-twist',
        statement:
            'the fracqunx adds editable, adaptive pegs and a drawable target curve, so it is a sandbox for departures from the ideal quincunx as much as a demonstration of the central limit theorem.',
        citation:
            'design intent of this playground; an extension beyond the classical Galton board.',
        confidence: 'speculative',
        falsifiability:
            'the calibration here checks only the underlying binomial model; the adaptive-peg behaviour is exploratory and not validated against a reference.',
    },
];
