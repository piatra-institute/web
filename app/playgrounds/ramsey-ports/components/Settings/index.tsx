'use client';

import Button from '@/components/Button';
import SliderInput from '@/components/SliderInput';
import PlaygroundSettings from '@/components/PlaygroundSettings';
import { baseData } from '../../logic';



interface SettingsProps {
    selectedAirport: string;
    ramseyLambda: number;
    networkEffect: number;
    onAirportChange: (airport: string) => void;
    onRamseyLambdaChange: (value: number) => void;
    onNetworkEffectChange: (value: number) => void;
    onReset: () => void;
    onExport: () => void;
}

export default function Settings({
    selectedAirport,
    ramseyLambda,
    networkEffect,
    onAirportChange,
    onRamseyLambdaChange,
    onNetworkEffectChange,
    onReset,
    onExport,
}: SettingsProps) {
    return (
        <>
            <PlaygroundSettings
                sections={[
                    {
                        title: 'Airport Selection',
                        content: (
                            <>
                                <select
                                    value={selectedAirport}
                                    onChange={(e) => onAirportChange(e.target.value)}
                                    className="w-full bg-black text-white border border-gray-800 shadow-sm focus:ring-2 focus:ring-lime-800 focus:border-lime-800 p-2"
                                >
                                    {Object.keys(baseData).map((code) => (
                                        <option key={code} value={code}>
                                            {code}
                                        </option>
                                    ))}
                                </select>
                                <div className="mt-3 text-xs text-gray-400 bg-black/50 p-3 border border-gray-800">
                                    Select from major US airports analyzed in the Ivaldi, Sokullu, & Toru (2015) study.
                                </div>
                            </>
                        ),
                    },
                    {
                        title: 'Economic Parameters',
                        content: (
                            <>
                                <SliderInput
                                    label="Ramsey Welfare Weight (λ)"
                                    value={ramseyLambda}
                                    onChange={onRamseyLambdaChange}
                                    min={0.1}
                                    max={0.9}
                                    step={0.05}
                                    showDecimals={true}
                                />
                                <div className="text-xs text-gray-400 mt-1 mb-4">
                                    Higher λ = more weight on welfare vs. profit
                                </div>
                                <SliderInput
                                    label="Passenger Network Effect (%)"
                                    value={networkEffect}
                                    onChange={onNetworkEffectChange}
                                    min={-20}
                                    max={20}
                                    step={1}
                                />
                                <div className="text-xs text-gray-400 mt-1">
                                    Value passengers derive from additional flights
                                </div>
                            </>
                        ),
                    },
                    {
                        title: 'Actions',
                        content: (
                            <div className="space-y-3">
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
        </>
    );
}