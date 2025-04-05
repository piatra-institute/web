'use client';

import Button from '@/components/Button';
import Input from '@/components/Input';
import Toggle from '@/components/Toggle';



export interface SettingsProps {
    W: number;
    setW: (value: number) => void;
    D: number;
    setD: (value: number) => void;
    T: number;
    setT: (value: number) => void;
    autoRotate: boolean;
    setAutoRotate: (value: boolean) => void;
    reset: () => void;
}

export default function Settings({
    W,
    setW,
    D,
    setD,
    T,
    setT,
    autoRotate,
    setAutoRotate,
    reset,
}: SettingsProps) {
    return (
        <div
            className="fixed top-2 right-2 bg-black/80 backdrop-blur-md p-4 rounded-md w-64 z-20 border border-white/20"
        >
            <div className="mb-4">
                <h2 className="text-xl mb-2 border-b border-white/20 pb-1">Settings</h2>

                <div className="space-y-4">
                    <Input
                        value={W}
                        onChange={(value) => {
                            const num = parseFloat(value);
                            if (!isNaN(num)) setW(num);
                        }}
                        label="Whorl Expansion (W)"
                        type="number"
                        min={1}
                        max={5}
                        step={0.1}
                        compact={true}
                    />

                    <Input
                        value={D}
                        onChange={(value) => {
                            const num = parseFloat(value);
                            if (!isNaN(num)) setD(num);
                        }}
                        label="Distance Factor (D)"
                        type="number"
                        min={0.1}
                        max={1}
                        step={0.1}
                        compact={true}
                    />

                    <Input
                        value={T}
                        onChange={(value) => {
                            const num = parseFloat(value);
                            if (!isNaN(num)) setT(num);
                        }}
                        label="Translation (T)"
                        type="number"
                        min={0}
                        max={3}
                        step={0.1}
                        compact={true}
                    />

                    <Toggle
                        value={autoRotate}
                        toggle={() => setAutoRotate(!autoRotate)}
                        text="Auto Rotate"
                    />

                    <Button
                        label="Reset"
                        onClick={reset}
                        style={{
                            width: '100%',
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
