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
    Params,
    SCENARIOS,
    Snapshot,
    computeDiagnosis,
    computeEvidenceDebt,
    computeMetrics,
    exampleForecast,
    initUserFromBaseline,
    makeDefaultParams,
} from './logic';
import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';


interface Props {
    sourceContext?: PlaygroundSourceContext;
}


export default function IdeologicalBentPlayground({ sourceContext }: Props) {
    const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

    const scenario = SCENARIOS[params.scenarioId];

    const metrics = useMemo(() => computeMetrics(scenario, params), [scenario, params]);
    const diagnosis = useMemo(() => computeDiagnosis(scenario, params, metrics), [scenario, params, metrics]);
    const evidenceDebt = useMemo(() => computeEvidenceDebt(scenario, params, metrics.ilr), [scenario, params, metrics.ilr]);
    const calibration = useMemo(() => buildCalibration(), []);

    const onSelectScenario = useCallback((id: string) => {
        setParams(makeDefaultParams(id));
        setSnapshot(null);
    }, []);

    const onLoadExample = useCallback(() => {
        setParams((p) => ({ ...p, user: exampleForecast(SCENARIOS[p.scenarioId]) }));
    }, []);

    const onResetForecasts = useCallback(() => {
        setParams((p) => ({ ...p, user: initUserFromBaseline(SCENARIOS[p.scenarioId], p.assumptions) }));
    }, []);

    const saveSnapshot = useCallback(() => {
        setSnapshot({
            label: scenario.actors.find((a) => a.id === params.focusActor)?.name ?? 'focus',
            bentScore: metrics.bentScore,
            brittleness: metrics.brittleness,
            inadmissibilityBits: metrics.inadmissibilityBits,
        });
    }, [scenario, params.focusActor, metrics]);

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
                        scenario={scenario}
                        metrics={metrics}
                        diagnosis={diagnosis}
                        evidenceDebt={evidenceDebt}
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
                        <h3 className="text-lime-400 font-semibold mb-3">Making identity pay rent</h3>
                        <p className="leading-relaxed text-sm">
                            The dangerous move is &ldquo;my opponent did X, therefore my opponent is uniquely to blame, and my
                            side would never do X.&rdquo; Sometimes true, often false, usually under-specified. The better move
                            asks which part of the outcome came from the actor, which from state capacity, which from agency
                            incentives, which from the underlying threat, and which from international pressure. This instrument
                            forces that decomposition by making you assign probabilities and then checking your own consistency
                            when the only thing that changes is the actor label.
                        </p>
                        <div className="border-l-2 border-lime-500/40 pl-4 mt-3">
                            <p className="text-lime-200/80 text-sm">
                                It is symmetric by construction. &ldquo;They would obviously have done the same&rdquo; and
                                &ldquo;my side would never&rdquo; are flagged as distortions of equal kind. The tool measures the
                                shape of your reasoning, not which side you are on.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The metrics</h3>
                        <p className="leading-relaxed text-sm">
                            The baseline is a softmax over log-priors shifted by the shared assumption sliders. Your forecast is
                            compared to it along several axes. The identity likelihood ratio is the odds multiplier your deviation
                            implies. The Bent Score is how much more (or less) your forecast separates the two actors than the
                            baseline does, in log-odds:
                        </p>
                        <div className="my-3">
                            <Equation mode="block" math="\text{Bent} = \big[\text{logit}\,q_A - \text{logit}\,q_B\big] - \big[\text{logit}\,p^\*_A - \text{logit}\,p^\*_B\big]" />
                        </div>
                        <p className="leading-relaxed text-sm">
                            Ideological brittleness measures the same separation with Jensen-Shannon divergence; the Identity
                            Dominance Ratio compares how much the label moves you to how much the facts move the model; and
                            counterfactual inadmissibility, in bits, measures how hard you suppress a branch the baseline keeps
                            open.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Rational, not automatic</h3>
                        <p className="leading-relaxed text-sm">
                            Two people disagreeing is not automatically irrational: different priors or causal assumptions can
                            produce honest divergence. That is why the assumptions are exposed as sliders. A high Bent Score that
                            survives even after you match assumptions and priors across the swap is the motivated residue the tool
                            is trying to isolate, the difference between serious reasoning and team-flag reasoning.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">What this is not</h3>
                        <p className="leading-relaxed text-sm">
                            The baseline probabilities are editable placeholders for interface design, not calibrated forecasts,
                            and the scenarios are illustrative test cases, not endorsements, predictions, or factual claims about
                            any real person. Counterfactuals are not directly verifiable; the tool never scores them as true or
                            false. It scores reasoning habits: consistency under the actor swap, sensitivity to evidence, and the
                            admissibility of inconvenient branches. A serious version would replace the placeholder priors with
                            calibrated forecaster pools and historical analogues.
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
            title="ideological bent"
            subtitle="measuring how an actor swap bends a forecast from its causal baseline"
            description={
                <a
                    href="https://doi.org/10.1111/j.1540-5907.2006.00214.x"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Taber and Lodge, Motivated Skepticism in the Evaluation of Political Beliefs (2006)
                </a>
            }
            sections={sections}
            settings={
                <Settings
                    params={params}
                    onParamsChange={setParams}
                    scenario={scenario}
                    metrics={metrics}
                    snapshot={snapshot}
                    onSelectScenario={onSelectScenario}
                    onLoadExample={onLoadExample}
                    onResetForecasts={onResetForecasts}
                    onSaveSnapshot={saveSnapshot}
                    onClearSnapshot={clearSnapshot}
                />
            }
            researchUrl="/playgrounds/ideological-bent/research"
        />
    );
}
