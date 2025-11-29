'use client';

import { useMemo, useState } from 'react';
import {
    SimulationParams,
    GRID_SIZE,
    generateLandscape,
    computeConcentration,
    computeGiniCoefficient,
} from '../../constants';

interface ViewerProps {
    params: SimulationParams;
}

type ViewMode = 'heatmap' | 'particles' | 'contour';

export default function Viewer({ params }: ViewerProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('heatmap');

    const landscape = useMemo(() => generateLandscape(params), [params]);
    const maxFitness = useMemo(
        () => Math.max(...landscape.map((p) => p.fitness)),
        [landscape]
    );
    const concentration = useMemo(() => computeConcentration(landscape), [landscape]);
    const gini = useMemo(() => computeGiniCoefficient(landscape), [landscape]);

    const fitnessToColor = (fitness: number) => {
        const intensity = fitness / maxFitness;
        const r = Math.floor(intensity * 132);
        const g = Math.floor(intensity * 204);
        const b = Math.floor(intensity * 22);
        return `rgb(${r},${g},${b})`;
    };

    const fitnessToGray = (fitness: number) => {
        const intensity = fitness / maxFitness;
        const shade = Math.floor(intensity * 255);
        return `rgb(${shade},${shade},${shade})`;
    };

    return (
        <div className="w-full h-full bg-black border border-lime-500/20 p-4 overflow-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Main Visualization */}
                <div className="bg-black border border-lime-500/20 lg:col-span-2">
                    <div className="p-3 border-b border-lime-500/20 flex justify-between items-center">
                        <div>
                            <h3 className="text-lime-400 font-semibold text-sm">Fitness Landscape</h3>
                            <p className="text-xs text-gray-400 mt-1">
                                Algorithm strategy space with fitness intensity
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('heatmap')}
                                className={`px-3 py-1 text-xs border ${
                                    viewMode === 'heatmap'
                                        ? 'border-lime-500 text-lime-400 bg-lime-500/10'
                                        : 'border-lime-500/30 text-gray-400'
                                }`}
                            >
                                Heatmap
                            </button>
                            <button
                                onClick={() => setViewMode('particles')}
                                className={`px-3 py-1 text-xs border ${
                                    viewMode === 'particles'
                                        ? 'border-lime-500 text-lime-400 bg-lime-500/10'
                                        : 'border-lime-500/30 text-gray-400'
                                }`}
                            >
                                Particles
                            </button>
                            <button
                                onClick={() => setViewMode('contour')}
                                className={`px-3 py-1 text-xs border ${
                                    viewMode === 'contour'
                                        ? 'border-lime-500 text-lime-400 bg-lime-500/10'
                                        : 'border-lime-500/30 text-gray-400'
                                }`}
                            >
                                Contour
                            </button>
                        </div>
                    </div>
                    <div className="p-4 flex justify-center">
                        <div className="w-full max-w-lg aspect-square bg-black border border-lime-500/20">
                            {viewMode === 'heatmap' && (
                                <svg
                                    viewBox={`0 0 ${GRID_SIZE} ${GRID_SIZE}`}
                                    className="w-full h-full"
                                    preserveAspectRatio="none"
                                >
                                    {landscape.map((p, idx) => (
                                        <rect
                                            key={idx}
                                            x={idx % GRID_SIZE}
                                            y={Math.floor(idx / GRID_SIZE)}
                                            width={1}
                                            height={1}
                                            fill={fitnessToColor(p.fitness)}
                                        />
                                    ))}
                                </svg>
                            )}
                            {viewMode === 'particles' && (
                                <div className="relative w-full h-full">
                                    {landscape.map((p, idx) => {
                                        const intensity = p.fitness / maxFitness;
                                        const size = 2 + intensity * 6;
                                        const left = ((p.x + 1) / 2) * 100;
                                        const top = (1 - (p.y + 1) / 2) * 100;
                                        return (
                                            <div
                                                key={idx}
                                                className="absolute rounded-full"
                                                style={{
                                                    left: `${left}%`,
                                                    top: `${top}%`,
                                                    width: size,
                                                    height: size,
                                                    backgroundColor: '#84cc16',
                                                    opacity: intensity * 0.9,
                                                    transform: 'translate(-50%, -50%)',
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                            {viewMode === 'contour' && (
                                <svg
                                    viewBox={`0 0 ${GRID_SIZE} ${GRID_SIZE}`}
                                    className="w-full h-full"
                                    preserveAspectRatio="none"
                                >
                                    {landscape.map((p, idx) => {
                                        const intensity = p.fitness / maxFitness;
                                        const level = Math.floor(intensity * 10) / 10;
                                        return (
                                            <rect
                                                key={idx}
                                                x={idx % GRID_SIZE}
                                                y={Math.floor(idx / GRID_SIZE)}
                                                width={1}
                                                height={1}
                                                fill={fitnessToGray(level * maxFitness)}
                                                stroke={level > 0.7 ? '#84cc16' : 'none'}
                                                strokeWidth={0.05}
                                            />
                                        );
                                    })}
                                </svg>
                            )}
                        </div>
                    </div>
                </div>

                {/* Concentration Chart */}
                <div className="bg-black border border-lime-500/20">
                    <div className="p-3 border-b border-lime-500/20">
                        <h3 className="text-lime-400 font-semibold text-sm">Concentration Index</h3>
                        <p className="text-xs text-gray-400 mt-1">
                            Top 5% fitness share as monodominance indicator
                        </p>
                    </div>
                    <div className="p-4">
                        <div className="h-24 flex items-end justify-center">
                            <div className="relative w-full h-full bg-gray-900">
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-lime-600 to-lime-400"
                                    style={{ height: `${concentration * 100}%` }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white drop-shadow-lg">
                                        {(concentration * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-2">
                            <span>0% (pluralistic)</span>
                            <span>100% (monodominant)</span>
                        </div>
                    </div>
                </div>

                {/* Gini Coefficient */}
                <div className="bg-black border border-lime-500/20">
                    <div className="p-3 border-b border-lime-500/20">
                        <h3 className="text-lime-400 font-semibold text-sm">Gini Coefficient</h3>
                        <p className="text-xs text-gray-400 mt-1">
                            Inequality measure across all strategies
                        </p>
                    </div>
                    <div className="p-4">
                        <div className="h-24 flex items-end justify-center">
                            <div className="relative w-full h-full bg-gray-900">
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-lime-600 to-lime-400"
                                    style={{ height: `${gini * 100}%` }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white drop-shadow-lg">
                                        {gini.toFixed(3)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-2">
                            <span>0 (equal)</span>
                            <span>1 (total concentration)</span>
                        </div>
                    </div>
                </div>

                {/* Parameter Summary */}
                <div className="bg-black border border-lime-500/20 lg:col-span-2">
                    <div className="p-3 border-b border-lime-500/20">
                        <h3 className="text-lime-400 font-semibold text-sm">Current Configuration</h3>
                    </div>
                    <div className="p-4 space-y-3">
                        {[
                            { key: 'convexity', label: 'Convexity of returns', max: 1 },
                            { key: 'separation', label: 'Niche separation', max: 1 },
                            { key: 'noiseFloor', label: 'Background slack', max: 0.1 },
                        ].map((item) => {
                            const value = params[item.key as keyof SimulationParams];
                            const percent = (value / item.max) * 100;
                            return (
                                <div key={item.key}>
                                    <div className="flex justify-between text-xs text-gray-300 mb-1">
                                        <span>{item.label}</span>
                                        <span className="font-mono text-lime-400">
                                            {value.toFixed(item.key === 'noiseFloor' ? 3 : 2)}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-900 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-lime-600 to-lime-400"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Interpretation */}
                <div className="bg-black border border-lime-500/20 lg:col-span-2">
                    <div className="p-4">
                        <h3 className="text-lime-400 font-semibold mb-2">Phase Interpretation</h3>
                        <p className="text-sm text-gray-300">
                            {concentration < 0.15 && (
                                <>
                                    <strong className="text-lime-400">Pluralistic ecology:</strong> The
                                    landscape supports multiple viable peaks. Many algorithmic strategies
                                    can coexist, each occupying a distinct niche. This is the
                                    &quot;maybe many can live&quot; regime.
                                </>
                            )}
                            {concentration >= 0.15 && concentration < 0.35 && (
                                <>
                                    <strong className="text-lime-400">Transitional regime:</strong> Fitness
                                    is beginning to concentrate. Some strategies are being squeezed out,
                                    but multiple peaks remain viable. The ecology is under stress but not
                                    yet collapsed.
                                </>
                            )}
                            {concentration >= 0.35 && concentration < 0.55 && (
                                <>
                                    <strong className="text-lime-400">Oligarchic regime:</strong> A small
                                    elite of strategies captures most fitness. The landscape has sharpened
                                    into a few dominant peaks, with marginal strategies surviving only as
                                    liquidity fodder.
                                </>
                            )}
                            {concentration >= 0.55 && (
                                <>
                                    <strong className="text-lime-400">Monodominant regime:</strong> A single
                                    algorithmic apex predator captures nearly all fitness. The system has
                                    cooled to its zero-temperature limit: &quot;only one can exist.&quot;
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
