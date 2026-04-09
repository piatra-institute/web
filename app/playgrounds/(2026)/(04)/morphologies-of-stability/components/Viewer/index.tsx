'use client';

import { useMemo, useState } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts';

import AssumptionPanel, { Assumption } from '@/components/AssumptionPanel';
import SensitivityAnalysis, { SensitivityBar } from '@/components/SensitivityAnalysis';
import VersionSelector, { ModelVersion } from '@/components/VersionSelector';

import {
    Params,
    Metrics,
    SimulationState,
    Snapshot,
    SweepableParam,
    SweepDatum,
    PatternType,
    PATTERN_META,
    pathFromValues,
    pathFromPoints,
    getRelevantParamSpecs,
} from '../../logic';


interface ViewerProps {
    params: Params;
    simState: SimulationState;
    metrics: Metrics;
    sweep: SweepDatum[];
    sensitivityBars: SensitivityBar[];
    assumptions: Assumption[];
    versions: ModelVersion[];
    snapshot: Snapshot | null;
    sweepParam: SweepableParam;
    onSweepParamChange: (key: SweepableParam) => void;
}


// ── Summary Card ───────────────────────────────────────────────

function SummaryCard({ label, value, unit }: { label: string; value: string; unit?: string }) {
    return (
        <div className="border border-lime-500/20 p-3">
            <div className="text-xs text-lime-200/50 uppercase tracking-wider">{label}</div>
            <div className="mt-1 font-mono text-lg text-lime-400">
                {value}
                {unit && <span className="text-xs text-lime-200/40 ml-1">{unit}</span>}
            </div>
        </div>
    );
}


// ── Phase Visualizations ────────────────────────────────────────

function PointAttractorView({ simState, params }: { simState: SimulationState; params: Params }) {
    const s = simState.point;
    const W = 680;
    const H = 200;
    const histH = 180;

    const xPos = 32 + ((s.x + 2) / 4) * (W - 64);
    const targetPos = 32 + ((params.pointTarget + 2) / 4) * (W - 64);

    const arrows = Array.from({ length: 13 }, (_, i) => -1.8 + i * 0.3);
    const historyPath = pathFromValues(s.history, { width: W, height: histH, minY: -2, maxY: 2 });

    return (
        <div className="space-y-4">
            <div>
                <div className="text-xs text-lime-200/50 mb-2">State line — restoring flow toward target</div>
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: '#0a0a0a' }}>
                    <line x1="32" y1="100" x2={W - 32} y2="100" stroke="rgb(132 204 22)" strokeWidth="1" strokeOpacity="0.2" />
                    {arrows.map((a, idx) => {
                        const pos = 32 + ((a + 2) / 4) * (W - 64);
                        const dir = a > params.pointTarget ? -1 : 1;
                        return (
                            <g key={idx} transform={`translate(${pos}, 100)`} opacity="0.5">
                                <line x1={-8 * dir} y1="0" x2={8 * dir} y2="0" stroke="rgb(132 204 22)" strokeWidth="1" />
                                <path d={`M ${8 * dir} 0 L ${4 * dir} -3 L ${4 * dir} 3 Z`} fill="rgb(132 204 22)" />
                            </g>
                        );
                    })}
                    <line x1={targetPos} y1="50" x2={targetPos} y2="150" stroke="rgb(163 230 53)" strokeDasharray="5 7" strokeOpacity="0.6" />
                    <circle cx={xPos} cy="100" r="9" fill="rgb(163 230 53)" />
                    <text x={targetPos + 8} y="62" fill="rgb(132 204 22)" fontSize="11" opacity="0.7">x*</text>
                    <text x={xPos + 12} y="118" fill="rgb(163 230 53)" fontSize="11">x</text>
                </svg>
            </div>
            <div>
                <div className="text-xs text-lime-200/50 mb-2">History — error decay over time</div>
                <svg viewBox={`0 0 ${W} ${histH}`} className="w-full" style={{ background: '#0a0a0a' }}>
                    <line x1="16" y1={histH / 2} x2={W - 16} y2={histH / 2} stroke="rgb(132 204 22)" strokeDasharray="6 6" strokeOpacity="0.2" />
                    <path d={historyPath} fill="none" stroke="rgb(163 230 53)" strokeWidth="2" />
                </svg>
            </div>
        </div>
    );
}


