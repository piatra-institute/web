import { FC } from 'react';
import Button from '@/components/Button';
import type { MechanismData } from '../../playground';



interface SettingsProps {
    constriction: number;
    mechanisms: MechanismData[];
    isPlaying: boolean;
    onConstrictionChange: (value: number) => void;
    onMechanismChange: (index: number, weight: number) => void;
    onPlayPause: () => void;
}

const Settings: FC<SettingsProps> = ({
    constriction,
    mechanisms,
    isPlaying,
    onConstrictionChange,
    onMechanismChange,
    onPlayPause,
}) => {
    const qualitative = (v: number) => {
        if (v > 0.5) return 'high narrowing';
        if (v > 0.1) return 'moderate narrowing';
        if (v > -0.1) return 'near baseline';
        if (v > -0.5) return 'moderate expansion';
        return 'deep expansion';
    };

    const mechSummary = () => {
        return mechanisms.map(m => {
            const lvl = m.weight > 0.66 ? 'high' : m.weight > 0.33 ? 'mid' : 'low';
            return `${m.name}:${lvl}`;
        }).join(' | ');
    };

    return (
        <div className="w-full h-full overflow-y-auto p-4">
            <div className="space-y-6">
                <div>
                    <h2 className="text-white text-lg font-semibold mb-4">Settings</h2>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Constriction Δ (-1 → +1)
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min="-1"
                                max="1"
                                step="0.01"
                                value={constriction}
                                onChange={(e) => onConstrictionChange(parseFloat(e.target.value))}
                                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <span className="text-sm text-gray-400 w-12 text-right">
                                {constriction.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <Button
                        label={isPlaying ? 'Pause' : 'Play'}
                        onClick={onPlayPause}
                    />

                    <div className="pt-4 border-t border-gray-700 mt-4">
                        <h3 className="text-sm font-medium text-gray-300 mb-3">
                            Mechanisms (β-scaled, 0-1)
                        </h3>
                        <div className="space-y-3">
                            {mechanisms.map((mechanism, index) => (
                                <div key={mechanism.name}>
                                    <label className="block text-sm text-gray-400 mb-1">
                                        {mechanism.name}
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={mechanism.weight}
                                            onChange={(e) => onMechanismChange(index, parseFloat(e.target.value))}
                                            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                        />
                                        <span className="text-sm text-gray-400 w-10 text-right">
                                            {mechanism.weight.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Legend content moved from overlay */}
                <div className="border-t border-gray-700 pt-4">
                    <h4 className="text-[#03dac6] font-semibold mb-3 text-sm">Axis Meaning</h4>
                    <p className="text-gray-300 mb-4 text-sm">
                        Vertical represents <strong>bandwidth change</strong>: +1 = full threat-narrowing;
                        –1 = max eustress bandwidth. Horizontal represents <strong>time</strong> from
                        Pre-event to multiple post‑trauma trajectories.
                    </p>

                    <h4 className="text-[#03dac6] font-semibold mb-3 text-sm">Outcome Trajectories</h4>
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#2196f3] mr-2 shrink-0" />
                            <span className="text-sm text-gray-300"><strong>Resilience</strong> – minimal disturbance</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#ff9800] mr-2 shrink-0" />
                            <span className="text-sm text-gray-300"><strong>Recovery</strong> – delayed rebound</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#9c27b0] mr-2 shrink-0" />
                            <span className="text-sm text-gray-300"><strong>Chronic</strong> – sustained narrowing</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#009688] mr-2 shrink-0" />
                            <span className="text-sm text-gray-300"><strong>Growth</strong> – exploratory expansion</span>
                        </div>
                    </div>

                    <h4 className="text-[#03dac6] font-semibold mb-3 text-sm">Mechanism Details</h4>
                    <p className="text-gray-300 mb-2 text-sm">Spoke length & thickness scale with slider value.</p>
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5252] mr-2 shrink-0" />
                            <span className="text-sm text-gray-300">Appraisal (threat ↔ meaning)</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#ffb300] mr-2 shrink-0" />
                            <span className="text-sm text-gray-300">Rumination (intrusive ↔ deliberate)</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#64b5f6] mr-2 shrink-0" />
                            <span className="text-sm text-gray-300">Social support</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#4db6ac] mr-2 shrink-0" />
                            <span className="text-sm text-gray-300">Neuro‑flexibility</span>
                        </div>
                    </div>

                    <h4 className="text-[#03dac6] font-semibold mb-3 text-sm">Current Interpretation</h4>
                    <p className="text-gray-100 font-semibold mb-4 text-sm">
                        Currently: {qualitative(constriction)} (Δ={constriction.toFixed(2)}).
                        Mechanisms → {mechSummary()}
                    </p>

                    <div className="text-gray-500 text-xs pt-3 border-t border-gray-800">
                        β‑weights from Tedeschi & Calhoun 1996; Cann 2011; Bonanno 2007; Kalisch 2015.
                    </div>
                </div>
            </div>

            <style jsx>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    background: #03dac6;
                    cursor: pointer;
                    border-radius: 50%;
                }

                .slider::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    background: #03dac6;
                    cursor: pointer;
                    border-radius: 50%;
                    border: none;
                }
            `}</style>
        </div>
    );
};

export default Settings;
