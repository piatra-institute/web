import React from 'react';

interface SettingsProps {
    annualPremiums: number;
    setAnnualPremiums: (value: number) => void;
    underwritingMargin: number;
    setUnderwritingMargin: (value: number) => void;
    investmentReturn: number;
    setInvestmentReturn: (value: number) => void;
    simulationRunning: boolean;
    onStart: () => void;
    onReset: () => void;
}

const PRESETS = [
    { name: 'Conservative', premiums: 50, underwriting: 2, investment: 5 },
    { name: 'Buffett Model', premiums: 100, underwriting: 1, investment: 8 },
    { name: 'Aggressive', premiums: 200, underwriting: -1, investment: 12 },
    { name: 'High Risk', premiums: 300, underwriting: -2, investment: 15 },
];

export default function Settings({
    annualPremiums,
    setAnnualPremiums,
    underwritingMargin,
    setUnderwritingMargin,
    investmentReturn,
    setInvestmentReturn,
    simulationRunning,
    onStart,
    onReset,
}: SettingsProps) {
    const handlePresetSelect = (preset: typeof PRESETS[0]) => {
        setAnnualPremiums(preset.premiums);
        setUnderwritingMargin(preset.underwriting);
        setInvestmentReturn(preset.investment);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-white mb-4">Simulation Parameters</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            Annual Premiums: ${annualPremiums}M
                        </label>
                        <input
                            type="range"
                            min={10}
                            max={500}
                            value={annualPremiums}
                            onChange={(e) => setAnnualPremiums(Number(e.target.value))}
                            disabled={simulationRunning}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-lime-400"
                        />
                        <p className="text-xs text-white/60 mt-1">
                            Total premiums collected each year
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            Underwriting Margin: {underwritingMargin.toFixed(1)}%
                        </label>
                        <input
                            type="range"
                            min={-5}
                            max={5}
                            step={0.5}
                            value={underwritingMargin}
                            onChange={(e) => setUnderwritingMargin(Number(e.target.value))}
                            disabled={simulationRunning}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-lime-400"
                        />
                        <p className="text-xs text-white/60 mt-1">
                            Profit/loss from insurance operations
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            Investment Return: {investmentReturn.toFixed(1)}%
                        </label>
                        <input
                            type="range"
                            min={0}
                            max={20}
                            step={0.5}
                            value={investmentReturn}
                            onChange={(e) => setInvestmentReturn(Number(e.target.value))}
                            disabled={simulationRunning}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-lime-400"
                        />
                        <p className="text-xs text-white/60 mt-1">
                            Annual return on invested float
                        </p>
                    </div>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-medium text-white/80 mb-3">Presets</h4>
                <div className="grid grid-cols-2 gap-2">
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.name}
                            onClick={() => handlePresetSelect(preset)}
                            disabled={simulationRunning}
                            className="px-3 py-2 text-xs bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/30 text-white rounded transition-colors"
                        >
                            {preset.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={onStart}
                    disabled={simulationRunning}
                    className={`flex-1 py-2 px-4 rounded font-medium transition-colors ${
                        simulationRunning
                            ? 'bg-white/10 text-white/30 cursor-not-allowed'
                            : 'bg-lime-500 text-black hover:bg-lime-400'
                    }`}
                >
                    {simulationRunning ? 'Running...' : 'Start'}
                </button>
                <button
                    onClick={onReset}
                    className="flex-1 py-2 px-4 rounded font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                    Reset
                </button>
            </div>
        </div>
    );
}