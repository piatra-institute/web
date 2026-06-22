'use client';

import { useState } from 'react';

import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundSettings from '@/components/PlaygroundSettings';
import Button from '@/components/Button';
import Input from '@/components/Input';
import AssumptionPanel from '@/components/AssumptionPanel';
import CalibrationPanel from '@/components/CalibrationPanel';
import VersionSelector from '@/components/VersionSelector';
import ModelChangelog from '@/components/ModelChangelog';
import Equation from '@/components/Equation';
import Fractal from '@/app/playgrounds/(2025)/(02)/halley-window/components/Fractal';

import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';

export default function HalleyWindowPlayground() {
    const calibration = buildCalibration();

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
                <div className="space-y-8 text-gray-300">
                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Root-finding made visible</h3>
                        <p className="leading-relaxed text-sm">
                            Halley&apos;s method finds a root of a function using its first and second
                            derivatives, converging cubically, faster than Newton&apos;s quadratic method.
                            Run it on the polynomial z to the n minus 1 and colour each starting point by
                            which root it reaches, and the plane splits into basins of attraction.
                        </p>
                        <div className="my-3">
                            <Equation mode="block" math="z \;\mapsto\; z - \frac{2\,f\,f'}{2\,f'^2 - c\,f\,f''}" />
                        </div>
                        <p className="leading-relaxed text-sm">
                            The weight c slides between two classics: c = 1 is Halley&apos;s method, and
                            c = 0 drops the second-derivative term to give Newton&apos;s method, z minus f
                            over f prime.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Why the boundaries are fractal</h3>
                        <p className="leading-relaxed text-sm">
                            The roots of z to the n minus 1 are the n-th roots of unity, equally spaced on
                            the unit circle. Each smooth region converges to one of them, but the
                            boundaries between regions are fractal: between any two basins lies a sliver of
                            a third, and tiny changes in the start flip which root you reach. The
                            calibration panel checks convergence in the well-behaved interior; the
                            assumptions panel is honest about the chaotic boundary and the rendering limits.
                        </p>
                    </div>

                    <div className="border-t border-lime-500/20 pt-6">
                        <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
                    </div>

                    <CalibrationPanel results={calibration} outputLabel="converged value" />

                    <AssumptionPanel assumptions={assumptions} />

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Model changelog</h3>
                        <ModelChangelog entries={changelog} />
                    </div>
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
            researchUrl="/playgrounds/halley-window/research"
        />
    );
}