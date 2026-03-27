'use client';

import React from 'react';

import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';
import Toggle from '@/components/Toggle';

import {
    Params,
    Events,
    Metrics,
    Snapshot,
    PresetKey,
    PRESET_DESCRIPTIONS,
    presetParams,
    DEFAULT_EVENTS,
} from '../../logic';


const PRESET_KEYS: PresetKey[] = ['balanced', 'wartime', 'venture', 'monopoly', 'breakdown'];

function MetricDelta({ label, current, saved, lowerIsBetter }: {
    label: string;
    current: number;
    saved: number;
    lowerIsBetter?: boolean;
}) {
    const delta = current - saved;
    const arrow = delta > 0.5 ? '\u2191' : delta < -0.5 ? '\u2193' : '=';
    const improved = lowerIsBetter ? delta < -0.5 : delta > 0.5;
    const worsened = lowerIsBetter ? delta > 0.5 : delta < -0.5;
    const color = improved ? 'text-lime-400' : worsened ? 'text-orange-400' : 'text-lime-200/40';

    return (
        <div className="text-lime-200/60 text-xs font-mono">
            {label}: <span className="text-lime-400">{current.toFixed(1)}</span>
            {' '}
            <span className={color}>{arrow} {Math.abs(delta).toFixed(1)}</span>
        </div>
    );
}


interface SettingsProps {
    params: Params;
    onParamsChange: (p: Params) => void;
    events: Events;
    onEventsChange: (e: Events) => void;
    metrics: Metrics;
    narrative: string;
    snapshot: Snapshot | null;
    onSaveSnapshot: () => void;
    onClearSnapshot: () => void;
}

