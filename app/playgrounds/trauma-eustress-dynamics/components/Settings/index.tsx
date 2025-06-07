import { FC } from 'react';
import SettingsContainer from '@/components/SettingsContainer';
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
    return (
        <SettingsContainer>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Constriction Δ (−1 → +1)
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

                <Button onClick={onPlayPause}>
                    {isPlaying ? 'Pause' : 'Play'}
                </Button>

                <div className="pt-2 border-t border-gray-700">
                    <h3 className="text-sm font-medium text-gray-300 mb-3">
                        Mechanisms (β-scaled, 0–1)
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
        </SettingsContainer>
    );
};

export default Settings;