'use client';

import {
    useEffect,
    useImperativeHandle,
    useRef,
    forwardRef,
    useState,
} from 'react';

import { FluidSimulation } from '../../webgpu/FluidSimulation';
import { FluidRenderer } from '../../webgpu/FluidRenderer';
import { MetricsComputer } from '../../webgpu/MetricsComputer';
import {
    renderUniformsValues,
    renderUniformsViews,
    PARTICLE_RADIUS,
    numParticlesMax,
    particleStructSize,
} from '../../webgpu/common';

import type { SimulationMetrics, SimulationParams } from '../../types';



export interface ViewerRef {
    reset: () => void;
    stirOnce: () => void;
    addCream: () => void;
}

interface ViewerProps {
    params: SimulationParams;
    onMetricsUpdate?: (metrics: SimulationMetrics) => void;
}

interface GPUState {
    device: GPUDevice;
    context: GPUCanvasContext;
    format: GPUTextureFormat;
    simulation: FluidSimulation;
    renderer: FluidRenderer;
    metrics: MetricsComputer;
    renderUniformBuffer: GPUBuffer;
    posvelBuffer: GPUBuffer;
    animationId: number | null;
    lastTime: number;
    frameCount: number;
    camera: {
        distance: number;
        theta: number;
        phi: number;
    };
}

const METRICS_INTERVAL = 20;
const MAX_DPR = 2;

