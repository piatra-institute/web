'use client';

import { Params, ChaosStats } from '../../logic';

import SliderInput from '@/components/SliderInput';
import Toggle from '@/components/Toggle';
import Button from '@/components/Button';

interface SettingsProps {
    params: Params;
    onParamsChange: (params: Params) => void;
    stats: ChaosStats;
}

const LAYOUT_OPTIONS = ['circle', 'tower', 'spiral', 'random'] as const;
const COLORING_OPTIONS = ['adversarial', 'distance', 'modular', 'random'] as const;

export default function Settings({
    params,
    onParamsChange,
    stats,
}: SettingsProps) {
    const set = <K extends keyof Params>(key: K, value: Params[K]) =>
        onParamsChange({ ...params, [key]: value });

    return (
        <div className="space-y-6 text-sm text-lime-100">
            <div>
                <h3 className="text-lime-400 font-semibold mb-3">Graph</h3>
                <div className="space-y-3">
                    <SliderInput
                        label="vertices (n)"
                        value={params.nodeCount}
                        onChange={(v) => set('nodeCount', Math.round(v))}
                        min={3}
                        max={22}
                        step={1}
                    />
                    <SliderInput
                        label="colors (r)"
                        value={params.colors}
                        onChange={(v) => set('colors', Math.round(v))}
                        min={2}
                        max={6}
                        step={1}
                    />
                    <SliderInput
                        label="clique target (s)"
                        value={params.cliqueSize}
                        onChange={(v) => set('cliqueSize', Math.round(v))}
                        min={3}
                        max={5}
                        step={1}
                    />
                </div>
            </div>

            <div>
                <h3 className="text-lime-400 font-semibold mb-3">Coloring Strategy</h3>
                <div className="flex flex-wrap gap-2">
                    {COLORING_OPTIONS.map((mode) => (
                        <button
                            key={mode}
                            onClick={() => set('coloringMode', mode)}
                            className={`px-3 py-1.5 text-xs border transition ${
                                params.coloringMode === mode
                                    ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                    : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                            }`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lime-400 font-semibold mb-3">Layout</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                    {LAYOUT_OPTIONS.map((mode) => (
                        <button
                            key={mode}
                            onClick={() => set('layoutMode', mode)}
                            className={`px-3 py-1.5 text-xs border transition ${
                                params.layoutMode === mode
                                    ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                    : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                            }`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
                <SliderInput
                    label="curve bend"
                    value={params.bend}
                    onChange={(v) => set('bend', v)}
                    min={0}
                    max={1.5}
                    step={0.01}
                    showDecimals
                />
            </div>

            <div>
                <h3 className="text-lime-400 font-semibold mb-3">Display</h3>
                <Toggle
                    text="symmetric arcs"
                    value={params.symmetric}
                    toggle={() => set('symmetric', !params.symmetric)}
                />
                <Toggle
                    text="vertex labels"
                    value={params.showLabels}
                    toggle={() => set('showLabels', !params.showLabels)}
                />
                <Toggle
                    text="highlight cliques"
                    value={params.highlightCliques}
                    toggle={() => set('highlightCliques', !params.highlightCliques)}
                />
            </div>

            <div>
                <h3 className="text-lime-400 font-semibold mb-3">Seed</h3>
                <SliderInput
                    label="random seed"
                    value={params.seed}
                    onChange={(v) => set('seed', Math.round(v))}
                    min={1}
                    max={99}
                    step={1}
                />
                <Button
                    label="reroll"
                    onClick={() => set('seed', (params.seed % 99) + 1)}
                    size="sm"
                />
            </div>

            <div className="border border-lime-500/20 p-3">
                <h3 className="text-lime-400 font-semibold mb-2 text-xs uppercase tracking-wider">
                    Ramsey Status
                </h3>
                <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                        <span className="text-lime-200/60">
                            monochromatic K<sub>{params.cliqueSize}</sub>
                        </span>
                        <span className={stats.cliquesFound > 0 ? 'text-red-400 font-bold' : 'text-lime-400'}>
                            {stats.cliquesFound}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-lime-200/60">edges in cliques</span>
                        <span className="text-lime-400">{stats.chaosCost} / {stats.totalEdges}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-lime-200/60">chaos cost</span>
                        <span className={stats.structureRatio > 0 ? 'text-red-400' : 'text-lime-400'}>
                            {(stats.structureRatio * 100).toFixed(1)}%
                        </span>
                    </div>
                    {stats.ramseyNumber && (
                        <div className="flex justify-between">
                            <span className="text-lime-200/60">
                                R({params.cliqueSize},{params.cliqueSize})
                            </span>
                            <span className="text-lime-400">{stats.ramseyNumber}</span>
                        </div>
                    )}
                    <div className="mt-2 pt-2 border-t border-lime-500/10">
                        {stats.structureForced ? (
                            <span className="text-red-400">
                                n = {params.nodeCount} &ge; R({params.cliqueSize},{params.cliqueSize}) = {stats.ramseyNumber}: structure is forced
                            </span>
                        ) : stats.ramseyNumber ? (
                            <span className="text-lime-400">
                                n = {params.nodeCount} &lt; R({params.cliqueSize},{params.cliqueSize}) = {stats.ramseyNumber}: chaos is possible
                            </span>
                        ) : (
                            <span className="text-lime-200/40">
                                R({params.cliqueSize},{params.cliqueSize}) unknown for {params.colors} colors
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
