'use client';

import Button from '@/components/Button';
import SliderInput from '@/components/SliderInput';
import Toggle from '@/components/Toggle';
import MetricDelta from '@/components/MetricDelta';

import {
    PRESET_KEYS,
    PRESET_DESCRIPTIONS,
    type PresetKey,
} from '../../logic';
import type { SimulationMetrics, SimulationParams, Snapshot } from '../../types';


// Absolute coarse-grained values are small (immiscible species), so show enough
// significant figures to read them rather than rounding everything to 0.000.
function fmt(v: number): string {
    if (!Number.isFinite(v) || v === 0) return '0';
    const abs = Math.abs(v);
    if (abs >= 0.1) return v.toFixed(3);
    if (abs >= 0.001) return v.toFixed(4);
    return v.toExponential(1);
}


interface SettingsProps {
    params: SimulationParams;
    metrics: SimulationMetrics;
    peakComplexity: number;
    narrative: string;
    snapshot: Snapshot | null;
    onParamsChange: (next: SimulationParams) => void;
    onSelectPreset: (key: PresetKey) => void;
    onReset: () => void;
    onStirOnce: () => void;
    onAddCream: () => void;
    onSaveSnapshot: () => void;
    onClearSnapshot: () => void;
}

export default function Settings({
    params,
    metrics,
    peakComplexity,
    narrative,
    snapshot,
    onParamsChange,
    onSelectPreset,
    onReset,
    onStirOnce,
    onAddCream,
    onSaveSnapshot,
    onClearSnapshot,
}: SettingsProps) {
    const update = (patch: Partial<SimulationParams>) => {
        onParamsChange({ ...params, ...patch });
    };

    const active = PRESET_DESCRIPTIONS[params.preset];

    return (
        <div className="space-y-5 text-lime-100">
            <div className="space-y-2">
                <div className="text-[10px] uppercase tracking-[0.2em] text-lime-200/50">presets</div>
                <div className="grid grid-cols-2 gap-2">
                    {PRESET_KEYS.map((key) => {
                        const isActive = params.preset === key;
                        return (
                            <button
                                key={key}
                                onClick={() => onSelectPreset(key)}
                                className={`text-left text-xs px-2 py-1.5 border transition-colors cursor-pointer ${
                                    isActive
                                        ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                        : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                                }`}
                            >
                                {PRESET_DESCRIPTIONS[key].label}
                            </button>
                        );
                    })}
                </div>
                <div className="border border-lime-500/20 p-3 space-y-1">
                    <p className="text-xs text-lime-200/70">{active.question}</p>
                    <p className="text-[11px] text-lime-200/50 leading-relaxed">{active.expectation}</p>
                </div>
            </div>

            <div className="border border-lime-500/20 p-3">
                <p className="text-xs text-lime-200/70 leading-relaxed">{narrative}</p>
            </div>

            <div className="space-y-2">
                <Toggle
                    text="pause simulation"
                    value={params.isPaused}
                    toggle={() => update({ isPaused: !params.isPaused })}
                />
                <Toggle
                    text="continuous stirring"
                    value={params.isStirring}
                    toggle={() => update({ isStirring: !params.isStirring })}
                />
            </div>

            <div className="flex gap-2">
                <Button onClick={onStirOnce} label="Stir Once" size="sm" className="w-full" />
                <Button onClick={onAddCream} label="Pour Cream" size="sm" className="w-full" />
            </div>
            <Button onClick={onReset} label="Reset" size="sm" className="w-full" />

            <div className="space-y-2">
                <div className="flex gap-2">
                    <Button onClick={onSaveSnapshot} label="Save" size="sm" className="w-full" />
                    {snapshot && (
                        <Button onClick={onClearSnapshot} label="Clear" size="sm" className="w-full" />
                    )}
                </div>
                {snapshot && (
                    <div className="border border-lime-500/20 p-3 space-y-1">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-lime-200/40">
                            vs snapshot · {PRESET_DESCRIPTIONS[snapshot.label as PresetKey]?.label ?? snapshot.label}
                        </div>
                        <MetricDelta
                            label="entropy"
                            current={metrics.entropy}
                            saved={snapshot.metrics.entropy}
                            isPercent
                            decimals={1}
                        />
                        <MetricDelta
                            label="peak complexity"
                            current={peakComplexity}
                            saved={snapshot.peakComplexity}
                            decimals={3}
                        />
                    </div>
                )}
            </div>

            <SliderInput
                label="stir strength"
                value={params.stirStrength}
                onChange={(value) => update({ stirStrength: value })}
                min={0}
                max={18}
                step={0.5}
                showDecimals
            />
            <SliderInput
                label="cream pour rate (particles/s)"
                value={params.pourRate}
                onChange={(value) => update({ pourRate: value })}
                min={0}
                max={2000}
                step={50}
            />
            <SliderInput
                label="viscosity"
                value={params.viscosity}
                onChange={(value) => update({ viscosity: value })}
                min={0.1}
                max={1.2}
                step={0.05}
                showDecimals
            />
            <SliderInput
                label="diffusion"
                value={params.diffusion}
                onChange={(value) => update({ diffusion: value })}
                min={0}
                max={1}
                step={0.05}
                showDecimals
            />
            <SliderInput
                label="buoyancy"
                value={params.buoyancy}
                onChange={(value) => update({ buoyancy: value })}
                min={0.2}
                max={1.4}
                step={0.05}
                showDecimals
            />
            <SliderInput
                label="simulation speed"
                value={params.speed}
                onChange={(value) => update({ speed: value })}
                min={0.25}
                max={2}
                step={0.05}
                showDecimals
            />

            <div className="border border-lime-500/20 bg-black/40 p-3 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                    <span className="text-lime-200/60">entropy</span>
                    <span className="text-lime-400">{fmt(metrics.entropy)} bits</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-lime-200/60">complexity</span>
                    <span className="text-amber-400">{fmt(metrics.complexity)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-lime-200/60">mixedness</span>
                    <span className="text-lime-200">{fmt(metrics.mixedness)}</span>
                </div>
            </div>

            <p className="text-[11px] text-lime-200/50 leading-relaxed">
                Drag the cup to rotate, scroll to zoom. Pour cream, then stir when you like, and watch entropy climb while the swirling complexity peaks and fades.
            </p>
        </div>
    );
}
