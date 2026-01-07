'use client';

import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';

import type { SimulationParams } from '../../logic';

interface SettingsProps {
    params: SimulationParams;
    onParamsChange: (params: SimulationParams) => void;
}

export default function Settings({ params, onParamsChange }: SettingsProps) {
    const updateParam = <K extends keyof SimulationParams>(
        key: K,
        value: SimulationParams[K]
    ) => {
        onParamsChange({ ...params, [key]: value });
    };

    const resimulate = () => {
        updateParam('seed', (params.seed + 1) >>> 0);
    };

    return (
        <div className="space-y-6">
            {/* Actions */}
            <div className="flex gap-2">
                <Button label="Resimulate" onClick={resimulate} size="sm" />
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
