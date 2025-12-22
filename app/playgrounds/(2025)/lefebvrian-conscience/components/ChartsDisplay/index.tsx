import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend as RechartsLegend, ResponsiveContainer, Label
} from 'recharts';

import {
    AWARENESS_MAX_LEVEL,
    ChartDataPoint,
} from '../../lib/agent';

interface ChartsDisplayProps {
    chartData: ChartDataPoint[];
}

const ChartsDisplay: React.FC<ChartsDisplayProps> = ({ chartData }) => {

    // Prepare data for Recharts (it expects an array of objects)
    // Filter out potential NaN values for smoother lines if needed, or handle in Tooltip/Line
    const filteredData = chartData.map(d => ({
        time: d.time,
        avgResTotal: d.avgResTotal ?? undefined, // Recharts can handle undefined better than NaN sometimes
        avgResGroupA: d.avgResGroupA ?? undefined,
        avgResGroupB: d.avgResGroupB ?? undefined,
        avgAwareness: d.avgAwareness ?? undefined,
        avgGuilt: d.avgGuilt ?? undefined,
        avgSuffering: d.avgSuffering ?? undefined,
    }));

    if (chartData.length === 0) {
        return (
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4">
                <h4 className="text-white/80 font-medium mb-2">Analytics</h4>
                <div className="text-white/60 text-sm italic p-4 text-center">
                    Charts will appear here after starting the simulation.
                </div>
            </div>
        );
    }

    return (
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4">
            <h4 className="text-white/80 font-medium mb-4">Analytics</h4>

            {/* Resource Chart */}
            <div className="mb-6">
                <h5 className="text-white/70 text-sm font-medium mb-2">Average Resources Over Time</h5>
                <div className="bg-black/30 p-2 rounded">
                    <ResponsiveContainer width="100%" minHeight={0} minWidth={0} height={200}>
                        <LineChart data={filteredData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)"/>
                            <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)">
                                <Label value="Time (frames)" offset={-15} position="insideBottom" fill="rgba(255,255,255,0.5)" />
                            </XAxis>
                            <YAxis stroke="rgba(255,255,255,0.5)" domain={['dataMin - 5', 'dataMax + 5']}>
                                <Label value="Avg Res" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} fill="rgba(255,255,255,0.5)" />
                            </YAxis>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: '1px solid #555', color: 'white', fontSize: '0.9em' }}
                                formatter={(value) => typeof value === 'number' ? value.toFixed(1) : 'N/A'}
                            />
                            <RechartsLegend verticalAlign="top" height={30} wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }}/>
                            <Line type="monotone" dataKey="avgResTotal" name="Total" stroke="rgb(75, 192, 192)" strokeWidth={2} dot={false} connectNulls />
                            <Line type="monotone" dataKey="avgResGroupA" name="Group A" stroke="rgb(54, 162, 235)" strokeWidth={2} dot={false} connectNulls />
                            <Line type="monotone" dataKey="avgResGroupB" name="Group B" stroke="rgb(255, 159, 64)" strokeWidth={2} dot={false} connectNulls />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Awareness Chart */}
            <div className="mb-6">
                <h5 className="text-white/70 text-sm font-medium mb-2">Average Awareness Level Over Time</h5>
                <div className="bg-black/30 p-2 rounded">
                    <ResponsiveContainer width="100%" minHeight={0} minWidth={0} height={200}>
                        <LineChart data={filteredData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)"/>
                            <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)">
                                <Label value="Time (frames)" offset={-15} position="insideBottom" fill="rgba(255,255,255,0.5)" />
                            </XAxis>
                            <YAxis stroke="rgba(255,255,255,0.5)" domain={[0, AWARENESS_MAX_LEVEL]}>
                                <Label value="Avg Aware Lvl" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} fill="rgba(255,255,255,0.5)" />
                            </YAxis>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: '1px solid #555', color: 'white', fontSize: '0.9em' }}
                                formatter={(value) => typeof value === 'number' ? value.toFixed(2) : 'N/A'}
                            />
                            <RechartsLegend verticalAlign="top" height={30} wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }}/>
                            <Line type="monotone" dataKey="avgAwareness" name="Awareness" stroke="rgb(255, 205, 86)" strokeWidth={2} dot={false} connectNulls />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Feelings Chart */}
            <div>
                <h5 className="text-white/70 text-sm font-medium mb-2">Prevalence of Feelings Over Time (%)</h5>
                <div className="bg-black/30 p-2 rounded">
                    <ResponsiveContainer width="100%" minHeight={0} minWidth={0} height={200}>
                        <LineChart data={filteredData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)"/>
                            <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)">
                                <Label value="Time (frames)" offset={-15} position="insideBottom" fill="rgba(255,255,255,0.5)" />
                            </XAxis>
                            <YAxis stroke="rgba(255,255,255,0.5)" domain={[0, 100]} unit="%">
                                <Label value="% Agents" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} fill="rgba(255,255,255,0.5)" />
                            </YAxis>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: '1px solid #555', color: 'white', fontSize: '0.9em' }}
                                formatter={(value) => typeof value === 'number' ? value.toFixed(1) + '%' : 'N/A'}
                            />
                            <RechartsLegend verticalAlign="top" height={30} wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }}/>
                            <Line type="monotone" dataKey="avgGuilt" name="Guilt" stroke="rgb(220, 53, 69)" strokeWidth={2} dot={false} connectNulls />
                            <Line type="monotone" dataKey="avgSuffering" name="Suffering" stroke="rgb(108, 117, 125)" strokeWidth={2} dot={false} connectNulls />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};


export default ChartsDisplay;
