'use client';

import { useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend, AreaChart, Area } from 'recharts';
import {
    initAgents, simulateStep, calculateMetrics,
    SimulationState, StepResult, DataPoint
} from '../../logic';



interface ViewerProps {
    numAgents: number;
    steps: number;
    m: number;
    lambdaRefine: number;
    thetaRef: number;
    fragDecay: number;
    alphaCoalition: number;
    Cstar: number;
    dFactor: number;
    infoGain: number;
    baseD: number;
    w1: number;
    w2: number;
    w3: number;
    w4: number;
    w5: number;
    thetaCMS: number;
    shockMode: boolean;
}

const Viewer = forwardRef<{ exportCanvas: () => void }, ViewerProps>((props, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        exportCanvas: () => {
            if (!containerRef.current) return;
            // For chart export, we'd need to implement a more complex solution
            // For now, we'll just alert the user
            alert('Chart export is not yet implemented for this playground');
        }
    }));

    const data = useMemo(() => {
        const agents = initAgents(props.numAgents);
        let history: DataPoint[] = [];
        let Sarr: number[] = [], Aarr: number[] = [], Barr: number[] = [];
        let prev: StepResult | null = null;
        let H = 0.1;

        for (let t = 0; t < props.steps; t++) {
            // Opportunities and Baseline salience
            let O = 1.0;
            let B = 0.4 + 0.2 * Math.sin(t / 12);
            if (props.shockMode && t % 40 === 20) B += 0.6;
            if (props.shockMode && t % 50 === 10) O += 0.7;

            const state: SimulationState = {
                agents, H, O, B,
                m: props.m,
                lambdaRefine: props.lambdaRefine,
                thetaRef: props.thetaRef,
                fragDecay: props.fragDecay,
                alphaCoalition: props.alphaCoalition,
                Cstar: props.Cstar,
                dFactor: props.dFactor,
                infoGain: props.infoGain,
                baseD: props.baseD,
                w1: props.w1,
                w2: props.w2,
                w3: props.w3,
                w4: props.w4,
                w5: props.w5,
                thetaCMS: props.thetaCMS,
                prev
            };

            const res = simulateStep(state);
            H = res.H;

            Sarr.push(res.S);
            Aarr.push(res.A);
            Barr.push(B);

            const metrics = calculateMetrics(
                res, prev, Sarr, Aarr, Barr,
                { w1: props.w1, w2: props.w2, w3: props.w3, w4: props.w4, w5: props.w5 },
                props.thetaCMS
            );

            history.push({
                t, ...res, ...metrics, B, O
            });

            prev = res;
        }

        return history;
    }, [props]);

    const last = data[data.length - 1] || {};

    // Custom tooltip with better styling
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black border border-gray-800 p-3 text-xs">
                    <p className="text-gray-400 mb-1">Step {label}</p>
                    {payload.map((entry: any) => (
                        <p key={entry.dataKey} style={{ color: entry.color }}>
                            {entry.name}: {entry.value.toFixed(3)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div ref={containerRef} className="w-full h-full bg-black p-6 space-y-6">
            {/* Key Metrics Display */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <MetricCard label="S (Signaling)" value={last.S} color="text-red-400" />
                <MetricCard label="A (Agency)" value={last.A} color="text-blue-400" />
                <MetricCard label="SI" value={last.SI} color="text-purple-400" />
                <MetricCard label="CMS" value={last.CMS} color="text-teal-400" />
                <MetricCard label="C (Coalition)" value={last.C} color="text-green-400" />
                <MetricCard label="H (Fragmentation)" value={last.H} color="text-orange-400" />
                <MetricCard label="D (Distortion)" value={last.D} color="text-indigo-400" />
                <MetricCard
                    label="Phase"
                    value={last.phase}
                    color={
                        last.phase === 'Emancipatory' ? 'text-green-400' :
                        last.phase === 'Anesthetic' ? 'text-red-400' :
                        'text-gray-400'
                    }
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Signaling vs Agency */}
                <ChartCard title="Signaling vs Agency">
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <XAxis dataKey="t" stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                            <YAxis stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 10 }} domain={[0, 'auto']} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ color: '#e5e7eb' }} />
                            <Line type="monotone" dataKey="S" stroke="#ef4444" name="Signaling" dot={false} strokeWidth={2} />
                            <Line type="monotone" dataKey="A" stroke="#3b82f6" name="Agency" dot={false} strokeWidth={2} />
                            <ReferenceLine y={0} stroke="#4b5563" strokeDasharray="3 3" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Substitution Index & CMS */}
                <ChartCard title="Substitution Index (SI) & CMS">
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <XAxis dataKey="t" stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                            <YAxis stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ color: '#e5e7eb' }} />
                            <Line type="monotone" dataKey="SI" stroke="#a855f7" name="SI" dot={false} strokeWidth={2} />
                            <Line type="monotone" dataKey="CMS" stroke="#14b8a6" name="CMS" dot={false} strokeWidth={2} />
                            <ReferenceLine y={0} stroke="#4b5563" strokeDasharray="3 3" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Coalition & Fragmentation */}
                <ChartCard title="Coalition (C) & Fragmentation (H)">
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <XAxis dataKey="t" stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                            <YAxis stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 10 }} domain={[0, 1]} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ color: '#e5e7eb' }} />
                            <Line type="monotone" dataKey="C" stroke="#10b981" name="Coalition" dot={false} strokeWidth={2} />
                            <Line type="monotone" dataKey="H" stroke="#f59e0b" name="Fragmentation" dot={false} strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Distortion */}
                <ChartCard title="Distortion (D)">
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <XAxis dataKey="t" stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                            <YAxis stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="D" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Phase Timeline */}
            <div className="bg-black border border-gray-800 p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Phase Timeline</h3>
                <div className="flex w-full h-8 border border-gray-800 overflow-hidden">
                    {data.map(d => (
                        <div
                            key={d.t}
                            title={`t=${d.t} ${d.phase}`}
                            style={{
                                width: `${100 / data.length}%`,
                                backgroundColor:
                                    d.phase === 'Emancipatory' ? '#10b981' :
                                    d.phase === 'Anesthetic' ? '#ef4444' :
                                    '#1f2937'
                            }}
                        />
                    ))}
                </div>
                <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-500" />
                            <span className="text-gray-400">Emancipatory</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-500" />
                            <span className="text-gray-400">Anesthetic</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-gray-700" />
                            <span className="text-gray-400">Neutral</span>
                        </div>
                    </div>
                    <div className="text-xs text-gray-400">
                        <span>0</span> — <span>{data.length - 1}</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

Viewer.displayName = 'Viewer';

function MetricCard({ label, value, color }: { label: string; value: any; color: string }) {
    return (
        <div className="bg-black border border-gray-800 p-3">
            <div className="text-xs text-gray-400">{label}</div>
            <div className={`text-lg font-semibold tabular-nums ${color}`}>
                {typeof value === 'number' ? value.toFixed(3) : value || '—'}
            </div>
        </div>
    );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-black border border-gray-800 p-4">
            <h3 className="text-sm font-semibold text-white mb-3">{title}</h3>
            {children}
        </div>
    );
}

export default Viewer;
