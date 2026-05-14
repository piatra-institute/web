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
    Params,
    Snapshot,
    SweepableParam,
    DEFAULT_PARAMS,
    scoreModel,
    schoolStrengths,
    dominantSchool,
    policyVerdict,
    computeNarrative,
    computeSweep,
    computeSensitivity,
} from './logic';
import { assumptions } from './assumptions';
import { calibrationCases } from './calibration';
import { versions, changelog } from './versions';


interface Props {
    sourceContext?: PlaygroundSourceContext;
}

export default function FiscalCompassPlayground({ sourceContext }: Props) {
    const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
    const [sweepParam, setSweepParam] = useState<SweepableParam>('taxRate');

    const metrics = useMemo(() => scoreModel(params), [params]);
    const strengths = useMemo(() => schoolStrengths(params), [params]);
    const dominant = useMemo(() => dominantSchool(params), [params]);
    const verdict = useMemo(() => policyVerdict(metrics, params), [metrics, params]);
    const narrative = useMemo(() => computeNarrative(params, metrics), [params, metrics]);
    const sweep = useMemo(() => computeSweep(params, sweepParam), [params, sweepParam]);
    const sensitivityBars = useMemo(() => computeSensitivity(params), [params]);

    const calibrationResults = useMemo(
        () =>
            calibrationCases.map((c) => ({
                name: c.name,
                description: c.description,
                predicted: scoreModel(c.params).welfare,
                expected: c.expectedWelfare,
                source: c.source,
            })),
        [],
    );

    const saveSnapshot = useCallback(() => {
        setSnapshot({ params, metrics, label: params.preset });
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
                        strengths={strengths}
                        dominant={dominant}
                        verdict={verdict}
                        sweepParam={sweepParam}
                        onSweepParamChange={setSweepParam}
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
                        <h3 className="text-lime-400 font-semibold mb-3">Four arguments, not one</h3>
                        <p className="leading-relaxed text-sm">
                            &ldquo;Higher taxes are good&rdquo; is not a single claim. It is at
                            least four claims, each with a different target and a different
                            failure mode. Higher taxes can be good because inequality is harmful,
                            because public investment has high returns, because debt or deficits
                            must fall, or because some taxes discourage harmful behaviour. The
                            same lever, the same revenue, but the case for pulling it is
                            structurally different in each.
                        </p>
                        <div className="border-l-2 border-lime-500/40 pl-4 mt-3">
                            <p className="text-lime-200/80 text-sm">
                                Redistribution: the problem is concentration.
                                <br />
                                State capacity: the problem is what the state cannot yet do.
                                <br />
                                Consolidation: the problem is the deficit.
                                <br />
                                Corrective: the problem is an unpriced harm.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Pro-tax is not austerity</h3>
                        <p className="leading-relaxed text-sm">
                            Calling tax-increase advocates &ldquo;austerity advocates&rdquo; is
                            imprecise. Austerity means reducing deficits, by spending cuts, tax
                            increases, or both. The famous expansionary-austerity economists,
                            Alesina and coauthors, generally argue that spending-based
                            consolidations are <em>less</em> contractionary than tax-based ones.
                            So they are austerity advocates, but not straightforwardly
                            &ldquo;raise taxes&rdquo; advocates. The redistribution and
                            state-capacity camps are the opposite: they want higher taxes, but
                            not in order to shrink the state.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Why a compass</h3>
                        <p className="leading-relaxed text-sm">
                            The compass needle is the vector sum of how strongly the current
                            world-state supports each rationale, independent of the rationale you
                            have selected. It answers a different question from the scorecard. The
                            scorecard asks &ldquo;given the argument you are making, does this
                            package score well?&rdquo; The compass asks &ldquo;given the world as
                            you have described it, which argument should you be making?&rdquo;
                            When the needle and your selected rationale disagree, that gap is the
                            interesting part: you may be reaching for the wrong instrument.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">What is solid, what is a toy</h3>
                        <p className="leading-relaxed text-sm">
                            The four-way taxonomy and the author placements are a fair summary of
                            the public-finance literature: Diamond and Saez on progressive
                            taxation, Lindert on welfare states and growth, Alesina on
                            consolidation composition, Pigou and Nordhaus on corrective taxes. The
                            scoring model is a toy. It treats the rationales as separable additive
                            channels with a fixed cross-weight, has no business cycle, no
                            expectations, and no debt dynamics. Its job is to make the <em>shape</em>{' '}
                            of the arguments comparable, not to estimate any country. The
                            calibration table is a sanity check on argument shape, not an
                            econometric fit.
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
            title="fiscal compass"
            subtitle="mapping when higher taxes help, hurt, or become state capacity across four fiscal rationales"
            description={
                <>
                    based on{' '}
                    <a
                        href="https://www.aeaweb.org/articles?id=10.1257/jep.25.4.165"
                        className="underline"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        2011, Diamond &amp; Saez, The Case for a Progressive Tax
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
