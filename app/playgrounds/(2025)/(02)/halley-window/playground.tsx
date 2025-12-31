'use client';

import { useState } from 'react';

import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundSettings from '@/components/PlaygroundSettings';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Fractal from '@/app/playgrounds/(2025)/(02)/halley-window/components/Fractal';

export default function HalleyWindowPlayground() {
    // Default values calibrated to match the reference image
    const [constant, setConstant] = useState(5);
    const [centerX, setCenterX] = useState(-0.3);
    const [centerY, setCenterY] = useState(0);
    const [zoom, setZoom] = useState(2.5);
    const [maxIterations, setMaxIterations] = useState(20);
    const [bailout, setBailout] = useState(18);
    const [colorMode, setColorMode] = useState<'hsl' | 'rgb'>('rgb');
    const [polynomialDegree, setPolynomialDegree] = useState(3);

    // Reset to default values
    const reset = () => {
        setConstant(7);
        setCenterX(0);
        setCenterY(0);
        setZoom(2.5);
        setMaxIterations(40);
        setBailout(10);
        setColorMode('rgb');
        setPolynomialDegree(3);
    };

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
            content: (
                <div className="mt-12">
                    <p className="text-xl text-gray-300 mb-4">
                        Interactive fractal visualization using Halley&apos;s root-finding method
                    </p>
                    <p className="text-gray-400">
                        Explore the beautiful patterns that emerge when applying Halley&apos;s method
                        to find roots of complex polynomials, revealing the intricate structure
                        of convergence basins in the complex plane.
                    </p>
                </div>
            ),
        },
        {
            id: 'fractal',
            type: 'canvas' as const,
            content: (
                <div className="absolute inset-0 bg-black">
                    <Fractal
                        constant={constant}
                        centerX={centerX}
                        centerY={centerY}
                        setCenterX={setCenterX}
                        setCenterY={setCenterY}
                        zoom={zoom}
                        setZoom={setZoom}
                        maxIterations={maxIterations}
                        bailout={bailout}
                        colorMode={colorMode}
                        polynomialDegree={polynomialDegree}
                    />
                </div>
            ),
        },
        {
            id: 'about',
            type: 'outro' as const,
            content: (
                <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                        <p>
                            Halley&apos;s method is a root-finding algorithm that uses both first and
                            second derivatives to converge faster than Newton&apos;s method. When applied
                            to complex polynomials, it creates stunning fractal patterns that reveal
                            the convergence basins for each root.
                        </p>
                        <p>
                            Each colored region represents points that converge to the same root,
                            while the intricate boundaries between regions showcase the chaotic
                            behavior of the iterative method. The fractal structure emerges from
                            the sensitivity of the convergence to initial conditions.
                        </p>
                        <p>
                            Key concepts include: numerical analysis, root-finding algorithms,
                            complex analysis, fractal geometry, convergence basins, and the
                            relationship between mathematical iteration and visual beauty.
                        </p>
                </div>
            ),
        },
    ];

    const settings = (
        <PlaygroundSettings
            sections={[
                {
                    title: 'Fractal Parameters',
                    content: (
                        <>
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
                        </>
                    ),
                },
                {
                    title: 'View Controls',
                    content: (
                        <>
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
                        </>
                    ),
                },
            ]}
        />
    );

    return (
        <PlaygroundLayout
            title="Halley's Method Fractal"
            subtitle="Root-Finding Algorithms in the Complex Plane"
            sections={sections}
            settings={settings}
        />
    );
}