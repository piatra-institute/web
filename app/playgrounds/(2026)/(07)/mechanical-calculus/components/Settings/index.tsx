'use client';

import React from 'react';

import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';
import MetricDelta from '@/components/MetricDelta';

import {
    Params,
    PresetKey,
    Metrics,
    Snapshot,
    PRESET_DESCRIPTIONS,
    presetParams,
    formatGain,
} from '../../logic';


const PRESET_KEYS: PresetKey[] = [
    'kelvin-1876',
    'construction-set',
    'bush-1931',
    'run-it-fast',
    'mis-scaled',
];


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

    const presetDesc = PRESET_DESCRIPTIONS[params.preset];

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">experiment</h3>
                <div className="grid grid-cols-2 gap-2">
                    {PRESET_KEYS.map(key => (
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

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">what the pen is telling you</h3>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-xs text-lime-200/70 leading-relaxed">{narrative}</div>
                </div>

                {snapshot ? (
                    <div className="space-y-2">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide">
                            current vs saved ({snapshot.label})
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <MetricDelta
                                label="useful digits"
                                current={metrics.usefulDigits}
                                saved={snapshot.metrics.usefulDigits}
                                decimals={2}
                            />
                            <MetricDelta
                                label="error"
                                current={metrics.relError}
                                saved={snapshot.metrics.relError}
                                isPercent
                                higherIsBetter={false}
                            />
                            <MetricDelta
                                label="creep"
                                current={metrics.creepPct / 100}
                                saved={snapshot.metrics.creepPct / 100}
                                isPercent
                                higherIsBetter={false}
                            />
                            <MetricDelta
                                label="run"
                                current={metrics.runtimeMinutes}
                                saved={snapshot.metrics.runtimeMinutes}
                                decimals={0}
                                higherIsBetter={false}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="text-lime-200/60">
                            useful digits: <span className="text-lime-400">{metrics.usefulDigits.toFixed(2)}</span>
                        </div>
                        <div className="text-lime-200/60">
                            error: <span className="text-lime-400">{(metrics.relError * 100).toFixed(2)}%</span>
                        </div>
                        <div className="text-lime-200/60">
                            creep: <span className="text-lime-400">{metrics.creepPct.toFixed(3)}%</span>
                        </div>
                        <div className="text-lime-200/60">
                            run: <span className="text-lime-400">{metrics.runtimeMinutes.toFixed(0)} min</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">the problem</h3>
                <div className="text-xs text-lime-200/40 leading-relaxed">
                    The equation the machine is wired to solve. A stiffer problem needs more disc and a slower drive.
                </div>
                <SliderInput
                    label="frequency &omega;"
                    min={0.5} max={2.5} step={0.05}
                    value={params.frequency}
                    onChange={v => set({ frequency: v })}
                    showDecimals
                />
                <SliderInput
                    label="damping &zeta;"
                    min={0.005} max={0.3} step={0.005}
                    value={params.damping}
                    onChange={v => set({ damping: v })}
                    showDecimals
                />
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">the mechanism</h3>
                <SliderInput
                    label="torque amplifier gain (log<sub>10</sub>)"
                    min={0} max={5} step={0.05}
                    value={Math.log10(params.torqueGain)}
                    onChange={v => set({ torqueGain: Math.pow(10, v) })}
                    showDecimals
                />
                <div className="text-xs font-mono text-lime-200/50 -mt-1">
                    G = {formatGain(params.torqueGain)}&times; &middot; the wheel can command{' '}
                    <span className="text-lime-400">{(params.torqueGain * params.friction * params.wheelLoad * params.wheelRadius / 1000).toFixed(2)} N&middot;m</span>
                </div>
                <SliderInput
                    label="friction &mu;"
                    min={0.05} max={0.6} step={0.01}
                    value={params.friction}
                    onChange={v => set({ friction: v })}
                    showDecimals
                />
                <SliderInput
                    label="wheel load (N)"
                    min={2} max={60} step={1}
                    value={params.wheelLoad}
                    onChange={v => set({ wheelLoad: v })}
                />
                <SliderInput
                    label="wheel radius &rho; (mm)"
                    min={5} max={40} step={1}
                    value={params.wheelRadius}
                    onChange={v => set({ wheelRadius: v })}
                />
                <SliderInput
                    label="disc radius R (mm)"
                    min={40} max={250} step={1}
                    value={params.discRadius}
                    onChange={v => set({ discRadius: v })}
                />
                <SliderInput
                    label="gear backlash (arcmin)"
                    min={0} max={120} step={1}
                    value={params.backlash}
                    onChange={v => set({ backlash: v })}
                />
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">operating it</h3>
                <div className="text-xs text-lime-200/40 leading-relaxed">
                    The two decisions an operator actually made. Scaling was hours of arithmetic before a single shaft turned.
                </div>
                <SliderInput
                    label="scale factor k (mm per unit)"
                    min={10} max={400} step={1}
                    value={params.scaleFactor}
                    onChange={v => set({ scaleFactor: v })}
                />
                <div className="text-xs font-mono text-lime-200/50 -mt-1">
                    ceiling <span className="text-lime-400">{(params.discRadius / params.scaleFactor).toFixed(2)}</span> units
                    {' '}&middot; headroom{' '}
                    <span className={metrics.headroomDb < 0 ? 'text-orange-400' : 'text-lime-400'}>
                        {metrics.headroomDb.toFixed(1)} dB
                    </span>
                </div>
                <SliderInput
                    label="machine speed (x-units per second)"
                    min={0.005} max={0.6} step={0.005}
                    value={params.machineSpeed}
                    onChange={v => set({ machineSpeed: v })}
                    showDecimals
                />
                <div className="text-xs font-mono text-lime-200/50 -mt-1">
                    one run takes <span className="text-lime-400">{metrics.runtimeMinutes.toFixed(0)} min</span> of turning
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-2">
                {snapshot ? (
                    <Button label="clear snapshot" onClick={onClearSnapshot} size="sm" className="w-full" />
                ) : (
                    <Button label="save snapshot" onClick={onSaveSnapshot} size="sm" className="w-full" />
                )}
                <Button
                    label="reset preset"
                    onClick={() => selectPreset(params.preset)}
                    size="sm"
                    className="w-full"
                />
            </div>
        </div>
    );
}
