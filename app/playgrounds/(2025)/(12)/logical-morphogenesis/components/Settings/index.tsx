'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import SliderInput from '@/components/SliderInput';
import {
    Sentence,
    SimulationParams,
    SimulationResult,
    PresetId,
    SentenceType,
    PRESETS,
    SENTENCE_TEMPLATES,
    uid,
    getTypeBadge,
    renderSentenceText,
} from '../../constants';

interface SettingsProps {
    sentences: Sentence[];
    params: SimulationParams;
    selectedPresetId: PresetId;
    simulationResult: SimulationResult;
    onSentencesChange: (sentences: Sentence[]) => void;
    onParamsChange: (params: SimulationParams) => void;
    onPresetChange: (id: PresetId) => void;
    onReset: () => void;
}

export default function Settings({
    sentences,
    params,
    selectedPresetId,
    simulationResult,
    onSentencesChange,
    onParamsChange,
    onPresetChange,
    onReset,
}: SettingsProps) {
    // New sentence form state
    const [newType, setNewType] = useState<SentenceType>('LIAR_SELF');
    const [newLabel, setNewLabel] = useState('New sentence');
    const [newTargetId, setNewTargetId] = useState<string | undefined>(undefined);
    const [newPercent, setNewPercent] = useState(0.7);
    const [newWindow, setNewWindow] = useState(60);

    const newMeta = SENTENCE_TEMPLATES.find((t) => t.value === newType);

    useEffect(() => {
        if (newMeta?.needsTarget && !newTargetId && sentences.length > 0) {
            setNewTargetId(sentences[0].id);
        }
    }, [newMeta, newTargetId, sentences]);

    const updateParam = <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) => {
        onParamsChange({ ...params, [key]: value });
    };

    const addSentence = () => {
        const s: Sentence = {
            id: uid(),
            label: newLabel.trim() || 'Untitled',
            type: newType,
        };
        if (newMeta?.needsTarget) s.targetId = newTargetId;
        if (newMeta?.needsPercent) {
            s.percentTarget = Math.max(0, Math.min(1, newPercent));
            s.window = Math.max(1, Math.floor(newWindow));
        }
        onSentencesChange([...sentences, s]);
        setNewLabel('New sentence');
    };

    const removeSentence = (id: string) => {
        const filtered = sentences
            .filter((s) => s.id !== id)
            .map((s) => (s.targetId === id ? { ...s, targetId: undefined } : s));
        onSentencesChange(filtered);
    };

    const { cycle } = simulationResult;
    const cycleSummary = cycle.found
        ? `Cycle detected: start t=${cycle.startIndex}, period=${cycle.period}`
        : 'No exact cycle detected (within simulated horizon)';

    const selectedPreset = PRESETS.find((p) => p.id === selectedPresetId);

    return (
        <div className="space-y-6">
            {/* Preset Selection */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Preset</h3>
                <select
                    value={selectedPresetId}
                    onChange={(e) => onPresetChange(e.target.value as PresetId)}
                    className="w-full bg-black border border-lime-500/30 text-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-lime-500"
                >
                    {PRESETS.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                            {preset.name}
                        </option>
                    ))}
                </select>
                {selectedPreset && (
                    <p className="text-xs text-gray-400">{selectedPreset.description}</p>
                )}
            </div>

            {/* Cycle Info */}
            <div className="space-y-2">
                <h3 className="text-lime-400 font-semibold">Attractor</h3>
                <div className="bg-black border border-lime-500/20 p-3">
                    <div className="text-sm text-gray-300">{cycleSummary}</div>
                </div>
            </div>

            {/* Sentences List */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Sentences ({sentences.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {sentences.map((s, idx) => {
                        const stat = simulationResult.stats.perSentence[idx];
                        return (
                            <div
                                key={s.id}
                                className="bg-black border border-lime-500/20 p-3 space-y-2"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-mono bg-lime-500/20 text-lime-400 px-1.5 py-0.5">
                                                {getTypeBadge(s.type)}
                                            </span>
                                            <span className="text-sm font-medium text-gray-200 truncate">
                                                {s.label}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {renderSentenceText(s, sentences)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeSentence(s.id)}
                                        className="text-gray-500 hover:text-red-400 text-xs px-2 py-1"
                                    >
                                        ×
                                    </button>
                                </div>
                                {stat && (
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div>
                                            <span className="text-gray-500">mean: </span>
                                            <span className="text-lime-400">{stat.mean.toFixed(2)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">flip: </span>
                                            <span className="text-lime-400">{stat.flipRate.toFixed(2)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">H: </span>
                                            <span className="text-lime-400">{stat.entropyProxy.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Add Sentence */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Add Sentence</h3>

                <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Label"
                    className="w-full bg-black border border-lime-500/30 text-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-lime-500"
                />

                <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as SentenceType)}
                    className="w-full bg-black border border-lime-500/30 text-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-lime-500"
                >
                    {SENTENCE_TEMPLATES.map((t) => (
                        <option key={t.value} value={t.value}>
                            {t.label}
                        </option>
                    ))}
                </select>

                {newMeta?.needsTarget && sentences.length > 0 && (
                    <select
                        value={newTargetId || ''}
                        onChange={(e) => setNewTargetId(e.target.value)}
                        className="w-full bg-black border border-lime-500/30 text-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-lime-500"
                    >
                        {sentences.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                )}

                {newMeta?.needsPercent && (
                    <div className="space-y-2">
                        <SliderInput
                            label="Target %"
                            min={0}
                            max={1}
                            step={0.01}
                            value={newPercent}
                            onChange={setNewPercent}
                            showDecimals
                        />
                        <SliderInput
                            label="Window"
                            min={1}
                            max={100}
                            step={1}
                            value={newWindow}
                            onChange={setNewWindow}
                        />
                    </div>
                )}

                <Button
                    label="Add sentence"
                    onClick={addSentence}
                    className="w-full"
                />
            </div>

            {/* Simulation Parameters */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Simulation</h3>

                <SliderInput
                    label="Steps"
                    min={50}
                    max={500}
                    step={10}
                    value={params.steps}
                    onChange={(v) => updateParam('steps', v)}
                />

                <SliderInput
                    label="Burn-in"
                    min={0}
                    max={100}
                    step={5}
                    value={params.burnIn}
                    onChange={(v) => updateParam('burnIn', v)}
                />

                <div>
                    <label className="text-xs text-gray-400 block mb-1">Initial state</label>
                    <select
                        value={params.initMode}
                        onChange={(e) => updateParam('initMode', e.target.value as SimulationParams['initMode'])}
                        className="w-full bg-black border border-lime-500/30 text-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-lime-500"
                    >
                        <option value="random">Random</option>
                        <option value="all_false">All false</option>
                        <option value="all_true">All true</option>
                        <option value="checker">Checker</option>
                    </select>
                </div>

                <SliderInput
                    label="Noise probability"
                    min={0}
                    max={0.2}
                    step={0.01}
                    value={params.noiseFlipProb}
                    onChange={(v) => updateParam('noiseFlipProb', v)}
                    showDecimals
                />

                <div className="flex gap-2">
                    <Button
                        label="Reseed"
                        onClick={() => updateParam('seed', params.seed + 1)}
                        className="flex-1"
                    />
                    <Button
                        label="Reset"
                        onClick={onReset}
                        className="flex-1"
                    />
                </div>
            </div>

            {/* Info */}
            <div className="text-xs text-gray-500 space-y-2">
                <p>
                    <strong>mean:</strong> Fraction of time true (post burn-in).
                </p>
                <p>
                    <strong>flip:</strong> Frequency of truth-value changes.
                </p>
                <p>
                    <strong>H:</strong> Entropy proxy 4p(1-p), peaks at p=0.5.
                </p>
            </div>
        </div>
    );
}
