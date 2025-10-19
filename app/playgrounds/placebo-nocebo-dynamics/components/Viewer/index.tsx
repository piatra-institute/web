'use client';

import { forwardRef, useImperativeHandle, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ViewerRef, SimulationParams } from '../../playground';

interface DataPoint {
    s: number;
    Analgesia: number;
    Hyperalgesia: number;
    Net: number;
    PriorWeight: number;
}

// Signed saturating nonlinearity
function saturate(x: number): number {
    return x / (1 + Math.abs(x));
}

function simulate(params: SimulationParams, points = 201): DataPoint[] {
    const {
        priorPrecision,
        sensoryPrecision,
        attention,
        rOpioid,
        rCB1,
        rCCK,
        conditioning,
        naloxone,
        rimonabant,
        proglumide,
    } = params;

    const data: DataPoint[] = [];
    const Pi_y = sensoryPrecision * (1 + attention); // attention raises sensory precision
    const Pi_p = priorPrecision;
    const w = Pi_p / (Pi_p + Pi_y); // precision balance

    const rO = rOpioid * (1 - naloxone); // naloxone reduces available μ-opioid effect
    const rC = rCB1 * (1 - rimonabant) * conditioning; // CB1 path gated by conditioning
    const rK = rCCK * (1 - proglumide); // CCK (nocebo) reduced by proglumide

    for (let i = 0; i < points; i++) {
        const s = -1 + (2 * i) / (points - 1); // similarity from -1 to 1
        const sPos = Math.max(0, s);
        const sNeg = Math.max(0, -s);

        // Placebo (analgesia): opioid + CB1 branches
        const rawAnalgesia = w * sPos * (rO + rC);
        const analgesia = saturate(rawAnalgesia);

        // Nocebo (hyperalgesia): CCK-like branch
        const rawHyper = w * sNeg * rK;
        const hyperalgesia = saturate(rawHyper);

        // Net signed effect: + = analgesia, - = hyperalgesia
        const net = analgesia - hyperalgesia;

        data.push({
            s: Number(s.toFixed(3)),
            Analgesia: Number(analgesia.toFixed(4)),
            Hyperalgesia: Number((-hyperalgesia).toFixed(4)), // plot as negative values
            Net: Number(net.toFixed(4)),
            PriorWeight: Number(w.toFixed(3)),
        });
    }
    return data;
}

const Viewer = forwardRef<ViewerRef>((_, ref) => {
    const [params, setParams] = useState<SimulationParams>({
        priorPrecision: 2.0,
        sensoryPrecision: 1.5,
        attention: 0.0,
        rOpioid: 1.0,
        rCB1: 0.8,
        rCCK: 0.8,
        conditioning: 0.7,
        naloxone: 0.0,
        rimonabant: 0.0,
        proglumide: 0.0,
    });

    useImperativeHandle(ref, () => ({
        updateSimulation: (newParams: SimulationParams) => {
            setParams(newParams);
        },
        reset: () => {
            setParams({
                priorPrecision: 2.0,
                sensoryPrecision: 1.5,
                attention: 0.0,
                rOpioid: 1.0,
                rCB1: 0.8,
                rCCK: 0.8,
                conditioning: 0.7,
                naloxone: 0.0,
                rimonabant: 0.0,
                proglumide: 0.0,
            });
        },
    }));

    const data = useMemo(() => simulate(params), [params]);

    return (
        <div className="w-full h-full bg-black border border-lime-500/20 p-6 overflow-auto">
            <div className="space-y-6">
                <div className="bg-black border border-lime-500/20 p-4">
                    <h3 className="text-lime-400 font-semibold mb-4">Placebo/Nocebo vs Cue–Drug Similarity</h3>
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
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
                                        value: 'Cue–drug similarity',
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
                                    formatter={(value: number) => value.toFixed(4)}
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
                    <h3 className="text-lime-400 font-semibold mb-3">Model Equation</h3>
                    <div className="text-sm text-gray-300 space-y-2 font-mono">
                        <div>Analgesia = saturate(w · s₊ · [r_μ(1−naloxone) + r_CB1(1−rimonabant)·conditioning])</div>
                        <div>Nocebo = saturate(w · s₋ · r_CCK(1−proglumide))</div>
                        <div>Net = Analgesia − Nocebo</div>
                        <div className="mt-3 text-gray-400">
                            where saturate(x) = x/(1+|x|), s₊ = max(0,s), s₋ = max(0,−s), w = Π_p/(Π_p + Π_y(1+attention))
                        </div>
                    </div>
                </div>

                <div className="bg-black border border-lime-500/20 p-4">
                    <h3 className="text-lime-400 font-semibold mb-3">Interpretation Guide</h3>
                    <div className="text-sm text-gray-300 space-y-2">
                        <p>
                            <strong className="text-lime-400">Similarity axis:</strong> Moves from strong nocebo-like
                            cues (−1) through neutral context (0) to strong drug-like cues (+1).
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
