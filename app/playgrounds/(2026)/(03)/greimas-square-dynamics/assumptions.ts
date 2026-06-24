import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'four-position-closure',
        statement:
            'a semantic field can be exhausted by exactly four positions: two contraries S1 and S2 and their two contradictories not-S1 and not-S2. the square asserts that this quartet is closed and complete.',
        citation:
            'Greimas and Rastier 1968, "The Interaction of Semiotic Constraints"; the carre semiotique as a four-term elementary structure of signification.',
        confidence: 'contested',
        falsifiability:
            'many oppositions are graded, multivalent, or non-binary (colour, temperature, kinship); where a field needs more than four positions, the square either collapses categories or excludes the middle.',
    },
    {
        id: 'contradiction-as-involution',
        statement:
            'negation is a strict involution: not-not-S1 is identical to S1, so the contradiction diagonal is a reversible bit flip with no remainder. this is what makes the corners a Klein four-group V4 = Z2 x Z2.',
        citation:
            'classical bivalent logic and the square of opposition; the group encoding is exact for the toy by construction.',
        confidence: 'established',
        falsifiability:
            'in intuitionistic or paraconsistent logics double negation does not return the original; if the modelled domain tolerates "not entirely not-S1" the involution fails and the group structure dissolves.',
    },
    {
        id: 'typed-relations-fixed',
        statement:
            'the six relations are typed and fixed by position: the verticals are contradiction, the top edge is contrariety, the bottom edge is sub-contrariety, the diagonals are implication (deixis). the relation depends only on which corners are joined, never on content.',
        citation:
            'the logical square of opposition (Apuleius / Boethius) recast semiotically by Greimas; relation types are structural, not empirical.',
        confidence: 'established',
        falsifiability:
            'a pair of terms whose actual logical relation contradicts the slot the square assigns it (e.g. two "contraries" that can in fact both hold) would show the typing is imposed rather than discovered.',
    },
    {
        id: 'contrary-vs-contradictory',
        statement:
            'contrariety and contradiction are genuinely distinct: contraries cannot both be true but can both be false (S1, S2), whereas contradictories partition truth exactly (S1, not-S1). the square depends on keeping these apart.',
        citation:
            'Aristotle, De Interpretatione, on the difference between contraries and contradictories; standard in the square of opposition.',
        confidence: 'established',
        falsifiability:
            'if for a given pair "both false" is impossible, they are contradictories not contraries, and placing them on the contrary edge mislabels the structure.',
    },
    {
        id: 'deixis-direction',
        statement:
            'the diagonals carry a directed implication (deixis): S1 implies not-S2 and S2 implies not-S1, giving the square an oriented "complex / neutral" axis rather than only symmetric oppositions.',
        citation:
            'Greimas\'s notion of the deictic axes; the directed diagonals distinguish the semiotic square from the bare logical square.',
        confidence: 'contested',
        falsifiability:
            'the implication direction is an interpretive overlay; a domain where S1 does not entail the negation of its contrary would leave the diagonals undirected and the deixis empty.',
    },
    {
        id: 'flow-as-illustration',
        statement:
            'the animated particle flow is an illustrative reachability metaphor, not part of the semiotic claim. spawn rate, speed, and random walk visualise which corners are accessible from a commitment; they do not measure anything about meaning.',
        citation:
            'modelling choice for this playground; the stochastic transport layer sits on top of the fixed relational skeleton.',
        confidence: 'speculative',
        falsifiability:
            'reading the steady-state particle density as a claim about semantics would over-interpret the toy; the calibration deliberately verifies only the deterministic relation lattice, not the flow.',
    },
];
