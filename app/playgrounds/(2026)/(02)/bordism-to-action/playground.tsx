'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import Equation from '@/components/Equation';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import {
    ClassicalParams,
    ClassicalState,
    TQFTParams,
    DEFAULT_CLASSICAL,
    DEFAULT_TQFT,
    DEFAULT_INITIAL_VELOCITY,
    computeTQFT,
    stepClassical,
} from './logic';

export default function BordismToActionPlayground() {
    const [classical, setClassicalRaw] = useState<ClassicalParams>({ ...DEFAULT_CLASSICAL });
    const setClassical = useCallback((params: ClassicalParams) => {
        setClassicalRaw((prev) => {
            if (prev.direction !== params.direction) {
                setIsPlaying(false);
                setClassicalState({ position: 0, velocity: 0 });
            }
            return params;
        });
    }, []);
    const [tqft, setTqft] = useState<TQFTParams>({ ...DEFAULT_TQFT });
    const [isPlaying, setIsPlaying] = useState(false);
    const [classicalState, setClassicalState] = useState<ClassicalState>({
        position: 0,
        velocity: 0,
    });
    const [initialVelocity, setInitialVelocity] = useState(DEFAULT_INITIAL_VELOCITY);

    const rafRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);

    useEffect(() => {
        if (!isPlaying) {
            cancelAnimationFrame(rafRef.current);
            lastTimeRef.current = 0;
            return;
        }

        const loop = (time: number) => {
            if (lastTimeRef.current === 0) {
                lastTimeRef.current = time;
            }

            const elapsed = Math.min((time - lastTimeRef.current) / 1000, 0.05);
            lastTimeRef.current = time;

            setClassicalState((prev) => {
                if (classical.direction === 'downhill' && prev.position >= 100) {
                    setIsPlaying(false);
                    return prev;
                }
                if (classical.direction === 'uphill') {
                    // Returned to start
                    if (prev.position <= 0 && prev.velocity <= 0 && elapsed > 0) {
                        setIsPlaying(false);
                        return { position: 0, velocity: 0 };
                    }
                    // Friction-held: velocity ~0 and position > 0
                    if (Math.abs(prev.velocity) < 0.01 && prev.position > 0 && elapsed > 0) {
                        const rad = (classical.angle * Math.PI) / 180;
                        const gSin = classical.gravity * Math.sin(rad);
                        const frictionForce = classical.friction * classical.gravity * Math.cos(rad);
                        if (gSin <= frictionForce) {
                            setIsPlaying(false);
                            return prev;
                        }
                    }
                }
                return stepClassical(prev, classical, elapsed);
            });

            rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(rafRef.current);
        };
    }, [isPlaying, classical]);

    const effectiveTqft = useMemo(() => {
        if (isPlaying || classicalState.position > 0) {
            const simulationBraids = Math.floor(classicalState.position / 5);
            return { level: tqft.level, braids: tqft.braids + simulationBraids };
        }
        return tqft;
    }, [tqft, isPlaying, classicalState.position]);

    const tqftResult = useMemo(() => computeTQFT(effectiveTqft, classical.mass), [effectiveTqft, classical.mass]);

    const handlePlayPause = useCallback(() => {
        setIsPlaying((prev) => {
            if (!prev && classical.direction === 'uphill' && classicalState.velocity === 0) {
                setClassicalState((s) => ({ ...s, velocity: initialVelocity }));
            }
            return !prev;
        });
    }, [classical.direction, classicalState.velocity, initialVelocity]);

    const handleReset = useCallback(() => {
        setIsPlaying(false);
        setClassicalState({ position: 0, velocity: 0 });
    }, []);

    const sections = useMemo(
        () => [
            {
                id: 'intro',
                type: 'intro' as const,
            },
            {
                id: 'canvas',
                type: 'canvas' as const,
                content: (
                    <Viewer
                        classical={classical}
                        tqft={effectiveTqft}
                        isPlaying={isPlaying}
                        classicalState={classicalState}
                        tqftResult={tqftResult}
                        direction={classical.direction}
                    />
                ),
            },
            {
                id: 'outro',
                type: 'outro' as const,
                content: (
                    <div className="space-y-8 text-gray-300">
                        <div className="border-l-2 border-lime-500/50 pl-4">
                            <h3 className="text-lime-400 font-semibold mb-3">
                                Classical Mechanics
                            </h3>
                            <p className="leading-relaxed text-sm mb-3">
                                On the left side, a block slides down an inclined plane under
                                Newton&apos;s second law. The state of the world is defined by a
                                snapshot: if you know the position and velocity right now, you can
                                predict the next millisecond.
                            </p>
                            <Equation
                                mode="block"
                                math="F = ma = mg\sin\theta - \mu\, mg\cos\theta"
                            />
                            <p className="leading-relaxed text-sm mt-3">
                                The simulation loop integrates this differential equation frame by
                                frame, producing a specific trajectory through space.
                            </p>
                        </div>

                        <div className="border-l-2 border-lime-500/50 pl-4">
                            <h3 className="text-lime-400 font-semibold mb-3">
                                Chern-Simons Theory
                            </h3>
                            <p className="leading-relaxed text-sm mb-3">
                                On the right side, we stop looking at snapshots and start looking at
                                bordisms &mdash; the &ldquo;shape&rdquo; of time. In TQFT, we
                                don&apos;t care about velocity at a given moment. We care about
                                the worldline &mdash; the 1D string a particle leaves behind in 3D
                                space.
                            </p>
                            <Equation
                                mode="block"
                                math="Z(S^3) = \sqrt{\frac{2}{k+2}}\;\sin\frac{\pi}{k+2}"
                            />
                            <p className="leading-relaxed text-sm mt-3">
                                Every time two worldlines cross, the universe picks up a complex
                                phase determined by the R-matrix. The conformal weight{' '}
                                <Equation math="h = \frac{3/4}{k+2}" /> governs the braid
                                eigenvalue:
                            </p>
                            <Equation
                                mode="block"
                                math="\text{amplitude} = e^{2\pi i\, h \cdot \text{braids}}"
                            />
                        </div>

                        <div className="border-l-2 border-lime-500/50 pl-4">
                            <h3 className="text-lime-400 font-semibold mb-3">
                                The Rosetta Stone
                            </h3>
                            <p className="leading-relaxed text-sm mb-3">
                                The playground is a mathematical Rosetta Stone. It translates
                                between the language of Calculus (how things move through space) and
                                Category Theory (how things are connected).
                            </p>
                            <div className="overflow-x-auto">
                                <table className="text-sm w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-lime-500/20">
                                            <th className="text-left py-2 pr-4 text-lime-400 font-semibold">
                                                Variable
                                            </th>
                                            <th className="text-left py-2 pr-4 text-lime-200/70">
                                                Classical
                                            </th>
                                            <th className="text-left py-2 text-lime-200/70">
                                                TQFT
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-300">
                                        <tr className="border-b border-lime-500/10">
                                            <td className="py-2 pr-4 text-lime-100">
                                                Angle / Level (k)
                                            </td>
                                            <td className="py-2 pr-4">
                                                Changes the force of gravity
                                            </td>
                                            <td className="py-2">
                                                Resolution of the quantum space
                                            </td>
                                        </tr>
                                        <tr className="border-b border-lime-500/10">
                                            <td className="py-2 pr-4 text-lime-100">
                                                Mass / Spin (j)
                                            </td>
                                            <td className="py-2 pr-4">
                                                Inertia against air drag
                                            </td>
                                            <td className="py-2">
                                                Representation dimension; scales conformal weight
                                            </td>
                                        </tr>
                                        <tr className="border-b border-lime-500/10">
                                            <td className="py-2 pr-4 text-lime-100">
                                                Friction / Braids
                                            </td>
                                            <td className="py-2 pr-4">
                                                A force that drains energy
                                            </td>
                                            <td className="py-2">
                                                A topological twist that rotates the quantum state
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 pr-4 text-lime-100">
                                                Trajectory / Bordism
                                            </td>
                                            <td className="py-2 pr-4">
                                                The line the block must follow
                                            </td>
                                            <td className="py-2">
                                                The shape of the spacetime container
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="border-l-2 border-lime-500/50 pl-4">
                            <h3 className="text-lime-400 font-semibold mb-3">Notes</h3>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>
                                    This is a toy model. The classical side is a faithful Euler
                                    integration; the TQFT side is a simplified illustration of
                                    Chern-Simons invariants.
                                </li>
                                <li>
                                    Inspired by Dan Freed&apos;s lectures on fully extended
                                    topological quantum field theories and the cobordism
                                    hypothesis.
                                </li>
                                <li>
                                    Setting <Equation math="k = 24" /> is significant: this is
                                    the level where certain anomalies cancel, allowing the theory
                                    to be defined on simpler types of manifolds.
                                </li>
                                <li>
                                    The R-matrix in this playground is the mathematical version of
                                    a quantum gate &mdash; braiding anyons to create logic gates
                                    is the basis of topological quantum computing.
                                </li>
                            </ul>
                        </div>
                    </div>
                ),
            },
        ],
        [classical, effectiveTqft, isPlaying, classicalState, tqftResult],
    );

    return (
        <PlaygroundLayout
            title="bordism to action"
            subtitle="comparing classical mechanics with fully local TQFT"
            sections={sections}
            settings={
                <Settings
                    classical={classical}
                    onClassicalChange={setClassical}
                    tqft={tqft}
                    onTQFTChange={setTqft}
                    isPlaying={isPlaying}
                    onPlayPause={handlePlayPause}
                    onReset={handleReset}
                    initialVelocity={initialVelocity}
                    onInitialVelocityChange={setInitialVelocity}
                />
            }
        />
    );
}
