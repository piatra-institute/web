'use client';

import PlaygroundSettings from '@/components/PlaygroundSettings';
import SliderInput from '@/components/SliderInput';
import Toggle from '@/components/Toggle';
import Dropdown from '@/components/Dropdown';

import {
    Params, PresetKey, CountryCode, TransferMode, PopulationMode, Kpis,
    PRESET_DESCRIPTIONS, COUNTRIES, presetParams, normalizeBlend,
    formatMoneyBillions,
} from '../../logic';


interface SettingsProps {
    params: Params;
    onParamsChange: (p: Params) => void;
    kpis: Kpis;
    narrative: string;
}


export default function Settings({ params, onParamsChange, kpis, narrative }: SettingsProps) {
    const presetGroups: { label: string; keys: PresetKey[] }[] = [
        { label: 'CEE transition', keys: ['ro-under-pl', 'bg-under-cze', 'hu-under-pl', 'sk-under-cze', 'ro-under-synth'] },
        { label: 'Southern Europe', keys: ['pt-under-ie', 'es-under-de', 'si-under-at-synth'] },
        { label: 'East Asian comparison', keys: ['est-under-kor', 'ro-under-kor'] },
        { label: 'Ukraine scenarios', keys: ['ua-under-pl', 'ua-early-reform'] },
        { label: 'Symmetric check', keys: ['de-under-ro'] },
    ];
    const allCountries = Object.keys(COUNTRIES) as CountryCode[];

    const setModelWeight = (code: CountryCode, w: number) => {
        const next = { ...params.models, [code]: w };
        if (w === 0) delete next[code];
        onParamsChange({ ...params, models: next });
    };

    const normBlend = normalizeBlend(params.models);

    const sections = [
        {
            title: 'Preset scenarios',
            content: (
                <div className="space-y-4">
                    {presetGroups.map(group => (
                        <div key={group.label}>
                            <div className="text-[10px] uppercase tracking-wider text-lime-200/40 mb-1.5">{group.label}</div>
                            <div className="grid grid-cols-1 gap-1.5">
                                {group.keys.map(key => (
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
                                        <div className="text-[10px] text-lime-200/40 mt-0.5 leading-tight">{PRESET_DESCRIPTIONS[key].question}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            title: 'Target country',
            content: (
                <Dropdown
                    name="target"
                    selected={params.target}
                    selectables={allCountries.map(c => `${c} — ${COUNTRIES[c].name}`)}
                    atSelect={(v: string) => onParamsChange({ ...params, target: v.split(' ')[0] as CountryCode })}
                />
            ),
        },
        {
            title: 'Model countries (synthetic control)',
            content: (
                <div className="space-y-2">
                    <div className="text-[10px] text-lime-200/50 leading-relaxed">
                        Blend multiple model countries. Weights auto-normalize. Set 0 to exclude.
                    </div>
                    {allCountries.filter(c => c !== params.target).map(code => {
                        const raw = params.models[code] ?? 0;
                        const norm = normBlend[code] ?? 0;
                        return (
                            <div key={code} className="flex items-center gap-2">
                                <div className="w-16 text-xs" style={{ color: COUNTRIES[code].color }}>
                                    {code}
                                </div>
                                <input
                                    type="range"
                                    min={0} max={1} step={0.05}
                                    value={raw}
                                    onChange={e => setModelWeight(code, parseFloat(e.target.value))}
                                    className="flex-1 h-1 accent-lime-500 cursor-pointer"
                                />
                                <div className="w-10 text-right text-xs font-mono text-lime-200/60">
                                    {norm > 0 ? `${Math.round(norm * 100)}%` : '—'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ),
        },
        {
            title: 'Transfer mode',
            content: (
                <div className="grid grid-cols-2 gap-2">
                    {(['path', 'basket'] as TransferMode[]).map(m => (
                        <button
                            key={m}
                            onClick={() => onParamsChange({ ...params, mode: m })}
                            className={`border px-3 py-2 text-xs transition-colors ${
                                params.mode === m
                                    ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                    : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                            }`}
                        >
                            {m === 'path' ? 'path transfer' : 'decision basket'}
                        </button>
                    ))}
                </div>
            ),
        },
        {
            title: 'Scenario controls',
            content: (
                <div className="space-y-3">
                    <SliderInput
                        label="transfer intensity"
                        value={params.transferIntensity}
                        onChange={v => onParamsChange({ ...params, transferIntensity: v })}
                        min={0} max={1} step={0.01} showDecimals
                    />
                    <SliderInput
                        label="reform start year"
                        value={params.startYear}
                        onChange={v => onParamsChange({ ...params, startYear: Math.round(v) })}
                        min={1990} max={2020} step={1}
                    />
                    <SliderInput
                        label="reform end year"
                        value={params.endYear}
                        onChange={v => onParamsChange({ ...params, endYear: Math.round(v) })}
                        min={Math.max(1995, params.startYear + 1)} max={2024} step={1}
                    />
                    <SliderInput
                        label="phase-in (years)"
                        value={params.phaseInYears}
                        onChange={v => onParamsChange({ ...params, phaseInYears: Math.round(v) })}
                        min={0} max={15} step={1}
                    />
                    <SliderInput
                        label="adoption lag (years)"
                        value={params.adoptionLag}
                        onChange={v => onParamsChange({ ...params, adoptionLag: Math.round(v) })}
                        min={0} max={10} step={1}
                    />
                    <SliderInput
                        label="convergence drag (pp)"
                        value={params.convergenceDrag}
                        onChange={v => onParamsChange({ ...params, convergenceDrag: v })}
                        min={0} max={2} step={0.1} showDecimals
                    />
                    {params.mode === 'basket' && (
                        <SliderInput
                            label="policy override"
                            value={params.policyOverride}
                            onChange={v => onParamsChange({ ...params, policyOverride: v })}
                            min={30} max={90} step={0.5} showDecimals
                        />
                    )}
                    <SliderInput
                        label="uncertainty (%)"
                        value={params.uncertaintyPct}
                        onChange={v => onParamsChange({ ...params, uncertaintyPct: v })}
                        min={0} max={25} step={1}
                    />
                </div>
            ),
        },
        {
            title: 'Analysis window',
            content: (
                <div className="space-y-3">
                    <div className="text-[10px] text-lime-200/50 leading-relaxed">
                        Zoom chart view to a specific year range. Does not affect computation.
                    </div>
                    <SliderInput
                        label="view start"
                        value={params.analysisStart}
                        onChange={v => onParamsChange({ ...params, analysisStart: Math.round(v) })}
                        min={1990} max={Math.max(1991, params.analysisEnd - 1)} step={1}
                    />
                    <SliderInput
                        label="view end"
                        value={params.analysisEnd}
                        onChange={v => onParamsChange({ ...params, analysisEnd: Math.round(v) })}
                        min={Math.max(1991, params.analysisStart + 1)} max={2024} step={1}
                    />
                </div>
            ),
        },
        {
            title: 'Population treatment',
            content: (
                <div className="grid grid-cols-2 gap-2">
                    {(['target', 'scaled-model'] as PopulationMode[]).map(m => (
                        <button
                            key={m}
                            onClick={() => onParamsChange({ ...params, populationMode: m })}
                            className={`border px-3 py-2 text-xs transition-colors ${
                                params.populationMode === m
                                    ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                    : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                            }`}
                        >
                            {m === 'target' ? 'keep target' : 'scale model'}
                        </button>
                    ))}
                </div>
            ),
        },
        {
            title: 'Framing',
            content: (
                <div className="space-y-2">
                    <Toggle
                        text="reverse framing"
                        value={params.reverseFraming}
                        toggle={() => onParamsChange({ ...params, reverseFraming: !params.reverseFraming })}
                        tooltip={<div className="max-w-[240px] p-2 text-xs">Swap target and model: what if the model country had the target's path instead? Symmetric check against treating the model as a normative ideal.</div>}
                    />
                </div>
            ),
        },
        {
            title: 'KPIs',
            content: (
                <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                        <span className="text-lime-200/50">actual 2024 GDP</span>
                        <span className="font-mono text-lime-400">{formatMoneyBillions(kpis.latestActualGDPB)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-lime-200/50">counterfactual 2024</span>
                        <span className="font-mono text-lime-400">{formatMoneyBillions(kpis.latestCounterfactualGDPB)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-lime-200/50">2024 gap</span>
                        <span className={`font-mono ${kpis.latestGapB >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                            {kpis.latestGapB >= 0 ? '+' : ''}{formatMoneyBillions(kpis.latestGapB)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-lime-200/50">2024 lift</span>
                        <span className={`font-mono ${kpis.pctLift >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                            {kpis.pctLift >= 0 ? '+' : ''}{kpis.pctLift.toFixed(1)}%
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-lime-200/50">cumulative 1990–2024</span>
                        <span className={`font-mono ${kpis.cumulativeGapB >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                            {kpis.cumulativeGapB >= 0 ? '+' : ''}{formatMoneyBillions(kpis.cumulativeGapB)}
                        </span>
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
