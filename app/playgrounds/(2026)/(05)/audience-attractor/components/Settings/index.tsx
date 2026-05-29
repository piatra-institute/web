'use client';

import React from 'react';

import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';
import MetricDelta from '@/components/MetricDelta';

import {
    FIELD_GROUPS,
    FIELD_HINTS,
    FIELD_KEYS,
    FIELD_LABELS,
    FIELD_RANGES,
    SCENARIOS,
    SCENARIO_KEYS,
    applyCase,
    type FieldKey,
    type Metrics,
    type Params,
    type ScenarioKey,
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
    const setField = (k: FieldKey, v: number) => onParamsChange({ ...params, [k]: v });
    const selectCase = (k: ScenarioKey) => onParamsChange(applyCase(params, k));
    const loadCanonical = () => onParamsChange(applyCase(params, params.case));

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">scenario</h3>
                <div className="grid grid-cols-2 gap-1.5">
                    {SCENARIO_KEYS.map((key) => (
                        <button
                            key={key}
                            onClick={() => selectCase(key)}
                            className={`py-1.5 px-2 text-xs border transition-colors cursor-pointer text-left ${
                                params.case === key
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
                        {SCENARIOS[params.case].subtitle}
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
                            <MetricDelta label="final" current={metrics.finalViewers} saved={snapshot.metrics.finalViewers} />
                            <MetricDelta label="peak" current={metrics.peakViewers} saved={snapshot.metrics.peakViewers} />
                            <MetricDelta label="trough" current={metrics.troughViewers} saved={snapshot.metrics.troughViewers} />
                            <MetricDelta label="dwell" current={metrics.dwellShare} saved={snapshot.metrics.dwellShare} isPercent decimals={0} />
                            <MetricDelta label="core" current={metrics.coreShare} saved={snapshot.metrics.coreShare} isPercent decimals={0} />
                            <MetricDelta label="log range" current={metrics.logRange} saved={snapshot.metrics.logRange} decimals={2} higherIsBetter={false} eps={0.5} />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="text-lime-200/60">final: <span className="text-lime-400">{Math.round(metrics.finalViewers).toLocaleString()}</span></div>
                        <div className="text-lime-200/60">peak: <span className="text-lime-400">{Math.round(metrics.peakViewers).toLocaleString()}</span></div>
                        <div className="text-lime-200/60">trough: <span className="text-lime-400">{Math.round(metrics.troughViewers).toLocaleString()}</span></div>
                        <div className="text-lime-200/60">dwell: <span className="text-lime-400">{(metrics.dwellShare * 100).toFixed(0)}%</span></div>
                        <div className="text-lime-200/60">core: <span className="text-lime-400">{(metrics.coreShare * 100).toFixed(0)}%</span></div>
                        <div className="text-lime-200/60">log range: <span className="text-lime-400">{metrics.logRange.toFixed(2)}</span></div>
                    </div>
                )}
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold text-sm">parameters</h3>
                <div className="text-[10px] text-lime-200/40 italic leading-relaxed">
                    twelve dials grouped by role. hover the labels for hints.
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
                {snapshot ? (
                    <Button label="clear snapshot" onClick={onClearSnapshot} size="sm" className="w-full" />
                ) : (
                    <Button label="save snapshot" onClick={onSaveSnapshot} size="sm" className="w-full" />
                )}
                <Button label="reset scenario" onClick={loadCanonical} size="sm" className="w-full" />
            </div>

            {/* silence unused-import warnings; FIELD_KEYS is reachable through FIELD_GROUPS */}
            <span className="hidden">{FIELD_KEYS.length}</span>
        </div>
    );
}
