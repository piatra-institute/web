'use client';

import { Dispatch, SetStateAction } from 'react';
import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';
import Toggle from '@/components/Toggle';

interface SettingsProps {
    technology: number;
    setTechnology: Dispatch<SetStateAction<number>>;
    users: number;
    setUsers: Dispatch<SetStateAction<number>>;
    techEfficacy: number;
    setTechEfficacy: Dispatch<SetStateAction<number>>;
    friction: number;
    setFriction: Dispatch<SetStateAction<number>>;
    corruption: number;
    setCorruption: Dispatch<SetStateAction<number>>;
    attentionEnabled: boolean;
    setAttentionEnabled: Dispatch<SetStateAction<boolean>>;
    attention: number;
    setAttention: Dispatch<SetStateAction<number>>;
    onReset: () => void;
    onExport: () => void;
}

export default function Settings({
    technology,
    setTechnology,
    users,
    setUsers,
    techEfficacy,
    setTechEfficacy,
    friction,
    setFriction,
    corruption,
    setCorruption,
    attentionEnabled,
    setAttentionEnabled,
    attention,
    setAttention,
    onReset,
    onExport,
}: SettingsProps) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lime-500 font-bold mb-4">Economic Model Controls</h3>
                <p className="text-xs text-gray-400 mb-4">
                    Adjust parameters to see how technology shapes scarcity.
                </p>
            </div>

            <div className="space-y-4">
                <SliderInput
                    label="Technology Level (T)"
                    value={technology}
                    onChange={setTechnology}
                    min={1}
                    max={100}
                    step={1}
                />

                <SliderInput
                    label="Number of Users (N)"
                    value={users}
                    onChange={setUsers}
                    min={0}
                    max={10000000000}
                    step={100000}
                />

                <SliderInput
                    label="Tech Efficacy (k)"
                    value={techEfficacy}
                    onChange={setTechEfficacy}
                    min={0.1}
                    max={3}
                    step={0.1}
                    showDecimals={true}
                />

                <SliderInput
                    label="Institutional Friction (f)"
                    value={friction}
                    onChange={setFriction}
                    min={0}
                    max={0.9}
                    step={0.01}
                    showDecimals={true}
                />

                <SliderInput
                    label="Corruption / Hoarding (h)"
                    value={corruption}
                    onChange={setCorruption}
                    min={0}
                    max={0.8}
                    step={0.01}
                    showDecimals={true}
                />

                <div className="pt-4 border-t border-gray-700">
                    <Toggle
                        text="Enable Attention Constraint"
                        value={attentionEnabled}
                        toggle={() => setAttentionEnabled(!attentionEnabled)}
                        tooltip="Models resources like time or cognitive bandwidth that technology cannot multiply"
                    />

                    {attentionEnabled && (
                        <SliderInput
                            label="Attention Capacity (A)"
                            value={attention}
                            onChange={setAttention}
                            min={1}
                            max={100000000000}
                            step={10000000}
                        />
                    )}
                </div>
            </div>

            <div className="flex space-x-2 pt-4 border-t border-gray-700">
                <Button
                    label="Reset"
                    onClick={onReset}
                    size="sm"
                    className="flex-1"
                />
                <Button
                    label="Export"
                    onClick={onExport}
                    size="sm"
                    className="flex-1 bg-lime-500 hover:bg-lime-400"
                />
            </div>
        </div>
    );
}