function BistableView({ simState, params }: { simState: SimulationState; params: Params }) {
    const s = simState.bistable;
    const W = 680;
    const H = 220;
    const histH = 180;

    const xs = Array.from({ length: 180 }, (_, i) => -2 + (i / 179) * 4);
    const V = (x: number) => params.bistableStiffness * (x * x - 1) ** 2 + params.bistableTilt * x;
    const potentials = xs.map(V);
    const minV = Math.min(...potentials);
    const maxV = Math.max(...potentials);

    const curve = xs
        .map((x, i) => {
            const px = 16 + (i / (xs.length - 1)) * (W - 32);
            const py = 16 + (1 - (V(x) - minV) / (maxV - minV || 1)) * (H - 32);
            return `${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`;
        })
        .join(' ');

    const ballX = 16 + ((s.x + 2) / 4) * (W - 32);
    const ballY = 16 + (1 - (V(s.x) - minV) / (maxV - minV || 1)) * (H - 32);
    const histPath = pathFromValues(s.history, { width: W, height: histH, minY: -2, maxY: 2 });

    return (
        <div className="space-y-4">
            <div>
                <div className="text-xs text-lime-200/50 mb-2">Potential landscape — two wells separated by a ridge</div>
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: '#0a0a0a' }}>
                    <path d={curve} fill="none" stroke="rgb(132 204 22)" strokeWidth="2" strokeOpacity="0.6" />
                    <circle cx={ballX} cy={ballY} r="8" fill="rgb(163 230 53)" />
                    <line x1={W / 2} y1="18" x2={W / 2} y2={H - 18} stroke="rgb(132 204 22)" strokeDasharray="6 6" strokeOpacity="0.15" />
                    <text x={W / 2 + 8} y="32" fill="rgb(132 204 22)" fontSize="10" opacity="0.5">ridge</text>
                </svg>
            </div>
            <div>
                <div className="text-xs text-lime-200/50 mb-2">State trace — which basin is winning?</div>
                <svg viewBox={`0 0 ${W} ${histH}`} className="w-full" style={{ background: '#0a0a0a' }}>
                    <line x1="16" y1={histH / 2} x2={W - 16} y2={histH / 2} stroke="rgb(132 204 22)" strokeDasharray="6 6" strokeOpacity="0.2" />
                    <path d={histPath} fill="none" stroke="rgb(163 230 53)" strokeWidth="2" />
                </svg>
            </div>
        </div>
    );
}


function LimitCycleView({ simState, params }: { simState: SimulationState; params: Params }) {
    const s = simState.limit;
    const W = 680;
    const H = 400;
    const domain = 2.25;

    const mapX = (x: number) => 16 + ((x + domain) / (2 * domain)) * (W - 32);
    const mapY = (y: number) => 16 + (1 - (y + domain) / (2 * domain)) * (H - 32);
    const trailPath = pathFromPoints(s.trail, W, H, domain);
    const targetR = Math.sqrt(Math.max(params.limitMu, 0));
    const radiusPx = (targetR / (2 * domain)) * (W - 32);

    return (
        <div className="space-y-4">
            <div>
                <div className="text-xs text-lime-200/50 mb-2">Phase portrait — rhythm as stabilized motion</div>
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: '#0a0a0a' }}>
                    <line x1="16" y1={H / 2} x2={W - 16} y2={H / 2} stroke="rgb(132 204 22)" strokeOpacity="0.15" />
                    <line x1={W / 2} y1="16" x2={W / 2} y2={H - 16} stroke="rgb(132 204 22)" strokeOpacity="0.15" />
                    {targetR > 0 && (
                        <ellipse
                            cx={W / 2}
                            cy={H / 2}
                            rx={radiusPx}
                            ry={radiusPx * (H - 32) / (W - 32)}
                            fill="none"
                            stroke="rgb(132 204 22)"
                            strokeDasharray="8 8"
                            strokeOpacity="0.3"
                        />
                    )}
                    <path d={trailPath} fill="none" stroke="rgb(163 230 53)" strokeWidth="2" strokeOpacity="0.8" />
                    <circle cx={mapX(s.x)} cy={mapY(s.y)} r="8" fill="rgb(163 230 53)" />
                    <text x={W - 60} y={H / 2 - 8} fill="rgb(132 204 22)" fontSize="10" opacity="0.5">x</text>
                    <text x={W / 2 + 8} y="28" fill="rgb(132 204 22)" fontSize="10" opacity="0.5">y</text>
                </svg>
            </div>
        </div>
    );
}


