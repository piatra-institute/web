'use client';

import React, { useMemo, useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

interface ViewerProps {
    grainCount: number;
    packingFraction: number;
    grainStiffness: number;
    damping: number;
    frequency1: number;
    frequency2: number;
    amplitude1: number;
    amplitude2: number;
    input1A: boolean;
    input1B: boolean;
    input2A: boolean;
    input2B: boolean;
    evolutionGenerations: number;
    mutationRate: number;
    showEvolution: boolean;
    showVibrationModes: boolean;
    showLogicFlow: boolean;
    showFrequencySpectrum: boolean;
    speedMs: number;
}

interface Grain {
    id: number;
    x: number;
    y: number;
    radius: number;
    stiffness: number;
    mass: number;
    velocity: { x: number; y: number };
    displacement: { x: number; y: number };
    contacts: number[];
    isInput: boolean;
    isOutput: boolean;
    logicValue: number;
}

interface VibrationMode {
    frequency: number;
    amplitude: number;
    phase: number;
    energy: number;
}

// Utility functions
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
const distance = (a: {x: number, y: number}, b: {x: number, y: number}) => 
    Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

function randn() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

const Viewer = forwardRef<{ exportCanvas: () => void }, ViewerProps>((props, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [grains, setGrains] = useState<Grain[]>([]);
    const [vibrationModes, setVibrationModes] = useState<VibrationMode[]>([]);
    const [evolutionGeneration, setEvolutionGeneration] = useState(0);
    const [fitnessHistory, setFitnessHistory] = useState<number[]>([]);
    
    const width = 800;
    const height = 600;

    useImperativeHandle(ref, () => ({
        exportCanvas: () => {
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.toBlob((blob) => {
                    if (blob) {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'refractive-computation.png';
                        a.click();
                        URL.revokeObjectURL(url);
                    }
                });
            }
        }
    }));

    // Initialize grain assembly
    const initializeGrains = () => {
        const newGrains: Grain[] = [];
        const containerWidth = width * 0.8;
        const containerHeight = height * 0.8;
        const startX = (width - containerWidth) / 2;
        const startY = (height - containerHeight) / 2;

        // Calculate grain radius from packing fraction
        const totalArea = containerWidth * containerHeight;
        const grainArea = (props.packingFraction * totalArea) / props.grainCount;
        const baseRadius = Math.sqrt(grainArea / Math.PI);

        for (let i = 0; i < props.grainCount; i++) {
            let x, y, attempts = 0;
            let validPosition = false;

            // Find non-overlapping position
            while (!validPosition && attempts < 100) {
                x = startX + Math.random() * containerWidth;
                y = startY + Math.random() * containerHeight;
                
                validPosition = true;
                for (const grain of newGrains) {
                    if (distance({ x: x!, y: y! }, grain) < (baseRadius + grain.radius) * 1.1) {
                        validPosition = false;
                        break;
                    }
                }
                attempts++;
            }

            // Add some size variation
            const radius = baseRadius * (0.8 + 0.4 * Math.random());
            
            const grain: Grain = {
                id: i,
                x: x!,
                y: y!,
                radius,
                stiffness: props.grainStiffness * (0.8 + 0.4 * Math.random()),
                mass: Math.PI * radius * radius, // Area-based mass
                velocity: { x: 0, y: 0 },
                displacement: { x: 0, y: 0 },
                contacts: [],
                isInput: i < 4, // First 4 grains are inputs
                isOutput: i === props.grainCount - 1, // Last grain is output
                logicValue: 0
            };

            newGrains.push(grain);
        }

        // Set up input grains at specific positions
        if (newGrains.length >= 4) {
            newGrains[0].x = startX + containerWidth * 0.1;
            newGrains[0].y = startY + containerHeight * 0.3;
            newGrains[1].x = startX + containerWidth * 0.1;
            newGrains[1].y = startY + containerHeight * 0.7;
            newGrains[2].x = startX + containerWidth * 0.2;
            newGrains[2].y = startY + containerHeight * 0.3;
            newGrains[3].x = startX + containerWidth * 0.2;
            newGrains[3].y = startY + containerHeight * 0.7;
        }

        // Set up output grain
        if (newGrains.length > 0) {
            const outputGrain = newGrains[newGrains.length - 1];
            outputGrain.x = startX + containerWidth * 0.9;
            outputGrain.y = startY + containerHeight * 0.5;
        }

        // Calculate contacts
        newGrains.forEach(grain => {
            grain.contacts = newGrains
                .filter(other => other.id !== grain.id)
                .filter(other => distance(grain, other) < (grain.radius + other.radius) * 1.2)
                .map(other => other.id);
        });

        setGrains(newGrains);
    };

    // Calculate NAND logic for given inputs
    const calculateNAND = (inputA: boolean, inputB: boolean) => {
        return !(inputA && inputB);
    };

    // Simulate granular mechanics with frequency-dependent response
    const simulateGranularMechanics = (frequency: number, amplitude: number, inputValues: boolean[]) => {
        if (grains.length === 0) return { forces: [], displacements: [] };

        const forces: { x: number; y: number }[] = grains.map(() => ({ x: 0, y: 0 }));
        const displacements: { x: number; y: number }[] = [];

        // Apply input forces based on logic values and frequency
        grains.forEach((grain, i) => {
            if (grain.isInput && i < inputValues.length) {
                const inputForce = inputValues[i] ? amplitude : 0;
                const phaseShift = frequency * currentTime * 2 * Math.PI;
                forces[i].x += inputForce * Math.cos(phaseShift);
                forces[i].y += inputForce * Math.sin(phaseShift);
            }
        });

        // Calculate contact forces
        grains.forEach((grain, i) => {
            grain.contacts.forEach(contactId => {
                const other = grains[contactId];
                if (!other) return;

                const dx = other.x - grain.x;
                const dy = other.y - grain.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const overlap = (grain.radius + other.radius) - dist;

                if (overlap > 0) {
                    // Normal force (Hertzian contact)
                    const normalForce = Math.sqrt(overlap) * grain.stiffness;
                    const nx = dx / dist;
                    const ny = dy / dist;

                    // Frequency-dependent stiffness
                    const frequencyFactor = 1 + 0.5 * Math.sin(frequency * currentTime * 2 * Math.PI);
                    const effectiveForce = normalForce * frequencyFactor;

                    forces[i].x += effectiveForce * nx;
                    forces[i].y += effectiveForce * ny;
                    forces[contactId].x -= effectiveForce * nx;
                    forces[contactId].y -= effectiveForce * ny;
                }
            });
        });

        // Calculate displacements from forces
        grains.forEach((grain, i) => {
            const acceleration = {
                x: forces[i].x / grain.mass,
                y: forces[i].y / grain.mass
            };

            // Simple integration with damping
            grain.velocity.x = grain.velocity.x * (1 - props.damping) + acceleration.x * 0.01;
            grain.velocity.y = grain.velocity.y * (1 - props.damping) + acceleration.y * 0.01;

            const displacement = {
                x: grain.displacement.x + grain.velocity.x * 0.01,
                y: grain.displacement.y + grain.velocity.y * 0.01
            };

            displacements.push(displacement);
        });

        return { forces, displacements };
    };

    // Update simulation
    const updateSimulation = () => {
        if (grains.length === 0) return;

        const inputs1 = [props.input1A, props.input1B, false, false];
        const inputs2 = [props.input2A, props.input2B, false, false];

        // Simulate both frequencies
        const sim1 = simulateGranularMechanics(props.frequency1, props.amplitude1, inputs1);
        const sim2 = simulateGranularMechanics(props.frequency2, props.amplitude2, inputs2);

        // Update grain positions and logic values
        const updatedGrains = grains.map((grain, i) => {
            const newGrain = { ...grain };

            if (sim1.displacements[i] && sim2.displacements[i]) {
                newGrain.displacement = {
                    x: sim1.displacements[i].x + sim2.displacements[i].x,
                    y: sim1.displacements[i].y + sim2.displacements[i].y
                };
            }

            // Calculate logic values for output grain
            if (grain.isOutput) {
                const response1 = Math.abs(newGrain.displacement.x) > 0.1 ? 1 : 0;
                const response2 = Math.abs(newGrain.displacement.y) > 0.1 ? 1 : 0;
                
                const nand1 = calculateNAND(props.input1A, props.input1B) ? 1 : 0;
                const nand2 = calculateNAND(props.input2A, props.input2B) ? 1 : 0;
                
                newGrain.logicValue = (response1 === nand1 && response2 === nand2) ? 1 : 0;
            }

            return newGrain;
        });

        setGrains(updatedGrains);

        // Update vibration modes
        const modes: VibrationMode[] = [
            {
                frequency: props.frequency1,
                amplitude: props.amplitude1,
                phase: currentTime * props.frequency1 * 2 * Math.PI,
                energy: sim1.forces.reduce((sum, f) => sum + Math.sqrt(f.x * f.x + f.y * f.y), 0)
            },
            {
                frequency: props.frequency2,
                amplitude: props.amplitude2,
                phase: currentTime * props.frequency2 * 2 * Math.PI,
                energy: sim2.forces.reduce((sum, f) => sum + Math.sqrt(f.x * f.x + f.y * f.y), 0)
            }
        ];

        setVibrationModes(modes);
    };

    // Render visualization
    const render = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        // Draw container
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 2;
        ctx.strokeRect(width * 0.1, height * 0.1, width * 0.8, height * 0.8);

        // Draw vibration modes if enabled
        if (props.showVibrationModes && vibrationModes.length > 0) {
            vibrationModes.forEach((mode, i) => {
                const alpha = mode.energy / 100;
                ctx.globalAlpha = Math.min(alpha, 0.3);
                ctx.fillStyle = i === 0 ? '#84cc16' : '#22c55e';
                
                // Draw wave pattern
                for (let x = 0; x < width; x += 10) {
                    const waveY = height / 2 + mode.amplitude * 20 * Math.sin(
                        (x / width) * 2 * Math.PI + mode.phase
                    );
                    ctx.fillRect(x, waveY - 2, 8, 4);
                }
            });
            ctx.globalAlpha = 1;
        }

        // Draw grains
        grains.forEach((grain, i) => {
            const x = grain.x + grain.displacement.x * 10;
            const y = grain.y + grain.displacement.y * 10;

            // Grain color based on type
            let fillColor = '#9CA3AF'; // Default grain color
            let strokeColor = '#6B7280';

            if (grain.isInput) {
                const isActive = (i === 0 && props.input1A) || 
                               (i === 1 && props.input1B) ||
                               (i === 2 && props.input2A) || 
                               (i === 3 && props.input2B);
                fillColor = isActive ? '#84cc16' : '#4B5563';
                strokeColor = '#84cc16';
            } else if (grain.isOutput) {
                fillColor = grain.logicValue > 0.5 ? '#84cc16' : '#DC2626';
                strokeColor = '#84cc16';
            }

            // Draw grain
            ctx.beginPath();
            ctx.arc(x, y, grain.radius, 0, 2 * Math.PI);
            ctx.fillStyle = fillColor;
            ctx.fill();
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Draw grain ID for debugging
            if (grain.isInput || grain.isOutput) {
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(
                    grain.isInput ? `I${i}` : 'OUT',
                    x,
                    y + 4
                );
            }
        });

        // Draw force chains if logic flow is enabled
        if (props.showLogicFlow) {
            grains.forEach((grain, i) => {
                grain.contacts.forEach(contactId => {
                    const other = grains[contactId];
                    if (!other || contactId <= i) return; // Avoid duplicate lines

                    const x1 = grain.x + grain.displacement.x * 10;
                    const y1 = grain.y + grain.displacement.y * 10;
                    const x2 = other.x + other.displacement.x * 10;
                    const y2 = other.y + other.displacement.y * 10;

                    const force = Math.abs(grain.displacement.x + grain.displacement.y);
                    const alpha = Math.min(force, 1);

                    if (alpha > 0.1) {
                        ctx.globalAlpha = alpha;
                        ctx.strokeStyle = '#84cc16';
                        ctx.lineWidth = 1 + force * 2;
                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.stroke();
                    }
                });
            });
            ctx.globalAlpha = 1;
        }

        // Draw frequency spectrum
        if (props.showFrequencySpectrum && vibrationModes.length > 0) {
            const spectrumX = width - 200;
            const spectrumY = 50;
            const spectrumWidth = 150;
            const spectrumHeight = 100;

            ctx.fillStyle = '#000000';
            ctx.fillRect(spectrumX, spectrumY, spectrumWidth, spectrumHeight);
            ctx.strokeStyle = '#374151';
            ctx.strokeRect(spectrumX, spectrumY, spectrumWidth, spectrumHeight);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '12px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('Frequency Spectrum', spectrumX + 5, spectrumY - 5);

            vibrationModes.forEach((mode, i) => {
                const barX = spectrumX + 20 + i * 50;
                const barHeight = (mode.energy / 100) * spectrumHeight * 0.8;
                const barY = spectrumY + spectrumHeight - barHeight - 10;

                ctx.fillStyle = i === 0 ? '#84cc16' : '#22c55e';
                ctx.fillRect(barX, barY, 30, barHeight);

                ctx.fillStyle = '#FFFFFF';
                ctx.font = '10px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(`${mode.frequency}Hz`, barX + 15, spectrumY + spectrumHeight + 15);
            });
        }

        // Draw logic truth table
        const tableX = 50;
        const tableY = height - 120;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(tableX, tableY, 300, 100);
        ctx.strokeStyle = '#374151';
        ctx.strokeRect(tableX, tableY, 300, 100);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('Logic Operations', tableX + 10, tableY + 20);

        const nand1Result = calculateNAND(props.input1A, props.input1B);
        const nand2Result = calculateNAND(props.input2A, props.input2B);

        ctx.font = '10px monospace';
        ctx.fillText(`Freq1 (${props.frequency1}Hz): ${props.input1A ? 1 : 0} NAND ${props.input1B ? 1 : 0} = ${nand1Result ? 1 : 0}`, tableX + 10, tableY + 40);
        ctx.fillText(`Freq2 (${props.frequency2}Hz): ${props.input2A ? 1 : 0} NAND ${props.input2B ? 1 : 0} = ${nand2Result ? 1 : 0}`, tableX + 10, tableY + 55);

        if (grains.length > 0) {
            const outputGrain = grains[grains.length - 1];
            ctx.fillStyle = outputGrain.logicValue > 0.5 ? '#84cc16' : '#DC2626';
            ctx.fillText(`Material Output: ${outputGrain.logicValue > 0.5 ? 1 : 0}`, tableX + 10, tableY + 75);
        }
    };

    // Animation loop
    useEffect(() => {
        let animationId: number;
        
        const animate = () => {
            if (isRunning) {
                updateSimulation();
                setCurrentTime(prev => prev + props.speedMs / 1000);
            }
            render();
            animationId = requestAnimationFrame(animate);
        };

        animate();
        return () => cancelAnimationFrame(animationId);
    }, [isRunning, props, grains, vibrationModes, currentTime]);

    // Initialize grains when parameters change
    useEffect(() => {
        initializeGrains();
        setCurrentTime(0);
    }, [props.grainCount, props.packingFraction, props.grainStiffness]);

    // Control functions
    const toggleSimulation = () => {
        setIsRunning(!isRunning);
    };

    const resetSimulation = () => {
        setIsRunning(false);
        setCurrentTime(0);
        initializeGrains();
        setEvolutionGeneration(0);
        setFitnessHistory([]);
    };

    return (
        <div className="space-y-4">
            {/* Control Panel */}
            <div className="flex justify-center gap-4 mb-4">
                <button
                    onClick={toggleSimulation}
                    className="px-6 py-2 bg-lime-600 hover:bg-lime-500 text-black font-semibold rounded transition-colors"
                >
                    {isRunning ? 'Pause' : 'Start'} Simulation
                </button>
                <button
                    onClick={resetSimulation}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded transition-colors"
                >
                    Reset
                </button>
            </div>

            {/* Status Display */}
            <div className="bg-black border border-gray-800 p-4 text-center">
                <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                        <div className="text-lime-400 font-semibold">Time</div>
                        <div className="text-white">{currentTime.toFixed(2)}s</div>
                    </div>
                    <div>
                        <div className="text-lime-400 font-semibold">Grains</div>
                        <div className="text-white">{grains.length}</div>
                    </div>
                    <div>
                        <div className="text-lime-400 font-semibold">Contacts</div>
                        <div className="text-white">{grains.reduce((sum, g) => sum + g.contacts.length, 0) / 2}</div>
                    </div>
                    <div>
                        <div className="text-lime-400 font-semibold">Energy</div>
                        <div className="text-white">{vibrationModes.reduce((sum, m) => sum + m.energy, 0).toFixed(1)}</div>
                    </div>
                </div>
            </div>

            {/* Main Canvas */}
            <div className="flex justify-center">
                <canvas
                    ref={canvasRef}
                    width={width}
                    height={height}
                    className="border border-gray-800 bg-black"
                />
            </div>

            {/* Information Panel */}
            <div className="bg-black border border-gray-800 p-4 text-gray-300 font-serif text-sm leading-relaxed">
                <h3 className="text-lg font-semibold text-lime-400 mb-3">Granular Polycomputation</h3>
                <p className="mb-3">
                    This visualization shows how granular materials can perform multiple logical operations 
                    simultaneously at different frequencies. The system demonstrates frequency-multiplexed 
                    computation where the same physical medium processes different logic gates based on 
                    vibration frequency.
                </p>
                <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                        <strong className="text-lime-400">Input Grains:</strong> Green grains represent logical inputs, 
                        with brightness indicating the input state (bright = 1, dim = 0).
                    </div>
                    <div>
                        <strong className="text-lime-400">Force Chains:</strong> Green lines show force transmission 
                        paths that carry computational information through the material.
                    </div>
                    <div>
                        <strong className="text-lime-400">Output Grain:</strong> The rightmost grain shows the computational 
                        result (green = correct logic output, red = incorrect).
                    </div>
                </div>
            </div>
        </div>
    );
});

Viewer.displayName = 'RefractiveComputationViewer';

export default Viewer;