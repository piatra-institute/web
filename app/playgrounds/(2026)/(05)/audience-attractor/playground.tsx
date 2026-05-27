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

export default function AudienceAttractorPlayground({ sourceContext }: Props) {
    const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
    const [sweepField, setSweepField] = useState<SweepableField>('discoverability');

    const simulation = useMemo(() => runSimulation(params), [params]);
    const metrics = useMemo(() => scoreModel(params), [params]);
    const narrative = useMemo(() => computeNarrative(params, metrics), [params, metrics]);
    const reading = useMemo(() => generateReading(params, metrics), [params, metrics]);
    const sweep = useMemo(() => computeSweep(params, sweepField), [params, sweepField]);
    const sensitivityBars = useMemo(() => computeSensitivity(params), [params]);

    const calibrationResults = useMemo(
        () =>
            calibrationCases.map((c) => ({
                name: c.name,
                description: c.description,
                predicted: scoreModel(c.params).finalViewers,
                expected: c.expectedFinal,
                source: c.source,
            })),
        [],
    );

    const saveSnapshot = useCallback(() => {
        setSnapshot({
            params,
            metrics,
            rows: simulation.rows,
            events: simulation.events,
            bands: simulation.bands,
            label: params.case,
        });
    }, [params, metrics, simulation]);

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
                        rows={simulation.rows}
                        events={simulation.events}
                        bands={simulation.bands}
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
                        <h3 className="text-lime-400 font-semibold mb-3">A floor and a ceiling, not a curve</h3>
                        <p className="leading-relaxed text-sm">
                            The hypothesis the playground exists to interrogate: personality-driven
                            media audiences do not grow like a smooth line. They sit in bands.
                            Once a streamer, talk-radio host, or podcaster reaches a certain
                            viewership, habit and parasocial attachment hold the floor; niche
                            capacity, identity lock-in, and format limits hold the ceiling. The
                            attractor metaphor names that joint structure.
                        </p>
                        <div className="border-l-2 border-lime-500/40 pl-4 mt-3">
                            <p className="text-lime-200/80 text-sm">
                                Viewership does not grow like a line. It moves between basins.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Core plus casual</h3>
                        <p className="leading-relaxed text-sm">
                            The model separates a slow-moving core audience from a fast-moving
                            casual audience. Core decays slowly through habit retention and grows
                            by parasocial conversion of casuals. Casuals respond to platform
                            exposure, cumulative advantage, saturation, and noise. The floor lives
                            in the core. The ceiling lives in the platform and niche terms acting
                            on the casual pool. A trust shock hits casuals first, a schedule
                            collapse hits the core first.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">How to read the landscape</h3>
                        <p className="leading-relaxed text-sm">
                            The signature visualisation shows the potential well U(x) over
                            log-viewers, with the empirical dwell histogram of the trajectory
                            overlaid as lime fills. Wells are where structural pull is strongest;
                            histogram bars are where the trajectory actually spent time. When the
                            ball sits in a well and a bar sits over it, the basin reading is
                            doing real work. When the bars are scattered and the ball is on a
                            slope, the trajectory is wandering rather than orbiting.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Falsification, not confirmation</h3>
                        <p className="leading-relaxed text-sm">
                            The model is built to be falsifiable in two directions. Drop habit,
                            identity lock-in, and saturation toward zero and the trajectory
                            should become a noisy walk with no dominant band: that is the
                            wandering regime, and the attractor story does little work for that
                            configuration. Slow-decay is the other falsifier: if even a creator
                            with high habit and low discoverability fails to settle in a band,
                            the floor is thinner than the metaphor claims.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Beyond Twitch</h3>
                        <p className="leading-relaxed text-sm">
                            The dynamics are not platform-specific. Talk radio runs on commute
                            routine and host familiarity. TV talk shows run on time-slot habit
                            and guest pipelines. Podcasts run on feed subscription and parasocial
                            routine. YouTube runs on recommendation memory and topic identity.
                            Each medium adds its own ceiling and its own floor mechanism, but the
                            two-pool structure and the basin language travel.
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
            title="audience attractor"
            subtitle="how floors, ceilings, and basin transitions shape the viewership of personality-driven media"
            description={
                <a
                    href="https://www.science.org/doi/10.1126/science.1121066"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Salganik, Dodds and Watts, Experimental Study of Inequality and Unpredictability in an Artificial Cultural Market (2006)
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
            researchUrl="/playgrounds/audience-attractor/research"
        />
    );
}
