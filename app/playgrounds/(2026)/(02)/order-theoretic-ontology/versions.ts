import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'February 2026',
        description:
            'first cut. an editable ontology workbench that treats the "envelops" relation as a partial order A <= B and checks whether the structure still behaves like a poset: no self-loops, acyclicity, antisymmetry, and single-parent nesting. Adds transitive closure and reduction views, an envelope-tightness leak metric, second-order meta-relations, strict / soft / free modes, snapshots with structural diffs, and minimal repair suggestions.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'February 2026',
        changes: [
            'order model: the "envelops" edge is read as the partial-order relation; reflexivity is implicit, self-loops are forbidden, and the displayed graph is the strict cover order.',
            'rule checks: no envelop self-loops, acyclicity via DFS, antisymmetry via mutual reachability in the transitive closure, and single-parent nesting.',
            'transitive closure (Floyd-Warshall) and transitive reduction (cover edges only) exposed as separate toggles.',
            'envelope-tightness leak metric: internal edges over internal plus boundary edges, scoring how self-contained each proposed envelope is.',
            'meta-relations let users assert second-order claims (supports, refines, contradicts, explains) between two relations.',
            'strict / soft / free modes: strict blocks any edit that would violate the poset rules; soft surfaces violations without blocking; free treats the structure as a plain graph.',
            'snapshots with structural diffs and minimal repair suggestions that remove or downgrade the smallest set of edges to restore the order.',
            'calibration added: six hand-checkable posets verify partial-order validity, antisymmetry, acyclicity, transitive closure, multi-parent detection, and transitive reduction against the textbook answers.',
        ],
    },
];
