'use client';

import React, { useMemo, useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

interface ViewerProps {
    duration: number;
    speedMs: number;
    pacemakerRate: number;
    pacemakerNoise: number;
    pacemakerAdaptation: number;
    accumulatorThreshold: number;
    accumulatorDecay: number;
    accumulatorNoise: number;
    fastPacemaker: number;
    slowPacemaker: number;
    scaleInteraction: number;
    targetInterval: number;
    intervalVariability: number;
    neuralNoise: number;
    refractoryPeriod: number;
}

// Utility functions
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
    xKey = "t",
    ySeries = [{ key: "y", label: "y" }],
    yDomain = [0, 1],
    height = 260,
    showLegend = true,
    title,
    subtitle,
}: MiniChartProps) {
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

    const defaultColors = ["#84cc16", "#a3e635", "#bef264", "#4ade80", "#22c55e", "#16a34a"];

    const lines = ySeries.map((s, idx) => {
        const pts = data
            .map((row, i) => {
                const xv = scaleX(i);
                const yv = scaleY(typeof row[s.key] === "number" ? row[s.key] : 0);
                return `${xv},${yv}`;
            })
            .join(" ");
        return { 
            pts, 
            color: s.color || defaultColors[idx % defaultColors.length], 
            label: s.label 
        };
    });

    return (
        <div className="w-full flex justify-center mb-6">
            <div className="bg-black border border-gray-800 p-4" style={{ width: width + 16 }}>
                {(title || subtitle) && (
                    <div className="mb-3">
                        {title && <h3 className="text-sm font-semibold text-lime-400 mb-1">{title}</h3>}
                        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
                    </div>
                )}
                
                <svg width={width} height={height} className="overflow-visible">
                    {/* Grid lines */}
                    {grid.map((g, i) => (
                        <g key={i}>
                            <line
                                x1={hPad}
                                y1={g.y}
                                x2={width - hPad}
                                y2={g.y}
                                stroke="#374151"
                                strokeWidth={0.5}
                                strokeDasharray="2,2"
                            />
                            <text
                                x={hPad - 4}
                                y={g.y + 3}
                                fill="#9CA3AF"
                                fontSize="10"
                                textAnchor="end"
                            >
                                {g.val.toFixed(1)}
                            </text>
                        </g>
                    ))}

                    {/* Data lines */}
                    {lines.map((line, i) => (
                        <polyline
                            key={i}
                            points={line.pts}
                            fill="none"
                            stroke={line.color}
                            strokeWidth={1.5}
                        />
                    ))}

                    {/* Axes */}
                    <line
                        x1={hPad}
                        y1={vPad}
                        x2={hPad}
                        y2={vPad + innerH}
                        stroke="#9CA3AF"
                        strokeWidth={1}
                    />
                    <line
                        x1={hPad}
                        y1={vPad + innerH}
                        x2={width - hPad}
                        y2={vPad + innerH}
                        stroke="#9CA3AF"
                        strokeWidth={1}
                    />
                </svg>

                {showLegend && lines.length > 1 && (
                    <div className="mt-2 flex flex-wrap gap-4 text-xs">
                        {lines.map((line, i) => (
                            <div key={i} className="flex items-center gap-1">
                                <div
                                    className="w-3 h-0.5"
                                    style={{ backgroundColor: line.color }}
                                ></div>
                                <span className="text-gray-300">{line.label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const Viewer = forwardRef<{ exportCanvas: () => void }, ViewerProps>((props, ref) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [simulationData, setSimulationData] = useState<any[]>([]);
    const intervalRef = useRef<NodeJS.Timeout>();

    // Simulation state
    const [accumulatorValue, setAccumulatorValue] = useState(0);
    const [thresholdCrossings, setThresholdCrossings] = useState<number[]>([]);
    const [lastPulseTime, setLastPulseTime] = useState(0);
    const [adaptedRate, setAdaptedRate] = useState(props.pacemakerRate);

    useImperativeHandle(ref, () => ({
        exportCanvas: () => {
            console.log('Exporting pacemaker-accumulator data:', simulationData);
        }
    }));

    // Generate pacemaker pulse based on multiple factors
    const generatePulse = (
        t: number,
        baseRate: number,
        noise: number,
        adaptation: number,
        fastRate: number,
        slowRate: number,
        interaction: number,
        refractoryMs: number,
        lastPulse: number
    ) => {
        // Check refractory period
        if (t - lastPulse < refractoryMs / 1000) {
            return { pulse: false, newRate: baseRate, pulseStrength: 0 };
        }

        // Adaptation: rate changes over time
        const adaptedRate = baseRate * (1 - adaptation * Math.sin(t * 0.1));

        // Multiple timescales interaction
        const fastOscillation = Math.sin(2 * Math.PI * fastRate * t);
        const slowOscillation = Math.sin(2 * Math.PI * slowRate * t);
        const crossFrequencyModulation = 1 + interaction * fastOscillation * slowOscillation;

        // Base probability with Weber's law noise
        const effectiveRate = adaptedRate * crossFrequencyModulation;
        const noisyRate = effectiveRate * (1 + noise * randn());
        const dt = 1/60; // 60 FPS simulation
        const pulseProb = Math.max(0, noisyRate * dt);

        // Poisson process for pulse generation
        const pulse = Math.random() < pulseProb;
        const pulseStrength = pulse ? (1 + 0.3 * randn()) : 0;

        return { pulse, newRate: effectiveRate, pulseStrength: Math.max(0, pulseStrength) };
    };

    // Reset simulation
    const resetSimulation = () => {
        setCurrentTime(0);
        setAccumulatorValue(0);
        setThresholdCrossings([]);
        setLastPulseTime(0);
        setAdaptedRate(props.pacemakerRate);
        setSimulationData([]);
        setIsRunning(false);
    };

    // Start/stop simulation
    const toggleSimulation = () => {
        if (isRunning) {
            setIsRunning(false);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        } else {
            setIsRunning(true);
        }
    };

    // Main simulation loop
    useEffect(() => {
        if (isRunning && currentTime < props.duration) {
            intervalRef.current = setInterval(() => {
                setCurrentTime(t => {
                    const newTime = t + 1/60; // 60 FPS simulation
                    
                    if (newTime >= props.duration) {
                        setIsRunning(false);
                        return props.duration;
                    }

                    // Generate pacemaker pulse
                    const pulseResult = generatePulse(
                        newTime,
                        props.pacemakerRate,
                        props.pacemakerNoise,
                        props.pacemakerAdaptation,
                        props.fastPacemaker,
                        props.slowPacemaker,
                        props.scaleInteraction,
                        props.refractoryPeriod,
                        lastPulseTime
                    );

                    // Update accumulator
                    setAccumulatorValue(acc => {
                        let newAcc = acc;
                        
                        // Add pulse if generated
                        if (pulseResult.pulse) {
                            newAcc += pulseResult.pulseStrength;
                            setLastPulseTime(newTime);
                        }

                        // Leaky integration
                        newAcc *= (1 - props.accumulatorDecay);

                        // Add integration noise
                        newAcc += props.accumulatorNoise * randn() / 60;

                        // Background neural noise
                        newAcc += props.neuralNoise * randn() / 60;

                        newAcc = Math.max(0, newAcc);

                        // Check threshold crossing
                        if (newAcc >= props.accumulatorThreshold && acc < props.accumulatorThreshold) {
                            setThresholdCrossings(prev => [...prev, newTime]);
                            // Reset accumulator after threshold crossing (biological realism)
                            newAcc = 0;
                        }

                        return newAcc;
                    });

                    setAdaptedRate(pulseResult.newRate);

                    // Record data point
                    setSimulationData(prev => [...prev, {
                        t: newTime,
                        accumulator: accumulatorValue,
                        pacemakerRate: pulseResult.newRate,
                        pulse: pulseResult.pulse ? pulseResult.pulseStrength : 0,
                        fastOscillation: Math.sin(2 * Math.PI * props.fastPacemaker * newTime),
                        slowOscillation: Math.sin(2 * Math.PI * props.slowPacemaker * newTime),
                        threshold: props.accumulatorThreshold,
                        intervalEstimate: thresholdCrossings.length > 0 ? 
                            newTime - thresholdCrossings[thresholdCrossings.length - 1] : 0
                    }]);

                    return newTime;
                });
            }, props.speedMs);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, currentTime, props, lastPulseTime, accumulatorValue, thresholdCrossings]);

    // Calculate timing statistics
    const timingStats = useMemo(() => {
        if (thresholdCrossings.length < 2) return null;

        const intervals = [];
        for (let i = 1; i < thresholdCrossings.length; i++) {
            intervals.push(thresholdCrossings[i] - thresholdCrossings[i-1]);
        }

        const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((a, b) => a + (b - mean) ** 2, 0) / intervals.length;
        const cv = Math.sqrt(variance) / mean; // Coefficient of variation (Weber fraction)

        return {
            meanInterval: mean,
            stdInterval: Math.sqrt(variance),
            coefficientOfVariation: cv,
            totalCrossings: thresholdCrossings.length,
            targetError: Math.abs(mean - props.targetInterval) / props.targetInterval
        };
    }, [thresholdCrossings, props.targetInterval]);

    // Reset when parameters change
    useEffect(() => {
        resetSimulation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.pacemakerRate, props.accumulatorThreshold, props.duration]);

    return (
        <div className="space-y-6">
            {/* Control Panel */}
            <div className="flex justify-center gap-4 mb-6">
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

            {/* Current Status */}
            <div className="bg-black border border-gray-800 p-4 text-center">
                <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                        <div className="text-lime-400 font-semibold">Time</div>
                        <div className="text-white">{currentTime.toFixed(2)}s</div>
                    </div>
                    <div>
                        <div className="text-lime-400 font-semibold">Accumulator</div>
                        <div className="text-white">{accumulatorValue.toFixed(1)}</div>
                    </div>
                    <div>
                        <div className="text-lime-400 font-semibold">Rate</div>
                        <div className="text-white">{adaptedRate.toFixed(1)} Hz</div>
                    </div>
                    <div>
                        <div className="text-lime-400 font-semibold">Crossings</div>
                        <div className="text-white">{thresholdCrossings.length}</div>
                    </div>
                </div>
            </div>

            {/* Timing Statistics */}
            {timingStats && (
                <div className="bg-black border border-gray-800 p-4">
                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Timing Performance</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-400">Mean Interval:</span>
                            <span className="text-white ml-2">{timingStats.meanInterval.toFixed(2)}s</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Target Interval:</span>
                            <span className="text-white ml-2">{props.targetInterval.toFixed(2)}s</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Timing Error:</span>
                            <span className="text-white ml-2">{(timingStats.targetError * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Weber Fraction:</span>
                            <span className="text-white ml-2">{timingStats.coefficientOfVariation.toFixed(3)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Visualizations */}
            {simulationData.length > 10 && (
                <>
                    <MiniChart
                        title="Pacemaker-Accumulator Dynamics"
                        subtitle="Core mechanism showing pacemaker pulses driving accumulator integration"
                        data={simulationData}
                        ySeries={[
                            { key: "accumulator", label: "Accumulator", color: "#84cc16" },
                            { key: "threshold", label: "Threshold", color: "#ef4444" },
                            { key: "pulse", label: "Pulses (scaled)", color: "#a3e635" }
                        ]}
                        yDomain={[0, Math.max(props.accumulatorThreshold * 1.2, 50)]}
                        showLegend={true}
                    />

                    <MiniChart
                        title="Multiple Timescales"
                        subtitle="Fast and slow pacemaker populations with cross-frequency coupling"
                        data={simulationData}
                        ySeries={[
                            { key: "fastOscillation", label: `Fast (${props.fastPacemaker} Hz)`, color: "#22c55e" },
                            { key: "slowOscillation", label: `Slow (${props.slowPacemaker} Hz)`, color: "#4ade80" },
                            { key: "pacemakerRate", label: "Effective Rate", color: "#84cc16" }
                        ]}
                        yDomain={[-2, Math.max(props.pacemakerRate * 1.5, 10)]}
                        showLegend={true}
                    />

                    {thresholdCrossings.length > 1 && (
                        <MiniChart
                            title="Interval Timing Precision"
                            subtitle="Estimated intervals vs target showing Weber's law in action"
                            data={simulationData.filter(d => d.intervalEstimate > 0)}
                            ySeries={[
                                { key: "intervalEstimate", label: "Estimated Interval", color: "#84cc16" }
                            ]}
                            yDomain={[0, props.targetInterval * 2]}
                            showLegend={false}
                        />
                    )}
                </>
            )}

            {/* Information Panel */}
            <div className="bg-black border border-gray-800 p-6 text-gray-300 font-serif text-sm leading-relaxed">
                <h3 className="text-lg font-semibold text-lime-400 mb-4">Neuroscience of Timing</h3>
                <div className="space-y-4">
                    <p>
                        This simulation implements the <strong>pacemaker-accumulator model</strong> of interval timing,
                        based on research by Stanislas Dehaene and others in cognitive neuroscience.
                    </p>
                    <p>
                        <strong>Key Mechanisms:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>Pacemaker:</strong> Regular neural oscillations generate timing pulses</li>
                        <li><strong>Accumulator:</strong> Integrates pulses with leaky integration and noise</li>
                        <li><strong>Threshold:</strong> Decision boundary triggers timing responses</li>
                        <li><strong>Weber&apos;s Law:</strong> Timing variability scales with interval duration</li>
                        <li><strong>Multiple Scales:</strong> Fast and slow oscillations interact via coupling</li>
                    </ul>
                    <p>
                        The model captures how biological systems achieve precise timing despite noisy neural components,
                        and explains phenomena like the scalar property of interval timing found across species.
                    </p>
                </div>
            </div>
        </div>
    );
});

Viewer.displayName = 'PacemakerAccumulatorViewer';

export default Viewer;