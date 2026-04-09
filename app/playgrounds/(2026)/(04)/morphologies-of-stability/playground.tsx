'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';

import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
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
    computeMetrics,
    computeNarrative,
    computeSweep,
    computeSensitivity,
    initialSimState,
    advanceSimulation,
    perturbSimulation,
    randomizeSimulation,
} from './logic';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';


interface Props {
    sourceContext?: PlaygroundSourceContext;
}

export default function MorphologiesOfStabilityPlayground({ sourceContext }: Props) {
    const [params, setParams] = useState<Params>(() => presetParams('point-relaxation'));
    const [simState, setSimState] = useState(() => initialSimState());
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
    const [sweepParam, setSweepParam] = useState<SweepableParam>('noise');
    const [running, setRunning] = useState(true);

    const paramsRef = useRef(params);
    paramsRef.current = params;
    const runningRef = useRef(running);
    runningRef.current = running;
    const frameRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);

    const metrics = useMemo(() => computeMetrics(params, simState), [params, simState]);
    const narrative = useMemo(() => computeNarrative(metrics, params), [metrics, params]);
    const sweep = useMemo(() => computeSweep(params, sweepParam), [params, sweepParam]);
    const sensitivityBars = useMemo(() => computeSensitivity(params), [params]);

    // Simulation loop
    useEffect(() => {
        const tick = (now: number) => {
            if (runningRef.current) {
                const elapsed = lastTimeRef.current ? Math.min(40, now - lastTimeRef.current) : 16;
                lastTimeRef.current = now;
                const steps = Math.max(1, Math.round((elapsed / 16) * paramsRef.current.simSpeed));

                setSimState(prev => {
                    let next = prev;
                    for (let i = 0; i < steps; i++) {
                        next = advanceSimulation(next, paramsRef.current, 0.02);
                    }
                    return next;
                });
            } else {
                lastTimeRef.current = 0;
            }

            frameRef.current = requestAnimationFrame(tick);
        };

        frameRef.current = requestAnimationFrame(tick);

        return () => {
            if (frameRef.current !== null) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, []);

    const toggleRunning = useCallback(() => {
        setRunning(r => !r);
    }, []);

    const handlePerturb = useCallback(() => {
        setSimState(prev => perturbSimulation(prev, paramsRef.current.pattern));
    }, []);

    const handleRandomize = useCallback(() => {
        setSimState(prev => randomizeSimulation(prev, paramsRef.current.pattern));
    }, []);

    const handleReset = useCallback(() => {
        setSimState(initialSimState());
    }, []);

    const saveSnapshot = useCallback(() => {
        setSnapshot({
            params,
            metrics,
            simState,
            label: params.preset,
        });
    }, [params, metrics, simState]);

    const clearSnapshot = useCallback(() => {
        setSnapshot(null);
    }, []);

    const sections: PlaygroundSection[] = [
        { id: 'intro', type: 'intro' },
        {
            id: 'canvas',
            type: 'canvas',
            content: (
                <PlaygroundViewer>
                    <Viewer
                        params={params}
                        simState={simState}
                        metrics={metrics}
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
                        <h3 className="text-lime-400 font-semibold mb-3">What counts as stable?</h3>
                        <p className="leading-relaxed text-sm">
                            The four patterns in this playground represent four fundamentally
                            different answers to the question &ldquo;what does it mean for a
                            system to hold its form?&rdquo; A point attractor holds form by
                            returning to rest. A bistable switch holds form by occupying one
                            of two valleys. A limit cycle holds form by sustaining a rhythm.
                            A consensus network holds form by coordinating many units into
                            agreement. These are not the same kind of stability — they are
                            different <em>morphologies</em> of stability.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Point attractor</h3>
                        <p className="leading-relaxed text-sm">
                            The simplest case. A linear restoring force drives the state
                            back toward a target:
                        </p>
                        <Equation mode="block" math="\frac{dx}{dt} = -k(x - x^*) + \xi(t)" />
                        <p className="leading-relaxed text-sm mt-2">
                            The Lyapunov function <Equation math="V = \tfrac{1}{2}k(x - x^*)^2" /> decreases
                            monotonically along trajectories. The decay is exponential with
                            time constant <Equation math="\tau = 1/k" />. This is
                            stability as <em>convergence to rest</em> — the system has a
                            single equilibrium and every initial condition flows toward it.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Bistable switch</h3>
                        <p className="leading-relaxed text-sm">
                            A particle in a double-well potential with damping and noise:
                        </p>
                        <Equation mode="block" math="V(x) = a(x^2 - 1)^2 + \text{tilt} \cdot x" />
                        <Equation mode="block" math="\frac{d^2x}{dt^2} = -\gamma \frac{dx}{dt} - \frac{dV}{dx} + \xi(t)" />
                        <p className="leading-relaxed text-sm mt-2">
                            Kramers escape theory (1940) gives the transition rate between
                            wells: <Equation math="\text{rate} \propto \exp(-2\Delta V / \sigma^2)" />,
                            where <Equation math="\Delta V" /> is the barrier height
                            and <Equation math="\sigma^2" /> the noise intensity. This
                            is stability as <em>basin selection</em> — the system has
                            multiple stable states, and identity depends on which valley
                            you occupy.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Limit cycle</h3>
                        <p className="leading-relaxed text-sm">
                            The Hopf normal form in complex notation:
                        </p>
                        <Equation mode="block" math="\frac{dz}{dt} = (\mu - |z|^2)\,z + i\omega z + \xi(t)" />
                        <p className="leading-relaxed text-sm mt-2">
                            When <Equation math="\mu > 0" />, the origin is unstable
                            and trajectories converge to a stable orbit of
                            radius <Equation math="r^* = \sqrt{\mu}" />.
                            The Floquet exponent for radial
                            perturbations is <Equation math="\lambda_r = -2\mu" />,
                            governing how fast the system returns to the orbit after
                            a kick. This is stability as <em>rhythm</em> — the system
                            never rests, but its pattern of motion is self-restoring.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Consensus network</h3>
                        <p className="leading-relaxed text-sm">
                            DeGroot dynamics with an external anchor:
                        </p>
                        <Equation mode="block" math="\frac{dx_i}{dt} = c(\bar{x} - x_i) + s(a - x_i) + \xi_i(t)" />
                        <p className="leading-relaxed text-sm mt-2">
                            Each agent <Equation math="i" /> is pulled toward the group
                            mean <Equation math="\bar{x}" /> with coupling <Equation math="c" /> and
                            toward an anchor <Equation math="a" /> with
                            stubbornness <Equation math="s" />. The effective convergence
                            rate is <Equation math="\lambda = c(1 - 1/N) + s" />.
                            This is stability as <em>coordination</em> — the stable
                            object is a collective configuration, not any single unit.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The philosophical bridge</h3>
                        <p className="leading-relaxed text-sm">
                            &ldquo;Becoming&rdquo; becomes legible when a process can
                            repeatedly recover its own form. That is the bridge from
                            dynamics to entityhood. A circle drawn on paper is a static
                            shape. A droplet becoming round under surface tension is a
                            self-stabilizing process. The distinction matters: the droplet
                            <em> maintains </em> its form through active correction, not
                            through inertness.
                        </p>
                        <p className="leading-relaxed text-sm mt-2">
                            The four patterns here represent four ways a system can
                            achieve this: by relaxing to a point, by selecting a basin,
                            by sustaining a rhythm, or by coordinating across units.
                            Each is a morphology of stability — a distinct way that
                            &ldquo;holding form&rdquo; can be realized in a dynamical system.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Open questions</h3>
                        <p className="leading-relaxed text-sm">
                            This playground covers four canonical patterns, but stability
                            in real systems involves additional morphologies: metastability
                            (long-lived transients that aren&rsquo;t true equilibria),
                            self-organized criticality (systems that tune themselves to
                            the edge of instability), excitable systems (stable rest with
                            threshold-triggered excursions), and autopoiesis (systems that
                            actively reconstruct their own boundary). Each deserves its own
                            exploration.
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
            title="Morphologies of stability"
            subtitle="canonical patterns by which dynamical systems hold form through disturbance"
            description={
                <>
                    <a href="https://doi.org/10.1201/9780429492563" className="underline" target="_blank" rel="noopener noreferrer">
                        2015, Strogatz, Nonlinear Dynamics and Chaos
                    </a>
                    {' · '}
                    <a href="https://doi.org/10.1016/S0031-8914(40)90098-2" className="underline" target="_blank" rel="noopener noreferrer">
                        1940, Kramers, Brownian motion in a field of force
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
                    running={running}
                    onToggleRunning={toggleRunning}
                    onPerturb={handlePerturb}
                    onRandomize={handleRandomize}
                    onReset={handleReset}
                    onSaveSnapshot={saveSnapshot}
                    onClearSnapshot={clearSnapshot}
                />
            }
        />
    );
}
