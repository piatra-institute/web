'use client';

import Button from '@/components/Button';
import SliderInput from '@/components/SliderInput';
import Toggle from '@/components/Toggle';

import type { SimulationMetrics, SimulationParams } from '../../types';

interface SettingsProps {
    params: SimulationParams;
    metrics: SimulationMetrics;
    onParamsChange: (next: SimulationParams) => void;
    onReset: () => void;
    onStirOnce: () => void;
    onAddCream: () => void;
}

export default function Settings({
    params,
    metrics,
    onParamsChange,
    onReset,
    onStirOnce,
    onAddCream,
}: SettingsProps) {
    const update = (patch: Partial<SimulationParams>) => {
        onParamsChange({ ...params, ...patch });
    };

    return (
        <div className="space-y-4 text-lime-100">
            <div className="space-y-2">
                <div className="text-lime-200/80">
                    <Toggle
                        text="pause simulation"
                        value={params.isPaused}
                        toggle={() => update({ isPaused: !params.isPaused })}
                    />
                </div>
                <div className="text-lime-200/80">
                    <Toggle
                        text="continuous stirring"
                        value={params.isStirring}
                        toggle={() => update({ isStirring: !params.isStirring })}
                    />
                </div>
            </div>

            <div className="flex gap-2">
                <Button
                    onClick={onStirOnce}
                    label="stir once"
                    size="sm"
                    className="w-full"
                />
                <Button
                    onClick={onAddCream}
                    label="pour cream"
                    size="sm"
                    className="w-full"
                />
            </div>

            <Button
                onClick={onReset}
                label="reset"
                size="sm"
                className="w-full"
            />

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

            <div className="border border-lime-500/20 bg-black/40 p-3">
                <div className="flex justify-between text-xs text-lime-200/70">
                    <span>entropy</span>
                    <span className="text-lime-400 font-mono">{metrics.entropy.toFixed(3)}</span>
                </div>
                <div className="mt-2 h-1 bg-lime-500/10">
                    <div
                        className="h-1 bg-lime-500 transition-all duration-300"
                        style={{ width: `${Math.min(100, metrics.entropy * 100)}%` }}
                    />
                </div>

                <div className="flex justify-between text-xs text-lime-200/70 mt-4">
                    <span>mixedness</span>
                    <span className="text-lime-200 font-mono">{metrics.mixedness.toFixed(3)}</span>
                </div>
                <div className="mt-2 h-1 bg-lime-500/10">
                    <div
                        className="h-1 bg-lime-400 transition-all duration-300"
                        style={{ width: `${Math.min(100, metrics.mixedness * 100)}%` }}
                    />
                </div>

                <div className="flex justify-between text-xs text-lime-200/70 mt-4">
                    <span>complexity</span>
                    <span className="text-amber-400 font-mono">{metrics.complexity.toFixed(3)}</span>
                </div>
                <div className="mt-2 h-1 bg-amber-500/10">
                    <div
                        className="h-1 bg-amber-400 transition-all duration-300"
                        style={{ width: `${Math.min(100, metrics.complexity * 100)}%` }}
                    />
                </div>
            </div>

            <p className="text-xs text-lime-200/60">
                Drag to rotate. Scroll to zoom. Entropy rises as cream disperses; complexity peaks while filaments form.
            </p>
        </div>
    );
}
