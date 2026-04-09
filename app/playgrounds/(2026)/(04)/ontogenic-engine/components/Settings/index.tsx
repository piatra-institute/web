'use client';

import PlaygroundSettings from '@/components/PlaygroundSettings';
import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';

import {
    Params,
    Scores,
    Snapshot,
    PresetKey,
    PhaseRegime,
    PRESET_DESCRIPTIONS,
    PARAM_META,
    SweepableParam,
    presetParams,
} from '../../logic';


interface SettingsProps {
    params: Params;
    onParamsChange: (params: Params) => void;
    scores: Scores;
    narrative: string;
    snapshot: Snapshot | null;
    onSaveSnapshot: () => void;
    onClearSnapshot: () => void;
}

const PHASE_COLORS: Record<PhaseRegime, string> = {
    'World-Oriented Becoming': 'text-lime-400 border-lime-500/30',
    'Metastable Individuation': 'text-lime-300 border-lime-500/20',
    'Rigid Closure': 'text-yellow-400 border-yellow-500/30',
    'Chaotic Drift': 'text-orange-400 border-orange-500/30',
    'Dissolution': 'text-red-400 border-red-500/30',
};

function MetricDelta({ label, current, saved, higherIsBetter = true }: {
    label: string;
    current: number;
    saved: number;
    higherIsBetter?: boolean;
}) {
    const delta = current - saved;
    const arrow = delta > 0.5 ? '↑' : delta < -0.5 ? '↓' : '=';
    const improved = higherIsBetter ? delta > 0.5 : delta < -0.5;
    const worsened = higherIsBetter ? delta < -0.5 : delta > 0.5;
    const color = improved ? 'text-lime-400' : worsened ? 'text-orange-400' : 'text-lime-200/40';

    return (
        <div className="text-lime-200/60 text-xs font-mono">
            {label}: <span className="text-lime-400">{current}</span>
            {' '}<span className={color}>{arrow} {Math.abs(delta)}</span>
        </div>
    );
}


export default function Settings({
    params,
    onParamsChange,
    scores,
    narrative,
    snapshot,
    onSaveSnapshot,
    onClearSnapshot,
}: SettingsProps) {
    const presetKeys: PresetKey[] = [
        'world-oriented-learner',
        'autopoietic-core',
        'rigid-organism',
        'chaotic-drift',
    ];

    const paramKeys: SweepableParam[] = [
        'autonomy', 'boundary', 'plasticity', 'coupling', 'memory', 'perturbation',
    ];

    const phaseColor = PHASE_COLORS[scores.phase] ?? 'text-lime-200/60 border-lime-500/20';

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
                    {PRESET_DESCRIPTIONS[params.preset] && (
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
            title: 'Regime',
            content: (
                <div className="space-y-3">
                    <div className={`border p-3 ${phaseColor}`}>
                        <div className="text-xs uppercase tracking-wider mb-1">current phase</div>
                        <div className="text-sm font-semibold">{scores.phase}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                        <div className="text-center">
                            <div className="text-lime-200/40">becoming</div>
                            <div className="text-lime-400 text-lg">{scores.becomingIndex}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lime-200/40">adaptive</div>
                            <div className="text-lime-400 text-lg">{scores.adaptiveRange}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lime-200/40">rigidity</div>
                            <div className="text-lime-400 text-lg">{scores.rigidity}</div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Control Manifold',
            content: (
                <div className="space-y-3">
                    {paramKeys.map(key => (
                        <SliderInput
                            key={key}
                            label={PARAM_META[key].label}
                            value={params[key]}
                            onChange={v => onParamsChange({ ...params, [key]: v })}
                            min={0}
                            max={100}
                            step={1}
                        />
                    ))}
                    <SliderInput
                        label="simulation steps"
                        value={params.steps}
                        onChange={v => onParamsChange({ ...params, steps: v })}
                        min={20}
                        max={200}
                        step={10}
                    />
                </div>
            ),
        },
        {
            title: 'Snapshot',
            content: (
                <div className="space-y-3">
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
                            <MetricDelta label="becoming" current={scores.becomingIndex} saved={snapshot.scores.becomingIndex} />
                            <MetricDelta label="viability" current={scores.viability} saved={snapshot.scores.viability} />
                            <MetricDelta label="coherence" current={scores.coherence} saved={snapshot.scores.coherence} />
                            <MetricDelta label="novelty" current={scores.novelty} saved={snapshot.scores.novelty} />
                            <MetricDelta label="tension" current={scores.tension} saved={snapshot.scores.tension} higherIsBetter={false} />
                        </div>
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
