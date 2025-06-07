'use client';

import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import PlaygroundSettings from '@/components/PlaygroundSettings';
import Input from '@/components/Input';
import { useState } from 'react';

export default function RefractiveComputationPlayground() {
    const [refractiveIndex, setRefractiveIndex] = useState(1.5);
    const [wavelength, setWavelength] = useState(550);

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
            content: (
                <div className="mt-12">
                    <p className="text-xl text-gray-300 mb-4">
                        Computing with light through optical refraction principles
                    </p>
                    <p className="text-gray-400">
                        Explore how the bending of light through different media can be harnessed 
                        for computational purposes, creating optical computing systems based on 
                        refractive index manipulation.
                    </p>
                </div>
            ),
        },
        {
            id: 'computation',
            type: 'canvas' as const,
            content: (
                <PlaygroundViewer>
                    <div className="flex items-center justify-center w-full h-64 border-2 border-dashed border-gray-600 rounded-lg">
                        <div className="text-center text-gray-400">
                            <div className="text-6xl mb-4">🔬</div>
                            <p className="text-lg mb-2">Simulation Coming Soon</p>
                            <p className="text-sm">Optical computation systems will be visualized here</p>
                        </div>
                    </div>
                </PlaygroundViewer>
            ),
        },
        {
            id: 'about',
            type: 'outro' as const,
            content: (
                <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                        <p>
                            Refractive computation explores the possibility of using optical 
                            phenomena, specifically the refraction of light, as a medium for 
                            computational processes. By manipulating how light bends through 
                            different materials, we can create analog computers that operate 
                            at the speed of light.
                        </p>
                        <p>
                            This approach leverages the wave nature of light and the continuous 
                            mathematics of Snell's law to perform calculations. Unlike digital 
                            computers that use discrete binary states, refractive computation 
                            works with continuous optical states.
                        </p>
                        <p>
                            Key concepts include: Snell's law applications, metamaterial design, 
                            optical signal processing, analog computation principles, and 
                            photonic integrated circuits.
                        </p>
                </div>
            ),
        },
    ];

    const settings = (
        <PlaygroundSettings
            sections={[
                {
                    title: 'Optical Parameters',
                    content: (
                        <>
                            <Input
                                value={refractiveIndex}
                                onChange={(e) => setRefractiveIndex(parseFloat(e) || 1)}
                                label="Refractive Index"
                                compact={true}
                                type="number"
                                min={1}
                                max={3}
                                step={0.1}
                            />
                            <Input
                                value={wavelength}
                                onChange={(e) => setWavelength(parseInt(e) || 400)}
                                label="Wavelength (nm)"
                                compact={true}
                                type="number"
                                min={400}
                                max={700}
                            />
                        </>
                    ),
                },
            ]}
        />
    );

    return (
        <PlaygroundLayout
            title="Refractive Computation"
            subtitle="Computing with Light Through Optical Refraction"
            sections={sections}
            settings={settings}
        />
    );
}
