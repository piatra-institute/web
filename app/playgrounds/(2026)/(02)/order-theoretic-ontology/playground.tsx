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
    LayoutMode,
    MetaRelation,
    OntologyDataset,
    OntologyMode,
    OntologyNode,
    Relation,
    SelectionKind,
    SnapshotRecord,
    ViewFilters,
    applyRepairSuggestion,
    clamp01,
    cloneDataset,
    computeRuleChecks,
    computeSnapshotDiff,
    nextNodeId,
    parseDatasetFromJson,
    suggestRepairs,
    uid,
    validateDatasetForMode,
} from './logic';

const CURRENT_SNAPSHOT_ID = '__current__';

function cleanNotes(value: string | undefined): string | undefined {
    if (!value) {
        return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

function snapshotLabel(snapshotId: string, snapshots: SnapshotRecord[]): string {
    if (snapshotId === CURRENT_SNAPSHOT_ID) {
        return 'Current';
    }
    const record = snapshots.find((item) => item.id === snapshotId);
    if (!record) {
        return 'Current';
    }
    return record.name;
}

export default function OrderTheoreticOntologyPlayground() {
    const [dataset, setDataset] = useState(() => cloneDataset(PRESETS[0].data));
    const [presetKey, setPresetKey] = useState(PRESETS[0].key);

    const [filters, setFilters] = useState<ViewFilters>({ ...DEFAULT_VIEW_FILTERS });
    const [draft, setDraft] = useState<EditorDraft>({ ...DEFAULT_EDITOR_DRAFT });

    const [selectedKind, setSelectedKind] = useState<SelectionKind | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const [mode, setMode] = useState<OntologyMode>('soft_poset');
    const [layoutMode, setLayoutMode] = useState<LayoutMode>('layered');
    const [showClosureEdges, setShowClosureEdges] = useState(false);
    const [showReduction, setShowReduction] = useState(false);
    const [modeError, setModeError] = useState<string | null>(null);

    const [snapshots, setSnapshots] = useState<SnapshotRecord[]>([]);
    const [snapshotNameDraft, setSnapshotNameDraft] = useState('');
    const [leftSnapshotId, setLeftSnapshotId] = useState<string>(CURRENT_SNAPSHOT_ID);
    const [rightSnapshotId, setRightSnapshotId] = useState<string>(CURRENT_SNAPSHOT_ID);

    useEffect(() => {
        if (!selectedKind || !selectedId) {
            return;
        }

        const exists =
            (selectedKind === 'node' && dataset.nodes.some((node) => node.id === selectedId))
            || (selectedKind === 'edge' && dataset.edges.some((edge) => edge.id === selectedId))
            || (selectedKind === 'meta' && dataset.metaEdges.some((meta) => meta.id === selectedId));

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

    const ruleCheck = useMemo(
        () => computeRuleChecks(dataset),
        [dataset],
    );

    const repairSuggestions = useMemo(
        () => suggestRepairs(dataset),
        [dataset],
    );

    const resolveSnapshotDataset = useCallback((snapshotId: string): OntologyDataset => {
        if (snapshotId === CURRENT_SNAPSHOT_ID) {
            return dataset;
        }
        const record = snapshots.find((item) => item.id === snapshotId);
        return record ? record.dataset : dataset;
    }, [dataset, snapshots]);

    const leftDataset = useMemo(
        () => resolveSnapshotDataset(leftSnapshotId),
        [resolveSnapshotDataset, leftSnapshotId],
    );

    const rightDataset = useMemo(
        () => resolveSnapshotDataset(rightSnapshotId),
        [resolveSnapshotDataset, rightSnapshotId],
    );

    const snapshotDiff = useMemo(
        () => computeSnapshotDiff(leftDataset, rightDataset),
        [leftDataset, rightDataset],
    );

    const leftSnapshotLabel = useMemo(
        () => snapshotLabel(leftSnapshotId, snapshots),
        [leftSnapshotId, snapshots],
    );

    const rightSnapshotLabel = useMemo(
        () => snapshotLabel(rightSnapshotId, snapshots),
        [rightSnapshotId, snapshots],
    );

    const commitCandidateDataset = useCallback((
        next: OntologyDataset,
        blockedContext: string,
    ): { ok: true } | { ok: false; error: string } => {
        const validation = validateDatasetForMode(next, mode);
        if (!validation.allowed) {
            const details = validation.ruleCheck.blockingIssues.join(' ');
            const error = `${blockedContext} ${details}`.trim();
            setModeError(error);
            return { ok: false, error };
        }

        setDataset(next);
        setModeError(null);
        return { ok: true };
    }, [mode]);

    const clearSnapshots = useCallback(() => {
        setSnapshots([]);
        setSnapshotNameDraft('');
        setLeftSnapshotId(CURRENT_SNAPSHOT_ID);
        setRightSnapshotId(CURRENT_SNAPSHOT_ID);
    }, []);

    const handlePresetChange = useCallback((key: string) => {
        const preset = PRESETS.find((entry) => entry.key === key);
        if (!preset) {
            return;
        }

        setPresetKey(preset.key);
        setDataset(cloneDataset(preset.data));
        setFilters({ ...DEFAULT_VIEW_FILTERS });
        setDraft({ ...DEFAULT_EDITOR_DRAFT });
        setMode('soft_poset');
        setLayoutMode('layered');
        setShowClosureEdges(false);
        setShowReduction(false);
        setModeError(null);
        setSelectedKind(null);
        setSelectedId(null);
        clearSnapshots();
    }, [clearSnapshots]);

    const handleResetAll = useCallback(() => {
        setPresetKey(PRESETS[0].key);
        setDataset(cloneDataset(PRESETS[0].data));
        setFilters({ ...DEFAULT_VIEW_FILTERS });
        setDraft({ ...DEFAULT_EDITOR_DRAFT });
        setMode('soft_poset');
        setLayoutMode('layered');
        setShowClosureEdges(false);
        setShowReduction(false);
        setModeError(null);
        setSelectedKind(null);
        setSelectedId(null);
        clearSnapshots();
    }, [clearSnapshots]);

    const handleSelect = useCallback((kind: SelectionKind, id: string) => {
        setSelectedKind(kind);
        setSelectedId(id);
    }, []);

    const handleModeChange = useCallback((nextMode: OntologyMode) => {
        setMode(nextMode);
        if (nextMode === 'strict_poset') {
            const validation = validateDatasetForMode(dataset, nextMode);
            if (!validation.allowed) {
                setModeError(`Strict poset active: ${validation.ruleCheck.blockingIssues.join(' ')}`);
            } else {
                setModeError(null);
            }
        } else {
            setModeError(null);
        }
    }, [dataset]);

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

        const next: OntologyDataset = {
            ...dataset,
            nodes: [...dataset.nodes, node],
        };

        if (!commitCandidateDataset(next, 'Strict poset blocked adding node.').ok) {
            return;
        }

        setDraft((prev) => ({
            ...prev,
            nodeLabel: '',
            nodeNotes: '',
        }));
        setSelectedKind('node');
        setSelectedId(id);
    }, [commitCandidateDataset, dataset, draft.nodeLabel, draft.nodeNotes]);

    const handleAddEdge = useCallback(() => {
        const from = draft.edgeFrom;
        const to = draft.edgeTo;

        if (!from || !to || from === to) {
            return;
        }

        const nodeIds = new Set(dataset.nodes.map((node) => node.id));
        if (!nodeIds.has(from) || !nodeIds.has(to)) {
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

        const next: OntologyDataset = {
            ...dataset,
            edges: [...dataset.edges, edge],
        };

        if (!commitCandidateDataset(next, 'Strict poset blocked adding relation.').ok) {
            return;
        }

        setDraft((prev) => ({
            ...prev,
            edgeNotes: '',
        }));
        setSelectedKind('edge');
        setSelectedId(edge.id);
    }, [
        commitCandidateDataset,
        dataset,
        draft.edgeFrom,
        draft.edgeTo,
        draft.edgeType,
        draft.edgeStrength,
        draft.edgeNotes,
    ]);

    const handleAddMetaEdge = useCallback(() => {
        const fromEdgeId = draft.metaFrom;
        const toEdgeId = draft.metaTo;

        if (!fromEdgeId || !toEdgeId || fromEdgeId === toEdgeId) {
            return;
        }

        const edgeIds = new Set(dataset.edges.map((edge) => edge.id));
        if (!edgeIds.has(fromEdgeId) || !edgeIds.has(toEdgeId)) {
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

        const next: OntologyDataset = {
            ...dataset,
            metaEdges: [...dataset.metaEdges, meta],
        };

        if (!commitCandidateDataset(next, 'Strict poset blocked adding meta-relation.').ok) {
            return;
        }

        setDraft((prev) => ({
            ...prev,
            metaNotes: '',
        }));
        setSelectedKind('meta');
        setSelectedId(meta.id);
    }, [
        commitCandidateDataset,
        dataset,
        draft.metaFrom,
        draft.metaTo,
        draft.metaType,
        draft.metaStrength,
        draft.metaNotes,
    ]);

    const handleDeleteSelection = useCallback(() => {
        if (!selectedKind || !selectedId) {
            return;
        }

        let next = cloneDataset(dataset);
        if (selectedKind === 'node') {
            next = {
                nodes: next.nodes.filter((node) => node.id !== selectedId),
                edges: next.edges.filter((edge) => edge.from !== selectedId && edge.to !== selectedId),
                metaEdges: next.metaEdges,
            };
            const remainingEdgeIds = new Set(next.edges.map((edge) => edge.id));
            next.metaEdges = next.metaEdges.filter((meta) =>
                remainingEdgeIds.has(meta.fromEdgeId) && remainingEdgeIds.has(meta.toEdgeId));
        } else if (selectedKind === 'edge') {
            next = {
                ...next,
                edges: next.edges.filter((edge) => edge.id !== selectedId),
                metaEdges: next.metaEdges.filter((meta) =>
                    meta.fromEdgeId !== selectedId && meta.toEdgeId !== selectedId),
            };
        } else {
            next = {
                ...next,
                metaEdges: next.metaEdges.filter((meta) => meta.id !== selectedId),
            };
        }

        if (!commitCandidateDataset(next, 'Strict poset blocked deleting selection.').ok) {
            return;
        }

        setSelectedKind(null);
        setSelectedId(null);
    }, [commitCandidateDataset, dataset, selectedKind, selectedId]);

    const handleNodePatch = useCallback((id: string, patch: Partial<OntologyNode>) => {
        const next: OntologyDataset = {
            ...dataset,
            nodes: dataset.nodes.map((node) => {
                if (node.id !== id) {
                    return node;
                }

                const updated: OntologyNode = { ...node };
                if (typeof patch.label === 'string') {
                    updated.label = patch.label;
                }
                if (typeof patch.notes === 'string') {
                    updated.notes = cleanNotes(patch.notes);
                }

                return updated;
            }),
        };

        commitCandidateDataset(next, 'Strict poset blocked node edit.');
    }, [commitCandidateDataset, dataset]);

    const handleEdgePatch = useCallback((id: string, patch: Partial<Relation>) => {
        const next: OntologyDataset = {
            ...dataset,
            edges: dataset.edges.map((edge) => {
                if (edge.id !== id) {
                    return edge;
                }

                const updated: Relation = { ...edge };
                if (typeof patch.type === 'string') {
                    updated.type = patch.type;
                }
                if (typeof patch.strength === 'number') {
                    updated.strength = clamp01(patch.strength);
                }
                if (typeof patch.notes === 'string') {
                    updated.notes = cleanNotes(patch.notes);
                }

                return updated;
            }),
        };

        commitCandidateDataset(next, 'Strict poset blocked relation edit.');
    }, [commitCandidateDataset, dataset]);

    const handleMetaPatch = useCallback((id: string, patch: Partial<MetaRelation>) => {
        const next: OntologyDataset = {
            ...dataset,
            metaEdges: dataset.metaEdges.map((meta) => {
                if (meta.id !== id) {
                    return meta;
                }

                const updated: MetaRelation = { ...meta };
                if (typeof patch.type === 'string') {
                    updated.type = patch.type;
                }
                if (typeof patch.strength === 'number') {
                    updated.strength = clamp01(patch.strength);
                }
                if (typeof patch.notes === 'string') {
                    updated.notes = cleanNotes(patch.notes);
                }

                return updated;
            }),
        };

        commitCandidateDataset(next, 'Strict poset blocked meta-relation edit.');
    }, [commitCandidateDataset, dataset]);

    const handleApplyRepair = useCallback((repairId: string) => {
        const suggestion = repairSuggestions.find((item) => item.id === repairId);
        if (!suggestion) {
            return;
        }

        const next = applyRepairSuggestion(dataset, suggestion);
        if (!commitCandidateDataset(next, 'Strict poset blocked repair application.').ok) {
            return;
        }

        setSelectedKind(null);
        setSelectedId(null);
    }, [commitCandidateDataset, dataset, repairSuggestions]);

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
            const result = commitCandidateDataset(parsed, 'Strict poset blocked import.');
            if (!result.ok) {
                setDraft((prev) => ({ ...prev, jsonError: result.error }));
                return;
            }

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
    }, [commitCandidateDataset, draft.jsonDraft]);

    const handleSaveSnapshot = useCallback(() => {
        const fallbackName = `Snapshot ${snapshots.length + 1}`;
        const name = snapshotNameDraft.trim().length > 0 ? snapshotNameDraft.trim() : fallbackName;
        const record: SnapshotRecord = {
            id: uid('snap'),
            name,
            createdAtISO: new Date().toISOString(),
            dataset: cloneDataset(dataset),
        };

        setSnapshots((prev) => [record, ...prev]);
        setSnapshotNameDraft('');
    }, [dataset, snapshotNameDraft, snapshots.length]);

    const handleDeleteSnapshot = useCallback((id: string) => {
        setSnapshots((prev) => prev.filter((item) => item.id !== id));
        setLeftSnapshotId((prev) => (prev === id ? CURRENT_SNAPSHOT_ID : prev));
        setRightSnapshotId((prev) => (prev === id ? CURRENT_SNAPSHOT_ID : prev));
    }, []);

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
                    mode={mode}
                    ruleCheck={ruleCheck}
                    layoutMode={layoutMode}
                    showClosureEdges={showClosureEdges}
                    showReduction={showReduction}
                    repairSuggestions={repairSuggestions}
                    onApplyRepair={handleApplyRepair}
                    snapshotDiff={snapshotDiff}
                    leftSnapshotLabel={leftSnapshotLabel}
                    rightSnapshotLabel={rightSnapshotLabel}
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
                            The playground treats the relation <Equation math={'A \\preceq B'} /> as an
                            "envelops" claim and checks whether your ontology still behaves like a partial order.
                            Structural leaks appear as cycles, multi-parent chains, and antisymmetry violations.
                        </p>
                        <Equation mode="block" math={'A \\preceq B \\wedge B \\preceq C \\Rightarrow A \\preceq C'} />
                        <p className="leading-relaxed text-sm mt-3">
                            We compute transitive closure over "envelops" edges and inspect it for contradictory
                            pairs where two distinct entities reach each other.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Leak Metrics</h3>
                        <p className="leading-relaxed text-sm mb-3">
                            For each envelope <Equation math={'P \\supseteq C'} />, a local tightness score compares
                            internal relations to boundary crossings.
                        </p>
                        <Equation
                            mode="block"
                            math={'\\operatorname{tightness}(P,C)=\\frac{\\operatorname{internal}}{\\operatorname{internal}+\\operatorname{boundary}}'}
                        />
                        <p className="leading-relaxed text-sm mt-3">
                            Low tightness means the proposed envelope leaks heavily into the outside graph.
                            Meta-relations then let you represent second-order claims like
                            "this relation contradicts that relation".
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Workflow Upgrades</h3>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>Use strict/soft/free ontology modes depending on whether edits should be blocked.</li>
                            <li>Toggle closure and reduction to inspect implied versus essential envelop structure.</li>
                            <li>Apply repair suggestions to remove minimal contradictions.</li>
                            <li>Save named snapshots and compare structural diffs across revisions.</li>
                            <li>Switch layout mode between layered and force-directed graph views.</li>
                        </ul>
                    </div>
                </div>
            ),
        },
    ]), [
        dataset,
        filters,
        selectedKind,
        selectedId,
        handleSelect,
        mode,
        ruleCheck,
        layoutMode,
        showClosureEdges,
        showReduction,
        repairSuggestions,
        handleApplyRepair,
        snapshotDiff,
        leftSnapshotLabel,
        rightSnapshotLabel,
    ]);

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
                    mode={mode}
                    onModeChange={handleModeChange}
                    modeError={modeError}
                    ruleCheck={ruleCheck}
                    layoutMode={layoutMode}
                    onLayoutModeChange={setLayoutMode}
                    showClosureEdges={showClosureEdges}
                    onShowClosureEdgesToggle={() => setShowClosureEdges((prev) => !prev)}
                    showReduction={showReduction}
                    onShowReductionToggle={() => setShowReduction((prev) => !prev)}
                    repairSuggestions={repairSuggestions}
                    onApplyRepair={handleApplyRepair}
                    snapshots={snapshots}
                    snapshotNameDraft={snapshotNameDraft}
                    onSnapshotNameDraftChange={setSnapshotNameDraft}
                    onSaveSnapshot={handleSaveSnapshot}
                    leftSnapshotId={leftSnapshotId}
                    onLeftSnapshotChange={setLeftSnapshotId}
                    rightSnapshotId={rightSnapshotId}
                    onRightSnapshotChange={setRightSnapshotId}
                    onDeleteSnapshot={handleDeleteSnapshot}
                />
            }
        />
    );
}
