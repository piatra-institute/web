'use client';

import React from 'react';

import Button from '@/components/Button';
import SliderInput from '@/components/SliderInput';
import Toggle from '@/components/Toggle';
import Dropdown from '@/components/Dropdown';
import MetricDelta from '@/components/MetricDelta';

import {
    INTEREST_MODELS,
    INTEREST_MODEL_KEYS,
    SCENARIOS,
    SCENARIO_KEYS,
    type InterestModelKey,
    type Params,
    type ScenarioMetric,
    type Snapshot,
} from '../../logic';


interface SettingsProps {
    params: Params;
    onParamsChange: (p: Params) => void;
    focus: ScenarioMetric | undefined;
    narrative: string;
    snapshot: Snapshot | null;
    onSaveSnapshot: () => void;
    onClearSnapshot: () => void;
    onReset: () => void;
}


export default function Settings({
    params,
    onParamsChange,
    focus,
    narrative,
    snapshot,
    onSaveSnapshot,
    onClearSnapshot,
    onReset,
}: SettingsProps) {
    const set = (patch: Partial<Params>) => onParamsChange({ ...params, ...patch });

    const focusTitle = SCENARIOS[params.focusScenario]?.group ?? '';
    const model = INTEREST_MODELS[params.interestModel];

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">case</h3>
                <Dropdown
                    name="group"
                    selected={focusTitle}
                    selectables={SCENARIO_KEYS.map((k) => SCENARIOS[k].group)}
                    atSelect={(group) => {
                        const id = SCENARIO_KEYS.find((k) => SCENARIOS[k].group === group);
                        if (id) set({ focusScenario: id });
                    }}
                />
                <div className="border border-lime-500/20 p-3 text-xs text-lime-200/70 leading-relaxed">
                    {SCENARIOS[params.focusScenario]?.note}
                </div>
                <div className="text-[10px] text-lime-200/40 leading-relaxed">
                    {SCENARIOS[params.focusScenario]?.group} &rarr; {SCENARIOS[params.focusScenario]?.coalition}. synthetic
                    illustration, not a claim about real voters.
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">interest model</h3>
                <div className="grid grid-cols-2 gap-1.5">
                    {INTEREST_MODEL_KEYS.map((key: InterestModelKey) => (
                        <button
                            key={key}
                            onClick={() => set({ interestModel: key })}
                            className={`py-1.5 px-2 text-[11px] border text-left transition-colors cursor-pointer ${
                                params.interestModel === key
                                    ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                    : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                            }`}
                        >
                            {INTEREST_MODELS[key].label}
                        </button>
                    ))}
                </div>
                <div className="border border-lime-500/20 p-3 text-[11px] text-lime-200/70 leading-relaxed">
                    {model.blurb}
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">scoring</h3>
                <Toggle
                    text={params.net ? 'net (tradeoff-adjusted)' : 'gross (raw priority risk)'}
                    value={params.net}
                    toggle={() => set({ net: !params.net })}
                    tooltip="Gross is raw priority risk. Net subtracts a protective benefit and the tolerance and applies the interest weights."
                />
                <Toggle
                    text={params.populationWeighted ? 'population-weighted' : 'per supporter'}
                    value={params.populationWeighted}
                    toggle={() => set({ populationWeighted: !params.populationWeighted })}
                    tooltip="Population-weighted multiplies per-supporter risk by the group's vote share, so a large bloc can outweigh a small high-risk one."
                />
                <Toggle
                    text="show uncertainty (90%)"
                    value={params.showUncertainty}
                    toggle={() => set({ showUncertainty: !params.showUncertainty })}
                    tooltip="A seeded Monte Carlo perturbs every cell with a Beta around its value and reports a 90% interval."
                />
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">assumptions</h3>
                <SliderInput
                    label="implementation climate"
                    value={params.implementationClimate}
                    onChange={(v) => set({ implementationClimate: v })}
                    min={0}
                    max={150}
                    step={1}
                />
                <SliderInput
                    label="awareness weight"
                    value={params.awarenessWeight}
                    onChange={(v) => set({ awarenessWeight: v })}
                    min={0}
                    max={100}
                    step={1}
                />
                <SliderInput
                    label="salience emphasis"
                    value={params.salienceEmphasis}
                    onChange={(v) => set({ salienceEmphasis: v })}
                    min={0}
                    max={100}
                    step={1}
                />
                <SliderInput
                    label="tolerance &tau;"
                    value={params.tolerance}
                    onChange={(v) => set({ tolerance: v })}
                    min={0}
                    max={30}
                    step={1}
                />
            </div>

            {narrative && (
                <div className="border border-lime-500/20 p-3 text-xs text-lime-200/70 leading-relaxed">
                    {narrative}
                </div>
            )}

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">{focusTitle} score</h3>
                {focus && snapshot ? (
                    <div className="space-y-2">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide">
                            current vs saved ({snapshot.label}, {snapshot.interestModel})
                        </div>
                        <MetricDelta label="display score" current={focus.display} saved={snapshot.display} decimals={3} higherIsBetter={false} />
                        <MetricDelta label="net per supporter" current={focus.netPerSupporter} saved={snapshot.netPerSupporter} decimals={3} higherIsBetter={false} />
                        <MetricDelta label="rank" current={focus.rank} saved={snapshot.rank} decimals={0} higherIsBetter={false} />
                    </div>
                ) : focus ? (
                    <div className="grid grid-cols-1 gap-1.5 text-xs font-mono">
                        <div className="text-lime-200/60">display: <span className="text-lime-400">{focus.display.toFixed(3)}</span></div>
                        <div className="text-lime-200/60">net / supporter: <span className="text-lime-400">{focus.netPerSupporter.toFixed(3)}</span></div>
                        <div className="text-lime-200/60">rank: <span className="text-lime-400">#{focus.rank} of {SCENARIO_KEYS.length}</span></div>
                    </div>
                ) : null}
                {snapshot ? (
                    <Button label="clear snapshot" onClick={onClearSnapshot} size="sm" className="w-full" />
                ) : (
                    <Button label="save snapshot" onClick={onSaveSnapshot} size="sm" className="w-full" />
                )}
                <Button label="reset" onClick={onReset} size="sm" className="w-full" />
            </div>
        </div>
    );
}
