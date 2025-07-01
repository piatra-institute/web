'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface MetricsOverlayProps {
    entropyValue: number;
    complexityValue: number;
    entropyHistory: number[];
    complexityHistory: number[];
}

export default function MetricsOverlay({
    entropyValue,
    complexityValue,
    entropyHistory,
    complexityHistory,
}: MetricsOverlayProps) {
    // Convert history arrays to chart data format
    const entropyData = React.useMemo(() => 
        entropyHistory.map((value, index) => ({
            index,
            value,
        })), [entropyHistory]);

    const complexityData = React.useMemo(() =>
        complexityHistory.map((value, index) => ({
            index,
            value,
        })), [complexityHistory]);

    return (
        <div className="absolute top-4 right-4 w-80 bg-black/50 backdrop-blur-sm p-4 rounded-lg pointer-events-none">
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-baseline mb-2">
                        <h3 className="text-sm font-medium text-white/80">Entropy</h3>
                        <span className="font-mono text-lg text-green-400">
                            {entropyValue.toFixed(3)}
                        </span>
                    </div>
                    <div className="h-20">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={entropyData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                                <XAxis dataKey="index" hide />
                                <YAxis hide domain={[0, 'dataMax']} />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#4ade80"
                                    strokeWidth={2}
                                    dot={false}
                                    animationDuration={200}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-baseline mb-2">
                        <h3 className="text-sm font-medium text-white/80">Complexity</h3>
                        <span className="font-mono text-lg text-purple-400">
                            {complexityValue}
                        </span>
                    </div>
                    <div className="h-20">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={complexityData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                                <XAxis dataKey="index" hide />
                                <YAxis hide domain={[0, 'dataMax']} />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#a855f7"
                                    strokeWidth={2}
                                    dot={false}
                                    animationDuration={200}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}