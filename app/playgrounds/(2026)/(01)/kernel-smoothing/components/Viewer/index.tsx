'use client';

import { useMemo } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    ScatterChart,
    Scatter,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    Cell,
} from 'recharts';

import type { SimulationParams, DerivedPoint, KernelGridPoint } from '../../logic';
import { fmt } from '../../logic';

interface ViewerProps {
    params: SimulationParams;
    derivedPoints: DerivedPoint[];
    grid: KernelGridPoint[];
    lo: number;
    hi: number;
    Z: number;
    yHat: number;
}

const LIME = '#84cc16';
const LIME_DIM = 'rgba(132, 204, 22, 0.5)';
const CYAN = '#22d3ee';

export default function Viewer({
    params,
    derivedPoints,
    grid,
    lo,
    hi,
    yHat,
}: ViewerProps) {
    const scatterData = useMemo(() => {
        return derivedPoints.map((p) => ({ x: p.x, y: p.y, name: `(${fmt(p.x, 2)}, ${fmt(p.y, 2)})` }));
    }, [derivedPoints]);

    const predictionData = useMemo(() => {
        return [{ x: params.xq, y: yHat, name: 'prediction' }];
    }, [params.xq, yHat]);

    const alphaBars = useMemo(() => {
        return derivedPoints.map((r, idx) => ({
            name: fmt(r.x, 2),
            idx,
            alpha: r.alpha,
        }));
    }, [derivedPoints]);

    const yMin = useMemo(() => {
        const ys = derivedPoints.map((p) => p.y);
        return Math.min(...ys, yHat, -0.5);
    }, [derivedPoints, yHat]);

    const yMax = useMemo(() => {
        const ys = derivedPoints.map((p) => p.y);
        return Math.max(...ys, yHat, 0.5);
    }, [derivedPoints, yHat]);

    const kernelLabel = params.kernelType === 'gaussian'
        ? 'Gaussian kernel'
        : 'Softmax-dot kernel';

    return (
        <div className="w-[90vw] h-[90vh] flex flex-col gap-4 p-4 overflow-auto text-lime-100 outline-none [&_*]:outline-none">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-lime-400 text-sm font-semibold">
                    {kernelLabel}
                </h2>
            </div>

            {/* Kernel shape chart */}
            <div className="bg-black/40 border border-lime-500/25 p-2">
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart
                        data={grid}
                        margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis
                            dataKey="x"
                            type="number"
                            domain={[lo, hi]}
                            tickFormatter={(v) => fmt(v, 1)}
                            stroke="#666"
                            tick={{ fill: '#888', fontSize: 10 }}
                        />
                        <YAxis
                            tickFormatter={(v) => fmt(v, 2)}
                            stroke="#666"
                            tick={{ fill: '#888', fontSize: 10 }}
                        />
                        <Tooltip
                            formatter={(value) => [fmt(Number(value), 6), 'K(x_q, x)']}
                            labelFormatter={(label) => `x = ${fmt(Number(label), 4)}`}
                            contentStyle={{
                                backgroundColor: '#000',
                                border: '1px solid #333',
                                borderRadius: 0,
                            }}
                            labelStyle={{ color: LIME }}
                        />
                        <ReferenceLine
                            x={params.xq}
                            stroke={CYAN}
                            strokeDasharray="4 4"
                            label={{ value: 'x_q', position: 'top', fill: CYAN, fontSize: 10 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="K"
                            stroke={LIME}
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Data points + prediction scatter chart */}
            <div className="text-center">
                <h2 className="text-lime-400 text-sm font-semibold mb-1">
                    Data Points & Prediction
                </h2>
            </div>
            <div className="bg-black/40 border border-lime-500/25 p-2">
                <ResponsiveContainer width="100%" height={200}>
                    <ScatterChart
                        margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis
                            type="number"
                            dataKey="x"
                            domain={[lo, hi]}
                            tickFormatter={(v) => fmt(v, 1)}
                            stroke="#666"
                            tick={{ fill: '#888', fontSize: 10 }}
                        />
                        <YAxis
                            type="number"
                            dataKey="y"
                            domain={[yMin - 0.2, yMax + 0.2]}
                            tickFormatter={(v) => fmt(v, 1)}
                            stroke="#666"
                            tick={{ fill: '#888', fontSize: 10 }}
                        />
                        <Tooltip
                            cursor={{ strokeDasharray: '3 3', stroke: '#444' }}
                            formatter={(value) => [fmt(Number(value), 4), '']}
                            labelFormatter={() => ''}
                            contentStyle={{
                                backgroundColor: '#000',
                                border: '1px solid #333',
                                borderRadius: 0,
                            }}
                        />
                        <ReferenceLine
                            x={params.xq}
                            stroke={CYAN}
                            strokeDasharray="4 4"
                        />
                        <ReferenceLine
                            y={yHat}
                            stroke="#f472b6"
                            strokeDasharray="4 4"
                            label={{ value: 'y-hat', position: 'right', fill: '#f472b6', fontSize: 10 }}
                        />
                        <Scatter
                            name="data"
                            data={scatterData}
                            fill={LIME}
                        >
                            {scatterData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={LIME} />
                            ))}
                        </Scatter>
                        <Scatter
                            name="prediction"
                            data={predictionData}
                            fill="#f472b6"
                            shape="diamond"
                        >
                            {predictionData.map((_, index) => (
                                <Cell key={`pred-${index}`} fill="#f472b6" />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>

            {/* Weights bar chart */}
            <div className="text-center">
                <h2 className="text-lime-400 text-sm font-semibold">
                    Normalized weights <span dangerouslySetInnerHTML={{ __html: 'α<sub>i</sub>' }} />
                </h2>
                <p className="text-xs text-lime-200/50" dangerouslySetInnerHTML={{ __html: 'by x<sub>i</sub>' }} />
            </div>
            <div className="bg-black/40 border border-lime-500/25 p-2">
                <ResponsiveContainer width="100%" height={180}>
                    <BarChart
                        data={alphaBars}
                        margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis
                            dataKey="name"
                            stroke="#666"
                            tick={{ fill: '#888', fontSize: 10 }}
                        />
                        <YAxis
                            tickFormatter={(v) => fmt(v, 2)}
                            stroke="#666"
                            tick={{ fill: '#888', fontSize: 10 }}
                            domain={[0, 1]}
                        />
                        <Tooltip
                            formatter={(value) => [fmt(Number(value), 6), 'alpha_i']}
                            labelFormatter={(label) => `x_i = ${label}`}
                            contentStyle={{
                                backgroundColor: '#000',
                                border: '1px solid #333',
                                borderRadius: 0,
                            }}
                        />
                        <Bar dataKey="alpha" fill={LIME}>
                            {alphaBars.map((entry, index) => (
                                <Cell
                                    key={`bar-${index}`}
                                    fill={entry.alpha > 0.2 ? LIME : LIME_DIM}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
}
