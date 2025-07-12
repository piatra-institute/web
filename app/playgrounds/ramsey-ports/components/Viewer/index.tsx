import { useRef, forwardRef, useImperativeHandle } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateOutcomes, formatValue } from '../../logic';



interface ViewerProps {
    selectedAirport: string;
    ramseyLambda: number;
    networkEffect: number;
}

const Viewer = forwardRef<{ exportCanvas: () => void }, ViewerProps>(({
    selectedAirport,
    ramseyLambda,
    networkEffect,
}, ref) => {
    const chartRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        exportCanvas: () => {
            // For recharts, we'd need a different approach to export
            // This is a simplified version
            console.log('Export functionality would need to be implemented differently for recharts');
        }
    }));

    const outcomes = calculateOutcomes(selectedAirport, ramseyLambda, networkEffect);

    const chartData = [
        {
            name: 'Social Welfare',
            'Current Model': outcomes.current.welfare,
            'Privatized Model': outcomes.private.welfare,
        },
        {
            name: 'Total Profit',
            'Current Model': outcomes.current.profits,
            'Privatized Model': outcomes.private.profits,
        },
        {
            name: 'Consumer Surplus',
            'Current Model': outcomes.current.cs,
            'Privatized Model': outcomes.private.cs,
        }
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black p-3 shadow-lg border border-gray-800">
                    <p className="text-white font-semibold mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {formatValue(entry.value)}M
                        </p>
                    ))}
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
                        Economic Outcomes for {selectedAirport}
                    </h2>
                    <p className="text-gray-400 text-sm">
                        Comparing Current Model (observed) with Privatized Model (simulated)
                    </p>
                </div>

                <div ref={chartRef} className="relative w-full h-[450px] max-h-[60vh]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                            <XAxis 
                                dataKey="name" 
                                stroke="#9CA3AF"
                                tick={{ fill: '#9CA3AF' }}
                            />
                            <YAxis 
                                stroke="#9CA3AF"
                                tick={{ fill: '#9CA3AF' }}
                                tickFormatter={(value) => `${formatValue(value)}M`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend 
                                wrapperStyle={{ color: '#9CA3AF' }}
                            />
                            <Bar 
                                dataKey="Current Model" 
                                fill="rgba(132, 204, 22, 0.8)" 
                                stroke="#84cc16"
                                strokeWidth={2}
                            />
                            <Bar 
                                dataKey="Privatized Model" 
                                fill="rgba(239, 68, 68, 0.8)" 
                                stroke="#ef4444"
                                strokeWidth={2}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-black border border-gray-800 p-6">
                        <h4 className="font-bold text-lime-400 mb-4">Current Model (Observed)</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Social Welfare:</span>
                                <span className="font-semibold text-white">
                                    {formatValue(outcomes.current.welfare)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Total Surplus (Profit):</span>
                                <span className="font-semibold text-white">
                                    {formatValue(outcomes.current.profits)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Consumer Surplus:</span>
                                <span className="font-semibold text-white">
                                    {formatValue(outcomes.current.cs)}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-black border border-gray-800 p-6">
                        <h4 className="font-bold text-red-400 mb-4">Privatized Model (Simulated)</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Social Welfare:</span>
                                <span className="font-semibold text-white">
                                    {formatValue(outcomes.private.welfare)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Total Surplus (Profit):</span>
                                <span className="font-semibold text-white">
                                    {formatValue(outcomes.private.profits)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Consumer Surplus:</span>
                                <span className="font-semibold text-white">
                                    {formatValue(outcomes.private.cs)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

Viewer.displayName = 'Viewer';

export default Viewer;