function ConsensusView({ simState, params }: { simState: SimulationState; params: Params }) {
    const s = simState.consensus;
    const W = 680;
    const H = 320;
    const histH = 160;

    const centerX = W / 2;
    const centerY = H / 2 - 10;
    const radius = 90;

    const points = s.opinions.map((value, i, arr) => {
        const angle = (i / arr.length) * Math.PI * 2 - Math.PI / 2;
        return {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
            value,
        };
    });

    const meanPath = pathFromValues(s.meanHistory, { width: W, height: histH, minY: -1, maxY: 1 });
    const spreadPath = pathFromValues(s.spreadHistory, { width: W, height: histH, minY: 0, maxY: 1 });

    return (
        <div className="space-y-4">
            <div>
                <div className="text-xs text-lime-200/50 mb-2">Network state — distributed stabilization</div>
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: '#0a0a0a' }}>
                    {points.map((p, i) =>
                        points.slice(i + 1).map((q, j) => (
                            <line
                                key={`${i}-${j}`}
                                x1={p.x}
                                y1={p.y}
                                x2={q.x}
                                y2={q.y}
                                stroke="rgb(132 204 22)"
                                strokeWidth="1"
                                strokeOpacity="0.1"
                            />
                        )),
                    )}
                    {points.map((p, i) => {
                        const barHeight = 60 * ((p.value + 1.1) / 2.2);
                        return (
                            <g key={i}>
                                <circle cx={p.x} cy={p.y} r="16" fill="rgb(163 230 53)" fillOpacity="0.15" stroke="rgb(163 230 53)" strokeWidth="1" strokeOpacity="0.4" />
                                <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="10" fill="rgb(163 230 53)">
                                    {(i + 1).toString()}
                                </text>
                                <rect
                                    x={p.x - 8}
                                    y={H - 24 - barHeight}
                                    width="16"
                                    height={Math.max(0, barHeight)}
                                    fill="rgb(132 204 22)"
                                    fillOpacity="0.4"
                                />
                            </g>
                        );
                    })}
                    <line x1="20" y1={H - 24} x2={W - 20} y2={H - 24} stroke="rgb(132 204 22)" strokeWidth="1" strokeOpacity="0.2" />
                </svg>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className="text-xs text-lime-200/50 mb-2">Group mean</div>
                    <svg viewBox={`0 0 ${W / 2} ${histH}`} className="w-full" style={{ background: '#0a0a0a' }}>
                        <line x1="16" y1={histH / 2} x2={W / 2 - 16} y2={histH / 2} stroke="rgb(132 204 22)" strokeDasharray="6 6" strokeOpacity="0.2" />
                        <path d={pathFromValues(s.meanHistory, { width: W / 2, height: histH, minY: -1, maxY: 1 })} fill="none" stroke="rgb(163 230 53)" strokeWidth="2" />
                    </svg>
                </div>
                <div>
                    <div className="text-xs text-lime-200/50 mb-2">Disagreement (spread)</div>
                    <svg viewBox={`0 0 ${W / 2} ${histH}`} className="w-full" style={{ background: '#0a0a0a' }}>
                        <path d={pathFromValues(s.spreadHistory, { width: W / 2, height: histH, minY: 0, maxY: 1 })} fill="none" stroke="rgb(163 230 53)" strokeWidth="2" />
                    </svg>
                </div>
            </div>
        </div>
    );
}


// ── Custom Tooltip ──────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: number }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="border border-lime-500/30 bg-black/90 p-2 text-xs font-mono">
            <div className="text-lime-200/60 mb-1">x = {typeof label === 'number' ? label.toFixed(2) : label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color }}>
                    {p.name}: {p.value.toFixed(4)}
                </div>
            ))}
        </div>
    );
}


// ── Main Viewer ─────────────────────────────────────────────────

