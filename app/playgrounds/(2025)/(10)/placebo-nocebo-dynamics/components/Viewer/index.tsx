'use client';

import { forwardRef, useImperativeHandle, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ViewerRef } from '../../playground';
import { SimulationParams, DEFAULT_PARAMS, simulate } from '../../logic';
import Equation from '@/components/Equation';

const Viewer = forwardRef<ViewerRef>((_, ref) => {
    const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);

    useImperativeHandle(ref, () => ({
        updateSimulation: (newParams: SimulationParams) => {
            setParams(newParams);
        },
        reset: () => {
            setParams(DEFAULT_PARAMS);
        },
    }));

    const data = useMemo(() => simulate(params), [params]);

    return (
        <div className="w-full h-full bg-black border border-lime-500/20 p-6 overflow-auto">
            <div className="space-y-6">
                <div className="bg-black border border-lime-500/20 p-4">
                    <h3 className="text-lime-400 font-semibold mb-4">Placebo/Nocebo vs Cue-Drug Similarity</h3>
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <LineChart data={data} margin={{ top: 10, right: 20, bottom: 45, left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#84cc16" opacity={0.1} />
                                <XAxis
                                    dataKey="s"
                                    type="number"
                                    domain={[-1, 1]}
                                    tick={{ fill: '#d4d4d4', fontSize: 12 }}
                                    stroke="#84cc16"
                                    opacity={0.2}
                                    label={{
                                        value: 'Cue-drug similarity',
                                        position: 'insideBottom',
                                        offset: 0,
                                        fill: '#d4d4d4',
                                    }}
                                />
                                <YAxis
                                    domain={[-1, 1]}
                                    tick={{ fill: '#d4d4d4', fontSize: 12 }}
                                    stroke="#84cc16"
                                    opacity={0.2}
                                    label={{
                                        value: 'Effect (signed)',
                                        angle: -90,
                                        position: 'insideLeft',
                                        fill: '#d4d4d4',
                                    }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#000',
                                        border: '1px solid rgba(132, 204, 22, 0.2)',
                                        color: '#84cc16',
                                    }}
                                    formatter={(value) => typeof value === 'number' ? value.toFixed(4) : String(value)}
                                />
                                <Legend wrapperStyle={{ color: '#84cc16' }} />
                                <ReferenceLine y={0} stroke="#84cc16" opacity={0.3} />
                                <Line
                                    type="monotone"
                                    dataKey="Net"
                                    strokeWidth={2.5}
                                    dot={false}
                                    name="Net Effect"
                                    stroke="#84cc16"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="Analgesia"
                                    strokeWidth={1.5}
                                    dot={false}
                                    name="Analgesia (μ-opioid + CB1)"
                                    stroke="#22d3ee"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="Hyperalgesia"
                                    strokeWidth={1.5}
                                    dot={false}
                                    name="Nocebo (CCK)"
                                    stroke="#ef4444"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-black border border-lime-500/20 p-4">
                    <h3 className="text-lime-400 font-semibold mb-3">Model Equations</h3>
                    <Equation mode="block" math="\text{Analgesia} = \text{saturate}\left(w \cdot s_+ \cdot \left[r_\mu(1-\text{naloxone}) + r_{\text{CB1}}(1-\text{rimonabant}) \cdot \text{conditioning}\right]\right)" />
                    <Equation mode="block" math="\text{Nocebo} = \text{saturate}\left(w \cdot s_- \cdot r_{\text{CCK}}(1-\text{proglumide})\right)" />
                    <Equation mode="block" math="\text{Net} = \text{Analgesia} - \text{Nocebo}" />
                    <p className="text-gray-300 mt-4 text-sm text-center">where</p>
                    <Equation mode="block" math="\text{saturate}(x) = \frac{x}{1+|x|}, \quad s_+ = \max(0,s), \quad s_- = \max(0,-s), \quad w = \frac{\Pi_p}{\Pi_p + \Pi_y(1+\text{attention})}" />
                </div>

                <div className="bg-black border border-lime-500/20 p-4">
                    <h3 className="text-lime-400 font-semibold mb-3">Interpretation Guide</h3>
                    <div className="text-sm text-gray-300 space-y-2">
                        <p>
                            <strong className="text-lime-400">Similarity axis:</strong> Moves from strong nocebo-like
                            cues (-1) through neutral context (0) to strong drug-like cues (+1).
                        </p>
                        <p>
                            <strong className="text-lime-400">Positive values:</strong> Indicate analgesic effects
                            (pain reduction) via μ-opioid and CB1 pathways.
                        </p>
                        <p>
                            <strong className="text-lime-400">Negative values:</strong> Indicate hyperalgesic effects
                            (pain increase) via CCK pathway.
                        </p>
                        <p>
                            <strong className="text-lime-400">Prior weight influence:</strong> Higher prior precision
                            increases the magnitude of placebo/nocebo effects; higher sensory precision (or attention)
                            diminishes them.
                        </p>
                        <p>
                            <strong className="text-lime-400">Pharmacological dissection:</strong> Setting blockers to
                            1.0 eliminates the respective pathway, revealing the contribution of other mechanisms.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
});

Viewer.displayName = 'Viewer';

export default Viewer;
