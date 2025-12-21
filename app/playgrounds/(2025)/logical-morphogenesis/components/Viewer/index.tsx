'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import {
    Sentence,
    SimulationResult,
    AttractorParams,
    AttractorType,
    simulateAttractor,
    generateEscapeTime,
    ATTRACTOR_PRESETS,
    DEFAULT_ATTRACTOR_PARAMS,
} from '../../constants';

interface ViewerProps {
    sentences: Sentence[];
    simulationResult: SimulationResult;
    currentStep: number;
    isPlaying: boolean;
    maxStep: number;
    onPlay: () => void;
    onPause: () => void;
    onStepForward: () => void;
    onStepBackward: () => void;
    onReset: () => void;
    onStepChange: (step: number) => void;
}

type ViewMode = 'discrete' | 'attractor';

export default function Viewer({
    sentences,
    simulationResult,
    currentStep,
    isPlaying,
    maxStep,
    onPlay,
    onPause,
    onStepForward,
    onStepBackward,
    onReset,
    onStepChange,
}: ViewerProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('discrete');
    const [attractorParams, setAttractorParams] = useState<AttractorParams>(DEFAULT_ATTRACTOR_PARAMS);
    const { history, stats } = simulationResult;

    const attractorResult = useMemo(
        () => simulateAttractor(attractorParams),
        [attractorParams]
    );

    return (
        <div className="w-full h-full flex flex-col">
            {/* Controls bar at top */}
            <div className="flex items-center justify-center gap-4 py-3 px-8 border-b border-gray-800 flex-shrink-0">
                {/* View Mode Toggle */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('discrete')}
                        className={`px-4 py-1.5 text-sm border transition-colors focus:outline-none focus:ring-1 focus:ring-white ${
                            viewMode === 'discrete'
                                ? 'border-lime-500 text-lime-400 bg-lime-500/10'
                                : 'border-lime-500/30 text-gray-400 hover:border-lime-500/50'
                        }`}
                    >
                        Discrete
                    </button>
                    <button
                        onClick={() => setViewMode('attractor')}
                        className={`px-4 py-1.5 text-sm border transition-colors focus:outline-none focus:ring-1 focus:ring-white ${
                            viewMode === 'attractor'
                                ? 'border-lime-500 text-lime-400 bg-lime-500/10'
                                : 'border-lime-500/30 text-gray-400 hover:border-lime-500/50'
                        }`}
                    >
                        Infinite-valued
                    </button>
                </div>

                {/* Playback Controls for discrete mode */}
                {viewMode === 'discrete' && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onReset}
                            className="px-3 py-1.5 text-sm border border-lime-500/30 text-gray-400 hover:border-lime-500/50 hover:text-gray-300 focus:outline-none focus:ring-1 focus:ring-white"
                            title="Reset"
                        >
                            ⏮
                        </button>
                        <button
                            onClick={onStepBackward}
                            className="px-3 py-1.5 text-sm border border-lime-500/30 text-gray-400 hover:border-lime-500/50 hover:text-gray-300 focus:outline-none focus:ring-1 focus:ring-white"
                            title="Step back"
                        >
                            ◀
                        </button>
                        <button
                            onClick={isPlaying ? onPause : onPlay}
                            className={`px-4 py-1.5 text-sm border transition-colors focus:outline-none focus:ring-1 focus:ring-white ${
                                isPlaying
                                    ? 'border-lime-500 text-lime-400 bg-lime-500/10'
                                    : 'border-lime-500/30 text-gray-400 hover:border-lime-500/50 hover:text-gray-300'
                            }`}
                            title={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? '⏸' : '▶'}
                        </button>
                        <button
                            onClick={onStepForward}
                            className="px-3 py-1.5 text-sm border border-lime-500/30 text-gray-400 hover:border-lime-500/50 hover:text-gray-300 focus:outline-none focus:ring-1 focus:ring-white"
                            title="Step forward"
                        >
                            ▶
                        </button>
                        <span className="text-sm text-gray-400 ml-2 w-32 tabular-nums">
                            t = {currentStep} / {maxStep}
                        </span>
                    </div>
                )}

                {/* Attractor type selector */}
                {viewMode === 'attractor' && (
                    <div className="flex items-center gap-2">
                        <select
                            value={attractorParams.type}
                            onChange={(e) => setAttractorParams({ ...attractorParams, type: e.target.value as AttractorType })}
                            className="bg-black border border-lime-500/30 text-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-lime-500"
                        >
                            {ATTRACTOR_PRESETS.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        {attractorParams.type === 'triplist' && (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span>factor:</span>
                                <input
                                    type="number"
                                    min={0.1}
                                    max={1}
                                    step={0.05}
                                    value={attractorParams.factor}
                                    onChange={(e) => setAttractorParams({ ...attractorParams, factor: parseFloat(e.target.value) || 0.5 })}
                                    className="w-16 bg-black border border-lime-500/30 text-gray-200 px-2 py-1 text-sm focus:outline-none focus:border-lime-500"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Main visualization area */}
            <div className="flex-1 overflow-hidden">
                {viewMode === 'discrete' ? (
                    <DiscreteView
                        sentences={sentences}
                        history={history}
                        stats={stats.perSentence}
                        currentStep={currentStep}
                        maxStep={maxStep}
                        onStepChange={onStepChange}
                    />
                ) : (
                    <AttractorView
                        attractorResult={attractorResult}
                        attractorParams={attractorParams}
                    />
                )}
            </div>
        </div>
    );
}

// =====================
// Discrete View
// =====================

function DiscreteView({
    sentences,
    history,
    stats,
    currentStep,
    maxStep,
    onStepChange,
}: {
    sentences: Sentence[];
    history: boolean[][];
    stats: Array<{ id: string; label: string; mean: number; flipRate: number; entropyProxy: number }>;
    currentStep: number;
    maxStep: number;
    onStepChange: (step: number) => void;
}) {
    if (sentences.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
                Add sentences to see the truth dynamics.
            </div>
        );
    }

    return (
        <div className="w-full h-full flex">
            {/* Timeline + slider - left/main area */}
            <div className="flex-1 flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                    <TimelineGrid
                        sentences={sentences}
                        history={history}
                        currentStep={currentStep}
                        onStepChange={onStepChange}
                    />
                </div>
                {/* Slider directly below timeline */}
                <div className="px-8 py-4 border-t border-gray-800">
                    <input
                        type="range"
                        min={0}
                        max={maxStep}
                        value={currentStep}
                        onChange={(e) => onStepChange(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-800 appearance-none cursor-pointer accent-lime-500"
                    />
                </div>
            </div>
            {/* Phase Space - right side */}
            <div className="w-[350px] min-w-[280px] border-l border-gray-800">
                <ScatterPlot stats={stats} />
            </div>
        </div>
    );
}

function TimelineGrid({
    sentences,
    history,
    currentStep,
    onStepChange,
}: {
    sentences: Sentence[];
    history: boolean[][];
    currentStep: number;
    onStepChange: (step: number) => void;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight,
                });
            }
        };
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const rows = sentences.length;
    const labelWidth = 100;
    const rightPadding = 30;
    const topPadding = 20;
    const bottomPadding = 40;

    const availableWidth = dimensions.width - labelWidth - rightPadding - 40;
    const availableHeight = dimensions.height - topPadding - bottomPadding - 20;

    // Make cells fill the available space
    const cols = history.length;
    const cellW = Math.max(3, availableWidth / Math.max(1, cols));
    const cellH = Math.max(20, Math.min(50, availableHeight / Math.max(1, rows)));

    const gridWidth = cols * cellW;
    const gridHeight = rows * cellH;

    const svgWidth = labelWidth + gridWidth + rightPadding;
    const svgHeight = topPadding + gridHeight + bottomPadding;

    const tickCount = Math.min(10, cols);
    const ticks = useMemo(() => {
        if (cols <= 1) return [{ colIdx: 0, t: 0 }];
        return Array.from({ length: tickCount }, (_, i) => {
            const colIdx = Math.round((i * (cols - 1)) / Math.max(1, tickCount - 1));
            return { colIdx, t: colIdx };
        });
    }, [cols, tickCount]);

    const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - labelWidth;
        if (x >= 0) {
            const col = Math.floor(x / cellW);
            const step = Math.max(0, Math.min(cols - 1, col));
            onStepChange(step);
        }
    };

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center p-4">
            <svg
                width={svgWidth}
                height={svgHeight}
                className="block"
                onClick={handleClick}
                style={{ cursor: 'pointer' }}
            >
                {/* Labels */}
                {sentences.map((s, r) => (
                    <text
                        key={s.id}
                        x={labelWidth - 8}
                        y={topPadding + r * cellH + cellH / 2 + 5}
                        fontSize={13}
                        textAnchor="end"
                        className="fill-gray-300"
                    >
                        {s.label.length > 12 ? s.label.slice(0, 12) + '…' : s.label}
                    </text>
                ))}

                {/* Grid */}
                <g transform={`translate(${labelWidth}, ${topPadding})`}>
                    {Array.from({ length: rows }).map((_, r) => (
                        <g key={r}>
                            {Array.from({ length: cols }).map((__, c) => {
                                const v = history[c]?.[r] ?? false;
                                const isPast = c <= currentStep;
                                return (
                                    <rect
                                        key={c}
                                        x={c * cellW}
                                        y={r * cellH}
                                        width={cellW - 1}
                                        height={cellH - 2}
                                        fill={v ? '#84cc16' : '#1f1f1f'}
                                        stroke="#333"
                                        strokeWidth={0.5}
                                        opacity={isPast ? 1 : 0.25}
                                    />
                                );
                            })}
                        </g>
                    ))}

                    {/* Current step indicator */}
                    <line
                        x1={currentStep * cellW + cellW / 2}
                        y1={-8}
                        x2={currentStep * cellW + cellW / 2}
                        y2={gridHeight + 8}
                        stroke="#84cc16"
                        strokeWidth={2}
                    />

                    {/* X-axis ticks */}
                    {ticks.map(({ colIdx, t }) => (
                        <g key={`tick-${t}`}>
                            <line
                                x1={colIdx * cellW + cellW / 2}
                                y1={gridHeight + 4}
                                x2={colIdx * cellW + cellW / 2}
                                y2={gridHeight + 10}
                                stroke="#666"
                                strokeWidth={1}
                            />
                            <text
                                x={colIdx * cellW + cellW / 2}
                                y={gridHeight + 24}
                                fontSize={11}
                                textAnchor="middle"
                                className="fill-gray-500"
                            >
                                {t}
                            </text>
                        </g>
                    ))}
                </g>

                {/* X-axis label */}
                <text
                    x={labelWidth + gridWidth / 2}
                    y={svgHeight - 5}
                    fontSize={12}
                    textAnchor="middle"
                    className="fill-gray-500"
                >
                    time step
                </text>
            </svg>
        </div>
    );
}

