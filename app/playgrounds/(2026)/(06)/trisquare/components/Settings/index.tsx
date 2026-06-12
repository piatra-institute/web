'use client';

import React from 'react';

import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';
import Toggle from '@/components/Toggle';
import MetricDelta from '@/components/MetricDelta';

import {
    CONFORMAL_PRESETS,
    PRESET_DESCRIPTIONS,
    applyPreset,
    type ConformalPreset,
    type Metrics,
    type Params,
    type Snapshot,
} from '../../logic';


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
    const set = (patch: Partial<Params>) => onParamsChange({ ...params, ...patch });
    const selectPreset = (key: ConformalPreset) => onParamsChange(applyPreset(params, key));
    const active = PRESET_DESCRIPTIONS[params.preset];

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">conformal field</h3>
                <div className="grid grid-cols-2 gap-1.5">
                    {CONFORMAL_PRESETS.map((key) => (
                        <button
                            key={key}
                            onClick={() => selectPreset(key)}
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
                <div className="border border-lime-500/20 p-3 space-y-1">
                    <p className="text-xs text-lime-200/70">{active.question}</p>
                    <p className="text-[11px] text-lime-200/50 leading-relaxed">{active.expectation}</p>
                </div>
            </div>

            <div className="border border-lime-500/20 p-3">
                <p className="text-xs text-lime-200/70 leading-relaxed">{narrative}</p>
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold text-sm">deformation</h3>
                <div title="amplitude A of the conformal deformation">
                    <SliderInput
                        label="amplitude A"
                        min={0}
                        max={0.95}
                        step={0.05}
                        value={params.amplitude}
                        onChange={(v) => set({ amplitude: v })}
                        showDecimals
                    />
                </div>
                <div title="width sigma of the Gaussian features">
                    <SliderInput
                        label="width &sigma;"
                        min={0.3}
                        max={2.5}
                        step={0.1}
                        value={params.width}
                        onChange={(v) => set({ width: v })}
                        showDecimals
                    />
                </div>
                <div title="wave number k for the oscillating preset">
                    <SliderInput
                        label="wave number k"
                        min={0.5}
                        max={5}
                        step={0.1}
                        value={params.waveNumber}
                        onChange={(v) => set({ waveNumber: v })}
                        showDecimals
                    />
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-2">
                <h3 className="text-lime-400 font-semibold text-sm">ward identities</h3>
                <div className="text-[10px] text-lime-200/40 italic leading-relaxed">
                    each symmetry restricts the allowed Lagrangian terms.
                </div>
                <Toggle
                    text="scale invariance"
                    value={params.scaleInvariance}
                    toggle={() => set({ scaleInvariance: !params.scaleInvariance })}
                    tooltip="Forbids terms whose coupling carries mass dimension: the scalar mass, Einstein-Hilbert, and cosmological terms."
                />
                <Toggle
                    text="conformal invariance"
                    value={params.conformalInvariance}
                    toggle={() => set({ conformalInvariance: !params.conformalInvariance })}
                    tooltip="Forbids non-Weyl curvature couplings; only the Weyl-squared action survives among curvature terms."
                />
                <Toggle
                    text="diffeomorphism invariance"
                    value={params.diffeoInvariance}
                    toggle={() => set({ diffeoInvariance: !params.diffeoInvariance })}
                    tooltip="Forbids frame-fixed, non-covariant terms."
                />
                <Toggle
                    text="single coupling"
                    value={params.singleCoupling}
                    toggle={() => set({ singleCoupling: !params.singleCoupling })}
                    tooltip="Merges the surviving dimensionless couplings into one gauge-like coupling."
                />
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold text-sm">phi-fourth flow</h3>
                <div title="initial phi-fourth coupling at the reference scale">
                    <SliderInput
                        label="initial coupling &lambda;<sub>0</sub>"
                        min={0.1}
                        max={2}
                        step={0.05}
                        value={params.lambda0}
                        onChange={(v) => set({ lambda0: v })}
                        showDecimals
                    />
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">readout</h3>
                {snapshot ? (
                    <div className="space-y-2">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide">
                            current vs saved ({snapshot.label})
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <MetricDelta label="peak |K|" current={metrics.maxAbsK} saved={snapshot.metrics.maxAbsK} decimals={2} eps={0.01} />
                            <MetricDelta label="int K" current={metrics.integralK} saved={snapshot.metrics.integralK} decimals={2} eps={0.01} />
                            <MetricDelta label="couplings" current={metrics.independentCouplings} saved={snapshot.metrics.independentCouplings} decimals={0} eps={0.5} higherIsBetter={false} />
                            <MetricDelta label="pole t*" current={metrics.landauPole} saved={snapshot.metrics.landauPole} decimals={1} eps={0.1} />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="text-lime-200/60">peak |K|: <span className="text-lime-400">{metrics.maxAbsK.toFixed(2)}</span></div>
                        <div className="text-lime-200/60">int K: <span className="text-lime-400">{metrics.integralK.toFixed(2)}</span></div>
                        <div className="text-lime-200/60">couplings: <span className="text-lime-400">{metrics.independentCouplings}</span></div>
                        <div className="text-lime-200/60">pole t*: <span className="text-lime-400">{Number.isFinite(metrics.landauPole) ? metrics.landauPole.toFixed(1) : '∞'}</span></div>
                    </div>
                )}
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-2">
                {snapshot ? (
                    <Button label="clear snapshot" onClick={onClearSnapshot} size="sm" className="w-full" />
                ) : (
                    <Button label="save snapshot" onClick={onSaveSnapshot} size="sm" className="w-full" />
                )}
                <Button label="reset preset" onClick={() => selectPreset(params.preset)} size="sm" className="w-full" />
            </div>
        </div>
    );
}
