'use client';

import React from 'react';

import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';

import {
    Params,
    PresetKey,
    Metrics,
    presetParams,
} from '../../logic';


interface SettingsProps {
    params: Params;
    onParamsChange: (p: Params) => void;
    metrics: Metrics;
}

export default function Settings({
    params,
    onParamsChange,
    metrics,
}: SettingsProps) {
    const set = (partial: Partial<Params>) =>
        onParamsChange({ ...params, ...partial });

    const selectPreset = (key: PresetKey) =>
        onParamsChange(presetParams(key));

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">preset</h3>
                <div className="grid grid-cols-3 gap-2">
                    {(['diffusion-dominated', 'resonance-assisted', 'noise-flooded'] as PresetKey[]).map((key) => (
                        <button
                            key={key}
                            onClick={() => selectPreset(key)}
                            className={`py-1.5 px-2 text-xs border transition-colors cursor-pointer ${
                                params.preset === key
                                    ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                    : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                            }`}
                        >
                            {key}
                        </button>
                    ))}
                </div>
                <div className="text-xs text-lime-200/40">
                    diffusion-dominated: classical search &middot;
                    resonance-assisted: Pettini coupling active &middot;
                    noise-flooded: high ionic screening
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">interpretation</h3>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-xs text-lime-200/60">{metrics.interpretation}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="text-lime-200/60">resonance gain: <span className="text-lime-400">{(metrics.resonanceGain * 100).toFixed(1)}%</span></div>
                    <div className="text-lime-200/60">search time: <span className="text-lime-400">{(metrics.searchTime * 100).toFixed(1)}%</span></div>
                    <div className="text-lime-200/60">target bias: <span className="text-lime-400">{(metrics.targetBias * 100).toFixed(1)}%</span></div>
                    <div className="text-lime-200/60">compressibility: <span className="text-lime-400">{(metrics.compressibility * 100).toFixed(1)}%</span></div>
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">transport</h3>
                <SliderInput
                    label="3D diffusion"
                    min={0} max={100} step={1}
                    value={params.diffusion3D}
                    onChange={(v) => set({ diffusion3D: v })}
                />
                <SliderInput
                    label="1D DNA sliding"
                    min={0} max={100} step={1}
                    value={params.sliding1D}
                    onChange={(v) => set({ sliding1D: v })}
                />
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">resonance</h3>
                <SliderInput
                    label="resonance match"
                    min={0} max={100} step={1}
                    value={params.resonanceMatch}
                    onChange={(v) => set({ resonanceMatch: v })}
                />
                <SliderInput
                    label="vibrational activation"
                    min={0} max={100} step={1}
                    value={params.activation}
                    onChange={(v) => set({ activation: v })}
                />
                <SliderInput
                    label="ED coupling strength"
                    min={0} max={100} step={1}
                    value={params.coupling}
                    onChange={(v) => set({ coupling: v })}
                />
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">environment</h3>
                <SliderInput
                    label="ionic / thermal noise"
                    min={0} max={100} step={1}
                    value={params.ionicNoise}
                    onChange={(v) => set({ ionicNoise: v })}
                />
            </div>

            <div className="border-t border-lime-500/20" />

            <Button
                label="reset preset"
                onClick={() => selectPreset(params.preset)}
                size="sm"
                className="w-full"
            />
        </div>
    );
}
