'use client';

import { useState, useRef, useCallback } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import VersionSelector from '@/components/VersionSelector';
import CalibrationPanel from '@/components/CalibrationPanel';
import AssumptionPanel from '@/components/AssumptionPanel';
import ModelChangelog from '@/components/ModelChangelog';
import Viewer from './components/Viewer';
import Settings from './components/Settings';
import { historicalScenarios } from './logic';
import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';



export default function Playground() {
    const [initialDebt, setInitialDebt] = useState(100000);
    const [annualPayment, setAnnualPayment] = useState(5000);
    const [interestRate, setInterestRate] = useState(5);
    const [inflationRate, setInflationRate] = useState(2);
    const [simulationYears, setSimulationYears] = useState(20);
    const [selectedScenario, setSelectedScenario] = useState('custom');

    const viewerRef = useRef<{ exportCanvas: () => void }>(null);

    const calibration = buildCalibration();

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
                <div className="space-y-8 text-gray-300">
                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The phase of a debt</h3>
                        <p className="leading-relaxed text-sm">
                            This model visualizes the economic &ldquo;phase&rdquo; of debt. The grid shows every combination
                            of interest rate and inflation rate. Move your cursor over the grid to explore its real rate,
                            the order parameter that decides whether the debt grows or decays in felt terms.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <p className="text-lime-200/80 mb-2">
                            <strong className="font-semibold text-lime-400">Green zone (asset phase):</strong> inflation
                            is higher than interest. The real value of debt decays over time, benefiting the debtor.
                        </p>
                        <p className="text-lime-200/80">
                            <strong className="font-semibold text-red-400">Red zone (liability phase):</strong> interest
                            is higher than inflation. The real burden of debt grows, costing the debtor.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The model</h3>
                        <p className="leading-relaxed text-sm">
                            The nominal balance follows an affine annual map, B(t+1) = (1 + r) B(t) - P, and its real
                            value is that balance deflated by cumulative inflation. The diagonal r = i is a continuous
                            phase boundary: nothing diverges there, but the long-run direction of the real balance flips
                            sign. Annual payments simulate a real loan, with the fixed point P/r marking the balance that
                            interest exactly services.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <VersionSelector versions={versions} active="claude-v1" />
                        <CalibrationPanel results={calibration} outputLabel="loop vs closed form" />
                        <AssumptionPanel assumptions={assumptions} />
                        <ModelChangelog entries={changelog} />
                    </div>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="Debt Singularity"
            subtitle="phase transitions of debt through economic conditions"
            researchUrl="/playgrounds/debt-singularity/research"
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
