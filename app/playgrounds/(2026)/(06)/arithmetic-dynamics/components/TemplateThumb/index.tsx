'use client';

import React, { useEffect, useRef } from 'react';

import { GRID_W, GRID_H } from '../../logic';


interface TemplateThumbProps {
    pattern: Float32Array;
    className?: string;
}

const CELL = 6;


/** static heatmap of one stored morphology, drawn with the diverging lime/orange map. */
export default function TemplateThumb({ pattern, className = '' }: TemplateThumbProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let max = 1e-6;
        for (let i = 0; i < pattern.length; i++) max = Math.max(max, Math.abs(pattern[i]));
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, GRID_W * CELL, GRID_H * CELL);
        for (let yy = 0; yy < GRID_H; yy++) {
            for (let xx = 0; xx < GRID_W; xx++) {
                const v = pattern[yy * GRID_W + xx] / max; // -1..1
                let r: number;
                let g: number;
                let b: number;
                if (v >= 0) {
                    r = Math.round(163 * v);
                    g = Math.round(230 * v);
                    b = Math.round(22 * v);
                } else {
                    const m = -v;
                    r = Math.round(249 * m);
                    g = Math.round(115 * m);
                    b = Math.round(22 * m);
                }
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(xx * CELL, yy * CELL, CELL, CELL);
            }
        }
    }, [pattern]);

    return (
        <canvas
            ref={canvasRef}
            width={GRID_W * CELL}
            height={GRID_H * CELL}
            className={`w-full border border-lime-500/20 [image-rendering:pixelated] ${className}`}
        />
    );
}
