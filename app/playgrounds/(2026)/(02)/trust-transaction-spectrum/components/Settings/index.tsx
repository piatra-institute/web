'use client';

import SliderInput from '@/components/SliderInput';
import Toggle from '@/components/Toggle';
import Button from '@/components/Button';
import Input from '@/components/Input';

import {
    type Inputs,
    type Scenario,
    PRESETS,
} from '../../logic';


interface SettingsProps {
    inputs: Inputs;
    onInputsChange: (inputs: Inputs) => void;
    scenarioName: string;
    onScenarioNameChange: (name: string) => void;
    scenarios: Scenario[];
    compareId: string | null;
    onCompareIdChange: (id: string | null) => void;
    onSaveScenario: () => void;
    onLoadScenario: (inputs: Inputs) => void;
}

const SLIDER_DEFS = [
    { key: 'threat', label: 'External threat salience', help: 'Probability and severity of coercion or armed conflict within 12-24 months' },
    { key: 'rivalry', label: 'Great-power rivalry intensity', help: 'Degree of systemic contestation in the state\'s strategic neighbourhood' },
    { key: 'alliance', label: 'Alliance credibility', help: 'Observed likelihood that security/economic partners deliver under test conditions' },
    { key: 'institutions', label: 'Institutional shelter strength', help: 'Effective constraint that treaties, courts, and multilateral organisations place on coercion' },
    { key: 'dependence', label: 'Dependency concentration', help: 'Single-source exposure across energy, finance, trade routes, and technology supply chains' },
    { key: 'sanctions', label: 'Sanctions exposure', help: 'Vulnerability to economic sanctions, export controls, and financial exclusion mechanisms' },
    { key: 'cohesion', label: 'Domestic cohesion', help: 'Institutional and societal capacity to sustain policy without internal fragmentation' },
    { key: 'reputation', label: 'Reputational capital stock', help: 'Accumulated credibility premium from predictable commitment execution' },
    { key: 'horizon', label: 'Planning horizon', help: 'Effective decision-making time frame: 1-2 years (low) to 5-15 years (high)' },
    { key: 'leverage', label: 'Relative autonomy', help: 'Independent bargaining power derived from resources, technology, geography, or military capability' },
] as const;

type SliderKey = typeof SLIDER_DEFS[number]['key'];

export default function Settings({
    inputs,
    onInputsChange,
    scenarioName,
    onScenarioNameChange,
    scenarios,
    compareId,
    onCompareIdChange,
    onSaveScenario,
    onLoadScenario,
}: SettingsProps) {
    const set = (key: SliderKey, value: number) => {
        onInputsChange({ ...inputs, [key]: value });
    };

    return (
        <div className="space-y-6 text-sm">
            {/* Regime */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold border-b border-lime-500/30 pb-1">
                    Regime
                </h3>
                <Toggle
                    text="Crisis regime"
                    value={inputs.crisis}
                    toggle={() => onInputsChange({ ...inputs, crisis: !inputs.crisis })}
                    tooltip="Reallocates weight: institutional shelter deficit increases (Thorhallsson), reputational capital decreases, threat salience increases"
                />
            </div>

            {/* Reference Configurations */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold border-b border-lime-500/30 pb-1">
                    Reference Configurations
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.key}
                            onClick={() => onLoadScenario(preset.values)}
                            className="border border-lime-500/30 bg-black px-3 py-2 text-left hover:border-lime-500/50 hover:bg-lime-500/10 transition-colors"
                        >
                            <div className="text-sm text-lime-100">{preset.name}</div>
                            <div className="text-xs text-lime-200/60">{preset.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Independent Variables */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold border-b border-lime-500/30 pb-1">
                    Independent Variables
                </h3>
                {SLIDER_DEFS.map((def) => (
                    <div key={def.key}>
                        <SliderInput
                            label={def.label}
                            value={inputs[def.key]}
                            onChange={(v) => set(def.key, v)}
                            min={0}
                            max={10}
                            step={1}
                        />
                        <div className="text-xs text-lime-200/50 mt-0.5">{def.help}</div>
                    </div>
                ))}
            </div>

            {/* Scenario Snapshots */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold border-b border-lime-500/30 pb-1">
                    Scenario Snapshots
                </h3>

                <Input
                    label="Snapshot name"
                    value={scenarioName}
                    onChange={onScenarioNameChange}
                    placeholder="Baseline"
                    compact
                    className="!w-40"
                />

                <Button
                    label="Save snapshot"
                    onClick={onSaveScenario}
                    size="sm"
                />

                {scenarios.length > 0 && (
                    <>
                        <div className="mt-2">
                            <div className="text-xs text-lime-200/60 mb-1">Compare against</div>
                            <select
                                value={compareId || ''}
                                onChange={(e) => onCompareIdChange(e.target.value || null)}
                                className="w-full border border-lime-500/30 bg-black px-3 py-2 text-sm text-lime-100 outline-none focus:border-lime-500"
                            >
                                <option value="">(none)</option>
                                {scenarios.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} &middot; {Math.round(s.score)}/100
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2 mt-2">
                            {scenarios.slice(0, 5).map((s) => (
                                <div
                                    key={s.id}
                                    className="flex items-center justify-between gap-2 border border-lime-500/20 bg-black px-3 py-2"
                                >
                                    <div>
                                        <div className="text-sm text-lime-100">{s.name}</div>
                                        <div className="text-xs text-lime-200/60">
                                            {Math.round(s.score)}/100 &middot; {s.posture}
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            label="Load"
                                            onClick={() => onLoadScenario(s.inputs)}
                                            size="xs"
                                        />
                                        <Button
                                            label="Compare"
                                            onClick={() => onCompareIdChange(s.id)}
                                            size="xs"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {scenarios.length === 0 && (
                    <div className="text-xs text-lime-200/50">No snapshots yet.</div>
                )}
            </div>
        </div>
    );
}
