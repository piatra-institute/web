'use client';

import React, { useMemo, useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

interface ViewerProps {
    generations: number;
    populationSize: number;
    mutationRate: number;
    selectionPressure: number;
    lightIntensity: number;
    environmentComplexity: number;
    predatorPresence: number;
    eyespotThreshold: number;
    pitEyeThreshold: number;
    pinholeThreshold: number;
    lensThreshold: number;
    compoundThreshold: number;
    showPhylogeny: boolean;
    showFitnessLandscape: boolean;
    convergentEvolution: boolean;
    speedMs: number;
}

// Eye types
enum EyeType {
    None = 'None',
    Eyespot = 'Eyespot',
    PitEye = 'Pit Eye',
    PinholeEye = 'Pinhole Eye',
    LensEye = 'Lens Eye',
    CompoundEye = 'Compound Eye'
}

interface Organism {
    id: number;
    eyeType: EyeType;
    fitness: number;
    generation: number;
    lineageId: number;
    parentId?: number;
    visualAcuity: number;
    lightSensitivity: number;
    fieldOfView: number;
    metabolicCost: number;
}

interface LineageData {
    id: number;
    startGeneration: number;
    currentEyeType: EyeType;
    organisms: Organism[];
}

interface ConvergenceEvent {
    generation: number;
    eyeType: EyeType;
    lineages: number[];
    count: number;
}

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

function randn() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

interface MiniChartProps {
    data: any[];
    xKey?: string;
    ySeries?: { key: string; label: string; color?: string }[];
    yDomain?: [number, number];
    height?: number;
    showLegend?: boolean;
    title?: string;
    subtitle?: string;
}

function MiniChart({
    data,
    xKey = "generation",
    ySeries = [{ key: "y", label: "y" }],
    yDomain = [0, 1],
    height = 260,
    showLegend = true,
    title,
    subtitle,
}: MiniChartProps) {
    const ref = useRef<HTMLDivElement>(null);
    const width = 900;
    const hPad = 8;
    const vPad = 12;
    const innerW = width - 2 * hPad;
    const innerH = 220;

    const [yMin, yMax] = yDomain ?? [0, 1];
    const n = Math.max(1, data.length);

    const scaleX = (i: number) => hPad + (i / (n - 1 || 1)) * innerW;
    const scaleY = (y: number) => vPad + (1 - (y - yMin) / (yMax - yMin || 1)) * innerH;

    const gridLines = 5;
    const grid = Array.from({ length: gridLines + 1 }, (_, k) => {
        const y = vPad + (k / gridLines) * innerH;
        const val = yMax - (k / gridLines) * (yMax - yMin);
        return { y, val };
    });

    const colors = ["#84cc16", "#a3e635", "#bef264", "#4ade80", "#22c55e", "#16a34a"];

    const lines = ySeries.map((s, idx) => {
        const pts = data
            .map((row, i) => {
                const xv = scaleX(i);
                const yv = scaleY(typeof row[s.key] === "number" ? row[s.key] : 0);
                return `${xv},${yv}`;
            })
            .join(" ");
        return { pts, color: s.color || colors[idx % colors.length], label: s.label };
    });

    return (
        <div className="w-full" ref={ref}>
            {title && (
                <div className="mb-2">
                    <div className="text-lg font-medium text-white">{title}</div>
                    {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
                </div>
            )}
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-64 bg-black border border-gray-800"
            >
                {grid.map((g, i) => (
                    <g key={i}>
                        <line x1={hPad} x2={hPad + innerW} y1={g.y} y2={g.y} stroke="#374151" strokeDasharray="3 3" />
                        <text x={hPad + innerW + 4} y={g.y + 4} fontSize="10" fill="#9ca3af">
                            {g.val.toFixed(2)}
                        </text>
                    </g>
                ))}

                <line x1={hPad} y1={vPad} x2={hPad} y2={vPad + innerH} stroke="#9ca3af" strokeWidth="1" />
                <line x1={hPad} y1={vPad + innerH} x2={hPad + innerW} y2={vPad + innerH} stroke="#9ca3af" strokeWidth="1" />

                {lines.map((ln, i) => (
                    <polyline key={i} fill="none" stroke={ln.color} strokeWidth="2" points={ln.pts} />
                ))}
            </svg>
            {showLegend && (
                <div className="flex flex-wrap gap-3 mt-2 text-xs">
                    {ySeries.map((s, idx) => (
                        <div key={s.key} className="inline-flex items-center gap-2">
                            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: s.color || colors[idx % colors.length] }} />
                            <span className="text-gray-300">{s.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const Viewer = forwardRef<{ exportCanvas: () => void }, ViewerProps>((props, ref) => {
    const {
        generations,
        populationSize,
        mutationRate,
        selectionPressure,
        lightIntensity,
        environmentComplexity,
        predatorPresence,
        eyespotThreshold,
        pitEyeThreshold,
        pinholeThreshold,
        lensThreshold,
        compoundThreshold,
        showPhylogeny,
        showFitnessLandscape,
        convergentEvolution,
        speedMs
    } = props;

    const [isRunning, setIsRunning] = useState(false);
    const [currentGeneration, setCurrentGeneration] = useState(0);
    const [population, setPopulation] = useState<Organism[]>([]);
    const [lineages, setLineages] = useState<LineageData[]>([]);
    const [convergenceEvents, setConvergenceEvents] = useState<ConvergenceEvent[]>([]);
    const [generationData, setGenerationData] = useState<any[]>([]);
    const [telemetry, setTelemetry] = useState({
        generation: 0,
        avgFitness: 0,
        eyeTypeDiversity: 0,
        convergenceScore: 0,
        dominantEyeType: EyeType.None
    });

    // Calculate fitness based on eye type and environmental factors
    const calculateFitness = (organism: Organism): number => {
        const { eyeType, visualAcuity, lightSensitivity, fieldOfView, metabolicCost } = organism;
        
        let baseFitness = 0;
        
        // Base fitness for each eye type
        switch (eyeType) {
            case EyeType.None:
                baseFitness = 0.1;
                break;
            case EyeType.Eyespot:
                baseFitness = 0.3;
                break;
            case EyeType.PitEye:
                baseFitness = 0.5;
                break;
            case EyeType.PinholeEye:
                baseFitness = 0.7;
                break;
            case EyeType.LensEye:
                baseFitness = 0.85;
                break;
            case EyeType.CompoundEye:
                baseFitness = 0.8;
                break;
        }

        // Environmental modifiers
        const lightBonus = lightIntensity * (lightSensitivity * 0.3);
        const complexityBonus = environmentComplexity * (visualAcuity * 0.4);
        const predatorBonus = predatorPresence * (fieldOfView * 0.3);
        const metabolicPenalty = metabolicCost * 0.2;

        const fitness = clamp(baseFitness + lightBonus + complexityBonus + predatorBonus - metabolicPenalty, 0, 1);
        return fitness;
    };

    // Determine eye type based on organism traits and thresholds
    const determineEyeType = (visualAcuity: number, lightSensitivity: number, fieldOfView: number): EyeType => {
        const compositeScore = (visualAcuity + lightSensitivity + fieldOfView) / 3;
        
        if (compositeScore < eyespotThreshold) return EyeType.None;
        if (compositeScore < pitEyeThreshold) return EyeType.Eyespot;
        if (compositeScore < pinholeThreshold) return EyeType.PitEye;
        if (compositeScore < lensThreshold) return EyeType.PinholeEye;
        if (compositeScore < compoundThreshold) return EyeType.LensEye;
        return EyeType.CompoundEye;
    };

    // Create initial population
    const createInitialPopulation = (): Organism[] => {
        const pop: Organism[] = [];
        for (let i = 0; i < populationSize; i++) {
            const visualAcuity = Math.random() * 0.3; // Start with low traits
            const lightSensitivity = Math.random() * 0.3;
            const fieldOfView = Math.random() * 0.3;
            const eyeType = determineEyeType(visualAcuity, lightSensitivity, fieldOfView);
            
            const organism: Organism = {
                id: i,
                eyeType,
                fitness: 0,
                generation: 0,
                lineageId: i, // Each starts as its own lineage
                visualAcuity,
                lightSensitivity,
                fieldOfView,
                metabolicCost: Math.random() * 0.2
            };
            
            organism.fitness = calculateFitness(organism);
            pop.push(organism);
        }
        return pop;
    };

    // Mutation function
    const mutate = (parent: Organism, newId: number, generation: number): Organism => {
        const mutationStrength = mutationRate * 0.1;
        
        const visualAcuity = clamp(parent.visualAcuity + randn() * mutationStrength, 0, 1);
        const lightSensitivity = clamp(parent.lightSensitivity + randn() * mutationStrength, 0, 1);
        const fieldOfView = clamp(parent.fieldOfView + randn() * mutationStrength, 0, 1);
        const metabolicCost = clamp(parent.metabolicCost + randn() * mutationStrength * 0.5, 0, 1);
        
        const eyeType = determineEyeType(visualAcuity, lightSensitivity, fieldOfView);
        
        const organism: Organism = {
            id: newId,
            eyeType,
            fitness: 0,
            generation,
            lineageId: parent.lineageId,
            parentId: parent.id,
            visualAcuity,
            lightSensitivity,
            fieldOfView,
            metabolicCost
        };
        
        organism.fitness = calculateFitness(organism);
        return organism;
    };

    // Selection function using tournament selection
    const selectParent = (pop: Organism[]): Organism => {
        const tournamentSize = Math.max(2, Math.floor(populationSize * 0.1));
        let best = pop[Math.floor(Math.random() * pop.length)];
        
        for (let i = 1; i < tournamentSize; i++) {
            const competitor = pop[Math.floor(Math.random() * pop.length)];
            if (Math.random() < selectionPressure && competitor.fitness > best.fitness) {
                best = competitor;
            }
        }
        return best;
    };

    // Evolve one generation
    const evolveGeneration = (currentPop: Organism[], generation: number): Organism[] => {
        const newPop: Organism[] = [];
        let newId = currentPop.length > 0 ? Math.max(...currentPop.map(o => o.id)) + 1 : 0;
        
        for (let i = 0; i < populationSize; i++) {
            const parent = selectParent(currentPop);
            const offspring = mutate(parent, newId++, generation);
            newPop.push(offspring);
        }
        
        return newPop;
    };

    // Detect convergent evolution
    const detectConvergence = (pop: Organism[], generation: number): ConvergenceEvent[] => {
        if (!convergentEvolution) return [];
        
        const eyeTypesByLineage = new Map<number, EyeType>();
        const eyeTypeCounts = new Map<EyeType, Set<number>>();
        
        pop.forEach(org => {
            eyeTypesByLineage.set(org.lineageId, org.eyeType);
            if (!eyeTypeCounts.has(org.eyeType)) {
                eyeTypeCounts.set(org.eyeType, new Set());
            }
            eyeTypeCounts.get(org.eyeType)?.add(org.lineageId);
        });
        
        const events: ConvergenceEvent[] = [];
        eyeTypeCounts.forEach((lineageSet, eyeType) => {
            if (lineageSet.size >= 2 && eyeType !== EyeType.None) {
                events.push({
                    generation,
                    eyeType,
                    lineages: Array.from(lineageSet),
                    count: lineageSet.size
                });
            }
        });
        
        return events;
    };

    // Calculate generation statistics
    const calculateGenerationStats = (pop: Organism[], generation: number) => {
        if (pop.length === 0) return;
        
        const avgFitness = pop.reduce((sum, org) => sum + org.fitness, 0) / pop.length;
        const eyeTypes = [...new Set(pop.map(org => org.eyeType))];
        const eyeTypeDiversity = eyeTypes.length / Object.keys(EyeType).length;
        
        // Find dominant eye type
        const eyeTypeCounts = new Map<EyeType, number>();
        pop.forEach(org => {
            eyeTypeCounts.set(org.eyeType, (eyeTypeCounts.get(org.eyeType) || 0) + 1);
        });
        
        let dominantEyeType = EyeType.None;
        let maxCount = 0;
        eyeTypeCounts.forEach((count, eyeType) => {
            if (count > maxCount) {
                maxCount = count;
                dominantEyeType = eyeType;
            }
        });
        
        const convergenceScore = convergenceEvents.length / Math.max(1, generation) * 10;
        
        setTelemetry({
            generation,
            avgFitness,
            eyeTypeDiversity,
            convergenceScore,
            dominantEyeType
        });
        
        // Update generation data for charts
        const eyeTypeProportions = {
            generation,
            None: (eyeTypeCounts.get(EyeType.None) || 0) / pop.length,
            Eyespot: (eyeTypeCounts.get(EyeType.Eyespot) || 0) / pop.length,
            PitEye: (eyeTypeCounts.get(EyeType.PitEye) || 0) / pop.length,
            PinholeEye: (eyeTypeCounts.get(EyeType.PinholeEye) || 0) / pop.length,
            LensEye: (eyeTypeCounts.get(EyeType.LensEye) || 0) / pop.length,
            CompoundEye: (eyeTypeCounts.get(EyeType.CompoundEye) || 0) / pop.length,
            avgFitness,
            diversity: eyeTypeDiversity
        };
        
        setGenerationData(prev => [...prev, eyeTypeProportions]);
    };

    // Initialize simulation
    useEffect(() => {
        if (generationData.length === 0) {
            const initialPop = createInitialPopulation();
            setPopulation(initialPop);
            setCurrentGeneration(0);
            
            // Initialize lineages
            const initialLineages: LineageData[] = initialPop.map(org => ({
                id: org.lineageId,
                startGeneration: 0,
                currentEyeType: org.eyeType,
                organisms: [org]
            }));
            setLineages(initialLineages);
            
            calculateGenerationStats(initialPop, 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Animation loop
    useEffect(() => {
        if (!isRunning) return;
        
        let currentPop = [...population];
        let gen = currentGeneration;
        
        const timer = setInterval(() => {
            if (gen >= generations) {
                clearInterval(timer);
                setIsRunning(false);
                return;
            }
            
            gen += 1;
            currentPop = evolveGeneration(currentPop, gen);
            
            // Detect convergence
            const newConvergence = detectConvergence(currentPop, gen);
            if (newConvergence.length > 0) {
                setConvergenceEvents(prev => [...prev, ...newConvergence]);
            }
            
            calculateGenerationStats(currentPop, gen);
            setPopulation(currentPop);
            setCurrentGeneration(gen);
            
        }, speedMs);
        
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRunning, generations, populationSize, mutationRate, selectionPressure, lightIntensity, environmentComplexity, predatorPresence, eyespotThreshold, pitEyeThreshold, pinholeThreshold, lensThreshold, compoundThreshold, convergentEvolution, speedMs]);

    const [snap, setSnap] = useState({ generation: 0, population: [] as Organism[] });

    function doStepOnce() {
        if (snap.generation >= generations) return;
        const newGen = snap.generation + 1;
        const newPop = evolveGeneration(snap.population.length > 0 ? snap.population : population, newGen);
        
        const newConvergence = detectConvergence(newPop, newGen);
        if (newConvergence.length > 0) {
            setConvergenceEvents(prev => [...prev, ...newConvergence]);
        }
        
        calculateGenerationStats(newPop, newGen);
        setPopulation(newPop);
        setCurrentGeneration(newGen);
        setSnap({ generation: newGen, population: newPop });
    }

    const reset = () => {
        setIsRunning(false);
        setCurrentGeneration(0);
        setPopulation([]);
        setLineages([]);
        setConvergenceEvents([]);
        setGenerationData([]);
        setTelemetry({
            generation: 0,
            avgFitness: 0,
            eyeTypeDiversity: 0,
            convergenceScore: 0,
            dominantEyeType: EyeType.None
        });
        setSnap({ generation: 0, population: [] });
        
        // Reinitialize
        const initialPop = createInitialPopulation();
        setPopulation(initialPop);
        calculateGenerationStats(initialPop, 0);
    };

    useImperativeHandle(ref, () => ({
        exportCanvas: () => {
            console.log("Export not implemented yet");
        }
    }));

    return (
        <div className="w-full p-4 md:p-8 bg-black text-white">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <button
                            className={`px-3 py-2 bg-lime-500 hover:bg-lime-400 disabled:opacity-50 transition-colors`}
                            onClick={() => {
                                reset();
                                setIsRunning(true);
                            }}
                            disabled={isRunning}
                        >
                            Run
                        </button>
                        <button
                            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
                            onClick={() => setIsRunning(false)}
                        >
                            Pause
                        </button>
                        <button
                            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
                            onClick={doStepOnce}
                        >
                            Step
                        </button>
                        <button
                            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
                            onClick={() => {
                                setIsRunning(false);
                                reset();
                            }}
                        >
                            Reset
                        </button>
                    </div>
                </div>

                <div className="border border-gray-800 bg-black p-4">
                    <h2 className="text-lg font-medium mb-2">Live Telemetry</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                        {[
                            { k: "Generation", v: telemetry.generation },
                            { k: "Avg Fitness", v: telemetry.avgFitness.toFixed(3) },
                            { k: "Eye Diversity", v: telemetry.eyeTypeDiversity.toFixed(3) },
                            { k: "Convergence", v: telemetry.convergenceScore.toFixed(3) },
                            { k: "Dominant Type", v: telemetry.dominantEyeType },
                        ].map((x) => (
                            <div key={x.k} className="bg-black border border-gray-800 p-3 flex flex-col items-start">
                                <div className="text-xs uppercase text-gray-400">{x.k}</div>
                                <div className="text-base font-mono">{x.v}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border border-gray-800 bg-black p-4">
                    <MiniChart
                        data={generationData}
                        ySeries={[
                            { key: "None", label: "None", color: "#374151" },
                            { key: "Eyespot", label: "Eyespot", color: "#84cc16" },
                            { key: "PitEye", label: "Pit Eye", color: "#a3e635" },
                            { key: "PinholeEye", label: "Pinhole Eye", color: "#bef264" },
                            { key: "LensEye", label: "Lens Eye", color: "#4ade80" },
                            { key: "CompoundEye", label: "Compound Eye", color: "#22c55e" }
                        ]}
                        yDomain={[0, 1]}
                        title="Eye Type Distribution Over Time"
                        subtitle="Proportion of each eye type in the population across generations"
                    />
                </div>

                <div className="border border-gray-800 bg-black p-4">
                    <MiniChart
                        data={generationData}
                        ySeries={[
                            { key: "avgFitness", label: "Average Fitness" },
                            { key: "diversity", label: "Eye Type Diversity" }
                        ]}
                        yDomain={[0, 1]}
                        title="Population Fitness & Diversity"
                        subtitle="Average fitness and eye type diversity over generations"
                    />
                </div>

                {showFitnessLandscape && (
                    <div className="border border-gray-800 bg-black p-4">
                        <div className="text-lg font-medium text-white mb-2">Fitness Landscape</div>
                        <div className="text-xs text-gray-400 mb-4">
                            Current environmental selection pressures affecting eye evolution
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="bg-gray-900 p-3 rounded">
                                <div className="text-lime-400 font-semibold">Light Intensity</div>
                                <div className="text-2xl font-mono">{lightIntensity.toFixed(2)}</div>
                                <div className="text-gray-400 text-xs">Favors light-sensitive eyes</div>
                            </div>
                            <div className="bg-gray-900 p-3 rounded">
                                <div className="text-lime-400 font-semibold">Environment Complexity</div>
                                <div className="text-2xl font-mono">{environmentComplexity.toFixed(2)}</div>
                                <div className="text-gray-400 text-xs">Favors high-acuity eyes</div>
                            </div>
                            <div className="bg-gray-900 p-3 rounded">
                                <div className="text-lime-400 font-semibold">Predator Presence</div>
                                <div className="text-2xl font-mono">{predatorPresence.toFixed(2)}</div>
                                <div className="text-gray-400 text-xs">Favors wide field of view</div>
                            </div>
                        </div>
                    </div>
                )}

                {convergentEvolution && convergenceEvents.length > 0 && (
                    <div className="border border-gray-800 bg-black p-4">
                        <div className="text-lg font-medium text-white mb-2">Convergent Evolution Events</div>
                        <div className="text-xs text-gray-400 mb-4">
                            Independent evolution of similar eye types in different lineages
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {convergenceEvents.slice(-10).reverse().map((event, idx) => (
                                <div key={idx} className="bg-gray-900 p-2 rounded text-sm">
                                    <span className="text-lime-400">Gen {event.generation}:</span>{' '}
                                    <span className="text-white">{event.eyeType}</span>{' '}
                                    evolved in <span className="text-lime-400">{event.count} lineages</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {showPhylogeny && (
                    <div className="border border-gray-800 bg-black p-4">
                        <div className="text-lg font-medium text-white mb-2">Phylogenetic Analysis</div>
                        <div className="text-xs text-gray-400 mb-4">
                            Current eye type distribution in active lineages
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                            {Object.values(EyeType).map(eyeType => {
                                const count = population.filter(org => org.eyeType === eyeType).length;
                                const proportion = population.length > 0 ? count / population.length : 0;
                                return (
                                    <div key={eyeType} className="bg-gray-900 p-2 rounded">
                                        <div className="text-lime-400 font-semibold text-xs">{eyeType}</div>
                                        <div className="text-lg font-mono">{count}</div>
                                        <div className="text-gray-400 text-xs">{(proportion * 100).toFixed(1)}%</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

Viewer.displayName = 'Viewer';

export default Viewer;