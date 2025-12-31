'use client';

import { forwardRef, useImperativeHandle, useState, useRef, useEffect } from 'react';
import { ViewerRef, SimulationParams } from '../../playground';
import {
    buildMask,
    buildChladniMode,
    computeAmplitude,
    seededNoise,
    stepSand,
    clamp01,
} from '../../logic';

const DEFAULT_PARAMS: SimulationParams = {
    shape: 'square',
    ringInner: 0.4,
    resolution: 400,
    running: true,
    m1: 3,
    n1: 2,
    a1: 1.0,
    symmetric1: false,
    m2: 5,
    n2: 3,
    a2: 0.6,
    symmetric2: true,
    useSecondMode: true,
    sandRate: 0.35,
    sandDiff: 0.02,
    showSand: true,
    nodeThreshold: 0.06,
    showNodes: true,
    invert: false,
    contrast: 1.4,
};

const Viewer = forwardRef<ViewerRef>((_, ref) => {
    const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);

    const stateRef = useRef<{
        mask: Uint8Array | null;
        mode1: Float32Array | null;
        mode2: Float32Array | null;
        amp: Float32Array | null;
        sand: Float32Array | null;
        sandTmp: Float32Array | null;
        lap: Float32Array | null;
        img: ImageData | null;
    }>({
        mask: null,
        mode1: null,
        mode2: null,
        amp: null,
        sand: null,
        sandTmp: null,
        lap: null,
        img: null,
    });

    const w = params.resolution;
    const h = params.resolution;

    // Initialize simulation state
    const initState = () => {
        const state = stateRef.current;
        state.mask = buildMask(w, h, params.shape, params.ringInner);
        state.mode1 = buildChladniMode(w, h, params.m1, params.n1, state.mask, params.symmetric1);
        state.mode2 = params.useSecondMode
            ? buildChladniMode(w, h, params.m2, params.n2, state.mask, params.symmetric2)
            : null;
        state.amp = new Float32Array(w * h);
        state.sand = seededNoise(w, h, 777);
        state.sandTmp = new Float32Array(w * h);
        state.lap = new Float32Array(w * h);
        state.img = null;

        // Compute initial amplitude
        computeAmplitude(state.amp, state.mode1, state.mode2, state.mask, params.a1, params.a2);
    };

    // Rebuild modes when mode params change
    useEffect(() => {
        const state = stateRef.current;
        if (state.mask) {
            state.mode1 = buildChladniMode(w, h, params.m1, params.n1, state.mask, params.symmetric1);
            state.mode2 = params.useSecondMode
                ? buildChladniMode(w, h, params.m2, params.n2, state.mask, params.symmetric2)
                : null;
            if (state.amp) {
                computeAmplitude(state.amp, state.mode1, state.mode2, state.mask, params.a1, params.a2);
            }
        }
    }, [w, h, params.m1, params.n1, params.m2, params.n2, params.symmetric1, params.symmetric2, params.useSecondMode, params.a1, params.a2]);

    useImperativeHandle(ref, () => ({
        updateSimulation: (newParams: SimulationParams) => {
            setParams(newParams);
        },
        reset: () => {
            initState();
        },
    }));

    // Initialize on mount and when resolution/shape changes
    useEffect(() => {
        initState();
    }, [w, h, params.shape, params.ringInner]);

    // Render function
    const render = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        const state = stateRef.current;
        if (!state.mask || !state.amp || !state.sand) return;

        if (!state.img || state.img.width !== w || state.img.height !== h) {
            state.img = ctx.createImageData(w, h);
        }

        const data = state.img.data;
        const { invert, contrast, nodeThreshold, showNodes, showSand } = params;

        for (let i = 0; i < w * h; i++) {
            const inside = state.mask[i];
            if (!inside) {
                const j = i * 4;
                data[j] = data[j + 1] = data[j + 2] = 0;
                data[j + 3] = 255;
                continue;
            }

            let val = state.amp[i];
            const sandHere = showSand ? state.sand[i] : 0;
            const isNode = showNodes && val < nodeThreshold;

            // Tone mapping
            val = clamp01(val);
            val = clamp01(0.5 + (val - 0.5) * contrast);
            if (invert) val = 1 - val;

            let g = Math.floor(val * 255);

            // Sand darkening
            if (showSand) {
                const s = clamp01((sandHere - 0.6) / 1.4);
                g = Math.floor(g * (1 - 0.7 * s));
            }

            // Node highlighting
            if (isNode) {
                g = Math.min(g, 30);
            }

            const j = i * 4;
            data[j] = g;
            data[j + 1] = g;
            data[j + 2] = g;
            data[j + 3] = 255;
        }

        ctx.putImageData(state.img, 0, 0);
    };

    // Animation loop
    const tick = () => {
        rafRef.current = requestAnimationFrame(tick);

        const state = stateRef.current;
        if (!state.mask || !state.amp || !state.sand || !state.sandTmp || !state.lap) return;

        if (params.running && params.showSand) {
            stepSand(
                state.sand,
                state.sandTmp,
                state.amp,
                state.lap,
                state.mask,
                w,
                h,
                params.sandRate,
                params.sandDiff
            );
        }

        render();
    };

    // Start animation loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = w;
        canvas.height = h;

        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [params]);

    return (
        <div ref={containerRef} className="w-full h-full flex flex-col bg-black">
            {/* Status bar */}
            <div className="flex items-center justify-center gap-4 py-3 text-xs border-b border-lime-500/20">
                <span className="text-lime-400 font-medium">{params.shape}</span>
                <span className="text-gray-600">|</span>
                <span className="text-gray-400">
                    mode ({params.m1},{params.n1})
                    {params.symmetric1 ? '+' : '−'}
                </span>
                {params.useSecondMode && (
                    <>
                        <span className="text-gray-500">+</span>
                        <span className="text-gray-400">
                            ({params.m2},{params.n2})
                            {params.symmetric2 ? '+' : '−'}
                        </span>
                    </>
                )}
                <span className="text-gray-600">|</span>
                <span className="text-gray-500">
                    {params.running ? 'running' : 'paused'}
                </span>
            </div>

            {/* Canvas container - fill remaining space */}
            <div className="flex-1 flex items-center justify-center p-4">
                <canvas
                    ref={canvasRef}
                    className="max-w-full max-h-full"
                    style={{
                        width: 'min(100%, 100vh - 200px)',
                        height: 'min(100%, 100vh - 200px)',
                        aspectRatio: '1 / 1',
                        imageRendering: 'pixelated',
                    }}
                />
            </div>
        </div>
    );
});

Viewer.displayName = 'Viewer';

export default Viewer;
