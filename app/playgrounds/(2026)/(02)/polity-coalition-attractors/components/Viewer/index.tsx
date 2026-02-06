'use client';

import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ScatterChart,
    Scatter,
} from 'recharts';
import {
    ModelParams,
    SimSettings,
    InitialConditions,
    BasinSettings,
    AttractorClass,
    ATTRACTOR_COLORS,
    simulate,
    classifyAttractor,
    computeBasinMap,
    fmt,
    clamp01,
} from '../../logic';

interface ViewerProps {
    params: ModelParams;
    sim: SimSettings;
    init: InitialConditions;
    basin: BasinSettings;
    onInitChange: (i: InitialConditions) => void;
}

const TOOLTIP_STYLE = {
    contentStyle: {
        background: '#0a0a0a',
        border: '1px solid #84cc16',
        borderRadius: 0,
        color: '#ecfccb',
        fontSize: 12,
    },
    labelStyle: { color: '#84cc16' },
};

export default function Viewer({
    params,
    sim,
    init,
    basin,
    onInitChange,
}: ViewerProps) {
    const basinData = useMemo(
        () => computeBasinMap(params, sim, basin),
        [params, sim, basin],
    );

    const simulationResult = useMemo(
        () => simulate(init.x0, init.t0, params, sim),
        [init.x0, init.t0, params, sim],
    );

    const attractorClass = useMemo(
        () => classifyAttractor(simulationResult.final.x),
        [simulationResult.final.x],
    );

    const phaseData = useMemo(() => {
        const stride = Math.max(1, Math.floor(simulationResult.series.length / 400));
        return simulationResult.series
            .filter((_, i) => i % stride === 0)
            .map((d) => ({ x: d.x, t: d.t, k: d.k }));
    }, [simulationResult.series]);

    const last = simulationResult.series[simulationResult.series.length - 1] ?? {
        x: init.x0, t: init.t0, threat: 0, piE: 0, piI: 0, diff: 0, k: 0,
    };

    return (
        <div className="space-y-6 w-full [&_canvas]:outline-none [&_svg]:outline-none">
            <BasinMap
                data={basinData}
                grid={basin.grid}
                init={init}
                onInitChange={onInitChange}
            />

            <TrajectoryChart series={simulationResult.series} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PhasePortrait
                    phaseData={phaseData}
                    init={init}
                    attractorClass={attractorClass}
                />
                <FinalSnapshot
                    last={last}
                    attractorClass={attractorClass}
                />
            </div>
        </div>
    );
}

// ── Color helpers ─────────────────────────────────────────────────

/**
 * 2D color: hue from absolute avgFinalX (green→red), lightness from
 * normalized avgPathX (how the trajectory got there).
 * - Hue: 120 (green, inclusive) → 0 (red, exclusionary) — absolute scale
 * - Lightness: 20% (dark) → 60% (bright) — normalized to data range
 */
function basinCellColor(absX: number, normPath: number): string {
    const hue = 120 * (1 - Math.max(0, Math.min(1, absX)));
    const light = 20 + 40 * Math.max(0, Math.min(1, normPath));
    return `hsl(${hue}, 80%, ${light}%)`;
}

// ── Basin Map (Canvas) ────────────────────────────────────────────

