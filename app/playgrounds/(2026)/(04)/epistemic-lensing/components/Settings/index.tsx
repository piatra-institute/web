'use client';

import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';
import {
    Params,
    PresetKey,
    PRESET_DESCRIPTIONS,
    presetParams,
    Metrics,
    Snapshot,
} from '../../logic';

const PRESET_KEYS: PresetKey[] = ['pure-attenuation', 'selection-warping', 'amplification', 'recursion'];

interface SettingsProps {
    params: Params;
    onParamsChange: (p: Params) => void;
    metrics: Metrics;
    narrative: string;
    snapshot: Snapshot | null;
    onSaveSnapshot: () => void;
    onClearSnapshot: () => void;
}

function MetricDelta({ label, current, saved, lowerIsBetter }: {
    label: string; current: number; saved: number; lowerIsBetter?: boolean;
}) {
    const delta = current - saved;
    const arrow = delta > 0.002 ? '\u2191' : delta < -0.002 ? '\u2193' : '=';
    const improved = lowerIsBetter ? delta < -0.002 : delta > 0.002;
    const worsened = lowerIsBetter ? delta > 0.002 : delta < -0.002;
    const color = improved ? 'text-lime-400' : worsened ? 'text-orange-400' : 'text-lime-200/40';

    return (
        <div className="text-lime-200/60 text-xs font-mono">
            {label}: <span className="text-lime-400">{(current * 100).toFixed(1)}%</span>
            {' '}<span className={color}>{arrow} {Math.abs(delta * 100).toFixed(1)}%</span>
        </div>
    );
}

export default function Settings({
    params, onParamsChange, metrics, narrative, snapshot, onSaveSnapshot, onClearSnapshot,
}: SettingsProps) {
    const update = <K extends keyof Params>(key: K, value: Params[K]) => {
        onParamsChange({ ...params, [key]: value });
    };

    const selectPreset = (key: PresetKey) => onParamsChange(presetParams(key));

    return (
        <div className="space-y-6">
            {/* Presets */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">presets</h3>
                <div className="grid grid-cols-2 gap-1.5">
                    {PRESET_KEYS.map(key => (
                        <button
                            key={key}
                            onClick={() => selectPreset(key)}
                            className={`px-2 py-1.5 text-[10px] font-mono border transition-colors cursor-pointer text-left ${
                                params.preset === key
                                    ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                    : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                            }`}
                        >
                            {PRESET_DESCRIPTIONS[key].label}
                        </button>
                    ))}
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-xs text-lime-400 mb-1">{PRESET_DESCRIPTIONS[params.preset].question}</div>
                    <div className="text-[10px] text-lime-200/50">{PRESET_DESCRIPTIONS[params.preset].expectation}</div>
                </div>
            </div>

            {/* Metrics */}
            <div className="space-y-2">
                <h3 className="text-lime-400 font-semibold text-sm">metrics</h3>
                {snapshot ? (
                    <div className="space-y-1">
                        <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">
                            current vs saved ({snapshot.label})
                        </div>
                        <MetricDelta label="info loss" current={metrics.informationLoss} saved={snapshot.metrics.informationLoss} lowerIsBetter />
                        <MetricDelta label="divergence" current={metrics.posteriorDivergence} saved={snapshot.metrics.posteriorDivergence} lowerIsBetter />
                        <MetricDelta label="curvature" current={Math.abs(metrics.inferentialCurvature)} saved={Math.abs(snapshot.metrics.inferentialCurvature)} lowerIsBetter />
                        <MetricDelta label="hysteresis" current={metrics.hysteresis} saved={snapshot.metrics.hysteresis} lowerIsBetter />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-1 text-xs font-mono text-lime-200/60">
                        <div>info loss: <span className="text-lime-400">{(metrics.informationLoss * 100).toFixed(1)}%</span></div>
                        <div>divergence: <span className="text-lime-400">{(metrics.posteriorDivergence * 100).toFixed(1)}%</span></div>
                        <div>curvature: <span className="text-lime-400">{metrics.inferentialCurvature.toFixed(2)}</span></div>
                        <div>hysteresis: <span className="text-lime-400">{(metrics.hysteresis * 100).toFixed(1)}%</span></div>
                    </div>
                )}
            </div>

            {/* Narrative */}
            <div className="border border-lime-500/20 p-3">
                <div className="text-xs text-lime-200/70 leading-relaxed">{narrative}</div>
            </div>

            {/* Channel parameters */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">channel</h3>
                <SliderInput
                    label="signal strength (attenuation)"
                    min={0} max={100} step={1}
                    value={params.attenuation}
                    onChange={(v) => update('attenuation', v)}
                />
                <SliderInput
                    label="omission rate"
                    min={0} max={100} step={1}
                    value={params.omissionRate}
                    onChange={(v) => update('omissionRate', v)}
                />
                <SliderInput
                    label="warping bias"
                    min={-100} max={100} step={1}
                    value={params.warpingBias}
                    onChange={(v) => update('warpingBias', v)}
                />
                <SliderInput
                    label="amplification gain"
                    min={0} max={100} step={1}
                    value={params.amplificationGain}
                    onChange={(v) => update('amplificationGain', v)}
                />
                <SliderInput
                    label="recursion strength"
                    min={0} max={100} step={1}
                    value={params.recursionStrength}
                    onChange={(v) => update('recursionStrength', v)}
                />
                <SliderInput
                    label="channel noise"
                    min={0} max={100} step={1}
                    value={params.channelNoise}
                    onChange={(v) => update('channelNoise', v)}
                />
            </div>

            {/* Agent parameters */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">agent</h3>
                <SliderInput
                    label="prior strength"
                    min={0} max={100} step={1}
                    value={params.priorStrength}
                    onChange={(v) => update('priorStrength', v)}
                />
                <SliderInput
                    label="trust in channel"
                    min={0} max={100} step={1}
                    value={params.trustInChannel}
                    onChange={(v) => update('trustInChannel', v)}
                />
                <SliderInput
                    label="motivated reasoning"
                    min={0} max={100} step={1}
                    value={params.motivatedReasoning}
                    onChange={(v) => update('motivatedReasoning', v)}
                />
            </div>

            {/* Actions */}
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
