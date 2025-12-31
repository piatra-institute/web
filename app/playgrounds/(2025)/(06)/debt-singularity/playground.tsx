'use client';

import { useState, useRef, useCallback } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Viewer from './components/Viewer';
import Settings from './components/Settings';
import { historicalScenarios } from './logic';



export default function Playground() {
    const [initialDebt, setInitialDebt] = useState(100000);
    const [annualPayment, setAnnualPayment] = useState(5000);
    const [interestRate, setInterestRate] = useState(5);
    const [inflationRate, setInflationRate] = useState(2);
    const [simulationYears, setSimulationYears] = useState(20);
    const [selectedScenario, setSelectedScenario] = useState('custom');

    const viewerRef = useRef<{ exportCanvas: () => void }>(null);

    const handleScenarioChange = useCallback((scenario: string) => {
        setSelectedScenario(scenario);
        if (scenario !== 'custom' && historicalScenarios[scenario]) {
            const { interest, inflation } = historicalScenarios[scenario];
            setInterestRate(interest);
            setInflationRate(inflation);
        }
    }, []);

    const handleReset = useCallback(() => {
        setInitialDebt(100000);
        setAnnualPayment(5000);
        setInterestRate(5);
        setInflationRate(2);
        setSimulationYears(20);
        setSelectedScenario('custom');
    }, []);

    const handleExport = useCallback(() => {
        viewerRef.current?.exportCanvas();
    }, []);

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
            content: (
                <div className="mt-12">
                    <p className="text-xl text-gray-300 mb-4">
                        A Visual Playground for Economic States
                    </p>
                    <p className="text-gray-400">
                        Explore how the relationship between interest rates and inflation creates different
                        economic &ldquo;phases&rdquo; for debt. Watch how your debt&apos;s real value evolves through time
                        under different economic conditions.
                    </p>
                </div>
            ),
        },
        {
            id: 'canvas',
            type: 'canvas' as const,
            content: (
                <PlaygroundViewer>
                    <Viewer
                        ref={viewerRef}
                        initialDebt={initialDebt}
                        annualPayment={annualPayment}
                        interestRate={interestRate}
                        inflationRate={inflationRate}
                        simulationYears={simulationYears}
                        onInterestRateChange={setInterestRate}
                        onInflationRateChange={setInflationRate}
                    />
                </PlaygroundViewer>
            ),
        },
        {
            id: 'about',
            type: 'outro' as const,
            content: (
                <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                    <p>
                        This model visualizes the economic &ldquo;phase&rdquo; of debt. The grid shows every combination
                        of Interest Rate and Inflation Rate. Move your cursor over the grid to explore its &ldquo;Real Rate&rdquo;.
                    </p>
                    <p>
                        <strong className="font-semibold text-lime-400">Green Zone (Asset Phase):</strong> Inflation
                        is higher than interest. The real value of debt decays over time, benefiting the debtor.
                    </p>
                    <p>
                        <strong className="font-semibold text-red-400">Red Zone (Liability Phase):</strong> Interest
                        is higher than inflation. The real burden of debt grows, costing the debtor.
                    </p>
                    <p>
                        The model includes <strong className="font-semibold text-white">Annual Payments</strong>,
                        simulating a real loan. The visualization shows how payments and inflation interact to reduce
                        the debt&apos;s value below the initial amount.
                    </p>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="Debt Singularity"
            subtitle="phase transitions of debt through economic conditions"
            sections={sections}
            settings={
                <Settings
                    initialDebt={initialDebt}
                    annualPayment={annualPayment}
                    interestRate={interestRate}
                    inflationRate={inflationRate}
                    simulationYears={simulationYears}
                    selectedScenario={selectedScenario}
                    onInitialDebtChange={setInitialDebt}
                    onAnnualPaymentChange={setAnnualPayment}
                    onInterestRateChange={setInterestRate}
                    onInflationRateChange={setInflationRate}
                    onSimulationYearsChange={setSimulationYears}
                    onScenarioChange={handleScenarioChange}
                    onReset={handleReset}
                    onExport={handleExport}
                />
            }
        />
    );
}
