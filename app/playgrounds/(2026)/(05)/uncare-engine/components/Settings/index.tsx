'use client';

import React from 'react';

import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';
import MetricDelta from '@/components/MetricDelta';

import {
    AXIS_HINTS,
    AXIS_KEYS,
    AXIS_LABELS,
    CASES,
    CASE_KEYS,
    PRESET_DESCRIPTIONS,
    PRESET_KEYS,
    applyCanonical,
    presetParams,
    type AxisKey,
    type CaseKey,
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
    const setAxis = (k: AxisKey, v: number) => onParamsChange({ ...params, [k]: v });
    const selectCase = (k: CaseKey) => onParamsChange({ ...params, case: k });
    const selectPreset = (k: PresetKey) => onParamsChange(presetParams(params, k));
    const loadCanonical = () => onParamsChange(applyCanonical(params, params.case));
    const presetDesc = PRESET_DESCRIPTIONS[params.preset];

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">domain</h3>
                <div className="grid grid-cols-2 gap-1.5">
                    {CASE_KEYS.map((key) => (
                        <button
                            key={key}
                            onClick={() => selectCase(key)}
                            className={`py-1.5 px-2 text-xs border transition-colors cursor-pointer text-left ${
                                params.case === key
                                    ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                    : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                            }`}
                        >
                            {CASES[key].label}
                        </button>
                    ))}
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-xs text-lime-200/70 leading-relaxed italic">
                        {CASES[params.case].subtitle}
                    </div>
                </div>
                <Button
                    label="load canonical profile"
                    onClick={loadCanonical}
                    size="sm"
                    className="w-full"
                />
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">preset</h3>
                <div className="grid grid-cols-2 gap-1.5">
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
                <div className="border border-lime-500/20 p-3 space-y-2">
                    <div className="text-xs text-lime-400 italic">{presetDesc.question}</div>
                    <div className="text-xs text-lime-200/40">{presetDesc.expectation}</div>
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">reading</h3>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-xs text-lime-200/70 leading-relaxed">{narrative}</div>
                </div>
                {snapshot ? (
                    <div className="space-y-2">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide">
                            current vs saved ({snapshot.label})
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <MetricDelta label="madness" current={metrics.madness} saved={snapshot.metrics.madness} higherIsBetter={false} />
                            <MetricDelta label="escape" current={metrics.escapeVelocity} saved={snapshot.metrics.escapeVelocity} />
                            <MetricDelta label="inversion" current={metrics.inversionPressure} saved={snapshot.metrics.inversionPressure} higherIsBetter={false} />
                            <MetricDelta label="monstrous" current={metrics.monstrosityPotential} saved={snapshot.metrics.monstrosityPotential} higherIsBetter={false} />
                            <MetricDelta label="care" current={metrics.careCapacity} saved={snapshot.metrics.careCapacity} />
                            <MetricDelta label="backlash" current={metrics.backlashRisk} saved={snapshot.metrics.backlashRisk} higherIsBetter={false} />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="text-lime-200/60">madness: <span className="text-lime-400">{metrics.madness}</span></div>
                        <div className="text-lime-200/60">escape: <span className="text-lime-400">{metrics.escapeVelocity}</span></div>
                        <div className="text-lime-200/60">inversion: <span className="text-lime-400">{metrics.inversionPressure}</span></div>
                        <div className="text-lime-200/60">monstrous: <span className="text-lime-400">{metrics.monstrosityPotential}</span></div>
                        <div className="text-lime-200/60">care: <span className="text-lime-400">{metrics.careCapacity}</span></div>
                        <div className="text-lime-200/60">backlash: <span className="text-lime-400">{metrics.backlashRisk}</span></div>
                    </div>
                )}
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">axes</h3>
                <div className="text-[10px] text-lime-200/40 italic leading-relaxed">
                    six dials describing the moral-pressure situation. hover the labels for hints.
                </div>
                {AXIS_KEYS.map((k) => (
                    <div key={k} title={AXIS_HINTS[k]}>
                        <SliderInput
                            label={AXIS_LABELS[k]}
                            min={0}
                            max={100}
                            step={1}
                            value={params[k]}
                            onChange={(v) => setAxis(k, v)}
                        />
                    </div>
                ))}
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-2">
                {snapshot ? (
                    <Button label="clear snapshot" onClick={onClearSnapshot} size="sm" className="w-full" />
                ) : (
                    <Button label="save snapshot" onClick={onSaveSnapshot} size="sm" className="w-full" />
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
