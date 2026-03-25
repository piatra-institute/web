'use client';

import { useMemo } from 'react';

import AssumptionPanel from '@/components/AssumptionPanel';
import CalibrationPanel, { CalibrationResult } from '@/components/CalibrationPanel';
import SensitivityAnalysis from '@/components/SensitivityAnalysis';
import VersionSelector, { ModelVersion } from '@/components/VersionSelector';
import { Assumption } from '@/components/AssumptionPanel';
import { SensitivityBar as SensitivityBarType } from '@/components/SensitivityAnalysis';

import {
    type Params,
    type Metrics,
    type ManifoldData,
    type Snapshot,
    type SweepDatum,
    type SweepableParam,
    type Point3D,
    PARAM_SPECS,
    project3D,
    projectLinear,
    flatProject,
    pointAt,
    velocityAt,
    pathFromProjected,
    manifoldDistortion,
    clamp,
} from '../../logic';


const PW = 430;
const PH = 270;
const LIME = 'rgba(132,204,22,';
const LIME_SOLID = '#84cc16';


function SvgPlot({ width = PW, height = PH, children }: {
    width?: number;
    height?: number;
    children: React.ReactNode;
}) {
    return (
        <div className="border border-lime-500/20 bg-[#0a0a0a]">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
                {Array.from({ length: 8 }).map((_, i) => (
                    <line key={`v${i}`} x1={(i + 1) * (width / 9)} x2={(i + 1) * (width / 9)} y1={0} y2={height} stroke={`${LIME}0.04)`} />
                ))}
                {Array.from({ length: 5 }).map((_, i) => (
                    <line key={`h${i}`} x1={0} x2={width} y1={(i + 1) * (height / 6)} y2={(i + 1) * (height / 6)} stroke={`${LIME}0.04)`} />
                ))}
                {children}
            </svg>
        </div>
    );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
    return (
        <div className="border border-lime-500/20 p-3">
            <div className="text-[10px] uppercase tracking-widest text-lime-200/50">{label}</div>
            <div className="mt-1 text-lg font-mono text-lime-400">{value}</div>
            <div className="text-[10px] text-lime-200/40">{sub}</div>
        </div>
    );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="mb-4">
            <h3 className="text-sm font-semibold text-lime-400 uppercase tracking-wider">{title}</h3>
            <p className="text-xs text-lime-200/50 mt-1 leading-relaxed">{subtitle}</p>
        </div>
    );
}


interface ViewerProps {
    manifold: ManifoldData;
    phase: number;
    params: Params;
    metrics: Metrics;
    heatmap: number[][];
    singleNeuronTrace: number[];
    timeline: { x: number; baseline: number; cooled: number }[];
    subjectBCurve: Point3D[];
    sensitivityBars: SensitivityBarType[];
    assumptions: Assumption[];
    calibrationResults: CalibrationResult[];
    versions: ModelVersion[];
    snapshot: Snapshot | null;
    sweep: SweepDatum[];
    sweepParam: SweepableParam;
    onSweepParamChange: (key: SweepableParam) => void;
}

