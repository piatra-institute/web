'use client';

import React from 'react';

import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';

import {
    FIELD_GROUPS,
    FIELD_HINTS,
    FIELD_LABELS,
    OBJECTS,
    OBJECT_KEYS,
    PRESET_DESCRIPTIONS,
    PRESET_KEYS,
    REGIMES,
    REGIME_HINTS,
    REGIME_LABELS,
    presetParams,
    temperatureOf,
    type FieldKey,
    type Metrics,
    type ObjectKey,
    type Params,
    type PresetKey,
    type Regime,
    type Snapshot,
} from '../../logic';


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
    const arrow = delta > 0.5 ? '↑' : delta < -0.5 ? '↓' : '=';
    const positive = higherIsBetter ? delta > 0.5 : delta < -0.5;
    const negative = higherIsBetter ? delta < -0.5 : delta > 0.5;
    const color = positive
        ? 'text-lime-400'
        : negative
            ? 'text-orange-400'
            : 'text-lime-200/40';
    return (
        <div className="text-lime-200/60 text-xs font-mono">
            {label}: <span className="text-lime-400">{current}</span>{' '}
            <span className={color}>
                {arrow} {Math.abs(delta)}
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
    const setField = (k: FieldKey, v: number) => onParamsChange({ ...params, [k]: v });
    const selectObject = (k: ObjectKey) => onParamsChange({ ...params, object: k });
    const selectRegime = (r: Regime) => onParamsChange({ ...params, regime: r });
    const selectPreset = (k: PresetKey) => onParamsChange(presetParams(params, k));
    const presetDesc = PRESET_DESCRIPTIONS[params.preset];
    const tau = temperatureOf(params);

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">object</h3>
                <div className="grid grid-cols-2 gap-1.5">
                    {OBJECT_KEYS.map((key) => (
                        <button
                            key={key}
                            onClick={() => selectObject(key)}
                            className={`py-1.5 px-2 text-xs border transition-colors cursor-pointer text-left ${
                                params.object === key
                                    ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                    : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                            }`}
                        >
                            {OBJECTS[key].label}
                        </button>
                    ))}
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-xs text-lime-200/70 leading-relaxed italic">
                        {OBJECTS[params.object].subtitle}
                    </div>
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">signal regime</h3>
                <div className="grid grid-cols-3 gap-1.5">
                    {REGIMES.map((r) => (
                        <button
                            key={r}
                            onClick={() => selectRegime(r)}
                            className={`py-1.5 px-2 text-xs border transition-colors cursor-pointer ${
                                params.regime === r
                                    ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                    : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                            }`}
                        >
                            {REGIME_LABELS[r]}
                        </button>
                    ))}
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-xs text-lime-200/70 leading-relaxed">
                        {REGIME_HINTS[params.regime]}
                    </div>
                </div>
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
                            <MetricDelta label="salience" current={metrics.salience} saved={snapshot.metrics.salience} higherIsBetter={false} />
                            <MetricDelta label="over" current={metrics.overSalience} saved={snapshot.metrics.overSalience} higherIsBetter={false} />
                            <MetricDelta label="attention" current={metrics.attentionShare} saved={snapshot.metrics.attentionShare} higherIsBetter={false} />
                            <MetricDelta label="concentr" current={metrics.concentration} saved={snapshot.metrics.concentration} higherIsBetter={false} />
                            <MetricDelta label="meaning" current={metrics.meaning} saved={snapshot.metrics.meaning} />
                            <MetricDelta label="stability" current={metrics.stability} saved={snapshot.metrics.stability} />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="text-lime-200/60">salience: <span className="text-lime-400">{metrics.salience}</span></div>
                        <div className="text-lime-200/60">over: <span className="text-lime-400">{metrics.overSalience}</span></div>
                        <div className="text-lime-200/60">attention: <span className="text-lime-400">{metrics.attentionShare}</span></div>
                        <div className="text-lime-200/60">concentr: <span className="text-lime-400">{metrics.concentration}</span></div>
                        <div className="text-lime-200/60">meaning: <span className="text-lime-400">{metrics.meaning}</span></div>
                        <div className="text-lime-200/60">stability: <span className="text-lime-400">{metrics.stability}</span></div>
                    </div>
                )}
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold text-sm">salience field</h3>
                <div className="text-[10px] text-lime-200/40 italic leading-relaxed">
                    eight weights tuning how a cue becomes salient. hover the labels for hints.
                </div>
                {FIELD_GROUPS.map((group) => (
                    <div key={group.title} className="space-y-3">
                        <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">
                            {group.title}
                        </div>
                        {group.keys.map((k) => (
                            <div key={k} title={FIELD_HINTS[k]}>
                                <SliderInput
                                    label={FIELD_LABELS[k]}
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={params[k]}
                                    onChange={(v) => setField(k, v)}
                                />
                                {k === 'temperature' && (
                                    <div className="text-[10px] text-lime-200/40 font-mono mt-0.5">
                                        tau = {tau.toFixed(2)}
                                    </div>
                                )}
                            </div>
                        ))}
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
