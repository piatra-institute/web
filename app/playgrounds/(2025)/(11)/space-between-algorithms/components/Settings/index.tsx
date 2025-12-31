'use client';

import Button from '@/components/Button';
import SliderInput from '@/components/SliderInput';
import { SimulationParams, PresetId, PRESETS, computeFreedomScore } from '../../constants';

interface SettingsProps {
    params: SimulationParams;
    selectedPresetId: PresetId;
    onParamsChange: (params: SimulationParams) => void;
    onPresetChange: (id: PresetId) => void;
    onReset: () => void;
}

function qualitativeInterpretation(score: number): string {
    if (score < 15) {
        return 'Rigid automaton regime: almost no meaningful freedom to decide.';
    } else if (score < 30) {
        return 'Low-freedom regime: some branching and influence, but policy space is narrow and mostly fixed.';
    } else if (score < 50) {
        return 'Intermediate regime: nontrivial choice and adaptation, but still heavily shaped by a small set of algorithms.';
    } else if (score < 70) {
        return 'Rich adaptive regime: multiple viable algorithms, genuine leverage over the future.';
    } else if (score < 85) {
        return 'High-agency regime: large policy repertoire, strong empowerment, meaningful macro-level decision making.';
    } else {
        return 'Ultra-high agency: the system navigates algorithm space itself, reconfiguring its own rules across scales.';
    }
}

export default function Settings({
    params,
    selectedPresetId,
    onParamsChange,
    onPresetChange,
    onReset,
}: SettingsProps) {
    const updateParam = (key: keyof SimulationParams, value: number) => {
        const newParams = { ...params, [key]: value };
        onParamsChange(newParams);
        if (selectedPresetId !== 'custom') {
            onPresetChange('custom');
        }
    };

    const freedomScore = computeFreedomScore(params);
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

            {/* Freedom Score Display */}
            <div className="space-y-2">
                <h3 className="text-lime-400 font-semibold">Freedom Score</h3>
                <div className="text-3xl font-bold text-lime-400 text-center py-2">
                    {freedomScore}
                    <span className="text-lg text-gray-500 ml-1">/ 100</span>
                </div>
                <p className="text-xs text-gray-400">{qualitativeInterpretation(freedomScore)}</p>
            </div>

            {/* Intra-Algorithm Parameters */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Intra-Algorithm Freedom</h3>

                <div>
                    <SliderInput
                        label="Intra-algorithm branching"
                        min={0}
                        max={1}
                        step={0.01}
                        value={params.intraEntropy}
                        onChange={(value) => updateParam('intraEntropy', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">
                        Conditional action entropy H(A|H) within fixed algorithm
                    </div>
                </div>

                <div>
                    <SliderInput
                        label="Empowerment"
                        min={0}
                        max={1}
                        step={0.01}
                        value={params.empowerment}
                        onChange={(value) => updateParam('empowerment', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">
                        Mutual information I(A; S) between actions and future states
                    </div>
                </div>
            </div>

            {/* Inter-Algorithm Parameters */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Inter-Algorithm Freedom</h3>

                <div>
                    <SliderInput
                        label="Policy manifold volume"
                        min={0}
                        max={1}
                        step={0.01}
                        value={params.policyVolume}
                        onChange={(value) => updateParam('policyVolume', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">
                        Reachable region in policy space via learning/plasticity
                    </div>
                </div>
            </div>

            {/* Emergence & Regularity */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Emergence & Regularity</h3>

                <div>
                    <SliderInput
                        label="Causal emergence"
                        min={0}
                        max={1}
                        step={0.01}
                        value={params.causalEmergence}
                        onChange={(value) => updateParam('causalEmergence', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">
                        Macro-level effective information advantage over micro
                    </div>
                </div>

                <div>
                    <SliderInput
                        label="Descriptive regularity"
                        min={0}
                        max={1}
                        step={0.01}
                        value={params.descriptiveRegularity}
                        onChange={(value) => updateParam('descriptiveRegularity', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">
                        Borel/Baire-like regularity (locally implementable solutions)
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
                    <strong>Tree thickness:</strong> The cloth around branches represents goal
                    slack—how many micro-implementations achieve the same macro-outcome.
                </p>
                <p>
                    <strong>Freedom score:</strong> Weighted combination of intra-entropy,
                    empowerment, policy volume, causal emergence, and descriptive regularity.
                </p>
                <p>
                    <strong>Presets:</strong> Compare systems from rigid sorting algorithms to
                    high-agency human cognition.
                </p>
            </div>
        </div>
    );
}
