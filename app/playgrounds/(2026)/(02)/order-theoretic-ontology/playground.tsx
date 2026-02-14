'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import Equation from '@/components/Equation';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import {
    DEFAULT_EDITOR_DRAFT,
    DEFAULT_VIEW_FILTERS,
    PRESETS,
    EditorDraft,
    MetaRelation,
    OntologyNode,
    Relation,
    SelectionKind,
    ViewFilters,
    clamp01,
    cloneDataset,
    parseDatasetFromJson,
    nextNodeId,
    uid,
} from './logic';

function cleanNotes(value: string | undefined): string | undefined {
    if (!value) {
        return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

export default function OrderTheoreticOntologyPlayground() {
    const [dataset, setDataset] = useState(() => cloneDataset(PRESETS[0].data));
    const [presetKey, setPresetKey] = useState(PRESETS[0].key);

    const [filters, setFilters] = useState<ViewFilters>({ ...DEFAULT_VIEW_FILTERS });
    const [draft, setDraft] = useState<EditorDraft>({ ...DEFAULT_EDITOR_DRAFT });

    const [selectedKind, setSelectedKind] = useState<SelectionKind | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedKind || !selectedId) {
            return;
        }

        const exists =
            (selectedKind === 'node' && dataset.nodes.some((node) => node.id === selectedId)) ||
            (selectedKind === 'edge' && dataset.edges.some((edge) => edge.id === selectedId)) ||
            (selectedKind === 'meta' && dataset.metaEdges.some((meta) => meta.id === selectedId));

        if (!exists) {
            setSelectedKind(null);
            setSelectedId(null);
        }
    }, [dataset, selectedKind, selectedId]);

    const selectedNode = useMemo(
        () => (selectedKind === 'node' && selectedId
            ? dataset.nodes.find((node) => node.id === selectedId) ?? null
            : null),
        [selectedKind, selectedId, dataset.nodes],
    );

    const selectedEdge = useMemo(
        () => (selectedKind === 'edge' && selectedId
            ? dataset.edges.find((edge) => edge.id === selectedId) ?? null
            : null),
        [selectedKind, selectedId, dataset.edges],
    );

    const selectedMeta = useMemo(
        () => (selectedKind === 'meta' && selectedId
            ? dataset.metaEdges.find((meta) => meta.id === selectedId) ?? null
            : null),
        [selectedKind, selectedId, dataset.metaEdges],
    );

    const handlePresetChange = useCallback((key: string) => {
        const preset = PRESETS.find((entry) => entry.key === key);
        if (!preset) {
            return;
        }

        setPresetKey(preset.key);
        setDataset(cloneDataset(preset.data));
        setFilters({ ...DEFAULT_VIEW_FILTERS });
        setSelectedKind(null);
        setSelectedId(null);
        setDraft({ ...DEFAULT_EDITOR_DRAFT });
    }, []);

    const handleResetAll = useCallback(() => {
        setPresetKey(PRESETS[0].key);
        setDataset(cloneDataset(PRESETS[0].data));
        setFilters({ ...DEFAULT_VIEW_FILTERS });
        setDraft({ ...DEFAULT_EDITOR_DRAFT });
        setSelectedKind(null);
        setSelectedId(null);
    }, []);

    const handleSelect = useCallback((kind: SelectionKind, id: string) => {
        setSelectedKind(kind);
        setSelectedId(id);
    }, []);

    const handleAddNode = useCallback(() => {
        const label = draft.nodeLabel.trim();
        if (label.length === 0) {
            return;
        }

        const id = nextNodeId(dataset.nodes);
        const node: OntologyNode = {
            id,
            label,
            notes: cleanNotes(draft.nodeNotes),
        };

        setDataset((prev) => ({
            ...prev,
            nodes: [...prev.nodes, node],
        }));

        setDraft((prev) => ({
            ...prev,
            nodeLabel: '',
            nodeNotes: '',
        }));

        setSelectedKind('node');
        setSelectedId(id);
    }, [dataset.nodes, draft.nodeLabel, draft.nodeNotes]);

    const handleAddEdge = useCallback(() => {
        const from = draft.edgeFrom;
        const to = draft.edgeTo;

        if (!from || !to || from === to) {
            return;
        }

        const edge: Relation = {
            id: uid('e'),
            from,
            to,
            type: draft.edgeType,
            strength: clamp01(draft.edgeStrength),
            notes: cleanNotes(draft.edgeNotes),
        };

        setDataset((prev) => {
            const nodeIds = new Set(prev.nodes.map((node) => node.id));
            if (!nodeIds.has(from) || !nodeIds.has(to)) {
                return prev;
            }

            return {
                ...prev,
                edges: [...prev.edges, edge],
            };
        });

        setDraft((prev) => ({
            ...prev,
            edgeNotes: '',
        }));

        setSelectedKind('edge');
        setSelectedId(edge.id);
    }, [draft.edgeFrom, draft.edgeTo, draft.edgeType, draft.edgeStrength, draft.edgeNotes]);

    const handleAddMetaEdge = useCallback(() => {
        const fromEdgeId = draft.metaFrom;
        const toEdgeId = draft.metaTo;

        if (!fromEdgeId || !toEdgeId || fromEdgeId === toEdgeId) {
            return;
        }

        const meta: MetaRelation = {
            id: uid('m'),
            fromEdgeId,
            toEdgeId,
            type: draft.metaType,
            strength: clamp01(draft.metaStrength),
            notes: cleanNotes(draft.metaNotes),
        };

        setDataset((prev) => {
            const edgeIds = new Set(prev.edges.map((edge) => edge.id));
            if (!edgeIds.has(fromEdgeId) || !edgeIds.has(toEdgeId)) {
                return prev;
            }

            return {
                ...prev,
                metaEdges: [...prev.metaEdges, meta],
            };
        });

        setDraft((prev) => ({
            ...prev,
            metaNotes: '',
        }));

        setSelectedKind('meta');
        setSelectedId(meta.id);
    }, [draft.metaFrom, draft.metaTo, draft.metaType, draft.metaStrength, draft.metaNotes]);

    const handleDeleteSelection = useCallback(() => {
        if (!selectedKind || !selectedId) {
            return;
        }

        setDataset((prev) => {
            if (selectedKind === 'node') {
                const nextNodes = prev.nodes.filter((node) => node.id !== selectedId);
                const nextEdges = prev.edges.filter((edge) => edge.from !== selectedId && edge.to !== selectedId);
                const nextEdgeIds = new Set(nextEdges.map((edge) => edge.id));
                const nextMeta = prev.metaEdges.filter(
                    (meta) => nextEdgeIds.has(meta.fromEdgeId) && nextEdgeIds.has(meta.toEdgeId),
                );

                return {
                    nodes: nextNodes,
                    edges: nextEdges,
                    metaEdges: nextMeta,
                };
            }

            if (selectedKind === 'edge') {
                const nextEdges = prev.edges.filter((edge) => edge.id !== selectedId);
                const nextMeta = prev.metaEdges.filter(
                    (meta) => meta.fromEdgeId !== selectedId && meta.toEdgeId !== selectedId,
                );

                return {
                    ...prev,
                    edges: nextEdges,
                    metaEdges: nextMeta,
                };
            }

            return {
                ...prev,
                metaEdges: prev.metaEdges.filter((meta) => meta.id !== selectedId),
            };
        });

        setSelectedKind(null);
        setSelectedId(null);
    }, [selectedKind, selectedId]);

    const handleNodePatch = useCallback((id: string, patch: Partial<OntologyNode>) => {
        setDataset((prev) => ({
            ...prev,
            nodes: prev.nodes.map((node) => {
                if (node.id !== id) {
                    return node;
                }

                const next: OntologyNode = { ...node };
                if (typeof patch.label === 'string') {
                    next.label = patch.label;
                }
                if (typeof patch.notes === 'string') {
                    next.notes = cleanNotes(patch.notes);
                }

                return next;
            }),
        }));
    }, []);

    const handleEdgePatch = useCallback((id: string, patch: Partial<Relation>) => {
        setDataset((prev) => ({
            ...prev,
            edges: prev.edges.map((edge) => {
                if (edge.id !== id) {
                    return edge;
                }

                const next: Relation = { ...edge };
                if (typeof patch.type === 'string') {
                    next.type = patch.type;
                }
                if (typeof patch.strength === 'number') {
                    next.strength = clamp01(patch.strength);
                }
                if (typeof patch.notes === 'string') {
                    next.notes = cleanNotes(patch.notes);
                }

                return next;
            }),
        }));
    }, []);

    const handleMetaPatch = useCallback((id: string, patch: Partial<MetaRelation>) => {
        setDataset((prev) => ({
            ...prev,
            metaEdges: prev.metaEdges.map((meta) => {
                if (meta.id !== id) {
                    return meta;
                }

                const next: MetaRelation = { ...meta };
                if (typeof patch.type === 'string') {
                    next.type = patch.type;
                }
                if (typeof patch.strength === 'number') {
                    next.strength = clamp01(patch.strength);
                }
                if (typeof patch.notes === 'string') {
                    next.notes = cleanNotes(patch.notes);
                }

                return next;
            }),
        }));
    }, []);

    const handlePrepareExport = useCallback(() => {
        setDraft((prev) => ({
            ...prev,
            jsonDraft: JSON.stringify(dataset, null, 2),
            jsonError: null,
        }));
    }, [dataset]);

    const handleCopyJson = useCallback(() => {
        if (typeof navigator === 'undefined') {
            return;
        }

        if (draft.jsonDraft.trim().length === 0) {
            return;
        }

        navigator.clipboard.writeText(draft.jsonDraft).catch(() => {
            setDraft((prev) => ({
                ...prev,
                jsonError: 'Could not copy to clipboard in this browser.',
            }));
        });
    }, [draft.jsonDraft]);

    const handleImportDataset = useCallback(() => {
        try {
            const parsed = parseDatasetFromJson(draft.jsonDraft);
            setDataset(parsed);
            setSelectedKind(null);
            setSelectedId(null);
            setDraft((prev) => ({ ...prev, jsonError: null }));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Could not parse dataset JSON.';
            setDraft((prev) => ({
                ...prev,
                jsonError: message,
            }));
        }
    }, [draft.jsonDraft]);

    const sections = useMemo(() => ([
        {
            id: 'intro',
            type: 'intro' as const,
        },
        {
            id: 'canvas',
            type: 'canvas' as const,
            content: (
                <Viewer
                    dataset={dataset}
                    filters={filters}
                    selectedKind={selectedKind}
                    selectedId={selectedId}
                    onSelect={handleSelect}
                />
            ),
        },
        {
            id: 'outro',
            type: 'outro' as const,
            content: (
                <div className="space-y-8 text-gray-300">
                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Order-Theoretic Ontology</h3>
                        <p className="leading-relaxed text-sm mb-3">
                            The playground treats the relation <Equation math="A \preceq B" /> as an
                            "envelops" claim and checks whether your ontology still behaves like a partial order.
                            Structural leaks appear as cycles, multi-parent chains, and antisymmetry violations.
                        </p>
                        <Equation mode="block" math="A \preceq B \wedge B \preceq C \Rightarrow A \preceq C" />
                        <p className="leading-relaxed text-sm mt-3">
                            We compute transitive closure over "envelops" edges and inspect it for contradictory
                            pairs where two distinct entities reach each other.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Leak Metrics</h3>
                        <p className="leading-relaxed text-sm mb-3">
                            For each envelope <Equation math="P \supseteq C" />, a local tightness score compares
                            internal relations to boundary crossings.
                        </p>
                        <Equation mode="block" math="\text{tightness}(P,C)=\frac{\text{internal}}{\text{internal}+\text{boundary}}" />
                        <p className="leading-relaxed text-sm mt-3">
                            Low tightness means the proposed envelope leaks heavily into the outside graph.
                            Meta-relations then let you represent second-order claims like
                            "this relation contradicts that relation".
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">How To Use</h3>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>Start with a preset, then add or remove envelope relations to test closure.</li>
                            <li>Use filtering to focus on the strongest structure before adding cross-links.</li>
                            <li>Inspect diagnostics and tightness to see exactly where ontological claims break.</li>
                            <li>Export JSON snapshots to compare ontology drafts over time.</li>
                        </ul>
                    </div>
                </div>
            ),
        },
    ]), [dataset, filters, selectedKind, selectedId, handleSelect]);

    return (
        <PlaygroundLayout
            title="order-theoretic ontology"
            subtitle="build ontologies as posets and see where they leak"
            sections={sections}
            settings={
                <Settings
                    dataset={dataset}
                    presetKey={presetKey}
                    onPresetChange={handlePresetChange}
                    filters={filters}
                    onFiltersChange={setFilters}
                    draft={draft}
                    onDraftChange={setDraft}
                    selectedKind={selectedKind}
                    selectedNode={selectedNode}
                    selectedEdge={selectedEdge}
                    selectedMeta={selectedMeta}
                    onAddNode={handleAddNode}
                    onAddEdge={handleAddEdge}
                    onAddMetaEdge={handleAddMetaEdge}
                    onDeleteSelection={handleDeleteSelection}
                    onNodePatch={handleNodePatch}
                    onEdgePatch={handleEdgePatch}
                    onMetaPatch={handleMetaPatch}
                    onPrepareExport={handlePrepareExport}
                    onImportDataset={handleImportDataset}
                    onCopyJson={handleCopyJson}
                    onResetAll={handleResetAll}
                />
            }
        />
    );
}
