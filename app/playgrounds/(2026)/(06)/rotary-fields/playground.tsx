'use client';

import React, { useCallback, useMemo, useState } from 'react';

import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import ModelChangelog from '@/components/ModelChangelog';
import ResearchPromptButton from '@/components/ResearchPromptButton';
import { PlaygroundSourceContext } from '@/lib/readPlaygroundSource';

import Settings from './components/Settings';
import Viewer from './components/Viewer';
import {
    DEFAULT_PARAMS,
    Params,
    Snapshot,
    SweepableField,
    computeNarrative,
    computeSensitivity,
    computeSweep,
    generateReading,
    runSimulation,
    scoreModel,
} from './logic';
import { assumptions } from './assumptions';
import { calibrationCases } from './calibration';
import { versions, changelog } from './versions';


interface Props {
    sourceContext?: PlaygroundSourceContext;
}


export default function RotaryFieldsPlayground({ sourceContext }: Props) {
    const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
    const [sweepField, setSweepField] = useState<SweepableField>('base');

    const simulation = useMemo(() => runSimulation(params), [params]);
    const metrics = simulation.metrics;
    const narrative = useMemo(() => computeNarrative(params, metrics), [params, metrics]);
    const reading = useMemo(() => generateReading(params, metrics), [params, metrics]);
    const sweep = useMemo(() => computeSweep(params, sweepField), [params, sweepField]);
    const sensitivityBars = useMemo(() => computeSensitivity(params), [params]);

    const calibrationResults = useMemo(
        () =>
            calibrationCases.map((c) => ({
                name: c.name,
                description: c.description,
                predicted: Number((scoreModel(c.params).concentration * 100).toFixed(1)),
                expected: c.expectedConcentration,
                source: c.source,
            })),
        [],
    );

    const saveSnapshot = useCallback(() => {
        const { metrics: m, ...result } = simulation;
        setSnapshot({
            params,
            metrics: m,
            result,
            label: params.preset,
        });
    }, [params, simulation]);

    const clearSnapshot = useCallback(() => setSnapshot(null), []);

    const randomize = useCallback(() => {
        setParams((p) => ({ ...p, seed: Math.floor(Math.random() * 1_000_000) }));
    }, []);

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
                        result={simulation}
                        snapshot={snapshot}
                        reading={reading}
                        sweepField={sweepField}
                        onSweepFieldChange={setSweepField}
                        sweep={sweep}
                        sensitivityBars={sensitivityBars}
                        calibration={calibrationResults}
                        assumptions={assumptions}
                        versions={versions}
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
                        <h3 className="text-lime-400 font-semibold mb-3">Position as angle</h3>
                        <p className="leading-relaxed text-sm">
                            The trick that powers RoPE is that you can encode a token&apos;s
                            position by rotating its query and key vectors. Because rotations
                            compose, the rotation at position i and the rotation at position j
                            cancel, on the dot product, into a single rotation by j − i. The
                            score depends on the offset, not on i and j separately. Transformers
                            get relative-position attention without storing a relative-position
                            table.
                        </p>
                        <div className="border-l-2 border-lime-500/40 pl-4 mt-3">
                            <p className="text-lime-200/80 text-sm">
                                A relative displacement can be represented as an angular
                                displacement. That is the move.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The neural cousin</h3>
                        <p className="leading-relaxed text-sm">
                            In the hippocampus, place cells fire in a particular region of
                            space, but they do not only encode position by firing rate. As the
                            animal moves through a place field, the cell fires at progressively
                            earlier phases of the theta rhythm. That is theta phase precession,
                            O&apos;Keefe and Recce 1993. Position becomes phase. Relative
                            position becomes phase difference. The substrate is biophysical, the
                            mechanism has nothing to do with matrix multiplication, but the
                            geometric move is the same as RoPE&apos;s.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Three sides of the same idea</h3>
                        <p className="leading-relaxed text-sm">
                            Multiple oscillations at different scales can interfere into a
                            stable spatial pattern: a grid-like lattice. This is one of the
                            classical models of entorhinal grid cells, and it is the third
                            shape of the same idea: a small number of phases can carry a lot of
                            spatial structure if you compose them right. RoPE&apos;s frequency
                            ladder is the engineered version of the same principle.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The five presets</h3>
                        <p className="leading-relaxed text-sm">
                            Five presets traverse the design space. A LLaMA-style baseline.
                            A long-range head with high base and many pairs. A short-context
                            head with low base and few pairs, sharply localised. An
                            extrapolation regime where the sequence outruns the longest
                            wavelength. A neural-phase preset that pushes the phase slope to
                            360°, matching the O&apos;Keefe-Recce range. The calibration table
                            checks whether the toy attention concentration matches the
                            canonical regime for each preset.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">What this playground is and is not</h3>
                        <p className="leading-relaxed text-sm">
                            This is a sketch, not a transformer simulator. There is no softmax,
                            no value projection, no multi-head averaging, no training. Content
                            vectors are random rather than meaningful. The point is to make the
                            position-rotation step legible: to show that RoPE is a clean
                            engineering move that has a messy biological cousin, and that what
                            they share is geometry, not implementation.
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
            title="rotary fields"
            subtitle="rotary attention and neural phase coding share one move: position as angle"
            description={
                <a
                    href="https://arxiv.org/abs/2104.09864"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Su et al. 2021, RoFormer: Enhanced Transformer with Rotary Position Embedding
                </a>
            }
            sections={sections}
            settings={
                <Settings
                    params={params}
                    onParamsChange={setParams}
                    metrics={metrics}
                    narrative={narrative}
                    snapshot={snapshot}
                    onSaveSnapshot={saveSnapshot}
                    onClearSnapshot={clearSnapshot}
                    onRandomize={randomize}
                />
            }
        />
    );
}
