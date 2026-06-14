'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';

import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import ModelChangelog from '@/components/ModelChangelog';
import ResearchPromptButton from '@/components/ResearchPromptButton';
import Equation from '@/components/Equation';
import { PlaygroundSourceContext } from '@/lib/readPlaygroundSource';

import Settings from './components/Settings';
import Viewer from './components/Viewer';
import { TissueGridHandle } from './components/TissueGrid';
import {
    DEFAULT_PARAMS,
    Params,
    PresetKey,
    Snapshot,
    TEMPLATE_LABELS,
    blankMetrics,
    computeNarrative,
    computeSweep,
    presetParams,
} from './logic';
import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';


interface Props {
    sourceContext?: PlaygroundSourceContext;
}


export default function ArithmeticDynamicsPlayground({ sourceContext }: Props) {
    const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
    const [metrics, setMetrics] = useState(blankMetrics());
    const [preset, setPreset] = useState<PresetKey>('recover');
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

    const gridRef = useRef<TissueGridHandle>(null);

    const narrative = useMemo(() => computeNarrative(metrics, params), [metrics, params]);
    const sweep = useMemo(
        () => computeSweep(params),
        // sweep varies memory, so it only depends on the other field params.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [params.diffusion, params.gain, params.template],
    );
    const calibration = useMemo(() => buildCalibration(), []);

    const onPreset = useCallback((key: PresetKey) => {
        setPreset(key);
        setParams((p) => presetParams(key, p.template));
    }, []);

    const saveSnapshot = useCallback(() => {
        setSnapshot({ params, metrics, label: TEMPLATE_LABELS[params.template] });
    }, [params, metrics]);

    const clearSnapshot = useCallback(() => setSnapshot(null), []);

    const onSeed = useCallback(() => gridRef.current?.seed(), []);
    const onLesion = useCallback(() => gridRef.current?.lesion(), []);
    const onRandomize = useCallback(() => gridRef.current?.randomize(), []);
    const onImprint = useCallback(() => gridRef.current?.imprint(), []);

    const sections: PlaygroundSection[] = [
        { id: 'intro', type: 'intro' },
        {
            id: 'canvas',
            type: 'canvas',
            content: (
                <PlaygroundViewer>
                    <Viewer
                        params={params}
                        metrics={metrics}
                        sweep={sweep}
                        calibration={calibration}
                        assumptions={assumptions}
                        versions={versions}
                        gridRef={gridRef}
                        onMetrics={setMetrics}
                    />
                </PlaygroundViewer>
            ),
        },
        {
            id: 'outro',
            type: 'outro',
            content: (
                <div className="space-y-8 text-gray-300">
                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">One move, three literatures</h3>
                        <p className="leading-relaxed text-sm">
                            Arithmetic dynamics, evolutionary learning, and bioelectric morphogenesis all describe form as the
                            destination of an iterated update on a structured state space. Joseph Silverman&apos;s dictionary
                            sends torsion points to periodic and preperiodic points; Richard Watson&apos;s evolution-as-learning
                            sends past selection to developmental attractors; Michael Levin&apos;s target morphology is a stored
                            setpoint a tissue relaxes back toward. The common denominator is not form in a mystical sense, but the
                            tractable fact that iterated systems can acquire privileged regions of state space that behave like
                            memories, goals, or destinies.
                        </p>
                        <div className="border-l-2 border-lime-500/40 pl-4 mt-3">
                            <p className="text-lime-200/80 text-sm">
                                The strong, defensible claim is shared dynamical structure. The leap from there to &ldquo;biology
                                downloads pre-existing Platonic forms&rdquo; is a separate, speculative interpretation, and this
                                playground keeps the two apart.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">What the toy actually is</h3>
                        <p className="leading-relaxed text-sm">
                            A tissue is a grid of cells with a continuous internal state. A low-rank associative memory pulls the
                            field toward three orthonormalised stored morphologies, while local diffusion couples neighbours.
                            With symmetric coupling the deterministic dynamics descend a Lyapunov energy:
                        </p>
                        <div className="my-3">
                            <Equation
                                mode="block"
                                math="E = -\tfrac{\alpha}{2}\sum_k \langle p_k, y\rangle^2 + \tfrac{D}{2}\sum_{\langle i,j\rangle}(y_i - y_j)^2"
                            />
                        </div>
                        <p className="leading-relaxed text-sm">
                            Stored morphologies are the minima. A lesion pushes the state up a hill; if memory is above the
                            retrieval threshold, the same memory rolls it back down and the form regenerates. The calibration
                            panel measures that repair fidelity, and is honest about the rigid regime where a lesion leaves a
                            frozen scar instead.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Orbit is not attractor</h3>
                        <p className="leading-relaxed text-sm">
                            The sharpest caution is the one Silverman makes about his own field: there is a powerful dictionary,
                            but &ldquo;no precise dictionary.&rdquo; An arithmetic periodic point is exact, discrete, and
                            noise-free; a biological attractor is approximate, dissipative, history-sensitive, and only
                            metastable. Turn up the noise slider and the basin shimmers: it was never a fixed point. The analogy
                            is a source of structure and discipline, not a proof that the same object lives in both worlds.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">What it is not</h3>
                        <p className="leading-relaxed text-sm">
                            This is a transparent sandbox for the shared attractor logic, not a validated regenerative simulator.
                            It omits mechanics, gene regulation, and electrophysiology; the templates and weights are hand-chosen;
                            and mainstream accounts (positional information, reaction-diffusion, mechanochemistry) already explain
                            much of the same patterning without invoking stored memories. There is no clean deterministic
                            parameter-to-scalar map for a live stochastic field, so there is no tornado chart here; the sweep and
                            the calibration carry the quantitative weight instead.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Model changelog</h3>
                        <ModelChangelog entries={changelog} />
                    </div>

                    {sourceContext && (
                        <div className="border-t border-lime-500/20 pt-8">
                            <ResearchPromptButton context={sourceContext} />
                        </div>
                    )}
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="arithmetic dynamics"
            subtitle="stored morphologies as attractors of a tissue that remembers"
            description={
                <a
                    href="https://doi.org/10.1016/j.tree.2015.11.009"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Watson and Szathmary, How can evolution learn? (2016)
                </a>
            }
            sections={sections}
            settings={
                <Settings
                    params={params}
                    onParamsChange={setParams}
                    metrics={metrics}
                    narrative={narrative}
                    preset={preset}
                    onPreset={onPreset}
                    snapshot={snapshot}
                    onSaveSnapshot={saveSnapshot}
                    onClearSnapshot={clearSnapshot}
                    onSeed={onSeed}
                    onLesion={onLesion}
                    onRandomize={onRandomize}
                    onImprint={onImprint}
                />
            }
            researchUrl="/playgrounds/arithmetic-dynamics/research"
        />
    );
}