function ScatterPlot({
    stats,
}: {
    stats: Array<{ id: string; label: string; mean: number; flipRate: number; entropyProxy: number }>;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState(280);

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const w = containerRef.current.clientWidth;
                const h = containerRef.current.clientHeight;
                setSize(Math.min(w - 20, h - 20, 350));
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const padL = 50;
    const padR = 20;
    const padT = 30;
    const padB = 50;

    const x = (v: number) => padL + v * (size - padL - padR);
    const y = (v: number) => padT + (1 - v) * (size - padT - padB);

    const ticks = [0, 0.5, 1];

    return (
        <div ref={containerRef} className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className="text-xs text-gray-500 mb-2">Phase Space</div>
            <svg width={size} height={size} className="block">
                {/* Axes */}
                <line x1={padL} y1={padT} x2={padL} y2={size - padB} stroke="#444" strokeWidth={1} />
                <line x1={padL} y1={size - padB} x2={size - padR} y2={size - padB} stroke="#444" strokeWidth={1} />

                {/* Ticks */}
                {ticks.map((t) => (
                    <g key={t}>
                        <line x1={x(t)} y1={size - padB} x2={x(t)} y2={size - padB + 5} stroke="#666" strokeWidth={1} />
                        <text x={x(t)} y={size - padB + 18} textAnchor="middle" fontSize={10} className="fill-gray-500">
                            {t.toFixed(1)}
                        </text>
                        <line x1={padL - 5} y1={y(t)} x2={padL} y2={y(t)} stroke="#666" strokeWidth={1} />
                        <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize={10} className="fill-gray-500">
                            {t.toFixed(1)}
                        </text>
                    </g>
                ))}

                {/* Axis labels */}
                <text x={(padL + size - padR) / 2} y={size - 8} textAnchor="middle" fontSize={11} className="fill-gray-400">
                    mean truth
                </text>
                <text x={12} y={(padT + size - padB) / 2} textAnchor="middle" fontSize={11} className="fill-gray-400" transform={`rotate(-90, 12, ${(padT + size - padB) / 2})`}>
                    flip rate
                </text>

                {/* Points */}
                {stats.map((s) => {
                    const radius = 8 + 14 * Math.max(0, Math.min(1, s.entropyProxy));
                    return (
                        <g key={s.id}>
                            <circle
                                cx={x(s.mean)}
                                cy={y(s.flipRate)}
                                r={radius}
                                fill="#84cc16"
                                fillOpacity={0.25}
                                stroke="#84cc16"
                                strokeOpacity={0.9}
                                strokeWidth={2}
                            />
                            <text
                                x={x(s.mean)}
                                y={y(s.flipRate) + 4}
                                textAnchor="middle"
                                fontSize={10}
                                className="fill-gray-200"
                            >
                                {s.label.length > 8 ? s.label.slice(0, 8) : s.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
            <div className="text-xs text-gray-600 mt-2">circle size = entropy</div>
        </div>
    );
}

// =====================
// Attractor View (Infinite-valued logic - separate demo)
// =====================

function AttractorView({
    attractorResult,
    attractorParams,
}: {
    attractorResult: { points: Array<{ x: number; y: number; z: number }>; is3D: boolean };
    attractorParams: AttractorParams;
}) {
    const [showEscapeTime, setShowEscapeTime] = useState(false);

    const escapeTimeData = useMemo(() => {
        if (!showEscapeTime || attractorResult.is3D) return null;
        return generateEscapeTime(150, 100, 1.03, attractorParams.type as 'dualist' | 'dualist_sequential');
    }, [showEscapeTime, attractorResult.is3D, attractorParams.type]);

    const preset = ATTRACTOR_PRESETS.find((p) => p.id === attractorParams.type);

    return (
        <div className="w-full h-full flex flex-col">
            {/* Description */}
            <div className="px-6 py-3 border-b border-gray-800 text-center">
                <div className="text-sm text-gray-400">{preset?.description}</div>
                <div className="text-xs text-gray-600 mt-1">
                    This demonstrates Grim&apos;s infinite-valued logic algorithms (separate from the discrete sentences above)
                </div>
            </div>

            <div className="flex-1 flex">
                {/* Attractor plot */}
                <div className="flex-1">
                    <AttractorPlot points={attractorResult.points} is3D={attractorResult.is3D} />
                </div>
                {/* Escape-time diagram for 2D attractors */}
                {!attractorResult.is3D && (
                    <div className="w-[400px] min-w-[300px] border-l border-gray-800 flex flex-col">
                        <div className="p-3 border-b border-gray-800 flex items-center gap-3">
                            <button
                                onClick={() => setShowEscapeTime(!showEscapeTime)}
                                className={`px-3 py-1 text-xs border transition-colors ${
                                    showEscapeTime
                                        ? 'border-lime-500 text-lime-400 bg-lime-500/10'
                                        : 'border-lime-500/30 text-gray-400 hover:border-lime-500/50'
                                }`}
                            >
                                {showEscapeTime ? 'Hide' : 'Show'} Escape-Time
                            </button>
                            <span className="text-xs text-gray-600">Fractal coloring by escape iterations</span>
                        </div>
                        <div className="flex-1">
                            {showEscapeTime && escapeTimeData ? (
                                <EscapeTimePlot data={escapeTimeData} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm p-6 text-center">
                                    Click &quot;Show Escape-Time&quot; to see the fractal diagram where each initial (x,y) is colored by iterations to escape
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function AttractorPlot({ points, is3D }: { points: Array<{ x: number; y: number; z: number }>; is3D: boolean }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState(500);
    const [rotation, setRotation] = useState({ x: 0.5, y: 0.3 });
    const isDragging = useRef(false);
    const lastMouse = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const w = containerRef.current.clientWidth;
                const h = containerRef.current.clientHeight;
                setSize(Math.min(w, h) - 40);
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!is3D) return;
        isDragging.current = true;
        lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !is3D) return;
        const dx = e.clientX - lastMouse.current.x;
        const dy = e.clientY - lastMouse.current.y;
        setRotation((r) => ({
            x: r.x + dy * 0.01,
            y: r.y + dx * 0.01,
        }));
        lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    const pad = 60;

    // Project 3D point to 2D
    const project = (p: { x: number; y: number; z: number }) => {
        if (!is3D) {
            return {
                x: pad + p.x * (size - 2 * pad),
                y: pad + (1 - p.y) * (size - 2 * pad),
                z: 0,
            };
        }

        const cosX = Math.cos(rotation.x);
        const sinX = Math.sin(rotation.x);
        const cosY = Math.cos(rotation.y);
        const sinY = Math.sin(rotation.y);

        const cx = p.x - 0.5;
        const cy = p.y - 0.5;
        const cz = p.z - 0.5;

        const x1 = cx * cosY - cz * sinY;
        const z1 = cx * sinY + cz * cosY;
        const y1 = cy * cosX - z1 * sinX;
        const z2 = cy * sinX + z1 * cosX;

        const scale = 0.7;
        return {
            x: size / 2 + x1 * (size - 2 * pad) * scale,
            y: size / 2 - y1 * (size - 2 * pad) * scale,
            z: z2,
        };
    };

    const sortedPoints = useMemo(() => {
        const projected = points.map((p) => ({ ...p, projected: project(p) }));
        if (is3D) {
            projected.sort((a, b) => (a.projected.z ?? 0) - (b.projected.z ?? 0));
        }
        return projected;
    }, [points, is3D, rotation]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center p-4"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: is3D ? 'grab' : 'default' }}
        >
            <svg width={size} height={size} className="block">
                <rect x={0} y={0} width={size} height={size} fill="#0a0a0a" />

                {/* Axes for 2D */}
                {!is3D && (
                    <>
                        <line x1={pad} y1={pad} x2={pad} y2={size - pad} stroke="#333" strokeWidth={1} />
                        <line x1={pad} y1={size - pad} x2={size - pad} y2={size - pad} stroke="#333" strokeWidth={1} />
                        <text x={size / 2} y={size - 20} textAnchor="middle" fontSize={12} className="fill-gray-500">X (truth of sentence 1)</text>
                        <text x={20} y={size / 2} textAnchor="middle" fontSize={12} className="fill-gray-500" transform={`rotate(-90, 20, ${size / 2})`}>Y (truth of sentence 2)</text>
                    </>
                )}

                {/* Points */}
                {sortedPoints.map((p, i) => {
                    const proj = p.projected;
                    const depth = is3D ? (proj.z ?? 0) + 0.5 : 1;
                    const alpha = is3D ? 0.3 + 0.6 * depth : 0.5;
                    return (
                        <circle
                            key={i}
                            cx={proj.x}
                            cy={proj.y}
                            r={is3D ? 1.5 : 1}
                            fill="#84cc16"
                            fillOpacity={alpha}
                        />
                    );
                })}

                {/* 3D rotation hint */}
                {is3D && (
                    <text x={size - 15} y={25} textAnchor="end" fontSize={11} className="fill-gray-500">
                        drag to rotate
                    </text>
                )}

                {/* Title */}
                <text x={size / 2} y={20} textAnchor="middle" fontSize={13} className="fill-gray-400">
                    {is3D ? 'Strange Attractor (3D)' : 'Strange Attractor (2D)'}
                </text>
            </svg>
        </div>
    );
}

function EscapeTimePlot({ data }: { data: Array<{ x: number; y: number; iterations: number }> }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState(350);

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const w = containerRef.current.clientWidth;
                const h = containerRef.current.clientHeight;
                setSize(Math.min(w, h) - 30);
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const maxIter = Math.max(...data.map((d) => d.iterations));
    const pad = 40;

    const getColor = (iter: number) => {
        const t = iter / maxIter;
        const r = Math.floor(132 * (1 - t));
        const g = Math.floor(204 * (1 - t * 0.5));
        const b = Math.floor(22 * (1 - t));
        return `rgb(${r}, ${g}, ${b})`;
    };

    const resolution = Math.sqrt(data.length);
    const cellSize = (size - 2 * pad) / resolution;

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center p-4">
            <svg width={size} height={size} className="block">
                {/* Title */}
                <text x={size / 2} y={18} textAnchor="middle" fontSize={12} className="fill-gray-400">
                    Escape-Time Fractal
                </text>

                {/* Escape time cells */}
                {data.map((d, i) => {
                    const col = i % resolution;
                    const row = Math.floor(i / resolution);
                    return (
                        <rect
                            key={i}
                            x={pad + col * cellSize}
                            y={pad + (resolution - 1 - row) * cellSize}
                            width={cellSize}
                            height={cellSize}
                            fill={getColor(d.iterations)}
                        />
                    );
                })}

                {/* Axes */}
                <line x1={pad} y1={pad} x2={pad} y2={size - pad} stroke="#666" strokeWidth={1} />
                <line x1={pad} y1={size - pad} x2={size - pad} y2={size - pad} stroke="#666" strokeWidth={1} />

                {/* Labels */}
                <text x={size / 2} y={size - 8} textAnchor="middle" fontSize={11} className="fill-gray-500">X</text>
                <text x={12} y={size / 2} textAnchor="middle" fontSize={11} className="fill-gray-500" transform={`rotate(-90, 12, ${size / 2})`}>Y</text>
                <text x={size - pad + 5} y={pad - 5} textAnchor="start" fontSize={9} className="fill-gray-600">
                    max: {maxIter}
                </text>
            </svg>
        </div>
    );
}
