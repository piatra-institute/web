'use client';

import React, { useState } from 'react';
import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';

import {
    Params,
    PresetKey,
    Narrative,
    SimStats,
    presetParams,
} from '../../logic';

interface SettingsProps {
    params: Params;
    onParamsChange: (p: Params) => void;
    narrative: Narrative;
    stats: SimStats;
}

type Tab = 'core' | 'stimuli' | 'coupling';

export default function Settings({
    params,
    onParamsChange,
    narrative,
    stats,
}: SettingsProps) {
    const [tab, setTab] = useState<Tab>('core');

    const set = (partial: Partial<Params>) =>
        onParamsChange({ ...params, ...partial });

    const selectPreset = (mode: PresetKey) =>
        onParamsChange(presetParams(mode));

    return (
        <div className="space-y-6">
            {/* Presets */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">circuit preset</h3>
                <div className="grid grid-cols-3 gap-2">
                    {([
                        ['associative', 'associative'],
                        ['toggle', 'toggle'],
                        ['repressilator', 'oscillator'],
                    ] as [PresetKey, string][]).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => selectPreset(key)}
                            className={`py-1.5 px-2 text-xs border transition-colors cursor-pointer ${
                                params.mode === key
                                    ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                    : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <div className="text-xs text-lime-200/40">
                    {params.mode === 'associative' && 'Paired inputs store a slow memory trace (C).'}
                    {params.mode === 'toggle' && 'Mutual repression + self-activation: bistable cell-fate switch.'}
                    {params.mode === 'repressilator' && 'Cyclic repression loop: state is held in oscillatory dynamics.'}
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Narrative + stats */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">interpretation</h3>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-sm text-lime-400 font-semibold">{narrative.label}</div>
                    <div className="text-xs text-lime-200/40 mt-1">{narrative.blurb}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="text-lime-200/60">peak A: <span className="text-lime-400">{stats.peakA.toFixed(2)}</span></div>
                    <div className="text-lime-200/60">peak C: <span className="text-lime-400">{stats.peakC.toFixed(2)}</span></div>
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Tabs */}
            <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                    {(['core', 'stimuli', 'coupling'] as Tab[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`py-1 px-2 text-xs border transition-colors cursor-pointer ${
                                tab === t
                                    ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                    : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {tab === 'core' && (
                    <div className="space-y-3">
                        <SliderInput label="simulation horizon" min={20} max={100} step={1} value={params.tMax} onChange={(v) => set({ tMax: v })} />
                        <SliderInput label="dt" min={0.01} max={0.2} step={0.01} value={params.dt} onChange={(v) => set({ dt: v })} showDecimals />
                        <SliderInput label="Hill coefficient n" min={1} max={8} step={1} value={params.hillN} onChange={(v) => set({ hillN: v })} />

                        <div className="border-t border-lime-500/10" />
                        <SliderInput label="&beta;A production" min={0} max={3} step={0.05} value={params.betaA} onChange={(v) => set({ betaA: v })} showDecimals />
                        <SliderInput label="&beta;B production" min={0} max={3} step={0.05} value={params.betaB} onChange={(v) => set({ betaB: v })} showDecimals />
                        <SliderInput label="&beta;C production" min={0} max={3} step={0.05} value={params.betaC} onChange={(v) => set({ betaC: v })} showDecimals />

                        <div className="border-t border-lime-500/10" />
                        <SliderInput label="decay A" min={0.05} max={2} step={0.05} value={params.decayA} onChange={(v) => set({ decayA: v })} showDecimals />
                        <SliderInput label="decay B" min={0.05} max={2} step={0.05} value={params.decayB} onChange={(v) => set({ decayB: v })} showDecimals />
                        <SliderInput label="decay C" min={0.05} max={1.5} step={0.01} value={params.decayC} onChange={(v) => set({ decayC: v })} showDecimals />

                        <div className="border-t border-lime-500/10" />
                        <SliderInput label="threshold A" min={0.1} max={1.5} step={0.05} value={params.thresholdA} onChange={(v) => set({ thresholdA: v })} showDecimals />
                        <SliderInput label="threshold B" min={0.1} max={1.5} step={0.05} value={params.thresholdB} onChange={(v) => set({ thresholdB: v })} showDecimals />
                        <SliderInput label="threshold C" min={0.1} max={1.5} step={0.05} value={params.thresholdC} onChange={(v) => set({ thresholdC: v })} showDecimals />
                    </div>
                )}

                {tab === 'stimuli' && (
                    <div className="space-y-3">
                        <SliderInput label="training start" min={0} max={40} step={1} value={params.pairStart} onChange={(v) => set({ pairStart: Math.min(v, params.pairEnd - 1) })} />
                        <SliderInput label="training end" min={2} max={50} step={1} value={params.pairEnd} onChange={(v) => set({ pairEnd: Math.max(v, params.pairStart + 1) })} />
                        <SliderInput label="probe start" min={10} max={55} step={1} value={params.testStart} onChange={(v) => set({ testStart: Math.max(v, params.pairEnd + 1) })} />
                        <SliderInput label="probe end" min={12} max={params.tMax} step={1} value={params.testEnd} onChange={(v) => set({ testEnd: Math.max(v, params.testStart + 1) })} />

                        <div className="border-t border-lime-500/10" />
                        <SliderInput label="training amplitude" min={0} max={2} step={0.05} value={params.trainStimulus} onChange={(v) => set({ trainStimulus: v })} showDecimals />
                        <SliderInput label="probe amplitude" min={0} max={2} step={0.05} value={params.testStimulus} onChange={(v) => set({ testStimulus: v })} showDecimals />

                        <div className="border-t border-lime-500/10" />
                        <h3 className="text-lime-400 font-semibold text-sm">probe channel</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {(['u1', 'u2'] as const).map((ch) => (
                                <button
                                    key={ch}
                                    onClick={() => set({ probe: ch })}
                                    className={`py-1 px-2 text-xs border transition-colors cursor-pointer ${
                                        params.probe === ch
                                            ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                            : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                                    }`}
                                >
                                    {ch.toUpperCase()} only
                                </button>
                            ))}
                        </div>
                        <div className="text-xs text-lime-200/40">
                            In the associative preset, pair U1+U2 during training, then probe with U2 only to test conditioning.
                        </div>
                    </div>
                )}

                {tab === 'coupling' && (
                    <div className="space-y-3">
                        <h3 className="text-lime-200/60 text-xs">A inputs</h3>
                        <SliderInput label="A &larr; A" min={-2} max={2} step={0.05} value={params.wAA} onChange={(v) => set({ wAA: v })} showDecimals />
                        <SliderInput label="A &larr; B" min={-2} max={2} step={0.05} value={params.wBA} onChange={(v) => set({ wBA: v })} showDecimals />
                        <SliderInput label="A &larr; C" min={-2} max={2} step={0.05} value={params.wCA} onChange={(v) => set({ wCA: v })} showDecimals />
                        <SliderInput label="A &larr; U1" min={0} max={2} step={0.05} value={params.wUA1} onChange={(v) => set({ wUA1: v })} showDecimals />
                        <SliderInput label="A &larr; U2" min={0} max={2} step={0.05} value={params.wUA2} onChange={(v) => set({ wUA2: v })} showDecimals />

                        <div className="border-t border-lime-500/10" />
                        <h3 className="text-lime-200/60 text-xs">B inputs</h3>
                        <SliderInput label="B &larr; A" min={-2} max={2} step={0.05} value={params.wAB} onChange={(v) => set({ wAB: v })} showDecimals />
                        <SliderInput label="B &larr; U1" min={0} max={2} step={0.05} value={params.wUB1} onChange={(v) => set({ wUB1: v })} showDecimals />

                        <div className="border-t border-lime-500/10" />
                        <h3 className="text-lime-200/60 text-xs">C inputs</h3>
                        <SliderInput label="C &larr; B" min={-2} max={2} step={0.05} value={params.wBC} onChange={(v) => set({ wBC: v })} showDecimals />
                        <SliderInput label="C &larr; C" min={-2} max={2} step={0.05} value={params.wCC} onChange={(v) => set({ wCC: v })} showDecimals />
                        <SliderInput label="C &larr; U2" min={0} max={2} step={0.05} value={params.wUC2} onChange={(v) => set({ wUC2: v })} showDecimals />

                        <div className="text-xs text-lime-200/40 mt-2">
                            Positive weights activate, negative repress. The key knobs for associative memory are C &larr; U2 and C decay.
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Reset */}
            <Button label="reset preset" onClick={() => selectPreset(params.mode)} size="sm" className="w-full" />

            {/* Explanation */}
            <div className="border border-lime-500/20 p-3 text-xs text-lime-200/60">
                <div className="font-semibold text-lime-400 mb-2">circuit roles</div>
                <ul className="list-disc pl-5 space-y-1">
                    <li><span className="text-lime-400">A</span> - main output / response gene</li>
                    <li><span className="text-lime-400">B</span> - fast gate / training detector</li>
                    <li><span className="text-lime-400">C</span> - slow memory variable (biochemical "weight")</li>
                    <li><span className="text-lime-400">U1, U2</span> - external stimuli (unconditioned / conditioned)</li>
                </ul>
            </div>
        </div>
    );
}
