'use client';

import React from 'react';

import Button from '@/components/Button';
import SliderInput from '@/components/SliderInput';
import Toggle from '@/components/Toggle';
import Dropdown from '@/components/Dropdown';
import MetricDelta from '@/components/MetricDelta';

import {
    CONTRONYMS,
    CONTRONYM_KEYS,
    applyWord,
    type ContronymKey,
    type Metrics,
    type Params,
    type Snapshot,
} from '../../logic';


interface SettingsProps {
    params: Params;
    onParamsChange: (p: Params) => void;
    metrics: Metrics;
    narrative: string;
    snapshot: Snapshot | null;
    onSaveSnapshot: () => void;
    onClearSnapshot: () => void;
    onRandomExample: () => void;
}


export default function Settings({
    params,
    onParamsChange,
    metrics,
    narrative,
    snapshot,
    onSaveSnapshot,
    onClearSnapshot,
    onRandomExample,
}: SettingsProps) {
    const word = CONTRONYMS[params.word];
    const selectWord = (key: ContronymKey) => onParamsChange(applyWord(params, key));
    const contextNames = word.contexts.map((c) => c.name);
    const currentContextName = contextNames[params.contextIndex] ?? contextNames[0];

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">contronym</h3>
                <div className="grid grid-cols-2 gap-1.5">
                    {CONTRONYM_KEYS.map((key) => (
                        <button
                            key={key}
                            onClick={() => selectWord(key)}
                            className={`py-1.5 px-2 text-xs border transition-colors cursor-pointer text-left ${
                                params.word === key
                                    ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                    : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                            }`}
                        >
                            {CONTRONYMS[key].label}
                        </button>
                    ))}
                </div>
                <div className="border border-lime-500/20 p-3 text-xs text-lime-200/70 leading-relaxed">
                    deep operator: <span className="text-lime-200/90 italic">{word.operator}</span>. context supplies the direction.
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">context frame</h3>
                <Dropdown
                    name="frame"
                    selected={currentContextName}
                    selectables={contextNames}
                    atSelect={(name) =>
                        onParamsChange({
                            ...params,
                            contextIndex: Math.max(0, contextNames.indexOf(name)),
                        })
                    }
                />
                <div title="left attractor A (-100) to right attractor B (+100)">
                    <SliderInput
                        label="manual contextual pull"
                        min={-100}
                        max={100}
                        step={1}
                        value={params.manualPull}
                        onChange={(v) => onParamsChange({ ...params, manualPull: v })}
                    />
                </div>
                <Toggle
                    text="collapse context (paradox mode)"
                    value={params.collapse}
                    toggle={() => onParamsChange({ ...params, collapse: !params.collapse })}
                    tooltip="Force both readings into one context-free dictionary entry. The contradiction is produced by the collapse, not by the word."
                />
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-2">
                <h3 className="text-lime-400 font-semibold text-sm">custom sentence</h3>
                <textarea
                    value={params.customText}
                    onChange={(e) => onParamsChange({ ...params, customText: e.target.value })}
                    placeholder="The committee sanctioned the clinic."
                    rows={3}
                    className="w-full text-xs text-lime-100 border border-lime-500/30 p-2 appearance-none resize-none focus:outline-none focus:border-lime-500/60 [&::placeholder]:!bg-transparent [&::placeholder]:!text-lime-200/40"
                    style={{ backgroundColor: '#000' }}
                />
                <Button label="random example" onClick={onRandomExample} size="sm" className="w-full" />
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">reading</h3>
                <div className="border border-lime-500/20 p-3 text-xs text-lime-200/70 leading-relaxed">
                    {narrative}
                </div>
                {snapshot ? (
                    <div className="space-y-2">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide">
                            current vs saved ({snapshot.label})
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <MetricDelta label="polarity" current={metrics.polarity} saved={snapshot.metrics.polarity} decimals={0} eps={1} />
                            <MetricDelta label="conf" current={metrics.confidence} saved={snapshot.metrics.confidence} decimals={0} eps={1} />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="text-lime-200/60">polarity: <span className="text-lime-400">{metrics.polarity.toFixed(0)}</span></div>
                        <div className="text-lime-200/60">conf: <span className="text-lime-400">{metrics.confidence}%</span></div>
                    </div>
                )}
            </div>

            <div className="border-t border-lime-500/20" />

            <div className="space-y-2">
                {snapshot ? (
                    <Button label="clear snapshot" onClick={onClearSnapshot} size="sm" className="w-full" />
                ) : (
                    <Button label="save snapshot" onClick={onSaveSnapshot} size="sm" className="w-full" />
                )}
            </div>
        </div>
    );
}
