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
    PRESET_DESCRIPTIONS,
    Params,
    Snapshot,
    computeNarrative,
    computeSweep,
    runModel,
} from './logic';
import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';


interface Props {
    sourceContext?: PlaygroundSourceContext;
}


export default function TrisquarePlayground({ sourceContext }: Props) {
    const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

    const result = useMemo(() => runModel(params), [params]);
    const metrics = result.metrics;
    const narrative = useMemo(() => computeNarrative(params, result), [params, result]);
    const sweep = useMemo(() => computeSweep(params), [params]);
    const calibration = useMemo(() => buildCalibration(), []);

    const saveSnapshot = useCallback(() => {
        setSnapshot({ params, metrics, label: PRESET_DESCRIPTIONS[params.preset].label });
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
                        result={result}
                        metrics={metrics}
                        sweep={sweep}
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
                        <h3 className="text-lime-400 font-semibold mb-3">One proposal, three theories</h3>
                        <p className="leading-relaxed text-sm">
                            Turok&apos;s program proposes a three-way correspondence between a
                            constrained limit of quantum gravity, a perfect-square scalar action, and
                            4D scalar phi-fourth theory. Diffeomorphism invariance gives a Ward
                            identity that restricts the UV form of the action; a single dimensionless
                            coupling controls it, by analogy with gauge theory. This playground turns
                            each piece into something you can move.
                        </p>
                        <div className="border-l-2 border-lime-500/40 pl-4 mt-3">
                            <p className="text-lime-200/80 text-sm">
                                The big caveat is built in: the correspondence is shown so far only
                                for conformally flat metrics. The genuinely spin-2 part of gravity is
                                not yet covered.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Why gravity starts to look like a scalar</h3>
                        <p className="leading-relaxed text-sm">
                            A conformally flat metric replaces all the components of the metric with a
                            single scalar conformal factor:
                        </p>
                        <div className="my-3">
                            <Equation mode="block" math="g_{\mu\nu}(x) = \Omega^2(x)\,\eta_{\mu\nu}, \qquad \Omega(x) = e^{\phi(x)}" />
                        </div>
                        <p className="leading-relaxed text-sm">
                            On a 2D slice the curvature is read straight off that scalar,{' '}
                            <Equation math="K = -\Omega^{-2}\Delta \ln\Omega" />, and the Weyl tensor
                            vanishes. The conformal heatmaps show geometry becoming one field; the
                            calibration panel checks the curvature method against metrics of known
                            constant curvature.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Symmetry as compression</h3>
                        <p className="leading-relaxed text-sm">
                            The Ward game is the heart of the proposal made tangible. Scale invariance
                            deletes every dimensionful coupling, conformal invariance keeps only the
                            Weyl-squared curvature term, diffeomorphism invariance removes frame-fixed
                            terms, and single-coupling mode collapses the dimensionless survivors into
                            one. A messy Lagrangian is compressed into a near-unique form, which is
                            what a Ward identity does in the UV.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">What is solid and what is not</h3>
                        <p className="leading-relaxed text-sm">
                            The status ledger and the colour of every triangle edge keep the bookkeeping
                            honest. The conformal curvature and the phi-fourth running are exact or
                            textbook. The Ward game is a schematic of a real statement. The central
                            claim, that constrained quantum gravity equals a perfect-square scalar theory
                            mapping to phi-fourth, is a research-level conjecture shown only in the
                            conformally flat sector. This is a toy explorer of a correspondence, not a
                            proof of it.
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
            title="trisquare"
            subtitle="conformal quantum gravity, a perfect-square action, and 4D scalar phi-fourth"
            description={
                <a
                    href="https://arxiv.org/abs/2110.06258"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    2021, Boyle and Turok, Cancelling the Vacuum Energy and Weyl Anomaly in the Standard Model with Dimension-Zero Scalar Fields
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
            researchUrl="/playgrounds/trisquare/research"
        />
    );
}
