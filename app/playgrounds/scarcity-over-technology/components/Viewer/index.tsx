'use client';

import { useRef, forwardRef, useImperativeHandle, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot } from 'recharts';

interface ViewerProps {
    technology: number;
    users: number;
    techEfficacy: number;
    friction: number;
    corruption: number;
    attentionEnabled: boolean;
    attention: number;
}

const Viewer = forwardRef<{ exportCanvas: () => void }, ViewerProps>(({
    technology,
    users,
    techEfficacy,
    friction,
    corruption,
    attentionEnabled,
    attention,
}, ref) => {
    const chartRef = useRef<HTMLDivElement>(null);

    const C0 = 100;

    function formatNumber(num: number): string {
        if (!isFinite(num)) {
            return num === Infinity ? '∞' : 'N/A';
        }
        if (num === 0) return '0.00';

        const absNum = Math.abs(num);

        if (absNum > 0 && absNum < 0.01) {
            return num.toExponential(2);
        }

        const formatter = new Intl.NumberFormat('en-US', {
            notation: 'compact',
            compactDisplay: 'short',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        return formatter.format(num);
    }

    function calculateCapacity(T: number, k: number, f: number): number {
        if (T <= 0) return 0;
        return (1 - f) * C0 * Math.pow(T, k);
    }

    function calculateModel(T: number, N: number, k: number, f: number, h: number, A: number, isAttentionEnabled: boolean) {
        if (N === 0) {
            return { scarcity: 0, welfare: 0, allocation: Infinity, activeConstraint: 'material' };
        }

        const producedCapacity = calculateCapacity(T, k, f);
        const availableCapacity = producedCapacity * (1 - h);

        let bindingCapacity = availableCapacity;
        let activeConstraint = 'material';

        if (isAttentionEnabled && A < availableCapacity) {
            bindingCapacity = A;
            activeConstraint = 'attention';
        }

        if (bindingCapacity <= 0) {
            return { scarcity: Infinity, welfare: -Infinity, allocation: 0, activeConstraint };
        }

        const scarcity = N / bindingCapacity;
        const allocation = bindingCapacity / N;
        const welfare = N * Math.log(allocation);

        return { scarcity, welfare, allocation, activeConstraint };
    }

    function calculateDerivatives(T: number, N: number, k: number, f: number, h: number, A: number, isAttentionEnabled: boolean) {
        const step = 0.01;

        const current = calculateModel(T, N, k, f, h, A, isAttentionEnabled);
        const next = calculateModel(T + step, N, k, f, h, A, isAttentionEnabled);

        if (isFinite(current.scarcity) && isFinite(next.scarcity)) {
            const dLambda_dT = (next.scarcity - current.scarcity) / step;
            const dW_dT = (next.welfare - current.welfare) / step;
            return { dLambda_dT, dW_dT };
        }
        return { dLambda_dT: 0, dW_dT: 0 };
    }

    useImperativeHandle(ref, () => ({
        exportCanvas: () => {
            if (chartRef.current) {
                // For recharts, we'd need to implement a more complex export
                // For now, we'll use a simple approach
                console.log('Export functionality would be implemented here');
            }
        }
    }));

    const chartData = useMemo(() => {
        const maxTech = 100;
        return Array.from({ length: maxTech }, (_, i) => {
            const T = i + 1;
            const result = calculateModel(T, users, techEfficacy, friction, corruption, attention, attentionEnabled);
            return {
                technology: T,
                scarcity: isFinite(result.scarcity) ? result.scarcity : null,
            };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [users, techEfficacy, friction, corruption, attentionEnabled, attention]);

    const { scarcity, welfare, activeConstraint } = calculateModel(
        technology, users, techEfficacy, friction, corruption, attention, attentionEnabled
    );
    const { dLambda_dT, dW_dT } = calculateDerivatives(
        technology, users, techEfficacy, friction, corruption, attention, attentionEnabled
    );

    return (
        <div className="w-full h-full bg-black flex flex-col items-center justify-center p-4 space-y-4" style={{ minHeight: '90vh' }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full max-w-6xl">
                <div className="bg-black border border-lime-500/20 p-4 text-center">
                    <p className="text-sm text-gray-400">Material Scarcity (λ)</p>
                    <p className={`text-2xl font-bold ${activeConstraint === 'attention' ? 'text-amber-400' : 'text-lime-500'}`}>
                        {formatNumber(scarcity)}
                    </p>
                </div>
                <div className="bg-black border border-lime-500/20 p-4 text-center">
                    <p className="text-sm text-gray-400">The &ldquo;Economy&rdquo; (∂λ/∂T)</p>
                    <p className="text-2xl font-bold text-lime-500">
                        {formatNumber(dLambda_dT)}
                    </p>
                </div>
                <div className="bg-black border border-lime-500/20 p-4 text-center">
                    <p className="text-sm text-gray-400">Total Welfare (W)</p>
                    <p className="text-2xl font-bold text-lime-500">
                        {formatNumber(welfare)}
                    </p>
                </div>
                <div className="bg-black border border-lime-500/20 p-4 text-center">
                    <p className="text-sm text-gray-400">Welfare Growth (∂W/∂T)</p>
                    <p className="text-2xl font-bold text-lime-500">
                        {isFinite(dW_dT) && dW_dT >= 0 ? '+' : ''}{formatNumber(dW_dT)}
                    </p>
                </div>
            </div>

            <div className="w-full max-w-6xl flex-1 bg-black border border-lime-500/20 p-4 flex flex-col">
                <h2 className="text-lg font-semibold text-lime-500 mb-4">Scarcity vs. Technology</h2>
                <div className="flex flex-1">
                    <div className="flex items-center justify-center mr-2">
                        <span className="text-gray-400 text-sm -rotate-90 whitespace-nowrap">Scarcity (λ)</span>
                    </div>
                    <div className="flex-1 flex flex-col">
                        <div ref={chartRef} className="flex-1" style={{ minHeight: 'calc(90vh - 250px)' }}>
                            <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 50, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                            <XAxis 
                                dataKey="technology" 
                                stroke="#9ca3af"
                                tick={{ fill: '#9ca3af' }}
                            />
                            <YAxis 
                                stroke="#9ca3af"
                                tick={{ fill: '#9ca3af' }}
                                tickFormatter={(value) => {
                                    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
                                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                                    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                                    return value.toFixed(0);
                                }}
                                domain={['dataMin * 0.95', 'dataMax * 1.05']}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#000000', border: '1px solid #84cc16' }}
                                labelStyle={{ color: '#84cc16' }}
                                formatter={(value: any) => {
                                    if (value === null || value === undefined) return 'N/A';
                                    return typeof value === 'number' ? value.toFixed(2) : value;
                                }}
                            />
                            <Legend 
                                wrapperStyle={{ color: '#9ca3af' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="scarcity" 
                                stroke="#84cc16" 
                                strokeWidth={2}
                                dot={false}
                                name="Scarcity (λ)"
                            />
                            <ReferenceDot 
                                x={technology} 
                                y={scarcity} 
                                r={6} 
                                fill="#ef4444" 
                                stroke="#fff"
                                strokeWidth={2}
                            />
                        </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-center mt-2">
                            <span className="text-gray-400 text-sm">Technology Level (T)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

Viewer.displayName = 'Viewer';

export default Viewer;