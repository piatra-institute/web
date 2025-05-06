'use client';

/**
 * BirdSym model implementation based on Ian Stewart's "Bifurcation, Symmetry and Patterns" (2000)
 * Simulates population dynamics of birds using resource distribution and energy accumulation
 */

// Type definitions
export interface BirdSymParameters {
    // Number of birds (PODs)
    N: number;
    
    // Initial positions of birds (between 0 and 1)
    initialPositions?: number[];
    
    // Resource mean (a1)
    resourceMean: number;
    
    // Resource variance (σg)
    resourceVariance: number;
    
    // Adaptation rate (C)
    adaptationRate: number;
    
    // Number of iterations to run
    iterations: number;
    
    // Bifurcation parameter (λ)
    bifurcationParameter: number;
}

export interface SimulationResult {
    // Positions at each timestep
    positionHistory: number[][];
    
    // Final positions
    finalPositions: number[];
    
    // Parameters used for the simulation
    parameters: BirdSymParameters;
}

/**
 * Calculate resource distribution at position x
 * R(l) = (e^(-(l-a1)²/2σg²))/√(2πσg²)
 */
export function resourceDistribution(
    position: number,
    mean: number,
    variance: number
): number {
    const exponent = -Math.pow(position - mean, 2) / (2 * variance);
    return Math.exp(exponent) / Math.sqrt(2 * Math.PI * variance);
}

/**
 * Calculate feeding efficiency of bird at position x for seed size l
 * f(l) = (e^(-(l-x)²/2σe²))/√(2πσe²)
 * We use position as the mean and a fixed variance for simplicity
 */
export function feedingEfficiency(
    seedPosition: number,
    birdPosition: number, 
    variance: number = 0.01 // σe² - environment variance
): number {
    const exponent = -Math.pow(seedPosition - birdPosition, 2) / (2 * variance);
    return Math.exp(exponent) / Math.sqrt(2 * Math.PI * variance);
}

/**
 * Calculate the ODE function g(x) for bird movement
 * g(x) = C * (-N*e^(-l-x)²/2σg² / N√A * Σ(x_j - x)*e^(-(x-x_j)²/2σe²))
 */
function calculateMovement(
    positions: number[],
    index: number,
    resourceMean: number,
    resourceVariance: number,
    adaptationRate: number,
    bifurcationParam: number
): number {
    const currentPosition = positions[index];
    const N = positions.length;
    
    // Resource availability term
    const resourceTerm = resourceDistribution(currentPosition, resourceMean, resourceVariance);
    
    // Competition term (sum of interactions with other birds)
    let competitionSum = 0;
    for (let j = 0; j < N; j++) {
        if (j !== index) {
            const positionDiff = positions[j] - currentPosition;
            competitionSum += positionDiff * feedingEfficiency(currentPosition, positions[j]);
        }
    }
    
    // Scale by bifurcation parameter
    competitionSum *= bifurcationParam;
    
    // Final movement equation
    return adaptationRate * (resourceTerm * competitionSum);
}

/**
 * Run a single iteration of the simulation
 */
function iterateSimulation(
    positions: number[],
    resourceMean: number,
    resourceVariance: number,
    adaptationRate: number,
    bifurcationParam: number,
    timeStep: number = 0.01
): number[] {
    const newPositions = [...positions];
    
    // Update each bird's position
    for (let i = 0; i < positions.length; i++) {
        const movement = calculateMovement(
            positions,
            i,
            resourceMean,
            resourceVariance,
            adaptationRate,
            bifurcationParam
        );
        
        // Apply movement with time step
        newPositions[i] += movement * timeStep;
        
        // Ensure position stays within bounds [0, 1]
        newPositions[i] = Math.max(0, Math.min(1, newPositions[i]));
    }
    
    return newPositions;
}

/**
 * Generate initial positions for birds
 */
function generateInitialPositions(N: number, randomize: boolean = false): number[] {
    const positions = [];
    
    if (randomize) {
        // Random initial positions
        for (let i = 0; i < N; i++) {
            positions.push(Math.random());
        }
    } else {
        // Evenly distributed initial positions
        for (let i = 0; i < N; i++) {
            positions.push(0.5 + (Math.random() * 0.01 - 0.005)); // Small variation around 0.5
        }
    }
    
    return positions;
}

/**
 * Run the BirdSym simulation
 */
export function runBirdSymSimulation(params: BirdSymParameters): SimulationResult {
    const {
        N,
        resourceMean,
        resourceVariance,
        adaptationRate,
        iterations,
        bifurcationParameter,
        initialPositions
    } = params;
    
    // Generate or use provided initial positions
    let positions = initialPositions || generateInitialPositions(N);
    
    // Store position history for bifurcation diagram
    const positionHistory = [positions];
    
    // Run specified number of iterations
    for (let i = 0; i < iterations; i++) {
        positions = iterateSimulation(
            positions,
            resourceMean,
            resourceVariance,
            adaptationRate,
            bifurcationParameter
        );
        
        // Store positions for this iteration
        // Only store every 10th iteration to save memory for long simulations
        if (i % 10 === 0 || i === iterations - 1) {
            positionHistory.push([...positions]);
        }
    }
    
    return {
        positionHistory,
        finalPositions: positions,
        parameters: params
    };
}

/**
 * Generate bifurcation diagram data
 * Runs multiple simulations with different bifurcation parameter values
 */
export function generateBifurcationData(
    baseParams: Omit<BirdSymParameters, 'bifurcationParameter'>,
    bifurcationStart: number,
    bifurcationEnd: number,
    bifurcationSteps: number
): SimulationResult[] {
    const results: SimulationResult[] = [];
    const stepSize = (bifurcationEnd - bifurcationStart) / bifurcationSteps;
    
    for (let i = 0; i <= bifurcationSteps; i++) {
        const bifurcationParameter = bifurcationStart + (i * stepSize);
        
        const result = runBirdSymSimulation({
            ...baseParams,
            bifurcationParameter,
        });
        
        results.push(result);
    }
    
    return results;
}