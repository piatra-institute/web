import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'envelops-is-the-order',
        statement:
            'only the "envelops" relation is treated as the partial order A <= B. The other relation types (grounds, depends_on, causes, contrasts, is_about) are carried as annotations and are excluded from every order-theoretic check.',
        citation:
            'Davey and Priestley, Introduction to Lattices and Order (2002): a poset is a set with one designated reflexive, antisymmetric, transitive relation.',
        confidence: 'established',
        falsifiability:
            'if a user intends "grounds" or "depends_on" to also be ordering relations, the diagnostics will under-report cycles and leaks across those edges.',
    },
    {
        id: 'reflexivity-implicit',
        statement:
            'reflexivity (A <= A) is assumed implicitly and never drawn. The model stores only strict cover-style edges and forbids envelop self-loops, so the displayed graph is the strict order, not the reflexive closure.',
        citation:
            'standard convention: a Hasse diagram omits loops and all edges implied by reflexivity and transitivity.',
        confidence: 'established',
        falsifiability:
            'a formalism that needs genuine self-relation (an element strictly enveloping itself) cannot be expressed; the no-self-loop check would reject it.',
    },
    {
        id: 'antisymmetry-as-mutual-reach',
        statement:
            'antisymmetry is checked as the absence of distinct nodes that reach each other in the transitive closure. A 2-cycle, or any longer cycle, is reported as an antisymmetry violation rather than collapsing the nodes into one.',
        citation:
            'antisymmetry: a <= b and b <= a imply a = b; in a graph of distinct nodes its only failure is mutual reachability.',
        confidence: 'established',
        falsifiability:
            'if two labels are meant to denote the same entity, the model still reports them as a violating pair instead of merging them.',
    },
    {
        id: 'transitivity-via-closure',
        statement:
            'transitivity is enforced by computing the Floyd-Warshall transitive closure over envelop edges; implied edges (reachable but not directly drawn) are surfaced separately from cover edges via the closure and reduction toggles.',
        citation:
            'Warshall (1962) transitive closure; the transitive reduction of a DAG (Aho, Garey, Ullman 1972) recovers the unique cover relation.',
        confidence: 'established',
        falsifiability:
            'on a cyclic graph the transitive reduction is no longer unique, so the reduction view is only meaningful once the acyclicity check passes.',
    },
    {
        id: 'tightness-is-a-heuristic',
        statement:
            'the "envelope tightness" leak metric (internal edges divided by internal plus boundary edges) is an ad hoc graph statistic, not a theorem of order theory. It scores how self-contained a proposed envelope is, counting every relation type, not just envelops.',
        citation:
            'analogous to network conductance and modularity; introduced here as a diagnostic, not a formal order-theoretic invariant.',
        confidence: 'speculative',
        falsifiability:
            'two ontologies that are order-isomorphic can receive different tightness scores if their non-envelop annotations differ, so tightness is not an invariant of the order.',
    },
    {
        id: 'lattice-not-required',
        statement:
            'a valid dataset is only required to be a partial order, not a lattice. Joins (least upper bounds) and meets (greatest lower bounds) need not exist or be unique; multi-parent nodes are flagged but allowed outside strict mode.',
        citation:
            'every lattice is a poset but not conversely; many real taxonomies are posets with missing or non-unique joins.',
        confidence: 'contested',
        falsifiability:
            'a workflow that assumes every pair has a unique meet would be broken by any multi-parent node the single-parent check reports.',
    },
];
