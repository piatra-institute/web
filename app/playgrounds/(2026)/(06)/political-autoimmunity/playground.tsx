'use client';

import React, { useCallback, useMemo, useState } from 'react';

import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import ModelChangelog from '@/components/ModelChangelog';
import ResearchPromptButton from '@/components/ResearchPromptButton';
import Equation from '@/components/Equation';
import { PlaygroundSourceContext } from '@/lib/readPlaygroundSource';

import Settings from './components/Settings';
import Viewer from './components/Viewer';
import {
    DEFAULT_PARAMS,
    INTEREST_MODELS,
    Params,
    Snapshot,
    computeAllMetrics,
    computeNarrative,
} from './logic';
import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';


interface Props {
    sourceContext?: PlaygroundSourceContext;
}


export default function PoliticalAutoimmunityPlayground({ sourceContext }: Props) {
    const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

    const metrics = useMemo(() => computeAllMetrics(params), [params]);
    const focus = useMemo(() => metrics.find((m) => m.id === params.focusScenario), [metrics, params.focusScenario]);
    const narrative = useMemo(() => computeNarrative(metrics, params), [metrics, params]);
    const calibration = useMemo(() => buildCalibration(), []);

    const onReset = useCallback(() => setParams(DEFAULT_PARAMS), []);

    const saveSnapshot = useCallback(() => {
        if (!focus) return;
        setSnapshot({
            label: focus.label,
            interestModel: INTEREST_MODELS[params.interestModel].label,
            display: focus.display,
            netPerSupporter: focus.netPerSupporter,
            rank: focus.rank,
        });
    }, [focus, params.interestModel]);

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
                        onParamsChange={setParams}
                        metrics={metrics}
                        focus={focus}
                        calibration={calibration}
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
                        <h3 className="text-lime-400 font-semibold mb-3">From &ldquo;clueless&rdquo; to a measurement problem</h3>
                        <p className="leading-relaxed text-sm">
                            Calling a group of voters self-destructive is cheap and usually wrong. It assumes the group has one
                            true interest, treats a category as a monolith, and smuggles in a partisan judgment. The useful move
                            is to stop asking &ldquo;why are these voters clueless?&rdquo; and start asking: under which
                            assumptions, data sources, and definitions of interest does a vote become measurably misaligned with a
                            group&apos;s exposure, institutional dependence, or stated priorities? Political autoimmunity is that
                            question made into an instrument.
                        </p>
                        <div className="border-l-2 border-lime-500/40 pl-4 mt-3">
                            <p className="text-lime-200/80 text-sm">
                                Every input here is synthetic, taken from the ideation&apos;s worked example. The instrument is
                                symmetric: it applies to any group supporting any coalition, on either side of politics. It scores
                                the structure of an argument, never a person.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The risk chain</h3>
                        <p className="leading-relaxed text-sm">
                            For a group, a coalition, and a policy domain, the per-domain adverse risk is a product. Foreseeability
                            (awareness) and salience scale it down; the net score subtracts a protective benefit and a tolerance
                            and reweights by the interest model:
                        </p>
                        <div className="my-3">
                            <Equation mode="block" math="R_{j} = E_j \cdot D_j \cdot H_j \cdot P_j \cdot M_j" />
                        </div>
                        <div className="my-3">
                            <Equation mode="block" math="\text{Autoimmunity} = V \sum_j W_j \, \max\!\big(0,\; R_j A_j S_j - B_j - \tau\big)" />
                        </div>
                        <p className="leading-relaxed text-sm">
                            Because risk is multiplicative, any single near-zero factor (low implementation probability, low
                            awareness, low salience) collapses a domain&apos;s contribution. That is deliberate: a harm a coalition
                            cannot or will not implement, or that a voter never sees coming, should not count the same as one that
                            is certain and salient.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">There is no single interest</h3>
                        <p className="leading-relaxed text-sm">
                            The interest model is a weight profile over domain kinds, and the case ranking changes when you switch
                            it. Under rights-dependence the small, high-exposure case leads; under a material or expressive model
                            it can fall behind. A vote that looks like self-harm under one definition of interest is an informed
                            tradeoff under another. The expressive and protest models, in particular, treat symbolic belonging and
                            punishment as real utility, which is the strongest reason most apparent self-harm is not irrationality.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">What this is not</h3>
                        <p className="leading-relaxed text-sm">
                            This is a transparent sandbox over synthetic numbers, not an empirical estimate and not a forecast. The
                            cells are hand-set illustrations, group labels are coarse (no subgroup or intersectional structure),
                            counterfactuals are never scored as true or false, and the uncertainty band is a seeded Monte Carlo
                            with a fixed concentration, not a real posterior. A serious version would replace the cells with
                            survey-derived exposure (CES, ANES, Pew, AP VoteCast), a human-coded candidate-policy matrix with
                            intercoder reliability, and calibrated forecaster priors. The calibration panel only checks that the
                            engine reproduces the worked example, nothing more.
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
            title="political autoimmunity"
            subtitle="decomposing when group vote choice is misaligned with measurable policy exposure"
            description={
                <a
                    href="https://doi.org/10.1017/CBO9781139173544"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Brennan and Lomasky, Democracy and Decision (1993)
                </a>
            }
            sections={sections}
            settings={
                <Settings
                    params={params}
                    onParamsChange={setParams}
                    focus={focus}
                    narrative={narrative}
                    snapshot={snapshot}
                    onSaveSnapshot={saveSnapshot}
                    onClearSnapshot={clearSnapshot}
                    onReset={onReset}
                />
            }
            researchUrl="/playgrounds/political-autoimmunity/research"
        />
    );
}
