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


export default function FamilyThresholdPlayground({ sourceContext }: Props) {
    const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
    const [sweepField, setSweepField] = useState<SweepableField>('interventionThreshold');

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
                predicted: Number((scoreModel(c.params).finalFamily * 100).toFixed(1)),
                expected: c.expectedFamily,
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
            label: params.case,
        });
    }, [params, simulation]);

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
                        <h3 className="text-lime-400 font-semibold mb-3">The error a system is willing to make</h3>
                        <p className="leading-relaxed text-sm">
                            Child-protection institutions exist because both errors are real. Leave a
                            child with an abuser and you fail catastrophically. Remove a child from
                            an innocent family and you fail differently, and that failure also
                            damages a real person. The playground models the institution as a
                            partially-observable Markov decision process: hidden family state,
                            noisy observations, a belief that updates, a single action chosen by
                            minimising expected loss. The interesting part is where the weights sit.
                        </p>
                        <div className="border-l-2 border-lime-500/40 pl-4 mt-3">
                            <p className="text-lime-200/80 text-sm">
                                The institution’s posture is not its rhetoric. It is where the
                                weights sit when nothing is being said out loud.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Two thresholds</h3>
                        <p className="leading-relaxed text-sm">
                            The signature visualisation is a 2D phase plot of the system&apos;s
                            belief about harm against the true harm. The diagonal is perfect
                            knowledge. The two horizontal lines are the removal threshold and the
                            permanent-separation threshold. Crossing the first turns the cheapest
                            action into removal. Crossing the second turns it into rupture. The
                            trajectory of the run is a curve through this plane; the colour of the
                            final dot is the regime the system reached.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">The path-dependence machine</h3>
                        <p className="leading-relaxed text-sm">
                            The simulation is path-dependent. Removal reduces attachment, trust,
                            and family integrity. The reduced attachment then becomes evidence for
                            further separation. Switch the hidden-abuse scenario on and the system
                            removes correctly; switch the cultural-mismatch scenario on with the
                            same weights and the system removes incorrectly. Both runs then run
                            the same machine on the way down. The ECtHR has criticised Norway not
                            usually for the initial care order, but for what happens after: too
                            little contact, weak reunification work, premature movement to
                            permanent placement.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The five scenarios</h3>
                        <p className="leading-relaxed text-sm">
                            Five named scenarios populate the calibration table. An ambiguous
                            distressed family sets the baseline. Hidden abuse with a cooperative
                            surface is the dangerous case the system should catch. Cultural
                            mismatch with low actual harm is the case the system should not turn
                            into removal. Poverty stress with repairable care is the case where
                            home-based support is supposed to work. Severe danger is the case the
                            system must intervene on for it to be worth having at all. The same
                            ten weights have to handle all five.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">What the model is and is not</h3>
                        <p className="leading-relaxed text-sm">
                            This is a toy, not a predictor. The seven-dim hidden state is a
                            deliberate compression. Rights appear as a soft weight rather than a
                            hard constraint, which is how a moral argument shows up inside the
                            same equation as a child-safety weight, not the way real child-welfare
                            law works. The point is to make the moral weights and the
                            feedback loops visible, so that the institution&apos;s posture stops
                            being something only people inside it can see.
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
            title="family threshold"
            subtitle="how moral weights and observation noise push a child-protection institution into removal, reunification, or rupture"
            description={
                <a
                    href="https://www.echr.coe.int/w/decision-on-admissibility-concerning-norway"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    European Court of Human Rights, decisions on Norwegian child-welfare cases (2023)
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
            researchUrl="/playgrounds/family-threshold/research"
        />
    );
}
