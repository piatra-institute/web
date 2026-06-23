'use client';

import { useRef } from 'react';
import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import AssumptionPanel from '@/components/AssumptionPanel';
import CalibrationPanel from '@/components/CalibrationPanel';
import VersionSelector from '@/components/VersionSelector';
import ModelChangelog from '@/components/ModelChangelog';
import Settings from './components/Settings';
import Viewer from './components/Viewer';

import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';

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
    const calibration = buildCalibration();

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
                <PlaygroundViewer>
                    <Viewer ref={viewerRef} />
                </PlaygroundViewer>
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
                            This correlates with voice-leading economy: P and L move by semitone, R by whole tone.
                            Hexatonic cycles emerge from &lt;P,L&gt;, octatonic from &lt;R,P&gt;.
                        </p>
                    </div>

                    <div className="border-t border-lime-500/20 pt-6">
                        <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
                    </div>

                    <CalibrationPanel results={calibration} outputLabel="theory value" />

                    <AssumptionPanel assumptions={assumptions} />

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Model changelog</h3>
                        <ModelChangelog entries={changelog} />
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
            researchUrl="/playgrounds/plr-harmony/research"
        />
    );
}