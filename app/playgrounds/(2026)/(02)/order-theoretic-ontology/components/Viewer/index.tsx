'use client';

import React, { useMemo } from 'react';
import {
    EDGE_TYPES,
    RELATION_COLORS,
    SelectionKind,
    ViewFilters,
    OntologyDataset,
    Relation,
    MetaRelation,
    buildGraphLayout,
    computeEnvelopMaps,
    computeEnvelopeTightness,
    computePosetDiagnostics,
    edgeLabel,
    filterVisibleEdges,
    formatPercent,
    indexEdges,
    indexNodes,
    metaEdgeLabel,
    relationDash,
} from '../../logic';

interface ViewerProps {
    dataset: OntologyDataset;
    filters: ViewFilters;
    selectedKind: SelectionKind | null;
    selectedId: string | null;
    onSelect: (kind: SelectionKind, id: string) => void;
}

const PANEL_CLASS = 'bg-black/35 border border-lime-500/25 p-3';

function truncateLabel(label: string, maxLength: number): string {
    if (label.length <= maxLength) {
        return label;
    }
    return `${label.slice(0, maxLength - 1)}...`;
}

function edgeGeometry(
    from: { x: number; y: number },
    to: { x: number; y: number },
    nodeWidth: number,
    nodeHeight: number,
) {
    const fromCenterX = from.x + nodeWidth / 2;
    const fromCenterY = from.y + nodeHeight / 2;
    const toCenterX = to.x + nodeWidth / 2;
    const toCenterY = to.y + nodeHeight / 2;

    const dx = toCenterX - fromCenterX;
    const dy = toCenterY - fromCenterY;
    const length = Math.max(1, Math.hypot(dx, dy));
    const ux = dx / length;
    const uy = dy / length;

    const xPad = nodeWidth * 0.42;
    const yPad = nodeHeight * 0.34;

    return {
        x1: fromCenterX + ux * xPad,
        y1: fromCenterY + uy * yPad,
        x2: toCenterX - ux * xPad,
        y2: toCenterY - uy * yPad,
    };
}

function relationText(edge: Relation, nodeLabels: Map<string, string>): string {
    const from = nodeLabels.get(edge.from) ?? edge.from;
    const to = nodeLabels.get(edge.to) ?? edge.to;
    return `${from} ${edgeLabel(edge.type)} ${to}`;
}

function metaText(meta: MetaRelation, edgeIndex: Map<string, Relation>, nodeLabels: Map<string, string>): string {
    const from = edgeIndex.get(meta.fromEdgeId);
    const to = edgeIndex.get(meta.toEdgeId);

    const fromText = from ? relationText(from, nodeLabels) : meta.fromEdgeId;
    const toText = to ? relationText(to, nodeLabels) : meta.toEdgeId;

    return `${metaEdgeLabel(meta.type)}: ${fromText} -> ${toText}`;
}

