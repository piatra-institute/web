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
    priorPrecision: number;
    sensoryPrecision: number;
    attention: number;
    rOpioid: number;
    rCB1: number;
    rCCK: number;
    conditioning: number;
    naloxone: number;
    rimonabant: number;
    proglumide: number;
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
                        <h4 className="text-lime-400 font-semibold mb-2">Precision-Weighted Prediction Model</h4>
                        <p className="text-gray-300">
                            The model implements a precision-weighted integration of prior expectations and sensory
                            evidence within a predictive coding framework. The prior weight w = Π_p / (Π_p + Π_y)
                            determines the relative influence of top-down predictions versus bottom-up sensory input.
                            When prior precision dominates, contextual cues exert stronger control over pain perception;
                            when sensory precision dominates (elevated by attention), actual nociceptive input determines
                            outcomes. This precision balance mechanistically accounts for individual differences in
                            placebo/nocebo susceptibility and the attention-dependence of these effects.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Pharmacological Pathways</h4>
                        <p className="text-gray-300">
                            Placebo analgesia recruits two parallel pathways: (1) μ-opioid receptor-mediated endogenous
                            opioid release, responsible for rapid analgesic effects and reversible by naloxone; (2)
                            CB1 cannabinoid receptor activation, which requires conditioning and is blocked by rimonabant.
                            The conditioning parameter gates the CB1 pathway, reflecting learned associations between
                            contextual cues and analgesic outcomes. Nocebo hyperalgesia operates through cholecystokinin
                            (CCK) signaling, which facilitates pain transmission and is antagonized by proglumide. The
                            cue-drug similarity axis spans from strong nocebo-like cues (-1) through neutral contexts (0)
                            to strong drug-like cues (+1), with pathway activation scaling proportionally to positive or
                            negative similarity.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Saturating Nonlinearity and Net Effect</h4>
                        <p className="text-gray-300">
                            Each pathway undergoes saturating nonlinear transformation x/(1+|x|), preventing unbounded
                            responses and capturing the biological ceiling/floor effects observed in pain modulation.
                            The net signed output combines analgesia (positive) and hyperalgesia (negative), yielding a
                            continuous landscape from maximum pain enhancement through neutral to maximum pain suppression.
                            The model predicts crossover points where opposing mechanisms balance, regions of dominance for
                            each pathway, and the pharmacological dissection achievable through selective antagonists.
                            Attention amplifies sensory precision, shifting the balance toward bottom-up processing and
                            reducing prior-driven placebo/nocebo effects.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Methodological Notes</h4>
                        <p className="text-gray-300">
                            The simulation employs a simplified linear-saturating architecture that captures qualitative
                            pathway interactions while omitting descending pain modulation circuits, spinal mechanisms,
                            neuroinflammatory signaling, and temporal dynamics. Real placebo/nocebo responses involve
                            prefrontal-periaqueductal gray-rostral ventromedial medulla loops, glial modulation, and
                            learning-dependent synaptic plasticity not represented here. Pathway strength parameters are
                            pedagogical rather than fitted to empirical dose-response curves. The model serves to
                            illustrate how precision weighting, multi-pathway summation, and pharmacological dissection
                            combine to produce the characteristic biphasic placebo-nocebo landscape observed in clinical
                            and experimental settings.
                        </p>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="placebo-nocebo dynamics"
            description="precision-weighted prediction model of placebo analgesia and nocebo hyperalgesia"
            sections={sections}
            settings={<Settings onParamsChange={handleParamsChange} onReset={handleReset} />}
        />
    );
}
