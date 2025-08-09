'use client';

import React, { useMemo, useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

interface ViewerProps {
    latticeType: string;
    unitCells: number;
    connectivity: number;
    cellSize: number;
    stiffness: number;
    damping: number;
    nonlinearity: number;
    auxeticity: number;
    selfAssembly: boolean;
    adaptation: boolean;
    healing: boolean;
    memoryEffect: boolean;
    mechanicalStimulus: number;
    thermalStimulus: number;
    stimulusFrequency: number;
    stimulusPattern: string;
    evolutionRate: number;
    mutationRate: number;
    fitnessFunction: string;
    showStress: boolean;
    showDeformation: boolean;
    showPropagation: boolean;
    showLifeMetrics: boolean;
    colorMode: string;
    speedMs: number;
}

interface Node {
    id: number;
    x: number;
    y: number;
    originalX: number;
    originalY: number;
    velocity: { x: number; y: number };
    stress: number;
    strain: number;
    energy: number;
    temperature: number;
    damage: number;
    memory: number[];
    connections: number[];
    isFixed: boolean;
}

const Viewer = forwardRef<{ exportCanvas: () => void }, ViewerProps>((props, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [connections, setConnections] = useState<[number, number][]>([]);
    const [lifeMetrics, setLifeMetrics] = useState({
        organization: 0,
        adaptation: 0,
        resilience: 0,
        memory: 0
    });
    
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
                        a.download = 'metamaterials.png';
                        a.click();
                        URL.revokeObjectURL(url);
                    }
                });
            }
        }
    }));

    // Generate lattice structure
    const generateLattice = () => {
        const newNodes: Node[] = [];
        const newConnections: [number, number][] = [];
        
        const centerX = width / 2;
        const centerY = height / 2;
        const latticeSize = props.unitCells;
        const spacing = props.cellSize;
        
        let nodeId = 0;
        
        if (props.latticeType === 'hexagonal') {
            for (let row = 0; row < latticeSize; row++) {
                for (let col = 0; col < latticeSize; col++) {
                    const x = centerX + (col - latticeSize/2) * spacing + (row % 2) * spacing/2;
                    const y = centerY + (row - latticeSize/2) * spacing * Math.sqrt(3)/2;
                    
                    if (x > 50 && x < width - 50 && y > 50 && y < height - 50) {
                        const node: Node = {
                            id: nodeId++,
                            x, y, originalX: x, originalY: y,
                            velocity: { x: 0, y: 0 },
                            stress: 0, strain: 0, energy: 0,
                            temperature: 0, damage: 0,
                            memory: [0, 0, 0, 0, 0],
                            connections: [],
                            isFixed: Math.random() < 0.1
                        };
                        newNodes.push(node);
                    }
                }
            }
        } else if (props.latticeType === 'auxetic') {
            // Create re-entrant hexagonal structure
            for (let row = 0; row < latticeSize; row++) {
                for (let col = 0; col < latticeSize; col++) {
                    const baseX = centerX + (col - latticeSize/2) * spacing;
                    const baseY = centerY + (row - latticeSize/2) * spacing;
                    
                    // Create bow-tie pattern for auxetic behavior
                    const angle = (row + col) * Math.PI / 4;
                    const x = baseX + Math.cos(angle) * spacing * 0.3;
                    const y = baseY + Math.sin(angle) * spacing * 0.3;
                    
                    if (x > 50 && x < width - 50 && y > 50 && y < height - 50) {
                        const node: Node = {
                            id: nodeId++,
                            x, y, originalX: x, originalY: y,
                            velocity: { x: 0, y: 0 },
                            stress: 0, strain: 0, energy: 0,
                            temperature: 0, damage: 0,
                            memory: [0, 0, 0, 0, 0],
                            connections: [],
                            isFixed: Math.random() < 0.1
                        };
                        newNodes.push(node);
                    }
                }
            }
        } else {
            // Square lattice
            for (let row = 0; row < latticeSize; row++) {
                for (let col = 0; col < latticeSize; col++) {
                    const x = centerX + (col - latticeSize/2) * spacing;
                    const y = centerY + (row - latticeSize/2) * spacing;
                    
                    if (x > 50 && x < width - 50 && y > 50 && y < height - 50) {
                        const node: Node = {
                            id: nodeId++,
                            x, y, originalX: x, originalY: y,
                            velocity: { x: 0, y: 0 },
                            stress: 0, strain: 0, energy: 0,
                            temperature: 0, damage: 0,
                            memory: [0, 0, 0, 0, 0],
                            connections: [],
                            isFixed: Math.random() < 0.1
                        };
                        newNodes.push(node);
                    }
                }
            }
        }
        
        // Create connections based on proximity and connectivity
        newNodes.forEach((node, i) => {
            newNodes.slice(i + 1).forEach((other, j) => {
                const distance = Math.sqrt((node.x - other.x) ** 2 + (node.y - other.y) ** 2);
                const maxDistance = spacing * 1.5;
                
                if (distance < maxDistance && Math.random() < props.connectivity) {
                    newConnections.push([node.id, other.id]);
                    node.connections.push(other.id);
                    other.connections.push(node.id);
                }
            });
        });
        
        setNodes(newNodes);
        setConnections(newConnections);
    };

    // Simulate metamaterial physics
    const updateSimulation = () => {
        if (nodes.length === 0) return;

        const dt = 0.01;
        const time = currentTime;
        
        const updatedNodes = nodes.map(node => {
            const newNode = { ...node };
            
            // Apply environmental stimuli
            let forceX = 0, forceY = 0;
            
            if (props.mechanicalStimulus > 0) {
                const phase = time * props.stimulusFrequency * 2 * Math.PI;
                if (props.stimulusPattern === 'wave') {
                    forceX += props.mechanicalStimulus * Math.sin(phase + node.x * 0.01);
                    forceY += props.mechanicalStimulus * Math.cos(phase + node.y * 0.01);
                } else if (props.stimulusPattern === 'pulse') {
                    const pulse = Math.sin(phase) > 0.5 ? 1 : 0;
                    forceX += props.mechanicalStimulus * pulse;
                }
            }
            
            // Thermal effects
            newNode.temperature += props.thermalStimulus * dt;
            
            // Spring forces from connections
            node.connections.forEach(connId => {
                const other = nodes.find(n => n.id === connId);
                if (!other) return;
                
                const dx = other.x - node.x;
                const dy = other.y - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const restLength = props.cellSize;
                
                // Auxetic behavior: negative Poisson's ratio
                const poissonEffect = props.auxeticity < 0 ? Math.abs(props.auxeticity) : 0;
                const effectiveStiffness = props.stiffness * (1 + poissonEffect * Math.abs(node.strain));
                
                const springForce = effectiveStiffness * (distance - restLength) / distance;
                const nonlinearFactor = 1 + props.nonlinearity * Math.sin(distance * 0.1);
                
                forceX += dx * springForce * nonlinearFactor;
                forceY += dy * springForce * nonlinearFactor;
                
                // Update stress and strain
                newNode.stress = Math.abs(springForce);
                newNode.strain = Math.abs(distance - restLength) / restLength;
            });
            
            // Self-assembly forces
            if (props.selfAssembly) {
                const assemblyForce = 0.1;
                const targetX = node.originalX + 10 * Math.sin(time * 0.5);
                const targetY = node.originalY + 10 * Math.cos(time * 0.5);
                forceX += assemblyForce * (targetX - node.x);
                forceY += assemblyForce * (targetY - node.y);
            }
            
            // Adaptation: modify properties based on history
            if (props.adaptation) {
                const adaptationRate = props.evolutionRate;
                newNode.memory.push(newNode.stress);
                if (newNode.memory.length > 5) newNode.memory.shift();
                
                const avgStress = newNode.memory.reduce((a, b) => a + b, 0) / newNode.memory.length;
                if (avgStress > 1.0) {
                    // Adapt to reduce stress
                    forceX *= 0.9;
                    forceY *= 0.9;
                }
            }
            
            // Self-healing
            if (props.healing && newNode.damage > 0) {
                newNode.damage -= 0.01;
                newNode.damage = Math.max(0, newNode.damage);
            }
            
            // Apply forces if not fixed
            if (!node.isFixed) {
                newNode.velocity.x = node.velocity.x * (1 - props.damping) + forceX * dt;
                newNode.velocity.y = node.velocity.y * (1 - props.damping) + forceY * dt;
                
                newNode.x = node.x + newNode.velocity.x * dt;
                newNode.y = node.y + newNode.velocity.y * dt;
                
                // Boundary conditions
                newNode.x = Math.max(50, Math.min(width - 50, newNode.x));
                newNode.y = Math.max(50, Math.min(height - 50, newNode.y));
            }
            
            // Update energy
            newNode.energy = 0.5 * (newNode.velocity.x ** 2 + newNode.velocity.y ** 2) + 0.5 * newNode.stress ** 2;
            
            return newNode;
        });
        
        setNodes(updatedNodes);
        
        // Update life metrics
        const avgStress = updatedNodes.reduce((sum, n) => sum + n.stress, 0) / updatedNodes.length;
        const avgEnergy = updatedNodes.reduce((sum, n) => sum + n.energy, 0) / updatedNodes.length;
        const avgDamage = updatedNodes.reduce((sum, n) => sum + n.damage, 0) / updatedNodes.length;
        
        setLifeMetrics({
            organization: 1 - avgStress / 10,
            adaptation: props.adaptation ? 0.8 : 0.2,
            resilience: 1 - avgDamage,
            memory: props.memoryEffect ? 0.7 : 0.1
        });
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
        
        // Draw connections
        ctx.lineWidth = 1;
        connections.forEach(([id1, id2]) => {
            const node1 = nodes.find(n => n.id === id1);
            const node2 = nodes.find(n => n.id === id2);
            if (!node1 || !node2) return;
            
            const distance = Math.sqrt((node1.x - node2.x) ** 2 + (node1.y - node2.y) ** 2);
            const strain = Math.abs(distance - props.cellSize) / props.cellSize;
            
            if (props.showStress) {
                const stress = (node1.stress + node2.stress) / 2;
                const intensity = Math.min(stress / 5, 1);
                ctx.strokeStyle = `rgb(${Math.floor(intensity * 255)}, ${Math.floor((1-intensity) * 100)}, 0)`;
            } else {
                ctx.strokeStyle = '#374151';
            }
            
            ctx.beginPath();
            ctx.moveTo(node1.x, node1.y);
            ctx.lineTo(node2.x, node2.y);
            ctx.stroke();
        });
        
        // Draw nodes
        nodes.forEach(node => {
            let color = '#84cc16';
            
            if (props.colorMode === 'stress') {
                const intensity = Math.min(node.stress / 5, 1);
                color = `rgb(${Math.floor(intensity * 255)}, ${Math.floor(132 * (1-intensity) + 255 * intensity)}, ${Math.floor(22 * (1-intensity))})`;
            } else if (props.colorMode === 'energy') {
                const intensity = Math.min(node.energy / 2, 1);
                color = `rgb(${Math.floor(132 + 123 * intensity)}, ${Math.floor(204 - 50 * intensity)}, ${Math.floor(22 + 100 * intensity)})`;
            }
            
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.isFixed ? 4 : 3, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
            
            if (node.isFixed) {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });
        
        // Draw life metrics if enabled
        if (props.showLifeMetrics) {
            const metricsX = width - 200;
            const metricsY = 50;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(metricsX, metricsY, 150, 120);
            ctx.strokeStyle = '#374151';
            ctx.strokeRect(metricsX, metricsY, 150, 120);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('Life Metrics', metricsX + 10, metricsY + 20);
            
            const metrics = [
                ['Organization', lifeMetrics.organization],
                ['Adaptation', lifeMetrics.adaptation],
                ['Resilience', lifeMetrics.resilience],
                ['Memory', lifeMetrics.memory]
            ];
            
            metrics.forEach(([label, value], i) => {
                const y = metricsY + 40 + i * 18;
                ctx.font = '10px monospace';
                ctx.fillText(label as string, metricsX + 10, y);
                
                const barWidth = 80;
                const barHeight = 8;
                const barX = metricsX + 65;
                const barY = y - 6;
                
                ctx.fillStyle = '#374151';
                ctx.fillRect(barX, barY, barWidth, barHeight);
                
                ctx.fillStyle = '#84cc16';
                ctx.fillRect(barX, barY, barWidth * (value as number), barHeight);
            });
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
    }, [isRunning, props, nodes, connections, currentTime]);

    // Initialize lattice when parameters change
    useEffect(() => {
        generateLattice();
        setCurrentTime(0);
    }, [props.latticeType, props.unitCells, props.connectivity, props.cellSize]);

    const toggleSimulation = () => setIsRunning(!isRunning);
    const resetSimulation = () => {
        setIsRunning(false);
        setCurrentTime(0);
        generateLattice();
    };

    return (
        <div className="space-y-4">
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

            <div className="bg-black border border-gray-800 p-4 text-center">
                <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                        <div className="text-lime-400 font-semibold">Time</div>
                        <div className="text-white">{currentTime.toFixed(2)}s</div>
                    </div>
                    <div>
                        <div className="text-lime-400 font-semibold">Nodes</div>
                        <div className="text-white">{nodes.length}</div>
                    </div>
                    <div>
                        <div className="text-lime-400 font-semibold">Connections</div>
                        <div className="text-white">{connections.length}</div>
                    </div>
                    <div>
                        <div className="text-lime-400 font-semibold">Avg Stress</div>
                        <div className="text-white">{nodes.length > 0 ? (nodes.reduce((s, n) => s + n.stress, 0) / nodes.length).toFixed(2) : '0.00'}</div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                <canvas
                    ref={canvasRef}
                    width={width}
                    height={height}
                    className="border border-gray-800 bg-black"
                />
            </div>

            <div className="bg-black border border-gray-800 p-4 text-gray-300 font-serif text-sm leading-relaxed">
                <h3 className="text-lg font-semibold text-lime-400 mb-3">Metamaterial Simulation</h3>
                <p>
                    This visualization shows how metamaterials can exhibit life-like properties through their 
                    engineered microstructure. The simulation demonstrates self-assembly, adaptation, 
                    self-healing, and memory formation in synthetic materials.
                </p>
            </div>
        </div>
    );
});

Viewer.displayName = 'MetamaterialsViewer';
export default Viewer;