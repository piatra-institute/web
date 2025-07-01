'use client';

import Button from '@/components/Button';
import SliderInput from '@/components/SliderInput';

interface SettingsProps {
    isPaused: boolean;
    isStirring: boolean;
    speed: number;
    onAddCream: () => void;
    onStir: () => void;
    onReset: () => void;
    onPause: () => void;
    onSpeedChange: (speed: number) => void;
}

export default function Settings({
    isPaused,
    isStirring,
    speed,
    onAddCream,
    onStir,
    onReset,
    onPause,
    onSpeedChange,
}: SettingsProps) {
    return (
        <div className="space-y-3">
            <Button
                label="Add Cream"
                onClick={onAddCream}
                className="w-full"
                size="sm"
            />

            <Button
                label={isStirring ? 'Stop Stir' : 'Stir'}
                onClick={onStir}
                size="sm"
                className={isStirring ? 'w-full bg-lime-200' : 'w-full'}
            />

            <Button
                label="Reset"
                onClick={onReset}
                size="sm"
                className="w-full"
            />

            <Button
                label={isPaused ? 'Play' : 'Pause'}
                onClick={onPause}
                size="sm"
                className={isPaused ? 'w-full bg-lime-200' : 'w-full'}
            />

            <SliderInput
                label="Speed"
                value={speed}
                onChange={onSpeedChange}
                min={0.1}
                max={5}
                step={0.1}
                showDecimals={true}
            />
        </div>
    );
}