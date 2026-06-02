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
                <div className="grid grid-cols-1 gap-1.5">
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
                            <MetricDelta label="belief" current={metrics.finalBelief} saved={snapshot.metrics.finalBelief} isPercent decimals={0} higherIsBetter={false} />
                            <MetricDelta label="harm" current={metrics.finalHarm} saved={snapshot.metrics.finalHarm} isPercent decimals={0} higherIsBetter={false} />
                            <MetricDelta label="attach" current={metrics.finalAttachment} saved={snapshot.metrics.finalAttachment} isPercent decimals={0} />
                            <MetricDelta label="family" current={metrics.finalFamily} saved={snapshot.metrics.finalFamily} isPercent decimals={0} />
                            <MetricDelta label="trust" current={metrics.finalTrust} saved={snapshot.metrics.finalTrust} isPercent decimals={0} />
                            <MetricDelta label="loss" current={metrics.cumulativeLoss} saved={snapshot.metrics.cumulativeLoss} decimals={1} higherIsBetter={false} eps={0.5} />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="text-lime-200/60">belief: <span className="text-lime-400">{(metrics.finalBelief * 100).toFixed(0)}%</span></div>
                        <div className="text-lime-200/60">harm: <span className="text-lime-400">{(metrics.finalHarm * 100).toFixed(0)}%</span></div>
                        <div className="text-lime-200/60">attach: <span className="text-lime-400">{(metrics.finalAttachment * 100).toFixed(0)}%</span></div>
                        <div className="text-lime-200/60">family: <span className="text-lime-400">{(metrics.finalFamily * 100).toFixed(0)}%</span></div>
                        <div className="text-lime-200/60">trust: <span className="text-lime-400">{(metrics.finalTrust * 100).toFixed(0)}%</span></div>
                        <div className="text-lime-200/60">loss: <span className="text-lime-400">{metrics.cumulativeLoss.toFixed(1)}</span></div>
                    </div>
                )}
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold text-sm">institutional weights</h3>
                <div className="text-[10px] text-lime-200/40 italic leading-relaxed">
                    ten dials grouped by role. hover the labels for hints.
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
        </div>
    );
}