export default function Settings({
    params,
    onParamsChange,
    events,
    onEventsChange,
    metrics,
    narrative,
    snapshot,
    onSaveSnapshot,
    onClearSnapshot,
}: SettingsProps) {
    const set = (partial: Partial<Params>) =>
        onParamsChange({ ...params, ...partial });

    const selectPreset = (key: PresetKey) =>
        onParamsChange(presetParams(key));

    const presetDesc = PRESET_DESCRIPTIONS[params.preset];

    return (
        <div className="space-y-6">
            {/* Presets */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">regime presets</h3>
                <div className="grid grid-cols-2 gap-2">
                    {PRESET_KEYS.map((key) => (
                        <button
                            key={key}
                            onClick={() => selectPreset(key)}
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
                {presetDesc && (
                    <div className="border border-lime-500/20 p-3 space-y-2">
                        <div className="text-xs text-lime-400 italic">{presetDesc.question}</div>
                        <div className="text-xs text-lime-200/40">{presetDesc.expectation}</div>
                    </div>
                )}
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Narrative */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">interpretation</h3>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-xs text-lime-200/70 leading-relaxed">{narrative}</div>
                </div>

                {snapshot ? (
                    <div className="space-y-2">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide">
                            current vs saved ({snapshot.label})
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <MetricDelta label="welfare" current={metrics.welfareIndex} saved={snapshot.metrics.welfareIndex} />
                            <MetricDelta label="frontier" current={metrics.frontierIndex} saved={snapshot.metrics.frontierIndex} />
                            <MetricDelta label="concentration" current={metrics.concentrationIndex} saved={snapshot.metrics.concentrationIndex} lowerIsBetter />
                            <MetricDelta label="shortage" current={metrics.shortageIndex} saved={snapshot.metrics.shortageIndex} lowerIsBetter />
                            <MetricDelta label="state cap." current={metrics.stateCapacityIndex} saved={snapshot.metrics.stateCapacityIndex} />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="text-lime-200/60">welfare: <span className="text-lime-400">{metrics.welfareIndex.toFixed(1)}</span></div>
                        <div className="text-lime-200/60">frontier: <span className="text-lime-400">{metrics.frontierIndex.toFixed(1)}</span></div>
                        <div className="text-lime-200/60">concentration: <span className="text-lime-400">{metrics.concentrationIndex.toFixed(1)}</span></div>
                        <div className="text-lime-200/60">shortage: <span className="text-lime-400">{metrics.shortageIndex.toFixed(1)}</span></div>
                        <div className="text-lime-200/60">state cap.: <span className="text-lime-400">{metrics.stateCapacityIndex.toFixed(1)}</span></div>
                    </div>
                )}
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Profit controls */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">profit controls</h3>
                <SliderInput
                    label="direct profit control"
                    min={0} max={100} step={1}
                    value={params.profitControl}
                    onChange={(v) => set({ profitControl: v })}
                />
                <SliderInput
                    label="excess-profits tax"
                    min={0} max={100} step={1}
                    value={params.excessProfitTax}
                    onChange={(v) => set({ excessProfitTax: v })}
                />
                <SliderInput
                    label="monopoly regulation"
                    min={0} max={100} step={1}
                    value={params.monopolyRegulation}
                    onChange={(v) => set({ monopolyRegulation: v })}
                />
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Innovation policy */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">innovation policy</h3>
                <SliderInput
                    label="subsidies / tax credits"
                    min={0} max={100} step={1}
                    value={params.subsidy}
                    onChange={(v) => set({ subsidy: v })}
                />
                <SliderInput
                    label="public R&D"
                    min={0} max={100} step={1}
                    value={params.publicRD}
                    onChange={(v) => set({ publicRD: v })}
                />
                <SliderInput
                    label="public procurement"
                    min={0} max={100} step={1}
                    value={params.procurement}
                    onChange={(v) => set({ procurement: v })}
                />
                <SliderInput
                    label="antitrust / competition"
                    min={0} max={100} step={1}
                    value={params.antitrust}
                    onChange={(v) => set({ antitrust: v })}
                />
                <SliderInput
                    label="open science"
                    min={0} max={100} step={1}
                    value={params.openScience}
                    onChange={(v) => set({ openScience: v })}
                />
                <SliderInput
                    label="talent mobility"
                    min={0} max={100} step={1}
                    value={params.talentMobility}
                    onChange={(v) => set({ talentMobility: v })}
                />
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Environment */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">environment</h3>
                <SliderInput
                    label="cost of capital"
                    min={0} max={100} step={1}
                    value={params.capitalCost}
                    onChange={(v) => set({ capitalCost: v })}
                />
                <SliderInput
                    label="safety / licensing intensity"
                    min={0} max={100} step={1}
                    value={params.safetyIntensity}
                    onChange={(v) => set({ safetyIntensity: v })}
                />
                <SliderInput
                    label="energy abundance"
                    min={0} max={100} step={1}
                    value={params.energyAbundance}
                    onChange={(v) => set({ energyAbundance: v })}
                />
                <SliderInput
                    label="labor bargaining power"
                    min={0} max={100} step={1}
                    value={params.laborBargaining}
                    onChange={(v) => set({ laborBargaining: v })}
                />
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Horizon */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">simulation</h3>
                <SliderInput
                    label="horizon (years)"
                    min={15} max={45} step={1}
                    value={params.horizon}
                    onChange={(v) => set({ horizon: v })}
                />
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Events */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">frontier event toggles</h3>
                <Toggle
                    text="AI compute shock"
                    value={events.aiShock}
                    toggle={() => onEventsChange({ ...events, aiShock: !events.aiShock })}
                    tooltip="Major compute capacity jump arriving around 2030"
                />
                <Toggle
                    text="automation wave"
                    value={events.automationWave}
                    toggle={() => onEventsChange({ ...events, automationWave: !events.automationWave })}
                    tooltip="Broad robotics-driven automation arriving around 2031"
                />
                <Toggle
                    text="cheap modular nuclear"
                    value={events.cheapNuclear}
                    toggle={() => onEventsChange({ ...events, cheapNuclear: !events.cheapNuclear })}
                    tooltip="Factory-built SMRs become cost-competitive around 2034"
                />
                <Toggle
                    text="cis-lunar logistics"
                    value={events.cisLunar}
                    toggle={() => onEventsChange({ ...events, cisLunar: !events.cisLunar })}
                    tooltip="Reliable Earth-Moon transport arriving around 2036"
                />
                <Toggle
                    text="RTSC / materials jump"
                    value={events.rtsc}
                    toggle={() => onEventsChange({ ...events, rtsc: !events.rtsc })}
                    tooltip="Room-temperature superconductor or major materials breakthrough around 2038"
                />
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Actions */}
            <div className="space-y-2">
                {snapshot ? (
                    <Button
                        label="clear snapshot"
                        onClick={onClearSnapshot}
                        size="sm"
                        className="w-full"
                    />
                ) : (
                    <Button
                        label="save snapshot"
                        onClick={onSaveSnapshot}
                        size="sm"
                        className="w-full"
                    />
                )}
                <Button
                    label="reset preset"
                    onClick={() => selectPreset(params.preset)}
                    size="sm"
                    className="w-full"
                />
                <Button
                    label="reset events"
                    onClick={() => onEventsChange(DEFAULT_EVENTS)}
                    size="sm"
                    className="w-full"
                />
            </div>
        </div>
    );
}
