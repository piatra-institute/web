'use client';

import React from 'react';

import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';

import {
    Params,
    PresetKey,
    AnalyticalMetrics,
    LiveMetrics,
    Snapshot,
    PRESET_DESCRIPTIONS,
    presetParams,
} from '../../logic';


const PRESET_KEYS: PresetKey[] = [
    'subcritical',
    'critical',
    'supercritical',
    'avalanche-edge',
    'over-synchronised',
];

function MetricDelta({
    label,
    current,
    saved,
    higherIsBetter = true,
    format = (v: number) => v.toFixed(2),
}: {
    label: string;
    current: number;
    saved: number;
    higherIsBetter?: boolean;
    format?: (v: number) => string;
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
            {label}: <span className="text-lime-400">{format(current)}</span>{' '}
            <span className={color}>
                {arrow} {format(Math.abs(delta))}
            </span>
        </div>
    );
}

interface SettingsProps {
    params: Params;
    onParamsChange: (p: Params) => void;
    analytical: AnalyticalMetrics;
    live: LiveMetrics;
    narrative: string;
    snapshot: Snapshot | null;
    onSaveSnapshot: () => void;
    onClearSnapshot: () => void;
    onPulse: () => void;
    onReset: () => void;
}

export default function Settings({
    params,
    onParamsChange,
    analytical,
    live,
    narrative,
    snapshot,
    onSaveSnapshot,
    onClearSnapshot,
    onPulse,
    onReset,
}: SettingsProps) {
    const set = (partial: Partial<Params>) => onParamsChange({ ...params, ...partial });
    const selectPreset = (key: PresetKey) => onParamsChange(presetParams(key));
    const presetDesc = PRESET_DESCRIPTIONS[params.preset];

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">regime</h3>
                <div className="grid grid-cols-1 gap-2">
                    {PRESET_KEYS.map((key) => (
                        <button
                            key={key}
                            onClick={() => selectPreset(key)}
                            className={`py-1.5 px-2 text-xs border transition-colors cursor-pointer text-left ${
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
                            <MetricDelta
                                label="λ_max"
                                current={analytical.lambdaMax}
                                saved={snapshot.analytical.lambdaMax}
                                higherIsBetter={false}
                                format={(v) => v.toFixed(3)}
                            />
                            <MetricDelta
                                label="ξ"
                                current={analytical.correlationLengthEstimate}
                                saved={snapshot.analytical.correlationLengthEstimate}
                                format={(v) => v.toFixed(1)}
                            />
                            <MetricDelta
                                label="τ-fit"
                                current={live.tauObserved ?? 0}
                                saved={snapshot.live.tauObserved ?? 0}
                                higherIsBetter={false}
                                format={(v) => v.toFixed(2)}
                            />
                            <MetricDelta
                                label="gap"
                                current={live.spectralGap}
                                saved={snapshot.live.spectralGap}
                                format={(v) => v.toFixed(3)}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="text-lime-200/60">
                            λ_max: <span className="text-lime-400">{analytical.lambdaMax.toFixed(3)}</span>
                        </div>
                        <div className="text-lime-200/60">
                            ξ: <span className="text-lime-400">{analytical.correlationLengthEstimate.toFixed(1)}</span>
                        </div>
                        <div className="text-lime-200/60">
                            τ-fit: <span className="text-lime-400">{live.tauObserved !== null ? live.tauObserved.toFixed(2) : '-'}</span>
                        </div>
                        <div className="text-lime-200/60">
                            gap: <span className="text-lime-400">{live.spectralGap.toFixed(3)}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">drive</h3>
                <SliderInput label="gain" min={0} max={2} step={0.005} showDecimals
                    value={params.gain} onChange={(v) => set({ gain: v })} />
                <SliderInput label="damping" min={0.005} max={0.4} step={0.005} showDecimals
                    value={params.damping} onChange={(v) => set({ damping: v })} />
                <SliderInput label="speed" min={0.25} max={4} step={0.05} showDecimals
                    value={params.speed} onChange={(v) => set({ speed: v })} />
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">coupling</h3>
                <SliderInput label="local" min={0.05} max={0.95} step={0.01} showDecimals
                    value={params.localCoupling} onChange={(v) => set({ localCoupling: v })} />
                <SliderInput label="distant" min={0} max={0.4} step={0.005} showDecimals
                    value={params.distantCoupling} onChange={(v) => set({ distantCoupling: v })} />
                <SliderInput label="noise" min={0} max={0.06} step={0.001} showDecimals
                    value={params.noise} onChange={(v) => set({ noise: v })} />
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">pulse</h3>
                <SliderInput label="width" min={1} max={18} step={1}
                    value={params.pulseWidth} onChange={(v) => set({ pulseWidth: v })} />
                <Button label="inject pulse" onClick={onPulse} size="sm" className="w-full" />
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-2">
                {snapshot ? (
                    <Button label="clear snapshot" onClick={onClearSnapshot} size="sm" className="w-full" />
                ) : (
                    <Button label="save snapshot" onClick={onSaveSnapshot} size="sm" className="w-full" />
                )}
                <Button label="reset preset" onClick={() => selectPreset(params.preset)} size="sm" className="w-full" />
                <Button label="reset lattice" onClick={onReset} size="sm" className="w-full" />
            </div>
        </div>
    );
}
