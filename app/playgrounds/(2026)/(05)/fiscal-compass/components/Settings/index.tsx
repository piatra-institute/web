'use client';

import React from 'react';

import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';

import {
    Params,
    Metrics,
    Snapshot,
    PresetKey,
    SchoolKey,
    SCHOOL_KEYS,
    SCHOOLS,
    PRESET_DESCRIPTIONS,
    presetParams,
} from '../../logic';


const PRESET_KEYS: PresetKey[] = [
    'inequality-crisis',
    'high-return-state',
    'debt-squeeze',
    'austerity-trap',
    'carbon-logic',
    'nordic-model',
];

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
    const set = (partial: Partial<Params>) => onParamsChange({ ...params, ...partial });
    const selectPreset = (key: PresetKey) => onParamsChange(presetParams(key));
    const selectSchool = (key: SchoolKey) => set({ school: key });
    const presetDesc = PRESET_DESCRIPTIONS[params.preset];

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">rationale</h3>
                <div className="grid grid-cols-1 gap-2">
                    {SCHOOL_KEYS.map((key) => (
                        <button
                            key={key}
                            onClick={() => selectSchool(key)}
                            className={`py-1.5 px-2 text-xs border transition-colors cursor-pointer text-left ${
                                params.school === key
                                    ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                    : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                            }`}
                        >
                            {SCHOOLS[key].label}
                        </button>
                    ))}
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-xs text-lime-200/70 leading-relaxed">
                        {SCHOOLS[params.school].rationale}
                    </div>
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">presets</h3>
                <div className="grid grid-cols-1 gap-2">
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
                {presetDesc && (
                    <div className="border border-lime-500/20 p-3 space-y-2">
                        <div className="text-xs text-lime-400 italic">{presetDesc.question}</div>
                        <div className="text-xs text-lime-200/40">{presetDesc.expectation}</div>
                    </div>
                )}
            </div>

            <div className="border-t border-lime-500/20" />

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
                            <MetricDelta label="welfare" current={metrics.welfare} saved={snapshot.metrics.welfare} />
                            <MetricDelta label="growth" current={metrics.growth} saved={snapshot.metrics.growth} />
                            <MetricDelta label="equality" current={metrics.equality} saved={snapshot.metrics.equality} />
                            <MetricDelta label="fiscal" current={metrics.fiscalRepair} saved={snapshot.metrics.fiscalRepair} />
                            <MetricDelta label="legitimacy" current={metrics.legitimacy} saved={snapshot.metrics.legitimacy} />
                            <MetricDelta label="distortion" current={metrics.distortion} saved={snapshot.metrics.distortion} higherIsBetter={false} />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="text-lime-200/60">welfare: <span className="text-lime-400">{metrics.welfare}</span></div>
                        <div className="text-lime-200/60">growth: <span className="text-lime-400">{metrics.growth}</span></div>
                        <div className="text-lime-200/60">equality: <span className="text-lime-400">{metrics.equality}</span></div>
                        <div className="text-lime-200/60">fiscal: <span className="text-lime-400">{metrics.fiscalRepair}</span></div>
                        <div className="text-lime-200/60">legitimacy: <span className="text-lime-400">{metrics.legitimacy}</span></div>
                        <div className="text-lime-200/60">distortion: <span className="text-lime-400">{metrics.distortion}</span></div>
                    </div>
                )}
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">tax package</h3>
                <SliderInput label="tax intensity" min={0} max={100} step={1}
                    value={params.taxRate} onChange={(v) => set({ taxRate: v })} />
                <SliderInput label="admin capacity" min={0} max={100} step={1}
                    value={params.adminCapacity} onChange={(v) => set({ adminCapacity: v })} />
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">world state</h3>
                <SliderInput label="inequality pressure" min={0} max={100} step={1}
                    value={params.inequality} onChange={(v) => set({ inequality: v })} />
                <SliderInput label="debt pressure" min={0} max={100} step={1}
                    value={params.debtPressure} onChange={(v) => set({ debtPressure: v })} />
                <SliderInput label="public-investment return" min={0} max={100} step={1}
                    value={params.investmentReturn} onChange={(v) => set({ investmentReturn: v })} />
                <SliderInput label="externality damage" min={0} max={100} step={1}
                    value={params.externalityDamage} onChange={(v) => set({ externalityDamage: v })} />
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-2">
                {snapshot ? (
                    <Button label="clear snapshot" onClick={onClearSnapshot} size="sm" className="w-full" />
                ) : (
                    <Button label="save snapshot" onClick={onSaveSnapshot} size="sm" className="w-full" />
                )}
                <Button label="reset preset" onClick={() => selectPreset(params.preset)} size="sm" className="w-full" />
            </div>
        </div>
    );
}
