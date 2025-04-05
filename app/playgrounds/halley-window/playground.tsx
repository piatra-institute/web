'use client';

import { useState } from 'react';

import Header from '@/components/Header';
import Title from '@/components/Title';
import Settings from '@/app/playgrounds/halley-window/components/Settings';
import Fractal from '@/app/playgrounds/halley-window/components/Fractal';

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

    return (
        <div className="relative min-h-screen">
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

            <div className="absolute top-0 left-0 z-10 p-6">
                <Header />
                <Title text="halley's method fractal" />

                <div className="max-w-xl text-white/80 mt-2 text-sm text-center">
                    Halley&apos;s method is a root-finding algorithm
                    <br />
                    that uses first and second derivatives
                </div>
            </div>

            <Settings
                constant={constant}
                setConstant={setConstant}
                centerX={centerX}
                setCenterX={setCenterX}
                centerY={centerY}
                setCenterY={setCenterY}
                zoom={zoom}
                setZoom={setZoom}
                maxIterations={maxIterations}
                setMaxIterations={setMaxIterations}
                bailout={bailout}
                setBailout={setBailout}
                colorMode={colorMode}
                setColorMode={setColorMode}
                polynomialDegree={polynomialDegree}
                setPolynomialDegree={setPolynomialDegree}
                reset={reset}
            />
        </div>
    );
}