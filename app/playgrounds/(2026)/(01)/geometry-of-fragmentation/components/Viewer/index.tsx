'use client';

import { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import { Polygon, polygonArea, MosaicStats, computeStats, HistoryPoint, ATTRACTORS } from '../../logic';



export interface ViewerRef {
    updateMosaic: (polys: Polygon[], history: HistoryPoint[]) => void;
}

export type ColorMode = 'sides' | 'area' | 'index';

interface ViewerProps {
    colorMode: ColorMode;
    showEdges: boolean;
    showFill: boolean;
    animationFrame: number; // -1 means show final, 0+ means show that history index
    historyLength: number;
}

const Viewer = forwardRef<ViewerRef, ViewerProps>(({
    colorMode,
    showEdges,
    showFill,
    animationFrame,
    historyLength,
}, ref) => {
    const mosaicRef = useRef<HTMLCanvasElement>(null);
    const sidesHistRef = useRef<HTMLCanvasElement>(null);
    const degreeHistRef = useRef<HTMLCanvasElement>(null);
    const phaseRef = useRef<HTMLCanvasElement>(null);
    const historyRef = useRef<HTMLCanvasElement>(null);

    const [finalPolys, setFinalPolys] = useState<Polygon[]>([]);
    const [history, setHistory] = useState<HistoryPoint[]>([]);
    const [stats, setStats] = useState<MosaicStats | null>(null);

    // Get current frame's polygons and stats
    const currentPolys = animationFrame >= 0 && animationFrame < history.length
        ? history[animationFrame].polys
        : finalPolys;
    const currentStats = animationFrame >= 0 && animationFrame < history.length
        ? computeStats(history[animationFrame].polys)
        : stats;
    const visibleHistory = animationFrame >= 0
        ? history.slice(0, animationFrame + 1)
        : history;

    useImperativeHandle(ref, () => ({
        updateMosaic: (newPolys: Polygon[], newHistory: HistoryPoint[]) => {
            setFinalPolys(newPolys);
            setHistory(newHistory);
            setStats(computeStats(newPolys));
        },
    }));

    // Draw mosaic
    useEffect(() => {
        const canvas = mosaicRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, rect.width, rect.height);
        drawMosaic(ctx, currentPolys, rect.width, rect.height, { showEdges, showFill, colorMode });
    }, [currentPolys, colorMode, showEdges, showFill]);

    // Draw sides histogram
    useEffect(() => {
        const canvas = sidesHistRef.current;
        if (!canvas || !currentStats) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, rect.width, rect.height);
        drawHistogram(ctx, currentStats.sidesHist, rect.width, rect.height, 'Sides per cell');
    }, [currentStats]);

    // Draw degree histogram
    useEffect(() => {
        const canvas = degreeHistRef.current;
        if (!canvas || !currentStats) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, rect.width, rect.height);
        drawHistogram(ctx, currentStats.degreeHist, rect.width, rect.height, 'Polygons per vertex');
    }, [currentStats]);

    // Draw phase space
    useEffect(() => {
        const canvas = phaseRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, rect.width, rect.height);
        drawPhaseSpace(ctx, visibleHistory, rect.width, rect.height);
    }, [visibleHistory]);

    // Draw history chart
    useEffect(() => {
        const canvas = historyRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, rect.width, rect.height);
        drawHistory(ctx, visibleHistory, rect.width, rect.height);
    }, [visibleHistory]);

    return (
        <div className="w-full h-full flex gap-1">
            {/* Main mosaic view */}
            <div className="w-[55%] h-full">
                <canvas ref={mosaicRef} className="w-full h-full" />
            </div>
            {/* Charts grid - 2x2 */}
            <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-1">
                <canvas ref={sidesHistRef} className="w-full h-full border border-lime-500/20" />
                <canvas ref={degreeHistRef} className="w-full h-full border border-lime-500/20" />
                <canvas ref={phaseRef} className="w-full h-full border border-lime-500/20" />
                <canvas ref={historyRef} className="w-full h-full border border-lime-500/20" />
            </div>
        </div>
    );
});

Viewer.displayName = 'Viewer';
export default Viewer;

function drawMosaic(
    ctx: CanvasRenderingContext2D,
    polys: Polygon[],
    w: number,
    h: number,
    options: { showEdges: boolean; showFill: boolean; colorMode: ColorMode }
) {
    // Keep square but maximize size
    const size = Math.min(w, h) * 0.98;
    const offsetX = (w - size) / 2;
    const offsetY = (h - size) / 2;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(size, size);

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 1, 1);

    for (let i = 0; i < polys.length; i++) {
        const poly = polys[i];
        if (poly.length < 3) continue;

        const sides = poly.length;
        const area = Math.abs(polygonArea(poly));
        let lightness = 40;
        let saturation = 70;

        if (options.colorMode === 'sides') {
            // Vary lightness based on sides: fewer sides = darker, more sides = lighter
            lightness = 25 + Math.min(sides - 3, 5) * 8;
            saturation = 60 + Math.min(sides - 3, 4) * 5;
        } else if (options.colorMode === 'area') {
            lightness = 20 + Math.min(1, Math.sqrt(area) * 4) * 35;
            saturation = 65;
        } else {
            lightness = 25 + (i % 7) * 6;
            saturation = 55 + (i % 5) * 5;
        }

        ctx.beginPath();
        ctx.moveTo(poly[0].x, poly[0].y);
        for (let j = 1; j < poly.length; j++) {
            ctx.lineTo(poly[j].x, poly[j].y);
        }
        ctx.closePath();

        if (options.showFill) {
            // All lime hue (82), varying lightness/saturation
            ctx.fillStyle = `hsla(82, ${saturation}%, ${lightness}%, 0.7)`;
            ctx.fill();
        }
        if (options.showEdges) {
            ctx.strokeStyle = 'rgba(132, 204, 22, 0.6)';
            ctx.lineWidth = 0.002;
            ctx.stroke();
        }
    }

    ctx.strokeStyle = 'rgba(132, 204, 22, 0.8)';
    ctx.lineWidth = 0.003;
    ctx.strokeRect(0, 0, 1, 1);

    ctx.restore();
}

