'use client';

import React, { useEffect, useRef } from 'react';

import { LATTICE_SIZE, NUM_PATCHES, PATCH_WIDTH } from '../../logic';


interface LatticeCanvasProps {
    fieldRef: React.MutableRefObject<Float32Array>;
    activeFraction: number;
    showPatches?: boolean;
}

export default function LatticeCanvas({ fieldRef, activeFraction, showPatches = true }: LatticeCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const draw = () => {
            const u = fieldRef.current;
            const W = canvas.width;
            const H = canvas.height;
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(0, 0, W, H);

            const cellW = W / LATTICE_SIZE;
            const mid = H / 2;
            const scale = mid * 0.85;

            // Patch overlay
            if (showPatches) {
                for (let p = 0; p < NUM_PATCHES; p++) {
                    const x = p * PATCH_WIDTH * cellW;
                    ctx.fillStyle = p % 2 === 0 ? 'rgba(132, 204, 22, 0.04)' : 'rgba(132, 204, 22, 0.02)';
                    ctx.fillRect(x, 0, PATCH_WIDTH * cellW, H);
                }
                ctx.strokeStyle = 'rgba(132, 204, 22, 0.10)';
                ctx.lineWidth = 1;
                for (let p = 0; p <= NUM_PATCHES; p++) {
                    const x = p * PATCH_WIDTH * cellW;
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, H);
                    ctx.stroke();
                }
            }

            // Zero baseline
            ctx.strokeStyle = 'rgba(163, 230, 53, 0.18)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, mid);
            ctx.lineTo(W, mid);
            ctx.stroke();

            // Bars
            for (let i = 0; i < LATTICE_SIZE; i++) {
                const v = u[i];
                const h = v * scale;
                const x = i * cellW;
                const top = mid - h;
                ctx.fillStyle = `rgba(132, 204, 22, ${0.22 + Math.min(0.78, Math.abs(v))})`;
                ctx.fillRect(x + 0.5, Math.min(mid, top), cellW - 1, Math.abs(h));
            }

            // Field profile curve
            ctx.strokeStyle = '#a3e635';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            for (let i = 0; i < LATTICE_SIZE; i++) {
                const x = i * cellW + cellW / 2;
                const y = mid - u[i] * scale;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Active-fraction badge
            ctx.fillStyle = '#a3e635';
            ctx.font = '10px monospace';
            ctx.fillText(`active: ${(activeFraction * 100).toFixed(0)}%`, 8, 14);

            rafRef.current = requestAnimationFrame(draw);
        };
        rafRef.current = requestAnimationFrame(draw);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [fieldRef, showPatches, activeFraction]);

    return (
        <div className="border border-lime-500/30 bg-[#0a0a0a]">
            <canvas
                ref={canvasRef}
                width={760}
                height={260}
                className="w-full block"
                style={{ imageRendering: 'pixelated' }}
            />
        </div>
    );
}
