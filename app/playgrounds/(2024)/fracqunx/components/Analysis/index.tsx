import {
    LineChart, Line,
    XAxis, YAxis,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

import {
    AnalysisData,
} from '../index';



const emptyData: AnalysisData[] = [
    { time: 0, trajectoryVariance: 0, localEntropy: 0, morpholineAlignment: 0 },
    { time: 100, trajectoryVariance: 0, localEntropy: 0, morpholineAlignment: 0 },
];

const GaltonAnalysis = ({
    data,
} : {
    data: AnalysisData[];
}) => {
    return (
        <div className="p-4 min-w-[600px] m-8 bg-black select-none">
            <h2 className="text-center font-bold mb-8">System Dynamics Analysis</h2>
            <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <LineChart
                        data={data.length > 0 ? data : emptyData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                    >
                        <XAxis
                            dataKey="time"
                            label={{ value: 'Time Steps', position: 'bottom', fill: 'white' }}
                            tick={{ fill: 'white' }}
                            interval={10}
                        />
                        <YAxis
                            label={{ value: 'Metrics', angle: -90, position: 'insideLeft', fill: 'white' }}
                            tick={{ fill: 'white' }}
                            tickCount={4}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'black', color: 'white' }}
                        />
                        <Line type="monotone" dataKey="trajectoryVariance" stroke="#8884d8" name="Trajectory Variance" />
                        <Line type="monotone" dataKey="localEntropy" stroke="#82ca9d" name="Local Entropy" />
                        <Line type="monotone" dataKey="morpholineAlignment" stroke="#ffc658" name="Morpholine Alignment" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};


export default GaltonAnalysis;
