'use client';

import Button from '@/components/Button';
import Toggle from '@/components/Toggle';


interface SettingsProps {
    isStirring: boolean;
    entropy: number;
    mixedness: number;
    onStirToggle: () => void;
    onReset: () => void;
    onStirOnce: () => void;
}

export default function Settings({
    isStirring,
    entropy,
    mixedness,
    onStirToggle,
    onReset,
    onStirOnce,
}: SettingsProps) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <Toggle
                    text="continuous stirring"
                    value={isStirring}
                    toggle={onStirToggle}
                />
            </div>

            <div className="flex gap-2">
                <Button
                    onClick={onStirOnce}
                    label="stir once"
                />
                <Button
                    onClick={onReset}
                    label="reset"
                />
            </div>

            <div className="mt-4 p-3 bg-zinc-900 text-sm">
                <div className="flex justify-between mb-2">
                    <span className="text-gray-400">entropy</span>
                    <span className="text-lime-400 font-mono">{entropy.toFixed(3)}</span>
                </div>
                <div className="w-full bg-zinc-800 h-2">
                    <div
                        className="bg-lime-500 h-2 transition-all duration-300"
                        style={{ width: `${Math.min(100, entropy * 100)}%` }}
                    />
                </div>

                <div className="flex justify-between mb-2 mt-4">
                    <span className="text-gray-400">mixedness</span>
                    <span className="text-lime-400 font-mono">{(mixedness * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-zinc-800 h-2">
                    <div
                        className="bg-lime-500 h-2 transition-all duration-300"
                        style={{ width: `${mixedness * 100}%` }}
                    />
                </div>
            </div>

            <p className="text-xs text-gray-500 mt-2">
                Drag to rotate the view. Stirring increases entropy as cream and coffee mix together.
            </p>
        </div>
    );
}
