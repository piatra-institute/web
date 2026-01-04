'use client';

import { useMemo, forwardRef, useImperativeHandle, useState, useCallback, useRef, useEffect } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceLine,
} from 'recharts';
import {
    Spec,
    PlotData,
    LandscapePoint,
    LandscapeDimension,
    buildSpecEvaluator,
    numericDerivative,
    checkStats,
    prettyFormula,
    formatNum,
    computeLandscape,
    ACTIVATION_META,
    CATEGORY_COLORS,
    LANDSCAPE_DIMENSIONS,
} from '../../logic';

export interface ViewerRef {
    exportJson: () => string;
}

interface ViewerProps {
    spec: Spec;
    overlays: Spec[];
    showDerivative: boolean;
    xMin: number;
    xMax: number;
    samples: number;
    invertChart: boolean;
    onSelectActivation?: (name: string) => void;
}

const COLORS = ['#84cc16', '#22d3ee', '#f472b6', '#fbbf24'];
const OVERLAY_COLORS = ['#06b6d4', '#ec4899', '#f59e0b'];

// Default camera: isometric-like view from corner (looking at origin from outside)
const DEFAULT_CAMERA = {
    rotationX: -0.6,   // tilt to look down at the scene
    rotationY: Math.PI + 0.8,  // rotate to see from opposite side
};

