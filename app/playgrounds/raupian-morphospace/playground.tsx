'use client';

import { useState, useEffect } from 'react';

import Header from '@/components/Header';
import Title from '@/components/Title';
import Settings from '@/app/playgrounds/raupian-morphospace/components/Settings';
import Viewer from '@/app/playgrounds/raupian-morphospace/components/Viewer';



const defaultValues = {
    W: 1.4,
    D: 0.4,
    T: 0.6,
    autoRotate: false,
};

export default function RaupianMorphospacePlayground() {
    const [W, setW] = useState(defaultValues.W);     // Whorl expansion rate
    const [D, setD] = useState(defaultValues.D);     // Distance from coiling axis / Aperture radius
    const [T, setT] = useState(defaultValues.T);     // Translation rate along the coiling axis
    const [autoRotate, setAutoRotate] = useState(true);

    const reset = () => {
        setW(defaultValues.W);
        setD(defaultValues.D);
        setT(defaultValues.T);

        setAutoRotate(defaultValues.autoRotate);
    };

    useEffect(() => {
        setTimeout(() => {
            setAutoRotate(false);
        }, 5_000);
    }, []);

    return (
        <div className="relative min-h-screen">
            <div className="absolute inset-0">
                <Viewer
                    W={W}
                    D={D}
                    T={T}
                    autoRotate={autoRotate}
                    setW={setW}
                    setD={setD}
                    setT={setT}
                />
            </div>

            <div className="absolute top-0 left-0 z-10 p-6 pointer-events-none"> {/* Disable pointer events for overlay text */}
                <Header />
                <Title text="Raupian Morphospace Explorer" />

                <div className="max-w-xl text-white/80 mt-2 text-sm text-center">
                    visualizing theoretical shell morphology
                    <br />
                    using David Raup&apos;s three-parameter model (W, D, T)
                </div>
            </div>

            <Settings
                W={W}
                setW={setW}
                D={D}
                setD={setD}
                T={T}
                setT={setT}
                autoRotate={autoRotate}
                setAutoRotate={setAutoRotate}
                reset={reset}
            />
        </div>
    );
}
