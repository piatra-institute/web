'use client';

import { forwardRef, useImperativeHandle, useState, useMemo, useRef, useEffect } from 'react';
import { ViewerRef, SimulationParams } from '../../playground';
import {
    Point,
    CountryModel,
    computeCountryModel,
    sampleMixturePoints,
    calcStats,
    buildNetPositivePolygon,
    labelFor,
    sublabelFor,
    fmt,
    clamp,
} from '../../logic';

const SIZE = 600;
const XMIN = -10, XMAX = 10, YMIN = -10, YMAX = 10;

// Coordinate transforms
const sx = (x: number) => ((x - XMIN) / (XMAX - XMIN)) * SIZE;
const sy = (y: number) => SIZE - ((y - YMIN) / (YMAX - YMIN)) * SIZE;
const ix = (px: number) => (px / SIZE) * (XMAX - XMIN) + XMIN;
const iy = (py: number) => ((SIZE - py) / SIZE) * (YMAX - YMIN) + YMIN;

// Colors
const COLORS = {
    intelligent: '#3b82f6', // blue
    helpless: '#f59e0b',    // amber
    bandit: '#a855f7',      // purple
    stupid: '#ef4444',      // red
    netPos: '#22c55e',      // green
    netNeg: '#f43f5e',      // rose
};

const DEFAULT_PARAMS: SimulationParams = {
    preset: 'High-trust Nordic',
    gdpPcUSD: 65000,
    gini: 27,
    unemploymentPct: 4,
    cpi: 80,
    trustPct: 65,
    orphanPct: 0.2,
    educationIndex: 0.90,
    sensitivity: 1.0,
    seed: 123456,
    nAgents: 250,
    showGrid: true,
    showNetBoundary: true,
    shadeNetPositive: true,
    showQuadrantLabels: true,
    colorMode: 'quadrant',
};

