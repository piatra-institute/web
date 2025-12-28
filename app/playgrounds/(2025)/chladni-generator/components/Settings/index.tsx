'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import SliderInput from '@/components/SliderInput';
import { SimulationParams } from '../../playground';
import { CHLADNI_PRESETS, ShapeType } from '../../logic';

const DEFAULT_PARAMS: SimulationParams = {
    shape: 'square',
    ringInner: 0.4,
    resolution: 400,
    running: true,
    // Mode 1
    m1: 3,
    n1: 2,
    a1: 1.0,
    symmetric1: false,
    // Mode 2
    m2: 5,
    n2: 3,
    a2: 0.6,
    symmetric2: true,
    useSecondMode: true,
    // Sand
    sandRate: 0.35,
    sandDiff: 0.02,
    showSand: true,
    // Display
    nodeThreshold: 0.06,
    showNodes: true,
    invert: false,
    contrast: 1.4,
};

interface SettingsProps {
    onParamsChange: (params: SimulationParams) => void;
    onReset: () => void;
}

export default function Settings({ onParamsChange, onReset }: SettingsProps) {
    const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);

    const updateParam = <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) => {
        const newParams = { ...params, [key]: value };
        setParams(newParams);
        onParamsChange(newParams);
    };

    const applyPreset = (preset: typeof CHLADNI_PRESETS[number]) => {
        const newParams = {
            ...params,
            shape: preset.shape,
            m1: preset.m,
            n1: preset.n,
            symmetric1: preset.symmetric,
            useSecondMode: false,
        };
        setParams(newParams);
        onParamsChange(newParams);
        onReset();
    };

    const handleReset = () => {
        setParams(DEFAULT_PARAMS);
        onParamsChange(DEFAULT_PARAMS);
        onReset();
    };

    const handleShapeChange = (shape: ShapeType) => {
        updateParam('shape', shape);
        onReset();
    };

    return (
        <div className="space-y-6">
            {/* Presets */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Presets</h3>
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                    {CHLADNI_PRESETS.map((p) => (
                        <button
                            key={p.name}
                            onClick={() => applyPreset(p)}
                            className="px-2 py-1.5 text-xs border border-lime-500/30 text-gray-400 hover:border-lime-500/50 hover:text-white transition-colors text-left truncate"
                            title={p.description}
                        >
                            {p.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Shape */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Plate geometry</h3>
                <div className="flex gap-1.5 flex-wrap">
                    {(['square', 'circle', 'rectangle', 'ring'] as ShapeType[]).map((s) => (
                        <button
                            key={s}
                            onClick={() => handleShapeChange(s)}
                            className={`px-3 py-1.5 text-xs border transition-colors ${
                                params.shape === s
                                    ? 'border-lime-500 text-lime-400 bg-lime-500/10'
                                    : 'border-lime-500/30 text-gray-400 hover:border-lime-500/50'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
                {params.shape === 'ring' && (
                    <SliderInput
                        label="Inner radius"
                        min={0.2}
                        max={0.8}
                        step={0.01}
                        value={params.ringInner}
                        onChange={(v) => { updateParam('ringInner', v); onReset(); }}
                        showDecimals
                    />
                )}
            </div>

            {/* Mode 1 */}
            <div className="space-y-3 border border-lime-500/20 p-3">
                <div className="text-sm text-lime-400">Mode 1 (m, n)</div>
                <div className="grid grid-cols-2 gap-3">
                    <SliderInput label="m" min={1} max={12} step={1} value={params.m1} onChange={(v) => updateParam('m1', v)} />
                    <SliderInput label="n" min={1} max={12} step={1} value={params.n1} onChange={(v) => updateParam('n1', v)} />
                </div>
                <SliderInput label="Amplitude" min={0} max={2} step={0.01} value={params.a1} onChange={(v) => updateParam('a1', v)} showDecimals />
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={params.symmetric1}
                        onChange={(e) => updateParam('symmetric1', e.target.checked)}
                        className="accent-lime-500"
                    />
                    Symmetric mode (+)
                </label>
            </div>

            {/* Mode 2 */}
            <div className="space-y-3 border border-lime-500/20 p-3">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-lime-400">Mode 2 (superposition)</div>
                    <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={params.useSecondMode}
                            onChange={(e) => updateParam('useSecondMode', e.target.checked)}
                            className="accent-lime-500"
                        />
                        Enable
                    </label>
                </div>
                {params.useSecondMode && (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                            <SliderInput label="m" min={1} max={12} step={1} value={params.m2} onChange={(v) => updateParam('m2', v)} />
                            <SliderInput label="n" min={1} max={12} step={1} value={params.n2} onChange={(v) => updateParam('n2', v)} />
                        </div>
                        <SliderInput label="Amplitude" min={0} max={2} step={0.01} value={params.a2} onChange={(v) => updateParam('a2', v)} showDecimals />
                        <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={params.symmetric2}
                                onChange={(e) => updateParam('symmetric2', e.target.checked)}
                                className="accent-lime-500"
                            />
                            Symmetric mode (+)
                        </label>
                    </>
                )}
            </div>

            {/* Sand simulation */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Sand simulation</h3>
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={params.showSand}
                        onChange={(e) => updateParam('showSand', e.target.checked)}
                        className="accent-lime-500"
                    />
                    Show sand particles
                </label>
                {params.showSand && (
                    <>
                        <SliderInput
                            label="Migration rate"
                            min={0}
                            max={0.8}
                            step={0.01}
                            value={params.sandRate}
                            onChange={(v) => updateParam('sandRate', v)}
                            showDecimals
                        />
                        <SliderInput
                            label="Diffusion"
                            min={0}
                            max={0.1}
                            step={0.005}
                            value={params.sandDiff}
                            onChange={(v) => updateParam('sandDiff', v)}
                            showDecimals
                        />
                    </>
                )}
            </div>

            {/* Nodal lines */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Nodal lines</h3>
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={params.showNodes}
                        onChange={(e) => updateParam('showNodes', e.target.checked)}
                        className="accent-lime-500"
                    />
                    Highlight nodes
                </label>
                {params.showNodes && (
                    <SliderInput
                        label="Node threshold"
                        min={0.01}
                        max={0.2}
                        step={0.005}
                        value={params.nodeThreshold}
                        onChange={(v) => updateParam('nodeThreshold', v)}
                        showDecimals
                    />
                )}
            </div>

            {/* Display */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Display</h3>
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={params.invert}
                        onChange={(e) => updateParam('invert', e.target.checked)}
                        className="accent-lime-500"
                    />
                    Invert colors
                </label>
                <SliderInput
                    label="Contrast"
                    min={0.5}
                    max={2.5}
                    step={0.01}
                    value={params.contrast}
                    onChange={(v) => updateParam('contrast', v)}
                    showDecimals
                />
                <SliderInput
                    label="Resolution"
                    min={200}
                    max={600}
                    step={50}
                    value={params.resolution}
                    onChange={(v) => { updateParam('resolution', v); onReset(); }}
                />
            </div>

            {/* Actions */}
            <div className="space-y-3">
                <Button
                    label={params.running ? 'Pause' : 'Run'}
                    onClick={() => updateParam('running', !params.running)}
                    className="w-full"
                />
                <Button
                    label="Reset"
                    onClick={handleReset}
                    className="w-full"
                />
            </div>

            {/* Reference */}
            <div className="text-xs text-gray-500 space-y-1 border-t border-lime-500/20 pt-4">
                <p className="text-gray-400">Chladni equation:</p>
                <p className="font-mono text-gray-500">cos(mπx)cos(nπy) ± cos(nπx)cos(mπy)</p>
                <p className="mt-2 text-gray-500">Mode numbers (m,n) count half-wavelengths. Nodal lines appear where amplitude = 0.</p>
            </div>
        </div>
    );
}
