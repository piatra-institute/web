'use client';

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { NeuralCellularAutomaton, GridState } from '../../logic';

interface ViewerProps {
    gridSize: number;
    rule: number;
    dimensions: number;
    neighborhoodType: string;
    layers: number;
    neuronsPerCell: number;
    activationFunction: string;
    learningRate: number;
    evolutionMode: string;
    mutationRate: number;
    selectionPressure: number;
    fitnessFunction: string;
    visualizationMode: string;
    colorScheme: string;
    showConnections: boolean;
    showActivation: boolean;
    showWeights: boolean;
    speedMs: number;
    autoEvolve: boolean;
}

const Viewer = forwardRef<{ exportCanvas: () => void }, ViewerProps>((props, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const ncaRef = useRef<NeuralCellularAutomaton>();
    const lastUpdateRef = useRef<number>(0);
    
    useImperativeHandle(ref, () => ({
        exportCanvas: () => {
            if (canvasRef.current) {
                const link = document.createElement('a');
                link.download = 'neural-cellular-automaton.png';
                link.href = canvasRef.current.toDataURL();
                link.click();
            }
        }
    }));
    
    useEffect(() => {
        ncaRef.current = new NeuralCellularAutomaton(
            props.gridSize,
            props.layers,
            props.neuronsPerCell,
            props.activationFunction,
            props.learningRate
        );
        
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [props.gridSize, props.layers, props.neuronsPerCell, props.activationFunction, props.learningRate]);
    
    const getColor = (cell: any, mode: string, scheme: string): string => {
        if (scheme === 'binary') {
            return cell.state === 1 ? '#84cc16' : '#000000';
        }
        
        let value = 0;
        switch (mode) {
            case 'activation':
                value = cell.activation[0];
                break;
            case 'state':
                value = cell.state;
                break;
            case 'weights':
                const avgWeight = cell.weights.flat(2).reduce((a: number, b: number) => a + b, 0) / 
                                 cell.weights.flat(2).length;
                value = (avgWeight + 5) / 10;
                break;
            case 'diversity':
                value = cell.activation.reduce((a: number, b: number) => a + b, 0) / cell.activation.length;
                break;
        }
        
        if (scheme === 'gradient') {
            const intensity = Math.floor(value * 255);
            return `rgb(${intensity * 0.5}, ${intensity}, ${intensity * 0.1})`;
        } else if (scheme === 'heatmap') {
            const r = Math.floor(value * 255);
            const g = Math.floor((1 - value) * 132);
            const b = Math.floor((1 - value) * 22);
            return `rgb(${r}, ${g}, ${b})`;
        }
        
        return '#84cc16';
    };
    
    const render = useCallback((timestamp: number) => {
        const canvas = canvasRef.current;
        if (!canvas || !ncaRef.current) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        if (props.autoEvolve && timestamp - lastUpdateRef.current >= props.speedMs) {
            ncaRef.current.step(props.evolutionMode, props.rule);
            
            if (Math.random() < props.mutationRate * 10) {
                ncaRef.current.mutate(props.mutationRate);
            }
            
            lastUpdateRef.current = timestamp;
        }
        
        const gridState = ncaRef.current.getGridState();
        const cellSize = Math.floor(800 / props.gridSize);
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 800, 800);
        
        for (let x = 0; x < props.gridSize; x++) {
            for (let y = 0; y < props.gridSize; y++) {
                const cell = gridState.cells[x][y];
                const color = getColor(cell, props.visualizationMode, props.colorScheme);
                
                ctx.fillStyle = color;
                ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
                
                if (props.showActivation && cellSize > 10) {
                    ctx.fillStyle = 'rgba(132, 204, 22, 0.3)';
                    const activationHeight = cell.activation[0] * cellSize;
                    ctx.fillRect(x * cellSize, y * cellSize + cellSize - activationHeight, cellSize - 1, activationHeight);
                }
                
                if (props.showConnections && cellSize > 20) {
                    ctx.strokeStyle = 'rgba(132, 204, 22, 0.1)';
                    ctx.lineWidth = 0.5;
                    for (let dx = -1; dx <= 1; dx++) {
                        for (let dy = -1; dy <= 1; dy++) {
                            if (dx === 0 && dy === 0) continue;
                            const nx = (x + dx + props.gridSize) % props.gridSize;
                            const ny = (y + dy + props.gridSize) % props.gridSize;
                            ctx.beginPath();
                            ctx.moveTo(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
                            ctx.lineTo(nx * cellSize + cellSize / 2, ny * cellSize + cellSize / 2);
                            ctx.stroke();
                        }
                    }
                }
            }
        }
        
        ctx.fillStyle = '#84cc16';
        ctx.font = '12px monospace';
        ctx.fillText(`Generation: ${gridState.generation}`, 10, 20);
        ctx.fillText(`Fitness: ${gridState.fitness.toFixed(3)}`, 10, 35);
        
        animationRef.current = requestAnimationFrame(render);
    }, [props, getColor]);
    
    useEffect(() => {
        animationRef.current = requestAnimationFrame(render);
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [render]);
    
    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={800}
            className="w-full h-full max-w-[800px] max-h-[800px] border border-gray-800"
        />
    );
});

Viewer.displayName = 'Viewer';

export default Viewer;