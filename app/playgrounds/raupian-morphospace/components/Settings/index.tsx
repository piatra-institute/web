'use client';

import Button from '@/components/Button';
import Input from '@/components/Input';
import Toggle from '@/components/Toggle';
import SettingsContainer from '@/components/SettingsContainer';



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
        <SettingsContainer>
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
        </SettingsContainer>
    );
}
