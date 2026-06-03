'use client';

import React from 'react';

import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';
import MetricDelta from '@/components/MetricDelta';

import {
    FIELD_GROUPS,
    FIELD_HINTS,
    FIELD_LABELS,
    FIELD_RANGES,
    PRESET_KEYS,
    SCENARIOS,
    applyPreset,
    clampTokenIndices,
    type FieldKey,
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
    onRandomize: () => void;
}


export default function Settings({
    params,
    onParamsChange,
    metrics,
    narrative,
    snapshot,
    onSaveSnapshot,
    onClearSnapshot,
    onRandomize,
}: SettingsProps) {
    const setField = (k: FieldKey, v: number) => {
        const next: Params = { ...params, [k]: v };
        onParamsChange(clampTokenIndices(next));
    };
    const setTokenI = (v: number) => onParamsChange({ ...params, tokenI: Math.round(v) });
    const setTokenJ = (v: number) => onParamsChange({ ...params, tokenJ: Math.round(v) });
    const selectPreset = (k: PresetKey) => onParamsChange(applyPreset(params, k));
    const loadCanonical = () => onParamsChange(applyPreset(params, params.preset));

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">preset</h3>
                <div className="grid grid-cols-1 gap-1.5">
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
                            {SCENARIOS[key].label}
                        </button>
                    ))}
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-xs text-lime-200/70 leading-relaxed italic">
                        {SCENARIOS[params.preset].subtitle}
                    </div>
                </div>
                <Button
                    label="load canonical preset"
                    onClick={loadCanonical}
                    size="sm"
                    className="w-full"
                />
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
                            <MetricDelta label="conc" current={metrics.concentration} saved={snapshot.metrics.concentration} isPercent decimals={0} />
                            <MetricDelta label="ctx" current={metrics.contextWidth} saved={snapshot.metrics.contextWidth} decimals={1} eps={0.05} />
                            <MetricDelta label="near" current={metrics.nearbyMass} saved={snapshot.metrics.nearbyMass} decimals={2} eps={0.005} />
                            <MetricDelta label="far" current={metrics.distantMass} saved={snapshot.metrics.distantMass} decimals={2} eps={0.005} higherIsBetter={false} />
                            <MetricDelta label="drift" current={metrics.translationDrift} saved={snapshot.metrics.translationDrift} decimals={2} eps={0.005} higherIsBetter={false} />
                            <MetricDelta label="phase" current={metrics.phaseAdvance} saved={snapshot.metrics.phaseAdvance} decimals={0} eps={1} />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="text-lime-200/60">conc: <span className="text-lime-400">{(metrics.concentration * 100).toFixed(0)}%</span></div>
                        <div className="text-lime-200/60">ctx: <span className="text-lime-400">{metrics.contextWidth.toFixed(1)}</span></div>
                        <div className="text-lime-200/60">near: <span className="text-lime-400">{metrics.nearbyMass.toFixed(2)}</span></div>
                        <div className="text-lime-200/60">far: <span className="text-lime-400">{metrics.distantMass.toFixed(2)}</span></div>
                        <div className="text-lime-200/60">drift: <span className="text-lime-400">{metrics.translationDrift.toFixed(2)}</span></div>
                        <div className="text-lime-200/60">phase: <span className="text-lime-400">{metrics.phaseAdvance.toFixed(0)}°</span></div>
                    </div>
                )}
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold text-sm">selected tokens</h3>
                <div title="query token position i. moves where the attention row is read.">
                    <SliderInput
                        label="query token i"
                        min={0}
                        max={params.seqLen - 1}
                        step={1}
                        value={params.tokenI}
                        onChange={setTokenI}
                    />
                </div>
                <div title="key token position j. the selected (i, j) score is highlighted.">
                    <SliderInput
                        label="key token j"
                        min={0}
                        max={params.seqLen - 1}
                        step={1}
                        value={params.tokenJ}
                        onChange={setTokenJ}
                    />
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold text-sm">parameters</h3>
                <div className="text-[10px] text-lime-200/40 italic leading-relaxed">
                    geometry on the RoPE side, oscillation on the neural side. hover labels for hints.
                </div>
                {FIELD_GROUPS.map((group) => (
                    <div key={group.title} className="space-y-3">
                        <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">
                            {group.title}
                        </div>
                        {group.keys.map((k) => {
                            const r = FIELD_RANGES[k];
                            return (
                                <div key={k} title={FIELD_HINTS[k]}>
                                    <SliderInput
                                        label={FIELD_LABELS[k]}
                                        min={r.min}
                                        max={r.max}
                                        step={r.step}
                                        value={params[k]}
                                        onChange={(v) => setField(k, v)}
                                        showDecimals={r.step < 1}
                                    />
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-2">
                <Button label="randomize q, k vectors" onClick={onRandomize} size="sm" className="w-full" />
                {snapshot ? (
                    <Button label="clear snapshot" onClick={onClearSnapshot} size="sm" className="w-full" />
                ) : (
                    <Button label="save snapshot" onClick={onSaveSnapshot} size="sm" className="w-full" />
                )}
                <Button label="reset preset" onClick={loadCanonical} size="sm" className="w-full" />
            </div>
        </div>
    );
}
