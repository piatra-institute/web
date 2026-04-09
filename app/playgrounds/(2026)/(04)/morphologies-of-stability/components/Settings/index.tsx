'use client';

import PlaygroundSettings from '@/components/PlaygroundSettings';
import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';

import {
    Params,
    Metrics,
    Snapshot,
    PatternType,
    PresetKey,
    PATTERN_META,
    PRESET_DESCRIPTIONS,
    presetParams,
} from '../../logic';


interface SettingsProps {
    params: Params;
    onParamsChange: (params: Params) => void;
    metrics: Metrics;
    narrative: string;
    snapshot: Snapshot | null;
    running: boolean;
    onToggleRunning: () => void;
    onPerturb: () => void;
    onRandomize: () => void;
    onReset: () => void;
    onSaveSnapshot: () => void;
    onClearSnapshot: () => void;
}


function MetricDelta({ label, current, saved, lowerIsBetter = false }: {
    label: string;
    current: number;
    saved: number;
    lowerIsBetter?: boolean;
}) {
    const delta = current - saved;
    const arrow = delta > 0.005 ? '↑' : delta < -0.005 ? '↓' : '=';
    const improved = lowerIsBetter ? delta < -0.005 : delta > 0.005;
    const worsened = lowerIsBetter ? delta > 0.005 : delta < -0.005;
    const color = improved ? 'text-lime-400' : worsened ? 'text-orange-400' : 'text-lime-200/40';

    return (
        <div className="text-lime-200/60 text-xs font-mono">
            {label}: <span className="text-lime-400">{current.toFixed(3)}</span>
            {' '}<span className={color}>{arrow} {Math.abs(delta).toFixed(3)}</span>
        </div>
    );
}


