'use client';

import { useState } from 'react';

import Button from '@/components/Button';
import Input from '@/components/Input';
import Toggle from '@/components/Toggle';
import SettingsContainer from '@/components/SettingsContainer';
import Tooltip from '@/components/Tooltip';

interface Props {
    // BirdSym parameters
    birdCount: number;
    setBirdCount: (value: number) => void;

    resourceMean: number;
    setResourceMean: (value: number) => void;

    resourceVariance: number;
    setResourceVariance: (value: number) => void;

    adaptationRate: number;
    setAdaptationRate: (value: number) => void;

    bifurcationParameter: number;
    setBifurcationParameter: (value: number) => void;

    // Bifurcation diagram parameters
    bifurcationStart: number;
    setBifurcationStart: (value: number) => void;

    bifurcationEnd: number;
    setBifurcationEnd: (value: number) => void;

    bifurcationSteps: number;
    setBifurcationSteps: (value: number) => void;

    // Simulation parameters
    iterations: number;
    setIterations: (value: number) => void;

    // Visualization mode
    visualizationMode: 'bifurcation' | 'timeseries';
    setVisualizationMode: (value: 'bifurcation' | 'timeseries') => void;

    // Actions
    reset: () => void;
    onExport?: () => void;
}

export default function Settings(props: Props) {
    const {
        birdCount, setBirdCount,
        resourceMean, setResourceMean,
        resourceVariance, setResourceVariance,
        adaptationRate, setAdaptationRate,
        bifurcationParameter, setBifurcationParameter,
        bifurcationStart, setBifurcationStart,
        bifurcationEnd, setBifurcationEnd,
        bifurcationSteps, setBifurcationSteps,
        iterations, setIterations,
        visualizationMode, setVisualizationMode,
        reset,
        onExport
    } = props;

    return (
        <SettingsContainer>
            <div>
                <div className="text-white text-sm font-medium mb-1">Visualization</div>
                <div className="flex gap-1 mb-2">
                    <Button
                        className={`flex-1 text-xs py-1 ${visualizationMode === 'bifurcation' ? 'bg-blue-500' : 'bg-gray-700'}`}
                        onClick={() => setVisualizationMode('bifurcation')}
                        label="Bifurcation"
                    />
                    <Button
                        className={`flex-1 text-xs py-1 ${visualizationMode === 'timeseries' ? 'bg-blue-500' : 'bg-gray-700'}`}
                        onClick={() => setVisualizationMode('timeseries')}
                        label="Time Series"
                    />
                </div>
            </div>

            <div>
                <div className="text-white text-sm font-medium mb-1">Population</div>
                <Tooltip content="Number of birds (PODs) in the simulation">
                    <Input
                        label="Bird Count (N)"
                        type="number"
                        value={birdCount}
                        onChange={e => setBirdCount(parseInt(e) || 10)}
                        min={2}
                        max={200}
                        step={1}
                        compact={true}
                    />
                </Tooltip>
            </div>

            <div>
                <div className="text-white text-sm font-medium mb-1">Resource Distribution</div>
                <Tooltip content="Mean of the resource distribution (a₁)">
                    <Input
                        label="Resource Mean (a₁)"
                        type="number"
                        value={resourceMean}
                        onChange={e => setResourceMean(parseFloat(e) || 0.5)}
                        min={0}
                        max={1}
                        step={0.01}
                        compact={true}
                    />
                </Tooltip>
                <Tooltip content="Variance of the resource distribution (σg²)">
                    <Input
                        label="Resource Variance (σg²)"
                        type="number"
                        value={resourceVariance}
                        onChange={e => setResourceVariance(parseFloat(e) || 0.01)}
                        min={0.001}
                        max={0.5}
                        step={0.001}
                        compact={true}
                    />
                </Tooltip>
            </div>

            <div>
                <div className="text-white text-sm font-medium mb-1">Adaptation</div>
                <Tooltip content="Rate at which birds adapt (C)">
                    <Input
                        label="Adaptation Rate (C)"
                        type="number"
                        value={adaptationRate}
                        onChange={e => setAdaptationRate(parseFloat(e) || 0.1)}
                        min={0.01}
                        max={10}
                        step={0.01}
                        compact={true}
                    />
                </Tooltip>
                <Tooltip content="Bifurcation parameter (λ)">
                    <Input
                        label="Bifurcation Parameter (λ)"
                        type="number"
                        value={bifurcationParameter}
                        onChange={e => setBifurcationParameter(parseFloat(e) || 1)}
                        min={0.1}
                        max={10}
                        step={0.1}
                        compact={true}
                        // disabled={visualizationMode === 'bifurcation'}
                    />
                </Tooltip>
            </div>

            {visualizationMode === 'bifurcation' && (
                <div>
                    <div className="text-white text-sm font-medium mb-1">Bifurcation Range</div>
                    <Input
                        label="Start Value"
                        type="number"
                        value={bifurcationStart}
                        onChange={e => setBifurcationStart(parseFloat(e) || 0.1)}
                        min={0.1}
                        max={bifurcationEnd - 0.1}
                        step={0.1}
                        compact={true}
                    />
                    <Input
                        label="End Value"
                        type="number"
                        value={bifurcationEnd}
                        onChange={e => setBifurcationEnd(parseFloat(e) || 10)}
                        min={bifurcationStart + 0.1}
                        max={20}
                        step={0.1}
                        compact={true}
                    />
                    <Input
                        label="Steps"
                        type="number"
                        value={bifurcationSteps}
                        onChange={e => setBifurcationSteps(parseInt(e) || 50)}
                        min={10}
                        max={200}
                        step={1}
                        compact={true}
                    />
                </div>
            )}

            <div>
                <div className="text-white text-sm font-medium mb-1">Simulation</div>
                <Input
                    label="Iterations"
                    type="number"
                    value={iterations}
                    onChange={e => setIterations(parseInt(e) || 1000)}
                    min={100}
                    max={10000}
                    step={100}
                    compact={true}
                />
            </div>

            <div className="mt-2 px-2 space-y-1">
                <Button className="w-full text-xs py-1" onClick={reset} label="Reset" />

                {onExport && (
                    <Button
                        className="w-full text-xs py-1 bg-green-600 hover:bg-green-700"
                        onClick={onExport}
                        label="Export PNG"
                    />
                )}
            </div>

            <div className="mt-2 px-2 text-xs text-white/60">
                <p className="text-[10px]">BirdSym model (Stewart, Elmhirst, Cohen 2000)</p>
            </div>
        </SettingsContainer>
    );
}