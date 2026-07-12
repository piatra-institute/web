'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ReTooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';

import AssumptionPanel, { Assumption } from '@/components/AssumptionPanel';
import CalibrationPanel, { CalibrationResult } from '@/components/CalibrationPanel';
import SensitivityAnalysis, { SensitivityBar } from '@/components/SensitivityAnalysis';
import VersionSelector, { ModelVersion } from '@/components/VersionSelector';
import ChartTooltip from '@/components/ChartTooltip';

import {
    MachineSpec,
    Metrics,
    Params,
    PatchSpec,
    ScaleLandscape,
    Snapshot,
    SweepDatum,
    SweepableParam,
    TracePoint,
    PARAM_SPECS,
    X_END,
    activeParamSpecs,
    formatGain,
} from '../../logic';
import Machine3D, { CameraPreset, ModuleId, buildModuleCopy } from '../Machine3D';
import PatchDiagram from '../PatchDiagram';


interface ViewerProps {
    patch: PatchSpec;
    trace: TracePoint[];
    animIndex: number;
    params: Params;
    spec: MachineSpec;
    metrics: Metrics;
    sweep: SweepDatum[];
    landscape: ScaleLandscape;
    sensitivityBars: SensitivityBar[];
    assumptions: Assumption[];
    calibrationResults: CalibrationResult[];
    versions: ModelVersion[];
    snapshot: Snapshot | null;
    sweepParam: SweepableParam;
    onSweepParamChange: (p: SweepableParam) => void;
    running: boolean;
}


const CAMERA_PRESETS: CameraPreset[] = ['overview', 'integrators', 'plotter'];

/** Charts do not need six thousand points to tell the truth. */
const CHART_POINTS = 320;


