'use client';

import { useMemo } from 'react';
import Button from '@/components/Button';
import SliderInput from '@/components/SliderInput';
import Toggle from '@/components/Toggle';
import {
    SimulationParams,
    PresetId,
    PRESETS,
    summarizeEntrants,
} from '../../constants';

interface SettingsProps {
    params: SimulationParams;
    selectedPresetId: PresetId;
    onParamsChange: (params: SimulationParams) => void;
    onPresetChange: (id: PresetId) => void;
    onReset: () => void;
}

function selectionInterpretation(fracEnter: number, meanM_enter: number, meanM_pop: number): string {
    const selectionStrength = meanM_pop - meanM_enter;
    if (selectionStrength < 0.02) {
        return 'Minimal selection: entrants closely match population distribution.';
    } else if (selectionStrength < 0.08) {
        return 'Mild selection: slight shift toward lower moral aversion.';
    } else if (selectionStrength < 0.15) {
        return 'Moderate selection: noticeable filtering of high-m types.';
    } else if (selectionStrength < 0.25) {
        return 'Strong selection: entrants significantly skewed toward low-m.';
    } else {
        return 'Severe selection: only corruption-tolerant types find entry attractive.';
    }
}

export default function Settings({
    params,
    selectedPresetId,
    onParamsChange,
    onPresetChange,
    onReset,
}: SettingsProps) {
    const updateParam = <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) => {
        const newParams = { ...params, [key]: value };
        onParamsChange(newParams);
        if (selectedPresetId !== 'custom') {
            onPresetChange('custom');
        }
    };

    const stats = useMemo(() => summarizeEntrants(params), [params]);

    const selectedPreset = PRESETS.find((p) => p.id === selectedPresetId);

    return (
        <div className="space-y-6">
            {/* Preset Selection */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">System Preset</h3>
                <select
                    value={selectedPresetId}
                    onChange={(e) => onPresetChange(e.target.value as PresetId)}
                    className="w-full bg-black border border-lime-500/30 text-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-lime-500"
                >
                    {PRESETS.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                            {preset.name}
                        </option>
                    ))}
                </select>
                {selectedPreset && (
                    <p className="text-xs text-gray-400">{selectedPreset.description}</p>
                )}
            </div>

            {/* Key Statistics */}
            <div className="space-y-2">
                <h3 className="text-lime-400 font-semibold">Selection Metrics</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black border border-lime-500/20 p-3">
                        <div className="text-xs text-gray-400">Cutoff m*</div>
                        <div className="text-xl font-bold text-lime-400">
                            {stats.cutoff.toFixed(3)}
                        </div>
                    </div>
                    <div className="bg-black border border-lime-500/20 p-3">
                        <div className="text-xs text-gray-400">Share entering</div>
                        <div className="text-xl font-bold text-lime-400">
                            {(stats.fracEnter * 100).toFixed(1)}%
                        </div>
                    </div>
                    <div className="bg-black border border-lime-500/20 p-3">
                        <div className="text-xs text-gray-400">Mean m (pop)</div>
                        <div className="text-xl font-bold text-gray-300">
                            {stats.meanM_pop.toFixed(3)}
                        </div>
                    </div>
                    <div className="bg-black border border-lime-500/20 p-3">
                        <div className="text-xs text-gray-400">Mean m (entrants)</div>
                        <div className="text-xl font-bold text-lime-400">
                            {stats.meanM_enter.toFixed(3)}
                        </div>
                    </div>
                </div>
                <p className="text-xs text-gray-400">
                    {selectionInterpretation(stats.fracEnter, stats.meanM_enter, stats.meanM_pop)}
                </p>
            </div>

            {/* Field Structure */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Field Structure</h3>

                <div>
                    <SliderInput
                        label="Closedness (k)"
                        min={0}
                        max={1}
                        step={0.01}
                        value={params.closedness}
                        onChange={(value) => updateParam('closedness', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">
                        0 = open (critique protected) · 1 = closed (critique forbidden)
                    </div>
                </div>

                <div>
                    <SliderInput
                        label="Moral amplifier (α)"
                        min={0.8}
                        max={3}
                        step={0.01}
                        value={params.alpha}
                        onChange={(value) => updateParam('alpha', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">
                        Curvature of g(k) = k^α
                    </div>
                </div>

                <div>
                    <SliderInput
                        label="Base rents (β₀)"
                        min={0}
                        max={0.8}
                        step={0.01}
                        value={params.beta0}
                        onChange={(value) => updateParam('beta0', value)}
                        showDecimals
                    />
                </div>

                <div>
                    <SliderInput
                        label="Rent slope (γ)"
                        min={0}
                        max={1.2}
                        step={0.01}
                        value={params.gamma}
                        onChange={(value) => updateParam('gamma', value)}
                        showDecimals
                    />
                </div>

                <div>
                    <SliderInput
                        label="Baseline cost (η)"
                        min={0}
                        max={0.6}
                        step={0.01}
                        value={params.eta}
                        onChange={(value) => updateParam('eta', value)}
                        showDecimals
                    />
                </div>
            </div>

            {/* Population Distribution */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Population m ~ Beta(a, b)</h3>

                <div>
                    <SliderInput
                        label="Shape a"
                        min={0.5}
                        max={5}
                        step={0.01}
                        value={params.betaA}
                        onChange={(value) => updateParam('betaA', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">
                        Higher a → more high-m individuals
                    </div>
                </div>

                <div>
                    <SliderInput
                        label="Shape b"
                        min={0.5}
                        max={5}
                        step={0.01}
                        value={params.betaB}
                        onChange={(value) => updateParam('betaB', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">
                        Higher b → more low-m individuals
                    </div>
                </div>
            </div>

            {/* Loyalty Signaling */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lime-400 font-semibold">Loyalty Signaling</h3>
                    <Toggle
                        text=""
                        value={params.useSignal}
                        toggle={() => updateParam('useSignal', !params.useSignal)}
                    />
                </div>

                <div className={params.useSignal ? '' : 'opacity-40 pointer-events-none'}>
                    <div className="space-y-4">
                        <div>
                            <SliderInput
                                label="Signal strength (s)"
                                min={0}
                                max={1}
                                step={0.01}
                                value={params.signalStrength}
                                onChange={(value) => updateParam('signalStrength', value)}
                                showDecimals
                            />
                        </div>

                        <div>
                            <SliderInput
                                label="Mean loyalty (ℓ̄)"
                                min={0}
                                max={1}
                                step={0.01}
                                value={params.meanLoyalty}
                                onChange={(value) => updateParam('meanLoyalty', value)}
                                showDecimals
                            />
                        </div>

                        <div>
                            <SliderInput
                                label="Dissonance scale (φ)"
                                min={0}
                                max={2}
                                step={0.01}
                                value={params.phiScale}
                                onChange={(value) => updateParam('phiScale', value)}
                                showDecimals
                            />
                        </div>

                        <div>
                            <SliderInput
                                label="Identity scale (ψ)"
                                min={0}
                                max={2}
                                step={0.01}
                                value={params.psiScale}
                                onChange={(value) => updateParam('psiScale', value)}
                                showDecimals
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
                <Button
                    label="Reset to defaults"
                    onClick={onReset}
                    className="w-full"
                />
            </div>

            {/* Info */}
            <div className="text-xs text-gray-500 space-y-2">
                <p>
                    <strong>m*:</strong> Cutoff moral aversion. Only agents with m ≤ m* find
                    entry attractive.
                </p>
                <p>
                    <strong>Selection:</strong> Difference between population mean m and
                    entrant mean m indicates selection strength.
                </p>
            </div>
        </div>
    );
}
