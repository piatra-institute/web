'use client';

import React from 'react';
import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';
import Toggle from '@/components/Toggle';
import Input from '@/components/Input';

import {
    Scenario,
    TimeBin,
    ModelKind,
    GapMode,
    RegionKey,
    formatYear,
    gapScore,
    clamp01,
} from '../../logic';

interface SettingsProps {
    scenario: Scenario;
    onScenarioChange: (s: Scenario) => void;
    onReset: () => void;
}

export default function Settings({
    scenario,
    onScenarioChange,
    onReset,
}: SettingsProps) {
    const set = (partial: Partial<Scenario>) =>
        onScenarioChange({ ...scenario, ...partial });

    const selectedBin = scenario.timeline.find((b) => b.id === scenario.selectedBinId) ?? scenario.timeline[0];

    function updateWeight(id: string, next: number) {
        const w = { ...scenario.weights, [id]: Math.max(0, next) };
        if (!scenario.lockWeightSum) {
            set({ weights: w });
            return;
        }
        const ids = scenario.accelerants.map((a) => a.id);
        const total = ids.reduce((acc, k) => acc + (scenario.weights[k] ?? 0), 0);
        const clamped = Math.max(0, next);
        const others = ids.filter((k) => k !== id);
        const prevOthersSum = others.reduce((acc, k) => acc + (scenario.weights[k] ?? 0), 0);
        const remaining = Math.max(0, total - clamped);
        const nextW: Record<string, number> = { ...scenario.weights, [id]: clamped };
        if (prevOthersSum <= 0) {
            const equal = remaining / (others.length || 1);
            for (const k of others) nextW[k] = equal;
        } else {
            for (const k of others) nextW[k] = ((scenario.weights[k] ?? 0) / prevOthersSum) * remaining;
        }
        set({ weights: nextW });
    }

    function updateBinValue(region: RegionKey, accId: string, next: number) {
        const timeline = scenario.timeline.map((b) => {
            if (b.id !== scenario.selectedBinId) return b;
            return {
                ...b,
                values: {
                    ...b.values,
                    [region]: {
                        ...b.values[region],
                        [accId]: clamp01(next),
                    },
                },
            };
        });
        set({ timeline });
    }

    return (
        <div className="space-y-6">
            {/* Time bins */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">time bins</h3>
                <div className="space-y-1 max-h-[240px] overflow-y-auto pr-1">
                    {scenario.timeline.map((b) => {
                        const isActive = b.id === scenario.selectedBinId;
                        const gap = gapScore(scenario.model, b, scenario.weights);
                        return (
                            <button
                                key={b.id}
                                onClick={() => set({ selectedBinId: b.id })}
                                className={`w-full py-1.5 px-3 text-left text-xs border transition-colors cursor-pointer ${
                                    isActive
                                        ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                        : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">{b.label}</div>
                                        <div className="text-lime-200/40">{formatYear(b.yearStart)}&ndash;{formatYear(b.yearEnd)}</div>
                                    </div>
                                    <div className="text-lime-200/40 font-mono">{gap.toFixed(3)}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Model */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">aggregation model</h3>
                <div className="grid grid-cols-3 gap-2">
                    {(['additive', 'multiplicative', 'ces'] as ModelKind[]).map((k) => (
                        <button
                            key={k}
                            onClick={() => set({ model: { ...scenario.model, kind: k } })}
                            className={`py-1 px-2 text-xs border transition-colors cursor-pointer ${
                                scenario.model.kind === k
                                    ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                    : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                            }`}
                        >
                            {k === 'additive' ? 'additive' : k === 'multiplicative' ? 'geo-mean' : 'CES'}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {(['difference', 'ratio'] as GapMode[]).map((g) => (
                        <button
                            key={g}
                            onClick={() => set({ model: { ...scenario.model, gapMode: g } })}
                            className={`py-1 px-2 text-xs border transition-colors cursor-pointer ${
                                scenario.model.gapMode === g
                                    ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                    : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                            }`}
                        >
                            {g === 'difference' ? 'f(N)\u2212f(S)' : 'f(N)/f(S)'}
                        </button>
                    ))}
                </div>

                {scenario.model.kind === 'ces' && (
                    <SliderInput
                        label="CES \u03c1"
                        min={-2}
                        max={2}
                        step={0.05}
                        value={scenario.model.cesRho}
                        onChange={(v) => set({ model: { ...scenario.model, cesRho: v } })}
                        showDecimals
                    />
                )}

                <Toggle
                    text="lock weight sum"
                    value={scenario.lockWeightSum}
                    toggle={() => set({ lockWeightSum: !scenario.lockWeightSum })}
                />

                <SliderInput
                    label="Shapley samples"
                    min={50}
                    max={2000}
                    step={50}
                    value={scenario.shapleySamples}
                    onChange={(v) => set({ shapleySamples: v })}
                />
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Labels */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">definitions</h3>
                <div className="space-y-2">
                    <div className="space-y-1">
                        <span className="text-xs text-lime-200/60">North label</span>
                        <Input
                            type="text"
                            value={scenario.northLabel}
                            onChange={(v) => set({ northLabel: v })}
                            compact
                            fullWidth
                        />
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs text-lime-200/60">South label</span>
                        <Input
                            type="text"
                            value={scenario.southLabel}
                            onChange={(v) => set({ southLabel: v })}
                            compact
                            fullWidth
                        />
                    </div>
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Weights */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">weights</h3>
                {scenario.accelerants.map((a) => (
                    <SliderInput
                        key={a.id}
                        label={a.short}
                        min={0}
                        max={0.5}
                        step={0.01}
                        value={scenario.weights[a.id] ?? 0}
                        onChange={(v) => updateWeight(a.id, v)}
                        showDecimals
                    />
                ))}
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Driver values for selected bin */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">
                    drivers: {selectedBin?.label ?? ''}
                </h3>
                {selectedBin?.notes && (
                    <div className="text-xs text-lime-200/40 italic">{selectedBin.notes}</div>
                )}
                {scenario.accelerants.map((a) => {
                    const n = clamp01(selectedBin?.values.north[a.id] ?? 0);
                    const s = clamp01(selectedBin?.values.south[a.id] ?? 0);
                    return (
                        <div key={a.id} className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-lime-200/60">{a.short}</span>
                                <span className="text-xs text-lime-200/40 font-mono">N:{n.toFixed(2)} S:{s.toFixed(2)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <SliderInput
                                    label="N"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    value={n}
                                    onChange={(v) => updateBinValue('north', a.id, v)}
                                    showDecimals
                                />
                                <SliderInput
                                    label="S"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    value={s}
                                    onChange={(v) => updateBinValue('south', a.id, v)}
                                    showDecimals
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Reset */}
            <div className="space-y-3">
                <Button label="reset to defaults" onClick={onReset} size="sm" className="w-full" />
            </div>

            {/* Info */}
            <div className="border border-lime-500/20 p-3 text-xs text-lime-200/60">
                <div className="font-semibold text-lime-400 mb-2">about attribution</div>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Attribution is model-conditioned: change the aggregator and the credit split changes.</li>
                    <li>Shapley value averages marginal contributions over all orderings (Monte Carlo approximation).</li>
                    <li>Values are illustrative placeholders, not authoritative historical data.</li>
                </ul>
            </div>
        </div>
    );
}
