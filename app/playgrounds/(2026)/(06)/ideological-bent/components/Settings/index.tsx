'use client';

import React from 'react';

import Button from '@/components/Button';
import SliderInput from '@/components/SliderInput';
import Toggle from '@/components/Toggle';
import Dropdown from '@/components/Dropdown';
import MetricDelta from '@/components/MetricDelta';

import {
    SCENARIOS,
    SCENARIO_KEYS,
    type Metrics,
    type Params,
    type Scenario,
    type Snapshot,
} from '../../logic';


interface SettingsProps {
    params: Params;
    onParamsChange: (p: Params) => void;
    scenario: Scenario;
    metrics: Metrics;
    snapshot: Snapshot | null;
    onSelectScenario: (id: string) => void;
    onLoadExample: () => void;
    onResetForecasts: () => void;
    onSaveSnapshot: () => void;
    onClearSnapshot: () => void;
}


export default function Settings({
    params,
    onParamsChange,
    scenario,
    metrics,
    snapshot,
    onSelectScenario,
    onLoadExample,
    onResetForecasts,
    onSaveSnapshot,
    onClearSnapshot,
}: SettingsProps) {
    const scenarioTitles = SCENARIO_KEYS.map((k) => SCENARIOS[k].title);
    const currentTitle = scenario.title;

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">scenario</h3>
                <Dropdown
                    name="case"
                    selected={currentTitle}
                    selectables={scenarioTitles}
                    atSelect={(title) => {
                        const id = SCENARIO_KEYS.find((k) => SCENARIOS[k].title === title);
                        if (id) onSelectScenario(id);
                    }}
                />
                <div className="border border-lime-500/20 p-3 text-xs text-lime-200/70 leading-relaxed">
                    {scenario.proposition}
                </div>
                <Toggle
                    text="blind actor labels"
                    value={params.blind}
                    toggle={() => onParamsChange({ ...params, blind: !params.blind })}
                    tooltip="Hide which actor is which so the facts lead. The diagnostics are identical either way."
                />
                <div className="grid grid-cols-2 gap-1.5">
                    <Button label="load example" onClick={onLoadExample} size="sm" />
                    <Button label="reset forecasts" onClick={onResetForecasts} size="sm" />
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">assumptions held constant</h3>
                <div className="text-[11px] text-lime-200/50 leading-relaxed">
                    these facts are the same for both actors. move them and the baseline bars recompute live.
                </div>
                {scenario.assumptions.map((a) => (
                    <div key={a.id}>
                        <SliderInput
                            label={a.label}
                            value={params.assumptions[a.id] ?? a.value}
                            onChange={(v) => onParamsChange({ ...params, assumptions: { ...params.assumptions, [a.id]: v } })}
                            min={0}
                            max={100}
                            step={1}
                        />
                        <div className="flex justify-between text-[10px] text-lime-200/40 -mt-1">
                            <span>{a.min}</span>
                            <span>{a.max}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">your bent</h3>
                {snapshot ? (
                    <div className="space-y-2">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide">current vs saved ({snapshot.label})</div>
                        <div className="grid grid-cols-1 gap-2">
                            <MetricDelta label="bent score" current={metrics.bentScore} saved={snapshot.bentScore} decimals={2} higherIsBetter={false} />
                            <MetricDelta label="brittleness" current={metrics.brittleness} saved={snapshot.brittleness} decimals={3} higherIsBetter={false} />
                            <MetricDelta label="inadmissibility bits" current={metrics.inadmissibilityBits} saved={snapshot.inadmissibilityBits} decimals={2} higherIsBetter={false} />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-1.5 text-xs font-mono">
                        <div className="text-lime-200/60">bent score: <span className="text-lime-400">{metrics.bentScore.toFixed(2)}</span></div>
                        <div className="text-lime-200/60">brittleness: <span className="text-lime-400">{metrics.brittleness.toFixed(3)}</span></div>
                        <div className="text-lime-200/60">inadmissibility: <span className="text-lime-400">{metrics.inadmissibilityBits.toFixed(2)} bits</span></div>
                    </div>
                )}
                {snapshot ? (
                    <Button label="clear snapshot" onClick={onClearSnapshot} size="sm" className="w-full" />
                ) : (
                    <Button label="save snapshot" onClick={onSaveSnapshot} size="sm" className="w-full" />
                )}
            </div>
        </div>
    );
}
