'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    ComposedChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
    Brush,
} from 'recharts';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import PlaygroundSettings from '@/components/PlaygroundSettings';
import Button from '@/components/Button';
import Input from '@/components/Input';

interface SimulationMetrics {
    portfolioValue: number;
    totalGains: number;
    investableFloat: number;
    underwritingProfit: number;
    roi: number;
    cagr: number;
    totalPremiums: number;
    averageFloatUtilization: number;
}

interface ChartDataPoint {
    year: number;
    portfolioValue: number;
    investableFloat: number;
    underwritingProfit: number;
    annualGain: number;
    floatGrowth: number;
    underwritingMargin: number;
    investmentIncome: number;
    totalIncome: number;
}

const PRESETS = [
    { name: 'Conservative', premiums: 50, underwriting: 2, investment: 5 },
    { name: 'Buffett Model', premiums: 100, underwriting: 1, investment: 8 },
    { name: 'Aggressive Growth', premiums: 200, underwriting: -1, investment: 12 },
    { name: 'High Risk/Reward', premiums: 300, underwriting: -2, investment: 15 },
    { name: 'Zero Underwriting', premiums: 150, underwriting: 0, investment: 10 },
];

type ChartView = 'overview' | 'performance' | 'composition' | 'comparison';

export default function BerkshireEnginePlayground() {
    const [annualPremiums, setAnnualPremiums] = useState(100);
    const [underwritingMargin, setUnderwritingMargin] = useState(1);
    const [investmentReturn, setInvestmentReturn] = useState(8);
    const [currentYear, setCurrentYear] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [chartView, setChartView] = useState<ChartView>('overview');
    const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
    const [metrics, setMetrics] = useState<SimulationMetrics>({
        portfolioValue: 0,
        totalGains: 0,
        investableFloat: 0,
        underwritingProfit: 0,
        roi: 0,
        cagr: 0,
        totalPremiums: 0,
        averageFloatUtilization: 0,
    });
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const MAX_YEARS = 30;

    const formatCurrency = (value: number) => {
        if (Math.abs(value) >= 1e9) {
            return `$${(value / 1e9).toFixed(2)}B`;
        }
        if (Math.abs(value) >= 1e6) {
            return `$${(value / 1e6).toFixed(1)}M`;
        }
        if (Math.abs(value) >= 1e3) {
            return `$${(value / 1e3).toFixed(0)}K`;
        }
        return `$${value.toFixed(0)}`;
    };

    const formatPercent = (value: number) => `${value.toFixed(1)}%`;

    const resetSimulation = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        setCurrentYear(0);
        setIsRunning(false);
        setChartData([]);
        setMetrics({
            portfolioValue: 0,
            totalGains: 0,
            investableFloat: 0,
            underwritingProfit: 0,
            roi: 0,
            cagr: 0,
            totalPremiums: 0,
            averageFloatUtilization: 0,
        });
    }, []);

    const startSimulation = useCallback(() => {
        resetSimulation();
        setIsRunning(true);

        let year = 0;
        let portfolioValue = 0;
        let investableFloat = 0;
        let totalInvestmentGains = 0;
        let cumulativeUnderwritingProfit = 0;
        let previousPortfolioValue = 0;
        let totalFloatUtilization = 0;
        const dataPoints: ChartDataPoint[] = [];

        const interval = setInterval(() => {
            year++;
            if (year > MAX_YEARS) {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
                setIsRunning(false);

                // Calculate final metrics
                const totalPremiums = annualPremiums * MAX_YEARS;
                const roi = portfolioValue > 0 ? ((portfolioValue / totalPremiums) - 1) * 100 : 0;
                const cagr = totalPremiums > 0 ? (Math.pow((portfolioValue + totalPremiums) / totalPremiums, 1 / MAX_YEARS) - 1) * 100 : 0;
                const avgFloatUtil = totalFloatUtilization / MAX_YEARS;

                setMetrics({
                    portfolioValue: portfolioValue * 1e6,
                    totalGains: totalInvestmentGains * 1e6,
                    investableFloat: investableFloat * 1e6,
                    underwritingProfit: cumulativeUnderwritingProfit * 1e6,
                    roi,
                    cagr,
                    totalPremiums: totalPremiums * 1e6,
                    averageFloatUtilization: avgFloatUtil,
                });
                return;
            }

            // Annual calculations
            const previousFloat = investableFloat;
            investableFloat += annualPremiums;
            const underwritingProfit = annualPremiums * (underwritingMargin / 100);
            cumulativeUnderwritingProfit += underwritingProfit;
            const investmentGains = investableFloat * (investmentReturn / 100);
            totalInvestmentGains += investmentGains;
            portfolioValue += underwritingProfit + investmentGains;

            // Calculate annual metrics
            const annualGain = portfolioValue - previousPortfolioValue;
            const floatGrowth = ((investableFloat - previousFloat) / (previousFloat || 1)) * 100;
            const floatUtilization = portfolioValue > 0 ? (investableFloat / portfolioValue) * 100 : 0;
            totalFloatUtilization += floatUtilization;

            const dataPoint: ChartDataPoint = {
                year,
                portfolioValue,
                investableFloat,
                underwritingProfit: cumulativeUnderwritingProfit,
                annualGain,
                floatGrowth,
                underwritingMargin: underwritingProfit,
                investmentIncome: investmentGains,
                totalIncome: underwritingProfit + investmentGains,
            };

            dataPoints.push(dataPoint);
            setChartData([...dataPoints]);
            previousPortfolioValue = portfolioValue;

            setCurrentYear(year);
            setMetrics({
                portfolioValue: portfolioValue * 1e6,
                totalGains: totalInvestmentGains * 1e6,
                investableFloat: investableFloat * 1e6,
                underwritingProfit: cumulativeUnderwritingProfit * 1e6,
                roi: 0,
                cagr: 0,
                totalPremiums: annualPremiums * year * 1e6,
                averageFloatUtilization: floatUtilization,
            });
        }, 150); // Faster simulation

        intervalRef.current = interval;
    }, [annualPremiums, underwritingMargin, investmentReturn, resetSimulation]);

    const handlePresetSelect = useCallback((preset: typeof PRESETS[0]) => {
        setIsAnimating(true);
        const duration = 800;
        const startTime = Date.now();
        const startPremiums = annualPremiums;
        const startUnderwriting = underwritingMargin;
        const startInvestment = investmentReturn;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
            const easedProgress = easeOutCubic(progress);

            setAnnualPremiums(Math.round(startPremiums + (preset.premiums - startPremiums) * easedProgress));
            setUnderwritingMargin(Number((startUnderwriting + (preset.underwriting - startUnderwriting) * easedProgress).toFixed(1)));
            setInvestmentReturn(Number((startInvestment + (preset.investment - startInvestment) * easedProgress).toFixed(1)));

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setIsAnimating(false);
            }
        };

        requestAnimationFrame(animate);
    }, [annualPremiums, underwritingMargin, investmentReturn]);

    const exportData = useCallback(() => {
        const exportObj = {
            parameters: {
                annualPremiums,
                underwritingMargin,
                investmentReturn,
            },
            metrics,
            data: chartData,
            timestamp: new Date().toISOString(),
        };
        const dataStr = JSON.stringify(exportObj, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.download = `berkshire-engine-${Date.now()}.json`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }, [chartData, metrics, annualPremiums, underwritingMargin, investmentReturn]);

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-black/95 p-4 border border-white/20 rounded-lg shadow-xl">
                    <p className="text-sm font-bold text-white mb-2">Year {label}</p>
                    <div className="space-y-1 text-xs">
                        <p className="text-blue-400">
                            Portfolio: {formatCurrency(data.portfolioValue * 1e6)}
                        </p>
                        <p className="text-sky-400">
                            Float: {formatCurrency(data.investableFloat * 1e6)}
                        </p>
                        <p className="text-green-400">
                            Annual Gain: {formatCurrency(data.annualGain * 1e6)}
                        </p>
                        <p className="text-yellow-400">
                            Investment Income: {formatCurrency(data.investmentIncome * 1e6)}
                        </p>
                        <p className="text-purple-400">
                            Underwriting: {formatCurrency(data.underwritingMargin * 1e6)}
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderChart = () => {
        switch (chartView) {
            case 'overview':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.5} />
                            <XAxis
                                dataKey="year"
                                label={{ value: 'Year', position: 'insideBottom', offset: -10, fill: '#999' }}
                                stroke="#666"
                                tick={{ fill: '#999' }}
                            />
                            <YAxis
                                tickFormatter={(value) => formatCurrency(value * 1e6)}
                                stroke="#666"
                                tick={{ fill: '#999' }}
                                label={{ value: 'Value ($)', angle: -90, position: 'insideLeft', fill: '#999' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="line"
                                formatter={(value) => <span style={{ color: '#999' }}>{value}</span>}
                            />
                            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                            <Line
                                type="monotone"
                                dataKey="portfolioValue"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                name="Total Portfolio Value"
                                dot={false}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="investableFloat"
                                stroke="#0ea5e9"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                name="Investable Float"
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="underwritingProfit"
                                stroke="#22c55e"
                                strokeWidth={2}
                                name="Cumulative Underwriting"
                                dot={false}
                            />
                            <Brush
                                dataKey="year"
                                height={30}
                                stroke="#666"
                                fill="#111"
                                travellerWidth={10}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'performance':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.5} />
                            <XAxis
                                dataKey="year"
                                stroke="#666"
                                tick={{ fill: '#999' }}
                            />
                            <YAxis
                                yAxisId="left"
                                tickFormatter={(value) => formatCurrency(value * 1e6)}
                                stroke="#666"
                                tick={{ fill: '#999' }}
                                label={{ value: 'Annual Income ($)', angle: -90, position: 'insideLeft', fill: '#999' }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tickFormatter={(value) => `${value.toFixed(0)}%`}
                                stroke="#666"
                                tick={{ fill: '#999' }}
                                label={{ value: 'Growth Rate (%)', angle: 90, position: 'insideRight', fill: '#999' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar
                                yAxisId="left"
                                dataKey="investmentIncome"
                                fill="#3b82f6"
                                name="Investment Income"
                                opacity={0.8}
                            />
                            <Bar
                                yAxisId="left"
                                dataKey="underwritingMargin"
                                fill="#22c55e"
                                name="Underwriting Result"
                                opacity={0.8}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="floatGrowth"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                name="Float Growth %"
                                dot={{ fill: '#f59e0b', r: 3 }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                );

            case 'composition':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.5} />
                            <XAxis
                                dataKey="year"
                                stroke="#666"
                                tick={{ fill: '#999' }}
                            />
                            <YAxis
                                tickFormatter={(value) => formatCurrency(value * 1e6)}
                                stroke="#666"
                                tick={{ fill: '#999' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="underwritingProfit"
                                stackId="1"
                                stroke="#22c55e"
                                fill="#22c55e"
                                fillOpacity={0.6}
                                name="Underwriting Profit"
                            />
                            <Area
                                type="monotone"
                                dataKey="annualGain"
                                stackId="1"
                                stroke="#3b82f6"
                                fill="#3b82f6"
                                fillOpacity={0.6}
                                name="Investment Gains"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                );

            case 'comparison':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.5} />
                            <XAxis
                                dataKey="year"
                                stroke="#666"
                                tick={{ fill: '#999' }}
                            />
                            <YAxis
                                tickFormatter={(value) => formatCurrency(value * 1e6)}
                                stroke="#666"
                                tick={{ fill: '#999' }}
                                scale="log"
                                domain={[1, 'dataMax']}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="portfolioValue"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                name="With Float Model"
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey={(data) => data.year * annualPremiums * (1 + investmentReturn / 100) ** data.year / 100}
                                stroke="#ef4444"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                name="Without Float (Direct Investment)"
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );
        }
    };

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
        },
        {
            id: 'simulation',
            type: 'canvas' as const,
            content: (
                <PlaygroundViewer>
                    <div className="w-full h-full flex flex-col p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-white">Insurance Float Investment Engine</h2>
                            <div className="flex items-center gap-4">
                                <div className="flex gap-2">
                                    {(['overview', 'performance', 'composition', 'comparison'] as ChartView[]).map((view) => (
                                        <button
                                            key={view}
                                            onClick={() => setChartView(view)}
                                            className={`px-3 py-1 text-xs rounded transition-colors ${
                                                chartView === view
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                                            }`}
                                        >
                                            {view.charAt(0).toUpperCase() + view.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-medium text-white/60">Year</span>
                                    <p className="text-3xl font-bold text-blue-400">{currentYear}/{MAX_YEARS}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 w-full bg-black/50 rounded-lg p-4 mb-4" style={{ minHeight: '400px' }}>
                            {chartData.length === 0 ? (
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="mb-6">
                                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-600/20 mb-4">
                                                <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <p className="text-white/60 text-lg mb-2">No simulation data yet</p>
                                        <p className="text-white/40 text-sm mb-4">Configure parameters and click "Start" to begin</p>
                                        <div className="grid grid-cols-3 gap-4 text-left max-w-md mx-auto">
                                            <div className="bg-white/5 rounded p-3">
                                                <p className="text-white/40 text-xs mb-1">Premiums</p>
                                                <p className="text-white/80 font-medium">${annualPremiums}M/yr</p>
                                            </div>
                                            <div className="bg-white/5 rounded p-3">
                                                <p className="text-white/40 text-xs mb-1">Underwriting</p>
                                                <p className={`font-medium ${underwritingMargin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {underwritingMargin > 0 ? '+' : ''}{underwritingMargin}%
                                                </p>
                                            </div>
                                            <div className="bg-white/5 rounded p-3">
                                                <p className="text-white/40 text-xs mb-1">Investment</p>
                                                <p className="text-blue-400 font-medium">+{investmentReturn}%</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                renderChart()
                            )}
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-blue-600/20 to-blue-600/10 rounded-lg p-4 border border-blue-600/20">
                                <h3 className="text-xs font-medium text-white/60 uppercase tracking-wider">
                                    Portfolio Value
                                </h3>
                                <p className="text-2xl font-bold text-white mt-1">
                                    {formatCurrency(metrics.portfolioValue)}
                                </p>
                                {metrics.roi > 0 && (
                                    <p className="text-xs text-blue-400 mt-1">
                                        ROI: {metrics.roi.toFixed(1)}%
                                    </p>
                                )}
                            </div>
                            <div className="bg-gradient-to-br from-green-600/20 to-green-600/10 rounded-lg p-4 border border-green-600/20">
                                <h3 className="text-xs font-medium text-white/60 uppercase tracking-wider">
                                    Investment Gains
                                </h3>
                                <p className="text-2xl font-bold text-green-400 mt-1">
                                    {formatCurrency(metrics.totalGains)}
                                </p>
                                {currentYear > 0 && (
                                    <p className="text-xs text-green-400/80 mt-1">
                                        Avg/Year: {formatCurrency(metrics.totalGains / currentYear)}
                                    </p>
                                )}
                            </div>
                            <div className="bg-gradient-to-br from-sky-600/20 to-sky-600/10 rounded-lg p-4 border border-sky-600/20">
                                <h3 className="text-xs font-medium text-white/60 uppercase tracking-wider">
                                    Investable Float
                                </h3>
                                <p className="text-2xl font-bold text-sky-400 mt-1">
                                    {formatCurrency(metrics.investableFloat)}
                                </p>
                                {metrics.averageFloatUtilization > 0 && (
                                    <p className="text-xs text-sky-400/80 mt-1">
                                        Utilization: {metrics.averageFloatUtilization.toFixed(1)}%
                                    </p>
                                )}
                            </div>
                            <div className={`bg-gradient-to-br rounded-lg p-4 border ${
                                metrics.underwritingProfit >= 0
                                    ? 'from-emerald-600/20 to-emerald-600/10 border-emerald-600/20'
                                    : 'from-red-600/20 to-red-600/10 border-red-600/20'
                            }`}>
                                <h3 className="text-xs font-medium text-white/60 uppercase tracking-wider">
                                    Underwriting Total
                                </h3>
                                <p className={`text-2xl font-bold mt-1 ${
                                    metrics.underwritingProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                                }`}>
                                    {formatCurrency(metrics.underwritingProfit)}
                                </p>
                                {currentYear === MAX_YEARS && (
                                    <p className="text-xs text-white/60 mt-1">
                                        CAGR: {metrics.cagr.toFixed(1)}%
                                    </p>
                                )}
                            </div>
                        </div>

                        {showAdvancedMetrics && chartData.length > 0 && (
                            <div className="mt-4 p-4 bg-white/5 rounded-lg">
                                <h3 className="text-sm font-medium text-white mb-2">Advanced Metrics</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                    <div>
                                        <p className="text-white/60">Total Premiums Collected</p>
                                        <p className="text-white font-medium">{formatCurrency(metrics.totalPremiums)}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/60">Float Multiple</p>
                                        <p className="text-white font-medium">
                                            {metrics.totalPremiums > 0 ? (metrics.investableFloat / metrics.totalPremiums).toFixed(2) : '0'}x
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-white/60">Value per Premium Dollar</p>
                                        <p className="text-white font-medium">
                                            ${metrics.totalPremiums > 0 ? (metrics.portfolioValue / metrics.totalPremiums).toFixed(2) : '0'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-white/60">Compound Effect</p>
                                        <p className="text-white font-medium">
                                            {metrics.totalPremiums > 0 ? ((metrics.portfolioValue / metrics.totalPremiums) * 100).toFixed(0) : '0'}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </PlaygroundViewer>
            ),
        },
        {
            id: 'about',
            type: 'outro' as const,
            content: (
                <>
                    <p>
                        The Berkshire Engine demonstrates Warren Buffett&apos;s revolutionary approach to
                        insurance: using &ldquo;float&rdquo; — premiums collected before claims are paid — as
                        a permanent source of investment capital. This model transformed Berkshire
                        Hathaway from a failing textile company into one of the world&apos;s largest
                        corporations.
                    </p>
                    <p>
                        The simulation reveals how even small underwriting profits (or acceptable
                        losses) combined with skilled investment returns can compound into extraordinary
                        wealth over time. The key insight: float acts like an interest-free loan that
                        never needs to be repaid, provided the insurance operations remain sustainable.
                    </p>
                    <p>
                        Key concepts explored: insurance float dynamics, cost of capital, compound
                        returns, underwriting discipline, investment leverage without debt, and the
                        synergy between insurance operations and investment management. The model shows
                        why Buffett calls float "better than free" when combined with underwriting profits.
                    </p>
                </>
            ),
        },
    ];

    const settings = (
        <PlaygroundSettings
            sections={[
                {
                    title: 'Parameters',
                    content: (
                        <>
                            <Input
                                type="range"
                                min={10}
                                max={500}
                                value={annualPremiums}
                                onChange={(value) => setAnnualPremiums(Number(value))}
                                disabled={isRunning}
                                label={`Annual Premiums: $${annualPremiums}M`}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-4">
                                Total premiums collected each year
                            </p>

                            <Input
                                type="range"
                                min={-5}
                                max={5}
                                step={0.5}
                                value={underwritingMargin}
                                onChange={(value) => setUnderwritingMargin(Number(value))}
                                disabled={isRunning}
                                label={`Underwriting Margin: ${underwritingMargin.toFixed(1)}%`}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-4">
                                Profit/loss from insurance operations
                            </p>

                            <Input
                                type="range"
                                min={0}
                                max={20}
                                step={0.5}
                                value={investmentReturn}
                                onChange={(value) => setInvestmentReturn(Number(value))}
                                disabled={isRunning}
                                label={`Investment Return: ${investmentReturn.toFixed(1)}%`}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-4">
                                Annual return on invested float
                            </p>

                            <div className="flex gap-2">
                                <Button
                                    label={isRunning ? "Running..." : "Start"}
                                    onClick={startSimulation}
                                    disabled={isRunning}
                                    className="flex-1"
                                />
                                <Button
                                    label="Reset"
                                    onClick={resetSimulation}
                                    className="flex-1"
                                />
                            </div>

                            <div className="mt-4">
                                <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showAdvancedMetrics}
                                        onChange={(e) => setShowAdvancedMetrics(e.target.checked)}
                                        className="rounded border-gray-600 bg-black"
                                    />
                                    Show advanced metrics
                                </label>
                            </div>
                        </>
                    ),
                },
                {
                    title: 'Presets',
                    content: (
                        <div className="space-y-2">
                            {PRESETS.map((preset) => (
                                <button
                                    key={preset.name}
                                    onClick={() => handlePresetSelect(preset)}
                                    disabled={isAnimating || isRunning}
                                    className="w-full px-3 py-2 text-xs bg-black hover:bg-gray-900 disabled:bg-gray-900 disabled:text-gray-500 text-left text-gray-200 rounded border border-gray-600 transition-all duration-200 hover:border-gray-500"
                                    title={`Premiums: $${preset.premiums}M, Underwriting: ${preset.underwriting}%, Investment: ${preset.investment}%`}
                                >
                                    <div className="font-medium">{preset.name}</div>
                                    <div className="text-gray-400 mt-0.5">
                                        P: ${preset.premiums}M | U: {preset.underwriting}% | I: {preset.investment}%
                                    </div>
                                </button>
                            ))}
                        </div>
                    ),
                },
                {
                    title: 'Live Metrics',
                    content: (
                        <div className="space-y-3 text-xs">
                            <div>
                                <h4 className="font-medium text-gray-200 mb-1">Performance</h4>
                                <div className="space-y-1 text-gray-400">
                                    <div className="flex justify-between">
                                        <span>Portfolio Value:</span>
                                        <span className="text-white font-medium">{formatCurrency(metrics.portfolioValue)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Gains:</span>
                                        <span className="text-green-400 font-medium">{formatCurrency(metrics.totalGains)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Underwriting:</span>
                                        <span className={`font-medium ${metrics.underwritingProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                                            {formatCurrency(metrics.underwritingProfit)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-200 mb-1">Float Analysis</h4>
                                <div className="space-y-1 text-gray-400">
                                    <div className="flex justify-between">
                                        <span>Current Float:</span>
                                        <span className="text-sky-400 font-medium">{formatCurrency(metrics.investableFloat)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Float/Portfolio:</span>
                                        <span className="text-white font-medium">
                                            {metrics.portfolioValue > 0 ? ((metrics.investableFloat / metrics.portfolioValue) * 100).toFixed(1) : 0}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Premiums Total:</span>
                                        <span className="text-white font-medium">{formatCurrency(metrics.totalPremiums)}</span>
                                    </div>
                                </div>
                            </div>

                            {currentYear === MAX_YEARS && (
                                <div>
                                    <h4 className="font-medium text-gray-200 mb-1">Final Returns</h4>
                                    <div className="space-y-1 text-gray-400">
                                        <div className="flex justify-between">
                                            <span>Total ROI:</span>
                                            <span className="text-white font-medium">{metrics.roi.toFixed(1)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>CAGR:</span>
                                            <span className="text-white font-medium">{metrics.cagr.toFixed(1)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Value Multiple:</span>
                                            <span className="text-white font-medium">
                                                {metrics.totalPremiums > 0 ? (metrics.portfolioValue / metrics.totalPremiums).toFixed(1) : 0}x
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-2 space-y-2">
                                <Button
                                    label="Export Data"
                                    onClick={exportData}
                                    disabled={chartData.length === 0}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    ),
                },
                {
                    title: 'Chart Guide',
                    content: (
                        <div className="space-y-2 text-xs text-gray-400">
                            <div>
                                <p className="font-medium text-gray-200">Overview</p>
                                <p>Shows portfolio value, float, and underwriting profit over time</p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-200">Performance</p>
                                <p>Annual income breakdown and float growth rates</p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-200">Composition</p>
                                <p>Stacked view of value sources</p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-200">Comparison</p>
                                <p>Float model vs direct investment (log scale)</p>
                            </div>
                            <div className="pt-2">
                                <p className="font-medium text-gray-200">Tips</p>
                                <p>• Drag the brush to zoom</p>
                                <p>• Hover for detailed tooltips</p>
                                <p>• Try different chart views</p>
                                <p>• Compare presets</p>
                            </div>
                        </div>
                    ),
                },
            ]}
        />
    );

    return (
        <PlaygroundLayout
            title="berkshire engine"
            subtitle="Warren Buffett's insurance float investment model"
            sections={sections}
            settings={settings}
        />
    );
}
