'use client';

import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';

import {
    KnotSpec,
    gcd,
    torusUnknottingNumber,
    torusCrossingNumber,
    isBHCounterexample,
    fmt,
} from '../../logic/knot';


interface SettingsProps {
    // Knot specs
    knotA: KnotSpec;
    knotB: KnotSpec;
    onKnotAChange: (spec: KnotSpec) => void;
    onKnotBChange: (spec: KnotSpec) => void;

    // View mode
    mode: 'A' | 'B' | 'SUM';
    onModeChange: (mode: 'A' | 'B' | 'SUM') => void;

    // Geometry
    samples: number;
    onSamplesChange: (samples: number) => void;

    // Connected sum options
    sumFlipB: boolean;
    onSumFlipBChange: (flip: boolean) => void;

    // Tighten
    tightenIters: number;
    tightenStiffness: number;
    tightenRepel: number;
    onTightenChange: (iters: number, stiffness: number, repel: number) => void;

    // Rotation
    rx: number;
    ry: number;
    rz: number;
    onRotationChange: (rx: number, ry: number, rz: number) => void;

    // Rope thickness
    ropeThickness: number;
    onRopeThicknessChange: (thickness: number) => void;

    // Zoom
    zoom: number;
    onZoomChange: (zoom: number) => void;

    // Projection search
    bestCross: { count: number; rx: number; ry: number; rz: number } | null;
    currentCrossings: number;
    onSearchRotations: () => void;
    onJumpToBest: () => void;

    // Presets
    onLoadBHCounterexample: () => void;

    // Reset
    onResetView: () => void;
}

