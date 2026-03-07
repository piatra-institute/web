'use client';

import React, { useState, useMemo } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Equation from '@/components/Equation';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import {
    Params,
    presetParams,
    simulate,
    inferNarrative,
    computeStats,
} from './logic';

export default function TrainableGeneCircuitsPlayground() {
    const [params, setParams] = useState<Params>(() => presetParams('associative'));

    const { data, phases } = useMemo(() => simulate(params), [params]);
    const narrative = useMemo(() => inferNarrative(data, params), [data, params]);
    const stats = useMemo(() => computeStats(data, params), [data, params]);

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
        },
        {
            id: 'canvas',
            type: 'canvas' as const,
            content: (
                <PlaygroundViewer>
                    <Viewer
                        data={data}
                        phases={phases}
                        narrative={narrative}
                        stats={stats}
                    />
                </PlaygroundViewer>
            ),
        },
        {
            id: 'outro',
            type: 'outro' as const,
            content: (
                <div className="space-y-8 text-gray-300">
                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">GRNs as Dynamical Systems</h3>
                        <p className="leading-relaxed text-sm">
                            A gene regulatory network is a dynamical system on expression space. Each gene product&apos;s concentration{' '}
                            <Equation math="x_i" /> evolves according to a nonlinear ODE:
                        </p>
                        <Equation
                            mode="block"
                            math="\dot{x}_i = f_i(x_1, \dots, x_n, u) - \gamma_i x_i"
                        />
                        <p className="leading-relaxed text-sm mt-3">
                            where <Equation math="f_i" /> encodes regulatory inputs (activation and repression via Hill functions) and{' '}
                            <Equation math="\gamma_i x_i" /> is degradation. Cell types are modeled as stable attractors of this system.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Hill Function Regulation</h3>
                        <p className="leading-relaxed text-sm mb-3">
                            Activation and repression use saturating Hill functions:
                        </p>
                        <Equation
                            mode="block"
                            math="f_{\text{act}}(A) = \beta \frac{A^n}{K^n + A^n} \qquad f_{\text{rep}}(C) = \beta \frac{K^n}{K^n + C^n}"
                        />
                        <p className="leading-relaxed text-sm mt-3">
                            The Hill coefficient <Equation math="n" /> controls switch-like sharpness. Higher <Equation math="n" /> gives a more digital response. The threshold <Equation math="K" /> sets the inflection point.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Associative Learning in GRNs</h3>
                        <p className="leading-relaxed text-sm mb-3">
                            Following Levin and Fernando, the associative circuit uses a slow memory variable <Equation math="C" /> that integrates co-stimulation:
                        </p>
                        <Equation
                            mode="block"
                            math="\dot{p} = f_p(w_1, w_2, u_1, u_2) - \delta_p \, p"
                        />
                        <Equation
                            mode="block"
                            math="\dot{w}_2 = f_2(p, u_2) - \delta_w \, w_2"
                        />
                        <p className="leading-relaxed text-sm mt-3">
                            The crucial feature: <Equation math="w_2" /> is a slow state variable that stores the effect of prior co-stimulation. After training, a formerly weak cue can drive the response. This is the biochemical analog of a synaptic weight.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Three Memory Regimes</h3>
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li>
                                <span className="text-lime-400">Associative trace</span>: a slow variable retains history of co-stimulation. Later, a weak cue triggers the trained response. Learning = threshold crossing into a new basin.
                            </li>
                            <li>
                                <span className="text-lime-400">Toggle / bistable attractor</span>: mutual repression with self-activation creates two stable states. Memory = which basin the system occupies after a transient pulse.
                            </li>
                            <li>
                                <span className="text-lime-400">Oscillatory memory</span>: a repressilator-style loop stores state in phase and amplitude rather than a fixed point. Memory = persistent dynamical regime.
                            </li>
                        </ul>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Notes</h3>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>Simulation uses fourth-order Runge-Kutta (RK4) integration.</li>
                            <li>&ldquo;Learning&rdquo; here means history-dependent state change, not gradient descent on parameters.</li>
                            <li>The key insight: a GRN can exhibit memory, conditioning, and trainable behavior through the dynamics of its existing equations, without rewiring its topology.</li>
                            <li>Values are illustrative. Replace coupling weights and timing to test specific biological circuits.</li>
                        </ul>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="trainable gene circuits"
            subtitle="associative memory, bistable commitment, and oscillatory state in gene regulatory networks"
            description={
                <a
                    href="https://pmc.ncbi.nlm.nih.gov/articles/PMC9820177/"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    2022, Michael Levin et al., Learning in Transcriptional Network Models: Computational Discovery of Pathway-Level Memory and Effective Interventions
                </a>
            }
            sections={sections}
            settings={
                <Settings
                    params={params}
                    onParamsChange={setParams}
                    narrative={narrative}
                    stats={stats}
                />
            }
        />
    );
}
