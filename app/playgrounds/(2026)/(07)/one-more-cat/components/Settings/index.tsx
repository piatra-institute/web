'use client';

import React from 'react';

import PlaygroundSettings from '@/components/PlaygroundSettings';
import Button from '@/components/Button';

import {
    PARAM_GROUPS,
    PARAM_META,
    PRESET_DESCRIPTIONS,
    formatParamValue,
    monthLabel,
    type ParamGroup,
    type ParamMeta,
    type Params,
    type PresetKey,
    type SimMode,
    type SimResult,
    type Snapshot,
} from '../../logic';


const PRESET_KEYS: PresetKey[] = ['rural', 'pair', 'litter', 'rescuer', 'overload', 'sanctuary'];
const MODES: { key: SimMode; label: string }[] = [
    { key: 'expected', label: 'expected' },
    { key: 'stochastic', label: 'stochastic' },
    { key: 'ensemble', label: 'ensemble' },
];


interface SettingsProps {
    params: Params;
    onParamsChange: (p: Params) => void;
    preset: PresetKey | null;
    onPreset: (k: PresetKey) => void;
    mode: SimMode;
    onModeChange: (m: SimMode) => void;
    seed: number;
    onReseed: () => void;
    snapshot: Snapshot | null;
    onSaveSnapshot: () => void;
    onClearSnapshot: () => void;
    sim: SimResult;
    narrative: string;
}


function ParamSlider({ meta, value, onChange }: { meta: ParamMeta; value: number; onChange: (v: number) => void }) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between items-baseline gap-2">
                <span className="text-[11px] text-lime-200/70">{meta.label}</span>
                <span className="text-lime-400 font-mono text-xs shrink-0">{formatParamValue(meta.key, value)}</span>
            </div>
            <input
                type="range"
                min={meta.min}
                max={meta.max}
                step={meta.step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-1 accent-lime-500 cursor-pointer bg-lime-500/20"
            />
            <div className="text-[10px] text-lime-200/35 leading-snug">{meta.note}</div>
        </div>
    );
}


function MetricDelta({ label, current, saved, digits, higherIsWorse }: {
    label: string; current: number; saved: number; digits: number; higherIsWorse: boolean;
}) {
    const delta = current - saved;
    const eps = Math.pow(10, -digits) * 5;
    const arrow = delta > eps ? '↑' : delta < -eps ? '↓' : '=';
    const worse = higherIsWorse ? delta > eps : delta < -eps;
    const better = higherIsWorse ? delta < -eps : delta > eps;
    const color = worse ? 'text-orange-400' : better ? 'text-lime-400' : 'text-lime-200/40';
    return (
        <div className="flex justify-between text-[11px] font-mono">
            <span className="text-lime-200/60">{label}</span>
            <span>
                <span className="text-lime-300">{current.toFixed(digits)}</span>{' '}
                <span className={color}>{arrow} {Math.abs(delta).toFixed(digits)}</span>
            </span>
        </div>
    );
}


export default function Settings({
    params, onParamsChange, preset, onPreset, mode, onModeChange, seed, onReseed,
    snapshot, onSaveSnapshot, onClearSnapshot, sim, narrative,
}: SettingsProps) {
    const set = (key: keyof Params) => (v: number) => onParamsChange({ ...params, [key]: v });

    const scenarioSection = (
        <div className="space-y-4">
            <div>
                <div className="text-[10px] uppercase tracking-wide text-lime-200/40 mb-2">presets</div>
                <div className="grid grid-cols-2 gap-1.5">
                    {PRESET_KEYS.map((k) => (
                        <button
                            key={k}
                            onClick={() => onPreset(k)}
                            className={`px-2 py-1.5 text-[11px] font-mono border text-left transition-colors cursor-pointer ${
                                preset === k
                                    ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                    : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                            }`}
                        >
                            {PRESET_DESCRIPTIONS[k].label}
                        </button>
                    ))}
                </div>
                {preset && (
                    <div className="border border-lime-500/20 p-2.5 mt-2 space-y-1">
                        <div className="text-[11px] text-lime-200/80 leading-snug">{PRESET_DESCRIPTIONS[preset].question}</div>
                        <div className="text-[10px] text-lime-200/50 leading-snug">{PRESET_DESCRIPTIONS[preset].expectation}</div>
                    </div>
                )}
            </div>

            <div>
                <div className="text-[10px] uppercase tracking-wide text-lime-200/40 mb-2">simulation mode</div>
                <div className="flex gap-1.5">
                    {MODES.map((m) => (
                        <button
                            key={m.key}
                            onClick={() => onModeChange(m.key)}
                            className={`flex-1 px-2 py-1.5 text-[11px] font-mono border transition-colors cursor-pointer ${
                                mode === m.key
                                    ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                    : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                            }`}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
                {mode !== 'expected' && (
                    <div className="flex items-center justify-between mt-2 text-[11px] font-mono text-lime-200/60">
                        <span>seed {seed}</span>
                        <Button label="new seed" onClick={onReseed} size="xs" />
                    </div>
                )}
                <div className="text-[10px] text-lime-200/35 leading-snug mt-1">
                    expected shows the smooth mean path; stochastic draws one random history; ensemble runs 200 and shows quantile bands.
                </div>
            </div>

            <div>
                <div className="text-[10px] uppercase tracking-wide text-lime-200/40 mb-2">snapshot</div>
                <div className="flex gap-1.5">
                    <Button label="save current" onClick={onSaveSnapshot} size="xs" />
                    {snapshot && <Button label="clear" onClick={onClearSnapshot} size="xs" />}
                </div>
                {snapshot && (
                    <div className="border border-lime-500/20 p-2.5 mt-2 space-y-1">
                        <div className="text-[10px] text-lime-200/45 mb-1">vs saved &ldquo;{snapshot.label}&rdquo; ({snapshot.regimeLabel})</div>
                        <MetricDelta label="final cats" current={sim.final.n} saved={snapshot.finalCats} digits={1} higherIsWorse />
                        <MetricDelta label="peak rho" current={sim.peakRho} saved={snapshot.peakRho} digits={2} higherIsWorse />
                        <MetricDelta label="min welfare" current={sim.minWelfare} saved={snapshot.minWelfare} digits={0} higherIsWorse={false} />
                    </div>
                )}
            </div>

            <div className="border border-lime-500/20 p-3">
                <div className="text-[10px] uppercase tracking-wide text-lime-200/40 mb-1.5">reading of the current run</div>
                <div className="text-[11px] text-lime-200/70 leading-relaxed">{narrative}</div>
            </div>
        </div>
    );

    const groupSection = (group: ParamGroup) => (
        <div className="space-y-3.5">
            {PARAM_META.filter((m) => m.group === group).map((m) => (
                <ParamSlider key={m.key} meta={m} value={params[m.key]} onChange={set(m.key)} />
            ))}
            {group === 'Intervention lab' && (
                <div className="text-[10px] text-lime-200/40 leading-snug border-l-2 border-lime-500/30 pl-2">
                    set intervention month above 0 to switch on a timed policy: sterilization, rehoming, capacity, and intake boosts all begin at {monthLabel(params.interventionMonth || 0)}.
                </div>
            )}
        </div>
    );

    return (
        <PlaygroundSettings
            title="Cat cascade lab"
            sections={[
                { title: 'Scenario', content: scenarioSection },
                ...PARAM_GROUPS.map((g) => ({ title: g, content: groupSection(g) })),
            ]}
        />
    );
}
