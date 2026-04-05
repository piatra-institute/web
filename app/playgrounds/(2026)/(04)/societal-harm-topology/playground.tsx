'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';

import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Button from '@/components/Button';
import Equation from '@/components/Equation';
import ModelChangelog from '@/components/ModelChangelog';
import ResearchPromptButton from '@/components/ResearchPromptButton';
import { PlaygroundSourceContext } from '@/lib/readPlaygroundSource';

import Settings from './components/Settings';
import Viewer from './components/Viewer';
import {
    Params,
    Snapshot,
    SweepableParam,
    DimensionKey,
    HarmVector,
    DIMENSIONS,
    presetParams,
    computeMetrics,
    computeNarrative,
    computeSweep,
    computeSensitivity,
    interpolateHarmVector,
    easeInOutCubic,
    ANIMATION_TOTAL_FRAMES,
} from './logic';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';


interface Props {
    sourceContext?: PlaygroundSourceContext;
}

export default function SocietalHarmTopologyPlayground({ sourceContext }: Props) {
    const [params, setParams] = useState<Params>(() => presetParams('baseline'));
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
    const [sweepParam, setSweepParam] = useState<SweepableParam>('actorPower');

    // Animation state
    const [animPlaying, setAnimPlaying] = useState(false);
    const [animTime, setAnimTime] = useState(1);
    const animFrameRef = useRef<number | null>(null);

    const metrics = useMemo(() => computeMetrics(params), [params]);
    const narrative = useMemo(() => computeNarrative(metrics, params), [metrics, params]);
    const sweep = useMemo(() => computeSweep(params, sweepParam), [params, sweepParam]);
    const sensitivityBars = useMemo(() => computeSensitivity(params), [params]);

    // Initial vector (zero) for animation
    const zeroVector = useMemo((): HarmVector => {
        const v = {} as HarmVector;
        for (const d of DIMENSIONS) v[d.key as DimensionKey] = 0;
        return v;
    }, []);

    // Interpolated display vector
    const displayVector = useMemo(
        () => interpolateHarmVector(zeroVector, metrics.globalVector, easeInOutCubic(animTime)),
        [zeroVector, metrics.globalVector, animTime],
    );

    // Auto-play animation on param change (skip first render)
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        setAnimTime(0);
        setAnimPlaying(true);
    }, [params]);

    // Animation loop
    useEffect(() => {
        if (!animPlaying) {
            if (animFrameRef.current !== null) {
                cancelAnimationFrame(animFrameRef.current);
                animFrameRef.current = null;
            }
            return;
        }

        const step = () => {
            setAnimTime(prev => {
                const next = prev + 1 / ANIMATION_TOTAL_FRAMES;
                if (next >= 1) {
                    setAnimPlaying(false);
                    return 1;
                }
                return next;
            });
            animFrameRef.current = requestAnimationFrame(step);
        };

        animFrameRef.current = requestAnimationFrame(step);

        return () => {
            if (animFrameRef.current !== null) {
                cancelAnimationFrame(animFrameRef.current);
                animFrameRef.current = null;
            }
        };
    }, [animPlaying]);

    const saveSnapshot = useCallback(() => {
        setSnapshot({ params, metrics, label: params.preset });
    }, [params, metrics]);

    const clearSnapshot = useCallback(() => {
        setSnapshot(null);
    }, []);

    const toggleAnim = useCallback(() => {
        if (animTime >= 1) {
            setAnimTime(0);
            setAnimPlaying(true);
        } else {
            setAnimPlaying(p => !p);
        }
    }, [animTime]);

    const animControls = (
        <div className="flex items-center gap-4">
            <Button
                label={animPlaying ? 'pause' : animTime >= 1 ? 'replay' : 'play'}
                onClick={toggleAnim}
                size="xs"
            />
            <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={animTime}
                onChange={(e) => {
                    setAnimPlaying(false);
                    setAnimTime(parseFloat(e.target.value));
                }}
                className="w-40 h-1 accent-lime-500 cursor-pointer"
            />
            <span className="text-xs font-mono text-lime-200/60">
                t = {(animTime * 100).toFixed(0)}%
            </span>
        </div>
    );

    const sections: PlaygroundSection[] = [
        { id: 'intro', type: 'intro' },
        {
            id: 'canvas',
            type: 'canvas',
            content: (
                <PlaygroundViewer controls={animControls}>
                    <Viewer
                        metrics={metrics}
                        displayVector={displayVector}
                        sweep={sweep}
                        sensitivityBars={sensitivityBars}
                        assumptions={assumptions}
                        versions={versions}
                        snapshot={snapshot}
                        sweepParam={sweepParam}
                        onSweepParamChange={setSweepParam}
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
                        <h3 className="text-lime-400 font-semibold mb-3">The harm state vector</h3>
                        <p className="leading-relaxed text-sm">
                            For each person or cohort <Equation math="i" /> at time <Equation math="t" />,
                            the model tracks an 8-dimensional harm state:
                        </p>
                        <Equation mode="block" math="x_i(t) = \big(L_i,\; Q_i,\; M_i,\; A_i,\; P_i,\; E_i,\; I_i,\; T_i\big)" />
                        <p className="leading-relaxed text-sm mt-2">
                            where <Equation math="L" /> is life-years lost, <Equation math="Q" /> is
                            morbidity burden, <Equation math="M" /> is material extraction,{' '}
                            <Equation math="A" /> is agency loss, <Equation math="P" /> is political
                            voice dilution, <Equation math="E" /> is ecological damage,{' '}
                            <Equation math="I" /> is epistemic degradation, and <Equation math="T" /> is
                            tail risk. A higher-level capability map{' '}
                            <Equation math="c_i(t) = \Phi(x_i(t))" /> transforms this into what the
                            person can realistically do, become, and avoid.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Counterfactual causation</h3>
                        <p className="leading-relaxed text-sm">
                            Damage is not measured by looking at the world as it is, but relative
                            to a counterfactual without the actor&apos;s intervention:
                        </p>
                        <Equation mode="block" math="\Delta_a(t) = X_t - X_t^{(-a)}" />
                        <p className="leading-relaxed text-sm mt-2">
                            where <Equation math="X_t" /> is the actual social state and{' '}
                            <Equation math="X_t^{(-a)}" /> is the counterfactual under
                            median-firm behavior. Societal violence is a difference between
                            two trajectories of the social world.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The damage functional</h3>
                        <p className="leading-relaxed text-sm">
                            The full functional integrates harm over time, across populations,
                            with explicit treatment of catastrophic risk and institutional fragility:
                        </p>
                        <Equation mode="block" math="\mathcal{H}_a = \mathbb{E}\!\left[\sum_{t=0}^{T}\beta^t \sum_{i \in S} \omega_i \cdot \ell\!\left(c_i^{(-a)}(t),\, c_i(t)\right)\right] + \lambda\,\mathcal{R}_a + \mu\,\mathcal{F}_a" />
                        <p className="leading-relaxed text-sm mt-2">
                            Here <Equation math="\beta" /> is the temporal discount factor,{' '}
                            <Equation math="\omega_i" /> are moral weights,{' '}
                            <Equation math="\ell" /> compares actual to counterfactual capability,{' '}
                            <Equation math="\mathcal{R}_a" /> is catastrophic risk, and{' '}
                            <Equation math="\mathcal{F}_a" /> is institutional fragility.
                            A scalar index is derived from this functional only after vector
                            aggregation, repair adjustment, and obstruction correction.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Sheaf coherence and obstruction</h3>
                        <p className="leading-relaxed text-sm">
                            Society is covered by overlapping local contexts — labor, housing,
                            politics, media, environment, supply chains. On each patch{' '}
                            <Equation math="U_\alpha" />, a local harm section{' '}
                            <Equation math="\mathcal{F}(U_\alpha)" /> can be constructed.
                            The sheaf condition asks: do local sections glue into a coherent
                            global section?
                        </p>
                        <p className="leading-relaxed text-sm mt-2">
                            When they do not, the obstruction lives in{' '}
                            <Equation math="H^1" /> of the cover — a topological measure
                            of how accountability structures fragment. Offshore ownership,
                            subcontracting chains, and platform opacity create loops where
                            local responsibility exists everywhere but global responsibility
                            is hard to assemble.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Moral weights and incomparability</h3>
                        <p className="leading-relaxed text-sm">
                            There is no morally neutral weighting. The framework makes this
                            explicit: different ethical commitments yield different weights.
                            Rather than forcing all harms into{' '}
                            <Equation math="\mathbb{R}" />, the full theory uses a
                            partially ordered harm space <Equation math="Q" /> where
                            some harms dominate others, some are incomparable, and the
                            residual <Equation math="x \Rightarrow y" /> represents
                            the minimum repair needed.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Open questions</h3>
                        <p className="leading-relaxed text-sm">
                            The hardest problems are not technical. What is the baseline — no
                            actor, a regulated version, a cooperative alternative? Should future
                            generations get equal weight? Is consent meaningful under structural
                            dependency? How do you model epistemic harm mathematically? These
                            are the true foundations, and the playground makes them adjustable
                            rather than hiding them.
                        </p>
                    </div>

                    <ModelChangelog entries={changelog} />

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
            title="societal harm topology"
            subtitle="counterfactual, distributed, multi-domain harm from concentrated private power"
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
