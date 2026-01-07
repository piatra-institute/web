'use client';

import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';

import type { SimulationParams } from '../../logic';
import { DEFAULT_PARAMS } from '../../logic';

// Preset configurations
export const PRESETS = {
    'sheaf-success': {
        label: 'Sheaf succeeds',
        description: 'Consistent local sections glue perfectly',
        params: {
            consistent: true,
            measurementNoise: 0,
            tolerance: 0.15,
            strictSheaf: true,
        },
    },
    'sheaf-fail': {
        label: 'Sheaf fails',
        description: 'Independent local histories cannot glue',
        params: {
            consistent: false,
            measurementNoise: 0.1,
            tolerance: 0.15,
            strictSheaf: true,
        },
    },
    'strong-closure': {
        label: 'Strong closure',
        description: 'Fast decay → Markov dynamics',
        params: {
            tau: 0.08,
            useMemory: false,
            macroWindow: 21,
        },
    },
    'weak-closure': {
        label: 'Weak closure',
        description: 'Slow decay → memory effects',
        params: {
            tau: 1.5,
            useMemory: true,
            macroWindow: 41,
        },
    },
} as const;

export type PresetKey = keyof typeof PRESETS | null;

export interface PlaybackState {
    isPlaying: boolean;
    currentTime: number;
    speed: number;
}

interface SettingsProps {
    params: SimulationParams;
    onParamsChange: (params: SimulationParams) => void;
    selectedSection: number;
    onSelectedSectionChange: (index: number) => void;
    sectionCount: number;
    activePreset: PresetKey;
    onPresetChange: (preset: PresetKey) => void;
}

