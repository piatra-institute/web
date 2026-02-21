'use client';

import React, { useMemo } from 'react';
import {
    ResponsiveContainer,
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts';
import {
    DerivedVariant,
    fmt,
    tagFromSurplus,
} from '../../logic';

interface ViewerProps {
    filtered: DerivedVariant[];
    selected: DerivedVariant | null;
    chain: DerivedVariant[];
    onSelectId: (id: string | null) => void;
}

const TOOLTIP_STYLE = {
    contentStyle: {
        background: '#0a0a0a',
        border: '1px solid #84cc16',
        borderRadius: 0,
        color: '#ecfccb',
        fontSize: 12,
    },
    labelStyle: { color: '#84cc16' },
};

const BUCKET_COLORS: Record<string, string> = {
    Low: '#65a30d',
    Mid: '#84cc16',
    High: '#a3e635',
};

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: DerivedVariant }> }) {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    if (!d) return null;
    const e = d.entanglement;
    return (
        <div
            style={{
                background: '#0a0a0a',
                border: '1px solid #84cc16',
                borderRadius: 0,
                padding: 12,
                maxWidth: 420,
                color: '#ecfccb',
                fontSize: 12,
            }}
        >
            <div style={{ fontWeight: 600 }}>{d.author}</div>
            <div style={{ color: '#bef264', marginTop: 4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                &ldquo;{d.text}&rdquo;
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px', marginTop: 8 }}>
                <div>Specificity: {fmt(d.specificity)}</div>
                <div>Circulation (log): {fmt(d.y)}</div>
                <div>Dispersion: {fmt(d.dispersion)}</div>
                <div>Retention: {fmt(d.retention)}</div>
                <div>Surprisal: {fmt(d.surprisal)}</div>
                <div>Mutability: {fmt(d.mutability)}</div>
                <div>Cliché index: {fmt(d.cliche)}</div>
                <div>Entanglement: {fmt(e)} ({tagFromSurplus(e)})</div>
            </div>
            <div style={{ marginTop: 8, color: '#a3a3a3', fontSize: 11 }}>
                Click a point to inspect genealogy.
            </div>
        </div>
    );
}

export default function Viewer({
    filtered,
    selected,
    chain,
    onSelectId,
}: ViewerProps) {
    const buckets = useMemo(() => ({
        low: filtered.filter((d) => d.bucket === 'Low'),
        mid: filtered.filter((d) => d.bucket === 'Mid'),
        high: filtered.filter((d) => d.bucket === 'High'),
    }), [filtered]);

    return (
        <div className="w-[90vw] h-[90vh] space-y-6 overflow-y-auto outline-none [&_*]:outline-none text-lime-100">
            {/* Scatter landscape */}
            <div style={{ width: '100%', height: 460 }}>
                <ResponsiveContainer width="100%" height={460} minWidth={0}>
                    <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
                        <CartesianGrid stroke="#333" />
                        <XAxis
                            type="number"
                            dataKey="x"
                            name="Specificity"
                            domain={[0, 1]}
                            tickFormatter={(v: number) => v.toFixed(2)}
                            label={{
                                value: 'Specificity (0=general, 1=specific)',
                                position: 'insideBottom',
                                offset: -15,
                                style: { fill: '#84cc16', fontSize: 12 },
                            }}
                            tick={{ fill: '#a3e635', fontSize: 11 }}
                            stroke="#555"
                        />
                        <YAxis
                            type="number"
                            dataKey="y"
                            name="Circulation"
                            domain={[0, 'dataMax']}
                            tickFormatter={(v: number) => v.toFixed(2)}
                            label={{
                                value: 'log(Circulation)',
                                angle: -90,
                                position: 'insideLeft',
                                style: { fill: '#84cc16', fontSize: 12 },
                            }}
                            tick={{ fill: '#a3e635', fontSize: 11 }}
                            stroke="#555"
                        />
                        <ZAxis type="number" dataKey="z" range={[40, 240]} name="Excerpt pressure" />
                        <Tooltip
                            content={<CustomTooltip />}
                            {...TOOLTIP_STYLE}
                        />
                        <Scatter
                            name="Entanglement: Low"
                            data={buckets.low}
                            fill={BUCKET_COLORS.Low}
                            onClick={(d: DerivedVariant) => onSelectId(d?.id)}
                            isAnimationActive={false}
                        />
                        <Scatter
                            name="Entanglement: Mid"
                            data={buckets.mid}
                            fill={BUCKET_COLORS.Mid}
                            onClick={(d: DerivedVariant) => onSelectId(d?.id)}
                            isAnimationActive={false}
                        />
                        <Scatter
                            name="Entanglement: High"
                            data={buckets.high}
                            fill={BUCKET_COLORS.High}
                            onClick={(d: DerivedVariant) => onSelectId(d?.id)}
                            isAnimationActive={false}
                        />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 text-xs text-lime-200/70 justify-center">
                {Object.entries(BUCKET_COLORS).map(([label, color]) => (
                    <div key={label} className="flex items-center gap-2">
                        <div style={{ width: 10, height: 10, background: color }} />
                        <span>Entanglement: {label}</span>
                    </div>
                ))}
            </div>

            {/* Inspection panel */}
            {!selected ? (
                <div className="text-sm text-lime-200/60 text-center py-4">
                    Click a point in the landscape (or a top cliché entry) to inspect its metrics and genealogy.
                </div>
            ) : (
                <div className="space-y-4 border border-lime-500/20 p-4">
                    <div>
                        <div className="text-xs text-lime-200/60">Selected variant</div>
                        <div className="text-lg text-lime-100 font-semibold leading-snug">
                            &ldquo;{selected.text}&rdquo;
                        </div>
                        <div className="text-xs text-lime-200/60 mt-1">
                            {selected.author} &middot; gen {selected.generation} &middot; created tick {selected.createdAt}
                        </div>
                    </div>

                    {/* Metrics grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <Metric label="Cliché index" value={fmt(selected.cliche)} />
                        <Metric label="Entanglement (E)" value={`${fmt(selected.entanglement)} · ${tagFromSurplus(selected.entanglement)}`} />
                        <Metric label="Specificity" value={fmt(selected.specificity)} />
                        <Metric label="Circulation" value={fmt(selected.freq)} />
                        <Metric label="Dispersion" value={fmt(selected.dispersion)} />
                        <Metric label="Retention" value={fmt(selected.retention)} />
                        <Metric label="Surprisal" value={fmt(selected.surprisal)} />
                        <Metric label="Mutability" value={fmt(selected.mutability)} />
                        <Metric label="A_name" value={fmt(selected.a_name)} />
                        <Metric label="A_src" value={fmt(selected.a_src)} />
                        <Metric label="Length (words)" value={String(selected.lengthWords)} />
                        <Metric label="Drift" value={fmt(selected.drift)} />
                    </div>

                    {/* Genealogy chain */}
                    <div className="border border-lime-500/20 p-3">
                        <div className="text-sm text-lime-400 font-medium">Genealogy (parent chain)</div>
                        <div className="text-xs text-lime-200/60 mt-1">
                            From current variant back toward its earliest ancestor.
                        </div>
                        <div className="mt-3 space-y-2">
                            {chain.map((n, idx) => (
                                <div key={n.id} className="border border-lime-500/20 p-2">
                                    <div className="text-xs text-lime-200/60">
                                        {idx === 0 ? 'Current' : `Parent −${idx}`} &middot; gen {n.generation} &middot; C={fmt(n.cliche)} &middot; E={fmt(n.entanglement)}
                                    </div>
                                    <div className="text-sm text-lime-100 line-clamp-2">
                                        &ldquo;{n.text}&rdquo;
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-xs text-lime-200/60">
                        Reading tip: high <span className="text-lime-100 font-medium">C</span> with high <span className="text-lime-100 font-medium">E</span> often indicates a name-legitimized slogan regime (author-name doing social work beyond source).
                    </div>
                </div>
            )}
        </div>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="border border-lime-500/20 p-3">
            <div className="text-xs text-lime-200/60">{label}</div>
            <div className="text-sm text-lime-100 font-medium mt-1 break-words">{value}</div>
        </div>
    );
}
