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
    speciesParams,
    simulate,
    generateLandscape,
    generateTrajectory,
    computeInvariants,
    computeNarrative,
    computeSweep,
    computeSensitivity,
    easeInOutCubic,
    ANIMATION_TOTAL_FRAMES,
    SPECIES,
} from './logic';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';


interface Props {
    sourceContext?: PlaygroundSourceContext;
}

export default function PhotosyntheticStateSpacePlayground({ sourceContext }: Props) {
    const [params, setParams] = useState<Params>(() => speciesParams('C3'));
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
    const [sweepParam, setSweepParam] = useState<SweepableParam>('lightIntensity');

    // Animation
    const [animPlaying, setAnimPlaying] = useState(false);
    const [animTime, setAnimTime] = useState(1);
    const animFrameRef = useRef<number | null>(null);

    const metrics = useMemo(() => simulate(params), [params]);
    const landscape = useMemo(() => generateLandscape(params), [params]);
    const trajectory = useMemo(() => generateTrajectory(params), [params]);
    const invariants = useMemo(() => computeInvariants(metrics, SPECIES[params.species]), [metrics, params.species]);
    const narrative = useMemo(() => computeNarrative(metrics, params), [metrics, params]);
    const sweep = useMemo(() => computeSweep(params, sweepParam), [params, sweepParam]);
    const sensitivityBars = useMemo(() => computeSensitivity(params), [params]);

    const visibleTrajectorySteps = useMemo(
        () => Math.max(1, Math.ceil(easeInOutCubic(animTime) * trajectory.length)),
        [animTime, trajectory.length],
    );

    // Auto-play on param change
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        setAnimTime(0);
        setAnimPlaying(true);
    }, [params]);

    useEffect(() => {
        if (!animPlaying) {
            if (animFrameRef.current !== null) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
            return;
        }
        const step = () => {
            setAnimTime(prev => {
                const next = prev + 1 / ANIMATION_TOTAL_FRAMES;
                if (next >= 1) { setAnimPlaying(false); return 1; }
                return next;
            });
            animFrameRef.current = requestAnimationFrame(step);
        };
        animFrameRef.current = requestAnimationFrame(step);
        return () => { if (animFrameRef.current !== null) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; } };
    }, [animPlaying]);

    const saveSnapshot = useCallback(() => {
        setSnapshot({ params, metrics, label: SPECIES[params.species].label });
    }, [params, metrics]);

    const clearSnapshot = useCallback(() => { setSnapshot(null); }, []);

    const toggleAnim = useCallback(() => {
        if (animTime >= 1) { setAnimTime(0); setAnimPlaying(true); }
        else { setAnimPlaying(p => !p); }
    }, [animTime]);

    const animControls = (
        <div className="flex items-center gap-4">
            <Button label={animPlaying ? 'pause' : animTime >= 1 ? 'replay' : 'play'} onClick={toggleAnim} size="xs" />
            <input type="range" min={0} max={1} step={0.01} value={animTime}
                onChange={e => { setAnimPlaying(false); setAnimTime(parseFloat(e.target.value)); }}
                className="w-40 h-1 accent-lime-500 cursor-pointer" />
            <span className="text-xs font-mono text-lime-200/60">t = {(animTime * 100).toFixed(0)}%</span>
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
                        params={params}
                        metrics={metrics}
                        landscape={landscape}
                        trajectory={trajectory}
                        invariants={invariants}
                        sweep={sweep}
                        sensitivityBars={sensitivityBars}
                        assumptions={assumptions}
                        versions={versions}
                        sweepParam={sweepParam}
                        onSweepParamChange={setSweepParam}
                        visibleTrajectorySteps={visibleTrajectorySteps}
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
                        <h3 className="text-lime-400 font-semibold mb-3">The Z-scheme</h3>
                        <p className="leading-relaxed text-sm">
                            Oxygenic photosynthesis uses two photosystems in series to
                            move electrons from water to NADP+. The energy diagram
                            traces a Z-shaped path: electrons are excited by PSII
                            (P680, ~1.82 eV), lose energy through the electron
                            transport chain while pumping protons for ATP synthesis,
                            then are re-excited by PSI (P700, ~1.77 eV) before
                            reducing NADP+ to NADPH.
                        </p>
                        <Equation mode="block" math="2H_2O + 2NADP^+ + \sim\!3ADP + \sim\!3P_i \xrightarrow{8\,h\nu} O_2 + 2NADPH + \sim\!3ATP" />
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Why two photosystems?</h3>
                        <p className="leading-relaxed text-sm">
                            The redox span from water
                            (<Equation math="E^\circ = +0.82\text{ V}" />) to
                            NADP+ (<Equation math="E^\circ = -0.32\text{ V}" />) is
                            about 1.14 V. A single photon at 680 nm provides
                            ~1.82 eV — enough in principle, but not enough in practice
                            because each step in the chain dissipates energy. Two
                            photosystems in series solve this by providing two energy
                            boosts, each smaller but collectively sufficient.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Species strategies</h3>
                        <p className="leading-relaxed text-sm">
                            The five species presets represent distinct evolutionary
                            solutions to the same energetic problem.{' '}
                            <strong className="text-lime-200">C3 plants</strong> are
                            the most common strategy but are vulnerable to
                            photorespiration.{' '}
                            <strong className="text-lime-200">C4 plants</strong> concentrate
                            CO2 via bundle-sheath cells, tolerating higher light and
                            temperature.{' '}
                            <strong className="text-lime-200">CAM plants</strong> separate
                            CO2 fixation in time (night) from light reactions (day),
                            enabling extreme drought tolerance.{' '}
                            <strong className="text-lime-200">Cyanobacteria</strong> use
                            carboxysomes as a prokaryotic CCM with fast D1 repair.{' '}
                            <strong className="text-lime-200">Red algae</strong> use
                            phycobilisomes for large antenna cross-sections in low-light
                            aquatic environments.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Photoprotection and homeostasis</h3>
                        <p className="leading-relaxed text-sm">
                            When light exceeds the capacity of carbon fixation, excess
                            excitation generates reactive oxygen species (ROS) that
                            damage proteins and membranes. Plants defend against this
                            through non-photochemical quenching (NPQ), which dissipates
                            excess energy as heat; D1 protein repair turnover, which
                            replaces damaged PSII reaction centers; and cyclic electron
                            flow, which adjusts the ATP:NADPH ratio and contributes to
                            photoprotection via the proton gradient.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Path dependence and bifurcation</h3>
                        <p className="leading-relaxed text-sm">
                            The same steady-state parameters can produce different
                            outcomes depending on the history of light exposure. Damage
                            memory accumulates when ROS production exceeds repair
                            capacity, creating path dependence: a system that experienced
                            a high-light pulse may behave differently from one that
                            reached the same nominal conditions gradually. When ROS
                            production persistently outruns repair, the system can
                            bifurcate into a photoinhibited regime — an attractor from
                            which recovery requires reducing light or increasing repair.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Speculative control nodes</h3>
                        <p className="leading-relaxed text-sm">
                            Three speculative controls explore mechanisms that are not
                            established textbook levers but represent active areas of
                            research. Adaptive excitonic routing imagines fast
                            redistribution of excitation away from overloaded subdomains.
                            Dynamic thylakoid topology imagines membrane restructuring
                            to rebalance transport and repair access. Protonic
                            micro-homeostasis imagines ultrafast buffering of local
                            proton motive fluctuations. These are prompts for
                            systems thinking, not established mechanisms.
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
            title="Photosynthetic state space"
            subtitle="the Z-scheme as a controllable landscape of energy flow, protection, and regime shifts"
            description={
                <>
                    <a href="https://pubmed.ncbi.nlm.nih.gov/28160125/" className="underline" target="_blank" rel="noopener noreferrer">
                        2017, Govindjee &amp; Shevela, Evolution of the Z-scheme of photosynthesis
                    </a>
                    {' · '}
                    <a href="https://pubmed.ncbi.nlm.nih.gov/26864015/" className="underline" target="_blank" rel="noopener noreferrer">
                        2016, Ruban, Nonphotochemical chlorophyll fluorescence quenching
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
                    onSaveSnapshot={saveSnapshot}
                    onClearSnapshot={clearSnapshot}
                />
            }
        />
    );
}
