'use client';

import { useMemo } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceLine,
} from 'recharts';

import Equation from '@/components/Equation';

import {
    type ViewMode,
    type CurveRow,
    type ThresholdPoint,
    type PowerLawFit,
    type WitnessResult,
    LAMBDA_COLORS,
} from '../../logic';

interface ViewerProps {
    viewMode: ViewMode;
    curve: CurveRow[];
    thresholds: ThresholdPoint[];
    fit: PowerLawFit | null;
    witness: WitnessResult | null;
    lambdas: number[];
    targetThreshold: number;
}

const TOOLTIP_STYLE = {
    contentStyle: {
        backgroundColor: '#000',
        border: '1px solid #333',
        borderRadius: 0,
        fontSize: 12,
    },
    labelStyle: { color: '#84cc16' },
};

export default function Viewer({
    viewMode,
    curve,
    thresholds,
    fit,
    witness,
    lambdas,
    targetThreshold,
}: ViewerProps) {
    const filteredThresholds = useMemo(
        () => thresholds.filter((d) => d.threshold !== null),
        [thresholds],
    );

    if (viewMode === 'curves') {
        return (
            <div className="w-[90vw] h-[90vh] overflow-y-auto outline-none [&_*]:outline-none">
                <div className="text-center mb-1">
                    <h2 className="text-lime-400 text-sm font-semibold">
                        P(H<sub>L</sub>) vs N — probability of a Lane-like proto-core
                    </h2>
                </div>
                <div className="bg-black/40 border border-lime-500/25 p-2">
                    <div style={{ width: '100%', height: 460 }}>
                        <ResponsiveContainer width="100%" height={460} minWidth={0}>
                            <LineChart data={curve} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis
                                    dataKey="N"
                                    type="number"
                                    stroke="#666"
                                    tick={{ fill: '#888', fontSize: 10 }}
                                    label={{ value: 'N (molecule count)', position: 'insideBottom', offset: -5, fill: '#666', fontSize: 11 }}
                                />
                                <YAxis
                                    domain={[0, 1]}
                                    stroke="#666"
                                    tick={{ fill: '#888', fontSize: 10 }}
                                    label={{ value: 'P(H_L)', angle: -90, position: 'insideLeft', offset: 10, fill: '#666', fontSize: 11 }}
                                />
                                <Tooltip
                                    {...TOOLTIP_STYLE}
                                    formatter={(value, name) => [Number(value).toFixed(3), name]}
                                    labelFormatter={(label) => `N = ${label}`}
                                />
                                <Legend wrapperStyle={{ fontSize: 11, color: '#84cc16' }} />
                                <ReferenceLine
                                    y={targetThreshold}
                                    stroke="#84cc16"
                                    strokeDasharray="6 3"
                                    strokeOpacity={0.5}
                                    label={{
                                        value: `target = ${targetThreshold}`,
                                        position: 'right',
                                        fill: '#84cc16',
                                        fontSize: 10,
                                    }}
                                />
                                {lambdas.map((lambda, i) => (
                                    <Line
                                        key={lambda}
                                        type="monotone"
                                        dataKey={`λ=${lambda}`}
                                        name={`λ=${lambda}`}
                                        stroke={LAMBDA_COLORS[i % LAMBDA_COLORS.length]}
                                        strokeWidth={2}
                                        dot={false}
                                        connectNulls
                                        isAnimationActive={false}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Threshold cards */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {thresholds.slice(0, 6).map((t, i) => (
                        <div
                            key={t.lambda}
                            className="border border-lime-500/20 p-3"
                        >
                            <div className="text-[10px] text-lime-200/50 uppercase tracking-wider">
                                N* at λ={t.lambda}
                            </div>
                            <div
                                className="text-lg font-semibold mt-1"
                                style={{ color: LAMBDA_COLORS[i % LAMBDA_COLORS.length] }}
                            >
                                {t.threshold ?? '–'}
                            </div>
                            <div className="text-[10px] text-lime-200/40 mt-1">
                                P(H<sub>L</sub>) ≥ {targetThreshold}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (viewMode === 'thresholds') {
        return (
            <div className="w-[90vw] h-[90vh] overflow-y-auto outline-none [&_*]:outline-none">
                <div className="text-center mb-1">
                    <h2 className="text-lime-400 text-sm font-semibold">
                        Threshold N* vs λ
                    </h2>
                </div>
                <div className="bg-black/40 border border-lime-500/25 p-2">
                    <div style={{ width: '100%', height: 380 }}>
                        <ResponsiveContainer width="100%" height={380} minWidth={0}>
                            <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis
                                    type="number"
                                    dataKey="lambda"
                                    name="λ"
                                    domain={[0, 'auto']}
                                    stroke="#666"
                                    tick={{ fill: '#888', fontSize: 10 }}
                                    label={{ value: 'λ (catalytic density)', position: 'insideBottom', offset: -5, fill: '#666', fontSize: 11 }}
                                />
                                <YAxis
                                    type="number"
                                    dataKey="threshold"
                                    name="N*"
                                    stroke="#666"
                                    tick={{ fill: '#888', fontSize: 10 }}
                                    label={{ value: 'N* (threshold)', angle: -90, position: 'insideLeft', offset: 10, fill: '#666', fontSize: 11 }}
                                />
                                <Tooltip
                                    {...TOOLTIP_STYLE}
                                    cursor={{ strokeDasharray: '3 3', stroke: '#666' }}
                                />
                                <Scatter
                                    data={filteredThresholds}
                                    fill="#84cc16"
                                    isAnimationActive={false}
                                />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Power-law fit */}
                <div className="mt-6 border border-lime-500/20 p-4">
                    <div className="text-lime-200/70 text-sm font-medium mb-2">Power-law fit</div>
                    {fit ? (
                        <div className="space-y-3">
                            <div className="font-mono text-sm text-lime-400">
                                <Equation math={`N^* \\approx ${fit.a.toFixed(2)} \\cdot \\lambda^{${fit.b.toFixed(2)}}`} />
                            </div>
                            <p className="text-lime-200/60 text-xs">
                                Empirical scaling from the current run. The heuristic predicts
                                an exponent near −4/3.
                            </p>
                        </div>
                    ) : (
                        <p className="text-lime-200/50 text-xs">
                            Not enough finite threshold points to fit a power law.
                        </p>
                    )}
                </div>

                {/* Heuristic formula */}
                <div className="mt-4 border border-lime-500/20 p-4">
                    <div className="text-lime-200/70 text-sm font-medium mb-2">Heuristic formula</div>
                    <Equation
                        mode="block"
                        math="\mu \approx p_A \cdot p_C \cdot p_B \cdot \frac{N^3 \cdot \lambda^4}{q^2}"
                    />
                    <p className="text-lime-200/60 text-xs mt-2">
                        Expected motif count per trial. When μ ≫ 1, proto-cores become probabilistically inevitable.
                    </p>
                </div>
            </div>
        );
    }

    // compartments mode
    return (
        <div className="w-[90vw] h-[90vh] overflow-y-auto outline-none [&_*]:outline-none">
            <div className="text-center mb-1">
                <h2 className="text-lime-400 text-sm font-semibold">
                    Witness draw — vent compartments
                </h2>
            </div>

            {witness ? (
                <>
                    {/* SVG compartment visualization */}
                    <div className="flex justify-center">
                        <CompartmentSVG witness={witness} />
                    </div>

                    {/* Witness summary */}
                    <div className="mt-6 border border-lime-500/20 p-4">
                        {witness.success ? (
                            <div className="text-sm text-lime-200/80">
                                <span className="text-lime-400 font-medium">Witness found.</span>{' '}
                                A full H<sub>L</sub> motif appeared in compartment {witness.witness?.compartment},
                                with counts A = {witness.witness?.nA}, C = {witness.witness?.nC}, B = {witness.witness?.nB}.
                            </div>
                        ) : (
                            <div className="text-sm text-lime-200/60">
                                <span className="text-lime-400 font-medium">No witness found.</span>{' '}
                                Try increasing N, increasing λ, or decreasing q.
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="text-center text-lime-200/50 mt-8">
                    Press &quot;new witness&quot; to generate a compartment draw.
                </div>
            )}
        </div>
    );
}


function CompartmentSVG({ witness }: { witness: WitnessResult }) {
    const compartments = witness.compartments;
    const count = compartments.length;

    const cellSize = 140;
    const cols = Math.min(count, 4);
    const rows = Math.ceil(count / cols);
    const svgWidth = cols * cellSize + 20;
    const svgHeight = rows * cellSize + 20;

    return (
        <svg
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="max-w-full"
        >
            {compartments.map((comp, idx) => {
                const col = idx % cols;
                const row = Math.floor(idx / cols);
                const cx = col * cellSize + cellSize / 2 + 10;
                const cy = row * cellSize + cellSize / 2 + 10;
                const r = cellSize / 2 - 12;

                const total = comp.A.length + comp.C.length + comp.B.length;
                const molecules: { role: 'A' | 'C' | 'B'; color: string }[] = [];
                for (let i = 0; i < comp.A.length; i++) molecules.push({ role: 'A', color: '#84cc16' });
                for (let i = 0; i < comp.C.length; i++) molecules.push({ role: 'C', color: '#eab308' });
                for (let i = 0; i < comp.B.length; i++) molecules.push({ role: 'B', color: '#22d3ee' });

                return (
                    <g key={comp.id}>
                        {/* Hexagonal pore */}
                        <polygon
                            points={hexPoints(cx, cy, r)}
                            fill={comp.motif ? 'rgba(132, 204, 22, 0.08)' : 'rgba(0, 0, 0, 0.4)'}
                            stroke={comp.motif ? '#84cc16' : '#333'}
                            strokeWidth={comp.motif ? 2 : 1}
                        />
                        {comp.motif && (
                            <polygon
                                points={hexPoints(cx, cy, r + 3)}
                                fill="none"
                                stroke="#84cc16"
                                strokeWidth={1}
                                strokeOpacity={0.3}
                            />
                        )}

                        {/* Compartment label */}
                        <text
                            x={cx}
                            y={cy - r + 14}
                            textAnchor="middle"
                            fill={comp.motif ? '#84cc16' : '#666'}
                            fontSize={10}
                        >
                            pore {comp.id}
                        </text>

                        {/* Molecule dots */}
                        {molecules.slice(0, 40).map((mol, mi) => {
                            const angle = (mi / Math.max(total, 1)) * Math.PI * 2 + mi * 0.3;
                            const dist = 10 + (mi % 5) * 8 + Math.floor(mi / 5) * 4;
                            const mx = cx + Math.cos(angle) * Math.min(dist, r - 18);
                            const my = cy + Math.sin(angle) * Math.min(dist, r - 18);
                            return (
                                <circle
                                    key={mi}
                                    cx={mx}
                                    cy={my}
                                    r={3}
                                    fill={mol.color}
                                    fillOpacity={0.8}
                                />
                            );
                        })}

                        {/* Counts */}
                        <text x={cx} y={cy + r - 8} textAnchor="middle" fontSize={9} fill="#888">
                            <tspan fill="#84cc16">{comp.A.length}A</tspan>
                            {' '}
                            <tspan fill="#eab308">{comp.C.length}C</tspan>
                            {' '}
                            <tspan fill="#22d3ee">{comp.B.length}B</tspan>
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

function hexPoints(cx: number, cy: number, r: number): string {
    const points: string[] = [];
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
    }
    return points.join(' ');
}
