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


const PRESET_KEYS: PresetKey[] = [
    'museum-masterpiece',
    'ai-image-feed',
    'war-archive',
    'meme-relic',
    'luxury-object',
];

function MetricDelta({
    label,
    current,
    saved,
    higherIsBetter = true,
}: {
    label: string;
    current: number;
    saved: number;
    higherIsBetter?: boolean;
}) {
    const delta = current - saved;
    const arrow = delta > 0.005 ? '↑' : delta < -0.005 ? '↓' : '=';
    const positive = higherIsBetter ? delta > 0.005 : delta < -0.005;
    const negative = higherIsBetter ? delta < -0.005 : delta > 0.005;
    const color = positive
        ? 'text-lime-400'
        : negative
            ? 'text-orange-400'
            : 'text-lime-200/40';
    return (
        <div className="text-lime-200/60 text-xs font-mono">
            {label}: <span className="text-lime-400">{(current * 100).toFixed(0)}%</span>{' '}
            <span className={color}>
                {arrow} {Math.abs(delta * 100).toFixed(0)}%
            </span>
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
                <h3 className="text-lime-400 font-semibold text-sm">situation</h3>
                <div className="grid grid-cols-2 gap-2">
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
                        <div className="text-xs text-lime-400 italic">
                            {presetDesc.question}
                        </div>
                        <div className="text-xs text-lime-200/40">
                            {presetDesc.expectation}
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">interpretation</h3>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-xs text-lime-200/70 leading-relaxed">
                        {narrative}
                    </div>
                </div>

                {snapshot ? (
                    <div className="space-y-2">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide">
                            current vs saved ({snapshot.label})
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <MetricDelta
                                label="aura intensity"
                                current={metrics.auraIntensity}
                                saved={snapshot.metrics.auraIntensity}
                            />
                            <MetricDelta
                                label="curvature"
                                current={metrics.curvature}
                                saved={snapshot.metrics.curvature}
                            />
                            <MetricDelta
                                label="holonomy"
                                current={metrics.holonomy}
                                saved={snapshot.metrics.holonomy}
                            />
                            <MetricDelta
                                label="sheaf tension"
                                current={metrics.sheafTension}
                                saved={snapshot.metrics.sheafTension}
                                higherIsBetter={false}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="text-lime-200/60">
                            aura: <span className="text-lime-400">{(metrics.auraIntensity * 100).toFixed(0)}%</span>
                        </div>
                        <div className="text-lime-200/60">
                            curvature: <span className="text-lime-400">{(metrics.curvature * 100).toFixed(0)}%</span>
                        </div>
                        <div className="text-lime-200/60">
                            holonomy: <span className="text-lime-400">{(metrics.holonomy * 100).toFixed(0)}%</span>
                        </div>
                        <div className="text-lime-200/60">
                            tension: <span className="text-lime-400">{(metrics.sheafTension * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">object</h3>
                <SliderInput
                    label="singularity"
                    min={0} max={1} step={0.01}
                    value={params.objectSingularity}
                    onChange={(v) => set({ objectSingularity: v })}
                    showDecimals
                />
                <SliderInput
                    label="formal density"
                    min={0} max={1} step={0.01}
                    value={params.formalDensity}
                    onChange={(v) => set({ formalDensity: v })}
                    showDecimals
                />
                <SliderInput
                    label="embodied trace"
                    min={0} max={1} step={0.01}
                    value={params.embodiedTrace}
                    onChange={(v) => set({ embodiedTrace: v })}
                    showDecimals
                />
                <SliderInput
                    label="reproduction saturation"
                    min={0} max={1} step={0.01}
                    value={params.reproductionSaturation}
                    onChange={(v) => set({ reproductionSaturation: v })}
                    showDecimals
                />
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">context</h3>
                <SliderInput
                    label="ritual distance"
                    min={0} max={1} step={0.01}
                    value={params.ritualDistance}
                    onChange={(v) => set({ ritualDistance: v })}
                    showDecimals
                />
                <SliderInput
                    label="institutional authority"
                    min={0} max={1} step={0.01}
                    value={params.institutionalAuthority}
                    onChange={(v) => set({ institutionalAuthority: v })}
                    showDecimals
                />
                <SliderInput
                    label="scarcity"
                    min={0} max={1} step={0.01}
                    value={params.scarcity}
                    onChange={(v) => set({ scarcity: v })}
                    showDecimals
                />
                <SliderInput
                    label="market pressure"
                    min={0} max={1} step={0.01}
                    value={params.marketPressure}
                    onChange={(v) => set({ marketPressure: v })}
                    showDecimals
                />
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">observer</h3>
                <SliderInput
                    label="training"
                    min={0} max={1} step={0.01}
                    value={params.observerTraining}
                    onChange={(v) => set({ observerTraining: v })}
                    showDecimals
                />
                <SliderInput
                    label="desire"
                    min={0} max={1} step={0.01}
                    value={params.observerDesire}
                    onChange={(v) => set({ observerDesire: v })}
                    showDecimals
                />
                <SliderInput
                    label="alienation"
                    min={0} max={1} step={0.01}
                    value={params.observerAlienation}
                    onChange={(v) => set({ observerAlienation: v })}
                    showDecimals
                />
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">history</h3>
                <SliderInput
                    label="historical depth"
                    min={0} max={1} step={0.01}
                    value={params.historicalDepth}
                    onChange={(v) => set({ historicalDepth: v })}
                    showDecimals
                />
                <SliderInput
                    label="trauma index"
                    min={0} max={1} step={0.01}
                    value={params.traumaIndex}
                    onChange={(v) => set({ traumaIndex: v })}
                    showDecimals
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
