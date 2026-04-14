'use client';

import PlaygroundSettings from '@/components/PlaygroundSettings';
import SliderInput from '@/components/SliderInput';

import {
    Params, PresetKey, StepState,
    PRESET_DESCRIPTIONS, PARAM_SPECS, presetParams,
} from '../../logic';


interface SettingsProps {
    params: Params;
    onParamsChange: (p: Params) => void;
    currentStep: StepState;
    narrative: string;
}


export default function Settings({ params, onParamsChange, currentStep, narrative }: SettingsProps) {
    const presetKeys: PresetKey[] = ['healthy-morphogenesis', 'nimby-lock-in', 'china-overhang', 'informal-explosion'];

    const setParam = (key: keyof Omit<Params, 'preset' | 'horizon'>, value: number) => {
        onParamsChange({ ...params, [key]: value });
    };

    const coherenceTone = currentStep.coherence > 0.6 ? 'border-lime-500/30 bg-lime-500/5 text-lime-400'
        : currentStep.coherence > 0.35 ? 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400'
        : 'border-red-500/30 bg-red-500/5 text-red-400';

    const sections = [
        {
            title: 'Scenario',
            content: (
                <div className="grid grid-cols-1 gap-2">
                    {presetKeys.map(key => (
                        <button
                            key={key}
                            onClick={() => onParamsChange(presetParams(key))}
                            className={`border px-3 py-2 text-left text-xs transition-colors ${
                                params.preset === key
                                    ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                    : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                            }`}
                        >
                            <div className="font-medium">{PRESET_DESCRIPTIONS[key].label}</div>
                            <div className="text-[10px] text-lime-200/40 mt-0.5">{PRESET_DESCRIPTIONS[key].question}</div>
                        </button>
                    ))}
                </div>
            ),
        },
        {
            title: 'Demand & Structure',
            content: (
                <div className="space-y-3">
                    {PARAM_SPECS.slice(0, 4).map(spec => (
                        <SliderInput
                            key={spec.key}
                            label={spec.label}
                            value={params[spec.key]}
                            onChange={v => setParam(spec.key, v)}
                            min={0} max={1} step={0.01} showDecimals
                        />
                    ))}
                </div>
            ),
        },
        {
            title: 'Friction & Veto',
            content: (
                <div className="space-y-3">
                    {PARAM_SPECS.slice(4, 7).map(spec => (
                        <SliderInput
                            key={spec.key}
                            label={spec.label}
                            value={params[spec.key]}
                            onChange={v => setParam(spec.key, v)}
                            min={0} max={1} step={0.01} showDecimals
                        />
                    ))}
                </div>
            ),
        },
        {
            title: 'Coordination & Gluing',
            content: (
                <div className="space-y-3">
                    {PARAM_SPECS.slice(7).map(spec => (
                        <SliderInput
                            key={spec.key}
                            label={spec.label}
                            value={params[spec.key]}
                            onChange={v => setParam(spec.key, v)}
                            min={0} max={1} step={0.01} showDecimals
                        />
                    ))}
                    <SliderInput
                        label="horizon"
                        value={params.horizon}
                        onChange={v => onParamsChange({ ...params, horizon: Math.round(v) })}
                        min={8} max={96} step={1}
                    />
                </div>
            ),
        },
        {
            title: 'State',
            content: (
                <div className={`border p-3 text-xs ${coherenceTone}`}>
                    <div className="font-medium">Step {currentStep.t + 1}</div>
                    <div className="text-lime-200/50 mt-1">
                        Coherence {(currentStep.coherence * 100).toFixed(0)}% {'\u00B7'} FAR {(currentStep.far * 100).toFixed(0)}% {'\u00B7'} Defect {(currentStep.cohomologyDefect * 100).toFixed(0)}%
                    </div>
                </div>
            ),
        },
        {
            title: 'Narrative',
            content: (
                <div className="border border-lime-500/20 p-3 text-xs text-lime-200/70 leading-relaxed">
                    {narrative}
                </div>
            ),
        },
    ];

    return <PlaygroundSettings title="Settings" sections={sections} />;
}
