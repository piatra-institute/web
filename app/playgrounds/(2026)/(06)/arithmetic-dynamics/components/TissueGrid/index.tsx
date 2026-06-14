'use client';

import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
} from 'react';

import {
    GRID_W,
    GRID_H,
    activation,
    energy,
    imprint as imprintField,
    lesion as lesionField,
    makeState,
    makeTemplates,
    randomize as randomizeField,
    recovery as recoveryOf,
    seedFromTemplate,
    stepField,
    templateIndex,
    type FieldState,
    type Metrics,
    type Params,
} from '../../logic';


export interface TissueGridHandle {
    seed: () => void;
    lesion: () => void;
    randomize: () => void;
    imprint: () => void;
    reset: () => void;
}

interface TissueGridProps {
    params: Params;
    onMetrics: (m: Metrics) => void;
}


const CELL = 16;
const CANVAS_W = GRID_W * CELL;
const CANVAS_H = GRID_H * CELL;

/** standard-normal sample via Box-Muller. */
function randn(): number {
    const u1 = Math.random() || 1e-9;
    const u2 = Math.random() || 1e-9;
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}


const TissueGrid = forwardRef<TissueGridHandle, TissueGridProps>(function TissueGrid(
    { params, onMetrics },
    ref,
) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stateRef = useRef<FieldState>(makeState());
    const patternsRef = useRef<Float32Array[]>(makeTemplates());
    const paramsRef = useRef<Params>(params);
    const frameRef = useRef<number | null>(null);
    const tickRef = useRef(0);

    paramsRef.current = params;

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const { u } = stateRef.current;
        const g = paramsRef.current.gain;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        for (let yy = 0; yy < GRID_H; yy++) {
            for (let xx = 0; xx < GRID_W; xx++) {
                const v = activation(u[yy * GRID_W + xx], g); // -1..1
                let r: number;
                let gr: number;
                let b: number;
                if (v >= 0) {
                    // black -> lime (#a3e635)
                    r = Math.round(163 * v);
                    gr = Math.round(230 * v);
                    b = Math.round(22 * v);
                } else {
                    // black -> orange (#f97316)
                    const m = -v;
                    r = Math.round(249 * m);
                    gr = Math.round(115 * m);
                    b = Math.round(22 * m);
                }
                ctx.fillStyle = `rgb(${r},${gr},${b})`;
                ctx.fillRect(xx * CELL, yy * CELL, CELL, CELL);
            }
        }
    }, []);

    const reportMetrics = useCallback(() => {
        const state = stateRef.current;
        const patterns = patternsRef.current;
        const p = paramsRef.current;
        const ov = patterns.map((pat) => {
            let s = 0;
            for (let i = 0; i < pat.length; i++) s += pat[i] * state.y[i];
            return Number(s.toFixed(4));
        });
        let dominant = 0;
        for (let k = 1; k < ov.length; k++) if (ov[k] > ov[dominant]) dominant = k;
        const k = templateIndex(p.template);
        onMetrics({
            overlaps: ov,
            dominant,
            recovery: Number(recoveryOf(state, patterns, k, p.gain).toFixed(4)),
            energy: Number(energy(state, patterns, p).toFixed(3)),
        });
    }, [onMetrics]);

    // animation loop
    useEffect(() => {
        const loop = () => {
            const p = paramsRef.current;
            if (p.running) {
                stepField(stateRef.current, patternsRef.current, p, randn);
            }
            render();
            tickRef.current += 1;
            if (tickRef.current % 5 === 0) reportMetrics();
            frameRef.current = requestAnimationFrame(loop);
        };
        frameRef.current = requestAnimationFrame(loop);
        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [render, reportMetrics]);

    useImperativeHandle(
        ref,
        () => ({
            seed: () => {
                const k = templateIndex(paramsRef.current.template);
                seedFromTemplate(stateRef.current, patternsRef.current[k]);
                render();
                reportMetrics();
            },
            lesion: () => {
                lesionField(stateRef.current);
                render();
                reportMetrics();
            },
            randomize: () => {
                randomizeField(stateRef.current, Math.random);
                render();
                reportMetrics();
            },
            imprint: () => {
                const k = templateIndex(paramsRef.current.template);
                // refresh y from current u at the active gain before imprinting.
                const { u, y } = stateRef.current;
                for (let i = 0; i < u.length; i++) y[i] = activation(u[i], paramsRef.current.gain);
                imprintField(stateRef.current, patternsRef.current, k);
                reportMetrics();
            },
            reset: () => {
                patternsRef.current = makeTemplates();
                const k = templateIndex(paramsRef.current.template);
                seedFromTemplate(stateRef.current, patternsRef.current[k]);
                render();
                reportMetrics();
            },
        }),
        [render, reportMetrics],
    );

    // seed the initial template on mount.
    useEffect(() => {
        const k = templateIndex(paramsRef.current.template);
        seedFromTemplate(stateRef.current, patternsRef.current[k]);
        render();
        reportMetrics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="w-full max-w-[760px] border border-lime-500/30 outline-none [image-rendering:pixelated]"
            style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
        />
    );
});

export default TissueGrid;
