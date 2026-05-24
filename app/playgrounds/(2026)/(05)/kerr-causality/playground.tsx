'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import ModelChangelog from '@/components/ModelChangelog';
import ResearchPromptButton from '@/components/ResearchPromptButton';
import { PlaygroundSourceContext } from '@/lib/readPlaygroundSource';

import Settings from './components/Settings';
import Viewer from './components/Viewer';
import {
    DEFAULT_PARAMS,
    Params,
    SCAN_MAX_R,
    SCAN_MIN_R,
    Snapshot,
    SweepableField,
    computeNarrative,
    computeSensitivity,
    computeSweep,
    generateReading,
    getRoots,
    radialPotential,
    scoreModel,
} from './logic';
import { assumptions } from './assumptions';
import { calibrationCases } from './calibration';
import { versions, changelog } from './versions';


const FRAMES_PER_LOOP = 180; // ~3 seconds at 60fps for a full photon cycle


interface Props {
    sourceContext?: PlaygroundSourceContext;
}

export default function KerrCausalityPlayground({ sourceContext }: Props) {
    const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
    const [phase, setPhase] = useState(0);
    const [playing, setPlaying] = useState(true);
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
    const [sweepField, setSweepField] = useState<SweepableField>('E');

    const metrics = useMemo(() => scoreModel(params), [params]);
    const narrative = useMemo(() => computeNarrative(params, metrics), [params, metrics]);
    const reading = useMemo(() => generateReading(params, metrics), [params, metrics]);
    const sweep = useMemo(() => computeSweep(params, sweepField), [params, sweepField]);
    const sensitivityBars = useMemo(() => computeSensitivity(params), [params]);

    const calibrationResults = useMemo(
        () =>
            calibrationCases.map((c) => ({
                name: c.name,
                description: c.description,
                predicted: scoreModel(c.params).allowedSpan,
                expected: c.expectedAllowedSpan,
                source: c.source,
            })),
        [],
    );

    // auto-replay on parameter change (skip first render).
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        setPhase(0);
        setPlaying(true);
    }, [params]);

    // animation loop: continuously cycle phase 0 -> 1 -> 0.
    const frameRef = useRef<number | null>(null);
    useEffect(() => {
        if (!playing) {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
            return;
        }
        const step = () => {
            setPhase((prev) => {
                const next = prev + 1 / FRAMES_PER_LOOP;
                return next >= 1 ? 0 : next;
            });
            frameRef.current = requestAnimationFrame(step);
        };
        frameRef.current = requestAnimationFrame(step);
        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [playing]);

    const saveSnapshot = useCallback(() => {
        const fn = (r: number) => radialPotential(r, params);
        const roots = getRoots(fn, SCAN_MIN_R, SCAN_MAX_R);
        setSnapshot({
            params,
            metrics,
            roots,
            label: params.case,
        });
    }, [params, metrics]);

    const clearSnapshot = useCallback(() => setSnapshot(null), []);

    const onPlayToggle = useCallback(() => setPlaying((p) => !p), []);
    const onReplay = useCallback(() => {
        setPhase(0);
        setPlaying(true);
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
                        metrics={metrics}
                        phase={phase}
                        snapshot={snapshot}
                        reading={reading}
                        sweepField={sweepField}
                        onSweepFieldChange={setSweepField}
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
                        <h3 className="text-lime-400 font-semibold mb-3">What the diagram shows</h3>
                        <p className="leading-relaxed text-sm">
                            The stacked tiles are the causal sectors of the maximally extended
                            Kerr solution: exterior universes on top and bottom, between-horizon
                            sectors in the middle, and the deep inner sheets around the ring
                            singularity. The black lines are outer horizons, the orange lines are
                            inner horizons, and the red dashed curves are the photon&apos;s radial
                            turning surfaces. It is a topological map, not a metric-accurate
                            embedding: distances between tiles do not reflect proper distance.
                        </p>
                        <div className="border-l-2 border-lime-500/40 pl-4 mt-3">
                            <p className="text-lime-200/80 text-sm">
                                Light is allowed exactly where the radial potential is non-negative.
                                The horizons are not walls; they are surfaces where which coordinate
                                behaves like time changes.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The radial potential is the floor</h3>
                        <p className="leading-relaxed text-sm">
                            Every legal null orbit lives in an allowed corridor: a connected interval
                            of r where R(r) is non-negative. Turning points are real roots of R(r),
                            where the radial momentum reverses. The cases tab ranks six scenarios by
                            the width of that corridor. The figure-like ergoregion sits in a corridor
                            that crosses both horizons. Switch to the positive-energy comparison and
                            the upper turning point disappears: the photon can escape to infinity.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Three constants of motion</h3>
                        <p className="leading-relaxed text-sm">
                            A null geodesic in Kerr carries three independent conserved quantities:
                            energy E at infinity, axial angular momentum L, and the Carter constant Q.
                            The Hamilton-Jacobi equation separates and the radial motion reduces to a
                            single ordinary differential equation in r. The four sliders are exactly
                            those three constants plus the spin a of the geometry the photon moves in.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The ergoregion makes E exotic</h3>
                        <p className="leading-relaxed text-sm">
                            Outside the ergoregion a real photon must have positive E. Inside the
                            ergoregion the time-translation Killing vector becomes spacelike, so E
                            can be zero or even negative. The negative-energy case in this playground
                            is the orbit fragment that, in the Penrose process, falls into the hole
                            and reduces its mass while a sibling fragment escapes with more energy
                            than the parent had. The borderline E = 0 case is what the original
                            figure shows.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Mathematical, not astrophysical</h3>
                        <p className="leading-relaxed text-sm">
                            This is the exact vacuum Kerr metric. Real rotating black holes are not
                            expected to have such a clean traversable inner-horizon structure: the
                            Cauchy horizon at r- is believed to be violently unstable through mass
                            inflation. Read the diagram as the geometry the Kerr equations allow on
                            paper, not as a tunnel through any real astrophysical hole.
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
            title="Kerr causality"
            subtitle="horizons, null paths, and the causal structure of rotating black holes"
            description={
                <a
                    href="https://doi.org/10.1103/PhysRev.174.1559"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Carter, Global structure of the Kerr family of gravitational fields (1968)
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
                    phase={phase}
                    onPhaseChange={setPhase}
                    playing={playing}
                    onPlayToggle={onPlayToggle}
                    onReplay={onReplay}
                />
            }
            researchUrl="/playgrounds/kerr-causality/research"
        />
    );
}
