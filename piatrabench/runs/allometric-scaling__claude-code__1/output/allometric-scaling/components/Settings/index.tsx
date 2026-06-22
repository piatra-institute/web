'use client';

import React from 'react';

import Button from '@/components/Button';
import SliderInput from '@/components/SliderInput';
import MetricDelta from '@/components/MetricDelta';

import {
    PRESET_DESCRIPTIONS,
    type Metrics,
    type Params,
    type PresetKey,
    type Snapshot,
} from '../../logic';


interface SettingsProps {
    params: Params;
    onParamsChange: (p: Params) => void;
    metrics: Metrics;
    narrative: string;
    onPreset: (key: PresetKey) => void;
    snapshot: Snapshot | null;
    onSaveSnapshot: () => void;
    onClearSnapshot: () => void;
}

const PRESET_KEYS = Object.keys(PRESET_DESCRIPTIONS) as PresetKey[];


export default function Settings({
    params,
    onParamsChange,
    metrics,
    narrative,
    onPreset,
    snapshot,
    onSaveSnapshot,
    onClearSnapshot,
}: SettingsProps) {
    const set = (patch: Partial<Params>) => onParamsChange({ ...params, ...patch });
    const info = PRESET_DESCRIPTIONS[params.preset];

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">scaling regime</h3>
                <div className="grid grid-cols-2 gap-1.5">
                    {PRESET_KEYS.map((key) => (
                        <button
                            key={key}
                            onClick={() => onPreset(key)}
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
                <div className="border border-lime-500/20 p-3 text-xs text-lime-200/70 leading-relaxed">
                    <div className="text-lime-300/90">{info.question}</div>
                    <div className="mt-1 text-lime-200/60">{info.expectation}</div>
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">power law</h3>
                <SliderInput
                    label="exponent a"
                    value={params.exponent}
                    onChange={(v) => set({ exponent: v })}
                    min={0.5}
                    max={1.1}
                    step={0.005}
                    showDecimals
                />
                <SliderInput
                    label="coefficient B&#8320; (W)"
                    value={params.coefficient}
                    onChange={(v) => set({ coefficient: v })}
                    min={0.5}
                    max={6}
                    step={0.05}
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
                            <MetricDelta label="error %" current={metrics.mape} saved={snapshot.metrics.mape} decimals={0} higherIsBetter={false} />
                            <MetricDelta label="log R2" current={metrics.r2} saved={snapshot.metrics.r2} decimals={2} />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="text-lime-200/60">error: <span className="text-lime-400">{metrics.mape.toFixed(0)}%</span></div>
                        <div className="text-lime-200/60">log R2: <span className="text-lime-400">{metrics.r2.toFixed(2)}</span></div>
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
