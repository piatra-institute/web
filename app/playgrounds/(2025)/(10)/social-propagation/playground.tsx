'use client';

import { useRef } from 'react';
import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import VersionSelector from '@/components/VersionSelector';
import CalibrationPanel from '@/components/CalibrationPanel';
import AssumptionPanel from '@/components/AssumptionPanel';
import ModelChangelog from '@/components/ModelChangelog';
import ResearchPromptButton from '@/components/ResearchPromptButton';
import { PlaygroundSourceContext } from '@/lib/readPlaygroundSource';

import Settings from './components/Settings';
import Viewer from './components/Viewer';
import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';

export interface ViewerRef {
    updateSimulation: (params: SimulationParams, mechanics: Mechanics) => void;
    reset: () => void;
}

export interface Mechanics {
    cooldown10h: boolean;
    coolup10h: boolean;
    election1hWindow: boolean;
    forwardCaps: boolean;
    questionGating: boolean;
    identityTiers: boolean;
    slowMode: boolean;
}

export interface SimulationParams {
    spamAgents: number;
    audienceSize: number;
    baselinePostsPerAgentPerDay: number;
    avgDegree: number;
    shareProb: number;
    amplification: number;
    convProb: number;
    attentionHalfLifeMin: number;
    gatingConvReduction: number;
    cascadeLagMin: number;
    simMinutes: number;
    seed: number;
}

interface Props {
    sourceContext?: PlaygroundSourceContext;
}

export default function Playground({ sourceContext }: Props) {
    const viewerRef = useRef<ViewerRef>(null);

    const calibration = buildCalibration();

    const handleParamsChange = (params: SimulationParams, mechanics: Mechanics) => {
        viewerRef.current?.updateSimulation(params, mechanics);
    };

    const handleReset = () => {
        viewerRef.current?.reset();
    };

    const sections: PlaygroundSection[] = [
        {
            id: 'intro',
            type: 'intro',
        },
        {
            id: 'canvas',
            type: 'canvas',
            content: (
                <PlaygroundViewer>
                    <Viewer ref={viewerRef} />
                </PlaygroundViewer>
            ),
        },
        {
            id: 'outro',
            type: 'outro',
            content: (
                <div className="space-y-8 text-gray-300">
                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Mean-field propagation model</h3>
                        <p className="leading-relaxed text-sm">
                            This simulator uses a mean-field (aggregated) branching process to model viral content
                            propagation across a large social network. Rather than tracking individual accounts, it
                            carries aggregate state for active shares, cumulative reach, and manipulation exposure,
                            evolving them in discrete one-minute steps. Growth follows active shares times the effective
                            reproduction number times the susceptible fraction, plus seed ingress. The baseline scenario
                            is unrestricted propagation; the policy scenario applies friction mechanisms designed to
                            suppress coordination attacks and shrink the political manipulation surface.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Reproduction number and threshold</h3>
                        <p className="leading-relaxed text-sm">
                            The basic reproduction number is the product of fan-out, reshare probability, and
                            amplification, R0 = avgDegree times shareProb times amplification. Policy levers act as
                            multipliers that pull it down to an effective R_eff. The epidemic threshold theorem decides
                            the outcome: a cascade is supercritical (self-sustaining, growing) when R_eff is above 1 and
                            subcritical (fading) when it is at or below 1. Above threshold a finite fraction of the
                            audience is eventually reached, the final-size fraction one minus one over R_eff.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Policy mechanics</h3>
                        <p className="leading-relaxed text-sm">
                            Seven levers modulate the dynamics. A 10-hour cooldown restricts accounts to about 2.4 posts
                            per day; a 10-hour coolup delays visibility and damps ignition; a 1-hour daily window further
                            constrains election-period posting; forward caps halve effective fan-out; question-gating and
                            prebunking lower both reshare probability and conversion; identity tiers impose stricter
                            friction on new or low-trust accounts; per-thread slow mode applies temporal smoothing. Each
                            is encoded as an independent multiplier on rate, visibility, fan-out, or conversion, and they
                            compose to reduce R_eff, delay cascades, and diminish manipulation impact.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Political manipulation impact</h3>
                        <p className="leading-relaxed text-sm">
                            The PMI index accumulates, at each step, new exposures times the effective per-exposure
                            conversion probability. Conversion decays with content age through an attention half-life, so
                            delayed content lands with diminished potency, and question-gating applies an extra skepticism
                            reduction. The model reports absolute PMI for both scenarios and the percentage reduction
                            under policy, capturing not just lower reach but the qualitative degradation of manipulation
                            potency due to delay and friction.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">What it is not</h3>
                        <p className="leading-relaxed text-sm">
                            The mean-field approximation trades agent-level fidelity for tractability. It assumes
                            well-mixed contact, simple contagion, static multiplier policies, and a proxy conversion
                            count, none of which hold exactly in real graphs with hubs, complex contagion, adaptive
                            adversaries, and heterogeneous persuasion. Parameters are tuned for pedagogical visibility of
                            policy effects, not quantitative forecasting. Results illustrate comparative trends and
                            mechanism interactions rather than precise predictions.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Implementation</h3>
                        <VersionSelector versions={versions} active="claude-v1" />
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Calibration</h3>
                        <CalibrationPanel results={calibration} outputLabel="epidemic / cascade target" />
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Assumptions</h3>
                        <AssumptionPanel assumptions={assumptions} />
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
            title="social propagation"
            subtitle="comparing free-for-all versus policy-based social networks to measure political manipulation reduction"
            description="contagion, reproduction numbers, and the epidemic threshold applied to viral political manipulation"
            sections={sections}
            settings={<Settings onParamsChange={handleParamsChange} onReset={handleReset} />}
            researchUrl="/playgrounds/social-propagation/research"
        />
    );
}
