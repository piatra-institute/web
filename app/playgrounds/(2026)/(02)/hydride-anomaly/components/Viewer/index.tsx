'use client';

import { useMemo } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    ScatterChart,
    Scatter,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceLine,
    Cell,
} from 'recharts';

import {
    type Property,
    type Unit,
    type FamilyId,
    type XAxis as XAxisType,
    type ViewMode,
    type AnomalyResult,
    type Substance,
    SUBSTANCES,
    FAMILIES,
    FAMILY_MAP,
    PROPERTY_MAP,
    VIEW_MODES,
    classifyPhase,
    PHASE_COLORS,
    computeFamilyTrendLine,
    linearFit,
    fmt,
} from '../../logic';

interface ViewerProps {
    property: Property;
    unit: Unit;
    xAxis: XAxisType;
    viewMode: ViewMode;
    onViewModeChange: (m: ViewMode) => void;
    enabledFamilies: Set<FamilyId>;
    anomalies: AnomalyResult[];
    ambientC: number;
    showTrendLines: boolean;
    pinnedSubstances: Set<string>;
    onTogglePin: (id: string) => void;
}

const TOOLTIP_STYLE = {
    contentStyle: {
        backgroundColor: '#000',
        border: '1px solid #333',
        borderRadius: 0,
        fontSize: 12,
    },
    labelStyle: { color: '#84cc16' },
};

