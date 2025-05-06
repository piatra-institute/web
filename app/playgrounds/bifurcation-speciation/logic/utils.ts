'use client';

/**
 * Utility functions for rendering bifurcation diagrams
 */

/**
 * Map a value from one range to another
 */
export function mapRange(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
): number {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Create the data points for rendering a bifurcation diagram
 */
export function createBifurcationDiagramPoints(
    results: any[],
    canvasWidth: number,
    canvasHeight: number,
    bifurcationStart: number,
    bifurcationEnd: number,
    yMin: number = 0,
    yMax: number = 1
): [number, number][] {
    const points: [number, number][] = [];
    
    // For each simulation result
    results.forEach((result, i) => {
        const bifurcationParam = result.parameters.bifurcationParameter;
        const positions = result.finalPositions;
        
        // Map bifurcation parameter to x-coordinate
        const x = mapRange(bifurcationParam, bifurcationStart, bifurcationEnd, 0, canvasWidth);
        
        // For each final position of a bird in this simulation
        positions.forEach(position => {
            // Map position to y-coordinate
            const y = mapRange(position, yMin, yMax, canvasHeight, 0);
            points.push([x, y]);
        });
    });
    
    return points;
}

/**
 * Create data points for a time series visualization
 */
export function createTimeSeriesPoints(
    positionHistory: number[][],
    canvasWidth: number,
    canvasHeight: number,
    timeSteps: number,
    yMin: number = 0,
    yMax: number = 1
): [number, number][][] {
    // Create a line for each bird
    const birdCount = positionHistory[0].length;
    const lines: [number, number][][] = Array(birdCount).fill(0).map(() => []);
    
    // Number of time steps to include
    const historyLength = Math.min(positionHistory.length, timeSteps);
    
    // For each time step
    for (let t = 0; t < historyLength; t++) {
        // Map time to x-coordinate
        const x = mapRange(t, 0, historyLength - 1, 0, canvasWidth);
        
        // For each bird
        for (let b = 0; b < birdCount; b++) {
            if (positionHistory[t] && positionHistory[t][b] !== undefined) {
                // Map position to y-coordinate
                const y = mapRange(positionHistory[t][b], yMin, yMax, canvasHeight, 0);
                lines[b].push([x, y]);
            }
        }
    }
    
    return lines;
}