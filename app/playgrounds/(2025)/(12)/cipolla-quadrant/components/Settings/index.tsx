'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import SliderInput from '@/components/SliderInput';
import { SimulationParams } from '../../playground';
import { COUNTRY_PRESETS, CountryMacros } from '../../logic';

const DEFAULT_PARAMS: SimulationParams = {
    preset: 'High-trust Nordic',
    gdpPcUSD: 65000,
    gini: 27,
    unemploymentPct: 4,
    cpi: 80,
    trustPct: 65,
    orphanPct: 0.2,
    educationIndex: 0.90,
    sensitivity: 1.0,
    seed: 123456,
    nAgents: 250,
    showGrid: true,
    showNetBoundary: true,
    shadeNetPositive: true,
    showQuadrantLabels: true,
    colorMode: 'quadrant',
};

interface SettingsProps {
    onParamsChange: (params: SimulationParams) => void;
    onReset: () => void;
    onGenerate: () => void;
}

export default function Settings({ onParamsChange, onReset, onGenerate }: SettingsProps) {
    const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);

    const updateParam = <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) => {
        const newParams = { ...params, [key]: value };
        setParams(newParams);
        onParamsChange(newParams);
    };

    const applyPreset = (presetName: string) => {
        const preset = COUNTRY_PRESETS[presetName];
        if (!preset) return;
        const newParams: SimulationParams = {
            ...params,
            preset: presetName,
            gdpPcUSD: preset.gdpPcUSD,
            gini: preset.gini,
            unemploymentPct: preset.unemploymentPct,
            cpi: preset.cpi,
            trustPct: preset.trustPct,
            orphanPct: preset.orphanPct,
            educationIndex: preset.educationIndex,
        };
        setParams(newParams);
        onParamsChange(newParams);
    };

    const handleReset = () => {
        setParams(DEFAULT_PARAMS);
        onParamsChange(DEFAULT_PARAMS);
        onReset();
    };

    return (
        <div className="space-y-6">
            {/* Country Preset */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Country Profile</h3>

                <div>
                    <div className="text-xs text-gray-300 mb-1">Preset</div>
                    <select
                        className="w-full bg-black border border-lime-500/30 text-white px-3 py-2 text-sm focus:outline-none focus:border-lime-500"
                        value={params.preset}
                        onChange={(e) => applyPreset(e.target.value)}
                    >
                        {Object.keys(COUNTRY_PRESETS).map((k) => (
                            <option key={k} value={k}>
                                {k}
                            </option>
                        ))}
                    </select>
                    <div className="text-xs text-gray-500 mt-1">
                        Stylized profiles. Replace with real data for calibration.
                    </div>
                </div>
            </div>

            {/* Macro Indicators */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Macro Indicators</h3>

                <div>
                    <SliderInput
                        label="GDP per capita (USD)"
                        min={2000}
                        max={120000}
                        step={500}
                        value={params.gdpPcUSD}
                        onChange={(value) => updateParam('gdpPcUSD', value)}
                    />
                </div>

                <div>
                    <SliderInput
                        label="Gini (inequality)"
                        min={20}
                        max={60}
                        step={1}
                        value={params.gini}
                        onChange={(value) => updateParam('gini', value)}
                    />
                </div>

                <div>
                    <SliderInput
                        label="Unemployment (%)"
                        min={0}
                        max={25}
                        step={0.5}
                        value={params.unemploymentPct}
                        onChange={(value) => updateParam('unemploymentPct', value)}
                        showDecimals
                    />
                </div>

                <div>
                    <SliderInput
                        label="Corruption Perceptions (0–100)"
                        min={0}
                        max={100}
                        step={1}
                        value={params.cpi}
                        onChange={(value) => updateParam('cpi', value)}
                    />
                    <div className="text-xs text-gray-500 mt-1">Higher = less corrupt</div>
                </div>

                <div>
                    <SliderInput
                        label="Social trust (%)"
                        min={0}
                        max={100}
                        step={1}
                        value={params.trustPct}
                        onChange={(value) => updateParam('trustPct', value)}
                    />
                </div>

                <div>
                    <SliderInput
                        label="Orphans/vulnerable (%)"
                        min={0}
                        max={5}
                        step={0.1}
                        value={params.orphanPct}
                        onChange={(value) => updateParam('orphanPct', value)}
                        showDecimals
                    />
                </div>

                <div>
                    <SliderInput
                        label="Education index"
                        min={0.3}
                        max={0.95}
                        step={0.01}
                        value={params.educationIndex}
                        onChange={(value) => updateParam('educationIndex', value)}
                        showDecimals
                    />
                </div>
            </div>

            {/* Model Parameters */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Model Parameters</h3>

                <div>
                    <SliderInput
                        label="Sensitivity"
                        min={0.2}
                        max={3}
                        step={0.05}
                        value={params.sensitivity}
                        onChange={(value) => updateParam('sensitivity', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-500 mt-1">Higher = more extreme quadrant shares</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <div className="text-xs text-gray-300 mb-1">Seed</div>
                        <input
                            className="w-full bg-black border border-lime-500/30 text-white px-3 py-2 text-sm focus:outline-none focus:border-lime-500"
                            value={params.seed}
                            onChange={(e) => updateParam('seed', parseInt(e.target.value || '0', 10))}
                            type="number"
                        />
                    </div>
                    <div>
                        <div className="text-xs text-gray-300 mb-1">Agents</div>
                        <input
                            className="w-full bg-black border border-lime-500/30 text-white px-3 py-2 text-sm focus:outline-none focus:border-lime-500"
                            value={params.nAgents}
                            onChange={(e) => updateParam('nAgents', Math.max(10, Math.min(2000, parseInt(e.target.value || '0', 10))))}
                            type="number"
                            min={10}
                            max={2000}
                        />
                    </div>
                </div>
            </div>

            {/* Display Options */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Display</h3>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={params.showGrid}
                            onChange={(e) => updateParam('showGrid', e.target.checked)}
                            className="accent-lime-500"
                        />
                        Grid
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={params.showNetBoundary}
                            onChange={(e) => updateParam('showNetBoundary', e.target.checked)}
                            className="accent-lime-500"
                        />
                        Net welfare boundary (x+y=0)
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={params.shadeNetPositive}
                            onChange={(e) => updateParam('shadeNetPositive', e.target.checked)}
                            className="accent-lime-500"
                            disabled={!params.showNetBoundary}
                        />
                        Shade net-positive region
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={params.showQuadrantLabels}
                            onChange={(e) => updateParam('showQuadrantLabels', e.target.checked)}
                            className="accent-lime-500"
                        />
                        Quadrant labels
                    </label>
                </div>

                <div>
                    <div className="text-xs text-gray-300 mb-1">Color mode</div>
                    <select
                        className="w-full bg-black border border-lime-500/30 text-white px-3 py-2 text-sm focus:outline-none focus:border-lime-500"
                        value={params.colorMode}
                        onChange={(e) => updateParam('colorMode', e.target.value as SimulationParams['colorMode'])}
                    >
                        <option value="quadrant">By quadrant</option>
                        <option value="net">By net welfare</option>
                        <option value="component">By generating component</option>
                    </select>
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
                <Button
                    label="Generate population"
                    onClick={onGenerate}
                    className="w-full"
                />
                <Button
                    label="Reset to defaults"
                    onClick={handleReset}
                    className="w-full"
                />
            </div>

            {/* Info */}
            <div className="text-xs text-gray-500 space-y-2 border-t border-lime-500/20 pt-4">
                <p>
                    <strong>Quadrants:</strong> Intelligent (I), Helpless (II), Stupid (III), Bandit (IV)
                </p>
                <p>
                    <strong>Net welfare:</strong> x+y &gt; 0 adds to total welfare; x+y &lt; 0 reduces it
                </p>
                <p>
                    <strong>P-O-M line:</strong> The diagonal boundary separating net-positive from net-negative actors
                </p>
            </div>
        </div>
    );
}
