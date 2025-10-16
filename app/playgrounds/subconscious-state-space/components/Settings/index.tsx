'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import SliderInput from '@/components/SliderInput';
import { SimulationParams } from '../../playground';

const DEFAULT_PARAMS: SimulationParams = {
    g_gaba: 0.6,
    g_nmda: 0.4,
    g_k2p: 0.4,
    thalamus: 0.25,
    couple: 0.15,
    noise: 0.02,
};

interface SettingsProps {
    onParamsChange: (params: SimulationParams) => void;
    onReset: () => void;
}

export default function Settings({ onParamsChange, onReset }: SettingsProps) {
    const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);

    const updateParam = (key: keyof SimulationParams, value: number) => {
        const newParams = { ...params, [key]: value };
        setParams(newParams);
        onParamsChange(newParams);
    };

    const handleReset = () => {
        setParams(DEFAULT_PARAMS);
        onParamsChange(DEFAULT_PARAMS);
        onReset();
    };

    return (
        <div className="space-y-6">
            {/* Molecular Parameters */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Molecular Parameters</h3>

                <div>
                    <SliderInput
                        label="GABA_A gain"
                        min={0}
                        max={2}
                        step={0.01}
                        value={params.g_gaba}
                        onChange={(value) => updateParam('g_gaba', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">↑ strengthens inhibition; suppresses ignition</div>
                </div>

                <div>
                    <SliderInput
                        label="NMDA conductance"
                        min={0}
                        max={1.5}
                        step={0.01}
                        value={params.g_nmda}
                        onChange={(value) => updateParam('g_nmda', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">↑ promotes persistence and local plateaus</div>
                </div>

                <div>
                    <SliderInput
                        label="K2P leak"
                        min={0}
                        max={2}
                        step={0.01}
                        value={params.g_k2p}
                        onChange={(value) => updateParam('g_k2p', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">↑ hyperpolarizes; lowers gain</div>
                </div>
            </div>

            {/* Network Parameters */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Network Parameters</h3>

                <div>
                    <SliderInput
                        label="Thalamic drive"
                        min={0}
                        max={1}
                        step={0.01}
                        value={params.thalamus}
                        onChange={(value) => updateParam('thalamus', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">Background drive into cortex</div>
                </div>

                <div>
                    <SliderInput
                        label="Long-range coupling"
                        min={0}
                        max={0.5}
                        step={0.01}
                        value={params.couple}
                        onChange={(value) => updateParam('couple', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">Coupling between cortical nodes</div>
                </div>

                <div>
                    <SliderInput
                        label="Noise"
                        min={0}
                        max={0.1}
                        step={0.001}
                        value={params.noise}
                        onChange={(value) => updateParam('noise', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">Background fluctuations (std)</div>
                </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
                <Button
                    label="Reset to defaults"
                    onClick={handleReset}
                    className="w-full"
                />
            </div>

            {/* Info */}
            <div className="text-xs text-gray-500 space-y-2">
                <p>
                    <strong>GABA_A:</strong> Potentiating GABA_A receptors (as anesthetics do) strengthens inhibition,
                    disrupting global ignition while preserving local dynamics.
                </p>
                <p>
                    <strong>K2P:</strong> Opening two-pore potassium channels (TREK-1) increases leak current,
                    hyperpolarizing neurons and reducing gain.
                </p>
                <p>
                    <strong>NMDA:</strong> NMDA receptors support persistent activity and local plateau potentials,
                    enabling longer integration windows.
                </p>
            </div>
        </div>
    );
}