const Viewer = forwardRef<ViewerRef, ViewerProps>(function Viewer(
    { spec, overlays, showDerivative, xMin, xMax, samples, invertChart, onSelectActivation },
    ref
) {
    const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
    const [xDim, setXDim] = useState<LandscapeDimension>('curvature');
    const [yDim, setYDim] = useState<LandscapeDimension>('symmetry');
    const [zDim, setZDim] = useState<LandscapeDimension>('boundedness');
    const [rotationX, setRotationX] = useState(DEFAULT_CAMERA.rotationX);
    const [rotationY, setRotationY] = useState(DEFAULT_CAMERA.rotationY);
    const [isDragging, setIsDragging] = useState(false);
    const lastMouseRef = useRef({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const plotted = useMemo(() => {
        const n = Math.max(50, Math.min(2000, Math.floor(samples)));
        const min = Math.min(xMin, xMax);
        const max = Math.max(xMin, xMax);
        const dx = (max - min) / (n - 1);
        const h = Math.max(1e-4, dx * 0.5);

        const main = buildSpecEvaluator(spec);

        const activeOverlays = overlays.slice(0, 3);
        const overlayEvaluators = activeOverlays.map((s) => ({
            s,
            ev: buildSpecEvaluator(s),
        }));

        const xs: number[] = [];
        const ys: number[] = [];
        const dys: number[] = [];

        const data: PlotData[] = [];
        for (let i = 0; i < n; i++) {
            const x = min + i * dx;
            const y = main.f(x);
            const dy = numericDerivative(main.f, x, h);
            xs.push(x);
            ys.push(y);
            dys.push(dy);

            const row: PlotData = { x, y, dy };
            for (let k = 0; k < overlayEvaluators.length; k++) {
                row[`y_${k}`] = overlayEvaluators[k].ev.f(x);
            }
            data.push(row);
        }

        const stats = checkStats(xs, ys, dys);

        let exprErr = '';
        if (spec.kind === 'expression' && !main.ok) exprErr = main.err || 'Unknown error';

        const overlayErrs = overlayEvaluators
            .map((o) => (!o.ev.ok ? `${o.s.name}: ${o.ev.err}` : ''))
            .filter(Boolean);

        return {
            data,
            stats,
            exprErr,
            overlayErrs,
            activeOverlays,
        };
    }, [spec, overlays, xMin, xMax, samples]);

    const landscape = useMemo(() => {
        return computeLandscape(spec, overlays, xDim, yDim, zDim);
    }, [spec, overlays, xDim, yDim, zDim]);

    const exportJson = useCallback(() => {
        return JSON.stringify(spec, null, 2);
    }, [spec]);

    useImperativeHandle(ref, () => ({
        exportJson,
    }));

    const formula = prettyFormula(spec);

    // Get unique categories for legend
    const categories = useMemo(() => {
        const cats = new Set(landscape.map((p) => p.category));
        return Array.from(cats).filter((c) => c !== 'Current' && c !== 'Overlay');
    }, [landscape]);

    // 3D projection function
    const project3D = useCallback(
        (x: number, y: number, z: number, width: number, height: number) => {
            // Normalize to -1 to 1 range
            const nx = (x / 10) * 2 - 1;
            const ny = (y / 6) * 2 - 1;
            const nz = z * 2 - 1;

            // Apply rotation
            const cosX = Math.cos(rotationX);
            const sinX = Math.sin(rotationX);
            const cosY = Math.cos(rotationY);
            const sinY = Math.sin(rotationY);

            // Rotate around Y axis
            const x1 = nx * cosY - nz * sinY;
            const z1 = nx * sinY + nz * cosY;

            // Rotate around X axis
            const y1 = ny * cosX - z1 * sinX;
            const z2 = ny * sinX + z1 * cosX;

            // Perspective projection
            const perspective = 3;
            const scale = perspective / (perspective + z2);

            return {
                x: width / 2 + x1 * scale * width * 0.35,
                y: height / 2 - y1 * scale * height * 0.35,
                scale,
                depth: z2,
            };
        },
        [rotationX, rotationY]
    );

    // Draw 3D landscape
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;

        // Clear
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        // Draw grid lines
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 0.5;

        // Grid on XY plane (z=0) - floor
        for (let i = 0; i <= 10; i += 2) {
            const p1 = project3D(i, 0, 0, width, height);
            const p2 = project3D(i, 6, 0, width, height);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
        for (let i = 0; i <= 6; i += 2) {
            const p1 = project3D(0, i, 0, width, height);
            const p2 = project3D(10, i, 0, width, height);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }

        // Grid on XZ plane (y=0) - back wall
        for (let i = 0; i <= 10; i += 2) {
            const p1 = project3D(i, 0, 0, width, height);
            const p2 = project3D(i, 0, 1, width, height);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
        for (let i = 0; i <= 4; i++) {
            const z = i / 4;
            const p1 = project3D(0, 0, z, width, height);
            const p2 = project3D(10, 0, z, width, height);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }

        // Grid on YZ plane (x=0) - side wall
        for (let i = 0; i <= 6; i += 2) {
            const p1 = project3D(0, i, 0, width, height);
            const p2 = project3D(0, i, 1, width, height);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
        for (let i = 0; i <= 4; i++) {
            const z = i / 4;
            const p1 = project3D(0, 0, z, width, height);
            const p2 = project3D(0, 6, z, width, height);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }

        // Draw axis lines
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;

        // X axis
        const xStart = project3D(0, 0, 0, width, height);
        const xEnd = project3D(10, 0, 0, width, height);
        ctx.beginPath();
        ctx.moveTo(xStart.x, xStart.y);
        ctx.lineTo(xEnd.x, xEnd.y);
        ctx.stroke();

        // Y axis
        const yEnd = project3D(0, 6, 0, width, height);
        ctx.beginPath();
        ctx.moveTo(xStart.x, xStart.y);
        ctx.lineTo(yEnd.x, yEnd.y);
        ctx.stroke();

        // Z axis
        const zEnd = project3D(0, 0, 1, width, height);
        ctx.beginPath();
        ctx.moveTo(xStart.x, xStart.y);
        ctx.lineTo(zEnd.x, zEnd.y);
        ctx.stroke();

        // Sort points by depth for proper rendering order
        const sortedPoints = [...landscape].sort((a, b) => {
            const pa = project3D(a.x, a.y, a.z, width, height);
            const pb = project3D(b.x, b.y, b.z, width, height);
            return pa.depth - pb.depth;
        });

        // Draw points
        for (const point of sortedPoints) {
            const projected = project3D(point.x, point.y, point.z, width, height);
            const baseSize = point.isCurrent ? 12 : point.isOverlay ? 8 : 5;
            const size = baseSize * projected.scale;

            const color = point.isCurrent
                ? '#84cc16'
                : point.isOverlay
                ? '#f472b6'
                : CATEGORY_COLORS[point.category] || '#71717a';

            // Draw shadow/glow for depth
            if (point.isCurrent || point.isOverlay) {
                ctx.beginPath();
                ctx.arc(projected.x, projected.y, size + 3, 0, Math.PI * 2);
                ctx.fillStyle = point.isCurrent ? 'rgba(132, 204, 22, 0.3)' : 'rgba(244, 114, 182, 0.3)';
                ctx.fill();
            }

            // Draw point
            ctx.beginPath();
            ctx.arc(projected.x, projected.y, size, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            // Draw border for special points
            if (point.isCurrent || point.isOverlay) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Draw label for hovered or current
            if (point.name === hoveredPoint || point.isCurrent) {
                ctx.fillStyle = '#fff';
                ctx.font = '10px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(point.name, projected.x, projected.y - size - 5);
            }
        }

        // Draw axis labels
        ctx.fillStyle = '#666';
        ctx.font = '9px monospace';

        const xLabel = LANDSCAPE_DIMENSIONS.find((d) => d.value === xDim)?.label || xDim;
        const yLabel = LANDSCAPE_DIMENSIONS.find((d) => d.value === yDim)?.label || yDim;
        const zLabel = LANDSCAPE_DIMENSIONS.find((d) => d.value === zDim)?.label || zDim;

        ctx.textAlign = 'center';
        ctx.fillText(xLabel, xEnd.x, xEnd.y + 15);
        ctx.fillText(yLabel, yEnd.x - 15, yEnd.y);
        ctx.fillText(zLabel, zEnd.x + 15, zEnd.y);
    }, [landscape, rotationX, rotationY, project3D, hoveredPoint, xDim, yDim, zDim]);

    // Mouse handlers for rotation
    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDragging(true);
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            if (!isDragging) {
                // Check for hover
                const canvas = canvasRef.current;
                if (!canvas) return;

                const rect = canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                let closestPoint: string | null = null;
                let closestDist = Infinity;

                for (const point of landscape) {
                    const projected = project3D(point.x, point.y, point.z, rect.width, rect.height);
                    const dist = Math.sqrt((projected.x - mouseX) ** 2 + (projected.y - mouseY) ** 2);
                    if (dist < 15 && dist < closestDist) {
                        closestDist = dist;
                        closestPoint = point.name;
                    }
                }

                setHoveredPoint(closestPoint);
                return;
            }

            const dx = e.clientX - lastMouseRef.current.x;
            const dy = e.clientY - lastMouseRef.current.y;

            setRotationY((prev) => prev + dx * 0.01);
            setRotationX((prev) => Math.max(-Math.PI / 2, Math.min(Math.PI / 2, prev + dy * 0.01)));

            lastMouseRef.current = { x: e.clientX, y: e.clientY };
        },
        [isDragging, landscape, project3D]
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleCanvasClick = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            const canvas = canvasRef.current;
            if (!canvas || !onSelectActivation) return;

            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            for (const point of landscape) {
                if (point.isCurrent || point.isOverlay) continue;

                const projected = project3D(point.x, point.y, point.z, rect.width, rect.height);
                const dist = Math.sqrt((projected.x - mouseX) ** 2 + (projected.y - mouseY) ** 2);

                if (dist < 15) {
                    onSelectActivation(point.name);
                    break;
                }
            }
        },
        [landscape, project3D, onSelectActivation]
    );

    return (
        <div className="w-[90vw] h-[90vh] flex flex-col lg:flex-row gap-4 p-2 lg:p-4 overflow-auto">
            {/* Main Chart Area */}
            <div className="flex-1 flex flex-col gap-2 lg:gap-4 min-w-0 min-h-[400px] lg:min-h-0">
                {/* Header */}
                <div className={`text-center ${invertChart ? 'bg-white px-2 py-1' : ''}`}>
                    <h2 className={`font-mono text-xs lg:text-sm truncate ${invertChart ? 'text-lime-600' : 'text-lime-400'}`}>{formula}</h2>
                    {spec.kind === 'builtin' && (() => {
                        const meta = ACTIVATION_META.find((m) => m.name === spec.builtinType);
                        if (!meta?.paper && !meta?.arxiv) return null;
                        return (
                            <div className={`text-[10px] lg:text-xs mt-1 hidden sm:block ${invertChart ? 'text-gray-600' : 'text-gray-500'}`}>
                                {meta.paper && <span>{meta.paper}{meta.year ? ` (${meta.year})` : ''}</span>}
                                {meta.arxiv && (
                                    <>
                                        {meta.paper && <span className="mx-2">·</span>}
                                        <a
                                            href={`https://arxiv.org/abs/${meta.arxiv}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`hover:underline ${invertChart ? 'text-cyan-600' : 'text-cyan-400'}`}
                                        >
                                            arXiv:{meta.arxiv}
                                        </a>
                                    </>
                                )}
                            </div>
                        );
                    })()}
                </div>

                {/* Errors */}
                {plotted.exprErr && (
                    <div className="text-red-500 text-sm text-center">
                        Expression error: {plotted.exprErr}
                    </div>
                )}
                {plotted.overlayErrs.length > 0 && (
                    <div className="text-red-500 text-sm text-center">
                        Overlay errors: {plotted.overlayErrs.join(', ')}
                    </div>
                )}

                {/* Main Chart */}
                <div className={`flex-1 min-h-0 [&_svg]:outline-none [&_*]:outline-none ${invertChart ? 'bg-white' : ''}`}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={plotted.data}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={invertChart ? '#ddd' : '#333'} />
                            <XAxis
                                dataKey="x"
                                type="number"
                                domain={[Math.min(xMin, xMax), Math.max(xMin, xMax)]}
                                tickFormatter={(v) => (typeof v === 'number' ? v.toFixed(1) : String(v))}
                                stroke={invertChart ? '#999' : '#666'}
                                tick={{ fill: invertChart ? '#333' : '#888', fontSize: 11 }}
                            />
                            <YAxis
                                tickFormatter={(v) => (typeof v === 'number' ? v.toFixed(2) : String(v))}
                                stroke={invertChart ? '#999' : '#666'}
                                tick={{ fill: invertChart ? '#333' : '#888', fontSize: 11 }}
                            />
                            <Tooltip
                                formatter={(v) =>
                                    typeof v === 'number' ? formatNum(v) : String(v ?? '')
                                }
                                labelFormatter={(x) => `x = ${formatNum(Number(x))}`}
                                contentStyle={{
                                    backgroundColor: invertChart ? '#fff' : '#000',
                                    border: invertChart ? '1px solid #ccc' : '1px solid #333',
                                    borderRadius: 0,
                                }}
                                labelStyle={{ color: invertChart ? '#65a30d' : '#84cc16' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12, color: invertChart ? '#333' : undefined }} />

                            <ReferenceLine x={0} stroke={invertChart ? '#bbb' : '#444'} />
                            <ReferenceLine y={0} stroke={invertChart ? '#bbb' : '#444'} />

                            {/* Main function */}
                            <Line
                                type="monotone"
                                dataKey="y"
                                stroke={invertChart ? '#65a30d' : COLORS[0]}
                                strokeWidth={2}
                                dot={false}
                                name={`${spec.name}: y(x)`}
                            />

                            {/* Derivative */}
                            {showDerivative && (
                                <Line
                                    type="monotone"
                                    dataKey="dy"
                                    stroke={invertChart ? '#0891b2' : COLORS[1]}
                                    strokeWidth={1.5}
                                    strokeDasharray="5 5"
                                    dot={false}
                                    name={`${spec.name}: dy/dx`}
                                />
                            )}

                            {/* Overlays */}
                            {plotted.activeOverlays.map((s, k) => {
                                const darkColors = OVERLAY_COLORS;
                                const lightColors = ['#0e7490', '#be185d', '#b45309'];
                                const colors = invertChart ? lightColors : darkColors;
                                return (
                                    <Line
                                        key={s.id}
                                        type="monotone"
                                        dataKey={`y_${k}`}
                                        stroke={colors[k % colors.length]}
                                        strokeWidth={1.5}
                                        dot={false}
                                        name={`${s.name}: y(x)`}
                                    />
                                );
                            })}
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Stats Panel - hidden on mobile */}
                <div className={`hidden lg:grid grid-cols-6 gap-2 text-xs ${invertChart ? 'bg-white p-2' : ''}`}>
                    {plotted.stats.ok ? (
                        <>
                            <StatBox
                                label="max |y|"
                                value={formatNum(plotted.stats.maxAbsY ?? 0)}
                                inverted={invertChart}
                            />
                            <StatBox
                                label="max |dy/dx|"
                                value={formatNum(plotted.stats.maxAbsDy ?? 0)}
                                inverted={invertChart}
                            />
                            <StatBox
                                label="monotone"
                                value={plotted.stats.monotoneNondecreasing ? 'yes' : 'no'}
                                inverted={invertChart}
                            />
                            <StatBox
                                label="dead %"
                                value={`${((plotted.stats.deadFrac ?? 0) * 100).toFixed(0)}%`}
                                inverted={invertChart}
                            />
                            <StatBox
                                label="odd"
                                value={formatNum(plotted.stats.oddness ?? 0)}
                                inverted={invertChart}
                            />
                            <StatBox
                                label="even"
                                value={formatNum(plotted.stats.evenness ?? 0)}
                                inverted={invertChart}
                            />
                        </>
                    ) : (
                        <div className="col-span-full text-red-500 text-center">
                            {plotted.stats.err}
                        </div>
                    )}
                </div>
            </div>

            {/* 3D Landscape */}
            <div className="w-full lg:w-[350px] flex flex-col gap-2 shrink-0 min-h-[300px] lg:min-h-0">
                <div className="text-center text-xs text-gray-400">
                    Activation Landscape
                </div>

                {/* Dimension Selectors */}
                <div className="grid grid-cols-3 gap-1 text-xs">
                    <div>
                        <label className="text-gray-500 block mb-0.5 text-[10px] lg:text-xs">X</label>
                        <select
                            value={xDim}
                            onChange={(e) => setXDim(e.target.value as LandscapeDimension)}
                            className="w-full bg-black border border-gray-700 text-gray-300 px-1 py-0.5 text-[10px] lg:text-xs outline-none"
                        >
                            {LANDSCAPE_DIMENSIONS.map((d) => (
                                <option key={d.value} value={d.value}>
                                    {d.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-gray-500 block mb-0.5 text-[10px] lg:text-xs">Y</label>
                        <select
                            value={yDim}
                            onChange={(e) => setYDim(e.target.value as LandscapeDimension)}
                            className="w-full bg-black border border-gray-700 text-gray-300 px-1 py-0.5 text-[10px] lg:text-xs outline-none"
                        >
                            {LANDSCAPE_DIMENSIONS.map((d) => (
                                <option key={d.value} value={d.value}>
                                    {d.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-gray-500 block mb-0.5 text-[10px] lg:text-xs">Z</label>
                        <select
                            value={zDim}
                            onChange={(e) => setZDim(e.target.value as LandscapeDimension)}
                            className="w-full bg-black border border-gray-700 text-gray-300 px-1 py-0.5 text-[10px] lg:text-xs outline-none"
                        >
                            {LANDSCAPE_DIMENSIONS.map((d) => (
                                <option key={d.value} value={d.value}>
                                    {d.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 3D Canvas */}
                <div className="flex-1 min-h-[200px] lg:min-h-0 border border-gray-700 bg-black relative">
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full cursor-grab active:cursor-grabbing"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onClick={handleCanvasClick}
                    />

                    {/* Tooltip */}
                    {hoveredPoint && (
                        <div className="absolute top-2 left-2 bg-black/90 border border-gray-600 p-2 text-xs pointer-events-none">
                            <div className="text-lime-400 font-semibold">{hoveredPoint}</div>
                            {(() => {
                                const meta = ACTIVATION_META.find((m) => m.name === hoveredPoint);
                                return meta && (
                                    <>
                                        <div className="text-gray-400">{meta.category}</div>
                                        <div className="text-gray-500">{meta.description}</div>
                                    </>
                                );
                            })()}
                            <div className="text-gray-600 mt-1 text-[10px]">Click to select</div>
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="text-xs max-h-[80px] lg:max-h-[120px] overflow-y-auto">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 bg-lime-500 border-2 border-white" />
                        <span className="text-lime-400">Current</span>
                    </div>
                    <div className="grid grid-cols-3 lg:grid-cols-2 gap-x-2 gap-y-0.5">
                        {categories.slice(0, 12).map((cat) => (
                            <div key={cat} className="flex items-center gap-1">
                                <div
                                    className="w-2 h-2 shrink-0"
                                    style={{ backgroundColor: CATEGORY_COLORS[cat] || '#71717a' }}
                                />
                                <span className="text-gray-500 text-[10px] truncate">{cat}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info */}
                <div className="text-xs text-gray-600 text-center hidden lg:block">
                    Drag to rotate • Click to select
                </div>

                {/* Reset view button */}
                <div className="flex gap-1">
                    <button
                        onClick={() => {
                            setRotationX(DEFAULT_CAMERA.rotationX);
                            setRotationY(DEFAULT_CAMERA.rotationY);
                        }}
                        className="flex-1 text-xs px-2 py-1 border border-gray-600 text-gray-400 hover:bg-gray-800 outline-none"
                    >
                        Reset
                    </button>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(exportJson());
                        }}
                        className="flex-1 text-xs px-2 py-1 border border-lime-500 text-lime-500 hover:bg-lime-500/20 outline-none"
                    >
                        Copy
                    </button>
                </div>
            </div>
        </div>
    );
});

function StatBox({
    label,
    value,
    highlight,
    inverted,
}: {
    label: string;
    value: string;
    highlight?: boolean;
    inverted?: boolean;
}) {
    const borderClass = highlight
        ? inverted ? 'border-lime-600/50 bg-lime-100' : 'border-lime-500/50 bg-lime-500/10'
        : inverted ? 'border-gray-300 bg-gray-50' : 'border-gray-700 bg-black/50';

    const labelClass = inverted ? 'text-gray-500' : 'text-gray-500';
    const valueClass = highlight
        ? inverted ? 'text-lime-600' : 'text-lime-400'
        : inverted ? 'text-gray-800' : 'text-white';

    return (
        <div className={`p-1.5 border ${borderClass}`}>
            <div className={`text-[10px] mb-1 ${labelClass}`}>{label}</div>
            <div className={`font-mono text-[11px] ${valueClass}`}>{value}</div>
        </div>
    );
}

export default Viewer;
