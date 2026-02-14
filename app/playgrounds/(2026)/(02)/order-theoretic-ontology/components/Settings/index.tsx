'use client';

import React, { useMemo } from 'react';
import Input from '@/components/Input';
import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';
import Toggle from '@/components/Toggle';
import {
    EDGE_TYPES,
    META_EDGE_TYPES,
    PRESETS,
    EditorDraft,
    OntologyDataset,
    OntologyNode,
    Relation,
    MetaRelation,
    SelectionKind,
    ViewFilters,
    edgeLabel,
    metaEdgeLabel,
} from '../../logic';

interface SettingsProps {
    dataset: OntologyDataset;
    presetKey: string;
    onPresetChange: (key: string) => void;

    filters: ViewFilters;
    onFiltersChange: (filters: ViewFilters) => void;

    draft: EditorDraft;
    onDraftChange: (next: EditorDraft) => void;

    selectedKind: SelectionKind | null;
    selectedNode: OntologyNode | null;
    selectedEdge: Relation | null;
    selectedMeta: MetaRelation | null;

    onAddNode: () => void;
    onAddEdge: () => void;
    onAddMetaEdge: () => void;
    onDeleteSelection: () => void;
    onNodePatch: (id: string, patch: Partial<OntologyNode>) => void;
    onEdgePatch: (id: string, patch: Partial<Relation>) => void;
    onMetaPatch: (id: string, patch: Partial<MetaRelation>) => void;

    onPrepareExport: () => void;
    onImportDataset: () => void;
    onCopyJson: () => void;
    onResetAll: () => void;
}

function selectClassName() {
    return 'w-full bg-black border border-lime-500/30 px-3 py-2 text-sm text-lime-100 focus:outline-none focus:border-lime-500';
}

function textareaClassName() {
    return 'w-full min-h-[76px] bg-black border border-lime-500/30 px-3 py-2 text-sm text-lime-100 focus:outline-none focus:border-lime-500';
}

