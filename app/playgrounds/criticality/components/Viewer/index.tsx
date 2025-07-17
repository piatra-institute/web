import { useEffect, useRef, useState, forwardRef, useImperativeHandle, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { runTrials, slopeEstimate, generateBifurcationData, getRegime } from '../../logic';



interface ViewerProps {
    sigma: number;
    refreshKey: number;
}

const Viewer = forwardRef<{ exportCanvas: () => void }, ViewerProps>(({
    sigma,
    refreshKey,
}, ref) => {
    const [distribution, setDistribution] = useState<{ size: number; freq: number }[]>([]);
    const [meanSize, setMeanSize] = useState(0);
    const [alpha, setAlpha] = useState<number | null>(null);

    // Pre-compute bifurcation diagram once
    const bifurcationData = useMemo(() => generateBifurcationData(), []);

    useImperativeHandle(ref, () => ({
        exportCanvas: () => {
            // For recharts, we'd need to implement a different export mechanism
            console.log('Export functionality would need to be implemented for recharts');
        }
    }));

    // Run simulation
    const simulate = useCallback(() => {
        const { data, meanSize } = runTrials(sigma);
        setDistribution(data);
        setMeanSize(meanSize);
        setAlpha(slopeEstimate(data));
    }, [sigma]);

    // Run simulation on mount and when sigma or refreshKey changes
    useEffect(() => {
        simulate();
    }, [simulate, refreshKey]);

    const regime = getRegime(sigma);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black p-3 shadow-lg border border-gray-800" style={{ backgroundColor: '#000000' }}>
                    <p className="text-white font-semibold" style={{ color: '#ffffff' }}>
                        {payload[0].name === 'freq' ? `Size: ${label}` : `σ: ${label}`}
                    </p>
                    <p className="text-sm text-gray-300" style={{ color: '#d1d5db' }}>
                        {payload[0].name}: {payload[0].value.toFixed(2)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-6xl space-y-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Criticality Explorer
                    </h2>
                    <p className="text-gray-400 text-sm">
                        σ = {sigma.toFixed(2)} ({regime}) | Mean size ≈ {meanSize.toFixed(1)} |
                        {alpha !== null && ` α ≈ ${alpha.toFixed(2)}`}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Avalanche Distribution */}
                    <div className="bg-black border border-gray-800 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Avalanche Size Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart
                                data={distribution}
                                margin={{ top: 10, right: 30, left: 40, bottom: 40 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                <XAxis
                                    dataKey="size"
                                    type="number"
                                    scale="log"
                                    domain={['auto', 'auto']}
                                    stroke="#9CA3AF"
                                    tick={{ fill: '#9CA3AF' }}
                                    label={{ value: 'Size', position: 'insideBottom', offset: -10, fill: '#9CA3AF' }}
                                />
                                <YAxis
                                    dataKey="freq"
                                    type="number"
                                    scale="log"
                                    domain={['auto', 'auto']}
                                    stroke="#9CA3AF"
                                    tick={{ fill: '#9CA3AF' }}
                                    label={{ value: 'Frequency', angle: -90, position: 'insideLeft', fill: '#9CA3AF', offset: 10 }}
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="freq"
                                    stroke="#84cc16"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                        <p className="mt-2 text-center text-xs text-gray-400">Log-log plot</p>
                    </div>

                    {/* Bifurcation Diagram */}
                    <div className="bg-black border border-gray-800 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Bifurcation Diagram</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart
                                data={bifurcationData}
                                margin={{ top: 10, right: 30, left: 40, bottom: 40 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                <XAxis
                                    dataKey="sigma"
                                    domain={[0.5, 1.5]}
                                    stroke="#9CA3AF"
                                    tick={{ fill: '#9CA3AF' }}
                                    label={{ value: 'σ (branching parameter)', position: 'insideBottom', offset: -10, fill: '#9CA3AF' }}
                                />
                                <YAxis
                                    dataKey="alpha"
                                    stroke="#9CA3AF"
                                    tick={{ fill: '#9CA3AF' }}
                                    label={{ value: 'α (power-law exponent)', angle: -90, position: 'insideLeft', fill: '#9CA3AF', offset: 10 }}
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="alpha"
                                    stroke="#84cc16"
                                    strokeWidth={2}
                                    dot={false}
                                />
                                <ReferenceLine
                                    x={sigma}
                                    stroke="#ef4444"
                                    strokeDasharray="5 5"
                                    label={{ value: "Current σ", position: "insideTopRight", fill: '#ef4444', offset: 10 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                        <p className="mt-2 text-center text-xs text-gray-400">Power-law exponent α vs σ</p>
                    </div>
                </div>

                {/* Details Panel */}
                <details className="bg-black border border-gray-800 p-6">
                    <summary className="cursor-pointer text-lg font-semibold text-white select-none">
                        Direct Answer: d² distance-to-criticality metric
                    </summary>
                    <div className="mt-4 text-sm text-gray-300 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold text-lime-400 mb-2">Key Concepts</h4>
                                <dl className="space-y-2">
                                    <div>
                                        <dt className="font-medium text-white">d² Metric:</dt>
                                        <dd className="text-gray-400">Dimensionless distance from criticality; zero at perfect scale-invariance</dd>
                                    </div>
                                    <div>
                                        <dt className="font-medium text-white">Computation:</dt>
                                        <dd className="text-gray-400">d² = Σₛ [Λₛ − 1]² across timescale shells</dd>
                                    </div>
                                    <div>
                                        <dt className="font-medium text-white">Benefits:</dt>
                                        <dd className="text-gray-400">Noise-robust, time-resolved, comparable across systems</dd>
                                    </div>
                                </dl>
                            </div>
                            <div>
                                <h4 className="font-semibold text-lime-400 mb-2">Typical Values</h4>
                                <dl className="space-y-2">
                                    <div>
                                        <dt className="font-medium text-white">d² ≈ 0.00–0.05:</dt>
                                        <dd className="text-gray-400">Near-critical; maximal dynamic range</dd>
                                    </div>
                                    <div>
                                        <dt className="font-medium text-white">d² ≈ 0.05–0.15:</dt>
                                        <dd className="text-gray-400">Mild deviation; typical of state changes</dd>
                                    </div>
                                    <div>
                                        <dt className="font-medium text-white">d² {'>'} 0.20:</dt>
                                        <dd className="text-gray-400">Far from critical; reduced scale-invariance</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        <div className="border-t border-gray-800 pt-4">
                            <h4 className="font-semibold text-lime-400 mb-2">Evidence</h4>
                            <ul className="list-disc list-inside space-y-1 text-gray-400">
                                <li>Hengen & Shew 2024-25 methodological series</li>
                                <li>Mouse V1 dataset validating d² across states</li>
                                <li>Meta-analysis of 140 datasets (Neuron 2025)</li>
                            </ul>
                        </div>
                    </div>
                </details>
            </div>
        </div>
    );
});

Viewer.displayName = 'Viewer';

export default Viewer;
