'use client';

import React, { useEffect, useRef } from 'react';


interface SemanticMapProps {
    polarity: number;
    collapse: boolean;
    labelA: string;
    labelB: string;
}


function drawAttractor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    tag: string,
    title: string,
    color: string,
) {
    const grad = ctx.createRadialGradient(x, y, 8, x, y, 86);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, 86, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0a0a0a';
    ctx.font = 'bold 16px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tag, x, y + 1);
    ctx.textBaseline = 'alphabetic';

    ctx.fillStyle = 'rgba(217,249,157,.85)';
    ctx.font = '13px ui-monospace, monospace';
    ctx.fillText(title, x, y + 52);
}


export default function SemanticMap({ polarity, collapse, labelA, labelB }: SemanticMapProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, W, H);

        ctx.strokeStyle = 'rgba(132,204,22,.08)';
        ctx.lineWidth = 1;
        for (let x = 60; x < W; x += 60) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
            ctx.stroke();
        }
        for (let y = 60; y < H; y += 60) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }

        const colorA = 'rgba(163,230,53,.9)';
        const colorB = 'rgba(245,158,11,.9)';

        const left = { x: collapse ? W / 2 - 24 : 150, y: H / 2 };
        const right = { x: collapse ? W / 2 + 24 : W - 150, y: H / 2 };
        const pointX = collapse ? W / 2 : ((polarity + 100) / 200) * (right.x - left.x) + left.x;
        const pointY = H / 2 + Math.sin(polarity / 22) * 26;

        drawAttractor(ctx, left.x, left.y, 'A', labelA, colorA);
        drawAttractor(ctx, right.x, right.y, 'B', labelB, colorB);

        ctx.strokeStyle = 'rgba(132,204,22,.22)';
        ctx.setLineDash([7, 8]);
        ctx.beginPath();
        ctx.moveTo(left.x, left.y);
        ctx.lineTo(right.x, right.y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = collapse ? '#f97316' : '#d9f99d';
        ctx.beginPath();
        ctx.arc(pointX, pointY, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0a0a0a';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = 'rgba(217,249,157,.85)';
        ctx.font = '13px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
            collapse ? 'context erased' : `context point: ${Math.round(polarity)}`,
            pointX,
            pointY + 34,
        );

        if (collapse) {
            ctx.fillStyle = 'rgba(249,115,22,.95)';
            ctx.font = 'bold 16px ui-monospace, monospace';
            ctx.fillText('collapsed dictionary entry', W / 2, 34);
            ctx.fillStyle = 'rgba(217,249,157,.6)';
            ctx.font = '13px ui-monospace, monospace';
            ctx.fillText('both attractors forced into one semantic slot', W / 2, 56);
        } else {
            ctx.fillStyle = 'rgba(163,230,53,.95)';
            ctx.font = 'bold 16px ui-monospace, monospace';
            ctx.fillText('indexed semantics', W / 2, 34);
            ctx.fillStyle = 'rgba(217,249,157,.6)';
            ctx.font = '13px ui-monospace, monospace';
            ctx.fillText('context selects a basin of attraction', W / 2, 56);
        }
    }, [polarity, collapse, labelA, labelB]);

    return (
        <canvas
            ref={canvasRef}
            width={900}
            height={300}
            className="w-full border border-lime-500/20 bg-[#0a0a0a]"
        />
    );
}