export default function Viewer({
    dataset,
    filters,
    selectedKind,
    selectedId,
    onSelect,
}: ViewerProps) {
    const nodeIndex = useMemo(() => indexNodes(dataset.nodes), [dataset.nodes]);
    const edgeIndex = useMemo(() => indexEdges(dataset.edges), [dataset.edges]);
    const layout = useMemo(() => buildGraphLayout(dataset), [dataset]);
    const visibleEdges = useMemo(
        () => filterVisibleEdges(dataset.edges, filters),
        [dataset.edges, filters],
    );
    const diagnostics = useMemo(
        () => computePosetDiagnostics(dataset),
        [dataset],
    );
    const tightness = useMemo(
        () => computeEnvelopeTightness(dataset),
        [dataset],
    );
    const { parents, children } = useMemo(
        () => computeEnvelopMaps(dataset.nodes, dataset.edges),
        [dataset.nodes, dataset.edges],
    );

    const orderedNodeIds = useMemo(
        () => layout.layers.flat(),
        [layout.layers],
    );

    const nodeLabels = useMemo(() => {
        const map = new Map<string, string>();
        for (const node of dataset.nodes) {
            map.set(node.id, node.label);
        }
        return map;
    }, [dataset.nodes]);

    const selectionSummary = useMemo(() => {
        if (!selectedKind || !selectedId) {
            return null;
        }

        if (selectedKind === 'node') {
            const node = nodeIndex.get(selectedId);
            if (!node) {
                return null;
            }
            const outgoing = dataset.edges.filter((edge) => edge.from === node.id);
            const incoming = dataset.edges.filter((edge) => edge.to === node.id);
            const envParents = (parents.get(node.id) ?? []).map((id) => nodeIndex.get(id)?.label ?? id);
            const envChildren = (children.get(node.id) ?? []).map((id) => nodeIndex.get(id)?.label ?? id);

            return {
                title: node.label,
                kind: 'Entity',
                lines: [
                    `Outgoing relations: ${outgoing.length}`,
                    `Incoming relations: ${incoming.length}`,
                    `Enveloped by: ${envParents.length > 0 ? envParents.join(', ') : '-'}`,
                    `Envelops: ${envChildren.length > 0 ? envChildren.join(', ') : '-'}`,
                ],
            };
        }

        if (selectedKind === 'edge') {
            const edge = edgeIndex.get(selectedId);
            if (!edge) {
                return null;
            }
            const metas = dataset.metaEdges.filter(
                (meta) => meta.fromEdgeId === edge.id || meta.toEdgeId === edge.id,
            );

            return {
                title: relationText(edge, nodeLabels),
                kind: 'Relation',
                lines: [
                    `Strength: ${formatPercent(edge.strength)}`,
                    `Meta-relations touching this: ${metas.length}`,
                ],
            };
        }

        const meta = dataset.metaEdges.find((entry) => entry.id === selectedId);
        if (!meta) {
            return null;
        }

        return {
            title: `${metaEdgeLabel(meta.type)} (${formatPercent(meta.strength)})`,
            kind: 'Meta-relation',
            lines: [metaText(meta, edgeIndex, nodeLabels)],
        };
    }, [
        selectedKind,
        selectedId,
        dataset.edges,
        dataset.metaEdges,
        nodeIndex,
        edgeIndex,
        parents,
        children,
        nodeLabels,
    ]);

    return (
        <div className="w-[92vw] max-w-[1420px] h-[86vh] grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-4">
            <div className={`${PANEL_CLASS} flex flex-col min-h-0`}>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div>
                        <div className="text-lime-100 text-sm font-semibold">Ontology Graph</div>
                        <div className="text-xs text-lime-200/70">
                            {dataset.nodes.length} entities, {dataset.edges.length} relations, {dataset.metaEdges.length} meta-relations
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-lime-200/80">
                        {EDGE_TYPES.map((type) => (
                            <div key={type} className="flex items-center gap-1">
                                <span
                                    className="inline-block w-4 h-[2px]"
                                    style={{ backgroundColor: RELATION_COLORS[type] }}
                                />
                                <span>{edgeLabel(type)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border border-lime-500/20 bg-[#0a0a0a] flex-1 min-h-0 overflow-auto">
                    <svg width={layout.width} height={layout.height} className="block">
                        <defs>
                            {EDGE_TYPES.map((type) => (
                                <marker
                                    key={type}
                                    id={`arrow-${type}`}
                                    viewBox="0 0 10 10"
                                    refX="9"
                                    refY="5"
                                    markerWidth="6"
                                    markerHeight="6"
                                    orient="auto-start-reverse"
                                >
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill={RELATION_COLORS[type]} />
                                </marker>
                            ))}
                        </defs>

                        {visibleEdges.map((edge) => {
                            const fromPos = layout.positions.get(edge.from);
                            const toPos = layout.positions.get(edge.to);
                            if (!fromPos || !toPos) {
                                return null;
                            }

                            const selected = selectedKind === 'edge' && selectedId === edge.id;
                            const points = edgeGeometry(fromPos, toPos, layout.nodeWidth, layout.nodeHeight);
                            const midX = (points.x1 + points.x2) / 2;
                            const midY = (points.y1 + points.y2) / 2;

                            return (
                                <g
                                    key={edge.id}
                                    onClick={() => onSelect('edge', edge.id)}
                                    className="cursor-pointer"
                                >
                                    <line
                                        x1={points.x1}
                                        y1={points.y1}
                                        x2={points.x2}
                                        y2={points.y2}
                                        stroke={RELATION_COLORS[edge.type]}
                                        strokeWidth={selected ? 3 : 1.6}
                                        strokeOpacity={selected ? 1 : 0.72}
                                        strokeDasharray={relationDash(edge.type)}
                                        markerEnd={`url(#arrow-${edge.type})`}
                                    />
                                    <text
                                        x={midX}
                                        y={midY - 8}
                                        textAnchor="middle"
                                        fontSize="13"
                                        fontWeight="700"
                                        fontFamily="monospace"
                                        fill="#d9f99d"
                                        opacity={0.9}
                                    >
                                        {formatPercent(edge.strength)}
                                    </text>
                                </g>
                            );
                        })}

                        {orderedNodeIds.map((id) => {
                            const node = nodeIndex.get(id);
                            const pos = layout.positions.get(id);
                            if (!node || !pos) {
                                return null;
                            }

                            const selected = selectedKind === 'node' && selectedId === node.id;
                            const notesMark = node.notes && node.notes.trim().length > 0 ? '*' : '';

                            return (
                                <g
                                    key={node.id}
                                    transform={`translate(${pos.x} ${pos.y})`}
                                    onClick={() => onSelect('node', node.id)}
                                    className="cursor-pointer"
                                >
                                    <rect
                                        width={layout.nodeWidth}
                                        height={layout.nodeHeight}
                                        fill={selected ? '#1a2e05' : '#000000'}
                                        stroke={selected ? '#bef264' : '#84cc16'}
                                        strokeWidth={selected ? 2.4 : 1.4}
                                    />
                                    <text
                                        x={10}
                                        y={22}
                                        fontSize="12"
                                        fill="#ecfccb"
                                        fontFamily="monospace"
                                    >
                                        {truncateLabel(node.label, 24)}{notesMark}
                                    </text>
                                    <text
                                        x={10}
                                        y={38}
                                        fontSize="10"
                                        fill="#a3e635"
                                        opacity={0.85}
                                        fontFamily="monospace"
                                    >
                                        {node.id}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </div>

                <div className="mt-3 text-xs text-lime-200/70">
                    Tip: click a node or relation to edit it from the settings panel.
                </div>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1">
                <div className={PANEL_CLASS}>
                    <div className="text-lime-100 text-sm font-semibold mb-2">Selection</div>
                    {!selectionSummary && (
                        <p className="text-xs text-lime-200/70">No active selection.</p>
                    )}
                    {selectionSummary && (
                        <div className="space-y-1 text-xs">
                            <div className="text-lime-400 font-semibold">{selectionSummary.kind}</div>
                            <div className="text-lime-100">{selectionSummary.title}</div>
                            {selectionSummary.lines.map((line) => (
                                <div key={line} className="text-lime-200/75">{line}</div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={PANEL_CLASS}>
                    <div className="text-lime-100 text-sm font-semibold mb-2">Poset Diagnostics</div>
                    <div className="space-y-1 text-xs text-lime-200/75">
                        <div>Envelop relations: {diagnostics.envCount}</div>
                        <div>Multi-parent nodes: {diagnostics.multiParentCount}</div>
                        <div>
                            Cycle detected:{' '}
                            <span className={diagnostics.hasCycle ? 'text-red-300' : 'text-lime-300'}>
                                {diagnostics.hasCycle ? 'yes' : 'no'}
                            </span>
                        </div>
                        <div>
                            Antisymmetry violations:{' '}
                            <span className={diagnostics.antisymViolations.length > 0 ? 'text-red-300' : 'text-lime-300'}>
                                {diagnostics.antisymViolations.length}
                            </span>
                        </div>
                    </div>

                    {diagnostics.antisymViolations.length > 0 && (
                        <div className="mt-3 border-t border-lime-500/15 pt-2 space-y-1">
                            {diagnostics.antisymViolations.slice(0, 6).map((item) => (
                                <div key={`${item.aId}-${item.bId}`} className="text-xs text-red-200/85">
                                    {item.aLabel} <span className="text-lime-300">&harr;</span> {item.bLabel}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={PANEL_CLASS}>
                    <div className="text-lime-100 text-sm font-semibold mb-2">Envelope Tightness</div>
                    {tightness.length === 0 && (
                        <p className="text-xs text-lime-200/70">No envelop relations yet.</p>
                    )}
                    {tightness.length > 0 && (
                        <div className="space-y-1">
                            {tightness.slice(0, 10).map((entry) => {
                                const isSelected = selectedKind === 'edge' && selectedId === entry.envId;
                                return (
                                    <button
                                        key={entry.envId}
                                        onClick={() => onSelect('edge', entry.envId)}
                                        className={`w-full text-left px-2 py-1 border text-xs ${
                                            isSelected
                                                ? 'border-lime-400 bg-lime-500/10 text-lime-100'
                                                : 'border-lime-500/20 bg-black/30 text-lime-200/80 hover:bg-lime-500/10'
                                        }`}
                                    >
                                        <div className="truncate">{entry.parentLabel} envelops {entry.childLabel}</div>
                                        <div className="font-mono text-xs">
                                            tightness {formatPercent(entry.tightness)} | internal {entry.internal} | boundary {entry.boundary}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className={PANEL_CLASS}>
                    <div className="text-lime-100 text-sm font-semibold mb-2">Meta-relations</div>
                    {dataset.metaEdges.length === 0 && (
                        <p className="text-xs text-lime-200/70">No meta-relations yet.</p>
                    )}
                    {dataset.metaEdges.length > 0 && (
                        <div className="space-y-1">
                            {dataset.metaEdges.map((meta) => {
                                const selected = selectedKind === 'meta' && selectedId === meta.id;
                                return (
                                    <button
                                        key={meta.id}
                                        onClick={() => onSelect('meta', meta.id)}
                                        className={`w-full text-left px-2 py-1 border text-xs ${
                                            selected
                                                ? 'border-lime-400 bg-lime-500/10 text-lime-100'
                                                : 'border-lime-500/20 bg-black/30 text-lime-200/80 hover:bg-lime-500/10'
                                        }`}
                                    >
                                        <div>
                                            {metaEdgeLabel(meta.type)} ({formatPercent(meta.strength)})
                                        </div>
                                        <div className="text-[11px] text-lime-200/70 truncate">
                                            {metaText(meta, edgeIndex, nodeLabels)}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
