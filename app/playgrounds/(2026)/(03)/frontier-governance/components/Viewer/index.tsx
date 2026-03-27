'use client';

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ReTooltip,
    Legend,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    BarChart,
    Bar,
    ScatterChart,
    Scatter,
    ZAxis,
    Cell,
} from 'recharts';

import AssumptionPanel, { Assumption } from '@/components/AssumptionPanel';
import SensitivityAnalysis, { SensitivityBar } from '@/components/SensitivityAnalysis';
import CalibrationPanel, { CalibrationResult } from '@/components/CalibrationPanel';
import VersionSelector, { ModelVersion } from '@/components/VersionSelector';
import Dropdown from '@/components/Dropdown';

import {
    Metrics,
    Snapshot,
    SimulationResult,
    SweepDatum,
    SweepableParam,
    HistoricalCase,
    SectorDiagnostic,
    PARAM_SPECS,
    SECTORS,
    SECTOR_COLORS,
    FOCUS_METRICS,
} from '../../logic';


interface ScenarioPoint {
    name: string;
    welfare: number;
    frontier: number;
    concentration: number;
    shortages: number;
}

interface RadarDatum {
    metric: string;
    value: number;
}

interface ViewerProps {
    result: SimulationResult;
    metrics: Metrics;
    radarData: RadarDatum[];
    scenarioCloud: ScenarioPoint[];
    sweep: SweepDatum[];
    sensitivityBars: SensitivityBar[];
    assumptions: Assumption[];
    calibrationResults: CalibrationResult[];
    versions: ModelVersion[];
    snapshot: Snapshot | null;
    sweepParam: SweepableParam;
    onSweepParamChange: (p: SweepableParam) => void;
    focusMetric: string;
    onFocusMetricChange: (m: string) => void;
    sectorFocus: string;
    onSectorFocusChange: (s: string) => void;
    historicalCases: HistoricalCase[];
}

function ChartTooltip({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number; name: string; color: string }>;
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
            <div style={{ marginBottom: 4, color: '#a3e635' }}>
                {label}
            </div>
            {payload.map((p, i) => (
                <div key={i}>
                    <span style={{ color: p.color }}>{p.name}</span>: {Number(p.value).toFixed(1)}
                </div>
            ))}
        </div>
    );
}

const SCATTER_COLORS = ['#84cc16', '#f87171', '#60a5fa', '#34d399', '#f59e0b'];


