'use client';

import React from 'react';
import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';
import {
    Params,
    AuthorName,
    AUTHORS,
    DerivedVariant,
    fmt,
} from '../../logic';

interface SettingsProps {
    author: AuthorName;
    onAuthorChange: (a: AuthorName) => void;
    seed: number;
    onSeedChange: (s: number) => void;
    params: Params;
    onParamsChange: (p: Params) => void;
    query: string;
    onQueryChange: (q: string) => void;
    tick: number;
    populationSize: number;
    running: boolean;
    onToggleRunning: () => void;
    onStep: () => void;
    onReset: () => void;
    topCliches: DerivedVariant[];
    selectedId: string | null;
    onSelectId: (id: string) => void;
}

export default function Settings({
    author,
    onAuthorChange,
    seed,
    onSeedChange,
    params,
    onParamsChange,
    query,
    onQueryChange,
    tick,
    populationSize,
    running,
    onToggleRunning,
    onStep,
    onReset,
    topCliches,
    selectedId,
    onSelectId,
}: SettingsProps) {
    const btnClass = (a: AuthorName) =>
        `px-3 py-2 text-xs border transition-colors ${
            author === a
                ? 'bg-lime-500/10 border-lime-500 text-lime-100'
                : 'border-lime-500/30 text-lime-200/70 hover:bg-lime-500/20 hover:border-lime-500'
        }`;

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Controls</h3>
                <div className="grid grid-cols-3 gap-2">
                    <Button
                        label={running ? 'Pause' : 'Play'}
                        onClick={onToggleRunning}
                        size="sm"
                        className="w-full"
                    />
                    <Button
                        label="Step"
                        onClick={onStep}
                        size="sm"
                        className="w-full"
                    />
                    <Button
                        label="Reset"
                        onClick={onReset}
                        size="sm"
                        className="w-full"
                    />
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Author */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Author</h3>
                <div className="grid grid-cols-3 gap-2">
                    {AUTHORS.map((a) => (
                        <button
                            key={a}
                            onClick={() => onAuthorChange(a)}
                            className={btnClass(a)}
                        >
                            {a}
                        </button>
                    ))}
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Seed */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Seed</h3>
                <input
                    type="number"
                    value={seed}
                    onChange={(e) => onSeedChange(parseInt(e.target.value || '0', 10) || 0)}
                    style={{ backgroundColor: '#000' }}
                    className="w-full border border-lime-500/30 px-3 py-2 text-sm text-lime-100 rounded-none focus:outline-none focus:border-lime-500 appearance-none"
                />
            </div>

            {/* Search */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Search</h3>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    placeholder="filter by substring"
                    style={{ backgroundColor: '#000' }}
                    className="w-full border border-lime-500/30 px-3 py-2 text-sm text-lime-100 rounded-none focus:outline-none focus:border-lime-500 appearance-none [&::placeholder]:!bg-transparent [&::placeholder]:!text-lime-200/40"
                />
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Parameters */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Parameters</h3>
                <SliderInput
                    label="Amplification"
                    min={0} max={1} step={0.01}
                    value={params.amp}
                    onChange={(v) => onParamsChange({ ...params, amp: v })}
                    showDecimals
                />
                <SliderInput
                    label="Generality reward"
                    min={0} max={1} step={0.01}
                    value={params.generalityReward}
                    onChange={(v) => onParamsChange({ ...params, generalityReward: v })}
                    showDecimals
                />
                <SliderInput
                    label="Brevity penalty"
                    min={0} max={1} step={0.01}
                    value={params.brevityPenalty}
                    onChange={(v) => onParamsChange({ ...params, brevityPenalty: v })}
                    showDecimals
                />
                <SliderInput
                    label="Mutation rate"
                    min={0} max={1} step={0.01}
                    value={params.mutationRate}
                    onChange={(v) => onParamsChange({ ...params, mutationRate: v })}
                    showDecimals
                />
                <SliderInput
                    label="Prestige bonus"
                    min={0} max={1} step={0.01}
                    value={params.prestigeBonus}
                    onChange={(v) => onParamsChange({ ...params, prestigeBonus: v })}
                    showDecimals
                />
                <SliderInput
                    label="Context collapse"
                    min={0} max={1} step={0.01}
                    value={params.contextCollapse}
                    onChange={(v) => onParamsChange({ ...params, contextCollapse: v })}
                    showDecimals
                />
                <SliderInput
                    label="Misattribution pressure"
                    min={0} max={1} step={0.01}
                    value={params.misattributionPressure}
                    onChange={(v) => onParamsChange({ ...params, misattributionPressure: v })}
                    showDecimals
                />
                <SliderInput
                    label="Noise"
                    min={0} max={1} step={0.01}
                    value={params.noise}
                    onChange={(v) => onParamsChange({ ...params, noise: v })}
                    showDecimals
                />
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Interpretation hint */}
            <div className="border border-lime-500/20 p-3 text-xs text-lime-200/60 leading-relaxed">
                <ul className="list-disc pl-5 space-y-1">
                    <li><span className="text-lime-100">Amplification</span> boosts cross-channel portability.</li>
                    <li><span className="text-lime-100">Context collapse</span> erodes retention as circulation rises.</li>
                    <li><span className="text-lime-100">Misattribution</span> decouples source from name; name may still rise.</li>
                    <li><span className="text-lime-100">Mutation</span> spawns paraphrases/excerpts that drift toward generality.</li>
                </ul>
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Status */}
            <div className="text-xs text-lime-200/60">
                Tick: <span className="text-lime-400 font-mono">{tick}</span> &middot; Population: <span className="text-lime-400 font-mono">{populationSize}</span>
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Top clichés */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Top clichés</h3>
                <div className="space-y-2">
                    {topCliches.map((r) => (
                        <button
                            key={r.id}
                            className={`w-full text-left border p-2 transition-colors ${
                                selectedId === r.id
                                    ? 'bg-lime-500/10 border-lime-500'
                                    : 'border-lime-500/20 hover:bg-lime-500/10'
                            }`}
                            onClick={() => onSelectId(r.id)}
                        >
                            <div className="text-xs text-lime-200/60">
                                {r.author} &middot; C={fmt(r.cliche)} &middot; E={fmt(r.entanglement)}
                            </div>
                            <div className="text-sm text-lime-100 line-clamp-2">
                                &ldquo;{r.text}&rdquo;
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
