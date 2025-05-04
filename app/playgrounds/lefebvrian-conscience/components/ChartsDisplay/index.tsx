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

    return (
        <div className="charts-container">
            {/* Resource Chart */}
            <div className="chart-box">
                <h5>Average Resources Over Time</h5>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={filteredData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                        <XAxis dataKey="time" stroke="#666">
                             <Label value="Time (frames)" offset={-15} position="insideBottom" />
                        </XAxis>
                        <YAxis stroke="#666" domain={['dataMin - 5', 'dataMax + 5']}>
                             <Label value="Avg Res" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
                        </YAxis>
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid #ccc', fontSize: '0.9em' }}
                            formatter={(value: number) => value !== null ? value.toFixed(1) : 'N/A'}
                        />
                        <RechartsLegend verticalAlign="top" height={30}/>
                        <Line type="monotone" dataKey="avgResTotal" name="Total" stroke="rgb(75, 192, 192)" strokeWidth={2} dot={false} connectNulls />
                        <Line type="monotone" dataKey="avgResGroupA" name="Group A" stroke="rgb(54, 162, 235)" strokeWidth={2} dot={false} connectNulls />
                        <Line type="monotone" dataKey="avgResGroupB" name="Group B" stroke="rgb(255, 159, 64)" strokeWidth={2} dot={false} connectNulls />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Awareness Chart */}
            <div className="chart-box">
                 <h5>Average Awareness Level Over Time</h5>
                 <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={filteredData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                        <XAxis dataKey="time" stroke="#666">
                            <Label value="Time (frames)" offset={-15} position="insideBottom" />
                        </XAxis>
                        <YAxis stroke="#666" domain={[0, AWARENESS_MAX_LEVEL]}>
                             <Label value="Avg Aware Lvl" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
                        </YAxis>
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid #ccc', fontSize: '0.9em' }}
                            formatter={(value: number) => value !== null ? value.toFixed(2) : 'N/A'}
                        />
                        <RechartsLegend verticalAlign="top" height={30}/>
                        <Line type="monotone" dataKey="avgAwareness" name="Awareness" stroke="rgb(255, 205, 86)" strokeWidth={2} dot={false} connectNulls />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Feelings Chart */}
            <div className="chart-box feelings-chart">
                 <h5>Prevalence of Feelings Over Time (%)</h5>
                 <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={filteredData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                        <XAxis dataKey="time" stroke="#666">
                             <Label value="Time (frames)" offset={-15} position="insideBottom" />
                        </XAxis>
                        <YAxis stroke="#666" domain={[0, 100]} unit="%">
                            <Label value="% Agents" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
                        </YAxis>
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid #ccc', fontSize: '0.9em' }}
                            formatter={(value: number) => value !== null ? value.toFixed(1) + '%' : 'N/A'}
                        />
                        <RechartsLegend verticalAlign="top" height={30}/>
                        <Line type="monotone" dataKey="avgGuilt" name="Guilt" stroke="rgb(220, 53, 69)" strokeWidth={2} dot={false} connectNulls />
                        <Line type="monotone" dataKey="avgSuffering" name="Suffering" stroke="rgb(108, 117, 125)" strokeWidth={2} dot={false} connectNulls />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};


export default ChartsDisplay;
