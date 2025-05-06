'use client';

import React, {
    useRef, useEffect, useState, forwardRef, useImperativeHandle,
    useCallback,
} from 'react';
import {
    runBirdSymSimulation,
    generateBifurcationData,
    type BirdSymParameters
} from '../../logic/birdsym';
import {
    createBifurcationDiagramPoints,
    createTimeSeriesPoints
} from '../../logic/utils';

export interface ViewerProps {
    // Number of birds (PODs)
    birdCount: number;

    // Resource mean (a1)
    resourceMean: number;

    // Resource variance (σg)
    resourceVariance: number;

    // Adaptation rate (C)
    adaptationRate: number;

    // Bifurcation parameter (λ)
    bifurcationParameter: number;

    // Bifurcation parameter range for diagram
    bifurcationStart: number;
    bifurcationEnd: number;

    // Number of simulation steps for bifurcation diagram
    bifurcationSteps: number;

    // Number of iterations for each simulation
    iterations: number;

    // Visualization mode: "bifurcation" or "timeseries"
    visualizationMode: 'bifurcation' | 'timeseries';
}

export interface CaptureHandle {
    capture: () => string;
}

const Viewer = forwardRef<CaptureHandle, ViewerProps>((props, ref) => {
    const {
        birdCount,
        resourceMean,
        resourceVariance,
        adaptationRate,
        bifurcationParameter,
        bifurcationStart,
        bifurcationEnd,
        bifurcationSteps,
        iterations,
        visualizationMode
    } = props;

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationComplete, setSimulationComplete] = useState(false);
    const [bifurcationResults, setBifurcationResults] = useState<any[]>([]);
    const [timeSeriesResults, setTimeSeriesResults] = useState<any | null>(null);

    // Expose the capture method for taking screenshots
    useImperativeHandle(ref, () => ({
        capture: () => {
            if (!canvasRef.current) return '';
            return canvasRef.current.toDataURL('image/png');
        }
    }));

    // Setup canvas size based on container
    useEffect(() => {
        const updateCanvasSize = () => {
            if (!canvasRef.current || !canvasRef.current.parentElement) return;

            const container = canvasRef.current.parentElement;
            setCanvasSize({
                width: container.clientWidth,
                height: container.clientHeight
            });
        };

        window.addEventListener('resize', updateCanvasSize);
        updateCanvasSize();

        return () => {
            window.removeEventListener('resize', updateCanvasSize);
        };
    }, []);

    // Run simulation when parameters change
    useEffect(() => {
        if (!canvasRef.current || canvasSize.width === 0 || canvasSize.height === 0) return;

        setIsSimulating(true);
        setSimulationComplete(false);

        // Use a small delay to let the UI update
        const simulationTimeout = setTimeout(() => {
            const baseParams: Omit<BirdSymParameters, 'bifurcationParameter'> = {
                N: birdCount,
                resourceMean,
                resourceVariance,
                adaptationRate,
                iterations
            };

            // For bifurcation diagram, run multiple simulations
            if (visualizationMode === 'bifurcation') {
                const results = generateBifurcationData(
                    baseParams,
                    bifurcationStart,
                    bifurcationEnd,
                    bifurcationSteps
                );

                setBifurcationResults(results);
                setTimeSeriesResults(null);
            }
            // For time series, run a single simulation
            else if (visualizationMode === 'timeseries') {
                const result = runBirdSymSimulation({
                    ...baseParams,
                    bifurcationParameter
                });

                setBifurcationResults([]);
                setTimeSeriesResults(result);
            }

            setIsSimulating(false);
            setSimulationComplete(true);
        }, 10);

        return () => {
            clearTimeout(simulationTimeout);
        };
    }, [
        birdCount,
        resourceMean,
        resourceVariance,
        adaptationRate,
        bifurcationParameter,
        bifurcationStart,
        bifurcationEnd,
        bifurcationSteps,
        iterations,
        visualizationMode,
        canvasSize
    ]);


    // Draw the bifurcation diagram
    const drawBifurcationDiagram = useCallback((
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number
    ) => {
        if (bifurcationResults.length === 0) return;

        // Get points for the diagram
        const points = createBifurcationDiagramPoints(
            bifurcationResults,
            width,
            height,
            bifurcationStart,
            bifurcationEnd
        );

        // Draw the points with a smaller, brighter dot for better visibility
        ctx.fillStyle = '#FFFFFF';
        for (const [x, y] of points) {
            ctx.beginPath();
            ctx.arc(x, y, 0.7, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Draw axes labels
        ctx.fillStyle = '#AAAAAA';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';

        // X-axis labels (bifurcation parameter)
        ctx.fillText(`λ = ${bifurcationStart.toFixed(2)}`, 40, height - 10);
        ctx.fillText(`λ = ${bifurcationEnd.toFixed(2)}`, width - 40, height - 10);
        ctx.fillText('Bifurcation Parameter (λ)', width / 2, height - 10);

        // Y-axis label (position)
        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Position', 0, 0);
        ctx.restore();

        // Title
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px sans-serif';
        ctx.fillText('BirdSym Bifurcation Diagram', width / 2, 20);
    }, [
        bifurcationResults, bifurcationStart, bifurcationEnd
    ]);

    // Draw the time series visualization
    const drawTimeSeries = useCallback((
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number
    ) => {
        if (!timeSeriesResults) return;

        const { positionHistory } = timeSeriesResults;
        const lines = createTimeSeriesPoints(positionHistory, width, height, iterations);

        // Draw each bird's trajectory with a unique color
        lines.forEach((line, index) => {
            // Generate colors based on index
            const hue = (index * 360 / lines.length) % 360;
            ctx.strokeStyle = `hsl(${hue}, 80%, 60%)`;
            ctx.lineWidth = 1;

            ctx.beginPath();
            line.forEach(([x, y], i) => {
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();
        });

        // Draw axes labels
        ctx.fillStyle = '#AAAAAA';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';

        // X-axis label
        ctx.fillText('Time →', width / 2, height - 10);
        ctx.fillText('0', 20, height - 10);
        ctx.fillText(`${iterations}`, width - 20, height - 10);

        // Y-axis label (position)
        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Position', 0, 0);
        ctx.restore();

        // Add 0 and 1 labels on Y axis
        ctx.textAlign = 'right';
        ctx.fillText('1', 20, 20);
        ctx.fillText('0', 20, height - 25);

        // Title
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`BirdSym Population Dynamics (λ = ${bifurcationParameter.toFixed(2)})`, width / 2, 20);
    }, [
        timeSeriesResults, iterations, bifurcationParameter
    ]);


    // Draw the simulation results
    useEffect(() => {
        if (!canvasRef.current || !simulationComplete || canvasSize.width === 0 || canvasSize.height === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set canvas size
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;

        // Draw background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw axes
        ctx.strokeStyle = '#333333';
        ctx.beginPath();

        // X-axis (horizontal line at the middle)
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);

        // Y-axis (vertical line at the left)
        ctx.moveTo(0, 0);
        ctx.lineTo(0, canvas.height);

        ctx.stroke();

        // Draw visualization based on mode
        if (visualizationMode === 'bifurcation' && bifurcationResults.length > 0) {
            drawBifurcationDiagram(ctx, canvas.width, canvas.height);
        } else if (visualizationMode === 'timeseries' && timeSeriesResults) {
            drawTimeSeries(ctx, canvas.width, canvas.height);
        }
    }, [
        bifurcationResults, timeSeriesResults, simulationComplete, canvasSize, visualizationMode,
        drawTimeSeries, drawBifurcationDiagram
    ]);

    return (
        <div className="w-full h-full relative">
            {isSimulating && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <div className="text-white text-xl">Simulating...</div>
                </div>
            )}
            <canvas
                ref={canvasRef}
                className="w-full h-full"
            />
        </div>
    );
});

Viewer.displayName = 'Viewer';

export default Viewer;