'use client';

import React from 'react';
import Button from '@/components/Button';
import PlaygroundSettings from '@/components/PlaygroundSettings';
import SliderInput from '@/components/SliderInput';

interface ModelParams {
    alpha0: number;
    alpha1: number;
    alpha2: number;
    alpha3: number;
    alpha4: number;
    alpha5: number;
    eta: number;
    beta1: number;
    beta2: number;
    beta3: number;
    lambda: number;
    phi: number;
    psi: number;
}

interface SettingsProps {
    // Model parameters
    params: ModelParams;
    setParams: React.Dispatch<React.SetStateAction<ModelParams>>;
    
    // Simulation controls
    dt: number;
    setDt: (value: number) => void;
    speed: number;
    setSpeed: (value: number) => void;
    maxPoints: number;
    setMaxPoints: (value: number) => void;
    
    // Initial conditions
    initialU: number;
    setInitialU: (value: number) => void;
    initialT: number;
    setInitialT: (value: number) => void;
    initialV: number;
    setInitialV: (value: number) => void;
    
    // Exogenous drivers
    baseE: number;
    setBaseE: (value: number) => void;
    baseM: number;
    setBaseM: (value: number) => void;
    baseIT: number;
    setBaseIT: (value: number) => void;
    
    // Actions
    onReset: () => void;
    onApplyPreset: (preset: string) => void;
    onAddPulse: (driver: 'E' | 'M' | 'IT', amplitude: number, duration: number) => void;
    onClearPulses: (driver: 'E' | 'M' | 'IT') => void;
    onExport: () => void;
}

