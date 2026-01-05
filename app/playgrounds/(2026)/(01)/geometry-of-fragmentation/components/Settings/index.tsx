'use client';

import Button from '@/components/Button';
import SliderInput from '@/components/SliderInput';
import { GeneratorMode } from '../../logic';
import { ColorMode } from '../Viewer';



export interface SimulationParams {
    mode: GeneratorMode;
    splits: number;
    sites: number;
    seed: number;
    angleBias: number;
    minArea: number;
    storeEvery: number;
    colorMode: ColorMode;
    showEdges: boolean;
    showFill: boolean;
}

export const DEFAULT_PARAMS: SimulationParams = {
    mode: 'random',
    splits: 300,
    sites: 80,
    seed: 1337,
    angleBias: 0.15,
    minArea: 0.0001,
    storeEvery: 10,
    colorMode: 'sides',
    showEdges: true,
    showFill: true,
};

interface SettingsProps {
    params: SimulationParams;
    onParamsChange: (params: SimulationParams) => void;
    onRegenerate: () => void;
}

export default function Settings({ params, onParamsChange, onRegenerate }: SettingsProps) {
    const updateParam = <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) => {
        onParamsChange({ ...params, [key]: value });
    };

    const handleRegenerate = () => {
        updateParam('seed', params.seed + 1);
        onRegenerate();
    };

    return (
        <div className="space-y-6">
            {/* Mode selection */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Fragmentation mode</h3>
                <div className="flex flex-col gap-1.5">
                    {([
                        { value: 'random', label: 'Random splits', desc: 'Convex splits tend toward ~4 sides' },
                        { value: 'voronoi', label: 'Voronoi', desc: 'Cell-based patterns tend toward ~6 sides' },
                        { value: 'mixed', label: 'Voronoi + splits', desc: 'Competing attractors' },
                    ] as const).map((m) => (
                        <button
                            key={m.value}
                            onClick={() => updateParam('mode', m.value)}
                            className={`px-3 py-2 text-left border transition-colors ${
                                params.mode === m.value
                                    ? 'border-lime-500 text-lime-400 bg-lime-500/10'
                                    : 'border-lime-500/30 text-lime-100 hover:border-lime-500/50'
                            }`}
                        >
                            <div className="text-sm font-medium">{m.label}</div>
                            <div className="text-xs text-lime-200/70">{m.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Parameters */}
            {(params.mode === 'random' || params.mode === 'mixed') && (
                <div className="space-y-3">
                    <h3 className="text-lime-400 font-semibold text-sm">Split parameters</h3>
                    <SliderInput
                        label="Splits"
                        min={10}
                        max={800}
                        step={10}
                        value={params.splits}
                        onChange={(v) => updateParam('splits', v)}
                    />
                    <SliderInput
                        label="Angle bias"
                        min={0}
                        max={1}
                        step={0.05}
                        value={params.angleBias}
                        onChange={(v) => updateParam('angleBias', v)}
                        showDecimals
                    />
                    <p className="text-xs text-lime-200/60">
                        0 = uniform; 1 = axis-aligned (more rectangular)
                    </p>
                </div>
            )}

            {(params.mode === 'voronoi' || params.mode === 'mixed') && (
                <div className="space-y-3">
                    <h3 className="text-lime-400 font-semibold text-sm">Voronoi parameters</h3>
                    <SliderInput
                        label="Sites"
                        min={10}
                        max={300}
                        step={5}
                        value={params.sites}
                        onChange={(v) => updateParam('sites', v)}
                    />
                </div>
            )}

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">History sampling</h3>
                <SliderInput
                    label="Store every N steps"
                    min={0}
                    max={50}
                    step={1}
                    value={params.storeEvery}
                    onChange={(v) => updateParam('storeEvery', v)}
                />
                <p className="text-xs text-lime-200/60">
                    0 = no history; higher = smoother trajectory plots
                </p>
            </div>

            {/* Display options */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Display</h3>
                <div className="flex gap-2">
                    <label className="flex items-center gap-2 text-xs text-lime-100 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={params.showFill}
                            onChange={(e) => updateParam('showFill', e.target.checked)}
                            className="accent-lime-500"
                        />
                        Fill
                    </label>
                    <label className="flex items-center gap-2 text-xs text-lime-100 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={params.showEdges}
                            onChange={(e) => updateParam('showEdges', e.target.checked)}
                            className="accent-lime-500"
                        />
                        Edges
                    </label>
                </div>
                <div className="space-y-1">
                    <div className="text-xs text-lime-200/70">Color by</div>
                    <div className="flex gap-1.5">
                        {(['sides', 'area', 'index'] as const).map((c) => (
                            <button
                                key={c}
                                onClick={() => updateParam('colorMode', c)}
                                className={`px-2 py-1 text-xs border transition-colors ${
                                    params.colorMode === c
                                        ? 'border-lime-500 text-lime-400 bg-lime-500/10'
                                        : 'border-lime-500/30 text-lime-100 hover:border-lime-500/50'
                                }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
                <Button
                    label="Regenerate"
                    onClick={handleRegenerate}
                    className="w-full"
                />
                <div className="flex gap-2">
                    <input
                        type="number"
                        value={params.seed}
                        onChange={(e) => updateParam('seed', parseInt(e.target.value) || 0)}
                        className="flex-1 px-2 py-1.5 bg-black border border-lime-500/30 text-white text-sm focus:border-lime-500 focus:outline-none"
                        placeholder="Seed"
                    />
                </div>
            </div>

            {/* Summary */}
            <div className="text-xs text-lime-200/60 space-y-2 border-t border-lime-500/20 pt-4">
                <p className="text-lime-100 font-medium">Universal geometry of fragmentation</p>
                <p>
                    Random 3D fragmentation produces shapes averaging ~6 faces, ~8 vertices (cube-like topology).
                </p>
                <p>
                    In 2D: random splits average ~4 sides; Voronoi patterns average ~6 sides.
                </p>
            </div>
        </div>
    );
}