export default function Viewer({
    params,
    simState,
    metrics,
    sweep,
    sensitivityBars,
    assumptions,
    versions,
    snapshot,
    sweepParam,
    onSweepParamChange,
}: ViewerProps) {
    const [activeTab, setActiveTab] = useState<'phase' | 'sweep'>('phase');
    const relevantSpecs = useMemo(() => getRelevantParamSpecs(params.pattern), [params.pattern]);

    const tabs: { key: 'phase' | 'sweep'; label: string }[] = [
        { key: 'phase', label: 'phase' },
        { key: 'sweep', label: 'sweep' },
    ];

    const meta = PATTERN_META[params.pattern];

    return (
        <div className="w-[90vw] h-[90vh] overflow-y-auto outline-none [&_*]:outline-none">
            {/* Pattern info header */}
            <div className="border border-lime-500/20 p-4 mb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="text-xs text-lime-200/40 uppercase tracking-wider">active pattern</div>
                        <div className="text-lg text-lime-400 font-semibold mt-1">{meta.title}</div>
                        <div className="text-xs text-lime-200/50 mt-1 max-w-xl">{meta.idea}</div>
                    </div>
                    <div className="border border-lime-500/20 p-2 font-mono text-xs text-lime-200/60">
                        {meta.equation}
                    </div>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <SummaryCard label="stability index" value={metrics.stabilityIndex.toFixed(3)} />
                <SummaryCard label="Lyapunov λ" value={metrics.lyapunovEstimate.toFixed(3)} />
                <SummaryCard label="energy" value={metrics.currentEnergy.toFixed(4)} />
                <SummaryCard
                    label={
                        params.pattern === 'point' ? 'error |x - x*|'
                            : params.pattern === 'bistable' ? `basin: ${metrics.bistableBasin}`
                            : params.pattern === 'limit' ? 'orbit radius'
                            : `spread σ`
                    }
                    value={
                        params.pattern === 'point' ? metrics.pointError.toFixed(3)
                            : params.pattern === 'bistable' ? metrics.bistableBarrierHeight.toFixed(3)
                            : params.pattern === 'limit' ? metrics.limitRadius.toFixed(3)
                            : metrics.consensusSpread.toFixed(3)
                    }
                />
            </div>

            {/* Version selector */}
            <div className="mb-4">
                <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`px-4 py-1.5 text-xs border transition-colors ${
                            activeTab === t.key
                                ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {activeTab === 'phase' && (
                <div className="space-y-6">
                    {/* Phase visualization */}
                    {params.pattern === 'point' && <PointAttractorView simState={simState} params={params} />}
                    {params.pattern === 'bistable' && <BistableView simState={simState} params={params} />}
                    {params.pattern === 'limit' && <LimitCycleView simState={simState} params={params} />}
                    {params.pattern === 'consensus' && <ConsensusView simState={simState} params={params} />}

                    {/* Sensitivity */}
                    <div className="mt-6">
                        <SensitivityAnalysis
                            bars={sensitivityBars}
                            baseline={metrics.stabilityIndex}
                            outputLabel="stability index"
                        />
                    </div>

                    {/* Assumptions */}
                    <div className="mt-4">
                        <AssumptionPanel assumptions={assumptions} />
                    </div>
                </div>
            )}

            {activeTab === 'sweep' && (
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 mb-2">
                        {relevantSpecs.map(spec => (
                            <button
                                key={spec.key}
                                onClick={() => onSweepParamChange(spec.key)}
                                className={`px-3 py-1 text-xs border transition-colors ${
                                    sweepParam === spec.key
                                        ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                        : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                                }`}
                            >
                                {spec.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer width="100%" height={400} minWidth={0}>
                            <LineChart data={sweep} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(132, 204, 22, 0.1)" />
                                <XAxis
                                    dataKey="sweepValue"
                                    tick={{ fill: 'rgba(163, 230, 53, 0.5)', fontSize: 10 }}
                                    tickFormatter={(v: number) => v.toFixed(1)}
                                    label={{ value: sweepParam, fill: 'rgba(163, 230, 53, 0.4)', fontSize: 10, position: 'insideBottom', offset: -10 }}
                                />
                                <YAxis tick={{ fill: 'rgba(163, 230, 53, 0.5)', fontSize: 10 }} />
                                <Tooltip content={<ChartTooltip />} />
                                <Line type="monotone" dataKey="stabilityIndex" name="stability" stroke="#a3e635" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="lyapunovEstimate" name="λ" stroke="#84cc16" strokeWidth={1.5} dot={false} strokeDasharray="6 3" />
                                <Line type="monotone" dataKey="currentEnergy" name="energy" stroke="#65a30d" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}
