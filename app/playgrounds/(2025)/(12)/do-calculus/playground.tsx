'use client';

import { useRef, useState } from 'react';
import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import Equation from '@/components/Equation';
import { TemplateName, EffectRow } from './logic';

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
                <div className="w-full h-full">
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
                        <h4 className="text-lime-400 font-semibold mb-2">Pearl&apos;s Do-Calculus</h4>
                        <p className="text-gray-300">
                            Judea Pearl&apos;s do-calculus provides a formal framework for causal inference.
                            The <Equation math="\text{do}(X=x)" /> operator represents an <em>intervention</em>—physically
                            setting a variable to a value, which differs from mere observation.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Causal Effect</h4>
                        <p className="text-gray-300 mb-3">
                            The average causal effect of X on Y is defined as:
                        </p>
                        <Equation mode="block" math="\Delta P = P(Y=1 \mid \text{do}(X=1)) - P(Y=1 \mid \text{do}(X=0))" />
                        <p className="text-gray-300 mt-3">
                            Unlike conditional probability <Equation math="P(Y|X)" />, the interventional
                            probability <Equation math="P(Y|\text{do}(X))" /> accounts for confounders by
                            &quot;surgically&quot; removing incoming edges to X.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Structural Causal Models</h4>
                        <p className="text-gray-300">
                            An SCM consists of a directed acyclic graph (DAG) where each node X has a
                            structural equation <Equation math="X := f_X(\text{PA}_X, U_X)" />, where
                            PA<sub>X</sub> are X&apos;s parents and U<sub>X</sub> is exogenous noise.
                            Interventions replace f<sub>X</sub> with a constant assignment.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Synergy and Coincidence Detection</h4>
                        <p className="text-gray-300 mb-3">
                            Synergistic causation occurs when the joint effect exceeds individual effects:
                        </p>
                        <Equation mode="block" math="\text{Synergy} = P(Y \mid \text{do}(A=1,B=1)) - \max\{P(Y \mid \text{do}(A=1)), P(Y \mid \text{do}(B=1))\}" />
                        <p className="text-gray-300 mt-3">
                            This captures coincidence detectors in neural circuits—when two inputs must
                            arrive simultaneously to trigger an output.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Transfer Entropy</h4>
                        <p className="text-gray-300 mb-3">
                            Transfer entropy measures directed information flow from X to Y:
                        </p>
                        <Equation mode="block" math="TE_{X \to Y} = \sum_{y_1, y_0, x_0} p(y_1, y_0, x_0) \log_2 \frac{p(y_1 | y_0, x_0)}{p(y_1 | y_0)}" />
                        <p className="text-gray-300 mt-3">
                            Unlike causal effects, TE measures predictive information—X may predict Y even
                            without causing it (e.g., via a common confounder).
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Granger Causality</h4>
                        <p className="text-gray-300">
                            Granger causality tests whether past values of X improve prediction of Y beyond
                            Y&apos;s own history. It&apos;s a predictive measure, not truly causal—it can be
                            confounded by latent variables. Comparing Granger with interventional effects
                            reveals where prediction and causation diverge.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Confounders</h4>
                        <p className="text-gray-300">
                            A confounder U causes both X and Y, creating spurious association. Observational
                            measures (Granger, TE) may falsely suggest X→Y, while interventional
                            effects correctly show no direct causation. The &quot;confounder&quot; template demonstrates
                            this: U→X and U→Y, but do(X) doesn&apos;t affect Y.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Spike-Based Simulation</h4>
                        <p className="text-gray-300">
                            The simulation models spiking neurons with Poisson baseline firing rates.
                            Synaptic connections add probability of firing after a delay. Coincidence
                            detectors (synergy edges) fire when multiple inputs arrive simultaneously—a
                            biologically realistic mechanism for supralinear integration.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Comparing Methods</h4>
                        <p className="text-gray-300">
                            This playground lets you compare three approaches:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
                            <li><strong>ΔP_do</strong>: True causal effect via intervention</li>
                            <li><strong>TE</strong>: Directed predictive information (information-theoretic)</li>
                            <li><strong>Granger</strong>: Predictive improvement (regression-based)</li>
                        </ul>
                        <p className="text-gray-300 mt-3">
                            Edges detected by prediction but not intervention suggest confounding.
                            Edges detected by intervention but not prediction suggest weak but real causes.
                        </p>
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
