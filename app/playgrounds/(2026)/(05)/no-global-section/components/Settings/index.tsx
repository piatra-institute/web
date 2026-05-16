'use client';

import React from 'react';

import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';

import {
    AXIS_HINTS,
    AXIS_KEYS,
    AXIS_LABELS,
    CASES,
    CASE_KEYS,
    LENSES,
    LENS_KEYS,
    PRESET_DESCRIPTIONS,
    applyCanonical,
    presetParams,
    type AxisKey,
    type CaseKey,
    type LensKey,
    type Metrics,
    type Params,
    type PresetKey,
    type Snapshot,
} from '../../logic';


const PRESET_KEYS: PresetKey[] = ['tragic', 'technocratic', 'mythic', 'modernist'];

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
    const setAxis = (k: AxisKey, v: number) => onParamsChange({ ...params, [k]: v });
    const selectCase = (k: CaseKey) => onParamsChange({ ...params, case: k });
    const selectLens = (k: LensKey) => onParamsChange({ ...params, lens: k });
    const selectPreset = (k: PresetKey) => onParamsChange(presetParams(params, k));
    const loadCanonical = () => onParamsChange(applyCanonical(params, params.case));
    const presetDesc = PRESET_DESCRIPTIONS[params.preset];

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">figure</h3>
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
                <h3 className="text-lime-400 font-semibold text-sm">lens</h3>
                <div className="grid grid-cols-2 gap-1.5">
                    {LENS_KEYS.map((key) => (
                        <button
                            key={key}
                            onClick={() => selectLens(key)}
                            className={`py-1.5 px-2 text-xs border transition-colors cursor-pointer text-left ${
                                params.lens === key
                                    ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                    : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                            }`}
                        >
                            {LENSES[key].label}
                        </button>
                    ))}
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-xs text-lime-200/70 leading-relaxed">
                        {LENSES[params.lens].foregrounds}
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
                            <MetricDelta label="obstruction" current={metrics.obstruction} saved={snapshot.metrics.obstruction} higherIsBetter={false} />
                            <MetricDelta label="glue" current={metrics.glue} saved={snapshot.metrics.glue} />
                            <MetricDelta label="mythic" current={metrics.mythicCharge} saved={snapshot.metrics.mythicCharge} />
                            <MetricDelta label="modernity" current={metrics.modernity} saved={snapshot.metrics.modernity} />
                            <MetricDelta label="germ" current={metrics.germPersistence} saved={snapshot.metrics.germPersistence} />
                            <MetricDelta label="twist" current={metrics.monodromyTwist} saved={snapshot.metrics.monodromyTwist} higherIsBetter={false} />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="text-lime-200/60">obstruction: <span className="text-lime-400">{metrics.obstruction}</span></div>
                        <div className="text-lime-200/60">glue: <span className="text-lime-400">{metrics.glue}</span></div>
                        <div className="text-lime-200/60">mythic: <span className="text-lime-400">{metrics.mythicCharge}</span></div>
                        <div className="text-lime-200/60">modernity: <span className="text-lime-400">{metrics.modernity}</span></div>
                        <div className="text-lime-200/60">germ: <span className="text-lime-400">{metrics.germPersistence}</span></div>
                        <div className="text-lime-200/60">twist: <span className="text-lime-400">{metrics.monodromyTwist}</span></div>
                    </div>
                )}
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">topology</h3>
                <div className="text-[10px] text-lime-200/40 italic leading-relaxed">
                    six axes describing the moral-topological situation. hover the labels for hints.
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
