'use client';

import { useState } from 'react';

import Header from '@/components/Header';
import Title from '@/components/Title';
import Settings from '@/app/playgrounds/raupian-morphospace/components/Settings';
import Viewer from '@/app/playgrounds/raupian-morphospace/components/Viewer';


export default function RaupianMorphospacePlayground() {
    const [W, setW] = useState(1.4);     // Whorl expansion rate
    const [D, setD] = useState(0.4);     // Distance from coiling axis / Aperture radius
    const [T, setT] = useState(0.6);     // Translation rate along the coiling axis
    const [autoRotate, setAutoRotate] = useState(true);

    // Reset to default values
    const reset = () => {
        setW(1.4);
        setD(0.4);
        setT(0.6);

        setAutoRotate(true);
    };

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

                <div className="max-w-xl text-white/80 mt-2 text-sm">
                    visualizing theoretical shell morphology using David Raup&apos;s three-parameter model (W, D, T)
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
