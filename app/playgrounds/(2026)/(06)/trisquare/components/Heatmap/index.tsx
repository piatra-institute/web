'use client';

import React, { useEffect, useRef } from 'react';


interface HeatmapProps {
    grid: number[][];
    /** diverging colour scale around zero (curvature) vs sequential (Omega). */
    diverging: boolean;
    title: string;
    subtitle?: string;
}


function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

function rgb(r: number, g: number, b: number): string {
    return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}


/** sequential dark-to-lime for Omega. */
function sequentialColor(t: number): string {
    const c = Math.max(0, Math.min(1, t));
    return rgb(lerp(10, 163, c), lerp(10, 230, c), lerp(10, 53, c));
}

/** diverging orange (negative) to dark to lime (positive) for curvature. */
function divergingColor(t: number): string {
    // t in [-1, 1]
    const c = Math.max(-1, Math.min(1, t));
    if (c >= 0) {
        return rgb(lerp(10, 163, c), lerp(10, 230, c), lerp(10, 53, c));
    }
    const m = -c;
    return rgb(lerp(10, 249, m), lerp(10, 115, m), lerp(10, 22, m));
}


export default function Heatmap({ grid, diverging, title, subtitle }: HeatmapProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || grid.length === 0) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const n = grid.length;
        const size = canvas.width;
        const cell = size / n;

        let lo = Infinity;
        let hi = -Infinity;
        for (let j = 0; j < n; j++) {
            for (let i = 0; i < n; i++) {
                const v = grid[j][i];
                if (!Number.isFinite(v)) continue;
                if (v < lo) lo = v;
                if (v > hi) hi = v;
            }
        }
        const absMax = Math.max(Math.abs(lo), Math.abs(hi)) || 1;
        const range = hi - lo || 1;

        for (let j = 0; j < n; j++) {
            for (let i = 0; i < n; i++) {
                const v = grid[j][i];
                let color: string;
                if (diverging) {
                    color = divergingColor(Number.isFinite(v) ? v / absMax : 0);
                } else {
                    color = sequentialColor(Number.isFinite(v) ? (v - lo) / range : 0);
                }
                ctx.fillStyle = color;
                // flip vertically so +y points up
                ctx.fillRect(i * cell, (n - 1 - j) * cell, cell + 1, cell + 1);
            }
        }

        ctx.strokeStyle = 'rgba(132,204,22,.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, size, size);
    }, [grid, diverging]);

    return (
        <div className="space-y-2">
            <div className="flex items-baseline justify-between">
                <div className="text-[10px] uppercase tracking-wide text-lime-200/40">{title}</div>
                {subtitle && <div className="text-[10px] font-mono text-lime-200/50">{subtitle}</div>}
            </div>
            <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="w-full max-w-[300px] mx-auto border border-lime-500/20 bg-[#0a0a0a] [image-rendering:pixelated]"
            />
        </div>
    );
}
