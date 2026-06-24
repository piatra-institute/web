import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'state-space-universality',
        statement:
            'every science can be framed as the study of a state space X with a transition structure T, so that what differs between disciplines is the geometry of X, the character of T, and the accessibility of parameters and noise rather than the kind of object being studied.',
        citation:
            'phase-space tradition from Poincare and Gibbs; Bertalanffy general systems theory; the framing is a synthesis, not a single source.',
        confidence: 'contested',
        falsifiability:
            'a discipline whose explanatory content cannot be cast as constraints on configurations and their succession (for example a purely interpretive or normative field) would fall outside the frame.',
    },
    {
        id: 'ten-orthogonal-axes',
        statement:
            'ten axes (dimensionality, stochasticity, nonlinearity, observability, controllability, openness, adaptation, endogeneity, reflexivity, predictability) are treated as if they were independent coordinates, so that Euclidean distance in this space is a meaningful similarity.',
        citation:
            'axes drawn from dynamical systems, Kalman observability and controllability, open-systems theory, and Soros reflexivity. independence is assumed for tractability.',
        confidence: 'contested',
        falsifiability:
            'the axes are clearly correlated in practice (high reflexivity tends to track low predictability); a principal-component analysis of the score matrix would show fewer than ten effective dimensions, weakening the orthogonality claim.',
    },
    {
        id: 'integer-scores-are-ordinal',
        statement:
            'each state space and each sample case is given an integer score from 0 to 4 on every axis, and these scores are treated as if they lived on an interval scale so that squared differences can be summed.',
        citation:
            'scores are hand-assigned expert judgements; the 0 to 4 banding is a modelling choice for legibility, not a measured quantity.',
        confidence: 'speculative',
        falsifiability:
            'reasonable experts would disagree on individual scores by a band or two; if the nearest-neighbour classification flips under such re-scoring, the specific assignment is not robust even if the framework survives.',
    },
    {
        id: 'euclidean-matching',
        statement:
            'similarity between a profile and a cell is the Euclidean distance over the ten axes, with no axis weighting, so that a one-band difference on reflexivity counts exactly as much as a one-band difference on dimensionality.',
        citation:
            'standard unweighted L2 nearest-neighbour. matchScore and rankSpaces in logic/match.ts implement this directly.',
        confidence: 'established',
        falsifiability:
            'this is exactly what the code computes, so it is true by construction; the open question is whether unweighted L2 is the right metric, which weighting experiments would test.',
    },
    {
        id: 'developmental-ladder',
        statement:
            'state spaces can be ordered on a Fixed to Adaptive to Endogenous to Reflexive ladder, where later rungs describe systems whose own rules become variables and eventually feed back through participants models of the system.',
        citation:
            'Ashby cybernetic feedback, Lucas critique on endogenous policy regimes, Soros reflexivity, and von Foerster second-order cybernetics.',
        confidence: 'contested',
        falsifiability:
            'the ladder is presented as a partial order, not a total one; a domain that is strongly reflexive yet has fixed exogenous rules would show the rungs are not strictly nested.',
    },
    {
        id: 'not-a-difficulty-ranking',
        statement:
            'the table is explicitly not a ranking of which sciences are harder or more legitimate; reflexive and endogenous domains are not lesser sciences, they simply support a different style of regularity and explanation.',
        citation:
            'reading of the philosophy-of-science framing in the outro; contingent boundary conditions do not disqualify a field if disciplined, testable structure emerges.',
        confidence: 'speculative',
        falsifiability:
            'this is an interpretive stance rather than a computed output; nothing in the score matrix forces it, and a reader could attach a difficulty ordering to the same axes.',
    },
];
