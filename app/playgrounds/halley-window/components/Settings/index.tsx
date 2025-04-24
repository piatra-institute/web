'use client';

import Button from '@/components/Button';
import Input from '@/components/Input';
import SettingsContainer from '@/components/SettingsContainer';



export interface SettingsProps {
    constant: number;
    setConstant: (value: number) => void;

    centerX: number;
    setCenterX: (value: number) => void;
    centerY: number;
    setCenterY: (value: number) => void;

    zoom: number;
    setZoom: (value: number) => void;

    maxIterations: number;
    setMaxIterations: (value: number) => void;

    bailout: number;
    setBailout: (value: number) => void;

    colorMode: 'hsl' | 'rgb';
    setColorMode: (value: 'hsl' | 'rgb') => void;

    polynomialDegree: number;
    setPolynomialDegree: (value: number) => void;

    reset: () => void;
}

export default function Settings({
    constant,
    setConstant,

    centerX,
    setCenterX,
    centerY,
    setCenterY,

    zoom,
    setZoom,

    maxIterations,
    setMaxIterations,

    bailout,
    setBailout,

    colorMode,
    setColorMode,

    polynomialDegree,
    setPolynomialDegree,

    reset,
}: SettingsProps) {
    return (
        <SettingsContainer>
            <Input
                value={constant}
                onChange={(value) => {
                    const num = parseFloat(value);
                    if (!isNaN(num)) {
                        setConstant(num);
                    }
                }}
                label="Constant"
                type="number"
                step={0.1}
                compact={true}
            />

            <Input
                value={polynomialDegree}
                onChange={(value) => {
                    const num = parseInt(value);
                    if (!isNaN(num) && num >= 2) {
                        setPolynomialDegree(num);
                    }
                }}
                label="Polynomial Degree"
                type="number"
                min={2}
                step={1}
                compact={true}
            />

            <Input
                value={centerX}
                onChange={(value) => {
                    const num = parseFloat(value);
                    if (!isNaN(num)) {
                        setCenterX(num);
                    }
                }}
                label="Center X"
                type="number"
                step={0.1}
                compact={true}
            />

            <Input
                value={centerY}
                onChange={(value) => {
                    const num = parseFloat(value);
                    if (!isNaN(num)) {
                        setCenterY(num);
                    }
                }}
                label="Center Y"
                type="number"
                step={0.1}
                compact={true}
            />

            <Input
                value={zoom}
                onChange={(value) => {
                    const num = parseFloat(value);
                    if (!isNaN(num) && num > 0) {
                        setZoom(num);
                    }
                }}
                label="Zoom"
                type="number"
                min={0.1}
                step={0.1}
                compact={true}
            />

            <Input
                value={maxIterations}
                onChange={(value) => {
                    const num = parseInt(value);
                    if (!isNaN(num) && num > 0) {
                        setMaxIterations(num);
                    }
                }}
                label="Max Iterations"
                type="number"
                min={1}
                step={1}
                compact={true}
            />

            <Input
                value={bailout}
                onChange={(value) => {
                    const num = parseFloat(value);
                    if (!isNaN(num) && num > 0) {
                        setBailout(num);
                    }
                }}
                label="Bailout Radius"
                type="number"
                min={1}
                step={1}
                compact={true}
            />

            <div className="pb-1">
                <label className="flex justify-between items-center cursor-pointer">
                    <span>Color Mode</span>
                    <select
                        className="bg-black border border-white/30 rounded px-2 py-1"
                        value={colorMode}
                        onChange={(e) => setColorMode(e.target.value as 'hsl' | 'rgb')}
                    >
                        <option value="hsl">HSL</option>
                        <option value="rgb">RGB</option>
                    </select>
                </label>
            </div>

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
