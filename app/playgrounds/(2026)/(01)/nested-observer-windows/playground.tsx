'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import PlaygroundLayout from '@/components/PlaygroundLayout';
import Equation from '@/components/Equation';

import Settings from './components/Settings';
import Viewer from './components/Viewer';

import {
    type SimulationParams,
    type StructureParams,
    type SimulationState,
    type Metrics,
    type TimeSeriesPoint,
    DEFAULT_PARAMS,
    DEFAULT_STRUCTURE,
    createInitialState,
    stepSimulation,
} from './logic';

export default function Playground() {
    const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
    const [structure, setStructure] = useState<StructureParams>(DEFAULT_STRUCTURE);
    const [state, setState] = useState<SimulationState>(() => createInitialState(DEFAULT_STRUCTURE));
    const [metrics, setMetrics] = useState<Metrics>({
        syncByLevel: [],
        cohByLevel: [],
        cfc: 0,
        reportStability: 0,
    });
    const [series, setSeries] = useState<TimeSeriesPoint[]>([]);
    const [running, setRunning] = useState(false);
    const [showTimeSeries, setShowTimeSeries] = useState(true);

    const t0Ref = useRef<number>(performance.now());
    const lastTickRef = useRef<number>(performance.now());

    const reset = useCallback(() => {
        setRunning(false);
        t0Ref.current = performance.now();
        lastTickRef.current = performance.now();
        setState(createInitialState(structure));
        setSeries([]);
        setMetrics({
            syncByLevel: [],
            cohByLevel: [],
            cfc: 0,
            reportStability: 0,
        });
    }, [structure]);

    // Reset simulation when structure changes
    const structureKeyRef = useRef(`${structure.numLevels}-${structure.windowsPerLevel}-${structure.oscillatorsPerWindow}`);
    useEffect(() => {
        const newKey = `${structure.numLevels}-${structure.windowsPerLevel}-${structure.oscillatorsPerWindow}`;
        if (structureKeyRef.current !== newKey) {
            structureKeyRef.current = newKey;
            reset();
        }
    }, [structure.numLevels, structure.windowsPerLevel, structure.oscillatorsPerWindow, reset]);

    useEffect(() => {
        if (!running) return;

        const intervalId = setInterval(() => {
            const tNow = performance.now();
            const dt = Math.min(0.08, (tNow - lastTickRef.current) / 1000);
            lastTickRef.current = tNow;

            setState(prevState => {
                const { state: newState, metrics: newMetrics } = stepSimulation(prevState, params, dt);
                setMetrics(newMetrics);

                // Update time series
                const elapsed = (tNow - t0Ref.current) / 1000;
                const syncByLevel = newMetrics.syncByLevel;
                const cohByLevel = newMetrics.cohByLevel;
                const syncApex = syncByLevel[0] || 0;
                const syncAvg = syncByLevel.length > 0
                    ? syncByLevel.reduce((a, b) => a + b, 0) / syncByLevel.length
                    : 0;
                const cohAvg = cohByLevel.length > 0
                    ? cohByLevel.reduce((a, b) => a + b, 0) / cohByLevel.length
                    : 0;

                setSeries(prev => {
                    const point: TimeSeriesPoint = {
                        t: Math.round(elapsed * 10) / 10,
                        syncApex,
                        syncAvg,
                        cohAvg,
                        cfc: newMetrics.cfc,
                        reportStability: newMetrics.reportStability,
                    };
                    const next = [...prev, point];
                    const cutoff = elapsed - 45;
                    return next.filter(p => p.t >= cutoff);
                });

                return newState;
            });
        }, 60);

        return () => clearInterval(intervalId);
    }, [running, params]);

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
        },
        {
            id: 'canvas',
            type: 'canvas' as const,
            content: (
                <Viewer
                    state={state}
                    metrics={metrics}
                    series={series}
                    showTimeSeries={showTimeSeries}
                />
            ),
        },
        {
            id: 'outro',
            type: 'outro' as const,
            content: (
                <div className="space-y-8">
                    <h2 className="text-lime-400 text-xl font-semibold">
                        Nested Observer Windows (NOW)
                    </h2>

                    <p className="text-gray-300">
                        The <strong className="text-lime-400">NOW model</strong> (Riddle & Schooler, 2024)
                        proposes that consciousness is a hierarchy of observer windows, systems that
                        integrate information within spatial and temporal bounds, nested across
                        multiple brain scales with a unitary experience at the apex.
                    </p>

                    <h3 className="text-lime-400 font-semibold mt-8">The Three Signature Mechanisms</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="border border-lime-500/30 p-4 space-y-3">
                            <h4 className="text-lime-400 font-semibold">Synchrony</h4>
                            <p className="text-sm text-gray-400">
                                Zero phase lag within a window. Elements align in phase to form a
                                coherent observer window. Measured by the Kuramoto order parameter.
                            </p>
                        </div>

                        <div className="border border-lime-500/30 p-4 space-y-3">
                            <h4 className="text-lime-400 font-semibold">Coherence</h4>
                            <p className="text-sm text-gray-400">
                                Non-zero phase lag between peer windows. Enables communication within
                                the same level through stable phase relations with delays.
                            </p>
                        </div>

                        <div className="border border-lime-500/30 p-4 space-y-3">
                            <h4 className="text-lime-400 font-semibold">Cross-frequency coupling</h4>
                            <p className="text-sm text-gray-400">
                                Communication across scales. Low-frequency phase at higher levels
                                couples to higher-frequency amplitude at lower levels (PAC).
                            </p>
                        </div>
                    </div>

                    <h3 className="text-lime-400 font-semibold mt-8">The Mosaic Metaphor</h3>

                    <p className="text-gray-300">
                        Schooler describes consciousness as a <strong className="text-lime-200">mosaic photograph</strong>:
                        every pixel is itself a photograph. This represents a fractal system of
                        windows nested in windows. The <strong className="text-lime-200">Apex Window</strong> is
                        the top-level integrator that what we typically call I or my consciousness.
                    </p>

                    <h3 className="text-lime-400 font-semibold mt-8">Signal-Level Formalization</h3>

                    <div className="space-y-4 text-gray-300">
                        <p>
                            The <strong className="text-lime-200">Kuramoto order parameter</strong> measures
                            phase synchrony within a group of oscillators:
                        </p>
                        <Equation
                            mode="block"
                            math="r = \left| \frac{1}{N} \sum_{j=1}^{N} e^{i\theta_j} \right|"
                        />
                        <p>
                            Where <Equation math="r = 1" /> indicates perfect synchrony (all phases aligned)
                            and <Equation math="r = 0" /> indicates uniform phase distribution.
                        </p>
                    </div>

                    <h3 className="text-lime-400 font-semibold mt-8">Testable Predictions</h3>

                    <ul className="list-disc pl-5 space-y-2 text-gray-400">
                        <li>
                            <strong className="text-lime-200">Window identification:</strong> Observer windows
                            should be recoverable as high internal synchrony ensembles that reconfigure
                            with task demands.
                        </li>
                        <li>
                            <strong className="text-lime-200">Vertical information flow:</strong> Changes in
                            conscious access (sleep onset, anesthesia) should show structured degradation
                            of cross-frequency coupling across levels.
                        </li>
                        <li>
                            <strong className="text-lime-200">Horizontal dialogue:</strong> Competing
                            interpretations should show coherence patterns consistent with lateral
                            negotiation among same-level windows.
                        </li>
                    </ul>

                    <h3 className="text-lime-400 font-semibold mt-8">What to Try</h3>

                    <ul className="list-disc pl-5 space-y-2 text-gray-400">
                        <li>
                            Set <Equation math="\text{noise}" /> high and observe how synchrony degrades.
                        </li>
                        <li>
                            Increase <Equation math="\text{within-synchrony}" /> to see windows become more coherent.
                        </li>
                        <li>
                            Adjust <Equation math="\text{cross-frequency coupling}" /> to see how parent-child
                            modulation affects report stability.
                        </li>
                        <li>
                            Watch how all three mechanisms must work together for stable apex report.
                        </li>
                    </ul>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="nested observer windows"
            subtitle="Multi-scale oscillator coupling for hierarchical consciousness"
            description={
                <a
                    href="https://academic.oup.com/nc/article/2024/1/niae010/7631826"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-lime-400"
                >
                    Riddle & Schooler (2024)
                </a>
            }
            sections={sections}
            settings={
                <Settings
                    params={params}
                    onParamsChange={setParams}
                    structure={structure}
                    onStructureChange={setStructure}
                    metrics={metrics}
                    running={running}
                    onRunningChange={setRunning}
                    onReset={reset}
                    showTimeSeries={showTimeSeries}
                    onShowTimeSeriesChange={setShowTimeSeries}
                />
            }
        />
    );
}
