import { useMemo, useState } from 'react';

import SettingsContainer from '@/components/SettingsContainer';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Legend from '../Legend';
import StatsDisplay from '../StatsDisplay';
import LogDisplay from '../LogDisplay';
import ChartsDisplay from '../ChartsDisplay';
import { SimulationStats, LogEntryData, ChartDataPoint } from '../../lib/agent';



interface SettingsProps {
    numAgents: number; setNumAgents: (n: number) => void;
    sys1Ratio: number; setSys1Ratio: (n: number) => void;
    speed: number; setSpeed: (n: number) => void;
    awarenessRate: number; setAwarenessRate: (n: number) => void;
    reflexiveRate: number; setReflexiveRate: (n: number) => void;
    motivationStrength: number; setMotivationStrength: (n: number) => void;
    isRunning: boolean; setIsRunning: (n: boolean) => void;
    onRestart: () => void;
    stats: SimulationStats | null;
    logEntries: LogEntryData[];
    chartData: ChartDataPoint[];
}

export default function Settings({
    numAgents, setNumAgents,
    sys1Ratio, setSys1Ratio,
    speed, setSpeed,
    awarenessRate, setAwarenessRate,
    reflexiveRate, setReflexiveRate,
    motivationStrength, setMotivationStrength,
    isRunning, setIsRunning,
    onRestart,
    stats,
    logEntries,
    chartData,
}: SettingsProps) {
    const [activeTab, setActiveTab] = useState<'controls' | 'legend' | 'stats' | 'log' | 'analytics'>('controls');
    
    const pace = useMemo(() => {
        if (speed < 1) return 'Slow';
        if (speed < 2) return 'Medium';
        return 'Fast';
    }, [speed]);

    // Tab buttons
    const tabs = [
        { id: 'controls', label: 'Controls' },
        { id: 'legend', label: 'Legend' },
        { id: 'stats', label: 'Stats' },
        { id: 'log', label: 'Log' },
        { id: 'analytics', label: 'Analytics' },
    ];

    return (
        <SettingsContainer>
            {/* Tab Navigation */}
            <div className="flex gap-1 mb-4 -mx-2 -mt-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 px-2 py-1 text-xs transition-colors ${
                            activeTab === tab.id 
                                ? 'bg-white/20 text-white' 
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'controls' && (
                <>
            {/* numeric input ----------------------------------------------------- */}
            <div className="space-y-1 flex justify-between items-center">
                <label className="flex justify-between">
                    <span>Agents</span>
                </label>
                <Input
                    type="number"
                    min={10}
                    max={200}
                    step={10}
                    value={numAgents}
                    onChange={v => setNumAgents(parseInt(v, 10))}
                    compact
                    centered
                />
            </div>

            {/* range sliders ----------------------------------------------------- */}
            {[
                {
                    label: 'System I ratio',
                    val: sys1Ratio, set: setSys1Ratio,
                    min: 0, max: 1, step: 0.1,
                    fmt: (x: number) => x.toFixed(1),
                },
                {
                    label: 'Speed',
                    val: speed, set: setSpeed,
                    min: 0.5, max: 3, step: 0.1,
                    fmt: (x: number) => x.toFixed(1),
                },
                {
                    label: 'Awareness rate',
                    val: awarenessRate, set: setAwarenessRate,
                    min: 0, max: 0.2, step: 0.01,
                    fmt: (x: number) => x.toFixed(2),
                },
                {
                    label: 'Reflexive‑ctrl rate',
                    val: reflexiveRate, set: setReflexiveRate,
                    min: 0, max: 0.2, step: 0.01,
                    fmt: (x: number) => x.toFixed(2),
                },
                {
                    label: 'Motivation strength',
                    val: motivationStrength, set: setMotivationStrength,
                    min: 0, max: 1, step: 0.1,
                    fmt: (x: number) => x.toFixed(1),
                },
            ].map(s => (
                <div key={s.label} className="space-y-1">
                    <div className="flex justify-between">
                        <span>{s.label}</span>
                        <span className="text-lime-200">{s.fmt(s.val)}</span>
                    </div>

                    <Input
                        type="range"
                        min={s.min}
                        max={s.max}
                        step={s.step}
                        value={s.val}
                        onChange={v => s.set(parseFloat(v))}
                        compact
                        centered
                    />
                </div>
            ))}

            {/* quick interpretation --------------------------------------------- */}
            <div className="mt-3 bg-white/10 p-2 text-xs italic rounded">
                Current pacing: <strong>{pace}</strong>
            </div>

            {/* actions ----------------------------------------------------------- */}
            <div className="flex mt-4 gap-2">
                <Button
                    className="flex-1"
                    label={isRunning ? "Pause" : "Start"}
                    onClick={() => setIsRunning(!isRunning)}
                />
                <Button
                    className="flex-1"
                    label="Restart"
                    onClick={onRestart}
                />
            </div>
                </>
            )}

            {activeTab === 'legend' && (
                <div className="space-y-4">
                    <Legend />
                </div>
            )}

            {activeTab === 'stats' && (
                <div className="space-y-4">
                    <StatsDisplay stats={stats} />
                </div>
            )}

            {activeTab === 'log' && (
                <div className="space-y-4">
                    <LogDisplay logEntries={logEntries} />
                </div>
            )}

            {activeTab === 'analytics' && (
                <div className="space-y-4">
                    <ChartsDisplay chartData={chartData} />
                </div>
            )}
        </SettingsContainer>
    );
}
