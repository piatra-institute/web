'use client';

import { useRef } from 'react';
import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import Settings from './components/Settings';
import Viewer from './components/Viewer';

export interface ViewerRef {
    updateVisualization: (params: {
        srcRoot: number;
        srcMaj: boolean;
        dstRoot: number;
        dstMaj: boolean;
        maxPaths: number;
        rWeight: number;
        useFlats: boolean;
    }) => void;
}

export default function Playground() {
    const viewerRef = useRef<ViewerRef>(null);

    const handleSettingsChange = (params: {
        srcRoot: number;
        srcMaj: boolean;
        dstRoot: number;
        dstMaj: boolean;
        maxPaths: number;
        rWeight: number;
        useFlats: boolean;
    }) => {
        viewerRef.current?.updateVisualization(params);
    };

    const sections: PlaygroundSection[] = [
        {
            id: 'intro',
            type: 'intro',
        },
        {
            id: 'canvas',
            type: 'canvas',
            content: (
                <div className="w-full h-full flex items-center justify-center p-8">
                    <Viewer ref={viewerRef} />
                </div>
            ),
        },
        {
            id: 'outro',
            type: 'outro',
            content: (
                <div className="space-y-6">
                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">PLR Operations</h4>
                        <p className="text-gray-300">
                            <strong>P</strong>arallel: flips mode, preserves root & fifth (±1 semitone on 3rd)<br/>
                            <strong>L</strong>eittonwechsel: flips mode, preserves 3rd & 5th (±1 semitone on root)<br/>
                            <strong>R</strong>elative: flips mode, preserves root & 3rd (±2 semitones on 5th)
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Algebraic Structure</h4>
                        <p className="text-gray-300">
                            The PLR group is dihedral of order 24, acting simply transitively on major/minor triads.
                            Each operation is an involution (self-inverse), maximizing pitch-class intersection with
                            parsimonious voice leading. The group is dual to the T/I (transposition/inversion) group.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Harmony as Distance</h4>
                        <p className="text-gray-300">
                            The PLR metric measures harmonic distance as the shortest word length between triads.
                            This correlates with voice-leading economy—P and L move by semitone, R by whole tone.
                            Hexatonic cycles emerge from &lt;P,L&gt;, octatonic from &lt;R,P&gt;.
                        </p>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="plr-harmony"
            description="neo-Riemannian PLR transformations and triadic harmony"
            sections={sections}
            settings={<Settings onSettingsChange={handleSettingsChange} />}
        />
    );
}