const Viewer = forwardRef<ViewerRef, ViewerProps>(({ params, onMetricsUpdate }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stateRef = useRef<GPUState | null>(null);
    const paramsRef = useRef<SimulationParams>(params);
    const metricsCallbackRef = useRef(onMetricsUpdate);
    const [error, setError] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
        reset: () => stateRef.current?.simulation.reset(),
        stirOnce: () => stateRef.current?.simulation.stirOnce(),
        addCream: () => stateRef.current?.simulation.addCreamBurst(1200),
    }));

    useEffect(() => {
        paramsRef.current = params;
        metricsCallbackRef.current = onMetricsUpdate;

        const sim = stateRef.current?.simulation;
        if (!sim) return;

        sim.setStirring(params.isStirring);
        sim.setStirStrength(params.stirStrength);
        sim.setViscosity(params.viscosity);
        sim.setDiffusion(params.diffusion);
        sim.setBuoyancy(params.buoyancy);
        sim.setPourRate(params.pourRate);
    }, [params, onMetricsUpdate]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let destroyed = false;
        let resizeObserver: ResizeObserver | null = null;
        let resizeHandler: (() => void) | null = null;

        const init = async () => {
            if (!navigator.gpu) {
                setError('WebGPU is not supported in this browser.');
                return;
            }

            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) {
                setError('Unable to acquire a WebGPU adapter.');
                return;
            }

            const device = await adapter.requestDevice();
            const context = canvas.getContext('webgpu');
            if (!context) {
                setError('Unable to initialize WebGPU context.');
                return;
            }

            const format = navigator.gpu.getPreferredCanvasFormat();

            const configure = () => {
                const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
                const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
                const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));

                if (canvas.width !== width || canvas.height !== height) {
                    canvas.width = width;
                    canvas.height = height;
                }

                context.configure({
                    device,
                    format,
                    alphaMode: 'premultiplied',
                });
            };

            configure();

            const particleBuffer = device.createBuffer({
                label: 'particle buffer',
                size: numParticlesMax * particleStructSize,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
            });

            const posvelBuffer = device.createBuffer({
                label: 'posvel buffer',
                size: numParticlesMax * particleStructSize,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            });

            const renderUniformBuffer = device.createBuffer({
                label: 'render uniform buffer',
                size: renderUniformsValues.byteLength,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            });

            const simulation = new FluidSimulation(device, particleBuffer, posvelBuffer);
            simulation.initParticles();
            const initialParams = paramsRef.current;
            simulation.setStirring(initialParams.isStirring);
            simulation.setStirStrength(initialParams.stirStrength);
            simulation.setViscosity(initialParams.viscosity);
            simulation.setDiffusion(initialParams.diffusion);
            simulation.setBuoyancy(initialParams.buoyancy);
            simulation.setPourRate(initialParams.pourRate);

            let renderer = new FluidRenderer(device, canvas, format, posvelBuffer, renderUniformBuffer);
            const metrics = new MetricsComputer(device, particleBuffer);

            const camera = {
                distance: 6.2,
                theta: Math.PI / 4,
                phi: Math.PI / 7,
            };

            const state: GPUState = {
                device,
                context,
                format,
                simulation,
                renderer,
                metrics,
                renderUniformBuffer,
                posvelBuffer,
                animationId: null,
                lastTime: performance.now(),
                frameCount: 0,
                camera,
            };

            stateRef.current = state;

            const resize = () => {
                configure();
                renderer = new FluidRenderer(device, canvas, format, posvelBuffer, renderUniformBuffer);
                state.renderer = renderer;
            };

            if (typeof ResizeObserver !== 'undefined') {
                resizeObserver = new ResizeObserver(() => resize());
                resizeObserver.observe(canvas);
            } else {
                resizeHandler = resize;
                window.addEventListener('resize', resizeHandler);
            }

            const frame = () => {
                if (destroyed || !stateRef.current) return;
                const currentParams = paramsRef.current;

                const now = performance.now();
                const rawDt = Math.min((now - state.lastTime) / 1000, 0.05);
                state.lastTime = now;

                const dt = rawDt * currentParams.speed;

                const encoder = device.createCommandEncoder();

                if (!currentParams.isPaused) {
                    state.simulation.execute(encoder, dt);
                }

                // Update camera matrices + render uniforms
                const cam = state.camera;
                const cx = cam.distance * Math.sin(cam.theta) * Math.cos(cam.phi);
                const cy = cam.distance * Math.sin(cam.phi);
                const cz = cam.distance * Math.cos(cam.theta) * Math.cos(cam.phi);

                const eye = [cx, cy, cz];
                const target = [0, 0, 0];
                const up = [0, 1, 0];

                const zAxis = normalize(sub(eye, target));
                const xAxis = normalize(cross(up, zAxis));
                const yAxis = cross(zAxis, xAxis);

                const view = new Float32Array([
                    xAxis[0], yAxis[0], zAxis[0], 0,
                    xAxis[1], yAxis[1], zAxis[1], 0,
                    xAxis[2], yAxis[2], zAxis[2], 0,
                    -dot(xAxis, eye), -dot(yAxis, eye), -dot(zAxis, eye), 1,
                ]);

                const aspect = canvas.width / canvas.height;
                const fov = Math.PI / 4;
                const near = 0.1;
                const far = 100;
                const f = 1 / Math.tan(fov / 2);
                const proj = new Float32Array([
                    f / aspect, 0, 0, 0,
                    0, f, 0, 0,
                    0, 0, (far + near) / (near - far), -1,
                    0, 0, (2 * far * near) / (near - far), 0,
                ]);

                const invView = invertMat4(view);
                const invProj = invertMat4(proj);

                renderUniformsViews.texel_size[0] = 1 / canvas.width;
                renderUniformsViews.texel_size[1] = 1 / canvas.height;
                renderUniformsViews.sphere_size[0] = PARTICLE_RADIUS;
                renderUniformsViews.inv_projection_matrix.set(invProj);
                renderUniformsViews.projection_matrix.set(proj);
                renderUniformsViews.view_matrix.set(view);
                renderUniformsViews.inv_view_matrix.set(invView);
                renderUniformsViews.time[0] = state.simulation.time;
                renderUniformsViews.stir_strength[0] = currentParams.stirStrength;

                device.queue.writeBuffer(renderUniformBuffer, 0, renderUniformsValues);

                const shouldReadMetrics = state.frameCount % METRICS_INTERVAL === 0;
                if (shouldReadMetrics && !currentParams.isPaused) {
                    state.metrics.encode(encoder, state.simulation.numParticles);
                }

                state.renderer.execute(state.context, encoder, state.simulation.numParticles);
                device.queue.submit([encoder.finish()]);

                if (shouldReadMetrics && !currentParams.isPaused) {
                    device.queue.onSubmittedWorkDone().then(async () => {
                        const sample = await state.metrics.readMetrics();
                        const callback = metricsCallbackRef.current;
                        if (sample && callback) {
                            callback({
                                entropy: sample.entropy,
                                mixedness: sample.mixedness,
                                complexity: sample.complexity,
                                kinetic: sample.kinetic,
                            });
                        }
                    }).catch(() => undefined);
                }

                state.frameCount += 1;
                state.animationId = requestAnimationFrame(frame);
            };

            frame();

            // Pointer controls
            let dragging = false;
            let lastX = 0;
            let lastY = 0;
            let activePointer: number | null = null;

            const onPointerDown = (event: PointerEvent) => {
                dragging = true;
                activePointer = event.pointerId;
                lastX = event.clientX;
                lastY = event.clientY;
                canvas.setPointerCapture(event.pointerId);
            };

            const onPointerMove = (event: PointerEvent) => {
                if (!dragging || event.pointerId !== activePointer) return;
                const dx = event.clientX - lastX;
                const dy = event.clientY - lastY;
                lastX = event.clientX;
                lastY = event.clientY;

                state.camera.theta -= dx * 0.008;
                state.camera.phi = Math.max(-1.2, Math.min(1.2, state.camera.phi + dy * 0.008));
            };

            const onPointerUp = (event: PointerEvent) => {
                if (event.pointerId !== activePointer) return;
                dragging = false;
                activePointer = null;
                canvas.releasePointerCapture(event.pointerId);
            };

            const onWheel = (event: WheelEvent) => {
                event.preventDefault();
                state.camera.distance = Math.max(3.0, Math.min(10, state.camera.distance + event.deltaY * 0.01));
            };

            canvas.addEventListener('pointerdown', onPointerDown);
            canvas.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);
            canvas.addEventListener('wheel', onWheel, { passive: false });

            return () => {
                canvas.removeEventListener('pointerdown', onPointerDown);
                canvas.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('pointerup', onPointerUp);
                canvas.removeEventListener('wheel', onWheel);
            };
        };

        let cleanupListeners: (() => void) | undefined;

        init().then((listenersCleanup) => {
            cleanupListeners = listenersCleanup;
        }).catch((err) => {
            console.error(err);
            setError(err instanceof Error ? err.message : 'WebGPU initialization failed.');
        });

        return () => {
            destroyed = true;
            cleanupListeners?.();
            if (resizeObserver) {
                resizeObserver.disconnect();
            } else if (resizeHandler) {
                window.removeEventListener('resize', resizeHandler);
            }
            if (stateRef.current?.animationId) {
                cancelAnimationFrame(stateRef.current.animationId);
            }
            stateRef.current = null;
        };
    }, []);

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-black text-lime-100 p-6">
                <div className="text-center max-w-md">
                    <h2 className="text-xl mb-3">WebGPU not available</h2>
                    <p className="text-sm text-lime-200/70">{error}</p>
                    <p className="text-xs text-lime-200/50 mt-3">
                        Try Chrome, Edge, or Safari Technology Preview with WebGPU enabled.
                    </p>
                </div>
            </div>
        );
    }

    return <canvas ref={canvasRef} className="w-full h-full" style={{ cursor: 'grab' }} />;
});

