'use client';

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
    ReferenceLine, ResponsiveContainer, Legend,
} from 'recharts';
import {
    TimeStep, Metrics, Snapshot, SweepDatum,
    SweepableParam, PARAM_SPECS,
} from '../../logic';
import { SensitivityBar } from '@/components/SensitivityAnalysis';
import SensitivityAnalysis from '@/components/SensitivityAnalysis';
import AssumptionPanel, { Assumption } from '@/components/AssumptionPanel';
import CalibrationPanel, { CalibrationResult } from '@/components/CalibrationPanel';
import VersionSelector, { ModelVersion } from '@/components/VersionSelector';

interface ViewerProps {
    trajectory: TimeStep[];
    sweep: SweepDatum[];
    metrics: Metrics;
    sensitivityBars: SensitivityBar[];
    assumptions: Assumption[];
    calibrationResults: CalibrationResult[];
    versions: ModelVersion[];
    snapshot: Snapshot | null;
    sweepParam: SweepableParam;
    onSweepParamChange: (p: SweepableParam) => void;
    onLoadCalibrationCase?: (name: string) => void;
}

function ChartTooltip({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string | number;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: '#0a0a0a',
            border: '1px solid #84cc16',
            borderRadius: 0,
            padding: 10,
            color: '#ecfccb',
            fontSize: 11,
        }}>
            <div style={{ marginBottom: 4, color: '#a3e635' }}>t = {label}</div>
            {payload.map((p, i) => (
                <div key={i}>
                    <span style={{ color: p.color }}>{p.name}</span>: {Number(p.value).toFixed(4)}
                </div>
            ))}
        </div>
    );
}

function SweepTooltip({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string | number;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: '#0a0a0a',
            border: '1px solid #84cc16',
            borderRadius: 0,
            padding: 10,
            color: '#ecfccb',
            fontSize: 11,
        }}>
            <div style={{ marginBottom: 4, color: '#a3e635' }}>value = {Number(label).toFixed(0)}</div>
            {payload.map((p, i) => (
                <div key={i}>
                    <span style={{ color: p.color }}>{p.name}</span>: {Number(p.value).toFixed(4)}
                </div>
            ))}
        </div>
    );
}

