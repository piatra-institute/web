import React from 'react';

import SettingsContainer from '@/components/SettingsContainer';



interface SettingsProps {
    numAgents: number; setNumAgents: (n: number) => void;
    sys1Ratio: number; setSys1Ratio: (n: number) => void;
    speed: number; setSpeed: (n: number) => void;
    awarenessRate: number; setAwarenessRate: (n: number) => void;
    reflexiveRate: number; setReflexiveRate: (n: number) => void;
    motivationStrength: number; setMotivationStrength: (n: number) => void;
    onRestart: () => void;
}

const Settings: React.FC<SettingsProps> = ({
    numAgents, setNumAgents, sys1Ratio, setSys1Ratio, speed, setSpeed,
    awarenessRate, setAwarenessRate, reflexiveRate, setReflexiveRate,
    motivationStrength, setMotivationStrength, onRestart
}) => {
    return (
        <SettingsContainer>
             <label>Num Agents:
                <input type="number" value={numAgents} min="10" max="200" step="10" onChange={(e) => setNumAgents(parseInt(e.target.value))} />
             </label>
             <label>System I Ratio:
                 <input type="range" value={sys1Ratio} min="0" max="1" step="0.1" onChange={(e) => setSys1Ratio(parseFloat(e.target.value))} />
                 <span>{sys1Ratio.toFixed(1)}</span>
             </label>
             <label>Speed:
                 <input type="range" value={speed} min="0.5" max="3" step="0.1" onChange={(e) => setSpeed(parseFloat(e.target.value))} />
                 <span>{speed.toFixed(1)}</span>
             </label>
             <label>Awareness Rate:
                 <input type="range" value={awarenessRate} min="0" max="0.2" step="0.01" onChange={(e) => setAwarenessRate(parseFloat(e.target.value))} />
                 <span>{awarenessRate.toFixed(2)}</span>
             </label>
             <label>Reflex. Ctrl Rate:
                 <input type="range" value={reflexiveRate} min="0" max="0.2" step="0.01" onChange={(e) => setReflexiveRate(parseFloat(e.target.value))} />
                 <span>{reflexiveRate.toFixed(2)}</span>
             </label>
             <label>Motivation Str:
                 <input type="range" value={motivationStrength} min="0" max="1" step="0.1" onChange={(e) => setMotivationStrength(parseFloat(e.target.value))} />
                 <span>{motivationStrength.toFixed(1)}</span>
             </label>
            <button onClick={onRestart}>Restart Simulation</button>
        </SettingsContainer>
    );
};


export default Settings;
