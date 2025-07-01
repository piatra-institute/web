'use client';

import Button from '@/components/Button';

interface SettingsProps {
    isPaused: boolean;
    isStirring: boolean;
    onAddCream: () => void;
    onStir: () => void;
    onReset: () => void;
    onPause: () => void;
}

export default function Settings({
    isPaused,
    isStirring,
    onAddCream,
    onStir,
    onReset,
    onPause,
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
        </div>
    );
}