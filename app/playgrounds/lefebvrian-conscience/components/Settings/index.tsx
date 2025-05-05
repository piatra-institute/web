import { useMemo } from 'react';

import SettingsContainer from '@/components/SettingsContainer';
import Input from '@/components/Input';
import Button from '@/components/Button';



interface SettingsProps {
    numAgents: number; setNumAgents: (n: number) => void;
    sys1Ratio: number; setSys1Ratio: (n: number) => void;
    speed: number; setSpeed: (n: number) => void;
    awarenessRate: number; setAwarenessRate: (n: number) => void;
    reflexiveRate: number; setReflexiveRate: (n: number) => void;
    motivationStrength: number; setMotivationStrength: (n: number) => void;
    isRunning: boolean; setIsRunning: (n: boolean) => void;
    onRestart: () => void;
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
}: SettingsProps) {
    const pace = useMemo(() => {
        if (speed < 1) return 'Slow';
        if (speed < 2) return 'Medium';
        return 'Fast';
    }, [speed]);

    return (
        <SettingsContainer>
            {/* numeric input ----------------------------------------------------- */}
            <div className="space-y-1">
                <label className="flex justify-between">
                    <span>Agents</span>
                    <span className="text-lime-200">{numAgents}</span>
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
        </SettingsContainer>
    );
}
