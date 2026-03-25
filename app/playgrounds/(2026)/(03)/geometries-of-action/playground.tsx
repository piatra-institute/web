'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Button from '@/components/Button';
import ModelChangelog from '@/components/ModelChangelog';
import Equation from '@/components/Equation';

import Settings from './components/Settings';
import Viewer from './components/Viewer';

import {
    Params,
    Snapshot,
    SweepableParam,
    DEFAULT_PARAMS,
    presetParams,
    generateManifold,
    computeMetrics,
    computeHeatmap,
    computeSingleNeuronTrace,
    computeTimeline,
    computeNarrative,
    computeSweep,
    computeSensitivity,
    transformSubjectB,
    clamp,
} from './logic';

import { assumptions } from './assumptions';
import { calibrationCases } from './calibration';
import { versions, changelog } from './versions';

import { PlaygroundSourceContext } from '@/lib/readPlaygroundSource';
import ResearchPromptButton from '@/components/ResearchPromptButton';


export default function Playground({ sourceContext }: { sourceContext?: PlaygroundSourceContext }) {
    const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
    const [sweepParam, setSweepParam] = useState<SweepableParam>('residual');
    const [animPlaying, setAnimPlaying] = useState(true);
    const [phase, setPhase] = useState(0);
    const animFrameRef = useRef<number | null>(null);
    const paramsRef = useRef(params);
    paramsRef.current = params;

    useEffect(() => {
        if (!animPlaying) {
            if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
            return;
        }
        let last = performance.now();
        const loop = (now: number) => {
            const dt = (now - last) / 1000;
            last = now;
            const p = paramsRef.current;
            const effectiveSpeed = p.speed * (1 - p.cooling * 0.85);
            setPhase(prev => (prev + dt * effectiveSpeed * 0.22) % 1);
            animFrameRef.current = requestAnimationFrame(loop);
        };
        animFrameRef.current = requestAnimationFrame(loop);
        return () => {
            if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
        };
    }, [animPlaying]);

    const manifold = useMemo(() => generateManifold(params), [params]);
    const metrics = useMemo(() => computeMetrics(params), [params]);
    const narrative = useMemo(() => computeNarrative(metrics, params), [metrics, params]);
    const subjectBCurve = useMemo(() => transformSubjectB(manifold.curve3D, params), [manifold, params]);
    const timeline = useMemo(() => computeTimeline(params), [params]);
    const sweep = useMemo(() => computeSweep(params, sweepParam), [params, sweepParam]);
    const sensitivityBars = useMemo(() => computeSensitivity(params), [params]);

    const displayedNeurons = clamp(Math.round(params.neurons / 8), 8, 14);
    const heatmap = useMemo(
        () => computeHeatmap(manifold, params, phase, displayedNeurons),
        [manifold, params, phase, displayedNeurons],
    );
    const singleNeuronTrace = useMemo(
        () => computeSingleNeuronTrace(manifold, params, phase),
        [manifold, params, phase],
    );

    const calibrationResults = useMemo(() => calibrationCases.map(c => ({
        name: c.name,
        description: c.description,
        predicted: computeMetrics({
            ...DEFAULT_PARAMS,
            ...c.params,
        }).decoderConfidence,
        expected: c.expected,
        source: c.source,
    })), []);

    const saveSnapshot = useCallback(() => {
        setSnapshot({ params, metrics, label: params.preset });
    }, [params, metrics]);

    const clearSnapshot = useCallback(() => {
        setSnapshot(null);
    }, []);

    const animControls = (
        <div className="flex items-center gap-4">
            <Button
                label={animPlaying ? 'pause' : 'play'}
                size="xs"
                onClick={() => setAnimPlaying(p => !p)}
            />
            <span className="text-xs font-mono text-lime-200/60">
                {manifold.label} &middot; phase {(phase * 100).toFixed(0)}%
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
                        manifold={manifold}
                        phase={phase}
                        params={params}
                        metrics={metrics}
                        heatmap={heatmap}
                        singleNeuronTrace={singleNeuronTrace}
                        timeline={timeline}
                        subjectBCurve={subjectBCurve}
                        sensitivityBars={sensitivityBars}
                        assumptions={assumptions}
                        calibrationResults={calibrationResults}
                        versions={versions}
                        snapshot={snapshot}
                        sweep={sweep}
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
                        <h3 className="text-lime-400 font-semibold mb-3">The neural manifold hypothesis</h3>
                        <p className="leading-relaxed text-sm">
                            The central claim is that neural population activity, rather than scattering freely through
                            the high-dimensional space of all possible firing-rate combinations, is confined to a
                            smooth, low-dimensional surface &mdash; a manifold. The intrinsic dimensionality of this
                            surface reflects the degrees of freedom of the task, not the number of neurons recorded.
                        </p>
                        <Equation mode="block" math="\mathbf{x}(t) \in \mathcal{M}^d \subset \mathbb{R}^N, \quad d \ll N" />
                        <p className="leading-relaxed text-sm mt-2">
                            where <Equation math="\mathbf{x}(t)" /> is the population state at time <Equation math="t" />,{' '}
                            <Equation math="\mathcal{M}^d" /> is the <Equation math="d" />-dimensional manifold, and{' '}
                            <Equation math="N" /> is the number of recorded neurons.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Geometry is not projection</h3>
                        <p className="leading-relaxed text-sm">
                            A linear dimensionality reduction like PCA can flatten a curved manifold, collapsing
                            distances and distorting neighborhoods. Nonlinear methods (UMAP, diffusion maps, Isomap)
                            attempt to unfold the intrinsic geometry. The playground&apos;s projection toggle makes this
                            distinction visible: when curvature is high, the linear projection&apos;s distortion metric
                            climbs while the nonlinear unfolding stays faithful.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Dynamics versus geometry</h3>
                        <p className="leading-relaxed text-sm">
                            Gallego and colleagues demonstrated that cooling the striatum during an interval-timing
                            task slows traversal speed along the manifold without substantially altering the manifold&apos;s
                            shape. This dissociation between dynamics and geometry is central to the causal reading
                            of the framework: the manifold constrains which states are reachable, while dynamics
                            determine how fast they are reached.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Cross-subject invariance</h3>
                        <p className="leading-relaxed text-sm">
                            If manifolds are ontologically real &mdash; as Gallego argues &mdash; then different individuals
                            performing the same task should exhibit comparable latent structure despite having entirely
                            different neurons. Alignment methods like canonical correlation analysis (CCA) and
                            Procrustes rotation can quantify this overlap. The alignment slider explores how shared
                            task constraints push two trajectories toward a common geometry.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Clinical translation</h3>
                        <p className="leading-relaxed text-sm">
                            In patients with clinically complete spinal cord injuries, residual descending signals
                            may still carry structured low-dimensional information about intended movements. Decoding
                            this residual manifold structure is the basis for emerging neuroprosthetic interfaces
                            where patients control virtual cursors or wheelchairs by attempting to move.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Limitations of this model</h3>
                        <p className="leading-relaxed text-sm">
                            This playground uses simplified parametric formulas, not real electrophysiology data.
                            The manifold is generated analytically rather than extracted from neural recordings via
                            dimensionality reduction. Metric values (decoder confidence, alignment score) are proxies
                            that capture qualitative relationships, not quantitative predictions. The model omits
                            spike-timing correlations, trial-by-trial variability, and the multi-area distributed
                            nature of real manifold computations.
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
            title="geometries of action"
            subtitle="exploring neural manifolds as geometry, dynamics, alignment, and decoding"
            description={
                <a
                    href="https://www.thetransmitter.org/neural-dynamics/neural-manifolds-latest-buzzword-or-pathway-to-understand-the-brain/"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Gallego et al., The Neural Manifold Manifesto
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
                />
            }
        />
    );
}