function drawHistogram(
    ctx: CanvasRenderingContext2D,
    data: { k: string; count: number }[],
    w: number,
    h: number,
    title: string
) {
    const padding = { top: 30, right: 15, bottom: 30, left: 30 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    if (data.length === 0) {
        ctx.fillStyle = '#666';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('No data', w / 2, h / 2);
        return;
    }

    const maxCount = Math.max(...data.map(d => d.count));
    const barWidth = chartW / data.length * 0.8;
    const gap = chartW / data.length * 0.2;

    ctx.fillStyle = '#84cc16';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(title, w / 2, 18);

    data.forEach((d, i) => {
        const barH = (d.count / maxCount) * chartH;
        const x = padding.left + i * (barWidth + gap) + gap / 2;
        const y = padding.top + chartH - barH;

        ctx.fillStyle = 'rgba(132, 204, 22, 0.7)';
        ctx.fillRect(x, y, barWidth, barH);

        ctx.fillStyle = '#888';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(d.k, x + barWidth / 2, h - padding.bottom + 12);
    });

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, h - padding.bottom);
    ctx.lineTo(w - padding.right, h - padding.bottom);
    ctx.stroke();
}

function drawPhaseSpace(
    ctx: CanvasRenderingContext2D,
    history: HistoryPoint[],
    w: number,
    h: number
) {
    const padding = { top: 30, right: 15, bottom: 30, left: 35 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const xMin = 1, xMax = 7;
    const yMin = 2, yMax = 8;

    const toScreenX = (v: number) => padding.left + ((v - xMin) / (xMax - xMin)) * chartW;
    const toScreenY = (v: number) => padding.top + chartH - ((v - yMin) / (yMax - yMin)) * chartH;

    ctx.fillStyle = '#84cc16';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Phase space', w / 2, 18);

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, h - padding.bottom);
    ctx.lineTo(w - padding.right, h - padding.bottom);
    ctx.stroke();

    ctx.fillStyle = '#555';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('degree', w / 2, h - 5);
    ctx.save();
    ctx.translate(8, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('sides', 0, 0);
    ctx.restore();

    ATTRACTORS.forEach(a => {
        const x = toScreenX(a.avgDegree);
        const y = toScreenY(a.avgSides);
        ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    if (history.length > 0) {
        ctx.strokeStyle = 'rgba(132, 204, 22, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        history.forEach((pt, i) => {
            const x = toScreenX(pt.avgDegree);
            const y = toScreenY(pt.avgSides);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        const last = history[history.length - 1];
        const lx = toScreenX(last.avgDegree);
        const ly = toScreenY(last.avgSides);
        ctx.fillStyle = '#84cc16';
        ctx.beginPath();
        ctx.arc(lx, ly, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawHistory(
    ctx: CanvasRenderingContext2D,
    history: HistoryPoint[],
    w: number,
    h: number
) {
    const padding = { top: 30, right: 15, bottom: 30, left: 35 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    ctx.fillStyle = '#84cc16';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('History', w / 2, 18);

    if (history.length < 2) {
        ctx.fillStyle = '#555';
        ctx.font = '9px monospace';
        ctx.fillText('Increase storeEvery', w / 2, h / 2);
        return;
    }

    const xMax = Math.max(...history.map(h => h.step));
    const yMin = 2, yMax = 8;

    const toScreenX = (v: number) => padding.left + (v / xMax) * chartW;
    const toScreenY = (v: number) => padding.top + chartH - ((v - yMin) / (yMax - yMin)) * chartH;

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, h - padding.bottom);
    ctx.lineTo(w - padding.right, h - padding.bottom);
    ctx.stroke();

    // Reference lines
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = '#333';
    [4, 6].forEach(v => {
        const y = toScreenY(v);
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.stroke();
    });
    ctx.setLineDash([]);

    // Avg sides
    ctx.strokeStyle = '#84cc16';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    history.forEach((pt, i) => {
        const x = toScreenX(pt.step);
        const y = toScreenY(pt.avgSides);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Avg degree
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    history.forEach((pt, i) => {
        const x = toScreenX(pt.step);
        const y = toScreenY(pt.avgDegree);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Legend
    ctx.fillStyle = '#84cc16';
    ctx.fillRect(w - 55, 28, 8, 8);
    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(w - 55, 40, 8, 8);
    ctx.fillStyle = '#666';
    ctx.font = '8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('sides', w - 44, 35);
    ctx.fillText('deg', w - 44, 47);
}
