'use client';

import React from 'react';

import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';

import {
    Params,
    PresetKey,
    Snapshot,
    Metrics,
    PRESET_DESCRIPTIONS,
    presetParams,
    ACTIONS,
    ActionKey,
    computeViability,
    regimeOf,
} from '../../logic';


const PRESET_KEYS: PresetKey[] = [
    'broken-trust',
    'tragedy-of-commons',
    'sanctuary-asylum',
    'whistleblower',
    'war-crime',
];

interface SettingsProps {
    params: Params;
    onParamsChange: (p: Params) => void;
    metrics: Metrics;
    narrative: string;
    snapshot: Snapshot | null;
    onSaveSnapshot: () => void;
    onClearSnapshot: () => void;
    onAction: (key: ActionKey) => void;
    onLoadPreset: (key: PresetKey) => void;
    onResetMetrics: () => void;
}

function MetricRow({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
    const pct = Math.max(0, Math.min(1, value / max));
    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-lime-200/60">{label}</span>
                <span className="text-lime-400">{value.toFixed(0)}</span>
            </div>
            <div className="h-1 bg-lime-500/10 relative">
                <div className="absolute top-0 left-0 h-1 bg-lime-500/70" style={{ width: `${pct * 100}%` }} />
            </div>
        </div>
    );
}

export default function Settings({
    params,
    onParamsChange,
    metrics,
    narrative,
    snapshot,
    onSaveSnapshot,
    onClearSnapshot,
    onAction,
    onLoadPreset,
    onResetMetrics,
}: SettingsProps) {
    const set = (partial: Partial<Params>) => onParamsChange({ ...params, ...partial });
    const presetDesc = PRESET_DESCRIPTIONS[params.preset];
    const viability = computeViability(metrics);
    const regime = regimeOf(viability);

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">scenario</h3>
                <div className="grid grid-cols-1 gap-2">
                    {PRESET_KEYS.map((key) => (
                        <button
                            key={key}
                            onClick={() => onLoadPreset(key)}
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
                <div className="border border-lime-500/20 p-3 space-y-1">
                    <div className="text-xs text-lime-200/70 leading-relaxed">{narrative}</div>
                    <div className="text-[10px] font-mono text-lime-200/40 mt-2">
                        viability:{' '}
                        <span className={
                            regime.regime === 'stable' ? 'text-lime-400' :
                            regime.regime === 'contested' ? 'text-yellow-400' :
                            'text-orange-400'
                        }>
                            {viability.toFixed(0)}/100, {regime.label}
                        </span>
                    </div>
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">metrics</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <MetricRow label="trust" value={metrics.trust} />
                    <MetricRow label="agency" value={metrics.agency} />
                    <MetricRow label="harm" value={metrics.harm} />
                    <MetricRow label="repair" value={metrics.repair} />
                    <MetricRow label="domination" value={metrics.domination} />
                    <MetricRow label="ecology" value={metrics.ecology} />
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">actions</h3>
                <div className="grid grid-cols-2 gap-2">
                    {ACTIONS.map((a) => (
                        <button
                            key={a.key}
                            onClick={() => onAction(a.key)}
                            className="py-1.5 px-2 text-xs border border-lime-500/20 text-lime-200/70 hover:border-lime-500/60 hover:text-lime-400 transition-colors cursor-pointer text-left"
                            title={a.description}
                        >
                            {a.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">pressures</h3>
                <SliderInput label="dopamine bias" min={0} max={1} step={0.01} showDecimals
                    value={params.dopamine} onChange={(v) => set({ dopamine: v })} />
                <SliderInput label="empathy" min={0} max={1} step={0.01} showDecimals
                    value={params.empathy} onChange={(v) => set({ empathy: v })} />
                <SliderInput label="institutional" min={0} max={1} step={0.01} showDecimals
                    value={params.institutional} onChange={(v) => set({ institutional: v })} />
                <SliderInput label="scarcity" min={0} max={1} step={0.01} showDecimals
                    value={params.scarcity} onChange={(v) => set({ scarcity: v })} />
                <SliderInput label="memory" min={0} max={1} step={0.01} showDecimals
                    value={params.memory} onChange={(v) => set({ memory: v })} />
                <SliderInput label="ecology" min={0} max={1} step={0.01} showDecimals
                    value={params.ecology} onChange={(v) => set({ ecology: v })} />
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-2">
                {snapshot ? (
                    <Button label="clear snapshot" onClick={onClearSnapshot} size="sm" className="w-full" />
                ) : (
                    <Button label="save snapshot" onClick={onSaveSnapshot} size="sm" className="w-full" />
                )}
                <Button label="reset metrics" onClick={onResetMetrics} size="sm" className="w-full" />
            </div>
        </div>
    );
}
