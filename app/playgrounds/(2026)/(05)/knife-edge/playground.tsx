'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';

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
    LATTICE_SIZE,
    LiveMetrics,
    presetParams,
    analyticalMetrics,
    computeNarrative,
    computeSensitivity,
    computeSweep,
    makeLattice,
    stepLattice,
    injectPulse,
    resetLattice,
    correlationLength,
    amplitude as latticeAmplitude,
    energy as latticeEnergy,
    makeAvalancheBuffer,
    pushAvalanche,
    clearAvalancheBuffer,
    logBinAvalanches,
    fitTauExponent,
    patchSummary,
    sheafLaplacian,
    symmetricEigenvalues,
    spectrumStats,
    ACTIVE_THRESHOLD,
} from './logic';
import { assumptions } from './assumptions';
import { calibrationCases } from './calibration';
import { versions, changelog } from './versions';


interface Props {
    sourceContext?: PlaygroundSourceContext;
}

const EMPTY_LIVE: LiveMetrics = {
    amplitude: 0,
    energy: 0,
    correlationLength: 0,
    activeFraction: 0,
    tauObserved: null,
    avalancheBins: [],
    patches: [],
    eigenvalues: [],
    kernelDim: 1,
    spectralGap: 0,
};

export default function KnifeEdgePlayground({ sourceContext }: Props) {
    const [params, setParams] = useState<Params>(() => presetParams('critical'));
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
    const [sweepParam, setSweepParam] = useState<SweepableParam>('gain');
    const [live, setLive] = useState<LiveMetrics>(EMPTY_LIVE);

    const fieldRef = useRef<Float32Array>(makeLattice());
    const avalancheRef = useRef(makeAvalancheBuffer());
    const lastSpontaneousRef = useRef<number>(0);
    const paramsRef = useRef(params);
    const rafRef = useRef<number | null>(null);

    paramsRef.current = params;

    const analytical = useMemo(() => analyticalMetrics(params), [params]);
    const sensitivityBars = useMemo(() => computeSensitivity(params), [params]);
    const sweep = useMemo(() => computeSweep(params, sweepParam), [params, sweepParam]);
    const narrative = useMemo(() => computeNarrative(analytical, live), [analytical, live]);

    // Calibration: for each case, predict tau from analytical and report alongside expected
    const calibrationResults = useMemo(() => {
        return calibrationCases.map((c) => {
            // Each case maps to a regime; we predict tau as the analytical tau
            // for a representative (gain, damping) in that regime.
            const proxyParams: Params =
                c.expectedRegime === 'critical'
                    ? { ...params, gain: 1.04, damping: 0.04 }
                    : c.expectedRegime === 'subcritical'
                        ? { ...params, gain: 0.65, damping: 0.04 }
                        : { ...params, gain: 1.3, damping: 0.04 };
            const m = analyticalMetrics(proxyParams);
            return {
                name: c.name,
                description: c.description,
                predicted: m.tauTheoretical,
                expected: c.expectedTau,
                source: c.source,
            };
        });
    }, [params]);

    // Initialise lattice on mount and on preset change
    useEffect(() => {
        resetLattice(fieldRef.current);
        clearAvalancheBuffer(avalancheRef.current);
    }, [params.preset]);

    // Simulation loop
    useEffect(() => {
        let frame = 0;
        const tick = () => {
            const p = paramsRef.current;
            const stepsPerFrame = Math.max(1, Math.round(p.speed * 2));
            for (let s = 0; s < stepsPerFrame; s++) {
                stepLattice(fieldRef.current, p);
                pushAvalanche(avalancheRef.current, fieldRef.current);

                // Random spontaneous pulse
                lastSpontaneousRef.current += 1;
                if (
                    lastSpontaneousRef.current > 280 &&
                    Math.random() < 0.0035
                ) {
                    injectPulse(fieldRef.current, Math.floor(Math.random() * LATTICE_SIZE), p.pulseWidth, 0.55);
                    lastSpontaneousRef.current = 0;
                }
            }

            // Update derived metrics every 6 frames (~10 Hz)
            if (frame % 6 === 0) {
                const u = fieldRef.current;
                const bins = logBinAvalanches(avalancheRef.current);
                const tau = fitTauExponent(bins);
                const patches = patchSummary(u);
                const L = sheafLaplacian(patches);
                const eigs = symmetricEigenvalues(L);
                const ss = spectrumStats(eigs);
                let active = 0;
                for (let i = 0; i < u.length; i++) if (Math.abs(u[i]) > ACTIVE_THRESHOLD) active++;
                setLive({
                    amplitude: latticeAmplitude(u),
                    energy: latticeEnergy(u),
                    correlationLength: correlationLength(u),
                    activeFraction: active / u.length,
                    tauObserved: tau,
                    avalancheBins: bins,
                    patches,
                    eigenvalues: eigs,
                    kernelDim: ss.kernelDim,
                    spectralGap: ss.spectralGap,
                });
            }
            frame++;
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    const onPulse = useCallback(() => {
        injectPulse(fieldRef.current, Math.floor(LATTICE_SIZE / 2), params.pulseWidth, 1.4);
        lastSpontaneousRef.current = 0;
    }, [params.pulseWidth]);

    const onReset = useCallback(() => {
        resetLattice(fieldRef.current);
        clearAvalancheBuffer(avalancheRef.current);
    }, []);

    const saveSnapshot = useCallback(() => {
        setSnapshot({ params, analytical, live, label: params.preset });
    }, [params, analytical, live]);

    const clearSnapshot = useCallback(() => setSnapshot(null), []);

    const onPickPhasePoint = useCallback((gain: number, damping: number) => {
        setParams((prev) => ({ ...prev, gain, damping }));
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
                        analytical={analytical}
                        live={live}
                        fieldRef={fieldRef}
                        snapshot={snapshot}
                        sweepParam={sweepParam}
                        onSweepParamChange={setSweepParam}
                        sweep={sweep}
                        sensitivityBars={sensitivityBars}
                        calibration={calibrationResults}
                        assumptions={assumptions}
                        versions={versions}
                        onPickPhasePoint={onPickPhasePoint}
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
                        <h3 className="text-lime-400 font-semibold mb-3">From threshold to scale invariance</h3>
                        <p className="leading-relaxed text-sm">
                            Many systems share one structural fact: there is a control parameter
                            with a critical value. Below it, perturbations decay and the system has
                            a typical scale of response. Above it, perturbations amplify and the
                            system commits to a new regime. <em>At</em> the threshold, scale
                            disappears: correlation length diverges, response becomes unbounded,
                            and the same equations describe magnets, branching cascades, neuronal
                            avalanches, percolation networks, and pre-seizure cortex.
                        </p>
                        <div className="border-l-2 border-lime-500/40 pl-4 mt-3">
                            <p className="text-lime-200/80 text-sm">
                                Subcritical: the medium absorbs the message.
                                <br />
                                Critical: the medium passes the question to itself.
                                <br />
                                Supercritical: the medium becomes the fuel.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Power laws as a fingerprint</h3>
                        <p className="leading-relaxed text-sm">
                            Off criticality, avalanche sizes follow distributions with a
                            characteristic scale, exponential tails, Gaussian shoulders. At
                            criticality the cutoff disappears and you get a power law:
                        </p>
                        <Equation mode="block" math="P(s) \sim s^{-\tau}" />
                        <p className="leading-relaxed text-sm mt-2">
                            For mean-field branching processes the exponent is{' '}
                            <Equation math="\tau = 3/2" />. The avalanches tab fits this from
                            the live distribution; nudge gain through 1 and watch the empirical
                            slope drift toward the theoretical line.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Sheaves illuminate criticality</h3>
                        <p className="leading-relaxed text-sm">
                            A cellular sheaf assigns local stalks to overlapping patches, with
                            restriction maps that demand agreement on overlaps. The sheaf
                            Laplacian satisfies
                        </p>
                        <Equation mode="block" math="\ker L_{\mathcal F} \cong H^0(X;\mathcal F)" />
                        <p className="leading-relaxed text-sm mt-2">
                            so its kernel is the space of <em>global sections</em>: distributed
                            states that are locally consistent everywhere. Near criticality, the
                            wave field develops scale-free fluctuations across patch boundaries,
                            restriction maps weaken, and the spectral gap collapses, many
                            almost-global sections, but no rigid global one. This is the
                            structural counterpart to the long-range correlations you see in the
                            lattice.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Why this matters for consciousness</h3>
                        <p className="leading-relaxed text-sm">
                            Cortical recordings show avalanche distributions with branching ratio
                            σ ≈ 1 and an exponent close to -3/2 (Beggs &amp; Plenz, 2003).
                            Anaesthetic agents that abolish consciousness, propofol, xenon -
                            shift dynamics toward the subcritical exponential regime; ketamine,
                            which preserves dream-like experience, leaves dynamics near
                            criticality (Maschke et al., 2024). This does not show that
                            criticality <em>is</em> consciousness, but it suggests it is an{' '}
                            <em>enabling regime</em>: the place where local activity can both
                            differentiate and integrate, and where local-to-global compatibility
                            (sheaf gluing) becomes flexible rather than rigid.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">What is solid, what is speculative</h3>
                        <p className="leading-relaxed text-sm">
                            The wave equation, branching-process exponent, and bifurcation
                            analysis are textbook physics. The Beggs/Plenz avalanche evidence and
                            the Maschke anaesthesia results are empirical. The cellular sheaf
                            Laplacian construction is mathematically standard
                            (Hansen &amp; Ghrist, 2019). The interpretive claim, that the spectral
                            gap of a sheaf over neural activity tracks consciousness, is a
                            speculative bridge, well-motivated but unproven. The 96-site lattice
                            is a cartoon, not a brain.
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
            title="knife edge"
            subtitle="wave fate across subcritical, critical, and supercritical regimes, with sheaf-laplacian diagnostics"
            description={
                <>
                    based on{' '}
                    <a
                        href="https://www.jneurosci.org/content/23/35/11167"
                        className="underline"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        2003, Beggs &amp; Plenz, Neuronal Avalanches in Neocortical Circuits
                    </a>
                </>
            }
            sections={sections}
            settings={
                <Settings
                    params={params}
                    onParamsChange={setParams}
                    analytical={analytical}
                    live={live}
                    narrative={narrative}
                    snapshot={snapshot}
                    onSaveSnapshot={saveSnapshot}
                    onClearSnapshot={clearSnapshot}
                    onPulse={onPulse}
                    onReset={onReset}
                />
            }
        />
    );
}
