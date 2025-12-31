'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import SliderInput from '@/components/SliderInput';
import { SimulationParams } from '../../playground';
import { TemplateName } from '../../logic';

const DEFAULT_PARAMS: SimulationParams = {
    template: 'maier3',
    dtMs: 1,
    durationMs: 12000,
    seed: 42,
    delayMs: 8,
    clampNodeId: 'N0',
    clampValue: 1,
    running: false,
    showRaster: true,
    showEffects: true,
    showTE: true,
    showGranger: true,
};

interface SettingsProps {
    onParamsChange: (params: SimulationParams) => void;
    onRunNatural: () => void;
    onRunDo: () => void;
    onComputeEffects: () => void;
    onComputeGrangerTE: () => void;
    nodeOptions: string[];
}

export default function Settings({
    onParamsChange,
    onRunNatural,
    onRunDo,
    onComputeEffects,
    onComputeGrangerTE,
    nodeOptions,
}: SettingsProps) {
    const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);

    const updateParam = <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) => {
        const newParams = { ...params, [key]: value };
        setParams(newParams);
        onParamsChange(newParams);
    };

    const handleTemplateChange = (template: TemplateName) => {
        const newParams = {
            ...params,
            template,
            delayMs: template === 'chain4' ? 10 : 8,
        };
        setParams(newParams);
        onParamsChange(newParams);
    };

    return (
        <div className="space-y-6">
            {/* Template Selection */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Model Template</h3>
                <div className="space-y-2">
                    {([
                        { id: 'maier3', name: 'Maier (3 neurons)', desc: 'N0,N1→N2 with synergy' },
                        { id: 'chain4', name: 'Chain (4 neurons)', desc: 'A→B,C→D diamond' },
                        { id: 'confounder3', name: 'Confounder', desc: 'Hidden U→X,Y' },
                    ] as const).map((t) => (
                        <button
                            key={t.id}
                            onClick={() => handleTemplateChange(t.id)}
                            className={`w-full px-3 py-2 text-left text-sm border transition-colors ${
                                params.template === t.id
                                    ? 'border-lime-500 text-lime-400 bg-lime-500/10'
                                    : 'border-lime-500/30 text-gray-400 hover:border-lime-500/50'
                            }`}
                        >
                            <div className="font-medium">{t.name}</div>
                            <div className="text-xs text-gray-500">{t.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Simulation Parameters */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Simulation</h3>
                <SliderInput
                    label="Duration (ms)"
                    min={1000}
                    max={48000}
                    step={1000}
                    value={params.durationMs}
                    onChange={(v) => updateParam('durationMs', v)}
                />
                <SliderInput
                    label="Analysis delay (ms)"
                    min={1}
                    max={20}
                    step={1}
                    value={params.delayMs}
                    onChange={(v) => updateParam('delayMs', v)}
                />
                <SliderInput
                    label="Seed"
                    min={1}
                    max={9999}
                    step={1}
                    value={params.seed}
                    onChange={(v) => updateParam('seed', v)}
                />
            </div>

            {/* Simulation Actions */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Run</h3>
                <Button
                    label="Run Natural"
                    onClick={onRunNatural}
                    className="w-full"
                />
                <div className="text-xs text-gray-500">
                    Simulate without interventions
                </div>
            </div>

            {/* Intervention */}
            <div className="space-y-3 border border-lime-500/20 p-3">
                <h3 className="text-lime-400 font-semibold text-sm">do() Intervention</h3>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Node</label>
                        <select
                            className="w-full bg-black border border-lime-500/30 text-white px-2 py-1.5 text-sm focus:outline-none focus:border-lime-500"
                            value={params.clampNodeId}
                            onChange={(e) => updateParam('clampNodeId', e.target.value)}
                        >
                            {nodeOptions.map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Value</label>
                        <select
                            className="w-full bg-black border border-lime-500/30 text-white px-2 py-1.5 text-sm focus:outline-none focus:border-lime-500"
                            value={params.clampValue}
                            onChange={(e) => updateParam('clampValue', Number(e.target.value) as 0 | 1)}
                        >
                            <option value={1}>1 (always fire)</option>
                            <option value={0}>0 (silent)</option>
                        </select>
                    </div>
                </div>
                <Button
                    label={`Run do(${params.clampNodeId}=${params.clampValue})`}
                    onClick={onRunDo}
                    className="w-full"
                />
            </div>

            {/* Analysis */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Analysis</h3>
                <Button
                    label="Compute Causal Effects"
                    onClick={onComputeEffects}
                    className="w-full"
                />
                <Button
                    label="Compute Granger + TE"
                    onClick={onComputeGrangerTE}
                    className="w-full"
                />
            </div>

            {/* Display Options */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Display</h3>
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={params.showRaster}
                        onChange={(e) => updateParam('showRaster', e.target.checked)}
                        className="accent-lime-500"
                    />
                    Show spike raster
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={params.showEffects}
                        onChange={(e) => updateParam('showEffects', e.target.checked)}
                        className="accent-lime-500"
                    />
                    Show causal effects
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={params.showTE}
                        onChange={(e) => updateParam('showTE', e.target.checked)}
                        className="accent-lime-500"
                    />
                    Show Transfer Entropy
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={params.showGranger}
                        onChange={(e) => updateParam('showGranger', e.target.checked)}
                        className="accent-lime-500"
                    />
                    Show Granger causality
                </label>
            </div>

            {/* Info */}
            <div className="text-xs text-gray-500 space-y-2 border-t border-lime-500/20 pt-4">
                <p><strong>do(X=x)</strong>: Pearl&apos;s intervention operator, clamping a variable</p>
                <p><strong>ΔP</strong>: Causal effect = P(Y|do(X=1)) - P(Y|do(X=0))</p>
                <p><strong>TE</strong>: Transfer Entropy measures directed information flow</p>
                <p><strong>Synergy</strong>: Joint effect exceeds sum of individual effects</p>
            </div>
        </div>
    );
}
