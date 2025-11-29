'use client';

import { useMemo } from 'react';
import Button from '@/components/Button';
import SliderInput from '@/components/SliderInput';
import {
    SimulationParams,
    PresetId,
    PRESETS,
    generateLandscape,
    computeConcentration,
    computeGiniCoefficient,
} from '../../constants';

interface SettingsProps {
    params: SimulationParams;
    selectedPresetId: PresetId;
    onParamsChange: (params: SimulationParams) => void;
    onPresetChange: (id: PresetId) => void;
    onReset: () => void;
}

function regimeInterpretation(concentration: number, gini: number): string {
    if (concentration < 0.15) {
        return 'Pluralistic ecology: fitness is broadly distributed across many strategies.';
    } else if (concentration < 0.25) {
        return 'Emerging concentration: some strategies begin to dominate but diversity persists.';
    } else if (concentration < 0.40) {
        return 'Transitional regime: significant concentration emerging, marginal strategies under pressure.';
    } else if (concentration < 0.60) {
        return 'Oligarchic regime: a small elite of strategies captures most fitness.';
    } else {
        return 'Monodominant regime: algorithmic apex predator captures nearly all fitness.';
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

    const landscape = useMemo(() => generateLandscape(params), [params]);
    const concentration = useMemo(() => computeConcentration(landscape), [landscape]);
    const gini = useMemo(() => computeGiniCoefficient(landscape), [landscape]);

    const selectedPreset = PRESETS.find((p) => p.id === selectedPresetId);

    return (
        <div className="space-y-6">
            {/* Preset Selection */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Regime Preset</h3>
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

            {/* Concentration Metrics */}
            <div className="space-y-2">
                <h3 className="text-lime-400 font-semibold">Concentration Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black border border-lime-500/20 p-3">
                        <div className="text-xs text-gray-400">Top 5% share</div>
                        <div className="text-xl font-bold text-lime-400">
                            {(concentration * 100).toFixed(1)}%
                        </div>
                    </div>
                    <div className="bg-black border border-lime-500/20 p-3">
                        <div className="text-xs text-gray-400">Gini coefficient</div>
                        <div className="text-xl font-bold text-lime-400">
                            {gini.toFixed(3)}
                        </div>
                    </div>
                </div>
                <p className="text-xs text-gray-400">{regimeInterpretation(concentration, gini)}</p>
            </div>

            {/* Convexity Slider */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Returns Structure</h3>

                <div>
                    <SliderInput
                        label="Convexity of returns"
                        min={0}
                        max={1}
                        step={0.01}
                        value={params.convexity}
                        onChange={(value) => updateParam('convexity', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">
                        Left: concave (many can live) · Right: convex (one dominates)
                    </div>
                </div>
            </div>

            {/* Niche Structure */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Niche Structure</h3>

                <div>
                    <SliderInput
                        label="Niche separation"
                        min={0}
                        max={1}
                        step={0.01}
                        value={params.separation}
                        onChange={(value) => updateParam('separation', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">
                        Left: collapsed niches · Right: distinct niches
                    </div>
                </div>
            </div>

            {/* Ecosystem Slack */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Ecosystem</h3>

                <div>
                    <SliderInput
                        label="Background slack"
                        min={0}
                        max={0.1}
                        step={0.001}
                        value={params.noiseFloor}
                        onChange={(value) => updateParam('noiseFloor', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">
                        Left: harsh extinction · Right: marginal survival allowed
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
                    <strong>Heatmap:</strong> Brightness indicates fitness. Watch concentration
                    collapse into fewer, brighter peaks as convexity increases.
                </p>
                <p>
                    <strong>Top 5% share:</strong> What fraction of total fitness is captured
                    by the strongest 5% of strategies.
                </p>
                <p>
                    <strong>Gini:</strong> 0 = equal distribution, 1 = total concentration
                    in a single strategy.
                </p>
            </div>
        </div>
    );
}