export default function Viewer({
    patch,
    trace,
    animIndex,
    params,
    spec,
    metrics,
    sweep,
    landscape,
    sensitivityBars,
    assumptions,
    calibrationResults,
    versions,
    snapshot,
    sweepParam,
    onSweepParamChange,
    running,
}: ViewerProps) {
    const [module, setModule] = useState<ModuleId>(patch.integrators[0]?.id ?? 'shaft-bank');
    const [camera, setCamera] = useState<CameraPreset>('overview');

    // A new patch is a new machine: reselect its first integrator.
    useEffect(() => {
        setModule(patch.integrators[0]?.id ?? 'shaft-bank');
    }, [patch.equation, patch.integrators]);

    const moduleCopy = useMemo(() => buildModuleCopy(patch, params), [patch, params]);

    const stride = Math.max(1, Math.floor(trace.length / CHART_POINTS));

    const chartData = useMemo(() => {
        const snapTrace = snapshot?.trace;
        const rows: {
            x: number;
            ideal: number;
            machine: number | null;
            saved: number | null;
            error: number | null;
        }[] = [];

        for (let i = 0; i < trace.length; i += stride) {
            const p = trace[i];
            const drawn = i <= animIndex;
            rows.push({
                x: p.x,
                ideal: p.ideal,
                machine: drawn ? p.machine : null,
                saved: snapTrace && snapTrace[i] ? snapTrace[i].machine : null,
                error: drawn ? Math.abs(p.error) : null,
            });
        }
        return rows;
    }, [trace, stride, animIndex, snapshot]);

    const yBound = useMemo(() => {
        let peak = 0;
        for (const p of trace) peak = Math.max(peak, Math.abs(p.ideal));
        return Math.max(1.5, Math.min(peak * 1.9, 4));
    }, [trace]);

    const sweepSpec = PARAM_SPECS.find(s => s.key === sweepParam);
    const sweepLabel = sweepSpec?.label ?? sweepParam;
    const sweepChoices = activeParamSpecs(params);

    const copy = moduleCopy[module] ?? moduleCopy['shaft-bank'];

    const driftCell: { label: string; value: string; warn?: boolean } =
        params.equation === 'van-der-pol'
            ? { label: 'measured period', value: metrics.period > 0 ? metrics.period.toFixed(2) : 'none' }
            : params.equation === 'exponential-decay'
                ? { label: 'headroom', value: `${metrics.headroomDb.toFixed(1)} dB`, warn: metrics.headroomDb < 0 }
                : { label: 'phase drift', value: `${Math.abs(metrics.phaseDrift).toFixed(1)}°` };

    const cells: { label: string; value: string; warn?: boolean }[] = [
        { label: 'useful digits', value: metrics.usefulDigits.toFixed(2), warn: metrics.usefulDigits < 1 },
        { label: 'error', value: `${(metrics.relError * 100).toFixed(2)}%`, warn: metrics.relError > 0.1 },
        { label: 'creep', value: `${metrics.creepPct.toFixed(3)}%`, warn: metrics.grossSlip },
        driftCell,
        { label: 'dynamic range', value: `${metrics.dynamicRangeDb.toFixed(0)} dB` },
        { label: 'one run', value: `${metrics.runtimeMinutes.toFixed(0)} min` },
    ];

    return (
        <div className="w-[90vw] h-[90vh] max-w-[1040px] overflow-y-auto space-y-6 outline-none [&_*]:outline-none text-lime-100">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
                <div className="flex gap-1">
                    {CAMERA_PRESETS.map(preset => (
                        <button
                            key={preset}
                            onClick={() => setCamera(preset)}
                            className={`px-2 py-0.5 text-[10px] font-mono border transition-colors cursor-pointer ${
                                camera === preset
                                    ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                    : 'border-lime-500/20 text-lime-200/50 hover:border-lime-500/40'
                            }`}
                        >
                            {preset}
                        </button>
                    ))}
                </div>
            </div>

            <div className="border border-lime-500/30 p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <div className={`font-semibold text-sm ${metrics.grossSlip || !metrics.stable ? 'text-orange-400' : 'text-lime-400'}`}>
                            {metrics.regime}
                        </div>
                        <div className="text-lime-200/60 text-xs mt-1">{metrics.interpretation}</div>
                    </div>
                    <div className="flex gap-6 text-xs font-mono text-lime-200/60">
                        <div>
                            digits: <span className={metrics.usefulDigits < 1 ? 'text-orange-400' : 'text-lime-400'}>
                                {metrics.usefulDigits.toFixed(2)}
                            </span>
                        </div>
                        <div>
                            gain: <span className="text-lime-400">{formatGain(params.torqueGain)}&times;</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* The machine. */}
            <div className="border border-lime-500/20">
                <div style={{ width: '100%', height: 440 }}>
                    <Machine3D
                        patch={patch}
                        trace={trace}
                        index={animIndex}
                        params={params}
                        spec={spec}
                        running={running}
                        preset={camera}
                        selected={module}
                        onSelect={setModule}
                    />
                </div>
                <div className="border-t border-lime-500/20 p-4">
                    <div className="text-xs text-lime-400 font-semibold uppercase tracking-wide font-mono">
                        {copy.title}
                    </div>
                    <p className="text-xs text-lime-200/60 leading-relaxed mt-2">{copy.body}</p>
                    <div className="text-[10px] text-lime-200/30 font-mono mt-3">
                        click any mechanism to inspect it &middot; drag to orbit &middot; scroll to zoom
                    </div>
                </div>
            </div>

            <PatchDiagram patch={patch} params={params} spec={spec} metrics={metrics} />

            {/* What the pen drew, against what it should have drawn. */}
            <div>
                <div className="text-xs text-lime-200/60 mb-2 font-mono">
                    the plotting table &middot; lime is the pen, grey is the exact solution
                    {snapshot && <span className="text-orange-400/60"> &middot; dashed = saved ({snapshot.label})</span>}
                </div>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height={300} minWidth={0}>
                        <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                            <CartesianGrid stroke="#222" strokeDasharray="3 3" />
                            <XAxis
                                dataKey="x"
                                type="number"
                                domain={[0, X_END]}
                                tick={{ fill: '#a3e635', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v: number) => v.toFixed(0)}
                                label={{ value: 'independent variable x', position: 'insideBottom', offset: -5, fill: '#a3e635', fontSize: 10 }}
                            />
                            <YAxis
                                domain={[-yBound, yBound]}
                                allowDataOverflow
                                tick={{ fill: '#a3e635', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v: number) => v.toFixed(1)}
                                label={{ value: 'y', angle: -90, position: 'insideLeft', fill: '#a3e635', fontSize: 10 }}
                            />
                            <ReTooltip
                                content={
                                    <ChartTooltip
                                        labelFormat={l => `x = ${Number(l).toFixed(2)}`}
                                        valueFormat={v => v.toFixed(4)}
                                    />
                                }
                            />
                            <ReferenceLine y={0} stroke="#3f6212" strokeWidth={1} />
                            <Line
                                type="monotone"
                                dataKey="ideal"
                                stroke="#6b7280"
                                strokeWidth={1.5}
                                strokeDasharray="5 4"
                                dot={false}
                                name="exact"
                                isAnimationActive={false}
                            />
                            {snapshot && (
                                <Line
                                    type="monotone"
                                    dataKey="saved"
                                    stroke="#f97316"
                                    strokeWidth={1.5}
                                    strokeDasharray="6 3"
                                    dot={false}
                                    name={`saved (${snapshot.label})`}
                                    isAnimationActive={false}
                                    connectNulls={false}
                                />
                            )}
                            <Line
                                type="monotone"
                                dataKey="machine"
                                stroke={metrics.grossSlip || !metrics.stable ? '#f97316' : '#84cc16'}
                                strokeWidth={2.2}
                                dot={false}
                                name="the pen"
                                isAnimationActive={false}
                                connectNulls={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Error does not stay where it was made. */}
            <div>
                <div className="text-xs text-lime-200/60 mb-2 font-mono">
                    error accumulation &middot; a frequency error becomes a phase error, and a phase error is unforgiving
                </div>
                <div style={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer width="100%" height={200} minWidth={0}>
                        <AreaChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                            <CartesianGrid stroke="#222" strokeDasharray="3 3" />
                            <XAxis
                                dataKey="x"
                                type="number"
                                domain={[0, X_END]}
                                tick={{ fill: '#a3e635', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v: number) => v.toFixed(0)}
                            />
                            <YAxis
                                tick={{ fill: '#a3e635', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v: number) => v.toFixed(2)}
                                label={{ value: '|error|', angle: -90, position: 'insideLeft', fill: '#a3e635', fontSize: 10 }}
                            />
                            <ReTooltip
                                content={
                                    <ChartTooltip
                                        labelFormat={l => `x = ${Number(l).toFixed(2)}`}
                                        valueFormat={v => v.toFixed(5)}
                                    />
                                }
                            />
                            <Area
                                type="monotone"
                                dataKey="error"
                                stroke="#84cc16"
                                fill="#84cc16"
                                fillOpacity={0.25}
                                strokeWidth={1.5}
                                dot={false}
                                name="|machine - exact|"
                                isAnimationActive={false}
                                connectNulls={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* The scaling problem. */}
            <div>
                <div className="text-xs text-lime-200/60 mb-2 font-mono">
                    the scaling problem &middot; lost motion pushes you right, the rim of the disc pushes you left
                </div>
                <div style={{ width: '100%', height: 240 }}>
                    <ResponsiveContainer width="100%" height={240} minWidth={0}>
                        <LineChart data={landscape.points} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                            <CartesianGrid stroke="#222" strokeDasharray="3 3" />
                            <XAxis
                                dataKey="scaleFactor"
                                type="number"
                                scale="log"
                                domain={[8, 500]}
                                allowDataOverflow
                                ticks={[10, 20, 50, 100, 200, 500]}
                                tick={{ fill: '#a3e635', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v: number) => v.toFixed(0)}
                                label={{ value: 'scale factor k (mm per unit)', position: 'insideBottom', offset: -5, fill: '#a3e635', fontSize: 10 }}
                            />
                            <YAxis
                                domain={[0, 'auto']}
                                tick={{ fill: '#a3e635', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v: number) => v.toFixed(1)}
                                label={{ value: 'useful digits', angle: -90, position: 'insideLeft', fill: '#a3e635', fontSize: 10 }}
                            />
                            <ReTooltip
                                content={
                                    <ChartTooltip
                                        labelFormat={l => `k = ${Number(l).toFixed(0)} mm/unit`}
                                        valueFormat={v => v.toFixed(2)}
                                    />
                                }
                            />
                            <ReferenceLine
                                x={landscape.kSaturation}
                                stroke="#f97316"
                                strokeDasharray="5 3"
                                strokeWidth={1.5}
                                label={{ value: 'wheel leaves the disc', fill: '#f97316', fontSize: 9, position: 'insideTopRight' }}
                            />
                            <ReferenceLine
                                x={landscape.current}
                                stroke="#84cc16"
                                strokeWidth={1.5}
                                label={{ value: 'you', fill: '#84cc16', fontSize: 9, position: 'top' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="usefulDigits"
                                stroke="#84cc16"
                                strokeWidth={2.5}
                                dot={false}
                                name="useful digits"
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Sweep. */}
            <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs text-lime-200/60 font-mono">sweep</span>
                    <div className="flex gap-1 flex-wrap">
                        {sweepChoices.map(spec2 => (
                            <button
                                key={spec2.key}
                                onClick={() => onSweepParamChange(spec2.key)}
                                className={`px-2 py-0.5 text-[10px] font-mono border transition-colors cursor-pointer ${
                                    sweepParam === spec2.key
                                        ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                        : 'border-lime-500/20 text-lime-200/50 hover:border-lime-500/40'
                                }`}
                            >
                                {spec2.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="text-xs text-lime-200/60 mb-2 font-mono">
                    {sweepLabel} sweep &middot; digits on the left, creep and clipping on the right
                </div>
                <div style={{ width: '100%', height: 240 }}>
                    <ResponsiveContainer width="100%" height={240} minWidth={0}>
                        <LineChart data={sweep} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                            <CartesianGrid stroke="#222" strokeDasharray="3 3" />
                            <XAxis
                                dataKey="sweepValue"
                                type="number"
                                scale={sweepSpec?.log ? 'log' : 'linear'}
                                domain={sweepSpec ? [sweepSpec.min, sweepSpec.max] : [0, 1]}
                                allowDataOverflow
                                tick={{ fill: '#a3e635', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v < 1 ? v.toFixed(2) : v.toFixed(0))}
                                label={{ value: `${sweepLabel}${sweepSpec?.unit ?? ''}`, position: 'insideBottom', offset: -5, fill: '#a3e635', fontSize: 10 }}
                            />
                            <YAxis
                                yAxisId="digits"
                                domain={[0, 'auto']}
                                tick={{ fill: '#a3e635', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v: number) => v.toFixed(1)}
                            />
                            <YAxis
                                yAxisId="pct"
                                orientation="right"
                                domain={[0, 100]}
                                tick={{ fill: '#65a30d', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v: number) => `${v.toFixed(0)}%`}
                            />
                            <ReTooltip
                                content={
                                    <ChartTooltip
                                        labelFormat={l => `${sweepLabel} = ${Number(l) >= 1000 ? Number(l).toFixed(0) : Number(l).toFixed(3)}`}
                                        valueFormat={v => v.toFixed(2)}
                                    />
                                }
                            />
                            <Line yAxisId="digits" type="monotone" dataKey="usefulDigits" stroke="#84cc16" strokeWidth={2.5} dot={false} name="useful digits" isAnimationActive={false} />
                            <Line yAxisId="pct" type="monotone" dataKey="creepPct" stroke="#a3e635" strokeWidth={1.5} strokeDasharray="6 3" dot={false} name="creep %" isAnimationActive={false} />
                            <Line yAxisId="pct" type="monotone" dataKey="clipPct" stroke="#f97316" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="clipped %" isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {cells.map(cell => (
                    <div key={cell.label} className="border border-lime-500/20 p-3">
                        <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">{cell.label}</div>
                        <div className={`text-base font-mono mt-1 ${cell.warn ? 'text-orange-400' : 'text-lime-400'}`}>
                            {cell.value}
                        </div>
                    </div>
                ))}
            </div>

            <SensitivityAnalysis
                bars={sensitivityBars}
                baseline={metrics.usefulDigits}
                outputLabel="useful digits"
            />

            <AssumptionPanel assumptions={assumptions} />

            <CalibrationPanel results={calibrationResults} outputLabel="machine behaviour" />
            <div className="text-xs text-lime-200/30 -mt-4 px-1">
                These cases check the simulated mechanism against the mechanics it claims to obey: the exact solution of the
                equation, the characteristic roots of its own loop, the travel limit of a carriage, and the invariance that
                makes a scale factor a change of units rather than a change of machine. The last three repatch the bench:
                the decay patch must draw the exponential, the forced patch must find the resonance law, and the van der Pol
                patch must forget its initial condition, although the stepper contains none of those equations.
            </div>
        </div>
    );
}
