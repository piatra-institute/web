'use client';

import React, { useEffect, useRef, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';

import {
    Edge,
    NodeId,
    Point,
    Particle,
    ViewMode,
    FlowMode,
    clamp01,
    lerpPoint,
    randChoice,
    edgeHexColor,
    edgeDash,
    computeNodePositions,
    buildGroupEdges,
    getFlowEdges,
    BITMAP,
} from '../../logic';

export interface ViewerRef {
    clearParticles: () => void;
}

interface ViewerProps {
    edges: Edge[];
    viewMode: ViewMode;
    flowMode: FlowMode;
    selectedNode: NodeId;
    groupNode: NodeId;
    showUndirectedFlow: boolean;
    spawnRate: number;
    particleSpeed: number;
    maxParticles: number;
    running: boolean;
    labels: Record<NodeId, string>;
}

const LIME = '#84cc16';
const LIME_DIM = 'rgba(132, 204, 22, 0.3)';
const LIME_PARTICLE = 'rgba(190, 242, 100, 0.9)';
const NODE_RADIUS = 28;

const Viewer = forwardRef<ViewerRef, ViewerProps>(({
    edges,
    viewMode,
    flowMode,
    selectedNode,
    groupNode,
    showUndirectedFlow,
    spawnRate,
    particleSpeed,
    maxParticles,
    running,
    labels,
}, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sizeRef = useRef({ w: 760, h: 520 });
    const particlesRef = useRef<Particle[]>([]);
    const lastRef = useRef<number>(performance.now());
    const spawnAccRef = useRef<number>(0);
    const rafRef = useRef<number>(0);

    useImperativeHandle(ref, () => ({
        clearParticles: () => {
            particlesRef.current = [];
            spawnAccRef.current = 0;
        },
    }));

    // Compute group edges once
    const groupEdges = useMemo(() => buildGroupEdges(), []);

    // Enabled edges
    const enabledEdges = useMemo(() => edges.filter((e) => e.enabled), [edges]);

    // Flow edges
    const flowEdges = useMemo(
        () => getFlowEdges(enabledEdges, flowMode, selectedNode, showUndirectedFlow),
        [enabledEdges, flowMode, selectedNode, showUndirectedFlow],
    );

    // Resize observer
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver((entries) => {
            const cr = entries[0]?.contentRect;
            if (!cr) return;
            sizeRef.current = {
                w: Math.max(400, Math.floor(cr.width)),
                h: Math.max(350, Math.floor(cr.height)),
            };
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // Draw arrow helper
    const drawArrow = useCallback((ctx: CanvasRenderingContext2D, from: Point, to: Point, size: number) => {
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        ctx.beginPath();
        ctx.moveTo(to.x, to.y);
        ctx.lineTo(
            to.x - size * Math.cos(angle - Math.PI / 6),
            to.y - size * Math.sin(angle - Math.PI / 6),
        );
        ctx.lineTo(
            to.x - size * Math.cos(angle + Math.PI / 6),
            to.y - size * Math.sin(angle + Math.PI / 6),
        );
        ctx.closePath();
        ctx.fill();
    }, []);

    // Main animation loop
    useEffect(() => {
        const tick = () => {
            rafRef.current = requestAnimationFrame(tick);
            const canvas = canvasRef.current;
            if (!canvas) return;

            const { w, h } = sizeRef.current;
            const dpr = Math.min(2, window.devicePixelRatio || 1);

            // Resize canvas if needed
            const targetW = Math.floor(w * dpr);
            const targetH = Math.floor(h * dpr);
            if (canvas.width !== targetW || canvas.height !== targetH) {
                canvas.width = targetW;
                canvas.height = targetH;
                canvas.style.width = `${w}px`;
                canvas.style.height = `${h}px`;
            }

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, w, h);

            const nodePos = computeNodePositions(w, h);
            const tNow = performance.now();
            const dt = Math.max(0, Math.min(0.05, (tNow - lastRef.current) / 1000));
            lastRef.current = tNow;

            const activeEdges = viewMode === 'group' ? groupEdges : enabledEdges;

            // --- Draw edges ---
            for (const e of activeEdges) {
                const a = nodePos[e.from];
                const b = nodePos[e.to];
                const color = edgeHexColor(e.type);
                const dash = edgeDash(e.type);

                // Dim inactive edges in logic/fromSelection mode
                const isActive = viewMode === 'logic' && flowMode === 'fromSelection'
                    ? (e.directed
                        ? e.from === selectedNode
                        : e.from === selectedNode || e.to === selectedNode)
                    : true;

                ctx.save();
                ctx.globalAlpha = isActive ? 0.7 : 0.2;
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.5;
                ctx.setLineDash(dash);

                // Check if diagonal
                const isDiagonal =
                    (e.from === 'S1' && e.to === 'nS2') || (e.from === 'S2' && e.to === 'nS1') ||
                    (e.from === 'nS2' && e.to === 'S1') || (e.from === 'nS1' && e.to === 'S2');

                if (isDiagonal) {
                    const mx = (a.x + b.x) / 2;
                    const my = (a.y + b.y) / 2 - 15;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.quadraticCurveTo(mx, my, b.x, b.y);
                    ctx.stroke();
                } else {
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }

                // Arrow for directed edges
                if (e.directed) {
                    ctx.setLineDash([]);
                    ctx.fillStyle = color;
                    // Compute arrow tip offset from target node
                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    if (len > 0) {
                        const offset = NODE_RADIUS + 4;
                        const tipX = b.x - (dx / len) * offset;
                        const tipY = b.y - (dy / len) * offset;
                        drawArrow(ctx, a, { x: tipX, y: tipY }, 8);
                    }
                }

                ctx.restore();
            }

            // --- Draw edge labels ---
            ctx.save();
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(132, 204, 22, 0.4)';
            for (const e of activeEdges) {
                const a = nodePos[e.from];
                const b = nodePos[e.to];
                const mx = (a.x + b.x) / 2;
                const my = (a.y + b.y) / 2;

                // Position label with offset to avoid overlap
                let lx = mx;
                let ly = my;
                if (e.from === 'S1' && e.to === 'S2') ly -= 12;
                else if (e.from === 'nS1' && e.to === 'nS2') ly += 16;
                else if (e.from === 'S1' && e.to === 'nS1') lx -= 32;
                else if (e.from === 'S2' && e.to === 'nS2') lx += 32;
                else if (e.from === 'S1' && e.to === 'nS2') { lx += 20; ly -= 20; }
                else if (e.from === 'S2' && e.to === 'nS1') { lx -= 20; ly -= 20; }

                if (viewMode === 'logic') {
                    ctx.fillText(e.type.slice(0, 6), lx, ly);
                }
            }
            ctx.restore();

            // --- Spawn particles ---
            if (running) {
                spawnAccRef.current += dt * spawnRate;
                const spawnN = Math.floor(spawnAccRef.current);
                spawnAccRef.current -= spawnN;

                const candidates = viewMode === 'group' ? groupEdges : flowEdges;
                if (candidates.length > 0) {
                    for (let i = 0; i < spawnN; i++) {
                        if (particlesRef.current.length >= maxParticles) break;
                        const e = randChoice(candidates);
                        particlesRef.current.push({
                            id: `${tNow.toFixed(0)}-${Math.random().toString(16).slice(2)}`,
                            edgeId: e.id,
                            t: 0,
                            speed: particleSpeed * (0.75 + Math.random() * 0.65),
                        });
                    }
                }
            }

            // --- Advance & draw particles ---
            const edgeLookup: Record<string, Edge> = {};
            for (const e of (viewMode === 'group' ? groupEdges : enabledEdges)) {
                edgeLookup[e.id] = e;
            }

            const nextParticles: Particle[] = [];
            ctx.save();
            ctx.globalAlpha = 0.9;
            for (const p of particlesRef.current) {
                const e = edgeLookup[p.edgeId];
                if (!e) continue;

                // Cull stale particles
                if (viewMode === 'logic' && flowMode === 'fromSelection') {
                    const ok = e.directed
                        ? e.from === selectedNode
                        : e.from === selectedNode || e.to === selectedNode;
                    if (!ok) continue;
                }

                const t2 = running ? p.t + p.speed * dt : p.t;
                if (t2 < 1) {
                    nextParticles.push({ ...p, t: t2 });
                } else if (running && viewMode === 'logic' && flowMode === 'randomWalk') {
                    const at: NodeId = e.directed ? e.to : (Math.random() < 0.5 ? e.from : e.to);
                    const candidates = enabledEdges.filter((ee) => {
                        if (ee.directed) return ee.from === at;
                        return showUndirectedFlow && (ee.from === at || ee.to === at);
                    });
                    if (candidates.length > 0) {
                        nextParticles.push({
                            ...p,
                            edgeId: randChoice(candidates).id,
                            t: 0,
                        });
                    }
                }

                // Draw particle
                const a = nodePos[e.from];
                const b = nodePos[e.to];
                const pos = lerpPoint(a, b, clamp01(p.t));

                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = LIME_PARTICLE;
                ctx.fill();
            }
            particlesRef.current = nextParticles;
            ctx.restore();

            // --- Draw nodes ---
            const allNodes: NodeId[] = ['S1', 'S2', 'nS1', 'nS2'];
            for (const id of allNodes) {
                const p = nodePos[id];
                const isSelected = viewMode === 'logic' ? selectedNode === id : groupNode === id;

                // Circle
                ctx.beginPath();
                ctx.arc(p.x, p.y, NODE_RADIUS, 0, Math.PI * 2);
                ctx.fillStyle = isSelected ? LIME : '#0a0a0a';
                ctx.fill();
                ctx.strokeStyle = isSelected ? LIME : LIME_DIM;
                ctx.lineWidth = isSelected ? 2 : 1;
                ctx.stroke();

                // Label
                ctx.save();
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = isSelected ? '#000000' : LIME;
                ctx.fillText(labels[id], p.x, p.y);
                ctx.restore();
            }

            // --- Flow hint ---
            ctx.save();
            ctx.font = '10px monospace';
            ctx.fillStyle = 'rgba(132, 204, 22, 0.4)';
            ctx.textAlign = 'left';
            const hint = viewMode === 'logic'
                ? flowMode === 'fromSelection'
                    ? `particles from ${labels[selectedNode]}`
                    : flowMode === 'randomWalk'
                        ? 'random walk along directed edges'
                        : 'all directed edges'
                : 'group actions: a, b, ab';
            ctx.fillText(hint, 12, h - 12);
            ctx.restore();
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [
        edges, viewMode, flowMode, selectedNode, groupNode,
        showUndirectedFlow, spawnRate, particleSpeed, maxParticles,
        running, labels, enabledEdges, flowEdges, groupEdges, drawArrow,
    ]);

    // Reset particles on major config changes
    useEffect(() => {
        particlesRef.current = [];
        spawnAccRef.current = 0;
        lastRef.current = performance.now();
    }, [flowMode, selectedNode, viewMode]);

    return (
        <div
            ref={containerRef}
            className="w-[90vw] h-[90vh] max-w-[900px] max-h-[600px] outline-none [&_*]:outline-none"
        >
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ background: '#0a0a0a' }}
            />
        </div>
    );
});

Viewer.displayName = 'Viewer';
export default Viewer;
