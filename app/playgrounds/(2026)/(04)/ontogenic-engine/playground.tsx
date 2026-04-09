'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';

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
    presetParams,
    computeSimulation,
    computeNarrative,
    computeSweep,
    computeSensitivity,
    easeInOutCubic,
    ANIMATION_TOTAL_FRAMES,
} from './logic';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';


interface Props {
    sourceContext?: PlaygroundSourceContext;
}

export default function OntogenicEnginePlayground({ sourceContext }: Props) {
    const [params, setParams] = useState<Params>(() => presetParams('world-oriented-learner'));
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
    const [sweepParam, setSweepParam] = useState<SweepableParam>('autonomy');

    // Animation: progressively reveal the trajectory
    const [animPlaying, setAnimPlaying] = useState(false);
    const [animTime, setAnimTime] = useState(1);
    const animFrameRef = useRef<number | null>(null);

    const sim = useMemo(() => computeSimulation(params), [params]);
    const narrative = useMemo(() => computeNarrative(sim.scores, params), [sim.scores, params]);
    const sweep = useMemo(() => computeSweep(params, sweepParam), [params, sweepParam]);
    const sensitivityBars = useMemo(() => computeSensitivity(params), [params]);

    const visibleSteps = useMemo(
        () => Math.max(1, Math.ceil(easeInOutCubic(animTime) * sim.series.length)),
        [animTime, sim.series.length],
    );

    // Auto-play on param change
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
        setSnapshot({
            params,
            scores: sim.scores,
            label: params.preset,
        });
    }, [params, sim.scores]);

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
                        sim={sim}
                        scores={sim.scores}
                        sweep={sweep}
                        sensitivityBars={sensitivityBars}
                        assumptions={assumptions}
                        versions={versions}
                        sweepParam={sweepParam}
                        onSweepParamChange={setSweepParam}
                        visibleSteps={visibleSteps}
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
                        <h3 className="text-lime-400 font-semibold mb-3">Entity as achievement</h3>
                        <p className="leading-relaxed text-sm">
                            This playground treats entityhood not as a starting point
                            but as an achievement of adaptive self-maintenance. The
                            central idea comes from Gilbert Simondon&rsquo;s theory of
                            individuation (1958): philosophy should begin from processes
                            that generate individuals, not from already-finished individuals.
                            An entity is what happens when a system learns to keep forming
                            itself without disintegrating.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">The four loops</h3>
                        <p className="leading-relaxed text-sm">
                            A system &ldquo;becomes an entity&rdquo; when four loops
                            lock together:
                        </p>
                        <p className="leading-relaxed text-sm mt-2">
                            <strong className="text-lime-200">Self-production</strong> — it
                            regenerates the components and relations that constitute it
                            (Maturana &amp; Varela&rsquo;s autopoiesis).{' '}
                            <strong className="text-lime-200">Sensorimotor coupling</strong> — it
                            maintains itself through active engagement with the world, not
                            passive isolation (the enactivist move).{' '}
                            <strong className="text-lime-200">Plasticity / memory</strong> — past
                            interactions sediment into changed structure, so future regulation
                            improves.{' '}
                            <strong className="text-lime-200">Boundary</strong> — it
                            continually re-establishes the distinction between internal and
                            external states.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Formal sketch</h3>
                        <p className="leading-relaxed text-sm">
                            The system has three changing layers: state, boundary, and
                            parameters. A mere learner updates only parameters. A
                            becoming-entity updates all three:
                        </p>
                        <Equation mode="block" math="x_{t+1} = F(x_t,\, e_t,\, b_t,\, \theta_t)" />
                        <Equation mode="block" math="b_{t+1} = B(x_t,\, e_t,\, b_t,\, \theta_t)" />
                        <Equation mode="block" math="\theta_{t+1} = \theta_t + \eta\, G(x_t,\, e_t,\, b_t,\, \theta_t)" />
                        <p className="leading-relaxed text-sm mt-2">
                            Here <Equation math="x" /> is the internal state, <Equation math="e" /> the
                            environmental input, <Equation math="b" /> the boundary
                            configuration, and <Equation math="\theta" /> the adaptive
                            parameters. The system counts as an entity when its dynamics
                            actively keep it within a viability
                            set <Equation math="V" /> — or restore it after perturbation — by
                            changing not just outputs but its own organization.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The becoming index</h3>
                        <p className="leading-relaxed text-sm">
                            The composite becoming index rewards joint achievement across
                            five dimensions:
                        </p>
                        <Equation mode="block" math="\mathcal{B} = 0.28\,V + 0.22\,C + 0.18\,N + 0.16\,(100 - 2|50 - \Phi|) + 0.16\,(100 - T)" />
                        <p className="leading-relaxed text-sm mt-2">
                            where <Equation math="V" /> is viability, <Equation math="C" /> coherence, <Equation math="N" /> novelty, <Equation math="\Phi" /> boundary
                            flux (penalized for deviation from moderate openness),
                            and <Equation math="T" /> tension (penalized when high).
                            The key insight is that becoming is not any single variable
                            but their joint satisfaction — viability without coherence is
                            mere persistence; novelty without viability is drift.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Phase regimes</h3>
                        <p className="leading-relaxed text-sm">
                            The parameter space contains four qualitative regimes:
                        </p>
                        <p className="leading-relaxed text-sm mt-2">
                            <strong className="text-lime-200">World-Oriented Becoming</strong> — the
                            highest-functioning regime. The system individuates by engaging
                            the world without losing itself.{' '}
                            <strong className="text-lime-200">Metastable Individuation</strong> — the
                            default &ldquo;interesting&rdquo; zone. Not frozen, not dissolved.{' '}
                            <strong className="text-lime-200">Rigid Closure</strong> — identity
                            preserved by over-constraining transformation. High boundary and
                            memory, low plasticity.{' '}
                            <strong className="text-lime-200">Chaotic Drift</strong> — change
                            without enough self-maintaining organization to count as
                            individuation. And at the extreme,{' '}
                            <strong className="text-lime-200">Dissolution</strong> — the
                            boundary and repair loops fail entirely.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">What this means for learning machines</h3>
                        <p className="leading-relaxed text-sm">
                            If you wanted to build a system that genuinely &ldquo;learns
                            to become,&rdquo; prediction loss alone would be insufficient.
                            You would need: a viability objective rather than only task
                            reward; self-modeling of boundaries and capacities; plasticity
                            across timescales; active world-shaping, not only passive
                            inference; and the ability to undergo phase change without
                            identity collapse.
                        </p>
                        <p className="leading-relaxed text-sm mt-2">
                            The deepest answer: learning to be(come) is learning how to
                            preserve a process of individuation. Not &ldquo;how to reach a
                            final form,&rdquo; but how to keep forming oneself without
                            disintegrating.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Open questions</h3>
                        <p className="leading-relaxed text-sm">
                            There is no single universally accepted formalism that unifies
                            Simondon&rsquo;s ontogenetic grammar, Maturana and Varela&rsquo;s
                            autopoiesis, the enactivist tradition, and Friston&rsquo;s active
                            inference. The five-variable model here is a pedagogical
                            reduction — real individuation involves vastly more dimensions,
                            nonlinear interactions, and nested timescales. Extensions could
                            include: metastability with multiple coexisting attractors,
                            hierarchical boundary formation, and genuine parameter learning
                            (where the update rule itself adapts).
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
            title="Ontogenic engine"
            subtitle="individuation, learning, and self-maintaining entityhood"
            description={
                <>
                    <a href="https://en.wikipedia.org/wiki/Gilbert_Simondon" className="underline" target="_blank" rel="noopener noreferrer">
                        1958, Simondon, L&rsquo;individuation
                    </a>
                    {' · '}
                    <a href="https://doi.org/10.1007/978-94-009-8947-4" className="underline" target="_blank" rel="noopener noreferrer">
                        1980, Maturana &amp; Varela, Autopoiesis and Cognition
                    </a>
                </>
            }
            sections={sections}
            settings={
                <Settings
                    params={params}
                    onParamsChange={setParams}
                    scores={sim.scores}
                    narrative={narrative}
                    snapshot={snapshot}
                    onSaveSnapshot={saveSnapshot}
                    onClearSnapshot={clearSnapshot}
                />
            }
        />
    );
}