export default function Viewer({
    trajectory, sweep, metrics, sensitivityBars,
    assumptions, calibrationResults, versions,
    snapshot, sweepParam, onSweepParamChange, onLoadCalibrationCase,
}: ViewerProps) {
    const sweepParamLabel = PARAM_SPECS.find(s => s.key === sweepParam)?.label ?? sweepParam;

    // Merge snapshot trajectory into chart data
    const chartData = trajectory.map((step, i) => ({
        t: step.t,
        world: step.world,
        benchmark: step.benchmark,
        mediated: step.mediated,
        ...(snapshot ? { snapshot: snapshot.trajectory[i]?.mediated } : {}),
    }));

    // Metrics entries for grid
    const metricsEntries: [string, number, boolean][] = [
        ['info loss', metrics.informationLoss, true],
        ['divergence', metrics.posteriorDivergence, true],
        ['curvature', metrics.inferentialCurvature, true],
        ['hysteresis', metrics.hysteresis, true],
        ['calibration err', metrics.calibrationError, true],
    ];

    return (
        <div className="w-[90vw] h-[90vh] overflow-y-auto outline-none [&_*]:outline-none">
            <div className="max-w-6xl mx-auto space-y-8 p-4">
                {/* Version */}
                <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />

                {/* Regime status */}
                <div className="border border-lime-500/30 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-lime-400 font-semibold text-sm">{metrics.regime}</div>
                            <div className="text-lime-200/60 text-xs mt-1">
                                divergence: {(metrics.posteriorDivergence * 100).toFixed(1)}% | hysteresis: {(metrics.hysteresis * 100).toFixed(1)}%
                            </div>
                        </div>
                        <div className="text-xs font-mono text-lime-200/40">
                            correction at t=150
                        </div>
                    </div>
                </div>

                {/* Posterior trajectory chart */}
                <div>
                    <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-2">
                        posterior trajectory
                    </div>
                    <div style={{ width: '100%', height: 380 }}>
                        <ResponsiveContainer width="100%" height={380} minWidth={0}>
                            <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="t"
                                    tick={{ fill: '#a3e635', fontSize: 10 }}
                                    label={{ value: 'time', position: 'insideBottom', offset: -5, fill: '#a3e635', fontSize: 10 }}
                                />
                                <YAxis
                                    tick={{ fill: '#a3e635', fontSize: 10 }}
                                    tickFormatter={(v: number) => v.toFixed(2)}
                                />
                                <ReTooltip content={<ChartTooltip />} />
                                <ReferenceLine x={150} stroke="#f97316" strokeDasharray="5 3" label={{ value: 'correction', fill: '#f97316', fontSize: 10 }} />
                                <Line type="monotone" dataKey="world" stroke="#555" strokeWidth={1} dot={false} name="world state" />
                                <Line type="monotone" dataKey="benchmark" stroke="#a3e635" strokeWidth={2} strokeDasharray="6 3" dot={false} name="benchmark" />
                                <Line type="monotone" dataKey="mediated" stroke="#84cc16" strokeWidth={2.5} dot={false} name="mediated" />
                                {snapshot && (
                                    <Line type="monotone" dataKey="snapshot" stroke="#f97316" strokeWidth={1.5} strokeDasharray="6 3" dot={false} name={`saved (${snapshot.label})`} />
                                )}
                                <Legend
                                    wrapperStyle={{ fontSize: 10, color: '#a3e635' }}
                                    iconType="line"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-5 gap-3">
                    {metricsEntries.map(([label, val, lowerIsBetter]) => {
                        const snapshotVal = snapshot ? (() => {
                            switch (label) {
                                case 'info loss': return snapshot.metrics.informationLoss;
                                case 'divergence': return snapshot.metrics.posteriorDivergence;
                                case 'curvature': return snapshot.metrics.inferentialCurvature;
                                case 'hysteresis': return snapshot.metrics.hysteresis;
                                case 'calibration err': return snapshot.metrics.calibrationError;
                                default: return null;
                            }
                        })() : null;
                        const delta = snapshotVal !== null ? val - snapshotVal : null;
                        const isImproved = delta !== null && lowerIsBetter ? delta < -0.002 : delta !== null && delta > 0.002;
                        const isWorse = delta !== null && lowerIsBetter ? delta > 0.002 : delta !== null && delta < -0.002;

                        return (
                            <div key={label} className="border border-lime-500/20 p-3">
                                <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">{label}</div>
                                <div className="text-lg font-mono text-lime-400 mt-1">
                                    {label === 'curvature' ? val.toFixed(2) : (val * 100).toFixed(1) + '%'}
                                </div>
                                {delta !== null && snapshotVal !== null && (
                                    <div className={`text-xs font-mono mt-0.5 ${isImproved ? 'text-lime-400' : isWorse ? 'text-orange-400' : 'text-lime-200/30'}`}>
                                        {delta > 0.002 ? '\u2191' : delta < -0.002 ? '\u2193' : '='}{' '}
                                        {label === 'curvature' ? snapshotVal.toFixed(2) : (snapshotVal * 100).toFixed(1) + '%'}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Sweep */}
                <div>
                    <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-2">
                        parameter sweep
                    </div>
                    <div className="flex gap-1 flex-wrap mb-3">
                        {PARAM_SPECS.map(spec => (
                            <button
                                key={spec.key}
                                onClick={() => onSweepParamChange(spec.key)}
                                className={`px-2 py-0.5 text-[10px] font-mono border transition-colors cursor-pointer ${
                                    sweepParam === spec.key
                                        ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                        : 'border-lime-500/20 text-lime-200/50 hover:border-lime-500/40'
                                }`}
                            >
                                {spec.label}
                            </button>
                        ))}
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height={300} minWidth={0}>
                            <LineChart data={sweep} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="sweepValue"
                                    tick={{ fill: '#a3e635', fontSize: 10 }}
                                    label={{ value: `${sweepParamLabel}`, position: 'insideBottom', offset: -5, fill: '#a3e635', fontSize: 10 }}
                                />
                                <YAxis
                                    tick={{ fill: '#a3e635', fontSize: 10 }}
                                    tickFormatter={(v: number) => v.toFixed(2)}
                                />
                                <ReTooltip content={<SweepTooltip />} />
                                <Line type="monotone" dataKey="posteriorDivergence" stroke="#84cc16" strokeWidth={2.5} dot={false} name="posterior divergence" />
                                <Line type="monotone" dataKey="hysteresis" stroke="#f97316" strokeWidth={2} strokeDasharray="6 3" dot={false} name="hysteresis" />
                                <Line type="monotone" dataKey="informationLoss" stroke="#a3e635" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="information loss" />
                                <Legend
                                    wrapperStyle={{ fontSize: 10, color: '#a3e635' }}
                                    iconType="line"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Analysis panels */}
                <SensitivityAnalysis bars={sensitivityBars} baseline={metrics.posteriorDivergence} outputLabel="posterior divergence" />
                <AssumptionPanel assumptions={assumptions} />
                <CalibrationPanel results={calibrationResults} outputLabel="posterior divergence" onLoadCase={onLoadCalibrationCase} />
            </div>
        </div>
    );
}