export default function Settings({
    params,
    onParamsChange,
    selectedSection,
    onSelectedSectionChange,
    sectionCount,
    activePreset,
    onPresetChange,
}: SettingsProps) {
    const updateParam = <K extends keyof SimulationParams>(
        key: K,
        value: SimulationParams[K]
    ) => {
        onParamsChange({ ...params, [key]: value });
        onPresetChange(null); // Clear preset when manually changing params
    };

    const resimulate = () => {
        onParamsChange({ ...params, seed: (params.seed + 1) >>> 0 });
    };

    const applyPreset = (presetKey: keyof typeof PRESETS) => {
        const preset = PRESETS[presetKey];
        onParamsChange({ ...params, ...preset.params });
        onPresetChange(presetKey);
    };

    const resetToDefaults = () => {
        onParamsChange(DEFAULT_PARAMS);
        onPresetChange(null);
    };

    return (
        <div className="space-y-6">
            {/* Local section selector */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Local section overlay</h3>
                <div className="flex flex-wrap gap-1">
                    {Array.from({ length: sectionCount }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => onSelectedSectionChange(i)}
                            className={`px-2 py-1 text-xs border transition-colors ${
                                selectedSection === i
                                    ? 'bg-lime-500/20 border-lime-500 text-lime-400'
                                    : 'border-lime-500/30 text-lime-200/70 hover:border-lime-500/50'
                            }`}
                        >
                            I{i}
                        </button>
                    ))}
                </div>
            </div>

            {/* Presets */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Presets</h3>
                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(PRESETS).map(([key, preset]) => (
                        <button
                            key={key}
                            onClick={() => applyPreset(key as keyof typeof PRESETS)}
                            className={`px-2 py-2 text-xs border transition-colors text-left ${
                                activePreset === key
                                    ? 'bg-lime-500/20 border-lime-500'
                                    : 'border-lime-500/30 hover:border-lime-500/50'
                            }`}
                        >
                            <div className={activePreset === key ? 'text-lime-300' : 'text-lime-400'}>{preset.label}</div>
                            <div className="text-lime-200/50 text-[10px]">{preset.description}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <Button label="Resimulate" onClick={resimulate} size="sm" />
                <Button label="Reset" onClick={resetToDefaults} size="sm" />
            </div>

            {/* Micro dynamics */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Micro dynamics (global section)</h3>
                <SliderInput
                    label="Event rate λ"
                    min={0.1}
                    max={12}
                    step={0.1}
                    value={params.lambda}
                    onChange={(v) => updateParam('lambda', v)}
                />
                <SliderInput
                    label="Jump magnitude σ"
                    min={0.05}
                    max={2.5}
                    step={0.01}
                    value={params.stepSigma}
                    onChange={(v) => updateParam('stepSigma', v)}
                />
                <SliderInput
                    label="Drift μ"
                    min={-0.5}
                    max={0.5}
                    step={0.01}
                    value={params.drift}
                    onChange={(v) => updateParam('drift', v)}
                />
                <SliderInput
                    label="Time step dt"
                    min={0.005}
                    max={0.08}
                    step={0.001}
                    value={params.dt}
                    onChange={(v) => updateParam('dt', v)}
                />
            </div>

            {/* Site / cover */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Site / cover of [0, T]</h3>
                <SliderInput
                    label="Interval count k"
                    min={2}
                    max={12}
                    step={1}
                    value={params.intervalCount}
                    onChange={(v) => updateParam('intervalCount', v)}
                />
                <SliderInput
                    label="Overlap fraction"
                    min={0}
                    max={0.9}
                    step={0.01}
                    value={params.overlapFrac}
                    onChange={(v) => updateParam('overlapFrac', v)}
                />
                <SliderInput
                    label="Total time T"
                    min={4}
                    max={20}
                    step={1}
                    value={params.T}
                    onChange={(v) => updateParam('T', v)}
                />
            </div>

            {/* Local sections */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Local sections</h3>

                <label className="flex items-center gap-2 text-xs text-lime-100 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={params.consistent}
                        onChange={(e) => updateParam('consistent', e.target.checked)}
                        className="accent-lime-500"
                    />
                    Consistent restrictions
                </label>
                <p className="text-xs text-lime-200/60 -mt-1 ml-5">
                    If off: each interval has an independent local micro-history (gluing typically fails)
                </p>

                <SliderInput
                    label="Measurement noise η"
                    min={0}
                    max={0.8}
                    step={0.01}
                    value={params.measurementNoise}
                    onChange={(v) => updateParam('measurementNoise', v)}
                />

                <SliderInput
                    label="Glue tolerance ε"
                    min={0.01}
                    max={0.8}
                    step={0.01}
                    value={params.tolerance}
                    onChange={(v) => updateParam('tolerance', v)}
                />

                <label className="flex items-center gap-2 text-xs text-lime-100 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={params.strictSheaf}
                        onChange={(e) => updateParam('strictSheaf', e.target.checked)}
                        className="accent-lime-500"
                    />
                    Strict sheaf gluing
                </label>
                <p className="text-xs text-lime-200/60 -mt-1 ml-5">
                    If on: fail unless overlaps agree within ε. If off: best-fit sheafification (averaging descent repair)
                </p>
            </div>

            {/* Coarse-graining */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Coarse-graining q and closure</h3>

                <SliderInput
                    label="Macro window (odd)"
                    min={3}
                    max={99}
                    step={2}
                    value={params.macroWindow}
                    onChange={(v) => updateParam('macroWindow', v)}
                />

                <SliderInput
                    label="Memory decay τ"
                    min={0.02}
                    max={2.0}
                    step={0.01}
                    value={params.tau}
                    onChange={(v) => updateParam('tau', v)}
                />

                <label className="flex items-center gap-2 text-xs text-lime-100 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={params.useMemory}
                        onChange={(e) => updateParam('useMemory', e.target.checked)}
                        className="accent-lime-500"
                    />
                    Use memory term (Mori–Zwanzig-style)
                </label>
                <p className="text-xs text-lime-200/60 -mt-1 ml-5">
                    Fit dm/dt = a·m + c·(exp-kernel conv) + b. Off: dm/dt = a·m + b (Markov closure)
                </p>
            </div>
        </div>
    );
}
