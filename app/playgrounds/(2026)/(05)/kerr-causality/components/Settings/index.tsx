'use client';

import React from 'react';

import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';
import MetricDelta from '@/components/MetricDelta';

import {
    CASES,
    CASE_KEYS,
    FIELD_HINTS,
    FIELD_KEYS,
    FIELD_LABELS,
    FIELD_RANGES,
    applyCase,
    type CaseKey,
    type FieldKey,
    type Metrics,
    type Params,
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
    phase: number;
    onPhaseChange: (p: number) => void;
    playing: boolean;
    onPlayToggle: () => void;
    onReplay: () => void;
}

export default function Settings({
    params,
    onParamsChange,
    metrics,
    narrative,
    snapshot,
    onSaveSnapshot,
    onClearSnapshot,
    phase,
    onPhaseChange,
    playing,
    onPlayToggle,
    onReplay,
}: SettingsProps) {
    const setField = (k: FieldKey, v: number) => onParamsChange({ ...params, [k]: v });
    const selectCase = (k: CaseKey) => onParamsChange(applyCase(params, k));
    const loadCanonical = () => onParamsChange(applyCase(params, params.case));

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">scenario</h3>
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
                <h3 className="text-lime-400 font-semibold text-sm">parameters</h3>
                <div className="text-[10px] text-lime-200/40 italic leading-relaxed">
                    four Kerr constants. units M = 1. hover the labels for hints.
                </div>
                {FIELD_KEYS.map((k) => {
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
                                showDecimals
                            />
                        </div>
                    );
                })}
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">animation</h3>
                <SliderInput
                    label="photon phase"
                    min={0}
                    max={1}
                    step={0.001}
                    value={phase}
                    onChange={onPhaseChange}
                    showDecimals
                />
                <div className="grid grid-cols-2 gap-2">
                    <Button label={playing ? 'pause' : 'play'} onClick={onPlayToggle} size="sm" className="w-full" />
                    <Button label="replay" onClick={onReplay} size="sm" className="w-full" />
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
                            <MetricDelta label="span" current={metrics.allowedSpan} saved={snapshot.metrics.allowedSpan} decimals={2} />
                            <MetricDelta label="rmin" current={metrics.rMin} saved={snapshot.metrics.rMin} decimals={2} />
                            <MetricDelta label="rmax" current={metrics.rMax} saved={snapshot.metrics.rMax} decimals={2} />
                            <MetricDelta label="r+" current={metrics.rPlus} saved={snapshot.metrics.rPlus} decimals={2} />
                            <MetricDelta label="r-" current={metrics.rMinus} saved={snapshot.metrics.rMinus} decimals={2} />
                            <MetricDelta label="cross" current={metrics.crossings} saved={snapshot.metrics.crossings} decimals={0} />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="text-lime-200/60">span: <span className="text-lime-400">{metrics.allowedSpan.toFixed(3)}</span></div>
                        <div className="text-lime-200/60">cross: <span className="text-lime-400">{metrics.crossings}</span></div>
                        <div className="text-lime-200/60">rmin: <span className="text-lime-400">{Number.isFinite(metrics.rMin) ? metrics.rMin.toFixed(3) : 'n/a'}</span></div>
                        <div className="text-lime-200/60">rmax: <span className="text-lime-400">{Number.isFinite(metrics.rMax) ? metrics.rMax.toFixed(3) : 'n/a'}</span></div>
                        <div className="text-lime-200/60">r-: <span className="text-lime-400">{metrics.rMinus.toFixed(3)}</span></div>
                        <div className="text-lime-200/60">r+: <span className="text-lime-400">{metrics.rPlus.toFixed(3)}</span></div>
                    </div>
                )}
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-2">
                {snapshot ? (
                    <Button label="clear snapshot" onClick={onClearSnapshot} size="sm" className="w-full" />
                ) : (
                    <Button label="save snapshot" onClick={onSaveSnapshot} size="sm" className="w-full" />
                )}
                <Button
                    label="reset case"
                    onClick={loadCanonical}
                    size="sm"
                    className="w-full"
                />
            </div>
        </div>
    );
}
