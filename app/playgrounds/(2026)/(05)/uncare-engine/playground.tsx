'use client';

import React, { useState, useMemo, useCallback } from 'react';

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
    SweepableAxis,
    extractAxes,
    scoreModel,
    computeNarrative,
    computeSweep,
    computeSensitivity,
    generateReading,
} from './logic';
import { assumptions } from './assumptions';
import { calibrationCases } from './calibration';
import { versions, changelog } from './versions';


interface Props {
    sourceContext?: PlaygroundSourceContext;
}

export default function UncareEnginePlayground({ sourceContext }: Props) {
    const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
    const [sweepAxis, setSweepAxis] = useState<SweepableAxis>('load');

    const metrics = useMemo(() => scoreModel(params), [params]);
    const narrative = useMemo(() => computeNarrative(params, metrics), [params, metrics]);
    const reading = useMemo(() => generateReading(params, metrics), [params, metrics]);
    const sweep = useMemo(() => computeSweep(params, sweepAxis), [params, sweepAxis]);
    const sensitivityBars = useMemo(() => computeSensitivity(params), [params]);

    const calibrationResults = useMemo(
        () =>
            calibrationCases.map((c) => ({
                name: c.name,
                description: c.description,
                predicted: scoreModel(c.params).madness,
                expected: c.expectedWelfare,
                source: c.source,
            })),
        [],
    );

    const saveSnapshot = useCallback(() => {
        setSnapshot({
            params,
            metrics,
            axes: extractAxes(params),
            label: `${params.case} · ${params.preset}`,
        });
    }, [params, metrics]);

    const clearSnapshot = useCallback(() => setSnapshot(null), []);

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
                        snapshot={snapshot}
                        reading={reading}
                        sweepAxis={sweepAxis}
                        onSweepAxisChange={setSweepAxis}
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
                        <h3 className="text-lime-400 font-semibold mb-3">When care becomes accusation</h3>
                        <p className="leading-relaxed text-sm">
                            The more we discover that the world is morally saturated through
                            systems, materials, animals, labor, climate, maintenance, and
                            hidden dependencies, the more some people experience morality not
                            as orientation but as persecution. Their backlash is not mere
                            selfishness. It is a resentful project of uncare: an attempt to
                            free themselves from moral address by becoming proudly indifferent.
                        </p>
                        <div className="border-l-2 border-lime-500/40 pl-4 mt-3">
                            <p className="text-lime-200/80 text-sm">
                                The monster is not the person who fails to care about everything.
                                The monster is the person who turns the impossibility of caring
                                about everything into permission to care about nothing.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The six stages</h3>
                        <p className="leading-relaxed text-sm">
                            Ordinary moral load, moral saturation, defensive minimisation,
                            ressentiment switch, counter-moral inversion, monstrous uncare.
                            People rarely jump the wagon in a single move. They drift through
                            overload, shame, no-exit thinking, and tribal reward. The decisive
                            turn comes when care stops being a duty and starts being experienced
                            as domination. At that point, defending the indefensible becomes a
                            way to feel sovereign again.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">What the model is and is not</h3>
                        <p className="leading-relaxed text-sm">
                            The six-axis basis (load, shame, exit, tribe, inflation, isolation)
                            is a deliberate compression. The scoring formula has no time, no
                            biography, no political content. It is a comparative instrument,
                            not a predictive one. The domain choice frames the reading but does
                            not change the score; the configuration is the model. The
                            calibration table compares the model&apos;s emergent madness on each
                            domain&apos;s canonical profile to a reader-provided expected
                            madness. Close agreement means the model&apos;s shape matches a
                            careful reading of how that domain&apos;s uncare engine typically
                            runs. It does not mean the model has met any particular person.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Ten domains, one engine</h3>
                        <p className="leading-relaxed text-sm">
                            Veganism, climate, speech, politics, craft, institutions, migration,
                            maintenance, reputation, algorithm. Ten domains where the moral
                            object can be shrunk, the accusation can be inverted, and refusal
                            can become identity. The figures change; the engine does not.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Bounded care, not infinite guilt</h3>
                        <p className="leading-relaxed text-sm">
                            The model is not an argument that everyone should care about
                            everything. That is the configuration that produces breakdown. The
                            model is an argument that the path out of uncare is proportional,
                            agency-sensitive care, plus visible low-cost exits, plus private
                            correction channels that do not stage submission. Open the exits,
                            de-stage the shame, lower the inflation, and the engine slows.
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
            title="the uncare engine"
            subtitle="how moral saturation, ressentiment, and tribal reward push people from ordinary care to defending the indefensible"
            description={
                <a
                    href="https://plato.stanford.edu/entries/nietzsche-moral-political/"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Nietzsche on moral and political philosophy (SEP)
                </a>
            }
            sections={sections}
            researchUrl="/playgrounds/uncare-engine/research"
            settings={
                <Settings
                    params={params}
                    onParamsChange={setParams}
                    metrics={metrics}
                    narrative={narrative}
                    snapshot={snapshot}
                    onSaveSnapshot={saveSnapshot}
                    onClearSnapshot={clearSnapshot}
                />
            }
        />
    );
}
