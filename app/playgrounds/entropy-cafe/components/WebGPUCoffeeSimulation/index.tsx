'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { CoffeeCupFluidSimulation } from '../../logic/CoffeeCupFluidSimulation';

// Global lock to prevent multiple WebGPU instances
let globalWebGPULock = false;
let globalSimulation: CoffeeCupFluidSimulation | null = null;

interface WebGPUCoffeeSimulationProps {
    onMetricsUpdate?: (entropy: number, complexity: number) => void;
}

export interface CoffeeSimulationRef {
    addCream: () => void;
    reset: () => void;
    setPaused: (paused: boolean) => void;
    setStirring: (stirring: boolean) => void;
    setSpeed: (speed: number) => void;
}

const WebGPUCoffeeSimulation = forwardRef<CoffeeSimulationRef, WebGPUCoffeeSimulationProps>(
    ({ onMetricsUpdate }, ref) => {
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const simulationRef = useRef<CoffeeCupFluidSimulation | null>(null);
        const animationIdRef = useRef<number | null>(null);
        const initializingRef = useRef<boolean>(false);
        const instanceIdRef = useRef<number>(Date.now());
        const [isWebGPUSupported, setIsWebGPUSupported] = useState(true);
        const [isInitialized, setIsInitialized] = useState(false);

        console.log('WebGPUCoffeeSimulation component rendering, instance:', instanceIdRef.current);

        useImperativeHandle(ref, () => ({
            addCream: async () => {
                await simulationRef.current?.addCream();
            },
            reset: () => {
                simulationRef.current?.reset();
            },
            setPaused: (paused: boolean) => {
                simulationRef.current?.setPaused(paused);
            },
            setStirring: (stirring: boolean) => {
                simulationRef.current?.setStirring(stirring);
            },
            setSpeed: (speed: number) => {
                simulationRef.current?.setSpeed(speed);
            },
        }));

        useEffect(() => {
            console.log('WebGPUCoffeeSimulation useEffect running, instance:', instanceIdRef.current);
            const canvas = canvasRef.current;
            if (!canvas) {
                console.error('Canvas ref is null');
                return;
            }
            console.log('Canvas found:', canvas);

            const initWebGPU = async () => {
                console.log('initWebGPU called');

                // Prevent multiple simultaneous initializations
                if (globalWebGPULock || globalSimulation) {
                    console.log('Global WebGPU lock active or simulation exists, skipping');
                    if (globalSimulation) {
                        simulationRef.current = globalSimulation;
                        setIsInitialized(true);

                        // Animation loop for existing simulation
                        console.log('Reusing existing simulation');
                        const animate = () => {
                            if (simulationRef.current === globalSimulation && globalSimulation) {
                                animationIdRef.current = requestAnimationFrame(animate);
                                globalSimulation.update();
                            }
                        };
                        animate();
                    }
                    return;
                }
                globalWebGPULock = true;
                initializingRef.current = true;

                // Check WebGPU support
                if (!navigator.gpu) {
                    setIsWebGPUSupported(false);
                    console.error('WebGPU is not supported in this browser');
                    initializingRef.current = false;
                    return;
                }
                console.log('WebGPU is supported');

                // Set initial canvas size before initializing WebGPU
                const parent = canvas.parentElement;
                if (parent && parent.clientWidth > 0 && parent.clientHeight > 0) {
                    canvas.width = parent.clientWidth;
                    canvas.height = parent.clientHeight;
                } else {
                    // Default size if parent size is not available
                    canvas.width = 800;
                    canvas.height = 600;
                }
                console.log('Initial canvas size:', canvas.width, 'x', canvas.height, 'instance:', instanceIdRef.current);

                const simulation = new CoffeeCupFluidSimulation(onMetricsUpdate);

                try {
                    const initialized = await simulation.initialize(canvas);

                    if (!initialized) {
                        console.error('WebGPU initialization returned false');
                        setIsWebGPUSupported(false);
                        initializingRef.current = false;
                        return;
                    }

                    simulationRef.current = simulation;
                    globalSimulation = simulation;
                    setIsInitialized(true);
                    console.log('Initialization complete, starting animation loop');

                    // Animation loop
                    let frameCount = 0;
                    const animate = () => {
                        if (simulationRef.current === simulation && globalSimulation === simulation) {
                            animationIdRef.current = requestAnimationFrame(animate);
                            if (frameCount === 0) {
                                console.log('First animation frame');
                            }
                            frameCount++;
                            simulation.update();
                        } else {
                            console.log('Animation stopped: ref mismatch');
                        }
                    };
                    animate();
                } catch (error) {
                    console.error('WebGPU initialization error:', error);
                    setIsWebGPUSupported(false);
                } finally {
                    initializingRef.current = false;
                    globalWebGPULock = false;
                }
            };

            initWebGPU();

            // Note: Avoiding resize during WebGPU rendering to prevent context issues

            return () => {
                console.log('Cleanup running');
                initializingRef.current = false;
                if (animationIdRef.current) {
                    cancelAnimationFrame(animationIdRef.current);
                    animationIdRef.current = null;
                }
                // Don't dispose the global simulation on cleanup
                // Just remove the local reference
                if (simulationRef.current && simulationRef.current !== globalSimulation) {
                    simulationRef.current.dispose();
                }
                simulationRef.current = null;
                setIsInitialized(false);
            };
        }, [onMetricsUpdate]);

        if (!isWebGPUSupported) {
            return (
                <div className="w-full h-screen flex items-center justify-center bg-black text-white">
                    <div className="text-center">
                        <h2 className="text-2xl mb-4">WebGPU Not Supported</h2>
                        <p className="mb-2">This simulation requires WebGPU support.</p>
                        <p>Please use a compatible browser like Chrome, Edge, or Safari Technology Preview.</p>
                        <p className="mt-4 text-sm text-gray-400">Make sure to enable WebGPU in your browser flags if needed.</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="w-full h-screen relative">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full"
                    style={{ touchAction: 'none' }}
                />
                {!isInitialized && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white">
                        <p>Initializing WebGPU fluid simulation...</p>
                    </div>
                )}
            </div>
        );
    }
);

WebGPUCoffeeSimulation.displayName = 'WebGPUCoffeeSimulation';

export default WebGPUCoffeeSimulation;