function BasinMap({
    data,
    grid,
    init,
    onInitChange,
}: {
    data: ReturnType<typeof computeBasinMap>;
    grid: number;
    init: InitialConditions;
    onInitChange: (i: InitialConditions) => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [canvasSize, setCanvasSize] = useState(400);

    const safeGrid = Math.max(2, Math.floor(grid));

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const w = entry.contentRect.width;
                setCanvasSize(Math.min(w, 700));
            }
        });
        ro.observe(container);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || data.length === 0) return;

        const dpr = window.devicePixelRatio || 1;
        const pad = 40;
        const plotSize = canvasSize - pad * 2;
        canvas.width = canvasSize * dpr;
        canvas.height = canvasSize * dpr;
        canvas.style.width = `${canvasSize}px`;
        canvas.style.height = `${canvasSize}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.scale(dpr, dpr);

        // Clear
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvasSize, canvasSize);

        // Draw cells — hue from absolute avgFinalX, brightness from normalized avgPathX
        const cellW = plotSize / safeGrid;
        const cellH = plotSize / safeGrid;

        let minPath = 1, maxPath = 0;
        for (const cell of data) {
            if (cell.avgPathX < minPath) minPath = cell.avgPathX;
            if (cell.avgPathX > maxPath) maxPath = cell.avgPathX;
        }
        const rangePath = maxPath - minPath;

        for (const cell of data) {
            const i = Math.round(cell.x0 * (safeGrid - 1));
            const j = Math.round(cell.t0 * (safeGrid - 1));
            const x = pad + i * cellW;
            const y = pad + (safeGrid - 1 - j) * cellH;
            const normPath = rangePath > 0.001 ? (cell.avgPathX - minPath) / rangePath : 0.5;
            ctx.fillStyle = basinCellColor(cell.avgFinalX, normPath);
            ctx.fillRect(x, y, cellW + 0.5, cellH + 0.5);
        }

        // Axis lines
        ctx.strokeStyle = '#84cc16';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pad, pad);
        ctx.lineTo(pad, pad + plotSize);
        ctx.lineTo(pad + plotSize, pad + plotSize);
        ctx.stroke();

        // Tick marks
        ctx.fillStyle = '#84cc16';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        for (let i = 0; i <= 4; i++) {
            const v = i / 4;
            const label = v.toFixed(1);
            const tx = pad + v * plotSize;
            ctx.fillText(label, tx, pad + plotSize + 14);
            ctx.textAlign = 'right';
            const ty = pad + (1 - v) * plotSize;
            ctx.fillText(label, pad - 6, ty + 3);
            ctx.textAlign = 'center';
        }

        // Axis labels
        ctx.fillStyle = '#84cc16';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('x\u2080 (exclusionary share)', pad + plotSize / 2, pad + plotSize + 30);
        ctx.save();
        ctx.translate(12, pad + plotSize / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('t\u2080 (institutional trust)', 0, 0);
        ctx.restore();

        // Crosshair
        const cx = pad + init.x0 * plotSize;
        const cy = pad + (1 - init.t0) * plotSize;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, pad);
        ctx.lineTo(cx, pad + plotSize);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pad, cy);
        ctx.lineTo(pad + plotSize, cy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Crosshair dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fill();
    }, [data, canvasSize, safeGrid, init.x0, init.t0]);

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const pad = 40;
            const plotSize = canvasSize - pad * 2;
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const xNorm = (mx - pad) / plotSize;
            const yNorm = 1 - (my - pad) / plotSize;
            if (xNorm >= 0 && xNorm <= 1 && yNorm >= 0 && yNorm <= 1) {
                onInitChange({ x0: clamp01(xNorm), t0: clamp01(yNorm) });
            }
        },
        [canvasSize, onInitChange],
    );

    return (
        <div className="bg-black/30 border border-lime-500/20 p-4">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <div className="text-sm font-semibold text-lime-100">Attractor basins (x&#8320; vs t&#8320;)</div>
                    <div className="text-xs text-lime-200/60">Color shows which attractor dominates from each starting point.</div>
                </div>
                <div className="text-xs text-lime-200/70 tabular-nums font-mono">
                    x&#8320;={init.x0.toFixed(2)}, t&#8320;={init.t0.toFixed(2)}
                </div>
            </div>
            <div ref={containerRef} className="relative w-full flex flex-col items-center">
                <canvas
                    ref={canvasRef}
                    onClick={handleClick}
                    className="cursor-crosshair outline-none"
                />
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-lime-200/70">
                <span>Inclusive</span>
                <div
                    className="h-3 w-24"
                    style={{ background: 'linear-gradient(to right, #22c55e, #eab308, #ef4444)' }}
                />
                <span>Exclusionary</span>
                <span className="text-lime-200/50">Click to set initial conditions.</span>
            </div>
        </div>
    );
}

// ── Trajectory Time Series ────────────────────────────────────────

function TrajectoryChart({
    series,
}: {
    series: ReturnType<typeof simulate>['series'];
}) {
    return (
        <div className="bg-black/30 border border-lime-500/20 p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-lime-100">Trajectory (time series)</div>
                <div className="text-xs text-lime-200/60">x = exclusionary share, t = trust, threat = perceived threat</div>
            </div>
            <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height={280} minWidth={0}>
                    <LineChart data={series} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#84cc1620" />
                        <XAxis
                            dataKey="k"
                            tick={{ fontSize: 10, fill: '#84cc16' }}
                            stroke="#84cc16"
                        />
                        <YAxis
                            domain={[0, 1]}
                            tick={{ fontSize: 10, fill: '#84cc16' }}
                            stroke="#84cc16"
                        />
                        <Tooltip
                            {...TOOLTIP_STYLE}
                            formatter={(value) => typeof value === 'number' ? fmt(value, 3) : value}
                            labelFormatter={(k) => `step ${k}`}
                        />
                        <Legend
                            wrapperStyle={{ fontSize: 11, color: '#84cc16' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="x"
                            name="x (exclusionary)"
                            stroke="#ef4444"
                            dot={false}
                            strokeWidth={2}
                            isAnimationActive={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="t"
                            name="t (trust)"
                            stroke="#22c55e"
                            dot={false}
                            strokeWidth={2}
                            isAnimationActive={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="threat"
                            name="threat"
                            stroke="#eab308"
                            dot={false}
                            strokeWidth={2}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ── Phase Portrait ────────────────────────────────────────────────

function PhasePortrait({
    phaseData,
    init,
    attractorClass,
}: {
    phaseData: { x: number; t: number; k: number }[];
    init: InitialConditions;
    attractorClass: AttractorClass;
}) {
    const last = phaseData[phaseData.length - 1];

    return (
        <div className="bg-black/30 border border-lime-500/20 p-4">
            <div className="mb-3">
                <div className="text-sm font-semibold text-lime-100">Phase portrait (x vs t)</div>
                <div className="text-xs text-lime-200/60">Trajectory through state space; attractors appear as endpoints.</div>
            </div>
            <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height={280} minWidth={0}>
                    <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#84cc1620" />
                        <XAxis
                            type="number"
                            dataKey="x"
                            domain={[0, 1]}
                            name="x"
                            tick={{ fontSize: 10, fill: '#84cc16' }}
                            stroke="#84cc16"
                            label={{ value: 'x (exclusionary)', position: 'bottom', offset: -5, fill: '#84cc16', fontSize: 10 }}
                        />
                        <YAxis
                            type="number"
                            dataKey="t"
                            domain={[0, 1]}
                            name="t"
                            tick={{ fontSize: 10, fill: '#84cc16' }}
                            stroke="#84cc16"
                            label={{ value: 't (trust)', angle: -90, position: 'insideLeft', fill: '#84cc16', fontSize: 10 }}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (!active || !payload?.length) return null;
                                const d = payload[0]?.payload as { x: number; t: number; k?: number } | undefined;
                                if (!d) return null;
                                return (
                                    <div style={{ background: '#0a0a0a', border: '1px solid #84cc16', padding: '6px 10px', fontSize: 12, color: '#ecfccb' }}>
                                        {d.k != null && <div style={{ color: '#84cc16', marginBottom: 2 }}>step {d.k}</div>}
                                        <div>x = {fmt(d.x, 3)}</div>
                                        <div>t = {fmt(d.t, 3)}</div>
                                    </div>
                                );
                            }}
                        />
                        <Scatter
                            data={phaseData}
                            fill="#84cc16"
                            fillOpacity={0.35}
                            isAnimationActive={false}
                        />
                        {/* Start marker */}
                        <Scatter
                            data={[{ x: init.x0, t: init.t0 }]}
                            fill="#ffffff"
                            shape="circle"
                            isAnimationActive={false}
                        />
                        {/* End marker */}
                        {last && (
                            <Scatter
                                data={[{ x: last.x, t: last.t }]}
                                fill={ATTRACTOR_COLORS[attractorClass]}
                                shape="circle"
                                isAnimationActive={false}
                            />
                        )}
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ── Final Snapshot ─────────────────────────────────────────────────

function FinalSnapshot({
    last,
    attractorClass,
}: {
    last: { x: number; t: number; threat: number; piE: number; piI: number; diff: number };
    attractorClass: AttractorClass;
}) {
    const rows = [
        { label: 'x (exclusionary)', value: fmt(last.x), bold: true },
        { label: 't (trust)', value: fmt(last.t), bold: true },
        { label: 'perceived threat', value: fmt(last.threat), bold: true },
    ];

    const payoffRows = [
        { label: '\u03C0(E)', value: fmt(last.piE) },
        { label: '\u03C0(I)', value: fmt(last.piI) },
        { label: '\u0394 = \u03C0(E)\u2212\u03C0(I)', value: fmt(last.diff), bold: true },
    ];

    return (
        <div className="bg-black/30 border border-lime-500/20 p-4">
            <div className="text-sm font-semibold text-lime-100 mb-3">Snapshot (final step)</div>
            <div className="space-y-2 text-sm text-lime-200/80">
                {rows.map((r) => (
                    <div key={r.label} className="flex justify-between">
                        <span>{r.label}</span>
                        <span className={`tabular-nums font-mono ${r.bold ? 'font-semibold text-lime-100' : ''}`}>
                            {r.value}
                        </span>
                    </div>
                ))}

                <div className="border-t border-lime-500/20 pt-2" />

                {payoffRows.map((r) => (
                    <div key={r.label} className="flex justify-between">
                        <span>{r.label}</span>
                        <span className={`tabular-nums font-mono ${r.bold ? 'font-semibold text-lime-100' : ''}`}>
                            {r.value}
                        </span>
                    </div>
                ))}

                <div className="border-t border-lime-500/20 pt-2" />

                <div className="flex justify-between items-center">
                    <span>Attractor</span>
                    <span
                        className="font-semibold text-sm"
                        style={{ color: ATTRACTOR_COLORS[attractorClass] }}
                    >
                        {attractorClass}
                    </span>
                </div>

                <div className="text-xs text-lime-200/50 mt-2">
                    When {'\u0394'} is positive, exclusionary support tends to grow (scaled by x(1{'\u2212'}x)).
                    Trust can dampen or amplify that growth depending on parameter settings.
                </div>
            </div>
        </div>
    );
}
