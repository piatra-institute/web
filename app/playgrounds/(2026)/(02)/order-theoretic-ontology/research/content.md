# Order-Theoretic Ontology

## Abstract

This playground asks a narrow but useful question: if you draw your ontology as a graph of "envelops" claims, does that graph still behave like a partial order? Partial orders (posets) are the mathematical backbone of taxonomies, type hierarchies, subsumption in description logic, and mereology. When an ontology silently violates the poset axioms, it develops cycles, contradictory subsumptions, and multi-parent tangles that downstream reasoners cannot interpret. The tool computes the relevant structural invariants live and reports exactly where the order leaks.

## Background: what a partial order is

A partial order on a set P is a binary relation, written A <= B, that is:

- **reflexive**: A <= A for every element,
- **antisymmetric**: if A <= B and B <= A then A = B,
- **transitive**: if A <= B and B <= C then A <= C.

The pair (P, <=) is a partially ordered set, or poset. "Partial" means some pairs may be incomparable: neither A <= B nor B <= A need hold. A poset in which every pair is comparable is a chain (a total order); a poset in which no two distinct elements are comparable is an antichain.

These three axioms are exactly what a subsumption hierarchy needs. "Dog is a Mammal" and "Mammal is an Animal" should entail "Dog is an Animal" (transitivity). Nothing should be a strict subtype of something that is also its subtype (antisymmetry). Everything is trivially a subtype of itself (reflexivity).

## The model: envelops as the order

The playground designates one relation type, "envelops", as the partial order. An edge A -> B is read as "A envelops B", which the diagnostics treat as the order relation B <= A in the containment sense (the child sits under the parent). All other relation types in the editor (grounds, depends_on, causes, contrasts, is_about) are annotations: they are drawn and stored, but they are excluded from every order-theoretic test. This is a deliberate modelling choice and the first listed assumption. It keeps the order single and unambiguous, at the cost of ignoring orderings a user might have intended through the other edge types.

Reflexivity is left implicit. Real Hasse diagrams never draw self-loops or any edge that transitivity already implies, so the stored graph is the strict cover order. The tool actively forbids envelop self-loops as the first rule check.

## What the tool computes

### Acyclicity

The cover relation of a poset must be a directed acyclic graph. A depth-first search over the envelop edges looks for a back edge; finding one means a cycle, which means no valid order can be drawn. The two-cycle A -> B -> A is the minimal failing case.

### Antisymmetry

Antisymmetry says distinct elements cannot each be below the other. In a graph this fails precisely when two distinct nodes reach each other. The tool computes the transitive closure and then scans for pairs (i, j) with i reachable from j and j reachable from i. Each such pair is reported as an antisymmetry violation. Note that any cycle of length two or more produces at least one such pair, so antisymmetry and acyclicity fail together, which is correct: a strict order is acyclic, and any mutual reachability collapses the order.

### Transitive closure

The closure is computed with the Floyd-Warshall algorithm over the reachability matrix. From A -> B -> C it derives the implied pair A <= C. The "show closure" toggle draws these implied-but-not-direct edges so a user can see the full set of subsumptions their ontology commits them to, including ones they never typed.

### Transitive reduction

The transitive reduction is the opposite move: keep only the cover edges, the ones not implied by any other path. For a finite DAG this reduction is unique and is exactly the Hasse diagram. The tool keeps an envelop edge A -> B only when there is no alternative path from A to B; the redundant shortcut in A -> B -> C plus A -> C is dropped. Uniqueness of the reduction depends on acyclicity, which is why the reduction view is only meaningful once the acyclicity check passes.

### Single-parent nesting

Strict containment hierarchies often want each element to have at most one direct parent (a forest of nestings). The tool counts nodes with more than one envelop parent and flags them. This is not a poset axiom; a perfectly valid poset can have multi-parent nodes (the diamond is the canonical example). It is offered as an optional structural constraint for ontologies that intend strict tree-like nesting.

## Joins, meets, and lattices

Two elements A and B may have a least upper bound, their **join** A v B: the smallest element that is above both. Dually they may have a greatest lower bound, their **meet** A ^ B. A poset in which every pair has both a join and a meet is a **lattice**. Lattices are the natural setting for ontology operations like "most specific common supertype" (a join in the subtype order) and "intersection type" (a meet).

The playground does not require a dataset to be a lattice; it only checks that it is a partial order. The diamond preset, where A covers B and C and both cover D, is a lattice: D is the meet of B and C and A is their join. But the single-parent check flags D because it has two parents. This tension is real and intended: lattice structure and strict tree nesting pull against each other, and the tool lets you see both readings of the same graph.

## The leak metric

Beyond the formal checks, the tool reports an "envelope tightness" heuristic for each proposed envelope. For an envelope rooted at a node, the descendants form an inside set; tightness is the number of edges that stay inside divided by the number that stay inside plus the number that cross the boundary. A tightness near one means the envelope is a clean, self-contained module; a low value means the proposed container leaks heavily into the rest of the graph. This is an ad hoc graph statistic in the spirit of network conductance and modularity, not an order-theoretic invariant, and it is marked speculative in the assumptions. Two order-isomorphic ontologies can score differently if their non-envelop annotations differ.

## Meta-relations

The editor also supports second-order claims: a meta-relation connects two relations rather than two nodes, with types supports, refines, contradicts, or explains. This lets a user assert, for instance, that one subsumption claim contradicts another. Meta-relations are not part of the order and do not enter the poset checks; they are an annotation layer for argumentation about the ontology.

## Modes and repair

Three modes control how strict the editor is. Strict mode blocks any edit that would violate the poset rules, so the dataset is always a valid order. Soft mode allows the edit but surfaces the violation, which is the right setting for incremental cleanup. Free mode treats the structure as a plain graph and shows the checks as information only. When violations exist, the tool proposes minimal repairs: the smallest set of edges to remove or downgrade that restores acyclicity and antisymmetry.

## Calibration

The companion calibration file checks the deterministic structural core against six hand-verifiable posets:

1. the chain A <= B <= C passes every rule check (valid partial order),
2. the 2-cycle A <-> B yields exactly one antisymmetry-violating pair,
3. the same 2-cycle is reported as not acyclic,
4. the transitive closure of a 3-chain adds exactly one implied edge (A <= C),
5. the diamond has exactly one multi-parent node (the bottom D),
6. the transitive reduction of A -> B -> C plus the shortcut A -> C keeps two cover edges.

Every predicted value is computed by the same functions the playground runs, so the calibration verifies the implementation rather than restating its output.

## Limitations

The tool fixes a single relation as the order and ignores orderings expressed through other edge types. Reflexivity is never materialised, so formalisms that need genuine self-relation cannot be expressed. The tightness metric is a heuristic, not an invariant. And the model only checks poset structure: it does not test whether the ontology is a lattice, whether joins and meets exist, or whether the labels denote a coherent domain. It is a structural microscope for the order, not a full ontology reasoner.

## References

- B. A. Davey and H. A. Priestley, *Introduction to Lattices and Order*, 2nd ed., Cambridge University Press, 2002.
- S. Warshall, "A theorem on Boolean matrices," *Journal of the ACM*, 1962.
- A. V. Aho, M. R. Garey, and J. D. Ullman, "The transitive reduction of a directed graph," *SIAM Journal on Computing*, 1972.
- F. Baader et al., *The Description Logic Handbook*, Cambridge University Press, 2003 (subsumption hierarchies as partial orders).
