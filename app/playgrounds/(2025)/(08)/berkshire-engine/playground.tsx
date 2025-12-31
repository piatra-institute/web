'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Settings from './components/Settings';
import Viewer, { ViewerRef } from './components/Viewer';

export default function BerkshireEnginePlayground() {
    const [currentLevel, setCurrentLevel] = useState(1); // Always active
    const [simulationRunning, setSimulationRunning] = useState(false);
    const [currentYear, setCurrentYear] = useState(0);
    const [annualPremiums, setAnnualPremiums] = useState(100);
    const [underwritingMargin, setUnderwritingMargin] = useState(1);
    const [investmentReturn, setInvestmentReturn] = useState(8);
    const [portfolioValue, setPortfolioValue] = useState(0);
    const [totalGains, setTotalGains] = useState(0);
    const [investableFloat, setInvestableFloat] = useState(0);
    const [underwritingProfit, setUnderwritingProfit] = useState(0);
    const [chartData, setChartData] = useState<Array<{
        year: number;
        portfolioValue: number;
        investableFloat: number;
        underwritingProfit: number;
    }>>([]);

    const viewerRef = useRef<ViewerRef>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const MAX_YEARS = 30;

    const handleStartReset = useCallback(() => {
        if (simulationRunning) {
            // Reset
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            setSimulationRunning(false);
            setCurrentYear(0);
            setPortfolioValue(0);
            setTotalGains(0);
            setInvestableFloat(0);
            setUnderwritingProfit(0);
            setChartData([]);
        } else {
            // Start
            setSimulationRunning(true);
            setCurrentYear(0);
            setChartData([]);

            let year = 0;
            let portfolio = 0;
            let float = 0;
            let totalInvestmentGains = 0;
            let cumulativeUnderwriting = 0;
            const dataPoints: typeof chartData = [];

            const interval = setInterval(() => {
                year++;
                if (year > MAX_YEARS) {
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                    }
                    setSimulationRunning(false);
                    return;
                }

                // Annual calculations
                float += annualPremiums;
                const annualUnderwriting = annualPremiums * (underwritingMargin / 100);
                cumulativeUnderwriting += annualUnderwriting;
                const annualInvestmentGains = float * (investmentReturn / 100);
                totalInvestmentGains += annualInvestmentGains;
                portfolio += annualUnderwriting + annualInvestmentGains;

                const dataPoint = {
                    year,
                    portfolioValue: portfolio,
                    investableFloat: float,
                    underwritingProfit: cumulativeUnderwriting,
                };

                dataPoints.push(dataPoint);
                setChartData([...dataPoints]);

                setCurrentYear(year);
                setPortfolioValue(portfolio * 1e6);
                setTotalGains(totalInvestmentGains * 1e6);
                setInvestableFloat(float * 1e6);
                setUnderwritingProfit(cumulativeUnderwriting * 1e6);
            }, 150); // Fast animation

            intervalRef.current = interval;
        }
    }, [simulationRunning, annualPremiums, underwritingMargin, investmentReturn]);

    const handleExport = useCallback(() => {
        viewerRef.current?.exportCanvas();
    }, []);

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
            content: (
                <p className="text-white/80">
                    The Berkshire Engine demonstrates Warren Buffett&apos;s revolutionary approach to
                    insurance: using &ldquo;float&rdquo; — premiums collected before claims are paid — as
                    a permanent source of investment capital. Watch how even modest underwriting profits
                    combined with investment returns compound into extraordinary wealth over 30 years.
                </p>
            ),
        },
        {
            id: 'simulation',
            type: 'canvas' as const,
            content: (
                <PlaygroundViewer>
                    <Viewer
                        ref={viewerRef}
                        currentYear={currentYear}
                        maxYears={MAX_YEARS}
                        portfolioValue={portfolioValue}
                        totalGains={totalGains}
                        investableFloat={investableFloat}
                        underwritingProfit={underwritingProfit}
                        chartData={chartData}
                    />
                </PlaygroundViewer>
            ),
        },
        {
            id: 'outro',
            type: 'outro' as const,
            content: (
                <>
                    <p>
                        The insurance float model leverages the temporal mismatch between premium collection 
                        and claim payments. This creates a persistent pool of investable capital with 
                        negative cost of carry when underwriting operations achieve profitability. The 
                        economic dynamics resemble leveraged investing without traditional debt obligations.
                    </p>
                    <p>
                        The visualization tracks three metrics: cumulative portfolio value, investable float 
                        magnitude, and aggregate underwriting performance. The model demonstrates how even 
                        marginal underwriting margins (0-2%) generate substantial value through the 
                        compounding of float-derived investment returns over extended time horizons.
                    </p>
                    <p>
                        Key parameters: float growth rate equals annual premium volume; investment returns 
                        compound on the entire float balance; underwriting margin directly impacts cost of 
                        capital. The model assumes stable premium flow and consistent investment returns, 
                        abstracting from insurance cycle volatility and market fluctuations.
                    </p>
                </>
            ),
        },
    ];

    const settings = (
        <Settings
            annualPremiums={annualPremiums}
            setAnnualPremiums={setAnnualPremiums}
            underwritingMargin={underwritingMargin}
            setUnderwritingMargin={setUnderwritingMargin}
            investmentReturn={investmentReturn}
            setInvestmentReturn={setInvestmentReturn}
            simulationRunning={simulationRunning}
            onStart={handleStartReset}
            onReset={handleStartReset}
        />
    );

    return (
        <PlaygroundLayout
            title="berkshire engine"
            subtitle="insurance float as investment capital"
            sections={sections}
            settings={settings}
        />
    );
}