export default function Settings({
    dataset,
    presetKey,
    onPresetChange,
    filters,
    onFiltersChange,
    draft,
    onDraftChange,
    selectedKind,
    selectedNode,
    selectedEdge,
    selectedMeta,
    onAddNode,
    onAddEdge,
    onAddMetaEdge,
    onDeleteSelection,
    onNodePatch,
    onEdgePatch,
    onMetaPatch,
    onPrepareExport,
    onImportDataset,
    onCopyJson,
    onResetAll,
}: SettingsProps) {
    const preset = useMemo(
        () => PRESETS.find((item) => item.key === presetKey) ?? PRESETS[0],
        [presetKey],
    );

    const nodeLookup = useMemo(() => {
        const map = new Map<string, string>();
        for (const node of dataset.nodes) {
            map.set(node.id, node.label);
        }
        return map;
    }, [dataset.nodes]);

    const sortedNodes = useMemo(
        () => [...dataset.nodes].sort((a, b) => a.label.localeCompare(b.label)),
        [dataset.nodes],
    );

    const sortedEdges = useMemo(
        () => [...dataset.edges].sort((a, b) => {
            const left = `${nodeLookup.get(a.from) ?? a.from} ${edgeLabel(a.type)} ${nodeLookup.get(a.to) ?? a.to}`;
            const right = `${nodeLookup.get(b.from) ?? b.from} ${edgeLabel(b.type)} ${nodeLookup.get(b.to) ?? b.to}`;
            return left.localeCompare(right);
        }),
        [dataset.edges, nodeLookup],
    );

    const patchDraft = (patch: Partial<EditorDraft>) => {
        onDraftChange({ ...draft, ...patch });
    };

    return (
        <div className="space-y-7 text-lime-100">
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Preset Dataset</h3>
                <select
                    className={selectClassName()}
                    value={presetKey}
                    onChange={(event) => onPresetChange(event.target.value)}
                >
                    {PRESETS.map((item) => (
                        <option key={item.key} value={item.key}>
                            {item.name}
                        </option>
                    ))}
                </select>
                <p className="text-xs text-lime-200/70 leading-relaxed">{preset.description}</p>
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Add Entity</h3>
                <Input
                    value={draft.nodeLabel}
                    onChange={(value) => patchDraft({ nodeLabel: value })}
                    placeholder="e.g. Thermodynamics"
                    fullWidth
                    centered={false}
                />
                <textarea
                    className={textareaClassName()}
                    value={draft.nodeNotes}
                    onChange={(event) => patchDraft({ nodeNotes: event.target.value })}
                    placeholder="Optional notes"
                />
                <Button
                    label="Add Entity"
                    onClick={onAddNode}
                    size="sm"
                    className="w-36"
                    disabled={draft.nodeLabel.trim().length === 0}
                />
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Add Relation</h3>

                <div>
                    <label className="text-xs text-lime-200/70 block mb-1">From</label>
                    <select
                        className={selectClassName()}
                        value={draft.edgeFrom}
                        onChange={(event) => patchDraft({ edgeFrom: event.target.value })}
                    >
                        <option value="">Select source</option>
                        {sortedNodes.map((node) => (
                            <option key={node.id} value={node.id}>
                                {node.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-xs text-lime-200/70 block mb-1">To</label>
                    <select
                        className={selectClassName()}
                        value={draft.edgeTo}
                        onChange={(event) => patchDraft({ edgeTo: event.target.value })}
                    >
                        <option value="">Select target</option>
                        {sortedNodes.map((node) => (
                            <option key={node.id} value={node.id}>
                                {node.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-xs text-lime-200/70 block mb-1">Type</label>
                    <select
                        className={selectClassName()}
                        value={draft.edgeType}
                        onChange={(event) => patchDraft({ edgeType: event.target.value as Relation['type'] })}
                    >
                        {EDGE_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {edgeLabel(type)}
                            </option>
                        ))}
                    </select>
                </div>

                <SliderInput
                    label="Strength"
                    min={0}
                    max={1}
                    step={0.01}
                    value={draft.edgeStrength}
                    onChange={(value) => patchDraft({ edgeStrength: value })}
                    showDecimals
                />

                <textarea
                    className={textareaClassName()}
                    value={draft.edgeNotes}
                    onChange={(event) => patchDraft({ edgeNotes: event.target.value })}
                    placeholder="Optional notes"
                />

                <Button
                    label="Add Relation"
                    onClick={onAddEdge}
                    size="sm"
                    className="w-40"
                    disabled={
                        draft.edgeFrom.length === 0 ||
                        draft.edgeTo.length === 0 ||
                        draft.edgeFrom === draft.edgeTo
                    }
                />
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Add Relation-of-Relations</h3>

                <div>
                    <label className="text-xs text-lime-200/70 block mb-1">From relation</label>
                    <select
                        className={selectClassName()}
                        value={draft.metaFrom}
                        onChange={(event) => patchDraft({ metaFrom: event.target.value })}
                    >
                        <option value="">Select relation</option>
                        {sortedEdges.map((edge) => {
                            const fromLabel = nodeLookup.get(edge.from) ?? edge.from;
                            const toLabel = nodeLookup.get(edge.to) ?? edge.to;
                            return (
                                <option key={edge.id} value={edge.id}>
                                    {fromLabel} {edgeLabel(edge.type)} {toLabel}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div>
                    <label className="text-xs text-lime-200/70 block mb-1">To relation</label>
                    <select
                        className={selectClassName()}
                        value={draft.metaTo}
                        onChange={(event) => patchDraft({ metaTo: event.target.value })}
                    >
                        <option value="">Select relation</option>
                        {sortedEdges.map((edge) => {
                            const fromLabel = nodeLookup.get(edge.from) ?? edge.from;
                            const toLabel = nodeLookup.get(edge.to) ?? edge.to;
                            return (
                                <option key={edge.id} value={edge.id}>
                                    {fromLabel} {edgeLabel(edge.type)} {toLabel}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div>
                    <label className="text-xs text-lime-200/70 block mb-1">Meta type</label>
                    <select
                        className={selectClassName()}
                        value={draft.metaType}
                        onChange={(event) => patchDraft({ metaType: event.target.value as MetaRelation['type'] })}
                    >
                        {META_EDGE_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {metaEdgeLabel(type)}
                            </option>
                        ))}
                    </select>
                </div>

                <SliderInput
                    label="Strength"
                    min={0}
                    max={1}
                    step={0.01}
                    value={draft.metaStrength}
                    onChange={(value) => patchDraft({ metaStrength: value })}
                    showDecimals
                />

                <textarea
                    className={textareaClassName()}
                    value={draft.metaNotes}
                    onChange={(event) => patchDraft({ metaNotes: event.target.value })}
                    placeholder="Optional notes"
                />

                <Button
                    label="Add Meta"
                    onClick={onAddMetaEdge}
                    size="sm"
                    className="w-36"
                    disabled={
                        draft.metaFrom.length === 0 ||
                        draft.metaTo.length === 0 ||
                        draft.metaFrom === draft.metaTo
                    }
                />
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">View Filters</h3>
                <Toggle
                    text="Show only envelops"
                    value={filters.showOnlyEnvelops}
                    toggle={() => onFiltersChange({
                        ...filters,
                        showOnlyEnvelops: !filters.showOnlyEnvelops,
                    })}
                />
                <SliderInput
                    label="Min relation strength"
                    min={0}
                    max={1}
                    step={0.01}
                    value={filters.minStrength}
                    onChange={(value) => onFiltersChange({ ...filters, minStrength: value })}
                    showDecimals
                />
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Selection Editor</h3>

                {!selectedKind && (
                    <p className="text-xs text-lime-200/70">Select a node, relation, or meta-relation in the graph to edit it.</p>
                )}

                {selectedKind === 'node' && selectedNode && (
                    <>
                        <div className="text-xs text-lime-200/70">ID: {selectedNode.id}</div>
                        <Input
                            value={selectedNode.label}
                            onChange={(value) => onNodePatch(selectedNode.id, { label: value })}
                            fullWidth
                            centered={false}
                        />
                        <textarea
                            className={textareaClassName()}
                            value={selectedNode.notes ?? ''}
                            onChange={(event) => onNodePatch(selectedNode.id, { notes: event.target.value })}
                            placeholder="Node notes"
                        />
                    </>
                )}

                {selectedKind === 'edge' && selectedEdge && (
                    <>
                        <div className="text-xs text-lime-200/70">ID: {selectedEdge.id}</div>
                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <label className="text-xs text-lime-200/70 block mb-1">Type</label>
                                <select
                                    className={selectClassName()}
                                    value={selectedEdge.type}
                                    onChange={(event) => onEdgePatch(selectedEdge.id, {
                                        type: event.target.value as Relation['type'],
                                    })}
                                >
                                    {EDGE_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {edgeLabel(type)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <SliderInput
                                label="Strength"
                                min={0}
                                max={1}
                                step={0.01}
                                value={selectedEdge.strength}
                                onChange={(value) => onEdgePatch(selectedEdge.id, { strength: value })}
                                showDecimals
                            />
                        </div>
                        <textarea
                            className={textareaClassName()}
                            value={selectedEdge.notes ?? ''}
                            onChange={(event) => onEdgePatch(selectedEdge.id, { notes: event.target.value })}
                            placeholder="Relation notes"
                        />
                    </>
                )}

                {selectedKind === 'meta' && selectedMeta && (
                    <>
                        <div className="text-xs text-lime-200/70">ID: {selectedMeta.id}</div>
                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <label className="text-xs text-lime-200/70 block mb-1">Meta type</label>
                                <select
                                    className={selectClassName()}
                                    value={selectedMeta.type}
                                    onChange={(event) => onMetaPatch(selectedMeta.id, {
                                        type: event.target.value as MetaRelation['type'],
                                    })}
                                >
                                    {META_EDGE_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {metaEdgeLabel(type)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <SliderInput
                                label="Strength"
                                min={0}
                                max={1}
                                step={0.01}
                                value={selectedMeta.strength}
                                onChange={(value) => onMetaPatch(selectedMeta.id, { strength: value })}
                                showDecimals
                            />
                        </div>
                        <textarea
                            className={textareaClassName()}
                            value={selectedMeta.notes ?? ''}
                            onChange={(event) => onMetaPatch(selectedMeta.id, { notes: event.target.value })}
                            placeholder="Meta-relation notes"
                        />
                    </>
                )}

                <Button
                    label="Delete Selected"
                    onClick={onDeleteSelection}
                    size="sm"
                    className="w-44"
                    disabled={!selectedKind}
                />
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Export / Import JSON</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Button label="Prepare" onClick={onPrepareExport} size="sm" className="w-full" />
                    <Button label="Copy" onClick={onCopyJson} size="sm" className="w-full" />
                    <Button label="Import" onClick={onImportDataset} size="sm" className="w-full" />
                </div>
                <textarea
                    className="w-full min-h-[190px] bg-black border border-lime-500/30 px-3 py-2 text-xs text-lime-100 font-mono focus:outline-none focus:border-lime-500"
                    value={draft.jsonDraft}
                    onChange={(event) => patchDraft({ jsonDraft: event.target.value, jsonError: null })}
                    placeholder="Dataset JSON"
                />
                {draft.jsonError && (
                    <p className="text-xs text-red-300">{draft.jsonError}</p>
                )}
            </div>

            <div className="border-t border-lime-500/20" />

            <Button label="Reset All" onClick={onResetAll} size="md" className="w-44" />
        </div>
    );
}