export default function Settings({
    params,
    setParams,
    dt,
    setDt,
    speed,
    setSpeed,
    maxPoints,
    setMaxPoints,
    initialU,
    setInitialU,
    initialT,
    setInitialT,
    initialV,
    setInitialV,
    baseE,
    setBaseE,
    baseM,
    setBaseM,
    baseIT,
    setBaseIT,
    onReset,
    onApplyPreset,
    onAddPulse,
    onClearPulses,
    onExport
}: SettingsProps) {
    return (
        <PlaygroundSettings
            sections={[
                {
                    title: 'Scenario Presets',
                    content: (
                        <div className="space-y-2">
                            <Button
                                label="Truth-Stabilizing"
                                onClick={() => onApplyPreset('stabilizing')}
                                size="sm"
                                className="w-full"
                            />
                            <Button
                                label="Repressive Spiral"
                                onClick={() => onApplyPreset('spiral')}
                                size="sm"
                                className="w-full"
                            />
                            <Button
                                label="Shock & Backfire"
                                onClick={() => onApplyPreset('shock')}
                                size="sm"
                                className="w-full"
                            />
                        </div>
                    )
                },
                {
                    title: 'Simulation Controls',
                    content: (
                        <div className="space-y-4">
                            <SliderInput
                                label="Time Step (Δt)"
                                value={dt}
                                onChange={setDt}
                                min={0.01}
                                max={0.2}
                                step={0.01}
                                showDecimals
                            />
                            <SliderInput
                                label="Speed (steps/s)"
                                value={speed}
                                onChange={setSpeed}
                                min={5}
                                max={120}
                                step={1}
                            />
                            <SliderInput
                                label="Max Points"
                                value={maxPoints}
                                onChange={setMaxPoints}
                                min={300}
                                max={5000}
                                step={50}
                            />
                        </div>
                    )
                },
                {
                    title: 'Initial Conditions',
                    content: (
                        <div className="space-y-4">
                            <SliderInput
                                label="u₀ (pressure)"
                                value={initialU}
                                onChange={setInitialU}
                                min={0}
                                max={2}
                                step={0.01}
                                showDecimals
                            />
                            <p className="text-xs text-gray-400 -mt-2">
                                Initial uncertainty/pressure level
                            </p>
                            
                            <SliderInput
                                label="t₀ (truth-seeking)"
                                value={initialT}
                                onChange={setInitialT}
                                min={0}
                                max={1}
                                step={0.01}
                                showDecimals
                            />
                            <p className="text-xs text-gray-400 -mt-2">
                                Initial truth-seeking share
                            </p>
                            
                            <SliderInput
                                label="v₀ (punitive support)"
                                value={initialV}
                                onChange={setInitialV}
                                min={0}
                                max={1}
                                step={0.01}
                                showDecimals
                            />
                            <p className="text-xs text-gray-400 -mt-2">
                                Initial support for punitive force
                            </p>
                        </div>
                    )
                },
                {
                    title: 'Exogenous Drivers',
                    content: (
                        <div className="space-y-6">
                            <div>
                                <SliderInput
                                    label="Elite Sanction (E)"
                                    value={baseE}
                                    onChange={setBaseE}
                                    min={0}
                                    max={2}
                                    step={0.01}
                                    showDecimals
                                />
                                <div className="flex gap-2 mt-2">
                                    <Button
                                        label="+ Pulse"
                                        onClick={() => onAddPulse('E', 0.5, 2)}
                                        size="xs"
                                    />
                                    <Button
                                        label="Clear"
                                        onClick={() => onClearPulses('E')}
                                        size="xs"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <SliderInput
                                    label="Misinformation (M)"
                                    value={baseM}
                                    onChange={setBaseM}
                                    min={0}
                                    max={2}
                                    step={0.01}
                                    showDecimals
                                />
                                <div className="flex gap-2 mt-2">
                                    <Button
                                        label="+ Pulse"
                                        onClick={() => onAddPulse('M', 0.6, 1.5)}
                                        size="xs"
                                    />
                                    <Button
                                        label="Clear"
                                        onClick={() => onClearPulses('M')}
                                        size="xs"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <SliderInput
                                    label="Truth Institutions (I<sub>T</sub>)"
                                    value={baseIT}
                                    onChange={setBaseIT}
                                    min={0}
                                    max={1.5}
                                    step={0.01}
                                    showDecimals
                                />
                                <div className="flex gap-2 mt-2">
                                    <Button
                                        label="+ Pulse"
                                        onClick={() => onAddPulse('IT', 0.3, 3)}
                                        size="xs"
                                    />
                                    <Button
                                        label="Clear"
                                        onClick={() => onClearPulses('IT')}
                                        size="xs"
                                    />
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: 'Pressure Dynamics (α)',
                    content: (
                        <div className="space-y-4">
                            <SliderInput
                                label="α₀ (baseline)"
                                value={params.alpha0}
                                onChange={(x) => setParams((p: ModelParams) => ({ ...p, alpha0: x }))}
                                min={0}
                                max={0.2}
                                step={0.005}
                                showDecimals
                            />
                            <SliderInput
                                label="α₁ (1-t → u)"
                                value={params.alpha1}
                                onChange={(x) => setParams((p: ModelParams) => ({ ...p, alpha1: x }))}
                                min={0}
                                max={1.2}
                                step={0.01}
                                showDecimals
                            />
                            <SliderInput
                                label="α₂ (M → u)"
                                value={params.alpha2}
                                onChange={(x) => setParams((p: ModelParams) => ({ ...p, alpha2: x }))}
                                min={0}
                                max={1.2}
                                step={0.01}
                                showDecimals
                            />
                            <SliderInput
                                label="α₃ (u decay)"
                                value={params.alpha3}
                                onChange={(x) => setParams((p: ModelParams) => ({ ...p, alpha3: x }))}
                                min={0}
                                max={1}
                                step={0.01}
                                showDecimals
                            />
                            <SliderInput
                                label="α₄ (venting)"
                                value={params.alpha4}
                                onChange={(x) => setParams((p: ModelParams) => ({ ...p, alpha4: x }))}
                                min={0}
                                max={1}
                                step={0.01}
                                showDecimals
                            />
                            <SliderInput
                                label="α₅ (backfire)"
                                value={params.alpha5}
                                onChange={(x) => setParams((p: ModelParams) => ({ ...p, alpha5: x }))}
                                min={0}
                                max={0.8}
                                step={0.01}
                                showDecimals
                            />
                        </div>
                    )
                },
                {
                    title: 'Truth-Seeking (β, η)',
                    content: (
                        <div className="space-y-4">
                            <SliderInput
                                label="η (baseline growth)"
                                value={params.eta}
                                onChange={(x) => setParams((p: ModelParams) => ({ ...p, eta: x }))}
                                min={-0.1}
                                max={0.2}
                                step={0.005}
                                showDecimals
                            />
                            <SliderInput
                                label="β₁ (I<sub>T</sub> → t)"
                                value={params.beta1}
                                onChange={(x) => setParams((p: ModelParams) => ({ ...p, beta1: x }))}
                                min={0}
                                max={1.2}
                                step={0.01}
                                showDecimals
                            />
                            <SliderInput
                                label="β₂ (u → -t)"
                                value={params.beta2}
                                onChange={(x) => setParams((p: ModelParams) => ({ ...p, beta2: x }))}
                                min={0}
                                max={1}
                                step={0.01}
                                showDecimals
                            />
                            <SliderInput
                                label="β₃ (v → -t)"
                                value={params.beta3}
                                onChange={(x) => setParams((p: ModelParams) => ({ ...p, beta3: x }))}
                                min={0}
                                max={1}
                                step={0.01}
                                showDecimals
                            />
                        </div>
                    )
                },
                {
                    title: 'Violence Support (λ, φ, ψ)',
                    content: (
                        <div className="space-y-4">
                            <SliderInput
                                label="λ (v decay)"
                                value={params.lambda}
                                onChange={(x) => setParams((p: ModelParams) => ({ ...p, lambda: x }))}
                                min={0}
                                max={1.2}
                                step={0.01}
                                showDecimals
                            />
                            <SliderInput
                                label="φ (u·(1-t) → v)"
                                value={params.phi}
                                onChange={(x) => setParams((p: ModelParams) => ({ ...p, phi: x }))}
                                min={0}
                                max={1.5}
                                step={0.01}
                                showDecimals
                            />
                            <SliderInput
                                label="ψ (E → v)"
                                value={params.psi}
                                onChange={(x) => setParams((p: ModelParams) => ({ ...p, psi: x }))}
                                min={0}
                                max={0.8}
                                step={0.01}
                                showDecimals
                            />
                        </div>
                    )
                },
                {
                    title: 'Actions',
                    content: (
                        <div className="space-y-2">
                            <Button
                                label="Reset All"
                                onClick={onReset}
                                size="sm"
                                className="w-full"
                            />
                            <Button
                                label="Export Data"
                                onClick={onExport}
                                size="sm"
                                className="w-full"
                            />
                        </div>
                    )
                }
            ]}
        />
    );
}