export default function Viewer({
    manifold,
    phase,
    params,
    metrics,
    heatmap,
    singleNeuronTrace,
    timeline,
    subjectBCurve,
    sensitivityBars,
    assumptions,
    calibrationResults,
    versions,
    snapshot,
    sweep,
    sweepParam,
    onSweepParamChange,
}: ViewerProps) {
    const current = useMemo(() => pointAt(manifold, phase), [manifold, phase]);
    const vel = useMemo(() => velocityAt(manifold.curve3D, current.idx), [manifold, current.idx]);

    const proj3D = (p: Point3D) => project3D(p, PW, PH, 1.08);
    const projLin = (p: Point3D) => projectLinear(p, PW, PH);
    const projFlat = flatProject(PW, PH);

    const embeddedPath = useMemo(
        () => pathFromProjected(manifold.curve3D, proj3D as never),
        [manifold],
    );
    const subjectBPath = useMemo(
        () => pathFromProjected(subjectBCurve, proj3D as never),
        [subjectBCurve],
    );

    const nonlinearPath = useMemo(
        () => pathFromProjected(manifold.curveFlat, projFlat as never),
        [manifold],
    );
    const linearPath = useMemo(
        () => pathFromProjected(manifold.curve3D, projLin as never),
        [manifold],
    );
    const comparePath = params.projectionMode === 'linear' ? linearPath : nonlinearPath;
    const compareCurrent = params.projectionMode === 'linear'
        ? projLin(current.point)
        : projFlat(current.flat);

    const currentEmbedded = proj3D(current.point);

    const distLinear = useMemo(() => manifoldDistortion(manifold, 'linear'), [manifold]);
    const distNonlinear = useMemo(() => manifoldDistortion(manifold, 'nonlinear'), [manifold]);
    const shownDistortion = params.projectionMode === 'linear' ? distLinear : distNonlinear;

    const vNorm = Math.hypot(vel[0], vel[1], vel[2]) || 1;
    const dx = vel[0] / vNorm;
    const dy = (-vel[1] + vel[2] * 0.35) / vNorm;
    const decoderSize = 280;
    const cursorX = clamp(decoderSize / 2 + dx * metrics.decoderConfidence * 0.8, 20, decoderSize - 20);
    const cursorY = clamp(decoderSize / 2 + dy * metrics.decoderConfidence * 0.8, 20, decoderSize - 20);

    const displayedNeurons = heatmap.length;
    const heatmapCols = heatmap[0]?.length ?? 0;

    return (
        <div className="w-[90vw] h-[90vh] overflow-y-auto outline-none [&_*]:outline-none">
            <div className="max-w-[900px] mx-auto space-y-8 py-6 px-4">

                <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />

                {/* Manifold Geometry */}
                <div>
                    <SectionHeader
                        title="Manifold geometry"
                        subtitle="Left: activity embedded in neural state space. Right: compare nonlinear unfolding against linear projection."
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="mb-2 text-[10px] uppercase tracking-widest text-lime-200/40">
                                Embedded state space
                            </div>
                            <SvgPlot>
                                {params.intrinsicDim === 2 && manifold.surface3D.map((p, i) => {
                                    const q = proj3D(p);
                                    return <circle key={i} cx={q.x} cy={q.y} r={1.5} fill={`${LIME}0.12)`} />;
                                })}
                                <path d={embeddedPath} fill="none" stroke={LIME_SOLID} strokeWidth={2.5} strokeLinecap="round" />
                                <circle cx={currentEmbedded.x} cy={currentEmbedded.y} r={5} fill="white" />
                                <circle cx={currentEmbedded.x} cy={currentEmbedded.y} r={10} fill="none" stroke={`${LIME}0.35)`} />
                                <text x={14} y={22} fill={`${LIME}0.6)`} fontSize={10}>Trajectory in neuron-population space</text>
                            </SvgPlot>
                        </div>
                        <div>
                            <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-lime-200/40">
                                <span>{params.projectionMode === 'linear' ? 'Linear projection' : 'Intrinsic unfolding'}</span>
                                <span className="font-mono text-lime-400">distortion {shownDistortion.toFixed(1)}%</span>
                            </div>
                            <SvgPlot>
                                {params.projectionMode === 'nonlinear' && params.intrinsicDim === 2 && manifold.surfaceFlat.map((p, i) => {
                                    const q = projFlat(p);
                                    return <circle key={i} cx={q.x} cy={q.y} r={1.5} fill={`${LIME}0.12)`} />;
                                })}
                                <path
                                    d={comparePath}
                                    fill="none"
                                    stroke={params.projectionMode === 'linear' ? 'rgba(200,200,200,0.8)' : LIME_SOLID}
                                    strokeWidth={2.5}
                                    strokeLinecap="round"
                                />
                                <circle cx={compareCurrent.x} cy={compareCurrent.y} r={5} fill="white" />
                                <text x={14} y={22} fill={`${LIME}0.6)`} fontSize={10}>
                                    {params.projectionMode === 'linear' ? 'PCA-like linear view' : 'Latent task coordinates'}
                                </text>
                            </SvgPlot>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                        <MetricCard label="Intrinsic dim" value={`${params.intrinsicDim}`} sub="Latent degrees of freedom" />
                        <MetricCard label="Embedding dim" value="3" sub="Visible state-space axes" />
                        <MetricCard label="Linear faithfulness" value={`${metrics.linearRecoverability.toFixed(0)}%`} sub="How much a linear view recovers" />
                        <MetricCard label="Smooth geometry" value={`${metrics.geometryPreserved.toFixed(0)}%`} sub="Surface continuity under perturbation" />
                    </div>
                </div>

                <div className="border-t border-lime-500/10" />

                {/* Population Activity */}
                <div>
                    <SectionHeader
                        title="Population activity"
                        subtitle="The manifold view does not abolish single neurons. It says isolated neurons are often insufficient summaries of the computation."
                    />
                    <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-4">
                        <div>
                            <div className="mb-2 text-[10px] uppercase tracking-widest text-lime-200/40">Population heatmap</div>
                            <div className="border border-lime-500/20 bg-[#0a0a0a] p-3">
                                <div
                                    className="grid gap-[2px]"
                                    style={{ gridTemplateColumns: `repeat(${heatmapCols}, minmax(0, 1fr))` }}
                                >
                                    {heatmap.flatMap((row, r) =>
                                        row.map((v, c) => {
                                            const alpha = 0.1 + Math.abs(v) * 0.85;
                                            const color = v >= 0
                                                ? `rgba(132,204,22,${alpha})`
                                                : `rgba(140,140,140,${alpha * 0.6})`;
                                            return (
                                                <div
                                                    key={`${r}-${c}`}
                                                    className="aspect-square"
                                                    style={{ backgroundColor: color }}
                                                />
                                            );
                                        })
                                    )}
                                </div>
                                <div className="mt-2 flex justify-between text-[9px] text-lime-200/30">
                                    <span>{displayedNeurons} units</span>
                                    <span>{heatmapCols} time bins</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="mb-2 text-[10px] uppercase tracking-widest text-lime-200/40">Single neuron trace</div>
                            <SvgPlot width={360} height={220}>
                                <path
                                    d={singleNeuronTrace
                                        .map((v, i) => {
                                            const x = 20 + (i / (singleNeuronTrace.length - 1)) * 320;
                                            const y = 110 - v * 62;
                                            return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
                                        })
                                        .join(' ')}
                                    fill="none"
                                    stroke="rgba(200,200,200,0.7)"
                                    strokeWidth={2}
                                />
                                <text x={14} y={18} fill={`${LIME}0.5)`} fontSize={9}>
                                    One unit fluctuates while the population stays organized
                                </text>
                            </SvgPlot>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <MetricCard label="Population coherence" value={`${metrics.populationCoherence.toFixed(0)}%`} sub="Ensemble coordination" />
                        <MetricCard label="Recorded units" value={`${params.neurons}`} sub={`Compressed to ${params.intrinsicDim}D latent space`} />
                    </div>
                </div>

                <div className="border-t border-lime-500/10" />

                {/* Dynamics */}
                <div>
                    <SectionHeader
                        title="Dynamics and causal perturbation"
                        subtitle="Cooling should bias timing by slowing traversal along the manifold rather than by destroying the manifold itself."
                    />
                    <SvgPlot width={PW} height={240}>
                        <path
                            d={timeline
                                .map((p, i) => {
                                    const x = 18 + p.x * 394;
                                    const y = 200 - p.baseline * 160;
                                    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
                                })
                                .join(' ')}
                            fill="none" stroke={LIME_SOLID} strokeWidth={2.5}
                        />
                        <path
                            d={timeline
                                .map((p, i) => {
                                    const x = 18 + p.x * 394;
                                    const y = 200 - p.cooled * 160;
                                    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
                                })
                                .join(' ')}
                            fill="none" stroke="#f97316" strokeWidth={2.5} strokeDasharray="6 4"
                        />
                        <text x={14} y={18} fill={`${LIME}0.5)`} fontSize={10}>
                            Solid: baseline dynamics. Dashed: cooled dynamics.
                        </text>
                    </SvgPlot>
                    <div className="grid grid-cols-3 gap-3 mt-4">
                        <MetricCard label="Traversal speed" value={`${metrics.effectiveSpeed.toFixed(0)}%`} sub="Effective latent dynamics" />
                        <MetricCard label="Timing bias" value={`${metrics.timingBias.toFixed(0)}%`} sub="Under/overestimation risk" />
                        <MetricCard label="Geometry retained" value={`${metrics.geometryPreserved.toFixed(0)}%`} sub="Structure after perturbation" />
                    </div>
                </div>

                <div className="border-t border-lime-500/10" />

                {/* Cross-Subject Alignment */}
                <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-6">
                    <div>
                        <SectionHeader
                            title="Cross-subject alignment"
                            subtitle="A strong manifold claim: related tasks induce comparable latent structure even when individual neurons differ."
                        />
                        <SvgPlot>
                            <path d={embeddedPath} fill="none" stroke={LIME_SOLID} strokeWidth={2.5} />
                            <path d={subjectBPath} fill="none" stroke="#f97316" strokeWidth={2.5} strokeDasharray="6 4" />
                            <circle cx={currentEmbedded.x} cy={currentEmbedded.y} r={5} fill="white" />
                            <text x={14} y={22} fill={`${LIME}0.5)`} fontSize={10}>Subject A = lime, Subject B = orange</text>
                        </SvgPlot>
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            <MetricCard label="Alignment" value={`${metrics.alignmentScore.toFixed(0)}%`} sub="Latent overlap" />
                            <MetricCard label="Shared grammar" value={`${metrics.sharedTaskGrammar.toFixed(0)}%`} sub="Task narrows space" />
                            <MetricCard label="Cross-map stability" value={`${metrics.crossMapStability.toFixed(0)}%`} sub="Robustness to noise" />
                        </div>
                    </div>

                    {/* Clinical Decoder */}
                    <div>
                        <SectionHeader
                            title="Clinical decoding"
                            subtitle="Weak residual activity may live on a meaningful low-dimensional structure decodable for control."
                        />
                        <div className="border border-lime-500/20 bg-[#0a0a0a]">
                            <svg viewBox={`0 0 ${decoderSize} ${decoderSize}`} className="w-full" style={{ height: decoderSize }}>
                                <line x1={decoderSize / 2} x2={decoderSize / 2} y1={0} y2={decoderSize} stroke={`${LIME}0.08)`} />
                                <line x1={0} x2={decoderSize} y1={decoderSize / 2} y2={decoderSize / 2} stroke={`${LIME}0.08)`} />
                                <circle cx={decoderSize / 2} cy={decoderSize / 2} r={60} fill="none" stroke={`${LIME}0.06)`} />
                                <circle cx={decoderSize / 2} cy={decoderSize / 2} r={120} fill="none" stroke={`${LIME}0.04)`} />
                                <circle cx={cursorX} cy={cursorY} r={14} fill={`${LIME}0.12)`} stroke={LIME_SOLID} strokeWidth={1} />
                                <circle cx={cursorX} cy={cursorY} r={4} fill={LIME_SOLID} />
                                <text x={10} y={18} fill={`${LIME}0.4)`} fontSize={9}>Virtual control cursor</text>
                            </svg>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <MetricCard label="Residual signal" value={`${(params.residual * 100).toFixed(0)}%`} sub="Structured motor intent" />
                            <MetricCard label="Control quality" value={`${metrics.decoderConfidence.toFixed(0)}%`} sub="Decoder performance" />
                        </div>
                    </div>
                </div>

                <div className="border-t border-lime-500/10" />

                {/* Sweep */}
                <div>
                    <SectionHeader
                        title="Parameter sweep"
                        subtitle="Sweep one parameter across its range while holding others constant."
                    />
                    <div className="flex flex-wrap gap-1 mb-4">
                        {PARAM_SPECS.map(spec => (
                            <button
                                key={spec.key}
                                onClick={() => onSweepParamChange(spec.key)}
                                className={`px-2 py-0.5 text-[10px] font-mono border ${
                                    sweepParam === spec.key
                                        ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                        : 'border-lime-500/20 text-lime-200/50'
                                }`}
                            >
                                {spec.label}
                            </button>
                        ))}
                    </div>
                    <SvgPlot width={PW} height={240}>
                        {sweep.length > 1 && (
                            <>
                                <path
                                    d={sweep.map((d, i) => {
                                        const x = 30 + (i / (sweep.length - 1)) * 380;
                                        const y = 220 - (d.decoderConfidence / 100) * 190;
                                        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
                                    }).join(' ')}
                                    fill="none" stroke={LIME_SOLID} strokeWidth={2}
                                />
                                <path
                                    d={sweep.map((d, i) => {
                                        const x = 30 + (i / (sweep.length - 1)) * 380;
                                        const y = 220 - (d.alignmentScore / 100) * 190;
                                        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
                                    }).join(' ')}
                                    fill="none" stroke="#f97316" strokeWidth={2} strokeDasharray="6 3"
                                />
                                <path
                                    d={sweep.map((d, i) => {
                                        const x = 30 + (i / (sweep.length - 1)) * 380;
                                        const y = 220 - (d.linearRecoverability / 100) * 190;
                                        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
                                    }).join(' ')}
                                    fill="none" stroke="rgba(200,200,200,0.5)" strokeWidth={1.5} strokeDasharray="3 3"
                                />
                                <text x={30} y={16} fill={LIME_SOLID} fontSize={9}>decoder confidence</text>
                                <text x={180} y={16} fill="#f97316" fontSize={9}>alignment</text>
                                <text x={310} y={16} fill="rgba(200,200,200,0.5)" fontSize={9}>linear rec.</text>
                            </>
                        )}
                    </SvgPlot>
                </div>

                <div className="border-t border-lime-500/10" />

                {/* Sensitivity */}
                <div>
                    <SectionHeader
                        title="Sensitivity analysis"
                        subtitle="Which parameters does decoder confidence depend on most?"
                    />
                    <div style={{ width: '100%', height: 280 }}>
                        <SensitivityAnalysis
                            bars={sensitivityBars}
                            baseline={metrics.decoderConfidence}
                            outputLabel="decoder confidence"
                        />
                    </div>
                </div>

                <div className="border-t border-lime-500/10" />

                <AssumptionPanel assumptions={assumptions} />

                <div className="border-t border-lime-500/10" />

                <CalibrationPanel results={calibrationResults} outputLabel="decoder confidence" />

                <div className="mt-4 text-[10px] text-lime-200/30 leading-relaxed">
                    This is a pedagogical model. The formulas are simplified proxies for neural population dynamics,
                    not fitted to real electrophysiology data. Use it to build intuition about the manifold framework,
                    not to make quantitative predictions.
                </div>
            </div>
        </div>
    );
}
