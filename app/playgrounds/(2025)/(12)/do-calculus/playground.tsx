'use client';

import { useRef, useState } from 'react';
import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import Equation from '@/components/Equation';
import VersionSelector from '@/components/VersionSelector';
import CalibrationPanel from '@/components/CalibrationPanel';
import AssumptionPanel from '@/components/AssumptionPanel';
import ModelChangelog from '@/components/ModelChangelog';
import { TemplateName, EffectRow } from './logic';
import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';

export interface ViewerRef {
    updateParams: (params: SimulationParams) => void;
    runNatural: () => void;
    runDo: () => void;
    computeEffects: () => void;
    computeGrangerTE: () => void;
    getNodes: () => string[];
    getResults: () => AnalysisResults;
}

export interface SimulationParams {
    template: TemplateName;
    dtMs: number;
    durationMs: number;
    seed: number;
    delayMs: number;
    clampNodeId: string;
    clampValue: 0 | 1;
    running: boolean;
    showRaster: boolean;
    showEffects: boolean;
    showTE: boolean;
    showGranger: boolean;
}

export interface AnalysisResults {
    effects: EffectRow[];
    granger: EffectRow[];
    te: EffectRow[];
}

export default function Playground() {
    const viewerRef = useRef<ViewerRef>(null);
    const [nodeOptions, setNodeOptions] = useState<string[]>(['N0', 'N1', 'N2']);
    const calibration = buildCalibration();

    const handleParamsChange = (params: SimulationParams) => {
        viewerRef.current?.updateParams(params);
        // Update node options based on template
        setTimeout(() => {
            const nodes = viewerRef.current?.getNodes();
            if (nodes) setNodeOptions(nodes);
        }, 0);
    };

    const handleRunNatural = () => {
        viewerRef.current?.runNatural();
    };

    const handleRunDo = () => {
        viewerRef.current?.runDo();
    };

    const handleComputeEffects = () => {
        viewerRef.current?.computeEffects();
    };

    const handleComputeGrangerTE = () => {
        viewerRef.current?.computeGrangerTE();
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
                        <h3 className="text-lime-400 font-semibold mb-3">Pearl&apos;s Do-Calculus</h3>
                        <p className="leading-relaxed text-sm">
                            Judea Pearl&apos;s do-calculus provides a formal framework for causal inference.
                            The <Equation math="\text{do}(X=x)" /> operator represents an intervention, physically
                            setting a variable to a value, which differs from mere observation.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Causal Effect</h3>
                        <p className="leading-relaxed text-sm mb-3">
                            The average causal effect of X on Y is defined as:
                        </p>
                        <Equation mode="block" math="\Delta P = P(Y=1 \mid \text{do}(X=1)) - P(Y=1 \mid \text{do}(X=0))" />
                        <p className="leading-relaxed text-sm mt-3">
                            Unlike conditional probability <Equation math="P(Y|X)" />, the interventional
                            probability <Equation math="P(Y|\text{do}(X))" /> accounts for confounders by
                            surgically removing incoming edges to X.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Backdoor Adjustment</h3>
                        <p className="leading-relaxed text-sm mb-3">
                            When a confounder U is a sufficient adjustment set, the interventional
                            distribution is identified by summing over U weighted by its prior:
                        </p>
                        <Equation mode="block" math="P(Y=1 \mid \text{do}(X=x)) = \sum_u P(Y=1 \mid X=x, U=u)\, P(U=u)" />
                        <p className="leading-relaxed text-sm mt-3">
                            The naive conditional instead weights by the X-conditioned posterior
                            <Equation math="P(U=u \mid X=x)" />, so the two coincide only when X has no
                            open backdoor path. Their difference is confounding bias.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Structural Causal Models</h3>
                        <p className="leading-relaxed text-sm">
                            An SCM consists of a directed acyclic graph (DAG) where each node X has a
                            structural equation <Equation math="X := f_X(\text{PA}_X, U_X)" />, where
                            PA<sub>X</sub> are X&apos;s parents and U<sub>X</sub> is exogenous noise.
                            Interventions replace f<sub>X</sub> with a constant assignment.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Synergy and Coincidence Detection</h3>
                        <p className="leading-relaxed text-sm mb-3">
                            Synergistic causation occurs when the joint effect exceeds individual effects:
                        </p>
                        <Equation mode="block" math="\text{Synergy} = P(Y \mid \text{do}(A=1,B=1)) - \max\{P(Y \mid \text{do}(A=1)), P(Y \mid \text{do}(B=1))\}" />
                        <p className="leading-relaxed text-sm mt-3">
                            This captures coincidence detectors in neural circuits, where two inputs must
                            arrive simultaneously to trigger an output.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Transfer Entropy</h3>
                        <p className="leading-relaxed text-sm mb-3">
                            Transfer entropy measures directed information flow from X to Y:
                        </p>
                        <Equation mode="block" math="TE_{X \to Y} = \sum_{y_1, y_0, x_0} p(y_1, y_0, x_0) \log_2 \frac{p(y_1 | y_0, x_0)}{p(y_1 | y_0)}" />
                        <p className="leading-relaxed text-sm mt-3">
                            Unlike causal effects, TE measures predictive information. X may predict Y even
                            without causing it, for example via a common confounder.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Granger Causality</h3>
                        <p className="leading-relaxed text-sm">
                            Granger causality tests whether past values of X improve prediction of Y beyond
                            Y&apos;s own history. It is a predictive measure, not truly causal, and it can be
                            confounded by latent variables. Comparing Granger with interventional effects
                            reveals where prediction and causation diverge.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Confounders</h3>
                        <p className="leading-relaxed text-sm">
                            A confounder U causes both X and Y, creating spurious association. Observational
                            measures such as Granger and TE may falsely suggest X causes Y, while interventional
                            effects correctly show no direct causation. The confounder template demonstrates
                            this: U drives X and U drives Y, but do(X) does not affect Y.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Spike-Based Simulation</h3>
                        <p className="leading-relaxed text-sm">
                            The simulation models spiking neurons with Poisson baseline firing rates.
                            Synaptic connections add probability of firing after a delay. Coincidence
                            detectors (synergy edges) fire when multiple inputs arrive simultaneously, a
                            biologically realistic mechanism for supralinear integration. These sampled
                            estimates are illustrative and will vary from run to run.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Comparing Methods</h3>
                        <p className="leading-relaxed text-sm">
                            This playground lets you compare three approaches:
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                            <li><strong>ΔP_do</strong>: true causal effect via intervention</li>
                            <li><strong>TE</strong>: directed predictive information (information-theoretic)</li>
                            <li><strong>Granger</strong>: predictive improvement (regression-based)</li>
                        </ul>
                        <p className="leading-relaxed text-sm mt-3">
                            Edges detected by prediction but not intervention suggest confounding.
                            Edges detected by intervention but not prediction suggest weak but real causes.
                        </p>
                    </div>

                    <div className="border-t border-lime-500/20 pt-8 space-y-8">
                        <VersionSelector versions={versions} active="claude-v1" />
                        <CalibrationPanel results={calibration} outputLabel="probability" />
                        <AssumptionPanel assumptions={assumptions} />
                        <ModelChangelog entries={changelog} />
                    </div>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="do-calculus"
            subtitle="causal inference on structural models"
            description="Judea Pearl's interventional framework for spiking neurons"
            sections={sections}
            researchUrl="/playgrounds/do-calculus/research"
            settings={
                <Settings
                    onParamsChange={handleParamsChange}
                    onRunNatural={handleRunNatural}
                    onRunDo={handleRunDo}
                    onComputeEffects={handleComputeEffects}
                    onComputeGrangerTE={handleComputeGrangerTE}
                    nodeOptions={nodeOptions}
                />
            }
        />
    );
}
