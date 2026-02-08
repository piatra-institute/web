'use client';

import React from 'react';
import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';
import Toggle from '@/components/Toggle';
import type { ClassicalParams, TQFTParams } from '../../logic';

interface SettingsProps {
    classical: ClassicalParams;
    onClassicalChange: (p: ClassicalParams) => void;
    tqft: TQFTParams;
    onTQFTChange: (p: TQFTParams) => void;
    isPlaying: boolean;
    onPlayPause: () => void;
    onReset: () => void;
    initialVelocity: number;
    onInitialVelocityChange: (v: number) => void;
}

export default function Settings({
    classical,
    onClassicalChange,
    tqft,
    onTQFTChange,
    isPlaying,
    onPlayPause,
    onReset,
    initialVelocity,
    onInitialVelocityChange,
}: SettingsProps) {
    return (
        <div className="space-y-6">
            {/* Classical Mechanics */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Classical Mechanics</h3>
                <SliderInput
                    label="gravity (m/s&sup2;)"
                    min={0.1}
                    max={20}
                    step={0.1}
                    value={classical.gravity}
                    onChange={(v) => onClassicalChange({ ...classical, gravity: v })}
                    showDecimals
                />
                <SliderInput
                    label="angle (&deg;)"
                    min={0}
                    max={60}
                    step={1}
                    value={classical.angle}
                    onChange={(v) => onClassicalChange({ ...classical, angle: v })}
                />
                <SliderInput
                    label="mass (kg)"
                    min={0.1}
                    max={10}
                    step={0.1}
                    value={classical.mass}
                    onChange={(v) => onClassicalChange({ ...classical, mass: v })}
                    showDecimals
                />
                <SliderInput
                    label="friction &mu;"
                    min={0}
                    max={0.5}
                    step={0.01}
                    value={classical.friction}
                    onChange={(v) => onClassicalChange({ ...classical, friction: v })}
                    showDecimals
                />
                <Toggle
                    text="uphill"
                    value={classical.direction === 'uphill'}
                    toggle={() =>
                        onClassicalChange({
                            ...classical,
                            direction: classical.direction === 'uphill' ? 'downhill' : 'uphill',
                        })
                    }
                />
                {classical.direction === 'uphill' && (
                    <SliderInput
                        label="initial velocity (m/s)"
                        min={1}
                        max={30}
                        step={0.5}
                        value={initialVelocity}
                        onChange={onInitialVelocityChange}
                        showDecimals
                    />
                )}
            </div>

            <div className="border-t border-lime-500/20" />

            {/* TQFT / Chern-Simons */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">TQFT / Chern-Simons</h3>
                <SliderInput
                    label="level k"
                    min={1}
                    max={24}
                    step={1}
                    value={tqft.level}
                    onChange={(v) => onTQFTChange({ ...tqft, level: v })}
                />
                <div className="text-xs text-lime-200/60">
                    special values: 1, 2, 3, 4, 5, 10, 24
                </div>
                <SliderInput
                    label="braids"
                    min={0}
                    max={20}
                    step={1}
                    value={tqft.braids}
                    onChange={(v) => onTQFTChange({ ...tqft, braids: v })}
                />
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Simulation */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Simulation</h3>
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        label={isPlaying ? 'Pause' : 'Play'}
                        onClick={onPlayPause}
                        size="sm"
                    />
                    <Button
                        label="Reset"
                        onClick={onReset}
                        size="sm"
                    />
                </div>
            </div>
        </div>
    );
}
