'use client';

import { useRef } from 'react';
import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import Settings from './components/Settings';
import Viewer from './components/Viewer';

export interface ViewerRef {
    updateSimulation: (params: SimulationParams) => void;
    reset: () => void;
}

export interface SimulationParams {
    g_gaba: number;    // GABA_A gain (0..2)
    g_nmda: number;    // NMDA conductance (0..1.5)
    g_k2p: number;     // K2P leak (0..2)
    thalamus: number;  // Thalamic drive (0..1)
    couple: number;    // Long-range coupling (0..0.5)
    noise: number;     // Noise std (0..0.1)
}

export default function Playground() {
    const viewerRef = useRef<ViewerRef>(null);

    const handleParamsChange = (params: SimulationParams) => {
        viewerRef.current?.updateSimulation(params);
    };

    const handleReset = () => {
        viewerRef.current?.reset();
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
                        <h4 className="text-lime-400 font-semibold mb-2">Network Regime Model</h4>
                        <p className="text-gray-300">
                            This mean-field simulator models unconscious processing as a network regime shaped by
                            ion-channel modulation and subthreshold coordination. Two coupled cortical nodes (E1, E2)
                            interact through excitatory, inhibitory, and adaptive dynamics, modulated by molecular-scale
                            parameters that map to GABAergic inhibition, NMDA-dependent persistence, and leak conductances.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Molecular Control Parameters</h4>
                        <p className="text-gray-300">
                            GABA_A gain strengthens inhibition, reducing ignition probability. K2P leak channels
                            hyperpolarize neurons, lowering gain and integration capacity. NMDA conductance promotes
                            local persistence and plateau potentials. Thalamic drive provides background excitation,
                            while long-range coupling enables distributed integration between cortical nodes.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Access Probability Metric</h4>
                        <p className="text-gray-300">
                            The access probability metric serves as a heuristic proxy for global ignition—the sustained,
                            synchronized activity across cortical regions associated with conscious access. It measures
                            the fraction of temporal windows where both nodes maintain high excitatory activity
                            (&gt;0.65) for &gt;120ms while exhibiting significant synchrony (r &gt; 0.25). This captures
                            the core requirement for reportable consciousness: sustained, coupled, long-range integration.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Methodological Notes</h4>
                        <p className="text-gray-300">
                            This is a pedagogical toy model implementing discrete-time Euler integration of coupled
                            mean-field equations. Real cortical dynamics involve thousands of neuronal types, complex
                            dendritic computation, glial modulation, and spatiotemporal patterns far richer than
                            captured here. The model trades biophysical fidelity for conceptual clarity, mapping
                            molecular-scale knobs (ion channels) to macroscopic metrics (slow-wave frequency,
                            synchrony) through intermediate population dynamics. Results illustrate qualitative
                            tendencies rather than quantitative predictions.
                        </p>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="subconscious state space"
            description="exploring molecular-scale control of conscious access through neural dynamics simulation"
            sections={sections}
            settings={<Settings onParamsChange={handleParamsChange} onReset={handleReset} />}
        />
    );
}
