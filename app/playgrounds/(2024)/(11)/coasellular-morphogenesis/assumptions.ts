import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'cells-as-agents',
        statement:
            'each cell is modelled as a self-interested economic agent that holds an endowment (its point values) and an energy budget, and bargains with its lattice neighbours over shared-boundary states. morphogenesis is treated as the emergent outcome of these local negotiations.',
        citation:
            'Levin lab framing of cells as competent agents with goals at the bioelectric level; Coase 1937 and 1960 on the firm and social cost as bargaining among agents.',
        confidence: 'contested',
        falsifiability:
            'if cell-state changes during development are better predicted by purely mechanical or gene-regulatory rules with no agent-like cost accounting, the economic framing adds nothing and should be dropped.',
    },
    {
        id: 'coase-conservation',
        statement:
            'a transaction moves one unit of value from one cell to a neighbour, so the total endowment across the tissue is conserved. this is the Coasean efficiency claim in miniature: bargaining reallocates value without destroying it.',
        citation:
            'Coase 1960, The Problem of Social Cost: under costless bargaining and well-defined rights, parties reach an efficient allocation regardless of the initial assignment.',
        confidence: 'established',
        falsifiability:
            'the conservation is a property of the transaction rule and is verified exactly in the calibration panel; a rule that created or destroyed value would falsify the analogy directly.',
    },
    {
        id: 'transaction-cost-friction',
        statement:
            'every transaction spends energy proportional to a transaction-cost parameter, so bargaining is not free. higher transaction costs drain the cells\' energy budgets faster and throttle further negotiation.',
        citation:
            'Coase 1960 and Williamson 1985: positive transaction costs are precisely what makes the initial allocation of rights matter and can block efficient bargains.',
        confidence: 'established',
        falsifiability:
            'if removing the transaction-cost term left the long-run pattern unchanged, transaction costs would be doing no work in the model.',
    },
    {
        id: 'neighbours-as-memory',
        statement:
            'a cell uses its neighbouring cells as distributed external memory: its next state depends on boundary points it shares with adjacent circles rather than on a private internal store. pattern information lives in the relations between cells, not inside any one.',
        citation:
            'distributed cognition and the extended-mind tradition; bioelectric gap-junction coupling as non-local pattern memory in the Levin lab.',
        confidence: 'speculative',
        falsifiability:
            'if isolating a cell from its neighbours did not degrade its contribution to the global pattern, the claim that memory is distributed across boundaries would fail.',
    },
    {
        id: 'rotation-as-clock',
        statement:
            'the steady rotation of each circle is a developmental clock that repeatedly brings interior points into the boundary cone where they become eligible to transact. it stands in for the cyclic re-presentation of cell surfaces to their neighbours over developmental time.',
        citation:
            'segmentation-clock and oscillatory-patterning literature in development; here used only as a scheduling device, not a claim about real cell rotation.',
        confidence: 'speculative',
        falsifiability:
            'real cells do not physically spin; if the qualitative dynamics depended on the literal rotation rather than on the recurrence of contact it represents, the abstraction would be misleading.',
    },
    {
        id: 'toy-not-tissue',
        statement:
            'the live grid is a single stochastic run over a small lattice with random starting energies and random adjustment signs. it is a transparent sandbox for the conserved-bargaining logic, not a fitted or validated model of any real tissue.',
        citation:
            'modelling choice. the deterministic core used for calibration deliberately removes the random draws so the structural invariants can be checked exactly.',
        confidence: 'established',
        falsifiability:
            'quantitative biological claims would require real morphologies, fitted parameters, and ensemble runs; only the qualitative conservation-and-friction story is what this toy supports.',
    },
];
