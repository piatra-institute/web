'use client';

import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import Input from '@/components/Input';

import {
    type Params,
    type PresetKey,
    modes,
    FIELDS,
    PRESET_DESCRIPTIONS,
    presetParams,
} from '../../logic';


interface SettingsProps {
    params: Params;
    onParamsChange: (params: Params) => void;
    narrative: string;
    visibleCount: number;
    totalCount: number;
}

export default function Settings({
    params,
    onParamsChange,
    narrative,
    visibleCount,
    totalCount,
}: SettingsProps) {
    const presetKeys: PresetKey[] = ['overview', 'universal-templates', 'action-hierarchy', 'topology-surgery'];

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
                {params.preset && (
                    <div className="mt-3 border border-lime-500/20 p-3">
                        <p className="text-xs text-lime-400 leading-relaxed">{PRESET_DESCRIPTIONS[params.preset].question}</p>
                        <p className="text-xs text-lime-200/50 leading-relaxed mt-1">{PRESET_DESCRIPTIONS[params.preset].expectation}</p>
                    </div>
                )}
            </div>

            <div className="border-t border-lime-500/20" />

            <div>
                <h3 className="text-lime-400 font-semibold text-sm mb-3">Interpretation</h3>
                <div className="border border-lime-500/20 p-3">
                    <p className="text-xs text-lime-200/70 leading-relaxed">{narrative}</p>
                </div>
                <div className="mt-2 text-xs font-mono text-lime-200/50">
                    {visibleCount} / {totalCount} constructions
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            <div>
                <h3 className="text-lime-400 font-semibold text-sm mb-3">Search</h3>
                <Input
                    value={params.search}
                    onChange={(v) => onParamsChange({ ...params, search: v })}
                    placeholder="name, notation, idea..."
                    compact
                    fullWidth
                />
            </div>

            <div className="border-t border-lime-500/20" />

            <div>
                <h3 className="text-lime-400 font-semibold text-sm mb-3">Filters</h3>
                <div className="space-y-3">
                    <Dropdown
                        name="field"
                        selected={params.selectedField}
                        selectables={['All', ...FIELDS]}
                        atSelect={(v) => onParamsChange({ ...params, selectedField: v })}
                    />
                    <Dropdown
                        name="sort"
                        selected={params.sortBy}
                        selectables={['name', 'coverage', 'difficulty']}
                        atSelect={(v) => onParamsChange({ ...params, sortBy: v as Params['sortBy'] })}
                    />
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            <div>
                <h3 className="text-lime-400 font-semibold text-sm mb-3">Mode filter</h3>
                <div className="grid grid-cols-2 gap-1">
                    <button
                        onClick={() => onParamsChange({ ...params, selectedMode: 'all' })}
                        className={`px-2 py-1.5 text-[10px] border transition-colors ${
                            params.selectedMode === 'all'
                                ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                : 'border-lime-500/20 text-lime-200/50 hover:bg-lime-500/5'
                        }`}
                    >
                        all modes
                    </button>
                    {modes.map(m => {
                        const active = params.selectedMode === m.key;
                        return (
                            <button
                                key={m.key}
                                onClick={() => onParamsChange({ ...params, selectedMode: active ? 'all' : m.key })}
                                className={`px-2 py-1.5 text-[10px] border transition-colors text-left ${
                                    active
                                        ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                        : 'border-lime-500/20 text-lime-200/50 hover:bg-lime-500/5'
                                }`}
                            >
                                {m.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            <Button
                label="reset filters"
                size="sm"
                onClick={() => onParamsChange(presetParams('overview'))}
            />
        </div>
    );
}
