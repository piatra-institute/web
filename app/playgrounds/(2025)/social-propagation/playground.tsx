'use client';

import { useRef } from 'react';
import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import Settings from './components/Settings';
import Viewer from './components/Viewer';

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

export default function Playground() {
    const viewerRef = useRef<ViewerRef>(null);

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
                <div className="w-full h-full flex items-center justify-center p-8">
                    <Viewer ref={viewerRef} />
                </div>
            ),
        },
        {
            id: 'outro',
            type: 'outro',
            content: (
                <div className="space-y-6">
                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Mean-Field Propagation Model</h4>
                        <p className="text-gray-300">
                            This simulator employs a mean-field (aggregated) approach to model viral content propagation
                            across large-scale social networks. Rather than tracking individual agents, the model
                            maintains aggregate state variables for active shares, cumulative reach, and manipulation
                            exposure, evolving them through discrete time steps with branching dynamics modulated by
                            policy interventions. The baseline scenario represents unrestricted propagation, while the
                            policy scenario applies friction mechanisms designed to suppress coordination attacks and
                            reduce the political manipulation surface.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Policy Mechanics</h4>
                        <p className="text-gray-300">
                            Seven distinct policy levers modulate propagation dynamics: (1) 10-hour cooldown restricts
                            accounts to ~2.4 posts per day; (2) 10-hour coolup delays content visibility, dampening
                            ignition; (3) 1-hour daily posting windows further constrain election-period activity; (4)
                            forward caps reduce effective fan-out by halving the degree; (5) question-gating and
                            prebunking mechanisms lower both share probability and conversion rates; (6) identity tiers
                            impose stricter friction on new/low-trust accounts; (7) per-thread slow mode applies temporal
                            smoothing to growth rates. These interventions collectively reduce the effective reproduction
                            number R_eff, delay cascades, and diminish manipulation impact.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Political Manipulation Impact (PMI)</h4>
                        <p className="text-gray-300">
                            The PMI metric quantifies expected successful manipulations by accumulating the product of
                            new exposures, per-exposure conversion probability, and attention/skepticism factors at each
                            time step. Conversion probability decays with content age using an attention half-life,
                            penalizing delayed exposure. Question-gating applies an additional skepticism reduction.
                            The model reports absolute PMI for both scenarios and computes percentage reduction under
                            policy, providing a direct measure of manipulation suppression effectiveness. This metric
                            captures not just reach reduction but also the qualitative degradation of manipulation
                            potency due to delays and friction.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Methodological Notes</h4>
                        <p className="text-gray-300">
                            The mean-field approximation trades agent-level fidelity for computational tractability,
                            enabling multi-day simulations with minute-scale resolution. The model uses logistic
                            saturation to cap reach at audience size and applies a small moderation leak to represent
                            content removal. Slow mode employs exponential moving average smoothing rather than direct
                            R modification. Parameters are calibrated for pedagogical visibility of policy effects
                            rather than quantitative prediction. Real-world dynamics involve heterogeneous agents,
                            network topology, adaptive adversaries, and enforcement imperfections not captured here.
                            Results illustrate comparative trends and mechanism interactions rather than precise forecasts.
                        </p>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="social propagation"
            description="comparing free-for-all vs policy-based social networks to measure political manipulation reduction"
            sections={sections}
            settings={<Settings onParamsChange={handleParamsChange} onReset={handleReset} />}
        />
    );
}