export default function Viewer({
    result,
    metrics,
    radarData,
    scenarioCloud,
    sweep,
    sensitivityBars,
    assumptions,
    calibrationResults,
    versions,
    snapshot,
    sweepParam,
    onSweepParamChange,
    focusMetric,
    onFocusMetricChange,
    sectorFocus,
    onSectorFocusChange,
    historicalCases,
}: ViewerProps) {
    const sweepParamLabel = PARAM_SPECS.find(s => s.key === sweepParam)?.label ?? sweepParam;
    const focusLabel = FOCUS_METRICS.find(m => m.key === focusMetric)?.label ?? focusMetric;

    const selectedSector = SECTORS.find(s => s.key === sectorFocus);
    const selectedDiagnostic: SectorDiagnostic | undefined = result.diagnostics.find(
        d => d.sector === selectedSector?.label,
    );

    return (
        <div className="w-[90vw] h-[90vh] max-w-[1100px] overflow-y-auto space-y-8 outline-none [&_*]:outline-none text-lime-100">
            {/* Version */}
            <div className="flex items-center justify-between gap-4">
                <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                    { label: 'Frontier', value: metrics.frontierIndex, color: '#84cc16' },
                    { label: 'Welfare', value: metrics.welfareIndex, color: '#84cc16' },
                    { label: 'State capacity', value: metrics.stateCapacityIndex, color: '#84cc16' },
                    { label: 'Concentration', value: metrics.concentrationIndex, color: '#f97316' },
                    { label: 'Shortage risk', value: metrics.shortageIndex, color: '#f97316' },
                ].map((m) => (
                    <div key={m.label} className="border border-lime-500/30 p-3">
                        <div className="text-lime-200/60 text-xs">{m.label}</div>
                        <div className="text-2xl font-mono mt-1" style={{ color: m.color }}>
                            {m.value.toFixed(1)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Trajectory */}
            <div>
                <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="text-lime-400 font-semibold text-sm">system trajectory</div>
                    <Dropdown
                        name="metric"
                        selected={focusLabel}
                        selectables={FOCUS_METRICS.map(m => m.label)}
                        atSelect={(label) => {
                            const found = FOCUS_METRICS.find(m => m.label === label);
                            if (found) onFocusMetricChange(found.key);
                        }}
                    />
                </div>
                <div style={{ width: '100%', height: 340 }}>
                    <ResponsiveContainer width="100%" height={340} minWidth={0}>
                        <LineChart data={result.records}>
                            <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                            <XAxis dataKey="year" tick={{ fill: '#a3e635', fontSize: 10 }} />
                            <YAxis tick={{ fill: '#a3e635', fontSize: 10 }} />
                            <ReTooltip content={<ChartTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 11, color: '#ecfccb' }} />
                            <Line type="monotone" dataKey={focusMetric} stroke="#ffffff" strokeWidth={2.5} dot={false} name={focusLabel} />
                            <Line type="monotone" dataKey="frontierIndex" stroke="#84cc16" strokeWidth={1.5} dot={false} name="Frontier" />
                            <Line type="monotone" dataKey="concentrationIndex" stroke="#f97316" strokeWidth={1.5} dot={false} name="Concentration" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Radar + scatter side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Radar */}
                <div>
                    <div className="text-lime-400 font-semibold text-sm mb-3">regime shape</div>
                    <div style={{ width: '100%', height: 320 }}>
                        <ResponsiveContainer width="100%" height={320} minWidth={0}>
                            <RadarChart outerRadius="72%" data={radarData}>
                                <PolarGrid stroke="#333" />
                                <PolarAngleAxis dataKey="metric" tick={{ fill: '#a3e635', fontSize: 10 }} />
                                <PolarRadiusAxis tick={{ fill: '#666', fontSize: 9 }} />
                                <Radar name="Current regime" dataKey="value" stroke="#84cc16" fill="#84cc16" fillOpacity={0.25} />
                                {snapshot && (
                                    <Radar
                                        name={`Saved (${snapshot.label})`}
                                        dataKey="snapshotValue"
                                        stroke="#f97316"
                                        fill="none"
                                        strokeDasharray="6 3"
                                    />
                                )}
                                <ReTooltip content={<ChartTooltip />} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Scatter */}
                <div>
                    <div className="text-lime-400 font-semibold text-sm mb-3">policy phase space</div>
                    <div className="text-lime-200/40 text-xs mb-2">Top-right = high frontier with high welfare</div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height={300} minWidth={0}>
                            <ScatterChart>
                                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                                <XAxis dataKey="frontier" name="Frontier" stroke="#666" tick={{ fill: '#a3e635', fontSize: 10 }} />
                                <YAxis dataKey="welfare" name="Welfare" stroke="#666" tick={{ fill: '#a3e635', fontSize: 10 }} />
                                <ZAxis dataKey="concentration" range={[80, 400]} name="Concentration" />
                                <ReTooltip content={<ChartTooltip />} />
                                <Scatter name="Scenarios" data={scenarioCloud}>
                                    {scenarioCloud.map((_entry, idx) => (
                                        <Cell key={`cell-${idx}`} fill={SCATTER_COLORS[idx % SCATTER_COLORS.length]} />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Sector end-state bar chart */}
            <div>
                <div className="text-lime-400 font-semibold text-sm mb-3">sectoral end-state</div>
                <div className="text-lime-200/40 text-xs mb-2">Innovation, deployment, concentration, and shortage by sector in the final year</div>
                <div style={{ width: '100%', height: 380 }}>
                    <ResponsiveContainer width="100%" height={380} minWidth={0}>
                        <BarChart data={result.sectorTable}>
                            <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                            <XAxis dataKey="sector" tick={{ fill: '#a3e635', fontSize: 10 }} angle={-16} textAnchor="end" height={80} interval={0} />
                            <YAxis tick={{ fill: '#a3e635', fontSize: 10 }} />
                            <ReTooltip content={<ChartTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 11, color: '#ecfccb' }} />
                            <Bar dataKey="innovation" fill="#84cc16" name="Innovation" />
                            <Bar dataKey="deployment" fill="#a3e635" name="Deployment" />
                            <Bar dataKey="concentration" fill="#f97316" name="Concentration" />
                            <Bar dataKey="shortage" fill="#f472b6" name="Shortage" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Sector deep dive */}
            <div className="border border-lime-500/20 p-4">
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="text-lime-400 font-semibold text-sm">sector deep dive</div>
                    <Dropdown
                        name="sector"
                        selected={selectedSector?.label ?? ''}
                        selectables={SECTORS.map(s => s.label)}
                        atSelect={(label) => {
                            const found = SECTORS.find(s => s.label === label);
                            if (found) onSectorFocusChange(found.key);
                        }}
                    />
                </div>

                {selectedSector && selectedDiagnostic && (
                    <div className="space-y-4">
                        <div className="text-lime-200/60 text-xs leading-relaxed">{selectedSector.description}</div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="border border-lime-500/20 p-3">
                                <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-1">best instrument</div>
                                <div className="text-sm font-medium text-lime-400">{selectedDiagnostic.bestInstrument}</div>
                                <div className="text-xs text-lime-200/60 leading-relaxed mt-1">{selectedDiagnostic.explanation}</div>
                            </div>
                            <div className="border border-lime-500/20 p-3">
                                <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-1">sector anatomy</div>
                                <div className="space-y-1 text-xs text-lime-200/60">
                                    <div className="flex justify-between"><span>monopoly-like</span><span className="text-lime-400">{Math.round(selectedSector.monopolyLike * 100)}</span></div>
                                    <div className="flex justify-between"><span>frontier intensity</span><span className="text-lime-400">{Math.round(selectedSector.frontier * 100)}</span></div>
                                    <div className="flex justify-between"><span>network effects</span><span className="text-lime-400">{Math.round(selectedSector.network * 100)}</span></div>
                                    <div className="flex justify-between"><span>capex burden</span><span className="text-lime-400">{Math.round(selectedSector.capex * 100)}</span></div>
                                    <div className="flex justify-between"><span>safety burden</span><span className="text-lime-400">{Math.round(selectedSector.safety * 100)}</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="border border-lime-500/20 p-3">
                            <div className="text-xs text-lime-200/60 leading-relaxed">
                                <span className="text-lime-400 font-medium">Direct profit control</span> is least suited to sectors with high volatility and long R&D cycles.{' '}
                                <span className="text-lime-400 font-medium">Utility-style regulation</span> becomes more defensible as monopoly structure rises.{' '}
                                <span className="text-lime-400 font-medium">Excess-profits taxation</span> is strongest when rents are structural or windfall-like.
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Historical cases */}
            <div>
                <div className="text-lime-400 font-semibold text-sm mb-3">historical cases</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {historicalCases.map((item) => (
                        <div key={item.title} className="border border-lime-500/20 p-3">
                            <div className="text-xs text-lime-200/40 mb-1">{item.period} &middot; {item.label}</div>
                            <div className="text-sm font-medium text-lime-400">{item.title}</div>
                            <div className="text-xs text-lime-200/60 mt-1">{item.verdict}</div>
                            <div className="text-xs text-lime-200/40 mt-1 leading-relaxed">{item.why}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sweep chart */}
            <div>
                <div className="text-lime-400 font-semibold text-sm mb-3">parameter sweep</div>
                <div className="flex flex-wrap gap-1 mb-3">
                    {PARAM_SPECS.map((spec) => (
                        <button
                            key={spec.key}
                            onClick={() => onSweepParamChange(spec.key)}
                            className={`py-1 px-2 text-[10px] border transition-colors cursor-pointer ${
                                sweepParam === spec.key
                                    ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                    : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                            }`}
                        >
                            {spec.label}
                        </button>
                    ))}
                </div>
                <div className="text-lime-200/40 text-xs mb-2">
                    sweeping {sweepParamLabel} from {PARAM_SPECS.find(s => s.key === sweepParam)?.min ?? 0} to {PARAM_SPECS.find(s => s.key === sweepParam)?.max ?? 100}
                </div>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height={300} minWidth={0}>
                        <LineChart data={sweep}>
                            <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                            <XAxis dataKey="sweepValue" tick={{ fill: '#a3e635', fontSize: 10 }} />
                            <YAxis tick={{ fill: '#a3e635', fontSize: 10 }} />
                            <ReTooltip content={<ChartTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 11, color: '#ecfccb' }} />
                            <Line type="monotone" dataKey="welfare" stroke="#84cc16" strokeWidth={2} dot={false} name="Welfare" />
                            <Line type="monotone" dataKey="frontier" stroke="#ffffff" strokeWidth={1.5} dot={false} name="Frontier" />
                            <Line type="monotone" dataKey="concentration" stroke="#f97316" strokeWidth={1.5} dot={false} name="Concentration" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Sensitivity */}
            <SensitivityAnalysis
                bars={sensitivityBars}
                baseline={metrics.welfareIndex}
                outputLabel="welfare index"
            />

            {/* Assumptions */}
            <AssumptionPanel assumptions={assumptions} />

            {/* Calibration */}
            <CalibrationPanel results={calibrationResults} outputLabel="welfare index" />
        </div>
    );
}
