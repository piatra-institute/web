'use client';

import { useMemo } from 'react';
import {
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from 'recharts';

import {
    type Params,
    type StateSpace,
    type Family,
    type DimensionKey,
    FAMILY_COLORS,
    FAMILY_LABELS,
    DIMENSION_LABELS,
    DIMENSION_KEYS,
    LADDER_LEVELS,
    STATE_SPACES,
    SAMPLE_CASES,
    rankSpaces,
} from '../../logic';
import { similarityPercent } from '../../logic/match';


// ── Helpers ──────────────────────────────────────────────────────

const COMPARE_COLORS = ['#84cc16', '#22d3ee', '#f59e0b'];

function isFiltered(space: StateSpace, params: Params): boolean {
    if (params.familyFilter !== 'all' && space.family !== params.familyFilter) return false;
    if (params.search) {
        const q = params.search.toLowerCase();
        return (
            space.name.toLowerCase().includes(q) ||
            space.id.toLowerCase().includes(q) ||
            space.short.toLowerCase().includes(q) ||
            space.tags.some((t) => t.includes(q))
        );
    }
    return true;
}

function ScoreBar({ value, max = 4, color = '#84cc16' }: { value: number; max?: number; color?: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-white/5">
                <div
                    className="h-full transition-all"
                    style={{ width: `${(value / max) * 100}%`, backgroundColor: color }}
                />
            </div>
            <span className="text-lime-200/50 text-[10px] w-3">{value}</span>
        </div>
    );
}

function FamilyBadge({ family }: { family: Family }) {
    return (
        <span
            className="text-[10px] px-1.5 py-0.5 border"
            style={{
                borderColor: FAMILY_COLORS[family],
                color: FAMILY_COLORS[family],
            }}
        >
            {FAMILY_LABELS[family]}
        </span>
    );
}


// ── Detail Panel ─────────────────────────────────────────────────

function DetailPanel({ space }: { space: StateSpace }) {
    return (
        <div className="border border-lime-500/20 bg-black/60 p-4 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
                <span
                    className="text-2xl font-mono font-bold"
                    style={{ color: FAMILY_COLORS[space.family] }}
                >
                    {space.id}
                </span>
                <FamilyBadge family={space.family} />
            </div>
            <div className="text-lime-100 text-lg">{space.name}</div>
            <p className="text-lime-200/60 text-xs leading-relaxed">{space.summary}</p>

            <div className="border-t border-lime-500/10 pt-3">
                <div className="text-lime-200/40 text-[10px] uppercase tracking-wider mb-2">Diagnostic Question</div>
                <p className="text-lime-400 text-xs italic">{space.keyQuestion}</p>
            </div>

            <div className="border-t border-lime-500/10 pt-3">
                <div className="text-lime-200/40 text-[10px] uppercase tracking-wider mb-2">Dimensions</div>
                <div className="space-y-1">
                    {DIMENSION_KEYS.map((key) => (
                        <div key={key} className="flex items-center gap-2">
                            <span className="text-lime-200/50 text-[10px] w-24 shrink-0">
                                {DIMENSION_LABELS[key].label}
                            </span>
                            <ScoreBar value={space.scores[key]} color={FAMILY_COLORS[space.family]} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t border-lime-500/10 pt-3">
                <div className="text-lime-200/40 text-[10px] uppercase tracking-wider mb-2">Note</div>
                <p className="text-lime-200/60 text-xs leading-relaxed">{space.note}</p>
            </div>

            <div className="flex flex-wrap gap-1">
                {space.examples.map((ex) => (
                    <span key={ex} className="text-[10px] px-1.5 py-0.5 border border-lime-500/15 text-lime-200/50">
                        {ex}
                    </span>
                ))}
            </div>

            {space.ancestors.length > 0 && (
                <div className="text-lime-200/40 text-[10px]">
                    {space.ancestors.join(' · ')}
                </div>
            )}
        </div>
    );
}


// ── Table View ───────────────────────────────────────────────────

function TableView({ params, onParamsChange }: ViewProps) {
    const selected = params.selectedId
        ? STATE_SPACES.find((s) => s.id === params.selectedId) ?? null
        : null;

    return (
        <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
                <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                    {STATE_SPACES.map((space) => {
                        const visible = isFiltered(space, params);
                        const isSelected = params.selectedId === space.id;
                        return (
                            <button
                                key={space.id}
                                onClick={() =>
                                    onParamsChange({
                                        ...params,
                                        selectedId: isSelected ? null : space.id,
                                    })
                                }
                                className={`text-left p-2 border transition-all cursor-pointer ${
                                    isSelected
                                        ? 'border-lime-500 bg-lime-500/10'
                                        : 'border-lime-500/10 hover:border-lime-500/30'
                                } ${!visible ? 'opacity-20' : ''}`}
                                style={{
                                    borderLeftWidth: 3,
                                    borderLeftColor: FAMILY_COLORS[space.family],
                                    backgroundColor: isSelected
                                        ? undefined
                                        : `${FAMILY_COLORS[space.family]}08`,
                                }}
                            >
                                <div
                                    className="text-lg font-mono font-bold leading-none"
                                    style={{ color: FAMILY_COLORS[space.family] }}
                                >
                                    {space.id}
                                </div>
                                <div className="text-lime-100 text-[11px] mt-1 leading-tight">
                                    {space.name}
                                </div>
                                <div className="text-lime-200/40 text-[9px] mt-0.5 leading-tight">
                                    {space.short}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Row labels */}
                <div className="flex gap-3 mt-3 flex-wrap">
                    {(['geometry', 'dynamics', 'control', 'systems', 'social', 'epistemology'] as Family[]).map((f) => (
                        <div key={f} className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5" style={{ backgroundColor: FAMILY_COLORS[f] }} />
                            <span className="text-lime-200/40 text-[10px]">{FAMILY_LABELS[f]}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail panel */}
            {selected && (
                <div className="lg:w-80 shrink-0">
                    <DetailPanel space={selected} />
                </div>
            )}
        </div>
    );
}


// ── Compare View ─────────────────────────────────────────────────

function CompareView({ params, onParamsChange }: ViewProps) {
    const selectedSpaces = params.compareIds
        .map((id) => STATE_SPACES.find((s) => s.id === id))
        .filter(Boolean) as StateSpace[];

    const radarData = DIMENSION_KEYS.map((key) => {
        const point: Record<string, string | number> = {
            dimension: DIMENSION_LABELS[key].label,
        };
        selectedSpaces.forEach((space, i) => {
            point[space.id] = space.scores[key];
        });
        return point;
    });

    const toggleCompare = (id: string) => {
        if (params.compareIds.includes(id)) {
            onParamsChange({
                ...params,
                compareIds: params.compareIds.filter((i) => i !== id),
            });
        } else if (params.compareIds.length < 3) {
            onParamsChange({
                ...params,
                compareIds: [...params.compareIds, id],
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Compact selection grid */}
            <div>
                <div className="text-lime-200/40 text-xs mb-2">
                    Click to select (max 3){params.compareIds.length > 0 && ` — ${params.compareIds.length} selected`}
                </div>
                <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
                    {STATE_SPACES.map((space) => {
                        const isSelected = params.compareIds.includes(space.id);
                        const idx = params.compareIds.indexOf(space.id);
                        return (
                            <button
                                key={space.id}
                                onClick={() => toggleCompare(space.id)}
                                className={`text-center py-1.5 px-1 border text-[10px] font-mono transition-all cursor-pointer ${
                                    isSelected
                                        ? 'border-lime-500'
                                        : 'border-lime-500/10 hover:border-lime-500/30 text-lime-200/50'
                                }`}
                                style={
                                    isSelected
                                        ? { borderColor: COMPARE_COLORS[idx], color: COMPARE_COLORS[idx], backgroundColor: `${COMPARE_COLORS[idx]}15` }
                                        : undefined
                                }
                            >
                                {space.id}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Radar chart */}
            {selectedSpaces.length >= 2 && (
                <div className="border border-lime-500/20 bg-black/40 p-4">
                    <div style={{ width: '100%', height: 380 }}>
                        <ResponsiveContainer width="100%" height={380} minWidth={0}>
                            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="65%">
                                <PolarGrid stroke="#333" />
                                <PolarAngleAxis
                                    dataKey="dimension"
                                    tick={{ fill: '#84cc16', fontSize: 10 }}
                                />
                                <PolarRadiusAxis
                                    tick={{ fill: '#666', fontSize: 9 }}
                                    domain={[0, 4]}
                                    tickCount={5}
                                />
                                {selectedSpaces.map((space, i) => (
                                    <Radar
                                        key={space.id}
                                        name={`${space.id} ${space.name}`}
                                        dataKey={space.id}
                                        stroke={COMPARE_COLORS[i]}
                                        fill={COMPARE_COLORS[i]}
                                        fillOpacity={0.15}
                                        strokeWidth={2}
                                    />
                                ))}
                                <Legend
                                    wrapperStyle={{ fontSize: 11 }}
                                    formatter={(value: string) => (
                                        <span style={{ color: '#d9f99d' }}>{value}</span>
                                    )}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0a0a0a',
                                        border: '1px solid rgba(132,204,22,0.2)',
                                        fontSize: 11,
                                    }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {selectedSpaces.length === 1 && (
                <div className="text-lime-200/40 text-xs text-center py-8">
                    Select at least 2 types to compare
                </div>
            )}

            {/* Comparison table */}
            {selectedSpaces.length >= 2 && (
                <div className="border border-lime-500/20 overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-lime-500/10">
                                <th className="text-left p-2 text-lime-200/40 font-normal">Dimension</th>
                                {selectedSpaces.map((space, i) => (
                                    <th
                                        key={space.id}
                                        className="text-center p-2 font-mono font-bold"
                                        style={{ color: COMPARE_COLORS[i] }}
                                    >
                                        {space.id}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {DIMENSION_KEYS.map((key) => (
                                <tr key={key} className="border-b border-lime-500/5">
                                    <td className="p-2 text-lime-200/60">{DIMENSION_LABELS[key].label}</td>
                                    {selectedSpaces.map((space, i) => (
                                        <td key={space.id} className="text-center p-2">
                                            <span style={{ color: COMPARE_COLORS[i] }}>
                                                {space.scores[key]}
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}


// ── Classify View ────────────────────────────────────────────────

function ClassifyView({ params, onParamsChange }: ViewProps) {
    const ranked = useMemo(
        () => rankSpaces(params.classifyProfile, STATE_SPACES),
        [params.classifyProfile],
    );

    const activeCase = params.classifyPreset
        ? SAMPLE_CASES.find((c) => c.name === params.classifyPreset) ?? null
        : null;

    const radarData = DIMENSION_KEYS.map((key) => ({
        dimension: DIMENSION_LABELS[key].label,
        value: params.classifyProfile[key],
    }));

    return (
        <div className="space-y-6">
            {/* Active case description */}
            {activeCase && (
                <div className="border border-lime-500/20 bg-lime-500/5 p-3">
                    <div className="text-lime-400 text-sm font-medium">{activeCase.name}</div>
                    <p className="text-lime-200/60 text-xs mt-1 leading-relaxed">{activeCase.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                        {activeCase.types.map((t) => (
                            <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 border border-lime-500/20 text-lime-400">
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Small radar of profile */}
            <div className="border border-lime-500/20 bg-black/40 p-4">
                <div className="text-lime-200/40 text-[10px] uppercase tracking-wider mb-2">Your Profile</div>
                <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer width="100%" height={280} minWidth={0}>
                        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="65%">
                            <PolarGrid stroke="#333" />
                            <PolarAngleAxis dataKey="dimension" tick={{ fill: '#84cc16', fontSize: 9 }} />
                            <PolarRadiusAxis tick={{ fill: '#666', fontSize: 9 }} domain={[0, 4]} tickCount={5} />
                            <Radar
                                name="Profile"
                                dataKey="value"
                                stroke="#84cc16"
                                fill="#84cc16"
                                fillOpacity={0.2}
                                strokeWidth={2}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Ranked matches */}
            <div>
                <div className="text-lime-200/40 text-[10px] uppercase tracking-wider mb-2">Best Matches</div>
                <div className="space-y-1">
                    {ranked.slice(0, 8).map(({ space, score, rank }) => {
                        const pct = similarityPercent(score);
                        return (
                            <button
                                key={space.id}
                                onClick={() =>
                                    onParamsChange({
                                        ...params,
                                        viewMode: 'table',
                                        selectedId: space.id,
                                    })
                                }
                                className="w-full flex items-center gap-3 p-2 border border-lime-500/10 hover:border-lime-500/30 transition-colors cursor-pointer text-left"
                            >
                                <span className="text-lime-200/30 text-[10px] w-4">{rank}</span>
                                <span
                                    className="text-sm font-mono font-bold w-8"
                                    style={{ color: FAMILY_COLORS[space.family] }}
                                >
                                    {space.id}
                                </span>
                                <span className="text-lime-100 text-xs flex-1">{space.name}</span>
                                <div className="w-16 h-1.5 bg-white/5">
                                    <div
                                        className="h-full bg-lime-500"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <span className="text-lime-400 text-[10px] w-8 text-right">{pct}%</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}


// ── Ladder View ──────────────────────────────────────────────────

function LadderView({ params }: ViewProps) {
    const levelColors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];

    return (
        <div className="space-y-8">
            {/* Ladder columns */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {LADDER_LEVELS.map((level, li) => {
                    const spaces = level.ids
                        .map((id) => STATE_SPACES.find((s) => s.id === id))
                        .filter(Boolean) as StateSpace[];

                    return (
                        <div key={level.key} className="border border-lime-500/10 p-3">
                            <div className="flex items-center gap-2 mb-3">
                                <div
                                    className="w-2 h-2"
                                    style={{ backgroundColor: levelColors[li] }}
                                />
                                <div
                                    className="text-sm font-medium"
                                    style={{ color: levelColors[li] }}
                                >
                                    {level.label}
                                </div>
                            </div>
                            <p className="text-lime-200/40 text-[10px] leading-relaxed mb-3">
                                {level.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {spaces.map((space) => (
                                    <div
                                        key={space.id}
                                        className="border px-1.5 py-1 text-center"
                                        style={{
                                            borderColor: `${FAMILY_COLORS[space.family]}40`,
                                            borderLeftWidth: 2,
                                            borderLeftColor: FAMILY_COLORS[space.family],
                                        }}
                                    >
                                        <div
                                            className="text-xs font-mono font-bold"
                                            style={{ color: FAMILY_COLORS[space.family] }}
                                        >
                                            {space.id}
                                        </div>
                                        <div className="text-[8px] text-lime-200/40 leading-tight">
                                            {space.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Progression arrows */}
            <div className="flex items-center justify-center gap-2 text-lime-200/30 text-xs">
                <span style={{ color: levelColors[0] }}>Fixed</span>
                <span>→</span>
                <span style={{ color: levelColors[1] }}>Adaptive</span>
                <span>→</span>
                <span style={{ color: levelColors[2] }}>Endogenous</span>
                <span>→</span>
                <span style={{ color: levelColors[3] }}>Reflexive</span>
            </div>

            {/* Sample cases on the ladder */}
            <div>
                <div className="text-lime-200/40 text-[10px] uppercase tracking-wider mb-3">
                    Sample Cases on the Ladder
                </div>
                <div className="space-y-1.5">
                    {SAMPLE_CASES.map((c) => {
                        const maxLevel = Math.max(
                            0,
                            ...c.types.map((tid) => {
                                for (let i = LADDER_LEVELS.length - 1; i >= 0; i--) {
                                    if (LADDER_LEVELS[i].ids.includes(tid)) return i;
                                }
                                return 0;
                            }),
                        );

                        return (
                            <div
                                key={c.name}
                                className="flex items-center gap-3 p-2 border border-lime-500/10"
                            >
                                <div
                                    className="w-2 h-2 shrink-0"
                                    style={{ backgroundColor: levelColors[maxLevel] }}
                                />
                                <span className="text-lime-100 text-xs w-40 shrink-0">{c.name}</span>
                                <div className="flex-1 h-1 bg-white/5 relative">
                                    <div
                                        className="h-full"
                                        style={{
                                            width: `${((maxLevel + 1) / 4) * 100}%`,
                                            backgroundColor: levelColors[maxLevel],
                                            opacity: 0.6,
                                        }}
                                    />
                                </div>
                                <span
                                    className="text-[10px] w-20 text-right"
                                    style={{ color: levelColors[maxLevel] }}
                                >
                                    {LADDER_LEVELS[maxLevel].label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Level descriptions */}
            <div className="space-y-4">
                {LADDER_LEVELS.map((level, li) => (
                    <div key={level.key} className="border-l-2 pl-4" style={{ borderColor: levelColors[li] }}>
                        <div className="text-sm font-medium" style={{ color: levelColors[li] }}>
                            {level.label}
                        </div>
                        <p className="text-lime-200/50 text-xs leading-relaxed mt-1">
                            {level.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}


// ── Main Viewer ──────────────────────────────────────────────────

interface ViewProps {
    params: Params;
    onParamsChange: (p: Params) => void;
}

export default function Viewer({ params, onParamsChange }: ViewProps) {
    return (
        <div className="w-[90vw] h-[90vh] overflow-y-auto outline-none [&_*]:outline-none p-4">
            {/* View mode tabs */}
            <div className="flex items-center gap-1 mb-6">
                {(['table', 'compare', 'classify', 'ladder'] as const).map((mode) => (
                    <button
                        key={mode}
                        onClick={() => onParamsChange({ ...params, viewMode: mode })}
                        className={`px-4 py-1.5 text-xs transition-colors cursor-pointer border ${
                            params.viewMode === mode
                                ? 'bg-lime-500/20 text-lime-400 border-lime-500'
                                : 'bg-black/40 text-lime-200/60 border-lime-500/10 hover:border-lime-500/30'
                        }`}
                    >
                        {mode}
                    </button>
                ))}
            </div>

            {params.viewMode === 'table' && (
                <TableView params={params} onParamsChange={onParamsChange} />
            )}
            {params.viewMode === 'compare' && (
                <CompareView params={params} onParamsChange={onParamsChange} />
            )}
            {params.viewMode === 'classify' && (
                <ClassifyView params={params} onParamsChange={onParamsChange} />
            )}
            {params.viewMode === 'ladder' && (
                <LadderView params={params} onParamsChange={onParamsChange} />
            )}
        </div>
    );
}
