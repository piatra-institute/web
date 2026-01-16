'use client';

import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';

import type { SimulationParams, StructureParams, Metrics } from '../../logic';
import { DEFAULT_PARAMS, DEFAULT_STRUCTURE, fmtPct, getLevelName } from '../../logic';

interface SettingsProps {
    params: SimulationParams;
    onParamsChange: (params: SimulationParams) => void;
    structure: StructureParams;
    onStructureChange: (structure: StructureParams) => void;
    metrics: Metrics;
    running: boolean;
    onRunningChange: (running: boolean) => void;
    onReset: () => void;
    showTimeSeries: boolean;
    onShowTimeSeriesChange: (show: boolean) => void;
}

export default function Settings({
    params,
    onParamsChange,
    structure,
    onStructureChange,
    metrics,
    running,
    onRunningChange,
    onReset,
    showTimeSeries,
    onShowTimeSeriesChange,
}: SettingsProps) {
    const updateParam = <K extends keyof SimulationParams>(
        key: K,
        value: SimulationParams[K]
    ) => {
        onParamsChange({ ...params, [key]: value });
    };

    const updateStructure = <K extends keyof StructureParams>(
        key: K,
        value: StructureParams[K]
    ) => {
        onStructureChange({ ...structure, [key]: value });
    };

    const resetToDefaults = () => {
        onParamsChange(DEFAULT_PARAMS);
        onStructureChange(DEFAULT_STRUCTURE);
        onReset();
    };

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex gap-2">
                <Button
                    label={running ? 'Pause' : 'Start'}
                    onClick={() => onRunningChange(!running)}
                    size="sm"
                />
                <Button label="Reset" onClick={resetToDefaults} size="sm" />
            </div>

            {/* Structure */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Structure</h3>
                <SliderInput
                    label="Levels"
                    min={2}
                    max={6}
                    step={1}
                    value={structure.numLevels}
                    onChange={(v) => updateStructure('numLevels', Math.round(v))}
                />
                <SliderInput
                    label="Windows per level"
                    min={2}
                    max={6}
                    step={1}
                    value={structure.windowsPerLevel}
                    onChange={(v) => updateStructure('windowsPerLevel', Math.round(v))}
                />
                <SliderInput
                    label="Oscillators per window"
                    min={3}
                    max={10}
                    step={1}
                    value={structure.oscillatorsPerWindow}
                    onChange={(v) => updateStructure('oscillatorsPerWindow', Math.round(v))}
                />
                <p className="text-xs text-lime-200/60">
                    Changing structure will reset the simulation.
                </p>
            </div>

            {/* Synchrony */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Within-window synchrony</h3>
                <SliderInput
                    label="Synchrony"
                    min={0}
                    max={1}
                    step={0.01}
                    value={params.withinSynchrony}
                    onChange={(v) => updateParam('withinSynchrony', v)}
                    showDecimals
                />
                <p className="text-xs text-lime-200/60">
                    Elements within a window align (zero-lag tendency).
                </p>
            </div>

            {/* Peer coherence */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Peer coherence</h3>
                <SliderInput
                    label="Coherence"
                    min={0}
                    max={1}
                    step={0.01}
                    value={params.peerCoherence}
                    onChange={(v) => updateParam('peerCoherence', v)}
                    showDecimals
                />
                <p className="text-xs text-lime-200/60">
                    Phase relations between windows at same level (non-zero lag).
                </p>
            </div>

            {/* Cross-frequency coupling */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Cross-frequency coupling</h3>
                <SliderInput
                    label="CFC"
                    min={0}
                    max={1}
                    step={0.01}
                    value={params.crossFreqCoupling}
                    onChange={(v) => updateParam('crossFreqCoupling', v)}
                    showDecimals
                />
                <p className="text-xs text-lime-200/60">
                    Parent rhythms modulate child rhythms across levels.
                </p>
            </div>

            {/* Noise */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Noise</h3>
                <SliderInput
                    label="Noise"
                    min={0}
                    max={1}
                    step={0.01}
                    value={params.noise}
                    onChange={(v) => updateParam('noise', v)}
                    showDecimals
                />
            </div>

            {/* Apex bandwidth */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Apex bandwidth</h3>
                <SliderInput
                    label="Bandwidth"
                    min={0}
                    max={1}
                    step={0.01}
                    value={params.apexBandwidth}
                    onChange={(v) => updateParam('apexBandwidth', v)}
                    showDecimals
                />
            </div>

            {/* Show time series toggle */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-lime-200/70 text-sm">Show time series</span>
                    <button
                        onClick={() => onShowTimeSeriesChange(!showTimeSeries)}
                        className={`px-3 py-1 text-xs border transition-colors ${
                            showTimeSeries
                                ? 'bg-lime-500/20 border-lime-500 text-lime-400'
                                : 'border-lime-500/30 text-lime-200/70'
                        }`}
                    >
                        {showTimeSeries ? 'On' : 'Off'}
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Synchrony by level</h3>
                <div className="border border-lime-500/20 p-3 space-y-2">
                    {metrics.syncByLevel.map((sync, i) => (
                        <div key={i} className="flex justify-between text-sm">
                            <span className="text-lime-200/70">{getLevelName(i, metrics.syncByLevel.length)}</span>
                            <span className="text-lime-400 font-mono">{fmtPct(sync)}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Coherence by level</h3>
                <div className="border border-lime-500/20 p-3 space-y-2">
                    {metrics.cohByLevel.map((coh, i) => (
                        <div key={i} className="flex justify-between text-sm">
                            <span className="text-lime-200/70">{getLevelName(i, metrics.cohByLevel.length)}</span>
                            <span className="text-lime-400 font-mono">{fmtPct(coh)}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border border-lime-500/30 p-3 space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-lime-200/70">Cross-freq coupling</span>
                    <span className="text-lime-400 font-mono">{fmtPct(metrics.cfc)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-lime-200/70">Report stability</span>
                    <span className="text-lime-400 font-mono text-lg">{fmtPct(metrics.reportStability)}</span>
                </div>
            </div>
        </div>
    );
}