export default function Settings({
    knotA,
    knotB,
    onKnotAChange,
    onKnotBChange,
    mode,
    onModeChange,
    samples,
    onSamplesChange,
    sumFlipB,
    onSumFlipBChange,
    tightenIters,
    tightenStiffness,
    tightenRepel,
    onTightenChange,
    rx,
    ry,
    rz,
    onRotationChange,
    ropeThickness,
    onRopeThicknessChange,
    zoom,
    onZoomChange,
    bestCross,
    currentCrossings,
    onSearchRotations,
    onJumpToBest,
    onLoadBHCounterexample,
    onResetView,
}: SettingsProps) {
    const aU = torusUnknottingNumber(knotA.p, knotA.q);
    const bU = torusUnknottingNumber(knotB.p, knotB.q);
    const aC = torusCrossingNumber(knotA.p, knotA.q);
    const bC = torusCrossingNumber(knotB.p, knotB.q);
    const isBH = isBHCounterexample(knotA, knotB);

    return (
        <div className="space-y-6 text-sm">
            {/* Preset */}
            <div className="space-y-2">
                <h3 className="text-lime-400 font-semibold">Preset</h3>
                <Button
                    label="Load B&H counterexample"
                    onClick={onLoadBHCounterexample}
                    size="sm"
                    className="w-full"
                />
                {isBH && (
                    <div className="p-2 bg-lime-500/10 border border-lime-500/30 text-lime-400 text-xs">
                        <strong>B&H counterexample detected!</strong><br />
                        u(A)=3, u(B)=3, but u(A#B) ≤ 5 &lt; 6
                    </div>
                )}
            </div>

            {/* View Mode */}
            <div className="space-y-2">
                <h3 className="text-lime-400 font-semibold">View Mode</h3>
                <div className="flex gap-2">
                    {(['A', 'B', 'SUM'] as const).map((m) => (
                        <button
                            key={m}
                            onClick={() => onModeChange(m)}
                            className={`flex-1 py-2 px-3 text-xs border ${
                                mode === m
                                    ? 'bg-lime-500 text-black border-lime-500'
                                    : 'bg-black text-gray-300 border-lime-500/30 hover:border-lime-500/60'
                            }`}
                        >
                            {m === 'SUM' ? 'A # B' : `Show ${m}`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Knot A */}
            <div className="space-y-2">
                <h3 className="text-lime-400 font-semibold">Knot A: T(p,q)</h3>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs text-gray-400">p (longitude)</label>
                        <input
                            type="number"
                            value={knotA.p}
                            min={1}
                            max={12}
                            onChange={(e) => onKnotAChange({
                                ...knotA,
                                p: Math.max(1, Math.min(12, parseInt(e.target.value) || 1))
                            })}
                            className="w-full mt-1 px-2 py-1 bg-black border border-lime-500/30 text-white text-sm focus:border-lime-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400">q (meridian)</label>
                        <input
                            type="number"
                            value={knotA.q}
                            min={1}
                            max={35}
                            onChange={(e) => onKnotAChange({
                                ...knotA,
                                q: Math.max(1, Math.min(35, parseInt(e.target.value) || 1))
                            })}
                            className="w-full mt-1 px-2 py-1 bg-black border border-lime-500/30 text-white text-sm focus:border-lime-500 focus:outline-none"
                        />
                    </div>
                </div>
                <label className="flex items-center gap-2 text-gray-300">
                    <input
                        type="checkbox"
                        checked={knotA.mirror}
                        onChange={(e) => onKnotAChange({ ...knotA, mirror: e.target.checked })}
                        className="accent-lime-500"
                    />
                    Mirror (reflect)
                </label>
                <SliderInput
                    label="R (major radius)"
                    value={knotA.R}
                    onChange={(v) => onKnotAChange({ ...knotA, R: v })}
                    min={1.2}
                    max={3.4}
                    step={0.05}
                    showDecimals
                />
                <SliderInput
                    label="r (minor radius)"
                    value={knotA.r}
                    onChange={(v) => onKnotAChange({ ...knotA, r: v })}
                    min={0.25}
                    max={1.4}
                    step={0.05}
                    showDecimals
                />
                <div className="text-xs text-gray-400 space-y-1">
                    <div className="flex justify-between">
                        <span>coprime?</span>
                        <span className="text-gray-300 font-mono">
                            {gcd(knotA.p, knotA.q) === 1 ? 'yes (knot)' : `no (link, gcd=${gcd(knotA.p, knotA.q)})`}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>crossing number</span>
                        <span className="text-gray-300 font-mono">{aC ?? '—'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>unknotting number</span>
                        <span className="text-lime-400 font-mono">{aU ?? '—'}</span>
                    </div>
                </div>
            </div>

            {/* Knot B */}
            <div className="space-y-2">
                <h3 className="text-lime-400 font-semibold">Knot B: T(p,q)</h3>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs text-gray-400">p</label>
                        <input
                            type="number"
                            value={knotB.p}
                            min={1}
                            max={12}
                            onChange={(e) => onKnotBChange({
                                ...knotB,
                                p: Math.max(1, Math.min(12, parseInt(e.target.value) || 1))
                            })}
                            className="w-full mt-1 px-2 py-1 bg-black border border-lime-500/30 text-white text-sm focus:border-lime-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400">q</label>
                        <input
                            type="number"
                            value={knotB.q}
                            min={1}
                            max={35}
                            onChange={(e) => onKnotBChange({
                                ...knotB,
                                q: Math.max(1, Math.min(35, parseInt(e.target.value) || 1))
                            })}
                            className="w-full mt-1 px-2 py-1 bg-black border border-lime-500/30 text-white text-sm focus:border-lime-500 focus:outline-none"
                        />
                    </div>
                </div>
                <label className="flex items-center gap-2 text-gray-300">
                    <input
                        type="checkbox"
                        checked={knotB.mirror}
                        onChange={(e) => onKnotBChange({ ...knotB, mirror: e.target.checked })}
                        className="accent-lime-500"
                    />
                    Mirror (reflect)
                </label>
                <SliderInput
                    label="R (major radius)"
                    value={knotB.R}
                    onChange={(v) => onKnotBChange({ ...knotB, R: v })}
                    min={1.2}
                    max={3.4}
                    step={0.05}
                    showDecimals
                />
                <SliderInput
                    label="r (minor radius)"
                    value={knotB.r}
                    onChange={(v) => onKnotBChange({ ...knotB, r: v })}
                    min={0.25}
                    max={1.4}
                    step={0.05}
                    showDecimals
                />
                <div className="text-xs text-gray-400 space-y-1">
                    <div className="flex justify-between">
                        <span>coprime?</span>
                        <span className="text-gray-300 font-mono">
                            {gcd(knotB.p, knotB.q) === 1 ? 'yes (knot)' : `no (link, gcd=${gcd(knotB.p, knotB.q)})`}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>crossing number</span>
                        <span className="text-gray-300 font-mono">{bC ?? '—'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>unknotting number</span>
                        <span className="text-lime-400 font-mono">{bU ?? '—'}</span>
                    </div>
                </div>
            </div>

            {/* Connected Sum Options */}
            <div className="space-y-2">
                <h3 className="text-lime-400 font-semibold">Connected Sum</h3>
                <label className="flex items-center gap-2 text-gray-300">
                    <input
                        type="checkbox"
                        checked={sumFlipB}
                        onChange={(e) => onSumFlipBChange(e.target.checked)}
                        className="accent-lime-500"
                    />
                    Reverse B before summing
                </label>
            </div>

            {/* Geometry */}
            <div className="space-y-2">
                <h3 className="text-lime-400 font-semibold">Geometry</h3>
                <SliderInput
                    label="Samples"
                    value={samples}
                    onChange={onSamplesChange}
                    min={300}
                    max={2600}
                    step={50}
                />
            </div>

            {/* Tighten */}
            <div className="space-y-2">
                <h3 className="text-lime-400 font-semibold">Tighten (experimental)</h3>
                <p className="text-xs text-gray-500">Smoothing + repulsion; not topology-certified.</p>
                <SliderInput
                    label="Iterations"
                    value={tightenIters}
                    onChange={(v) => onTightenChange(v, tightenStiffness, tightenRepel)}
                    min={0}
                    max={80}
                    step={5}
                />
                <SliderInput
                    label="Stiffness"
                    value={tightenStiffness}
                    onChange={(v) => onTightenChange(tightenIters, v, tightenRepel)}
                    min={0.01}
                    max={0.2}
                    step={0.01}
                    showDecimals
                />
                <SliderInput
                    label="Repel"
                    value={tightenRepel}
                    onChange={(v) => onTightenChange(tightenIters, tightenStiffness, v)}
                    min={0.0005}
                    max={0.006}
                    step={0.0005}
                    showDecimals
                />
            </div>

            {/* Visualization */}
            <div className="space-y-2">
                <h3 className="text-lime-400 font-semibold">Visualization</h3>
                <SliderInput
                    label="Rope thickness"
                    value={ropeThickness}
                    onChange={onRopeThicknessChange}
                    min={2}
                    max={12}
                    step={1}
                />
                <SliderInput
                    label="Zoom"
                    value={zoom}
                    onChange={onZoomChange}
                    min={0.35}
                    max={10}
                    step={0.1}
                    showDecimals
                />
            </div>

            {/* Rotation */}
            <div className="space-y-2">
                <h3 className="text-lime-400 font-semibold">Rotation</h3>
                <SliderInput
                    label="X rotation"
                    value={rx}
                    onChange={(v) => onRotationChange(v, ry, rz)}
                    min={-Math.PI}
                    max={Math.PI}
                    step={0.01}
                    showDecimals
                />
                <SliderInput
                    label="Y rotation"
                    value={ry}
                    onChange={(v) => onRotationChange(rx, v, rz)}
                    min={-Math.PI}
                    max={Math.PI}
                    step={0.01}
                    showDecimals
                />
                <SliderInput
                    label="Z rotation"
                    value={rz}
                    onChange={(v) => onRotationChange(rx, ry, v)}
                    min={-Math.PI}
                    max={Math.PI}
                    step={0.01}
                    showDecimals
                />
                <Button
                    label="Reset view"
                    onClick={onResetView}
                    size="sm"
                    className="w-full"
                />
            </div>

            {/* Projection Search */}
            <div className="space-y-2">
                <h3 className="text-lime-400 font-semibold">Projection Search</h3>
                <p className="text-xs text-gray-500">
                    Current crossings: <span className="font-mono text-gray-300">{currentCrossings}</span>
                    {bestCross && (
                        <><br />Best found: <span className="font-mono text-lime-400">{bestCross.count}</span></>
                    )}
                </p>
                <div className="flex gap-2">
                    <Button
                        label="Search 200"
                        onClick={onSearchRotations}
                        size="xs"
                        className="flex-1"
                    />
                    <Button
                        label="Jump to best"
                        onClick={onJumpToBest}
                        size="xs"
                        className="flex-1"
                        disabled={!bestCross}
                    />
                </div>
            </div>
        </div>
    );
}
