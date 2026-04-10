'use client';

import PlaygroundSettings from '@/components/PlaygroundSettings';
import SliderInput from '@/components/SliderInput';

import {
    Params, PresetKey, Metrics,
    PRESET_DESCRIPTIONS, PARAM_SPECS, presetParams,
} from '../../logic';


interface SettingsProps {
    params: Params;
    onParamsChange: (p: Params) => void;
    metrics: Metrics;
    narrative: string;
}


export default function Settings({ params, onParamsChange, metrics, narrative }: SettingsProps) {
    const presetKeys: PresetKey[] = ['status-quo', 'segregation', 'emergency', 'reparative'];

    const setParam = (key: keyof Omit<Params, 'preset'>, value: number) => {
        onParamsChange({ ...params, [key]: value });
    };

    const deontic = metrics.deontic;

    // Group sliders by section
    const sections = new Map<string, typeof PARAM_SPECS>();
    for (const spec of PARAM_SPECS) {
        if (!sections.has(spec.section)) sections.set(spec.section, []);
        sections.get(spec.section)!.push(spec);
    }

    const settingSections = [
        {
            title: 'Scenario',
            content: (
                <div className="space-y-2">
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
                </div>
            ),
        },
        ...Array.from(sections.entries()).map(([sectionName, specs]) => ({
            title: sectionName,
            content: (
                <div className="space-y-3">
                    {specs.map(spec => (
                        <SliderInput
                            key={spec.key}
                            label={spec.label}
                            value={params[spec.key]}
                            onChange={v => setParam(spec.key, v)}
                            min={0} max={100} step={1}
                        />
                    ))}
                </div>
            ),
        })),
        {
            title: 'Normative Gate',
            content: (
                <div className="space-y-2">
                    <div className={`border p-3 text-xs ${
                        deontic.forbidden
                            ? 'border-red-500/30 bg-red-500/5 text-red-400'
                            : deontic.severity > 18
                            ? 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400'
                            : 'border-lime-500/30 bg-lime-500/5 text-lime-400'
                    }`}>
                        <div className="font-medium">{deontic.status}</div>
                        <div className="text-lime-200/50 mt-1">
                            Severity: {deontic.severity.toFixed(0)} {'\u00B7'} Violations: {deontic.violations.length}
                        </div>
                    </div>
                    {deontic.violations.length > 0 && (
                        <div className="text-xs text-red-400/70 space-y-0.5">
                            {deontic.violations.map(v => (
                                <div key={v}>{'\u2022'} {v}</div>
                            ))}
                        </div>
                    )}
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

    return (
        <PlaygroundSettings
            title="Settings"
            sections={settingSections}
        />
    );
}
