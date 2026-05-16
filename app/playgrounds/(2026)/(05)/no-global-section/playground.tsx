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
    AXIS_KEYS,
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

function extractAxes(p: Params) {
    return AXIS_KEYS.reduce((acc, k) => {
        acc[k] = p[k];
        return acc;
    }, {} as Record<typeof AXIS_KEYS[number], number>);
}

export default function NoGlobalSectionPlayground({ sourceContext }: Props) {
    const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
    const [sweepAxis, setSweepAxis] = useState<SweepableAxis>('locality');

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
                predicted: scoreModel(c.params).obstruction,
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
                        <h3 className="text-lime-400 font-semibold mb-3">Local meaning, global consequence</h3>
                        <p className="leading-relaxed text-sm">
                            A sheaf assigns local data to overlapping regions and asks whether
                            the local pieces agree on their overlaps. When they do, the local
                            data glues into a global section. When they do not, the mismatch
                            is classified by a cohomology class. This playground takes that
                            picture and applies it, deliberately informally, to a small set of
                            human figures who fail (or refuse, or break) the global gluing.
                        </p>
                        <div className="border-l-2 border-lime-500/40 pl-4 mt-3">
                            <p className="text-lime-200/80 text-sm">
                                The tragedy of humanity is that our meanings are local, but
                                our consequences are global.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Why no global section</h3>
                        <p className="leading-relaxed text-sm">
                            Odysseus is offered the stars and chooses Ithaca. Faust refuses
                            every local boundary and unravels across an inflating cover.
                            Kafka&apos;s K. lives in a world that asserts a global order
                            without ever evaluating it at any local point. Dante alone finds
                            something close to a clean global section, but only by accepting
                            an authoritative cosmology that does the stratifying work.
                            The other figures are accounts of how the gluing fails, and what
                            survives the failure.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">What the model is and is not</h3>
                        <p className="leading-relaxed text-sm">
                            The six-axis basis (locality, abstraction, desire, institution,
                            trauma, knowledge) is a deliberate compression. The scoring
                            formula has no business cycle, no time, no narrative arc. It is a
                            comparative instrument, not a predictive one. The lens choice
                            frames the reading but does not change the numbers; the
                            configuration is the model. The calibration table compares the
                            model&apos;s emergent obstruction on each figure&apos;s canonical
                            profile to a reader-provided expected obstruction. Close
                            agreement means the model&apos;s shape matches a careful
                            reading. It does not mean the model has read the text.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The figures, briefly</h3>
                        <p className="leading-relaxed text-sm">
                            Odysseus (return), Orpheus (descent), Gilgamesh (mortality),
                            Aeneas (transfer), Dante (cosmic order), Faust (infinite
                            appetite), Kafka&apos;s K. (bureaucracy), Balzac (social
                            gluing), Musil (over-possibility), Sabato (pathological
                            collapse). Ten figures, ten ways the local and the global fail
                            to align, ten different residues left behind.
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
            title="no global section"
            subtitle="myths, novels, and the failure to glue local meaning into a single human story"
            description={
                <>
                    inspired by sheaf-theoretic readings of stratified narrative, after{' '}
                    <a
                        href="https://plato.stanford.edu/entries/category-theory/"
                        className="underline"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Mac Lane &amp; Moerdijk, Sheaves in Geometry and Logic
                    </a>
                </>
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
        />
    );
}