Viewer.displayName = 'Viewer';

export default Viewer;

// Math helpers
function sub(a: number[], b: number[]): number[] {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a: number[], b: number[]): number[] {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ];
}

function dot(a: number[], b: number[]): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function normalize(v: number[]): number[] {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    if (len === 0) return [0, 0, 0];
    return [v[0] / len, v[1] / len, v[2] / len];
}

function invertMat4(m: Float32Array): Float32Array {
    const inv = new Float32Array(16);
    inv[0] = m[5] * m[10] * m[15] -
        m[5] * m[11] * m[14] -
        m[9] * m[6] * m[15] +
        m[9] * m[7] * m[14] +
        m[13] * m[6] * m[11] -
        m[13] * m[7] * m[10];

    inv[4] = -m[4] * m[10] * m[15] +
        m[4] * m[11] * m[14] +
        m[8] * m[6] * m[15] -
        m[8] * m[7] * m[14] -
        m[12] * m[6] * m[11] +
        m[12] * m[7] * m[10];

    inv[8] = m[4] * m[9] * m[15] -
        m[4] * m[11] * m[13] -
        m[8] * m[5] * m[15] +
        m[8] * m[7] * m[13] +
        m[12] * m[5] * m[11] -
        m[12] * m[7] * m[9];

    inv[12] = -m[4] * m[9] * m[14] +
        m[4] * m[10] * m[13] +
        m[8] * m[5] * m[14] -
        m[8] * m[6] * m[13] -
        m[12] * m[5] * m[10] +
        m[12] * m[6] * m[9];

    inv[1] = -m[1] * m[10] * m[15] +
        m[1] * m[11] * m[14] +
        m[9] * m[2] * m[15] -
        m[9] * m[3] * m[14] -
        m[13] * m[2] * m[11] +
        m[13] * m[3] * m[10];

    inv[5] = m[0] * m[10] * m[15] -
        m[0] * m[11] * m[14] -
        m[8] * m[2] * m[15] +
        m[8] * m[3] * m[14] +
        m[12] * m[2] * m[11] -
        m[12] * m[3] * m[10];

    inv[9] = -m[0] * m[9] * m[15] +
        m[0] * m[11] * m[13] +
        m[8] * m[1] * m[15] -
        m[8] * m[3] * m[13] -
        m[12] * m[1] * m[11] +
        m[12] * m[3] * m[9];

    inv[13] = m[0] * m[9] * m[14] -
        m[0] * m[10] * m[13] -
        m[8] * m[1] * m[14] +
        m[8] * m[2] * m[13] +
        m[12] * m[1] * m[10] -
        m[12] * m[2] * m[9];

    inv[2] = m[1] * m[6] * m[15] -
        m[1] * m[7] * m[14] -
        m[5] * m[2] * m[15] +
        m[5] * m[3] * m[14] +
        m[13] * m[2] * m[7] -
        m[13] * m[3] * m[6];

    inv[6] = -m[0] * m[6] * m[15] +
        m[0] * m[7] * m[14] +
        m[4] * m[2] * m[15] -
        m[4] * m[3] * m[14] -
        m[12] * m[2] * m[7] +
        m[12] * m[3] * m[6];

    inv[10] = m[0] * m[5] * m[15] -
        m[0] * m[7] * m[13] -
        m[4] * m[1] * m[15] +
        m[4] * m[3] * m[13] +
        m[12] * m[1] * m[7] -
        m[12] * m[3] * m[5];

    inv[14] = -m[0] * m[5] * m[14] +
        m[0] * m[6] * m[13] +
        m[4] * m[1] * m[14] -
        m[4] * m[2] * m[13] -
        m[12] * m[1] * m[6] +
        m[12] * m[2] * m[5];

    inv[3] = -m[1] * m[6] * m[11] +
        m[1] * m[7] * m[10] +
        m[5] * m[2] * m[11] -
        m[5] * m[3] * m[10] -
        m[9] * m[2] * m[7] +
        m[9] * m[3] * m[6];

    inv[7] = m[0] * m[6] * m[11] -
        m[0] * m[7] * m[10] -
        m[4] * m[2] * m[11] +
        m[4] * m[3] * m[10] +
        m[8] * m[2] * m[7] -
        m[8] * m[3] * m[6];

    inv[11] = -m[0] * m[5] * m[11] +
        m[0] * m[7] * m[9] +
        m[4] * m[1] * m[11] -
        m[4] * m[3] * m[9] -
        m[8] * m[1] * m[7] +
        m[8] * m[3] * m[5];

    inv[15] = m[0] * m[5] * m[10] -
        m[0] * m[6] * m[9] -
        m[4] * m[1] * m[10] +
        m[4] * m[2] * m[9] +
        m[8] * m[1] * m[6] -
        m[8] * m[2] * m[5];

    let det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];
    if (det === 0) return inv;

    det = 1.0 / det;
    for (let i = 0; i < 16; i++) {
        inv[i] *= det;
    }
    return inv;
}
