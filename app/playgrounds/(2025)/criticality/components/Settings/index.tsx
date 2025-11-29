'use client';

import Button from '@/components/Button';
import SliderInput from '@/components/SliderInput';
import PlaygroundSettings from '@/components/PlaygroundSettings';
import { getRegime } from '../../logic';



interface SettingsProps {
    sigma: number;
    onSigmaChange: (value: number) => void;
    onReset: () => void;
    onExport: () => void;
    onRefresh: () => void;
}

export default function Settings({
    sigma,
    onSigmaChange,
    onReset,
    onExport,
    onRefresh,
}: SettingsProps) {
    const regime = getRegime(sigma);

    return (
        <PlaygroundSettings
            sections={[
                {
                    title: 'Branching Parameter',
                    content: (
                        <div>
                            <SliderInput
                                label={`σ = ${sigma.toFixed(2)} (${regime})`}
                                value={sigma}
                                onChange={onSigmaChange}
                                min={0.5}
                                max={1.5}
                                step={0.01}
                                showDecimals={false}
                            />
                            <div className="text-xs text-gray-400 mt-1">
                                Probability of activity branching to next time step
                            </div>
                            <div className="mt-4 text-xs text-gray-400 space-y-1">
                                <div>σ {'<'} 1: Sub-critical (activity dies out)</div>
                                <div>σ = 1: Critical (power-law avalanches)</div>
                                <div>σ {'>'} 1: Super-critical (runaway activity)</div>
                            </div>
                        </div>
                    ),
                },
                {
                    title: 'd² Distance Metric',
                    content: (
                        <div className="space-y-3 text-xs text-gray-400">
                            <div>
                                <div className="text-white font-semibold mb-1">What is d²?</div>
                                <div>
                                    Dimensionless scalar &ldquo;distance-to-criticality&rdquo; from temporal
                                    renormalization-group (tRG) analysis. d² = 0 at perfect criticality.
                                </div>
                            </div>
                            <div>
                                <div className="text-white font-semibold mb-1">Typical Values</div>
                                <div className="space-y-1">
                                    <div>• d² ≈ 0.00–0.05: Near-critical</div>
                                    <div>• d² ≈ 0.05–0.15: Mild deviation</div>
                                    <div>• d² {'>'} 0.20: Far from critical</div>
                                </div>
                            </div>
                            <div>
                                <div className="text-white font-semibold mb-1">Computation</div>
                                <div>d² = Σₛ [Λₛ − 1]² across timescales</div>
                            </div>
                        </div>
                    ),
                },
                {
                    title: 'Actions',
                    content: (
                        <div className="space-y-3">
                            <Button
                                label="Refresh Simulation"
                                onClick={onRefresh}
                                className="w-full"
                                size="sm"
                            />
                            <Button
                                label="Reset"
                                onClick={onReset}
                                className="w-full"
                                size="sm"
                            />
                            <Button
                                label="Export Chart"
                                onClick={onExport}
                                className="w-full"
                                size="sm"
                            />
                        </div>
                    ),
                },
            ]}
        />
    );
}
