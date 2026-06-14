'use client';

import React from 'react';

import Button from '@/components/Button';
import SliderInput from '@/components/SliderInput';
import Toggle from '@/components/Toggle';
import MetricDelta from '@/components/MetricDelta';

import {
    PRESET_DESCRIPTIONS,
    TEMPLATE_KEYS,
    TEMPLATE_LABELS,
    presetParams,
    type Metrics,
    type Params,
    type PresetKey,
    type Snapshot,
    type TemplateKey,
} from '../../logic';


interface SettingsProps {
    params: Params;
    onParamsChange: (p: Params) => void;
    metrics: Metrics;
    narrative: string;
    preset: PresetKey;
    onPreset: (key: PresetKey) => void;
    snapshot: Snapshot | null;
    onSaveSnapshot: () => void;
    onClearSnapshot: () => void;
    onSeed: () => void;
    onLesion: () => void;
    onRandomize: () => void;
    onImprint: () => void;
}

const PRESET_KEYS = Object.keys(PRESET_DESCRIPTIONS) as PresetKey[];


export default function Settings({
    params,
    onParamsChange,
    metrics,
    narrative,
    preset,
    onPreset,
    snapshot,
    onSaveSnapshot,
    onClearSnapshot,
    onSeed,
    onLesion,
    onRandomize,
    onImprint,
}: SettingsProps) {
    const set = (patch: Partial<Params>) => onParamsChange({ ...params, ...patch });
    const presetInfo = PRESET_DESCRIPTIONS[preset];

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">stored morphology</h3>
                <div className="grid grid-cols-1 gap-1.5">
                    {TEMPLATE_KEYS.map((key: TemplateKey) => (
                        <button
                            key={key}
                            onClick={() => set({ template: key })}
                            className={`py-1.5 px-2 text-xs border transition-colors cursor-pointer text-left ${
                                params.template === key
                                    ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                    : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                            }`}
                        >
                            {TEMPLATE_LABELS[key]}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                    <Button label="seed target" onClick={onSeed} size="sm" />
                    <Button label="lesion" onClick={onLesion} size="sm" />
                    <Button label="randomize" onClick={onRandomize} size="sm" />
                    <Button label="imprint current" onClick={onImprint} size="sm" />
                </div>
                <Toggle
                    text="run relaxation"
                    value={params.running}
                    toggle={() => set({ running: !params.running })}
                    tooltip="Pause or resume the field dynamics. Seed, lesion, and imprint still work while paused."
                />
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">regime presets</h3>
                <div className="grid grid-cols-3 gap-1.5">
                    {PRESET_KEYS.map((key) => (
                        <button
                            key={key}
                            onClick={() => onPreset(key)}
                            className={`py-1.5 px-2 text-xs border transition-colors cursor-pointer ${
                                preset === key
                                    ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                    : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                            }`}
                        >
                            {PRESET_DESCRIPTIONS[key].label}
                        </button>
                    ))}
                </div>
                <div className="border border-lime-500/20 p-3 text-xs text-lime-200/70 leading-relaxed">
                    <div className="text-lime-300/90">{presetInfo.question}</div>
                    <div className="mt-1 text-lime-200/60">{presetInfo.expectation}</div>
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">field parameters</h3>
                <SliderInput
                    label="memory strength &alpha;"
                    value={params.memory}
                    onChange={(v) => set({ memory: v })}
                    min={0}
                    max={3}
                    step={0.01}
                    showDecimals
                />
                <SliderInput
                    label="diffusion D"
                    value={params.diffusion}
                    onChange={(v) => set({ diffusion: v })}
                    min={0}
                    max={1.5}
                    step={0.01}
                    showDecimals
                />
                <SliderInput
                    label="activation gain g"
                    value={params.gain}
                    onChange={(v) => set({ gain: v })}
                    min={0.5}
                    max={4}
                    step={0.01}
                    showDecimals
                />
                <SliderInput
                    label="noise &sigma;"
                    value={params.noise}
                    onChange={(v) => set({ noise: v })}
                    min={0}
                    max={0.25}
                    step={0.005}
                    showDecimals
                />
                <SliderInput
                    label="step size dt"
                    value={params.dt}
                    onChange={(v) => set({ dt: v })}
                    min={0.01}
                    max={0.3}
                    step={0.005}
                    showDecimals
                />
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">reading</h3>
                <div className="border border-lime-500/20 p-3 text-xs text-lime-200/70 leading-relaxed">
                    {narrative}
                </div>
                {snapshot ? (
                    <div className="space-y-2">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide">
                            current vs saved ({snapshot.label})
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <MetricDelta label="recovery" current={metrics.recovery} saved={snapshot.metrics.recovery} isPercent />
                            <MetricDelta label="energy" current={metrics.energy} saved={snapshot.metrics.energy} decimals={2} higherIsBetter={false} />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="text-lime-200/60">recovery: <span className="text-lime-400">{Math.round(metrics.recovery * 100)}%</span></div>
                        <div className="text-lime-200/60">energy: <span className="text-lime-400">{metrics.energy.toFixed(2)}</span></div>
                    </div>
                )}
            </div>

            <div className="border-t border-lime-500/20" />

            <div>
                {snapshot ? (
                    <Button label="clear snapshot" onClick={onClearSnapshot} size="sm" className="w-full" />
                ) : (
                    <Button label="save snapshot" onClick={onSaveSnapshot} size="sm" className="w-full" />
                )}
            </div>
        </div>
    );
}
