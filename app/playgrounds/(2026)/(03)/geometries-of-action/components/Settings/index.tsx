'use client';

import Button from '@/components/Button';
import SliderInput from '@/components/SliderInput';
import Toggle from '@/components/Toggle';

import {
    Params,
    PresetKey,
    Metrics,
    Snapshot,
    PRESET_DESCRIPTIONS,
    presetParams,
} from '../../logic';


function MetricDelta({ label, current, saved, higherIsBetter = true }: {
    label: string;
    current: number;
    saved: number;
    higherIsBetter?: boolean;
}) {
    const delta = current - saved;
    const arrow = delta > 0.5 ? '\u2191' : delta < -0.5 ? '\u2193' : '=';
    const improved = higherIsBetter ? delta > 0.5 : delta < -0.5;
    const worsened = higherIsBetter ? delta < -0.5 : delta > 0.5;
    const color = improved ? 'text-lime-400' : worsened ? 'text-orange-400' : 'text-lime-200/40';
    return (
        <div className="text-lime-200/60 text-xs font-mono">
            {label}: <span className="text-lime-400">{current.toFixed(1)}%</span>
            {' '}<span className={color}>{arrow} {Math.abs(delta).toFixed(1)}%</span>
        </div>
    );
}


interface SettingsProps {
    params: Params;
    onParamsChange: (params: Params) => void;
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
    const presetKeys: PresetKey[] = ['motor', 'timing', 'species', 'spinal'];
    const activePreset = PRESET_DESCRIPTIONS[params.preset];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lime-400 font-semibold text-sm mb-3">Experiment</h3>
                <div className="grid grid-cols-2 gap-2">
                    {presetKeys.map(key => {
                        const desc = PRESET_DESCRIPTIONS[key];
                        const active = params.preset === key;
                        return (
                            <button
                                key={key}
                                onClick={() => onParamsChange(presetParams(key))}
                                className={`px-3 py-2 text-left text-xs border transition-colors ${
                                    active
                                        ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                        : 'border-lime-500/20 text-lime-200/60 hover:bg-lime-500/5'
                                }`}
                            >
                                {desc.label}
                            </button>
                        );
                    })}
                </div>
                <div className="mt-3 border border-lime-500/20 p-3">
                    <p className="text-xs text-lime-400 leading-relaxed">{activePreset.question}</p>
                    <p className="text-xs text-lime-200/50 leading-relaxed mt-1">{activePreset.expectation}</p>
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            <div>
                <h3 className="text-lime-400 font-semibold text-sm mb-3">Interpretation</h3>
                <div className="border border-lime-500/20 p-3">
                    <p className="text-xs text-lime-200/70 leading-relaxed">{narrative}</p>
                </div>
                {snapshot ? (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <MetricDelta label="decoder" current={metrics.decoderConfidence} saved={snapshot.metrics.decoderConfidence} />
                        <MetricDelta label="alignment" current={metrics.alignmentScore} saved={snapshot.metrics.alignmentScore} />
                        <MetricDelta label="linear rec." current={metrics.linearRecoverability} saved={snapshot.metrics.linearRecoverability} />
                        <MetricDelta label="geometry" current={metrics.geometryPreserved} saved={snapshot.metrics.geometryPreserved} />
                    </div>
                ) : (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="text-xs font-mono text-lime-200/50">decoder <span className="text-lime-400">{metrics.decoderConfidence.toFixed(1)}%</span></div>
                        <div className="text-xs font-mono text-lime-200/50">alignment <span className="text-lime-400">{metrics.alignmentScore.toFixed(1)}%</span></div>
                        <div className="text-xs font-mono text-lime-200/50">linear rec. <span className="text-lime-400">{metrics.linearRecoverability.toFixed(1)}%</span></div>
                        <div className="text-xs font-mono text-lime-200/50">geometry <span className="text-lime-400">{metrics.geometryPreserved.toFixed(1)}%</span></div>
                    </div>
                )}
            </div>

            <div className="border-t border-lime-500/20" />

            <div>
                <h3 className="text-lime-400 font-semibold text-sm mb-3">Display</h3>
                <Toggle
                    text="linear projection"
                    value={params.projectionMode === 'linear'}
                    toggle={() => onParamsChange({
                        ...params,
                        projectionMode: params.projectionMode === 'linear' ? 'nonlinear' : 'linear',
                    })}
                    tooltip="Compare PCA-like linear projection against nonlinear unfolding"
                />
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold text-sm">Manifold geometry</h3>
                <SliderInput
                    label="curvature"
                    min={0.05} max={0.95} step={0.01}
                    value={params.curvature}
                    onChange={v => onParamsChange({ ...params, curvature: v })}
                    showDecimals
                />
                <SliderInput
                    label="task constraint"
                    min={0.1} max={0.98} step={0.01}
                    value={params.taskConstraint}
                    onChange={v => onParamsChange({ ...params, taskConstraint: v })}
                    showDecimals
                />
                <SliderInput
                    label="population noise"
                    min={0.01} max={0.45} step={0.01}
                    value={params.noise}
                    onChange={v => onParamsChange({ ...params, noise: v })}
                    showDecimals
                />
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold text-sm">Dynamics</h3>
                <SliderInput
                    label="traversal speed"
                    min={0.15} max={1.0} step={0.01}
                    value={params.speed}
                    onChange={v => onParamsChange({ ...params, speed: v })}
                    showDecimals
                />
                <SliderInput
                    label="cooling / perturbation"
                    min={0} max={0.95} step={0.01}
                    value={params.cooling}
                    onChange={v => onParamsChange({ ...params, cooling: v })}
                    showDecimals
                />
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold text-sm">Cross-subject & decoding</h3>
                <SliderInput
                    label="cross-subject alignment"
                    min={0.05} max={1.0} step={0.01}
                    value={params.alignment}
                    onChange={v => onParamsChange({ ...params, alignment: v })}
                    showDecimals
                />
                <SliderInput
                    label="residual motor signal"
                    min={0.05} max={1.0} step={0.01}
                    value={params.residual}
                    onChange={v => onParamsChange({ ...params, residual: v })}
                    showDecimals
                />
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="flex gap-2">
                {snapshot ? (
                    <Button label="clear snapshot" size="sm" onClick={onClearSnapshot} />
                ) : (
                    <Button label="save snapshot" size="sm" onClick={onSaveSnapshot} />
                )}
                <Button label="reset preset" size="sm" onClick={() => onParamsChange(presetParams(params.preset))} />
            </div>
        </div>
    );
}
