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
    SweepableField,
    computeField,
    computeNarrative,
    computeSensitivity,
    computeSweep,
    comparativeRanking,
    generateReading,
    scoreModel,
} from './logic';
import { assumptions } from './assumptions';
import { calibrationCases } from './calibration';
import { versions, changelog } from './versions';


interface Props {
    sourceContext?: PlaygroundSourceContext;
}

export default function SalienceEnginePlayground({ sourceContext }: Props) {
    const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
    const [sweepField, setSweepField] = useState<SweepableField>('uncertainty');

    const field = useMemo(() => computeField(params), [params]);
    const focal = useMemo(
        () => field.find((s) => s.key === params.object) ?? field[0],
        [field, params.object],
    );
    const metrics = useMemo(() => scoreModel(params), [params]);
    const narrative = useMemo(() => computeNarrative(params, metrics), [params, metrics]);
    const reading = useMemo(() => generateReading(params, metrics), [params, metrics]);
    const ranking = useMemo(() => comparativeRanking(params), [params]);
    const sweep = useMemo(() => computeSweep(params, sweepField), [params, sweepField]);
    const sensitivityBars = useMemo(() => computeSensitivity(params), [params]);

    const calibrationResults = useMemo(
        () =>
            calibrationCases.map((c) => ({
                name: c.name,
                description: c.description,
                predicted: scoreModel(c.params).salience,
                expected: c.expectedSalience,
                source: c.source,
            })),
        [],
    );

    const saveSnapshot = useCallback(() => {
        setSnapshot({
            params,
            metrics,
            field,
            focal,
            label: `${params.object} · ${params.preset}`,
        });
    }, [params, metrics, field, focal]);

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
                        focal={focal}
                        field={field}
                        snapshot={snapshot}
                        reading={reading}
                        ranking={ranking}
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
                        <h3 className="text-lime-400 font-semibold mb-3">From molecule to meaning</h3>
                        <p className="leading-relaxed text-sm">
                            Salience does not live inside an object. A dopamine molecule is not
                            the good chemical, a glucose cue is not food, a text message is not
                            hope. These things become signs only inside systems organised around
                            survival, repair, reward, attachment, and self-continuity. The
                            playground walks one cue up an eight-rung ladder: from a neutral
                            physical difference, through constraint relevance and proto-salience,
                            into sign function, incentive value, attention, narrative binding,
                            and finally over-salience.
                        </p>
                        <div className="border-l-2 border-lime-500/40 pl-4 mt-3">
                            <p className="text-lime-200/80 text-sm">
                                A normal sign points at the world. A runaway sign is no longer in
                                the world; the world is now read through it.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Wanting is not liking</h3>
                        <p className="leading-relaxed text-sm">
                            Salience is not the same as liking. Incentive-sensitization research
                            separates wanting from liking: a cue can seize the attention budget
                            and drive pursuit while delivering little pleasure. Select the
                            possible rival, an object with low intrinsic reward but high cognitive
                            and affective charge, and watch it climb the field anyway. An object
                            you do not want can still run the day. It is the same reason a phone
                            notification can feel more charged than the conversation it announces.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Uncertainty is the fuel</h3>
                        <p className="leading-relaxed text-sm">
                            Limerence is not the strongest love. It is the runaway regime of an
                            ordinary salience system. The dangerous term is uncertainty: ambiguous
                            reciprocation keeps the prediction loop computing, where clear
                            affection or clear rejection would let it settle. Switch the signal
                            regime from stable to ambiguous to volatile and watch over-salience
                            climb without any change in how much the object is actually liked.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">What the model is and is not</h3>
                        <p className="leading-relaxed text-sm">
                            The eight object dimensions and eight field weights are a deliberate
                            compression. The scoring formula has no biography and no time axis; a
                            single signal regime stands in for the loop dynamics. It is a
                            comparative instrument, not a predictive one. The calibration table
                            runs each of the six objects under the limerence preset and compares
                            the model&apos;s salience to a reader-assigned expected value. Close
                            agreement means the model&apos;s shape matches a careful reading of how
                            that kind of cue typically behaves. It does not mean the model has met
                            any particular person.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Lowering the loop</h3>
                        <p className="leading-relaxed text-sm">
                            The path back from over-salience is not an argument with the
                            interpretation. It is structural. Raise reality correction and
                            habituation, raise attention temperature so the allocation stops being
                            winner-takes-most, cut the intermittency feeding the uncertainty term,
                            and introduce competing salient objects. The reality-correction preset
                            shows the field calming: salience pulled back toward evidential weight,
                            attention spread again across the world.
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
            title="salience engine"
            subtitle="how a neutral physical difference climbs from molecule to sign to value to attention to a world-filter"
            description={
                <a
                    href="https://www.researchgate.net/publication/354843640_How_Molecules_Became_Signs"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Terrence Deacon, How Molecules Became Signs (2021)
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
                />
            }
            researchUrl="/playgrounds/salience-engine/research"
        />
    );
}
