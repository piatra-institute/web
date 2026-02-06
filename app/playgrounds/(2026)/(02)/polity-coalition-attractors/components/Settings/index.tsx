'use client';

import React, { useMemo } from 'react';
import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';
import type {
    ModelParams,
    SimSettings,
    InitialConditions,
    BasinSettings,
} from '../../logic';
import {
    PARAM_KEYS,
    PRESETS,
    PRESET_GROUPS,
} from '../../logic';

interface SettingsProps {
    params: ModelParams;
    onParamsChange: (p: ModelParams) => void;
    sim: SimSettings;
    onSimChange: (s: SimSettings) => void;
    init: InitialConditions;
    onInitChange: (i: InitialConditions) => void;
    basin: BasinSettings;
    onBasinChange: (b: BasinSettings) => void;
    presetId: string;
    onPresetChange: (id: string) => void;
    onRandomStart: () => void;
    onReset: () => void;
}

export default function Settings({
    params,
    onParamsChange,
    sim,
    onSimChange,
    init,
    onInitChange,
    basin,
    onBasinChange,
    presetId,
    onPresetChange,
    onRandomStart,
    onReset,
}: SettingsProps) {
    const preset = useMemo(
        () => PRESETS.find((p) => p.id === presetId) ?? PRESETS[0],
        [presetId],
    );

    return (
        <div className="space-y-6">
            {/* Preset Scenarios */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Preset Scenarios</h3>
                <select
                    className="w-full bg-black border border-lime-500/30 text-lime-100 px-3 py-2 text-sm focus:outline-none focus:border-lime-500"
                    value={presetId}
                    onChange={(e) => onPresetChange(e.target.value)}
                >
                    {PRESET_GROUPS.map((group) => (
                        <optgroup key={group.label} label={group.label}>
                            {group.presets.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.label}
                                </option>
                            ))}
                        </optgroup>
                    ))}
                </select>
                <div className="text-xs text-lime-200/70">
                    <span className="text-lime-400 font-semibold">{preset.when}</span>
                    {' \u2014 '}
                    {preset.note}
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Model Parameters */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Model Parameters</h3>
                {PARAM_KEYS.map(({ key, label, hint }) => (
                    <div key={key}>
                        <SliderInput
                            label={label}
                            min={0}
                            max={1}
                            step={0.01}
                            value={params[key]}
                            onChange={(v) => onParamsChange({ ...params, [key]: v })}
                            showDecimals
                        />
                        <div className="text-xs text-lime-200/60 mt-0.5">{hint}</div>
                    </div>
                ))}
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Simulation */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Simulation</h3>
                <SliderInput
                    label="dt (time step)"
                    min={0.01}
                    max={0.12}
                    step={0.01}
                    value={sim.dt}
                    onChange={(v) => onSimChange({ ...sim, dt: v })}
                    showDecimals
                />
                <SliderInput
                    label="noise (stochastic drift)"
                    min={0}
                    max={0.08}
                    step={0.01}
                    value={sim.noise}
                    onChange={(v) => onSimChange({ ...sim, noise: v })}
                    showDecimals
                />
                <SliderInput
                    label="steps (iterations)"
                    min={200}
                    max={1400}
                    step={50}
                    value={sim.steps}
                    onChange={(v) => onSimChange({ ...sim, steps: v })}
                />
                <SliderInput
                    label="seed (randomness)"
                    min={1}
                    max={99999}
                    step={1}
                    value={sim.seed}
                    onChange={(v) => onSimChange({ ...sim, seed: v })}
                />
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Initial Conditions */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Initial Conditions</h3>
                <SliderInput
                    label="x&#8320; (exclusionary share)"
                    min={0}
                    max={1}
                    step={0.01}
                    value={init.x0}
                    onChange={(v) => onInitChange({ ...init, x0: v })}
                    showDecimals
                />
                <SliderInput
                    label="t&#8320; (institutional trust)"
                    min={0}
                    max={1}
                    step={0.01}
                    value={init.t0}
                    onChange={(v) => onInitChange({ ...init, t0: v })}
                    showDecimals
                />
                <div className="text-xs text-lime-200/60">Also settable by clicking the basin map.</div>
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Basin Map */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Basin Map</h3>
                <SliderInput
                    label="grid (resolution)"
                    min={20}
                    max={70}
                    step={1}
                    value={basin.grid}
                    onChange={(v) => onBasinChange({ ...basin, grid: v })}
                />
                <SliderInput
                    label="seed sweep (noise averaging)"
                    min={1}
                    max={5}
                    step={1}
                    value={basin.seedSweep}
                    onChange={(v) => onBasinChange({ ...basin, seedSweep: v })}
                />
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
                <Button label="Random start" onClick={onRandomStart} size="sm" />
                <Button label="Reset all" onClick={onReset} size="sm" />
            </div>
        </div>
    );
}