export default function Settings({
    params,
    onParamsChange,
    metrics,
    narrative,
    snapshot,
    running,
    onToggleRunning,
    onPerturb,
    onRandomize,
    onReset,
    onSaveSnapshot,
    onClearSnapshot,
}: SettingsProps) {
    const presetKeys: PresetKey[] = [
        'point-relaxation',
        'bistable-wells',
        'hopf-oscillator',
        'collective-consensus',
        'near-bifurcation',
    ];

    const patternKeys: PatternType[] = ['point', 'bistable', 'limit', 'consensus'];

    const sections = [
        {
            title: 'Presets',
            content: (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        {presetKeys.map(key => {
                            const desc = PRESET_DESCRIPTIONS[key];
                            const active = params.preset === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => onParamsChange(presetParams(key))}
                                    className={`text-left p-2 text-xs border transition-colors ${
                                        active
                                            ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                            : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                                    }`}
                                >
                                    {desc.label}
                                </button>
                            );
                        })}
                    </div>
                    {params.preset && PRESET_DESCRIPTIONS[params.preset] && (
                        <div className="border border-lime-500/20 p-3 space-y-1">
                            <div className="text-xs text-lime-400 font-medium">
                                {PRESET_DESCRIPTIONS[params.preset].question}
                            </div>
                            <div className="text-xs text-lime-200/50 leading-relaxed">
                                {PRESET_DESCRIPTIONS[params.preset].expectation}
                            </div>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Pattern',
            content: (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        {patternKeys.map(key => {
                            const meta = PATTERN_META[key];
                            const active = params.pattern === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => onParamsChange({ ...params, pattern: key })}
                                    className={`text-left p-2 text-xs border transition-colors ${
                                        active
                                            ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                            : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                                    }`}
                                >
                                    <div className="font-medium">{meta.title}</div>
                                    <div className="text-lime-200/40 mt-0.5">{meta.subtitle}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ),
        },
        {
            title: 'Controls',
            content: (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        <Button label={running ? 'pause' : 'play'} onClick={onToggleRunning} size="xs" />
                        <Button label="perturb" onClick={onPerturb} size="xs" />
                        <Button label="randomize" onClick={onRandomize} size="xs" />
                        <Button label="reset" onClick={onReset} size="xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            label={snapshot ? 'update snapshot' : 'save snapshot'}
                            onClick={onSaveSnapshot}
                            size="xs"
                        />
                        {snapshot && (
                            <Button label="clear snapshot" onClick={onClearSnapshot} size="xs" />
                        )}
                    </div>
                    {snapshot && (
                        <div className="border border-lime-500/20 p-2 space-y-1">
                            <div className="text-xs text-lime-200/40 mb-1">vs. snapshot ({snapshot.label})</div>
                            <MetricDelta
                                label="stability"
                                current={metrics.stabilityIndex}
                                saved={snapshot.metrics.stabilityIndex}
                            />
                            <MetricDelta
                                label="λ"
                                current={metrics.lyapunovEstimate}
                                saved={snapshot.metrics.lyapunovEstimate}
                            />
                            <MetricDelta
                                label="energy"
                                current={metrics.currentEnergy}
                                saved={snapshot.metrics.currentEnergy}
                                lowerIsBetter
                            />
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Global Parameters',
            content: (
                <div className="space-y-3">
                    <SliderInput
                        label="noise intensity"
                        value={params.noise}
                        onChange={v => onParamsChange({ ...params, noise: v })}
                        min={0}
                        max={0.5}
                        step={0.01}
                        showDecimals
                    />
                    <SliderInput
                        label="simulation speed"
                        value={params.simSpeed}
                        onChange={v => onParamsChange({ ...params, simSpeed: v })}
                        min={0.4}
                        max={2.4}
                        step={0.1}
                        showDecimals
                    />
                </div>
            ),
        },
        {
            title: `${PATTERN_META[params.pattern].title} Parameters`,
            content: (
                <div className="space-y-3">
                    {params.pattern === 'point' && (
                        <>
                            <SliderInput
                                label="restoring force k"
                                value={params.pointK}
                                onChange={v => onParamsChange({ ...params, pointK: v })}
                                min={0.2}
                                max={3}
                                step={0.05}
                                showDecimals
                            />
                            <SliderInput
                                label="target x*"
                                value={params.pointTarget}
                                onChange={v => onParamsChange({ ...params, pointTarget: v })}
                                min={-1.5}
                                max={1.5}
                                step={0.05}
                                showDecimals
                            />
                        </>
                    )}
                    {params.pattern === 'bistable' && (
                        <>
                            <SliderInput
                                label="well depth a"
                                value={params.bistableStiffness}
                                onChange={v => onParamsChange({ ...params, bistableStiffness: v })}
                                min={0.3}
                                max={2.6}
                                step={0.05}
                                showDecimals
                            />
                            <SliderInput
                                label="damping γ"
                                value={params.bistableDamping}
                                onChange={v => onParamsChange({ ...params, bistableDamping: v })}
                                min={0.1}
                                max={2.5}
                                step={0.05}
                                showDecimals
                            />
                            <SliderInput
                                label="tilt"
                                value={params.bistableTilt}
                                onChange={v => onParamsChange({ ...params, bistableTilt: v })}
                                min={-1.4}
                                max={1.4}
                                step={0.05}
                                showDecimals
                            />
                        </>
                    )}
                    {params.pattern === 'limit' && (
                        <>
                            <SliderInput
                                label="growth μ"
                                value={params.limitMu}
                                onChange={v => onParamsChange({ ...params, limitMu: v })}
                                min={-0.8}
                                max={2}
                                step={0.05}
                                showDecimals
                            />
                            <SliderInput
                                label="angular speed ω"
                                value={params.limitOmega}
                                onChange={v => onParamsChange({ ...params, limitOmega: v })}
                                min={0.2}
                                max={3}
                                step={0.05}
                                showDecimals
                            />
                        </>
                    )}
                    {params.pattern === 'consensus' && (
                        <>
                            <SliderInput
                                label="coupling c"
                                value={params.consensusCoupling}
                                onChange={v => onParamsChange({ ...params, consensusCoupling: v })}
                                min={0}
                                max={2.4}
                                step={0.05}
                                showDecimals
                            />
                            <SliderInput
                                label="stubbornness s"
                                value={params.consensusStubbornness}
                                onChange={v => onParamsChange({ ...params, consensusStubbornness: v })}
                                min={0}
                                max={1.5}
                                step={0.05}
                                showDecimals
                            />
                            <SliderInput
                                label="anchor"
                                value={params.consensusAnchor}
                                onChange={v => onParamsChange({ ...params, consensusAnchor: v })}
                                min={-1}
                                max={1}
                                step={0.05}
                                showDecimals
                            />
                        </>
                    )}
                </div>
            ),
        },
        {
            title: 'Interpretation',
            content: (
                <div className="border border-lime-500/20 p-3">
                    <p className="text-xs text-lime-200/70 leading-relaxed">{narrative}</p>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundSettings
            title="Settings"
            sections={sections}
        />
    );
}
