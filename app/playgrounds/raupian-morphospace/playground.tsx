'use client';

import { useState, useEffect } from 'react';

import PlaygroundLayout from '@/components/PlaygroundLayout';
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

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
        },
        {
            id: 'morphospace',
            type: 'canvas' as const,
            content: (
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
            ),
        },
        {
            id: 'about',
            type: 'outro' as const,
            content: (
                <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                    <p>
                        David M. Raup&apos;s three-parameter model revolutionized our understanding 
                        of shell morphology by reducing the infinite variety of mollusk shells 
                        to just three geometric parameters: whorl expansion rate (W), distance 
                        from coiling axis (D), and translation rate (T).
                    </p>
                    <p>
                        This morphospace visualization allows exploration of theoretical shell 
                        forms, many of which don&apos;t exist in nature. By adjusting the three 
                        parameters, you can navigate through possible shell geometries and 
                        understand the constraints that shape biological form.
                    </p>
                    <p>
                        Key concepts include: theoretical morphology, parametric modeling, 
                        evolutionary constraints, shell geometry, and the relationship between 
                        mathematical possibility and biological reality.
                    </p>
                </div>
            ),
        },
    ];

    const settings = (
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
    );

    return (
        <PlaygroundLayout
            title="raupian morphospace"
            subtitle="visualizing theoretical shell morphology using david m. raup's three-parameter model; navigate forms with arrows and shift"
            description={
                <a
                    href="https://doi.org/10.1086/282663"
                    target="_blank"
                    className="text-blue-400 hover:text-blue-300 underline"
                >
                    1966, Raup, Geometric Analysis of Shell Coiling
                </a>
            }
            sections={sections}
            settings={settings}
        />
    );
}
