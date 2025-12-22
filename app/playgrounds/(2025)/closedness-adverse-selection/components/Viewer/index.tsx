'use client';

import { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ReferenceLine,
    Area,
    AreaChart,
} from 'recharts';
import {
    SimulationParams,
    generatePlotData,
    summarizeEntrants,
    getEffectiveCutoff,
    B_of_k,
    g_of_k,
    h_of_k,
} from '../../constants';

interface ViewerProps {
    params: SimulationParams;
}

export default function Viewer({ params }: ViewerProps) {
    const plotData = useMemo(() => generatePlotData(params), [params]);
    const stats = useMemo(() => summarizeEntrants(params), [params]);
    const cutoff = useMemo(() => getEffectiveCutoff(params), [params]);

    const maxPdf = useMemo(
        () => Math.max(...plotData.map((p) => p.pdf)),
        [plotData]
    );

    // Compute model functions for display
    const B = B_of_k(params.closedness, params.beta0, params.gamma);
    const g = g_of_k(params.closedness, params.alpha);
    const h = h_of_k(params.closedness, params.eta);

    return (
        <div className="w-full h-full bg-black border border-lime-500/20 p-4 overflow-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Population vs Entrants PDF */}
                <div className="bg-black border border-lime-500/20">
                    <div className="p-3 border-b border-lime-500/20">
                        <h3 className="text-lime-400 font-semibold text-sm">Population vs Entrants (PDF)</h3>
                        <p className="text-xs text-gray-400 mt-1">
                            Shaded area shows entrant distribution truncated at m*
                        </p>
                    </div>
                    <div className="p-4 h-72">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <LineChart data={plotData} margin={{ left: 0, right: 20, top: 10, bottom: 10 }}>
                                <XAxis
                                    dataKey="x"
                                    type="number"
                                    domain={[0, 1]}
                                    tickFormatter={(t) => t.toFixed(1)}
                                    stroke="#666"
                                    tick={{ fill: '#888', fontSize: 11 }}
                                    label={{ value: 'Moral aversion (m)', position: 'bottom', fill: '#888', fontSize: 11 }}
                                />
                                <YAxis
                                    tickFormatter={(t) => t.toFixed(1)}
                                    stroke="#666"
                                    tick={{ fill: '#888', fontSize: 11 }}
                                    domain={[0, maxPdf * 1.1]}
                                />
                                <Tooltip
                                    formatter={(val) => typeof val === 'number' ? val.toFixed(3) : val}
                                    labelFormatter={(x) => `m = ${Number(x).toFixed(3)}`}
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                                />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Line
                                    dot={false}
                                    strokeWidth={2}
                                    dataKey="pdf"
                                    name="Population"
                                    stroke="#666"
                                />
                                <Line
                                    dot={false}
                                    strokeWidth={2}
                                    dataKey="entrantPdf"
                                    name="Entrants (m ≤ m*)"
                                    stroke="#84cc16"
                                />
                                <ReferenceLine
                                    x={cutoff}
                                    stroke="#84cc16"
                                    strokeDasharray="4 4"
                                    label={{
                                        value: `m* = ${cutoff.toFixed(3)}`,
                                        fill: '#84cc16',
                                        fontSize: 11,
                                        position: 'top',
                                    }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Entrant Distribution Area */}
                <div className="bg-black border border-lime-500/20">
                    <div className="p-3 border-b border-lime-500/20">
                        <h3 className="text-lime-400 font-semibold text-sm">Entrant Distribution</h3>
                        <p className="text-xs text-gray-400 mt-1">
                            Mass of entrants below cutoff m*
                        </p>
                    </div>
                    <div className="p-4 h-72">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <AreaChart data={plotData} margin={{ left: 0, right: 20, top: 10, bottom: 10 }}>
                                <XAxis
                                    dataKey="x"
                                    type="number"
                                    domain={[0, 1]}
                                    tickFormatter={(t) => t.toFixed(1)}
                                    stroke="#666"
                                    tick={{ fill: '#888', fontSize: 11 }}
                                    label={{ value: 'Moral aversion (m)', position: 'bottom', fill: '#888', fontSize: 11 }}
                                />
                                <YAxis
                                    tickFormatter={(t) => t.toFixed(1)}
                                    stroke="#666"
                                    tick={{ fill: '#888', fontSize: 11 }}
                                />
                                <Tooltip
                                    formatter={(val) => typeof val === 'number' ? val.toFixed(3) : val}
                                    labelFormatter={(x) => `m = ${Number(x).toFixed(3)}`}
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="entrantPdf"
                                    name="Entrant PDF"
                                    stroke="#84cc16"
                                    fill="#84cc16"
                                    fillOpacity={0.3}
                                    strokeWidth={2}
                                />
                                <ReferenceLine
                                    x={cutoff}
                                    stroke="#84cc16"
                                    strokeDasharray="4 4"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Selection Statistics */}
                <div className="bg-black border border-lime-500/20">
                    <div className="p-3 border-b border-lime-500/20">
                        <h3 className="text-lime-400 font-semibold text-sm">Selection Statistics</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs text-gray-400">Cutoff m*</div>
                                <div className="text-2xl font-bold text-lime-400">{stats.cutoff.toFixed(3)}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-400">Share entering</div>
                                <div className="text-2xl font-bold text-lime-400">{(stats.fracEnter * 100).toFixed(1)}%</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Mean m (population)</span>
                                <span className="text-gray-300 font-mono">{stats.meanM_pop.toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Mean m (entrants)</span>
                                <span className="text-lime-400 font-mono">{stats.meanM_enter.toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Selection shift</span>
                                <span className="text-lime-400 font-mono">
                                    {(stats.meanM_pop - stats.meanM_enter).toFixed(3)}
                                </span>
                            </div>
                        </div>

                        <div className="h-3 bg-gray-900 relative">
                            <div
                                className="absolute left-0 top-0 h-full bg-gray-600"
                                style={{ width: `${stats.meanM_pop * 100}%` }}
                            />
                            <div
                                className="absolute left-0 top-0 h-full bg-lime-500"
                                style={{ width: `${stats.meanM_enter * 100}%` }}
                            />
                            <div
                                className="absolute top-0 h-full w-0.5 bg-white"
                                style={{ left: `${stats.cutoff * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>m = 0 (corruption tolerant)</span>
                            <span>m = 1 (high moral aversion)</span>
                        </div>
                    </div>
                </div>

                {/* Model Functions */}
                <div className="bg-black border border-lime-500/20">
                    <div className="p-3 border-b border-lime-500/20">
                        <h3 className="text-lime-400 font-semibold text-sm">Model Functions at k = {params.closedness.toFixed(2)}</h3>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-gray-900 p-3">
                                <div className="text-xs text-gray-400">B(k)</div>
                                <div className="text-lg font-mono text-gray-200">{B.toFixed(3)}</div>
                                <div className="text-xs text-gray-500">Private rents</div>
                            </div>
                            <div className="bg-gray-900 p-3">
                                <div className="text-xs text-gray-400">g(k)</div>
                                <div className="text-lg font-mono text-gray-200">{g.toFixed(3)}</div>
                                <div className="text-xs text-gray-500">Moral amplifier</div>
                            </div>
                            <div className="bg-gray-900 p-3">
                                <div className="text-xs text-gray-400">h(k)</div>
                                <div className="text-lg font-mono text-gray-200">{h.toFixed(3)}</div>
                                <div className="text-xs text-gray-500">Baseline cost</div>
                            </div>
                        </div>

                        <div className="bg-gray-900 p-3">
                            <div className="text-xs text-gray-400 mb-1">Payoff function</div>
                            <div className="text-sm font-mono text-gray-300">
                                J(m) = {B.toFixed(3)} - [m × {g.toFixed(3)} + {h.toFixed(3)}]
                            </div>
                            <div className="text-sm font-mono text-gray-300 mt-1">
                                J(m) = {(B - h).toFixed(3)} - {g.toFixed(3)}m
                            </div>
                        </div>

                        <div className="bg-gray-900 p-3">
                            <div className="text-xs text-gray-400 mb-1">Cutoff derivation</div>
                            <div className="text-sm font-mono text-gray-300">
                                m* = (B - h) / g = {(B - h).toFixed(3)} / {g.toFixed(3)} = {stats.cutoff.toFixed(3)}
                            </div>
                        </div>

                        {params.useSignal && (
                            <div className="bg-gray-900 p-3 border-l-2 border-lime-500">
                                <div className="text-xs text-lime-400 mb-1">With loyalty signaling</div>
                                <div className="text-sm font-mono text-gray-300">
                                    φ = {(params.phiScale * params.signalStrength * (1 + params.closedness)).toFixed(3)},
                                    ψ = {(params.psiScale * params.signalStrength * (1 + 0.5 * params.closedness)).toFixed(3)}
                                </div>
                                <div className="text-sm font-mono text-gray-300 mt-1">
                                    m̃* adjusted by loyalty screening
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Interpretation Panel */}
                <div className="bg-black border border-lime-500/20 lg:col-span-2">
                    <div className="p-4">
                        <h3 className="text-lime-400 font-semibold mb-2">Interpretation</h3>
                        <p className="text-sm text-gray-300">
                            {stats.cutoff > 0.7 && (
                                <>
                                    <strong className="text-lime-400">Open system:</strong> The cutoff is high,
                                    allowing agents with strong moral aversion to enter. The entrant distribution
                                    closely matches the population—minimal adverse selection.
                                </>
                            )}
                            {stats.cutoff > 0.4 && stats.cutoff <= 0.7 && (
                                <>
                                    <strong className="text-lime-400">Moderate selection:</strong> The cutoff
                                    filters out some high-m agents. Entrants are noticeably shifted toward lower
                                    moral aversion compared to the general population.
                                </>
                            )}
                            {stats.cutoff > 0.2 && stats.cutoff <= 0.4 && (
                                <>
                                    <strong className="text-lime-400">Strong selection:</strong> Most high-m
                                    agents find entry unattractive. The system preferentially admits those
                                    tolerant of corruption or complicity.
                                </>
                            )}
                            {stats.cutoff <= 0.2 && (
                                <>
                                    <strong className="text-lime-400">Severe selection:</strong> Only agents
                                    with very low moral aversion will enter. The system acts as a filter that
                                    admits primarily corruption-tolerant individuals—a self-reinforcing trap.
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