export default function Viewer({
    property,
    unit,
    xAxis,
    viewMode,
    onViewModeChange,
    enabledFamilies,
    anomalies,
    ambientC,
    showTrendLines,
    pinnedSubstances,
    onTogglePin,
}: ViewerProps) {
    const propMeta = PROPERTY_MAP[property];
    const unitLabel = property === 'dhVap' || property === 'dhFus'
        ? propMeta.unitC
        : unit === 'K' ? propMeta.unitK : propMeta.unitC;

    // Visible substances
    const visibleSubstances = useMemo(() => {
        return SUBSTANCES.filter((s) => enabledFamilies.has(s.familyId));
    }, [enabledFamilies]);

    // ── Series view data ──────────────────────────────────────────
    const familyScatterData = useMemo(() => {
        const result: Record<string, Array<{ x: number; y: number; formula: string; name: string; isAnomaly: boolean }>> = {};
        for (const fam of FAMILIES) {
            if (!enabledFamilies.has(fam.id)) continue;
            result[fam.id] = [];
            for (const s of SUBSTANCES) {
                if (s.familyId !== fam.id) continue;
                const xVal = xAxis === 'period' ? s.period : s.molarMass;
                const yVal = propMeta.getValue(s, unit);
                result[fam.id].push({ x: xVal, y: yVal, formula: s.formula, name: s.name, isAnomaly: s.isAnomaly });
            }
            result[fam.id].sort((a, b) => a.x - b.x);
        }
        return result;
    }, [enabledFamilies, xAxis, propMeta, unit]);

    const trendData = useMemo(() => {
        if (!showTrendLines || xAxis !== 'period') return {};
        const result: Record<string, Array<{ x: number; y: number }>> = {};
        for (const fam of FAMILIES) {
            if (!enabledFamilies.has(fam.id) || fam.id === 'nobleGas' || fam.id === 'alkane' || fam.id === 'alcohol' || fam.id === 'diatomic') continue;
            const tl = computeFamilyTrendLine(fam.id, property, unit);
            if (tl.length > 0) {
                result[fam.id] = tl.map((p) => ({ x: p.period, y: p.predicted }));
            }
        }
        return result;
    }, [showTrendLines, xAxis, enabledFamilies, property, unit]);

    const combinedData = useMemo(() => {
        const allX = new Set<number>();
        for (const fam of Object.values(familyScatterData)) {
            for (const p of fam) allX.add(p.x);
        }
        for (const tl of Object.values(trendData)) {
            for (const p of tl) allX.add(p.x);
        }
        const sorted = Array.from(allX).sort((a, b) => a - b);
        return sorted.map((xVal) => {
            const entry: Record<string, number | string | undefined> = { x: xVal };
            for (const [famId, points] of Object.entries(familyScatterData)) {
                const pt = points.find((p) => p.x === xVal);
                if (pt) {
                    entry[famId] = pt.y;
                    entry[`${famId}_formula`] = pt.formula;
                }
            }
            for (const [famId, points] of Object.entries(trendData)) {
                const pt = points.find((p) => p.x === xVal);
                if (pt) {
                    entry[`${famId}_trend`] = pt.y;
                }
            }
            return entry;
        });
    }, [familyScatterData, trendData]);

    // ── Scatter view data ─────────────────────────────────────────
    const scatterData = useMemo(() => {
        return visibleSubstances.map((s) => ({
            id: s.id,
            formula: s.formula,
            name: s.name,
            mp: unit === 'K' ? s.mpC + 273.15 : s.mpC,
            bp: unit === 'K' ? s.bpC + 273.15 : s.bpC,
            molarMass: s.molarMass,
            familyId: s.familyId,
            color: FAMILY_MAP[s.familyId].color,
            isPinned: pinnedSubstances.has(s.id),
            isAnomaly: s.isAnomaly,
        }));
    }, [visibleSubstances, unit, pinnedSubstances]);

    const scatterRegression = useMemo(() => {
        // Direct linear fit of bp vs mp on non-H-bonding substances
        const fitPts = visibleSubstances
            .filter((s) => !s.isAnomaly && !s.tags.includes('H-bond donor'))
            .map((s) => ({
                x: unit === 'K' ? s.mpC + 273.15 : s.mpC,
                y: unit === 'K' ? s.bpC + 273.15 : s.bpC,
            }));
        if (fitPts.length < 2) return null;
        const { slope, intercept } = linearFit(fitPts);
        const allMp = visibleSubstances.map((s) => unit === 'K' ? s.mpC + 273.15 : s.mpC);
        const minMp = Math.min(...allMp);
        const maxMp = Math.max(...allMp);
        return {
            start: { x: minMp, y: slope * minMp + intercept },
            end: { x: maxMp, y: slope * maxMp + intercept },
        };
    }, [visibleSubstances, unit]);

    // ── Outlier view data ─────────────────────────────────────────
    const barData = useMemo(() => {
        return anomalies.map((a) => ({
            formula: a.substance.formula,
            name: a.substance.name,
            residual: a.residual,
            residualPct: a.residualPct,
            observed: a.observed,
            predicted: a.predicted,
            color: FAMILY_MAP[a.substance.familyId].color,
        }));
    }, [anomalies]);

    // ── Phase view data ───────────────────────────────────────────
    const phaseLensData = useMemo(() => {
        const phaseOrder = { solid: 0, liquid: 1, gas: 2 };
        return visibleSubstances
            .map((s) => {
                const phase = classifyPhase(s, ambientC);
                return { ...s, phase, phaseColor: PHASE_COLORS[phase] };
            })
            .sort((a, b) => phaseOrder[a.phase] - phaseOrder[b.phase]);
    }, [visibleSubstances, ambientC]);

    const phaseCounts = useMemo(() => {
        const counts = { solid: 0, liquid: 0, gas: 0 };
        for (const s of phaseLensData) counts[s.phase]++;
        return counts;
    }, [phaseLensData]);

    // ── Custom dot for series ─────────────────────────────────────
    const renderDot = (famId: string, color: string) => {
        return (props: Record<string, unknown>) => {
            const { cx, cy, payload } = props as { cx: number; cy: number; payload: Record<string, unknown> };
            if (cx == null || cy == null) return null;
            const formula = payload?.[`${famId}_formula`] as string | undefined;
            return (
                <g>
                    <circle cx={cx} cy={cy} r={4} fill={color} stroke="#000" strokeWidth={1} />
                    {formula && (
                        <text x={cx} y={cy - 10} textAnchor="middle" fill={color} fontSize={10} fontWeight="bold">
                            {formula}
                        </text>
                    )}
                </g>
            );
        };
    };

    const xLabel = xAxis === 'period' ? 'Period' : 'Molar mass (g/mol)';

    // ── Substance pinboard ────────────────────────────────────────
    const renderPinboard = () => {
        const grouped: Record<string, Substance[]> = {};
        for (const s of visibleSubstances) {
            if (!grouped[s.familyId]) grouped[s.familyId] = [];
            grouped[s.familyId].push(s);
        }

        return (
            <div className="bg-black/40 border border-lime-500/25 p-3 mb-4">
                <div className="text-lime-200/70 text-[10px] uppercase tracking-wider mb-2">
                    Click to pin / unpin substances
                </div>
                <div className="flex flex-wrap gap-3">
                    {FAMILIES.filter((f) => enabledFamilies.has(f.id)).map((fam) => (
                        <div key={fam.id}>
                            <div className="text-[10px] mb-1" style={{ color: fam.color }}>{fam.shortLabel}</div>
                            <div className="flex flex-wrap gap-1">
                                {(grouped[fam.id] ?? []).map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => onTogglePin(s.id)}
                                        className={`px-1.5 py-0.5 text-[10px] font-mono transition-colors cursor-pointer border ${
                                            pinnedSubstances.has(s.id)
                                                ? 'border-lime-500 text-lime-400 bg-lime-500/15'
                                                : 'border-lime-500/20 text-lime-200/50 hover:border-lime-500/50'
                                        }`}
                                    >
                                        {s.formula}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // ── Series view ───────────────────────────────────────────────
    const renderSeries = () => (
        <>
            <div className="text-center mb-1">
                <h2 className="text-lime-400 text-sm font-semibold">
                    {propMeta.label} ({unitLabel}) vs {xLabel}
                </h2>
            </div>
            <div className="bg-black/40 border border-lime-500/25 p-2">
                <ResponsiveContainer width="100%" height={380} minWidth={0}>
                    <LineChart data={combinedData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis
                            dataKey="x"
                            type="number"
                            domain={xAxis === 'period' ? [0.5, 5.5] : ['auto', 'auto']}
                            tickFormatter={(v: number) => xAxis === 'period' ? String(v) : fmt(v, 0)}
                            stroke="#666"
                            tick={{ fill: '#888', fontSize: 10 }}
                            label={{ value: xLabel, position: 'insideBottom', offset: -5, fill: '#666', fontSize: 11 }}
                        />
                        <YAxis
                            stroke="#666"
                            tick={{ fill: '#888', fontSize: 10 }}
                            tickFormatter={(v: number) => fmt(v, 1)}
                            label={{ value: `${propMeta.label} (${unitLabel})`, angle: -90, position: 'insideLeft', offset: 10, fill: '#666', fontSize: 11 }}
                        />
                        <Tooltip
                            {...TOOLTIP_STYLE}
                            formatter={(value, name) => {
                                const clean = String(name).replace('_trend', ' (trend)');
                                return [fmt(Number(value), 2), clean];
                            }}
                            labelFormatter={(label) => `${xLabel}: ${xAxis === 'period' ? label : fmt(Number(label), 1)}`}
                        />
                        <Legend wrapperStyle={{ fontSize: 11, color: '#84cc16' }} />

                        {FAMILIES.filter((f) => enabledFamilies.has(f.id)).map((f) => (
                            <Line
                                key={f.id}
                                type="monotone"
                                dataKey={f.id}
                                name={f.shortLabel}
                                stroke={f.color}
                                strokeWidth={2}
                                dot={renderDot(f.id, f.color)}
                                connectNulls
                                isAnimationActive={false}
                            />
                        ))}

                        {showTrendLines && xAxis === 'period' && FAMILIES
                            .filter((f) => enabledFamilies.has(f.id) && f.id !== 'nobleGas' && f.id !== 'alkane' && f.id !== 'alcohol' && f.id !== 'diatomic')
                            .map((f) => (
                                <Line
                                    key={`${f.id}_trend`}
                                    type="monotone"
                                    dataKey={`${f.id}_trend`}
                                    name={`${f.shortLabel} trend`}
                                    stroke={f.color}
                                    strokeWidth={1}
                                    strokeDasharray="6 3"
                                    dot={false}
                                    connectNulls
                                    isAnimationActive={false}
                                />
                            ))}

                        {(property === 'bp' || property === 'mp') && (
                            <ReferenceLine
                                y={unit === 'K' ? ambientC + 273.15 : ambientC}
                                stroke="#84cc16"
                                strokeDasharray="4 4"
                                label={{ value: `${ambientC}°C`, position: 'right', fill: '#84cc16', fontSize: 10 }}
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </>
    );

    // ── Scatter view ──────────────────────────────────────────────
    const renderScatter = () => {
        const tempUnit = unit === 'K' ? 'K' : '°C';
        return (
            <>
                <div className="text-center mb-1">
                    <h2 className="text-lime-400 text-sm font-semibold">
                        Melting point vs Boiling point ({tempUnit})
                    </h2>
                    <p className="text-xs text-lime-200/50">dashed line: bp ~ ln(M) fit on non-H-bonding substances</p>
                </div>
                <div className="bg-black/40 border border-lime-500/25 p-2">
                    <ResponsiveContainer width="100%" height={380} minWidth={0}>
                        <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis
                                type="number"
                                dataKey="mp"
                                name={`mp (${tempUnit})`}
                                stroke="#666"
                                tick={{ fill: '#888', fontSize: 10 }}
                                tickFormatter={(v: number) => fmt(v, 0)}
                                label={{ value: `Melting point (${tempUnit})`, position: 'insideBottom', offset: -5, fill: '#666', fontSize: 11 }}
                            />
                            <YAxis
                                type="number"
                                dataKey="bp"
                                name={`bp (${tempUnit})`}
                                stroke="#666"
                                tick={{ fill: '#888', fontSize: 10 }}
                                tickFormatter={(v: number) => fmt(v, 0)}
                                label={{ value: `Boiling point (${tempUnit})`, angle: -90, position: 'insideLeft', offset: 10, fill: '#666', fontSize: 11 }}
                            />
                            <Tooltip
                                {...TOOLTIP_STYLE}
                                formatter={(value) => [fmt(Number(value), 1), '']}
                                labelFormatter={() => ''}
                                content={({ payload }) => {
                                    if (!payload || payload.length === 0) return null;
                                    const d = payload[0]?.payload as typeof scatterData[0] | undefined;
                                    if (!d) return null;
                                    return (
                                        <div className="bg-black border border-lime-500/30 p-2 text-xs">
                                            <div className="text-lime-400 font-bold">{d.formula}</div>
                                            <div className="text-lime-200/70">{d.name}</div>
                                            <div className="text-lime-200/60 mt-1">mp: {fmt(d.mp, 1)} {tempUnit}</div>
                                            <div className="text-lime-200/60">bp: {fmt(d.bp, 1)} {tempUnit}</div>
                                            <div className="text-lime-200/60">M: {fmt(d.molarMass, 1)} g/mol</div>
                                        </div>
                                    );
                                }}
                            />
                            {scatterRegression && (
                                <ReferenceLine
                                    segment={[scatterRegression.start, scatterRegression.end]}
                                    stroke="#84cc16"
                                    strokeDasharray="4 4"
                                    strokeWidth={1}
                                />
                            )}
                            {FAMILIES.filter((f) => enabledFamilies.has(f.id)).map((fam) => (
                                <Scatter
                                    key={fam.id}
                                    name={fam.shortLabel}
                                    data={scatterData.filter((d) => d.familyId === fam.id)}
                                    fill={fam.color}
                                    isAnimationActive={false}
                                >
                                    {scatterData.filter((d) => d.familyId === fam.id).map((d, i) => (
                                        <Cell
                                            key={i}
                                            fill={fam.color}
                                            stroke={d.isPinned ? '#84cc16' : 'none'}
                                            strokeWidth={d.isPinned ? 2 : 0}
                                            r={d.isPinned || d.isAnomaly ? 6 : 4}
                                            onClick={() => onTogglePin(d.id)}
                                            cursor="pointer"
                                        />
                                    ))}
                                </Scatter>
                            ))}
                            <Legend wrapperStyle={{ fontSize: 11, color: '#84cc16' }} />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </>
        );
    };

    // ── Outlier view ──────────────────────────────────────────────
    const renderOutlier = () => (
        <>
            <div className="text-center mb-1">
                <h2 className="text-lime-400 text-sm font-semibold">
                    Period-2 anomaly residuals ({propMeta.label})
                </h2>
                <p className="text-xs text-lime-200/50">
                    observed - predicted from periods 3-5 linear trend
                </p>
            </div>

            {barData.length > 0 ? (
                <>
                    <div className="bg-black/40 border border-lime-500/25 p-2">
                        <ResponsiveContainer width="100%" height={220} minWidth={0}>
                            <BarChart data={barData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="formula" stroke="#666" tick={{ fill: '#888', fontSize: 11 }} />
                                <YAxis
                                    stroke="#666"
                                    tick={{ fill: '#888', fontSize: 10 }}
                                    tickFormatter={(v: number) => fmt(v, 1)}
                                    label={{ value: `Residual (${unitLabel})`, angle: -90, position: 'insideLeft', offset: 10, fill: '#666', fontSize: 11 }}
                                />
                                <Tooltip
                                    {...TOOLTIP_STYLE}
                                    formatter={(value, _name, entry) => {
                                        const pct = (entry as { payload: { residualPct: number } }).payload.residualPct;
                                        return [`${fmt(Number(value), 2)} (${fmt(pct, 1)}%)`, 'Residual'];
                                    }}
                                />
                                <ReferenceLine y={0} stroke="#666" />
                                <Bar dataKey="residual" isAnimationActive={false}>
                                    {barData.map((entry, idx) => (
                                        <Cell key={idx} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Ranking table */}
                    <div className="bg-black/40 border border-lime-500/25 p-3 mt-3 overflow-x-auto">
                        <div className="text-lime-200/70 text-[10px] uppercase tracking-wider mb-2">Anomaly ranking</div>
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-lime-200/70 border-b border-lime-500/20">
                                    <th className="text-left py-1 px-2">#</th>
                                    <th className="text-left py-1 px-2">Formula</th>
                                    <th className="text-left py-1 px-2">Name</th>
                                    <th className="text-right py-1 px-2">Observed</th>
                                    <th className="text-right py-1 px-2">Predicted</th>
                                    <th className="text-right py-1 px-2">Residual</th>
                                    <th className="text-right py-1 px-2">%</th>
                                </tr>
                            </thead>
                            <tbody>
                                {barData.map((d, i) => (
                                    <tr key={i} className="border-b border-lime-500/10">
                                        <td className="py-1 px-2 text-lime-200/40">{i + 1}</td>
                                        <td className="py-1 px-2 font-mono" style={{ color: d.color }}>{d.formula}</td>
                                        <td className="py-1 px-2 text-lime-200/60">{d.name}</td>
                                        <td className="py-1 px-2 text-right font-mono text-lime-200/80">{fmt(d.observed, 1)}</td>
                                        <td className="py-1 px-2 text-right font-mono text-lime-200/80">{fmt(d.predicted, 1)}</td>
                                        <td className="py-1 px-2 text-right font-mono text-lime-400">{fmt(d.residual, 1)}</td>
                                        <td className="py-1 px-2 text-right font-mono text-lime-200/60">{fmt(d.residualPct, 1)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="bg-black/40 border border-lime-500/25 p-6 text-center text-lime-200/50 text-sm">
                    Enable hydride families (Group 14-17) to see period-2 anomaly residuals.
                </div>
            )}
        </>
    );

    // ── Phase view ────────────────────────────────────────────────
    const renderPhase = () => (
        <>
            <div className="text-center mb-1">
                <h2 className="text-lime-400 text-sm font-semibold">
                    Phase at {ambientC}°C, 1 atm
                </h2>
            </div>

            {/* Phase summary bar */}
            <div className="flex gap-4 justify-center mb-3">
                {(['solid', 'liquid', 'gas'] as const).map((p) => (
                    <div key={p} className="flex items-center gap-1.5">
                        <div className="w-3 h-3" style={{ backgroundColor: PHASE_COLORS[p] }} />
                        <span className="text-xs text-lime-200/70">{p}</span>
                        <span className="text-xs font-mono text-lime-400">{phaseCounts[p]}</span>
                    </div>
                ))}
            </div>

            {/* Phase strip: visual bar showing proportion */}
            <div className="flex h-6 mb-4 border border-lime-500/25 overflow-hidden">
                {(['solid', 'liquid', 'gas'] as const).map((p) => {
                    const pct = phaseLensData.length > 0 ? (phaseCounts[p] / phaseLensData.length) * 100 : 0;
                    if (pct === 0) return null;
                    return (
                        <div
                            key={p}
                            className="flex items-center justify-center text-[10px] font-semibold text-black"
                            style={{ width: `${pct}%`, backgroundColor: PHASE_COLORS[p] }}
                        >
                            {pct > 10 ? `${p} ${Math.round(pct)}%` : ''}
                        </div>
                    );
                })}
            </div>

            {/* Phase table */}
            <div className="bg-black/40 border border-lime-500/25 p-3 overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="text-lime-200/70 border-b border-lime-500/20">
                            <th className="text-center py-1 px-2">Phase</th>
                            <th className="text-left py-1 px-2">Formula</th>
                            <th className="text-left py-1 px-2">Name</th>
                            <th className="text-left py-1 px-2">Family</th>
                            <th className="text-right py-1 px-2">mp (°C)</th>
                            <th className="text-right py-1 px-2">bp (°C)</th>
                            <th className="text-right py-1 px-2">Liquid range</th>
                        </tr>
                    </thead>
                    <tbody>
                        {phaseLensData.map((s) => (
                            <tr
                                key={s.id}
                                className={`border-b border-lime-500/10 cursor-pointer transition-colors ${
                                    pinnedSubstances.has(s.id) ? 'bg-lime-500/10' : 'hover:bg-lime-500/5'
                                }`}
                                onClick={() => onTogglePin(s.id)}
                            >
                                <td className="py-1 px-2 text-center">
                                    <span
                                        className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase"
                                        style={{ color: s.phaseColor, border: `1px solid ${s.phaseColor}` }}
                                    >
                                        {s.phase}
                                    </span>
                                </td>
                                <td className="py-1 px-2 font-mono" style={{ color: FAMILY_MAP[s.familyId].color }}>
                                    {s.formula}
                                    {pinnedSubstances.has(s.id) && <span className="text-lime-400 ml-1">*</span>}
                                </td>
                                <td className="py-1 px-2 text-lime-200/60">{s.name}</td>
                                <td className="py-1 px-2 text-lime-200/40">{FAMILY_MAP[s.familyId].shortLabel}</td>
                                <td className="py-1 px-2 text-right font-mono text-lime-200/80">{fmt(s.mpC, 1)}</td>
                                <td className="py-1 px-2 text-right font-mono text-lime-200/80">{fmt(s.bpC, 1)}</td>
                                <td className="py-1 px-2 text-right font-mono text-lime-200/80">{fmt(s.bpC - s.mpC, 1)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );

    // ── Pinned comparison table ───────────────────────────────────
    const renderPinnedComparison = () => {
        const pinned = SUBSTANCES.filter((s) => pinnedSubstances.has(s.id));
        if (pinned.length === 0) return null;

        return (
            <div className="bg-black/40 border border-lime-500/25 p-3 mt-4 overflow-x-auto">
                <div className="text-lime-200/70 text-[10px] uppercase tracking-wider mb-2">Pinned comparison</div>
                <table className="w-full text-xs">
                    <thead>
                        <tr className="text-lime-200/70 border-b border-lime-500/20">
                            <th className="text-left py-1 px-2">Formula</th>
                            <th className="text-right py-1 px-2">M (g/mol)</th>
                            <th className="text-right py-1 px-2">mp (°C)</th>
                            <th className="text-right py-1 px-2">bp (°C)</th>
                            <th className="text-right py-1 px-2">ΔHvap</th>
                            <th className="text-right py-1 px-2">ΔHfus</th>
                            <th className="text-right py-1 px-2">Liq. range</th>
                            <th className="text-center py-1 px-2">Tags</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pinned.map((s) => (
                            <tr
                                key={s.id}
                                className="border-b border-lime-500/10 cursor-pointer hover:bg-lime-500/5"
                                onClick={() => onTogglePin(s.id)}
                            >
                                <td className="py-1 px-2 font-mono" style={{ color: FAMILY_MAP[s.familyId].color }}>{s.formula}</td>
                                <td className="py-1 px-2 text-right font-mono text-lime-200/80">{fmt(s.molarMass, 1)}</td>
                                <td className="py-1 px-2 text-right font-mono text-lime-200/80">{fmt(s.mpC, 1)}</td>
                                <td className="py-1 px-2 text-right font-mono text-lime-200/80">{fmt(s.bpC, 1)}</td>
                                <td className="py-1 px-2 text-right font-mono text-lime-200/80">{fmt(s.dhVap, 2)}</td>
                                <td className="py-1 px-2 text-right font-mono text-lime-200/80">{fmt(s.dhFus, 2)}</td>
                                <td className="py-1 px-2 text-right font-mono text-lime-200/80">{fmt(s.bpC - s.mpC, 1)}</td>
                                <td className="py-1 px-2 text-center">
                                    <div className="flex flex-wrap gap-0.5 justify-center">
                                        {s.tags.map((t) => (
                                            <span key={t} className="text-[9px] px-1 py-0.5 border border-lime-500/20 text-lime-200/50">{t}</span>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="w-[90vw] h-[90vh] flex flex-col gap-3 p-4 overflow-auto text-lime-100 outline-none [&_*]:outline-none">
            {/* View mode tabs */}
            <div className="flex gap-1 justify-center flex-wrap">
                {VIEW_MODES.map((vm) => (
                    <button
                        key={vm.key}
                        onClick={() => onViewModeChange(vm.key)}
                        className={`px-4 py-1.5 text-xs transition-colors cursor-pointer ${
                            viewMode === vm.key
                                ? 'bg-lime-500/20 text-lime-400 border border-lime-500'
                                : 'bg-black/40 text-lime-200/60 border border-lime-500/20 hover:border-lime-500/50'
                        }`}
                    >
                        {vm.label}
                    </button>
                ))}
            </div>

            {/* Substance pinboard */}
            {renderPinboard()}

            {/* Active view */}
            {viewMode === 'series' && renderSeries()}
            {viewMode === 'scatter' && renderScatter()}
            {viewMode === 'outlier' && renderOutlier()}
            {viewMode === 'phase' && renderPhase()}

            {/* Pinned comparison (always visible when there are pins) */}
            {renderPinnedComparison()}
        </div>
    );
}
