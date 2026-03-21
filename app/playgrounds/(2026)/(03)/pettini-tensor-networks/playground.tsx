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
    computeMetrics,
    computeNarrative,
    computeDistribution,
    computeSweep,
    computeSensitivity,
    computeInitialDistribution,
    interpolateDistribution,
    easeInOutCubic,
    ANIMATION_TOTAL_FRAMES,
} from './logic';
import { assumptions } from './assumptions';
import { calibrationCases } from './calibration';
import { versions, changelog } from './versions';


interface Props {
    sourceContext?: PlaygroundSourceContext;
}

export default function PettiniTensorNetworksPlayground({ sourceContext }: Props) {
    const [params, setParams] = useState<Params>(() => presetParams('classical-search'));
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
    const [sweepParam, setSweepParam] = useState<SweepableParam>('coupling');

    // Animation state
    const [animPlaying, setAnimPlaying] = useState(false);
    const [animTime, setAnimTime] = useState(1); // start at 1 = steady state shown on load
    const animFrameRef = useRef<number | null>(null);
    const paramsRef = useRef(params);
    paramsRef.current = params;

    const metrics = useMemo(() => computeMetrics(params), [params]);
    const narrative = useMemo(() => computeNarrative(metrics, params), [metrics, params]);
    const distribution = useMemo(() => computeDistribution(params), [params]);
    const sweep = useMemo(() => computeSweep(params, sweepParam), [params, sweepParam]);
    const sensitivityBars = useMemo(() => computeSensitivity(params), [params]);

    const initialDistribution = useMemo(() => computeInitialDistribution(), []);
    const displayDistribution = useMemo(
        () => interpolateDistribution(initialDistribution, distribution, easeInOutCubic(animTime)),
        [initialDistribution, distribution, animTime],
    );

    // Auto-play animation on param change
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
            metrics,
            distribution, // always steady state
            label: params.preset,
        });
    }, [params, metrics, distribution]);

    const clearSnapshot = useCallback(() => {
        setSnapshot(null);
    }, []);

    const loadCalibrationCase = useCallback((name: string) => {
        const found = calibrationCases.find(c => c.name === name);
        if (found) {
            setParams({ ...found.params, preset: params.preset });
        }
    }, [params.preset]);

    const calibrationResults = useMemo(() => calibrationCases.map(c => ({
        name: c.name,
        description: c.description,
        predicted: computeMetrics({ ...c.params, preset: 'classical-search' }).searchTime,
        expected: c.expected,
        source: c.source,
    })), []);

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
                        distribution={displayDistribution}
                        sweep={sweep}
                        metrics={metrics}
                        sensitivityBars={sensitivityBars}
                        assumptions={assumptions}
                        calibrationResults={calibrationResults}
                        versions={versions}
                        snapshot={snapshot}
                        sweepParam={sweepParam}
                        onSweepParamChange={setSweepParam}
                        onLoadCalibrationCase={loadCalibrationCase}
                        animTime={animTime}
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
                        <h3 className="text-lime-400 font-semibold mb-3">From global to local</h3>
                        <p className="leading-relaxed text-sm">
                            A generic quantum state of a chain of{' '}
                            <Equation math="N" /> sites has{' '}
                            <Equation math="d^N" /> coefficients — exponentially
                            large data. Frank Verstraete&rsquo;s key insight is that
                            physically relevant states can be encoded by multiplying
                            small local matrices:
                        </p>
                        <Equation mode="block" math="c_{i_1 \ldots i_N} = \mathrm{Tr}\!\left(A^{i_1} A^{i_2} \cdots A^{i_N}\right)" />
                        <p className="leading-relaxed text-sm mt-2">
                            Each matrix <Equation math="A^{i_k}" /> is chosen by
                            the local state at site <Equation math="k" />. The hidden
                            matrix dimension (bond dimension <Equation math="\chi" />)
                            stores the nontrivial correlations. This is a matrix
                            product state (MPS) — the simplest tensor network.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Biology version</h3>
                        <p className="leading-relaxed text-sm">
                            The same compression logic applies to biological search.
                            A protein searching for a target on DNA has a joint state
                            over position, diffusion mode, conformation, and the local
                            environment at every DNA site. The full probability
                            distribution grows exponentially with the number of sites.
                            A tensor-train approximation replaces this with local tensors:
                        </p>
                        <Equation mode="block" math="P_t(x,m,c,\varphi;\, d_1,\ldots,d_N) \approx \sum_{\alpha} A^{[\text{p}]}_\alpha(x,m,c,\varphi)\, A^{[1]}_\alpha(d_1) \cdots A^{[N]}_\alpha(d_N)" />
                        <p className="leading-relaxed text-sm mt-2">
                            The protein state includes position <Equation math="x" />,
                            diffusion mode <Equation math="m" /> (3D diffusion, 1D
                            sliding, or bound), conformation <Equation math="c" />,
                            and vibrational activation <Equation math="\varphi" />.
                            Each DNA site <Equation math="n" /> carries a motif
                            class <Equation math="\sigma_n" />, frequency
                            bin <Equation math="\omega_n" />, and hydration
                            state <Equation math="h_n" />.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The search generator</h3>
                        <p className="leading-relaxed text-sm">
                            The search process evolves under a stochastic generator
                            with four terms:
                        </p>
                        <Equation mode="block" math="\partial_t P_t = \mathcal{L}\, P_t, \qquad \mathcal{L} = \mathcal{L}_{\text{diff}} + \mathcal{L}_{\text{slide}} + \mathcal{L}_{\text{chem}} + \mathcal{L}_{\text{ED}}" />
                        <p className="leading-relaxed text-sm mt-2">
                            The first three terms are standard: free 3D diffusion in
                            solvent, 1D sliding along nearby DNA, and short-range
                            chemical recognition. The fourth
                            term <Equation math="\mathcal{L}_{\text{ED}}" /> is a
                            Pettini-inspired long-range electrodynamic recruitment that
                            biases the protein toward frequency-compatible target sites.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Pettini interaction term</h3>
                        <p className="leading-relaxed text-sm">
                            The electrodynamic coupling is modeled as a distance-dependent
                            attraction that activates only when there is vibrational
                            activation, coupling strength, and frequency compatibility:
                        </p>
                        <Equation mode="block" math="V_{\text{ED}}(x,n) = -\, g \cdot \varphi \cdot \chi_p(c) \cdot \chi_n(\omega_n, h_n) \cdot S(\Delta\omega) \;/\; (r^3 + \varepsilon)" />
                        <p className="leading-relaxed text-sm mt-2">
                            Here <Equation math="g" /> is the coupling
                            strength, <Equation math="\varphi" /> the activation
                            state, <Equation math="\chi_p" /> and <Equation math="\chi_n" /> are
                            susceptibility functions, <Equation math="S(\Delta\omega)" /> is
                            the spectral overlap, and the <Equation math="r^{-3}" /> dependence
                            reflects dipolar interaction decay. The <Equation math="\varepsilon" /> regularizer
                            prevents divergence at zero distance.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">What is solid, what is speculative</h3>
                        <p className="leading-relaxed text-sm">
                            Tensor-network compression of high-dimensional biological
                            state spaces is mathematically well-founded. Reaction networks,
                            master equations, and structured probabilistic systems are
                            natural targets for these methods. The computational framework
                            is credible today.
                        </p>
                        <p className="leading-relaxed text-sm mt-2">
                            The Pettini-style electrodynamic mechanism — sustained
                            low-frequency collective modes biasing molecular encounters
                            over long distances — remains an open research question.
                            The evidence is stronger in controlled in vitro settings
                            than in living cells, where crowding, ionic screening, and
                            thermal noise present significant challenges.
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
            title="Pettini tensor networks"
            subtitle="tensor network compression of biological search processes with optional long-range electrodynamic recruitment"
            description={
                <>
                    <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8849397" className="underline" target="_blank" rel="noopener noreferrer">
                        2022, Pettini et al., Experimental evidence for long-distance electrodynamic intermolecular forces
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
            researchUrl="/playgrounds/pettini-tensor-networks/research"
        />
    );
}
