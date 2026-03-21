'use client';

import React from 'react';

import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';

import {
    Params,
    PresetKey,
    Metrics,
    Snapshot,
    PRESET_DESCRIPTIONS,
    presetParams,
} from '../../logic';


const PRESET_KEYS: PresetKey[] = ['classical-search', 'pettini-coupling', 'cellular-crowding'];

function MetricDelta({ label, current, saved }: { label: string; current: number; saved: number }) {
    const delta = current - saved;
    const arrow = delta > 0.005 ? '↑' : delta < -0.005 ? '↓' : '=';
    const color = label === 'search time'
        ? (delta < -0.005 ? 'text-lime-400' : delta > 0.005 ? 'text-orange-400' : 'text-lime-200/40')
        : (delta > 0.005 ? 'text-lime-400' : delta < -0.005 ? 'text-orange-400' : 'text-lime-200/40');

    return (
        <div className="text-lime-200/60 text-xs font-mono">
            {label}: <span className="text-lime-400">{(current * 100).toFixed(1)}%</span>
            {' '}
            <span className={color}>{arrow} {Math.abs(delta * 100).toFixed(1)}%</span>
        </div>
    );
}


interface SettingsProps {
    params: Params;
    onParamsChange: (p: Params) => void;
    metrics: Metrics;
    narrative: string;
    snapshot: Snapshot | null;
    onSaveSnapshot: () => void;
    onClearSnapshot: () => void;
}

export default function Settings({
    params,
    onParamsChange,
    metrics,
    narrative,
    snapshot,
    onSaveSnapshot,
    onClearSnapshot,
}: SettingsProps) {
    const set = (partial: Partial<Params>) =>
        onParamsChange({ ...params, ...partial });

    const selectPreset = (key: PresetKey) =>
        onParamsChange(presetParams(key));

    const presetDesc = PRESET_DESCRIPTIONS[params.preset];

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">experiment</h3>
                <div className="grid grid-cols-3 gap-2">
                    {PRESET_KEYS.map((key) => (
                        <button
                            key={key}
                            onClick={() => selectPreset(key)}
                            className={`py-1.5 px-2 text-xs border transition-colors cursor-pointer ${
                                params.preset === key
                                    ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                    : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                            }`}
                        >
                            {PRESET_DESCRIPTIONS[key].label}
                        </button>
                    ))}
                </div>
                {presetDesc && (
                    <div className="border border-lime-500/20 p-3 space-y-2">
                        <div className="text-xs text-lime-400 italic">{presetDesc.question}</div>
                        <div className="text-xs text-lime-200/40">{presetDesc.expectation}</div>
                    </div>
                )}
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">interpretation</h3>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-xs text-lime-200/70 leading-relaxed">{narrative}</div>
                </div>

                {snapshot ? (
                    <div className="space-y-2">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide">
                            current vs saved ({snapshot.label})
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <MetricDelta label="resonance gain" current={metrics.resonanceGain} saved={snapshot.metrics.resonanceGain} />
                            <MetricDelta label="search time" current={metrics.searchTime} saved={snapshot.metrics.searchTime} />
                            <MetricDelta label="target bias" current={metrics.targetBias} saved={snapshot.metrics.targetBias} />
                            <MetricDelta label="compressibility" current={metrics.compressibility} saved={snapshot.metrics.compressibility} />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="text-lime-200/60">resonance gain: <span className="text-lime-400">{(metrics.resonanceGain * 100).toFixed(1)}%</span></div>
                        <div className="text-lime-200/60">search time: <span className="text-lime-400">{(metrics.searchTime * 100).toFixed(1)}%</span></div>
                        <div className="text-lime-200/60">target bias: <span className="text-lime-400">{(metrics.targetBias * 100).toFixed(1)}%</span></div>
                        <div className="text-lime-200/60">compressibility: <span className="text-lime-400">{(metrics.compressibility * 100).toFixed(1)}%</span></div>
                    </div>
                )}
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

            <div className="space-y-2">
                {snapshot ? (
                    <Button
                        label="clear snapshot"
                        onClick={onClearSnapshot}
                        size="sm"
                        className="w-full"
                    />
                ) : (
                    <Button
                        label="save snapshot"
                        onClick={onSaveSnapshot}
                        size="sm"
                        className="w-full"
                    />
                )}
                <Button
                    label="reset preset"
                    onClick={() => selectPreset(params.preset)}
                    size="sm"
                    className="w-full"
                />
            </div>
        </div>
    );
}
