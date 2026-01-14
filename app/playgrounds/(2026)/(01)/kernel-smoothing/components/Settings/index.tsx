'use client';

import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';

import type { SimulationParams, DataPoint, DerivedPoint, KernelType } from '../../logic';
import { DEFAULT_PARAMS, DEFAULT_POINTS, fmt, clamp, generateId } from '../../logic';

interface SettingsProps {
    params: SimulationParams;
    onParamsChange: (params: SimulationParams) => void;
    points: DataPoint[];
    onPointsChange: (points: DataPoint[]) => void;
    derivedPoints: DerivedPoint[];
    Z: number;
    yHat: number;
}

export default function Settings({
    params,
    onParamsChange,
    points,
    onPointsChange,
    derivedPoints,
    Z,
    yHat,
}: SettingsProps) {
    const updateParam = <K extends keyof SimulationParams>(
        key: K,
        value: SimulationParams[K]
    ) => {
        onParamsChange({ ...params, [key]: value });
    };

    const addPoint = () => {
        const xs = points.map((p) => p.x).filter(Number.isFinite);
        const newX = xs.length ? xs[xs.length - 1] + 1 : 0;
        onPointsChange([...points, { id: generateId(), x: newX, y: 0 }]);
    };

    const randomizeY = () => {
        onPointsChange(
            points.map((p) => {
                const r = (Math.sin((p.x || 0) * 12.9898 + 78.233) * 43758.5453) % 1;
                const y = (r - 0.5) * 2;
                return { ...p, y: Number.isFinite(y) ? y : 0 };
            })
        );
    };

    const removePoint = (id: string) => {
        onPointsChange(points.filter((p) => p.id !== id));
    };

    const updatePoint = (id: string, field: 'x' | 'y', value: string) => {
        const numValue = parseFloat(value);
        if (!Number.isFinite(numValue)) return;
        onPointsChange(
            points.map((p) => (p.id === id ? { ...p, [field]: numValue } : p))
        );
    };

    const resetToDefaults = () => {
        onParamsChange(DEFAULT_PARAMS);
        onPointsChange([...DEFAULT_POINTS]);
    };

    const kernelLabel =
        params.kernelType === 'gaussian'
            ? 'K(x<sub>q</sub>, x<sub>i</sub>) = exp(−(x<sub>q</sub> − x<sub>i</sub>)² / 2h²)'
            : 'K(x<sub>q</sub>, x<sub>i</sub>) = exp((x<sub>q</sub> · x<sub>i</sub>) / τ)';

    return (
        <div className="space-y-6">
            {/* Kernel type selector */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Kernel type</h3>
                <div className="flex gap-2">
                    {(['gaussian', 'softmaxDot'] as KernelType[]).map((type) => (
                        <button
                            key={type}
                            onClick={() => updateParam('kernelType', type)}
                            className={`px-3 py-2 text-xs border transition-colors ${
                                params.kernelType === type
                                    ? 'bg-lime-500/20 border-lime-500 text-lime-400'
                                    : 'border-lime-500/30 text-lime-200/70 hover:border-lime-500/50'
                            }`}
                        >
                            {type === 'gaussian' ? 'Gaussian' : 'Softmax-dot'}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-lime-200/60" dangerouslySetInnerHTML={{ __html: kernelLabel }} />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <Button label="Add point" onClick={addPoint} size="sm" />
                <Button label="Randomize y" onClick={randomizeY} size="sm" />
                <Button label="Reset" onClick={resetToDefaults} size="sm" />
            </div>

            {/* Query position */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Query position</h3>
                <SliderInput
                    label="Query x<sub>q</sub>"
                    min={-5}
                    max={5}
                    step={0.01}
                    value={params.xq}
                    onChange={(v) => updateParam('xq', v)}
                    showDecimals
                />
                <div className="flex gap-2">
                    <button
                        onClick={() => updateParam('xq', clamp(params.xq - 0.25, -10, 10))}
                        className="px-2 py-1 text-xs border border-lime-500/30 text-lime-200/70 hover:border-lime-500/50"
                    >
                        -0.25
                    </button>
                    <button
                        onClick={() => updateParam('xq', clamp(params.xq + 0.25, -10, 10))}
                        className="px-2 py-1 text-xs border border-lime-500/30 text-lime-200/70 hover:border-lime-500/50"
                    >
                        +0.25
                    </button>
                </div>
            </div>

            {/* Kernel parameters */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Kernel parameters</h3>
                {params.kernelType === 'gaussian' ? (
                    <>
                        <SliderInput
                            label="Bandwidth <i>h</i>"
                            min={0.05}
                            max={5}
                            step={0.01}
                            value={params.h}
                            onChange={(v) => updateParam('h', v)}
                            showDecimals
                        />
                        <p className="text-xs text-lime-200/60 -mt-1">
                            Smaller <i>h</i> = sharper/local weights; larger <i>h</i> = broader smoothing
                        </p>
                    </>
                ) : (
                    <>
                        <SliderInput
                            label="Temperature <i>τ</i>"
                            min={0.05}
                            max={5}
                            step={0.01}
                            value={params.tau}
                            onChange={(v) => updateParam('tau', v)}
                            showDecimals
                        />
                        <p className="text-xs text-lime-200/60 -mt-1">
                            Smaller <i>τ</i> = sharper softmax (peaky); larger <i>τ</i> = flatter weights
                        </p>
                    </>
                )}
            </div>

            {/* Plot range */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Plot range</h3>
                <SliderInput
                    label="x<sub>min</sub>"
                    min={-10}
                    max={0}
                    step={0.5}
                    value={params.xMin}
                    onChange={(v) => updateParam('xMin', v)}
                    showDecimals
                />
                <SliderInput
                    label="x<sub>max</sub>"
                    min={0}
                    max={10}
                    step={0.5}
                    value={params.xMax}
                    onChange={(v) => updateParam('xMax', v)}
                    showDecimals
                />
            </div>

            {/* Output summary */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Output</h3>
                <div className="border border-lime-500/20 p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-lime-200/70">Normalizer ΣK</span>
                        <span className="text-lime-400 font-mono">{fmt(Z, 6)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-lime-200/70" dangerouslySetInnerHTML={{ __html: 'Prediction ŷ(x<sub>q</sub>)' }} />
                        <span className="text-lime-400 font-mono">{fmt(yHat, 6)}</span>
                    </div>
                </div>
                <p className="text-xs text-lime-200/60" dangerouslySetInnerHTML={{ __html: 'α<sub>i</sub> = K(x<sub>q</sub>, x<sub>i</sub>) / Σ<sub>j</sub> K(x<sub>q</sub>, x<sub>j</sub>); ŷ = Σ<sub>i</sub> α<sub>i</sub> · y<sub>i</sub>' }} />
            </div>

            {/* Point editor */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Data points</h3>
                <div className="grid grid-cols-12 gap-1 text-xs text-lime-200/60 font-semibold">
                    <div className="col-span-2" dangerouslySetInnerHTML={{ __html: 'x<sub>i</sub>' }} />
                    <div className="col-span-2" dangerouslySetInnerHTML={{ __html: 'y<sub>i</sub>' }} />
                    <div className="col-span-3" dangerouslySetInnerHTML={{ __html: 'K(x<sub>q</sub>, x<sub>i</sub>)' }} />
                    <div className="col-span-3" dangerouslySetInnerHTML={{ __html: 'α<sub>i</sub>' }} />
                    <div className="col-span-2"></div>
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                    {derivedPoints.map((r) => (
                        <div key={r.id} className="grid grid-cols-12 gap-1 items-center text-xs">
                            <input
                                type="number"
                                step="0.1"
                                className="col-span-2 bg-black border border-lime-500/30 px-1 py-0.5 text-lime-100 focus:border-lime-500 outline-none"
                                value={r.x}
                                onChange={(e) => updatePoint(r.id, 'x', e.target.value)}
                            />
                            <input
                                type="number"
                                step="0.1"
                                className="col-span-2 bg-black border border-lime-500/30 px-1 py-0.5 text-lime-100 focus:border-lime-500 outline-none"
                                value={r.y}
                                onChange={(e) => updatePoint(r.id, 'y', e.target.value)}
                            />
                            <div className="col-span-3 text-lime-200/70 font-mono">{fmt(r.K, 4)}</div>
                            <div className="col-span-3 text-lime-400 font-mono">{fmt(r.alpha, 4)}</div>
                            <div className="col-span-2 flex justify-end">
                                <button
                                    onClick={() => removePoint(r.id)}
                                    className="text-lime-200/50 hover:text-lime-400"
                                    title="Remove"
                                >
                                    x
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
