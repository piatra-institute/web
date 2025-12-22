'use client';

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';

interface ViewerProps {
    data: any[];
    running: boolean;
    onToggleRunning: () => void;
    onStep: () => void;
    risk: number;
    currentState: {
        u: number;
        t: number;
        v: number;
        tau: number;
    };
}

const Viewer = forwardRef(({ 
    data, 
    running, 
    onToggleRunning, 
    onStep,
    risk,
    currentState
}: ViewerProps, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => ({
        exportCanvas: () => {
            if (canvasRef.current) {
                const dataUrl = canvasRef.current.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = 'truth-violence-dynamics.png';
                link.href = dataUrl;
                link.click();
            }
        }
    }));

    // Risk indicator color
    const getRiskColor = (r: number) => {
        if (r > 0.05) return 'text-white bg-gray-900 border-gray-700';
        if (r > -0.05) return 'text-gray-300 bg-gray-900 border-gray-700';
        return 'text-lime-400 bg-black border-lime-900';
    };

    const formatNumber = (n: number) => {
        if (Math.abs(n) < 0.01) return n.toExponential(2);
        return n.toFixed(3);
    };

    return (
        <div className="space-y-6">
            {/* Status Header */}
            <div className="flex items-center justify-between p-4 bg-black border border-gray-800">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${running ? 'bg-lime-400 animate-pulse' : 'bg-gray-600'}`} />
                        <span className="text-sm text-gray-300">
                            {running ? 'Running' : 'Paused'}
                        </span>
                    </div>
                    <div className="text-sm text-gray-400">
                        τ = {currentState.tau.toFixed(2)}
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 text-xs font-medium border ${getRiskColor(risk)}`}>
                        Risk Index: {formatNumber(risk)}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onToggleRunning}
                            className="px-4 py-1.5 text-sm bg-lime-50 hover:bg-lime-200 text-black font-medium transition-colors"
                        >
                            {running ? 'Pause' : 'Run'}
                        </button>
                        <button
                            onClick={onStep}
                            className="px-4 py-1.5 text-sm bg-black hover:bg-gray-900 text-white border border-gray-700 transition-colors"
                        >
                            Step
                        </button>
                    </div>
                </div>
            </div>

            {/* Current State Display */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-black border border-gray-800">
                    <div className="text-xs text-gray-400 mb-1">Pressure (u)</div>
                    <div className="text-2xl font-mono text-lime-400">{formatNumber(currentState.u)}</div>
                    <div className="text-xs text-gray-500 mt-1">Uncertainty/contradiction level</div>
                </div>
                <div className="p-4 bg-black border border-gray-800">
                    <div className="text-xs text-gray-400 mb-1">Truth-seeking (t)</div>
                    <div className="text-2xl font-mono text-lime-400">{formatNumber(currentState.t)}</div>
                    <div className="text-xs text-gray-500 mt-1">Share of population</div>
                </div>
                <div className="p-4 bg-black border border-gray-800">
                    <div className="text-xs text-gray-400 mb-1">Punitive Support (v)</div>
                    <div className="text-2xl font-mono text-lime-400">{formatNumber(currentState.v)}</div>
                    <div className="text-xs text-gray-500 mt-1">Support for violence</div>
                </div>
            </div>

            {/* Main State Variables Chart */}
            <div className="bg-black border border-gray-800 p-4">
                <h3 className="text-sm font-semibold text-lime-400 mb-4">State Variables (t, u, v)</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                                dataKey="time" 
                                stroke="#6b7280"
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                tickFormatter={(value) => value.toFixed(1)}
                            />
                            <YAxis 
                                yAxisId="left"
                                stroke="#6b7280"
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                tickFormatter={(value) => value.toFixed(1)}
                                domain={[0, 1]}
                            />
                            <YAxis 
                                yAxisId="right"
                                orientation="right"
                                stroke="#6b7280"
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                tickFormatter={(value) => value.toFixed(1)}
                                domain={[0, 'auto']}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#000000', 
                                    border: '1px solid #374151',
                                    borderRadius: '0'
                                }}
                                labelStyle={{ color: '#9ca3af' }}
                                formatter={(value: any) => {
                                    const num = typeof value === 'number' ? value : parseFloat(value);
                                    return isNaN(num) ? value : num.toFixed(4);
                                }}
                            />
                            <Legend 
                                wrapperStyle={{ color: '#e5e7eb' }}
                                iconType="line"
                            />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="t"
                                name="t (truth share)"
                                stroke="#84cc16"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="u"
                                name="u (pressure)"
                                stroke="#ffffff"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="v"
                                name="v (punitive)"
                                stroke="#6b7280"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Drivers & Risk Chart */}
            <div className="bg-black border border-gray-800 p-4">
                <h3 className="text-sm font-semibold text-lime-400 mb-4">Drivers & Risk (E, M, I_T, R)</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                                dataKey="time"
                                stroke="#6b7280"
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                tickFormatter={(value) => value.toFixed(1)}
                            />
                            <YAxis 
                                stroke="#6b7280"
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                tickFormatter={(value) => value.toFixed(2)}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#000000', 
                                    border: '1px solid #374151',
                                    borderRadius: '0'
                                }}
                                labelStyle={{ color: '#9ca3af' }}
                                formatter={(value: any) => {
                                    const num = typeof value === 'number' ? value : parseFloat(value);
                                    return isNaN(num) ? value : num.toFixed(4);
                                }}
                            />
                            <Legend 
                                wrapperStyle={{ color: '#e5e7eb' }}
                                iconType="line"
                            />
                            <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="4 4" />
                            <Line
                                type="monotone"
                                dataKey="E"
                                name="E (elite cues)"
                                stroke="#d4d4d8"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="M"
                                name="M (misinfo)"
                                stroke="#a1a1aa"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="IT"
                                name="I_T (institutions)"
                                stroke="#84cc16"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="R"
                                name="R (risk index)"
                                stroke="#bef264"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Model Insights */}
            <div className="bg-black border border-gray-800 p-4">
                <h3 className="text-sm font-semibold text-lime-400 mb-3">Model Insights</h3>
                <div className="space-y-2 text-xs text-gray-300">
                    <div className="flex items-start gap-2">
                        <span className="text-lime-400">▸</span>
                        <p>
                            <span className="font-semibold">Tipping Point:</span> When R = φ·u·(1−t)·S(E) + ψE − λ {'>'} 0 persistently, 
                            v (punitive support) tends to grow, potentially triggering a cascade.
                        </p>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-lime-400">▸</span>
                        <p>
                            <span className="font-semibold">Venting vs Backfire:</span> Higher α₄ provides short-term pressure relief through repression, 
                            but higher α₅ creates long-term amplification when violence is sustained.
                        </p>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-lime-400">▸</span>
                        <p>
                            <span className="font-semibold">Truth Stabilization:</span> Strengthen institutions (↑I_T via β₁) and reduce harm 
                            from pressure/violence (↓β₂, β₃) to maintain truth-seeking behavior.
                        </p>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-lime-400">▸</span>
                        <p>
                            <span className="font-semibold">Pulse Testing:</span> Add temporary shocks to E or M to test system resilience. 
                            Increase λ (accountability) to dampen violence support.
                        </p>
                    </div>
                </div>
            </div>

            {/* Hidden canvas for export */}
            <canvas ref={canvasRef} style={{ display: 'none' }} width={1200} height={800} />
        </div>
    );
});

Viewer.displayName = 'Viewer';

export default Viewer;