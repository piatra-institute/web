'use client';

import { useCallback } from 'react';
import Input from '@/components/Input';
import Button from '@/components/Button';
import SliderInput from '@/components/SliderInput';
import PlaygroundSettings from '@/components/PlaygroundSettings';
import { historicalScenarios } from '../../logic';



interface SettingsProps {
    initialDebt: number;
    annualPayment: number;
    interestRate: number;
    inflationRate: number;
    simulationYears: number;
    selectedScenario: string;
    onInitialDebtChange: (value: number) => void;
    onAnnualPaymentChange: (value: number) => void;
    onInterestRateChange: (value: number) => void;
    onInflationRateChange: (value: number) => void;
    onSimulationYearsChange: (value: number) => void;
    onScenarioChange: (scenario: string) => void;
    onReset: () => void;
    onExport: () => void;
}

export default function Settings({
    initialDebt,
    annualPayment,
    interestRate,
    inflationRate,
    simulationYears,
    selectedScenario,
    onInitialDebtChange,
    onAnnualPaymentChange,
    onInterestRateChange,
    onInflationRateChange,
    onSimulationYearsChange,
    onScenarioChange,
    onReset,
    onExport,
}: SettingsProps) {
    const handleDebtChange = useCallback((value: string) => {
        const numValue = parseFloat(value.replace(/,/g, '')) || 0;
        onInitialDebtChange(numValue);
    }, [onInitialDebtChange]);

    const handlePaymentChange = useCallback((value: string) => {
        const numValue = parseFloat(value.replace(/,/g, '')) || 0;
        onAnnualPaymentChange(numValue);
    }, [onAnnualPaymentChange]);

    const formatCurrency = (value: number) => {
        return value.toLocaleString('en-US');
    };

    return (
        <>
            <PlaygroundSettings
                sections={[
                    {
                        title: 'Historical Scenarios',
                        content: (
                            <>
                                <select
                                    value={selectedScenario}
                                    onChange={(e) => onScenarioChange(e.target.value)}
                                    className="w-full bg-black text-white border border-gray-800 shadow-sm focus:ring-2 focus:ring-lime-800 focus:border-lime-800 p-2"
                                >
                                    <option value="custom">Custom</option>
                                    <option value="postWw2">USA: Post-WWII (1947)</option>
                                    <option value="greatInflation">USA: The Great Inflation (1979)</option>
                                    <option value="japanLostDecade">Japan: Lost Decade (1995)</option>
                                    <option value="weimar">Germany: Weimar Hyperinflation (1923)</option>
                                    <option value="zirp">USA: ZIRP Era (2015)</option>
                                    <option value="recentInflation">USA: Recent Inflation (2022)</option>
                                </select>
                                <div className="mt-3 text-xs text-gray-400 bg-black/50 p-3 border border-gray-800 min-h-[60px]">
                                    {historicalScenarios[selectedScenario]?.description || 'Select a scenario to see its description and parameters.'}
                                </div>
                            </>
                        ),
                    },
                    {
                        title: 'Debt Parameters',
                        content: (
                            <>
                                <Input
                                    type="text"
                                    label="Initial Debt Amount ($)"
                                    value={formatCurrency(initialDebt)}
                                    onChange={handleDebtChange}
                                    className="w-full"
                                    compact={true}
                                />
                                <Input
                                    type="text"
                                    label="Annual Debt Payment ($)"
                                    value={formatCurrency(annualPayment)}
                                    onChange={handlePaymentChange}
                                    className="w-full"
                                    compact={true}
                                />
                            </>
                        ),
                    },
                    {
                        title: 'Economic Conditions',
                        content: (
                            <>
                                <SliderInput
                                    label="Nominal Interest Rate (%)"
                                    value={interestRate}
                                    onChange={onInterestRateChange}
                                    min={0}
                                    max={25}
                                    step={0.5}
                                    showDecimals={true}
                                />
                                <SliderInput
                                    label="Annual Inflation Rate (%)"
                                    value={inflationRate}
                                    onChange={onInflationRateChange}
                                    min={0}
                                    max={50}
                                    step={0.5}
                                    showDecimals={true}
                                />
                                <SliderInput
                                    label="Simulation Period (Years)"
                                    value={simulationYears}
                                    onChange={onSimulationYearsChange}
                                    min={5}
                                    max={50}
                                    step={1}
                                />
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
                                    label="Export Diagram"
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
