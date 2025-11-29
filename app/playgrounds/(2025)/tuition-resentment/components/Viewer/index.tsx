'use client';

import React, { useMemo, useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

interface ViewerProps {
    tuition: number;
    marketing: number;
    prestige: number;
    gradeLeniency: number;
    qualityInvest: number;
    observedQuality: number;
    powerAsymmetry: number;
    identityInternalization: number;
    socialComparison: number;
    simulationHorizon: number;
    initialReputation: number;
    aidShock: boolean;
    rankingDrop: boolean;
    gradeAudit: boolean;
    qualityProgram: boolean;
}

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

interface MiniChartProps {
    data: any[];
    xKey?: string;
    ySeries?: { key: string; label: string }[];
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
    yDomain = [0, 100],
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

    const [yMin, yMax] = yDomain ?? [0, 100];
    const n = Math.max(1, data.length);

    const scaleX = (i: number) => hPad + (i / (n - 1 || 1)) * innerW;
    const scaleY = (y: number) => vPad + (1 - (y - yMin) / (yMax - yMin || 1)) * innerH;

    const gridLines = 5;
    const grid = Array.from({ length: gridLines + 1 }, (_, k) => {
        const y = vPad + (k / gridLines) * innerH;
        const val = yMax - (k / gridLines) * (yMax - yMin);
        return { y, val };
    });

    const colors = ["#84cc16", "#dc2626", "#2563eb", "#f472b6", "#f59e0b", "#10b981"];

    const lines = ySeries.map((s, idx) => {
        const pts = data
            .map((row, i) => {
                const xv = scaleX(i);
                const yv = scaleY(typeof row[s.key] === "number" ? row[s.key] : 0);
                return `${xv},${yv}`;
            })
            .join(" ");
        return { pts, color: colors[idx % colors.length], label: s.label };
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
                            {g.val.toFixed(0)}
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
                            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: colors[idx % colors.length] }} />
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
        tuition, marketing, prestige, gradeLeniency, qualityInvest, 
        observedQuality, powerAsymmetry, identityInternalization, socialComparison,
        simulationHorizon, initialReputation,
        aidShock, rankingDrop, gradeAudit, qualityProgram 
    } = props;
    
    const [isRunning, setIsRunning] = useState(false);
    const [currentT, setCurrentT] = useState(0);
    const [series, setSeries] = useState<any[]>([]);
    const [telemetry, setTelemetry] = useState({
        t: 0,
        expectation: 0,
        observedQuality: 0,
        dissonance: 0,
        lambda: 0,
        internalResentment: 0,
        externalResentment: 0,
        complaints: 0,
        reputation: initialReputation
    });

    // Model coefficients
    const coefficients = {
        b0: 5,
        b1: 0.0005,
        b2: 0.5,
        b3: 0.5,
        b4: 0.6,
        theta0: -5,
        theta1: 0.05,
        theta2: 0.05,
        theta3: 0.04,
        gammaG: 0.35,
        rho: 0.90,
        psi1: 0.15,
        psi2: 8.0,
        psi4: 6.0,
        gradePenaltyThreshold: 65,
    };

    const calculateStep = (t: number, reputation: number) => {
        // Apply scenarios
        const currentTuition = (aidShock && t >= 4) ? tuition * 0.8 : tuition;
        const currentPrestige = prestige + (rankingDrop && t === 6 ? -20 : 0);
        const currentQualityInvest = (qualityProgram && t >= 5) ? 
            clamp(qualityInvest + 15, 0, 100) : qualityInvest;
        
        // Calculate expectation
        const expectation = clamp(
            coefficients.b0 + 
            coefficients.b1 * currentTuition + 
            coefficients.b2 * marketing + 
            coefficients.b3 * currentPrestige + 
            coefficients.b4 * reputation,
            0, 100
        );
        
        // Calculate true and observed quality
        const trueQuality = clamp(50 + 0.5 * currentQualityInvest, 0, 100);
        const qualityWithGrades = clamp(trueQuality + coefficients.gammaG * gradeLeniency, 0, 100);
        
        // Calculate dissonance
        const dissonanceRaw = expectation - qualityWithGrades;
        const dissonance = Math.max(0, dissonanceRaw);
        
        // Calculate attribution (lambda)
        const lambda = sigmoid(
            coefficients.theta0 + 
            coefficients.theta1 * powerAsymmetry + 
            coefficients.theta2 * identityInternalization + 
            coefficients.theta3 * socialComparison
        );
        
        // Calculate resentments
        const internalResentment = lambda * dissonance;
        const externalResentment = (1 - lambda) * dissonance;
        
        // Calculate complaints
        const complaints = sigmoid(-2.0 + 0.08 * externalResentment - 0.05 * powerAsymmetry) * 100;
        
        // Calculate reputation for next period
        const penalty = (gradeAudit && gradeLeniency > coefficients.gradePenaltyThreshold) ? 
            (gradeLeniency - coefficients.gradePenaltyThreshold) / 5 : 0;
        const placement = 0.1 * (trueQuality - 50);
        const nextReputation = clamp(
            coefficients.rho * reputation + 
            coefficients.psi1 * (trueQuality - 50) - 
            coefficients.psi2 * (complaints / 100) - 
            coefficients.psi4 * penalty + 
            placement,
            0, 100
        );
        
        return {
            t,
            tuition: currentTuition,
            expectation,
            trueQuality,
            observedQuality: qualityWithGrades,
            dissonance,
            lambda,
            internalResentment,
            externalResentment,
            complaints,
            reputation,
            nextReputation,
            penalty,
        };
    };

    // Initialize simulation
    useEffect(() => {
        const initialData = calculateStep(0, initialReputation);
        setSeries([initialData]);
        setTelemetry({
            t: 0,
            expectation: initialData.expectation,
            observedQuality: initialData.observedQuality,
            dissonance: initialData.dissonance,
            lambda: initialData.lambda,
            internalResentment: initialData.internalResentment,
            externalResentment: initialData.externalResentment,
            complaints: initialData.complaints,
            reputation: initialData.reputation
        });
        setCurrentT(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Animation loop
    useEffect(() => {
        if (!isRunning) return;
        
        let reputation = series[series.length - 1]?.nextReputation || initialReputation;
        let t = currentT;
        let newSeries = [...series];
        
        const timer = setInterval(() => {
            if (t >= simulationHorizon - 1) {
                setIsRunning(false);
                return;
            }
            
            t++;
            const stepData = calculateStep(t, reputation);
            newSeries.push(stepData);
            reputation = stepData.nextReputation;
            
            setSeries([...newSeries]);
            setCurrentT(t);
            setTelemetry({
                t,
                expectation: stepData.expectation,
                observedQuality: stepData.observedQuality,
                dissonance: stepData.dissonance,
                lambda: stepData.lambda,
                internalResentment: stepData.internalResentment,
                externalResentment: stepData.externalResentment,
                complaints: stepData.complaints,
                reputation: stepData.reputation
            });
            
        }, 100);
        
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRunning]);

    const reset = () => {
        setIsRunning(false);
        setCurrentT(0);
        const initialData = calculateStep(0, initialReputation);
        setSeries([initialData]);
        setTelemetry({
            t: 0,
            expectation: initialData.expectation,
            observedQuality: initialData.observedQuality,
            dissonance: initialData.dissonance,
            lambda: initialData.lambda,
            internalResentment: initialData.internalResentment,
            externalResentment: initialData.externalResentment,
            complaints: initialData.complaints,
            reputation: initialData.reputation
        });
    };

    const step = () => {
        if (currentT >= simulationHorizon - 1) return;
        
        const reputation = series[series.length - 1]?.nextReputation || initialReputation;
        const newT = currentT + 1;
        const stepData = calculateStep(newT, reputation);
        
        setSeries([...series, stepData]);
        setCurrentT(newT);
        setTelemetry({
            t: newT,
            expectation: stepData.expectation,
            observedQuality: stepData.observedQuality,
            dissonance: stepData.dissonance,
            lambda: stepData.lambda,
            internalResentment: stepData.internalResentment,
            externalResentment: stepData.externalResentment,
            complaints: stepData.complaints,
            reputation: stepData.reputation
        });
    };

    useImperativeHandle(ref, () => ({
        exportCanvas: () => {
            const dataStr = JSON.stringify(series, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            const exportFileDefaultName = 'tuition-resentment-data.json';
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
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
                            onClick={step}
                        >
                            Step
                        </button>
                        <button
                            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
                            onClick={reset}
                        >
                            Reset
                        </button>
                    </div>
                </div>

                <div className="border border-gray-800 bg-black p-4">
                    <h2 className="text-lg font-medium mb-2">Live Metrics</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {[
                            { k: "Time", v: `${telemetry.t}/${simulationHorizon - 1}` },
                            { k: "Expectation", v: telemetry.expectation.toFixed(1) },
                            { k: "Quality", v: telemetry.observedQuality.toFixed(1) },
                            { k: "Dissonance", v: telemetry.dissonance.toFixed(1) },
                            { k: "λ (Attribution)", v: telemetry.lambda.toFixed(3) },
                            { k: "Self-Resentment", v: telemetry.internalResentment.toFixed(1) },
                            { k: "Inst-Resentment", v: telemetry.externalResentment.toFixed(1) },
                            { k: "Complaints %", v: telemetry.complaints.toFixed(1) },
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
                        data={series}
                        ySeries={[
                            { key: "expectation", label: "Expectation" },
                            { key: "observedQuality", label: "Observed Quality" },
                            { key: "trueQuality", label: "True Quality" },
                        ]}
                        yDomain={[0, 100]}
                        title="Expectation vs Quality"
                        subtitle="Dissonance = max(0, Expectation - Observed Quality). True quality is hidden from students."
                    />
                </div>

                <div className="border border-gray-800 bg-black p-4">
                    <MiniChart
                        data={series}
                        ySeries={[
                            { key: "internalResentment", label: "Self-Resentment" },
                            { key: "externalResentment", label: "Institutional Resentment" },
                        ]}
                        yDomain={[0, 50]}
                        title="Resentment Dynamics"
                        subtitle="λ determines the split: high λ → self-blame, low λ → institutional blame"
                    />
                </div>

                <div className="border border-gray-800 bg-black p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MiniChart
                            data={series}
                            ySeries={[
                                { key: "complaints", label: "Complaints %" },
                            ]}
                            yDomain={[0, 100]}
                            title="Student Complaints"
                            subtitle="Function of external resentment, suppressed by power asymmetry"
                        />
                        <MiniChart
                            data={series}
                            ySeries={[
                                { key: "reputation", label: "Reputation" },
                            ]}
                            yDomain={[0, 100]}
                            title="Institutional Reputation"
                            subtitle="Evolves based on quality, complaints, and grade penalties"
                        />
                    </div>
                </div>

                <div className="border border-gray-800 bg-black p-4">
                    <h2 className="text-lg font-medium mb-2">Attribution Visualization</h2>
                    <div className="mb-4 p-4 bg-gray-900 rounded">
                        <div className="text-sm text-gray-400 mb-2">Attribution Split (λ = {telemetry.lambda.toFixed(3)})</div>
                        <div className="flex h-12 rounded overflow-hidden border border-gray-700">
                            <div 
                                className="bg-red-600 flex items-center justify-center text-white font-mono text-sm transition-all duration-300"
                                style={{ width: `${telemetry.lambda * 100}%` }}
                            >
                                {telemetry.lambda > 0.1 && `Self ${(telemetry.lambda * 100).toFixed(0)}%`}
                            </div>
                            <div 
                                className="bg-blue-600 flex items-center justify-center text-white font-mono text-sm transition-all duration-300"
                                style={{ width: `${(1 - telemetry.lambda) * 100}%` }}
                            >
                                {(1 - telemetry.lambda) > 0.1 && `Inst ${((1 - telemetry.lambda) * 100).toFixed(0)}%`}
                            </div>
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                            When dissonance occurs, λ determines whether students blame themselves (red) or the institution (blue)
                        </div>
                    </div>
                </div>

                {(aidShock || rankingDrop || qualityProgram) && (
                    <div className="border border-gray-800 bg-black p-4">
                        <h2 className="text-lg font-medium mb-2">Active Scenarios</h2>
                        <div className="flex flex-wrap gap-2">
                            {aidShock && (
                                <div className="px-3 py-1 bg-lime-900 text-lime-300 rounded text-sm">
                                    Aid Shock {currentT >= 4 ? "(Active)" : "(Pending t=4)"}
                                </div>
                            )}
                            {rankingDrop && (
                                <div className="px-3 py-1 bg-orange-900 text-orange-300 rounded text-sm">
                                    Ranking Drop {currentT === 6 ? "(Active)" : currentT > 6 ? "(Applied)" : "(Pending t=6)"}
                                </div>
                            )}
                            {qualityProgram && (
                                <div className="px-3 py-1 bg-blue-900 text-blue-300 rounded text-sm">
                                    Quality Program {currentT >= 5 ? "(Active)" : "(Pending t=5)"}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

Viewer.displayName = 'Viewer';

export default Viewer;