const Viewer = forwardRef<ViewerRef>((_, ref) => {
    const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
    const [points, setPoints] = useState<Point[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const draggingRef = useRef<{ active: boolean; id: string | null }>({ active: false, id: null });
    const svgRef = useRef<SVGSVGElement>(null);

    // Compute country model
    const model: CountryModel = useMemo(() => {
        return computeCountryModel({
            gdpPcUSD: params.gdpPcUSD,
            gini: params.gini,
            unemploymentPct: params.unemploymentPct,
            cpi: params.cpi,
            trustPct: params.trustPct,
            orphanPct: params.orphanPct,
            educationIndex: params.educationIndex,
        }, params.sensitivity);
    }, [params.gdpPcUSD, params.gini, params.unemploymentPct, params.cpi, params.trustPct, params.orphanPct, params.educationIndex, params.sensitivity]);

    // Compute stats
    const stats = useMemo(() => calcStats(points), [points]);

    // Net positive polygon
    const netPositivePolygon = useMemo(() =>
        buildNetPositivePolygon({ XMIN, XMAX, YMIN, YMAX }), []);
    const netPositiveSvgPoints = useMemo(() =>
        netPositivePolygon.map((p) => `${sx(p.x)},${sy(p.y)}`).join(' '), [netPositivePolygon]);

    // Selected point
    const selected = useMemo(() => points.find((p) => p.id === selectedId) || null, [points, selectedId]);

    useImperativeHandle(ref, () => ({
        updateSimulation: (newParams: SimulationParams) => {
            setParams(newParams);
        },
        generate: () => {
            const newPoints = sampleMixturePoints(
                model,
                params.nAgents,
                params.seed,
                { XMIN, XMAX, YMIN, YMAX }
            );
            setPoints(newPoints);
            setSelectedId(null);
        },
        reset: () => {
            setParams(DEFAULT_PARAMS);
            setPoints([]);
            setSelectedId(null);
        },
    }));

    // Generate initial population
    useEffect(() => {
        const newPoints = sampleMixturePoints(
            model,
            params.nAgents,
            params.seed,
            { XMIN, XMAX, YMIN, YMAX }
        );
        setPoints(newPoints);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Get color for point
    const colorFor = (p: Point): string => {
        if (params.colorMode === 'net') {
            return p.x + p.y >= 0 ? COLORS.netPos : COLORS.netNeg;
        }
        if (params.colorMode === 'component') {
            const tag = p.tag || labelFor(p.x, p.y);
            if (tag === 'Intelligent') return COLORS.intelligent;
            if (tag === 'Helpless') return COLORS.helpless;
            if (tag === 'Bandit') return COLORS.bandit;
            return COLORS.stupid;
        }
        // quadrant mode
        const q = labelFor(p.x, p.y);
        if (q === 'Intelligent') return COLORS.intelligent;
        if (q === 'Helpless') return COLORS.helpless;
        if (q === 'Bandit') return COLORS.bandit;
        return COLORS.stupid;
    };

    // Drag handlers
    const getLocalPoint = (evt: React.PointerEvent | PointerEvent) => {
        const svg = svgRef.current;
        if (!svg) return null;
        const rect = svg.getBoundingClientRect();
        const px = clamp(evt.clientX - rect.left, 0, rect.width);
        const py = clamp(evt.clientY - rect.top, 0, rect.height);
        const vbX = (px / rect.width) * SIZE;
        const vbY = (py / rect.height) * SIZE;
        return { vbX, vbY };
    };

    const handlePointerDown = (e: React.PointerEvent, id: string) => {
        e.preventDefault();
        draggingRef.current = { active: true, id };
        setSelectedId(id);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        const st = draggingRef.current;
        if (!st.active || !st.id) return;
        const loc = getLocalPoint(e);
        if (!loc) return;
        const x = clamp(ix(loc.vbX), XMIN, XMAX);
        const y = clamp(iy(loc.vbY), YMIN, YMAX);
        setPoints((prev) => prev.map((p) => (p.id === st.id ? { ...p, x, y } : p)));
    };

    const handlePointerUp = () => {
        draggingRef.current = { active: false, id: null };
    };

    useEffect(() => {
        window.addEventListener('pointerup', handlePointerUp);
        return () => window.removeEventListener('pointerup', handlePointerUp);
    }, []);

    return (
        <div className="w-full h-full bg-black border border-lime-500/20 p-4 overflow-auto">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* SVG Chart */}
                <div className="flex-1">
                    <svg
                        ref={svgRef}
                        viewBox={`0 0 ${SIZE} ${SIZE}`}
                        className="w-full h-auto max-w-[600px] mx-auto select-none"
                        onPointerMove={handlePointerMove}
                        onPointerLeave={handlePointerUp}
                    >
                        <rect x={0} y={0} width={SIZE} height={SIZE} fill="black" />

                        {/* Net positive shading */}
                        {params.shadeNetPositive && params.showNetBoundary && netPositiveSvgPoints && (
                            <polygon points={netPositiveSvgPoints} fill="rgba(255,255,255,0.03)" />
                        )}

                        {/* Grid */}
                        {params.showGrid && (
                            <g>
                                {Array.from({ length: 21 }, (_, i) => XMIN + i).map((gx) => (
                                    <line
                                        key={`gx-${gx}`}
                                        x1={sx(gx)}
                                        y1={0}
                                        x2={sx(gx)}
                                        y2={SIZE}
                                        stroke="rgba(132, 204, 22, 0.08)"
                                        strokeWidth={1}
                                    />
                                ))}
                                {Array.from({ length: 21 }, (_, i) => YMIN + i).map((gy) => (
                                    <line
                                        key={`gy-${gy}`}
                                        x1={0}
                                        y1={sy(gy)}
                                        x2={SIZE}
                                        y2={sy(gy)}
                                        stroke="rgba(132, 204, 22, 0.08)"
                                        strokeWidth={1}
                                    />
                                ))}
                            </g>
                        )}

                        {/* Axes */}
                        <line x1={sx(0)} y1={0} x2={sx(0)} y2={SIZE} stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
                        <line x1={0} y1={sy(0)} x2={SIZE} y2={sy(0)} stroke="rgba(255,255,255,0.5)" strokeWidth={2} />

                        {/* Net welfare boundary (P-O-M line) */}
                        {params.showNetBoundary && (
                            <g>
                                <line
                                    x1={sx(XMIN)}
                                    y1={sy(-XMIN)}
                                    x2={sx(XMAX)}
                                    y2={sy(-XMAX)}
                                    stroke="rgba(255,255,255,0.45)"
                                    strokeWidth={2}
                                    strokeDasharray="6 6"
                                />
                                <text x={sx(7)} y={sy(-7) - 10} fontSize={11} fill="rgba(255,255,255,0.6)" textAnchor="start">
                                    x + y = 0
                                </text>
                                <text x={sx(-9)} y={sy(9) + 16} fontSize={10} fill="rgba(255,255,255,0.4)" textAnchor="start">
                                    P
                                </text>
                                <text x={sx(9) - 10} y={sy(-9) + 16} fontSize={10} fill="rgba(255,255,255,0.4)" textAnchor="end">
                                    M
                                </text>
                            </g>
                        )}

                        {/* Axis labels */}
                        <text x={SIZE - 8} y={sy(0) - 10} fontSize={12} fill="rgba(255,255,255,0.7)" textAnchor="end">
                            Benefit to self (x)
                        </text>
                        <text x={sx(0) + 10} y={16} fontSize={12} fill="rgba(255,255,255,0.7)" textAnchor="start">
                            Benefit to others (y)
                        </text>

                        {/* Quadrant labels */}
                        {params.showQuadrantLabels && (
                            <g fill="rgba(255,255,255,0.25)" fontSize={14} fontWeight={600}>
                                <text x={sx(6)} y={sy(7)} textAnchor="middle">INTELLIGENT</text>
                                <text x={sx(-6)} y={sy(7)} textAnchor="middle">HELPLESS</text>
                                <text x={sx(-6)} y={sy(-7)} textAnchor="middle">STUPID</text>
                                <text x={sx(6)} y={sy(-7)} textAnchor="middle">BANDIT</text>
                            </g>
                        )}

                        {/* Points */}
                        <g>
                            {points.map((p) => {
                                const r = p.id === selectedId ? 7 : 5;
                                const fill = colorFor(p);
                                const stroke = p.id === selectedId ? 'white' : 'transparent';
                                return (
                                    <circle
                                        key={p.id}
                                        cx={sx(p.x)}
                                        cy={sy(p.y)}
                                        r={r}
                                        fill={fill}
                                        stroke={stroke}
                                        strokeWidth={2}
                                        onPointerDown={(e) => handlePointerDown(e, p.id)}
                                        onClick={() => setSelectedId(p.id)}
                                        style={{ cursor: 'grab' }}
                                    >
                                        <title>{`${sublabelFor(p.x, p.y)}\n(x=${fmt(p.x)}, y=${fmt(p.y)}, x+y=${fmt(p.x + p.y)})`}</title>
                                    </circle>
                                );
                            })}
                        </g>
                    </svg>
                </div>

                {/* Stats Panel */}
                <div className="lg:w-64 space-y-4">
                    {/* Model Weights */}
                    <div className="bg-black border border-lime-500/20 p-3">
                        <h4 className="text-lime-400 font-semibold text-sm mb-3">Model Weights</h4>
                        <div className="space-y-2">
                            {[
                                { k: 'Intelligent', v: model.weights.Intelligent, c: COLORS.intelligent },
                                { k: 'Helpless', v: model.weights.Helpless, c: COLORS.helpless },
                                { k: 'Bandit', v: model.weights.Bandit, c: COLORS.bandit },
                                { k: 'Stupid', v: model.weights.Stupid, c: COLORS.stupid },
                            ].map((b) => (
                                <div key={b.k}>
                                    <div className="flex items-center justify-between text-xs text-gray-300">
                                        <span>{b.k}</span>
                                        <span className="font-mono">{(b.v * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="mt-1 h-2 w-full bg-black border border-lime-500/20">
                                        <div
                                            className="h-full"
                                            style={{ width: `${Math.max(0, Math.min(100, b.v * 100))}%`, background: b.c }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Population Stats */}
                    <div className="bg-black border border-lime-500/20 p-3">
                        <h4 className="text-lime-400 font-semibold text-sm mb-3">Population Stats</h4>
                        <div className="text-xs text-gray-300 space-y-1 font-mono">
                            <div>N = {stats.n}</div>
                            <div>Mean x = {fmt(stats.meanX)}</div>
                            <div>Mean y = {fmt(stats.meanY)}</div>
                            <div>Mean net = {fmt(stats.meanNet)}</div>
                            <div className="border-t border-lime-500/20 pt-1 mt-2">
                                <div>Intelligent: {stats.counts.Intelligent}</div>
                                <div>Helpless: {stats.counts.Helpless} ({stats.counts.helplessNetPos} net+, {stats.counts.helplessNetNeg} net-)</div>
                                <div>Bandit: {stats.counts.Bandit} ({stats.counts.banditNetPos} net+, {stats.counts.banditNetNeg} net-)</div>
                                <div>Stupid: {stats.counts.Stupid}</div>
                            </div>
                            <div className="border-t border-lime-500/20 pt-1 mt-2">
                                <div className="text-green-400">Net positive: {stats.counts.netPos}</div>
                                <div className="text-red-400">Net negative: {stats.counts.netNeg}</div>
                            </div>
                        </div>
                    </div>

                    {/* Selected Point */}
                    {selected && (
                        <div className="bg-black border border-lime-500/20 p-3">
                            <h4 className="text-lime-400 font-semibold text-sm mb-2">Selected</h4>
                            <div className="text-xs text-gray-300 space-y-1 font-mono">
                                <div>{sublabelFor(selected.x, selected.y)}</div>
                                <div>x = {fmt(selected.x)}</div>
                                <div>y = {fmt(selected.y)}</div>
                                <div>x + y = {fmt(selected.x + selected.y)}</div>
                            </div>
                        </div>
                    )}

                    {/* Latent Factors */}
                    <details className="bg-black border border-lime-500/20 p-3">
                        <summary className="cursor-pointer text-lime-400 font-semibold text-sm">Latent Factors</summary>
                        <div className="mt-2 text-xs text-gray-300 space-y-1 font-mono">
                            <div>Prosperity: {fmt(model.factors.prosperity)}</div>
                            <div>Institutions: {fmt(model.factors.institutions)}</div>
                            <div>Inequality: {fmt(model.factors.inequality)}</div>
                            <div>Stress: {fmt(model.factors.stress)}</div>
                        </div>
                    </details>
                </div>
            </div>
        </div>
    );
});

Viewer.displayName = 'Viewer';

export default Viewer;
