'use client';

import { useState, useRef, useCallback } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Viewer from './components/Viewer';
import Settings from './components/Settings';
import { baseData } from './logic';



export default function Playground() {
    const [selectedAirport, setSelectedAirport] = useState('ATL');
    const [ramseyLambda, setRamseyLambda] = useState(0.5);
    const [networkEffect, setNetworkEffect] = useState(5);

    const viewerRef = useRef<{ exportCanvas: () => void }>(null);

    const handleReset = useCallback(() => {
        setSelectedAirport('ATL');
        setRamseyLambda(0.5);
        setNetworkEffect(5);
    }, []);

    const handleExport = useCallback(() => {
        viewerRef.current?.exportCanvas();
    }, []);

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
            content: (
                <div className="mt-12">
                    <p className="text-xl text-gray-300 mb-4">
                        A Visual Playground for Airport Economics
                    </p>
                    <p className="text-gray-400">
                        Interactively explore the economic trade-offs between different airport pricing strategies,
                        based on the findings from the Ivaldi, Sokullu, &amp; Toru (2015) paper.
                    </p>
                </div>
            ),
        },
        {
            id: 'canvas',
            type: 'canvas' as const,
            content: (
                <PlaygroundViewer>
                    <Viewer
                        ref={viewerRef}
                        selectedAirport={selectedAirport}
                        ramseyLambda={ramseyLambda}
                        networkEffect={networkEffect}
                    />
                </PlaygroundViewer>
            ),
        },
        {
            id: 'about',
            type: 'outro' as const,
            content: (
                <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                    <p>
                        This model visualizes the economic outcomes of airport pricing strategies. The chart shows comparisons
                        between the <strong className="font-semibold text-lime-400">Current Model</strong> (as observed in the paper)
                        and a simulated <strong className="font-semibold text-red-400">Privatized Model</strong>.
                    </p>
                    <p>
                        <strong className="font-semibold text-lime-400">Ramsey Welfare Weight (λ):</strong> Controls
                        how much weight is given to social welfare versus profit maximization. Higher values prioritize
                        welfare over pure profit.
                    </p>
                    <p>
                        <strong className="font-semibold text-lime-400">Passenger Network Effect:</strong> Represents
                        how much additional value passengers derive from an airport as more flights are added. Positive
                        values indicate increasing returns to scale.
                    </p>
                    <p>
                        The visualization helps understand how different economic parameters affect total welfare, profits,
                        and consumer surplus across major US airports.
                    </p>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="Ramsey Ports"
            subtitle="welfare economics of airport pricing strategies"
            description={
                <a
                    href="https://www.tse-fr.eu/sites/default/files/TSE/documents/doc/wp/2015/wp_tse_587.pdf"
                    target="_blank"
                >
                    2015, Marc Ivaldi et al., Airport Prices in a Two-Sided Market Setting
                </a>
            }
            sections={sections}
            settings={
                <Settings
                    selectedAirport={selectedAirport}
                    ramseyLambda={ramseyLambda}
                    networkEffect={networkEffect}
                    onAirportChange={setSelectedAirport}
                    onRamseyLambdaChange={setRamseyLambda}
                    onNetworkEffectChange={setNetworkEffect}
                    onReset={handleReset}
                    onExport={handleExport}
                />
            }
        />
    );
}