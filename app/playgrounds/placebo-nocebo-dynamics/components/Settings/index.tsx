'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import SliderInput from '@/components/SliderInput';
import { SimulationParams } from '../../playground';

const DEFAULT_PARAMS: SimulationParams = {
    priorPrecision: 2.0,
    sensoryPrecision: 1.5,
    attention: 0.0,
    rOpioid: 1.0,
    rCB1: 0.8,
    rCCK: 0.8,
    conditioning: 0.7,
    naloxone: 0.0,
    rimonabant: 0.0,
    proglumide: 0.0,
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

    const priorWeight = params.priorPrecision / (params.priorPrecision + params.sensoryPrecision * (1 + params.attention));

    return (
        <div className="space-y-6">
            {/* Precision & Attention */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Precision & Attention</h3>

                <div>
                    <SliderInput
                        label="Prior precision (Π_p)"
                        min={0.1}
                        max={5}
                        step={0.1}
                        value={params.priorPrecision}
                        onChange={(value) => updateParam('priorPrecision', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">Confidence in top-down predictions</div>
                </div>

                <div>
                    <SliderInput
                        label="Sensory precision (Π_y)"
                        min={0.1}
                        max={5}
                        step={0.1}
                        value={params.sensoryPrecision}
                        onChange={(value) => updateParam('sensoryPrecision', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">Reliability of nociceptive input</div>
                </div>

                <div>
                    <SliderInput
                        label="Attention boost"
                        min={0}
                        max={2}
                        step={0.05}
                        value={params.attention}
                        onChange={(value) => updateParam('attention', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">Multiplicative increase to sensory precision</div>
                </div>

                <div className="text-xs text-lime-400 bg-black border border-lime-500/20 p-3">
                    Prior weight w = {priorWeight.toFixed(3)}
                </div>
            </div>

            {/* Pathway Strengths */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Pathway Strengths</h3>

                <div>
                    <SliderInput
                        label="μ-opioid pathway (r_μ)"
                        min={0}
                        max={2}
                        step={0.05}
                        value={params.rOpioid}
                        onChange={(value) => updateParam('rOpioid', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">Endogenous opioid analgesia strength</div>
                </div>

                <div>
                    <SliderInput
                        label="CB1 pathway (r_CB1)"
                        min={0}
                        max={2}
                        step={0.05}
                        value={params.rCB1}
                        onChange={(value) => updateParam('rCB1', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">Cannabinoid analgesia strength</div>
                </div>

                <div>
                    <SliderInput
                        label="CCK pathway (r_CCK)"
                        min={0}
                        max={2}
                        step={0.05}
                        value={params.rCCK}
                        onChange={(value) => updateParam('rCCK', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">Nocebo hyperalgesia strength</div>
                </div>

                <div>
                    <SliderInput
                        label="Conditioning (CB1 gate)"
                        min={0}
                        max={1}
                        step={0.05}
                        value={params.conditioning}
                        onChange={(value) => updateParam('conditioning', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">Learning-dependent CB1 modulation</div>
                </div>
            </div>

            {/* Pharmacological Blockers */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Pharmacological Blockers</h3>

                <div>
                    <SliderInput
                        label="Naloxone (μ-opioid block)"
                        min={0}
                        max={1}
                        step={0.05}
                        value={params.naloxone}
                        onChange={(value) => updateParam('naloxone', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">Fraction of μ-opioid pathway blocked</div>
                </div>

                <div>
                    <SliderInput
                        label="Rimonabant (CB1 block)"
                        min={0}
                        max={1}
                        step={0.05}
                        value={params.rimonabant}
                        onChange={(value) => updateParam('rimonabant', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">Fraction of CB1 pathway blocked</div>
                </div>

                <div>
                    <SliderInput
                        label="Proglumide (CCK block)"
                        min={0}
                        max={1}
                        step={0.05}
                        value={params.proglumide}
                        onChange={(value) => updateParam('proglumide', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">Fraction of nocebo pathway blocked</div>
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
                    <strong>Cue-drug similarity:</strong> -1 indicates strong nocebo-like contextual cues;
                    +1 indicates strong drug-like contextual cues; 0 is neutral context.
                </p>
                <p>
                    <strong>Net effect:</strong> Positive values represent analgesia (pain reduction);
                    negative values represent hyperalgesia (pain increase).
                </p>
                <p>
                    <strong>Blockers at 1.0:</strong> Simulate complete antagonism of the respective pathway,
                    enabling pharmacological dissection of mechanisms.
                </p>
            </div>
        </div>
    );
}
