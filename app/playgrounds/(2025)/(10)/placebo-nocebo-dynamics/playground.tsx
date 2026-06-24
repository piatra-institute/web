'use client';

import { useRef } from 'react';
import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import VersionSelector from '@/components/VersionSelector';
import CalibrationPanel from '@/components/CalibrationPanel';
import AssumptionPanel from '@/components/AssumptionPanel';
import ModelChangelog from '@/components/ModelChangelog';
import Equation from '@/components/Equation';

import Settings from './components/Settings';
import Viewer from './components/Viewer';
import { SimulationParams } from './logic';
import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';

export interface ViewerRef {
    updateSimulation: (params: SimulationParams) => void;
    reset: () => void;
}

export default function Playground() {
    const viewerRef = useRef<ViewerRef>(null);

    const calibration = buildCalibration();

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
                <PlaygroundViewer>
                    <Viewer ref={viewerRef} />
                </PlaygroundViewer>
            ),
        },
        {
            id: 'outro',
            type: 'outro',
            content: (
                <div className="space-y-8 text-gray-300">
                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Precision-weighted prediction</h3>
                        <p className="leading-relaxed text-sm">
                            The model implements a precision-weighted integration of prior expectations and sensory
                            evidence within a predictive coding framework. The prior weight{' '}
                            <Equation math="w = \frac{\Pi_p}{\Pi_p + \Pi_y}" />
                            {' '}determines the relative influence of top-down predictions versus bottom-up sensory input.
                            When prior precision dominates, contextual cues exert stronger control over pain perception;
                            when sensory precision dominates (elevated by attention), actual nociceptive input determines
                            outcomes. This precision balance mechanistically accounts for individual differences in
                            placebo and nocebo susceptibility and the attention-dependence of these effects.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Pharmacological pathways</h3>
                        <p className="leading-relaxed text-sm">
                            Placebo analgesia recruits two parallel pathways. The first is mu-opioid receptor-mediated
                            endogenous opioid release, responsible for rapid analgesic effects and reversible by naloxone.
                            The second is CB1 cannabinoid receptor activation, which requires conditioning and is blocked
                            by rimonabant. The conditioning parameter gates the CB1 pathway, reflecting learned
                            associations between contextual cues and analgesic outcomes. Nocebo hyperalgesia operates
                            through cholecystokinin (CCK) signaling, which facilitates pain transmission and is
                            antagonized by proglumide. The cue-drug similarity axis spans from strong nocebo-like cues at
                            minus one, through neutral contexts at zero, to strong drug-like cues at plus one, with
                            pathway activation scaling with positive or negative similarity.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Saturating nonlinearity and net effect</h3>
                        <p className="text-lime-200/80 mb-2">
                            Each pathway undergoes a saturating nonlinear transformation{' '}
                            <Equation math="\frac{x}{1+|x|}" />
                            , preventing unbounded responses and capturing the biological ceiling and floor effects
                            observed in pain modulation.
                        </p>
                        <p className="leading-relaxed text-sm">
                            The net signed output combines analgesia (positive) and hyperalgesia (negative), yielding a
                            continuous landscape from maximum pain enhancement, through neutral, to maximum pain
                            suppression. The model exhibits a crossover at neutral cues, regions of dominance for each
                            pathway, and the pharmacological dissection achievable through selective antagonists.
                            Attention amplifies sensory precision, shifting the balance toward bottom-up processing and
                            reducing prior-driven placebo and nocebo effects.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Methodological notes</h3>
                        <p className="leading-relaxed text-sm">
                            The simulation employs a simplified linear-saturating architecture that captures qualitative
                            pathway interactions while omitting descending pain modulation circuits, spinal mechanisms,
                            neuroinflammatory signaling, and temporal dynamics. Real placebo and nocebo responses involve
                            prefrontal, periaqueductal gray, and rostral ventromedial medulla loops, glial modulation,
                            and learning-dependent synaptic plasticity not represented here. Pathway strength parameters
                            are pedagogical rather than fitted to empirical dose-response curves. The model serves to
                            illustrate how precision weighting, multi-pathway summation, and pharmacological dissection
                            combine to produce the characteristic biphasic placebo-nocebo landscape observed in clinical
                            and experimental settings.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Implementation provenance</h3>
                        <VersionSelector versions={versions} active="claude-v1" />
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Calibration</h3>
                        <CalibrationPanel results={calibration} outputLabel="signed effect / prior weight" />
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Assumptions</h3>
                        <AssumptionPanel assumptions={assumptions} />
                    </div>

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
            title="placebo-nocebo dynamics"
            description="precision-weighted prediction model of placebo analgesia and nocebo hyperalgesia"
            sections={sections}
            settings={<Settings onParamsChange={handleParamsChange} onReset={handleReset} />}
            researchUrl="/playgrounds/placebo-nocebo-dynamics/research"
        />
    );
}
