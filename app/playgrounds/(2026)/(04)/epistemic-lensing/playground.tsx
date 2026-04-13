'use client';

import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Equation from '@/components/Equation';
import Button from '@/components/Button';
import SliderInput from '@/components/SliderInput';
import ModelChangelog from '@/components/ModelChangelog';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import {
    Params, Metrics, Snapshot, TimeStep,
    presetParams, computeMetrics, computeNarrative,
    runSimulation, computeSweep, computeSensitivity,
    SweepableParam, ANIMATION_TOTAL_FRAMES, easeInOutCubic,
} from './logic';
import { assumptions } from './assumptions';
import { calibrationCases } from './calibration';
import { versions, changelog } from './versions';

interface PlaygroundProps {
    sourceContext?: unknown;
}

export default function Playground({ sourceContext }: PlaygroundProps) {
    const [params, setParams] = useState<Params>(() => presetParams('pure-attenuation'));
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
    const [sweepParam, setSweepParam] = useState<SweepableParam>('attenuation');

    // Animation state
    const [animPlaying, setAnimPlaying] = useState(false);
    const [animTime, setAnimTime] = useState(1);
    const animFrameRef = useRef<number | null>(null);

    // Auto-play on param change
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        setAnimTime(0);
        setAnimPlaying(true);
    }, [params]);

    // Animation loop
    useEffect(() => {
        if (!animPlaying) {
            if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
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
        return () => { if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current); };
    }, [animPlaying]);

    // Computed values
    const metrics = useMemo(() => computeMetrics(params), [params]);
    const narrative = useMemo(() => computeNarrative(metrics, params), [metrics, params]);
    const fullTrajectory = useMemo(() => runSimulation(params), [params]);
    const sweep = useMemo(() => computeSweep(params, sweepParam), [params, sweepParam]);
    const sensitivityBars = useMemo(() => computeSensitivity(params), [params]);

    // Animated trajectory: show only up to current animation time
    const displayTrajectory = useMemo(() => {
        const t = easeInOutCubic(animTime);
        const visibleSteps = Math.max(1, Math.round(t * fullTrajectory.length));
        return fullTrajectory.slice(0, visibleSteps);
    }, [fullTrajectory, animTime]);

    // Snapshot
    const saveSnapshot = useCallback(() => {
        setSnapshot({ params, metrics, trajectory: fullTrajectory, label: params.preset });
    }, [params, metrics, fullTrajectory]);

    const clearSnapshot = useCallback(() => {
        setSnapshot(null);
    }, []);

    // Calibration
    const loadCalibrationCase = useCallback((name: string) => {
        const found = calibrationCases.find(c => c.name === name);
        if (found) {
            setParams({ ...found.params, preset: params.preset });
        }
    }, [params.preset]);

    const calibrationResults = useMemo(() => calibrationCases.map(c => ({
        name: c.name,
        description: c.description,
        predicted: computeMetrics({ ...c.params, preset: 'pure-attenuation' }).posteriorDivergence,
        expected: c.expected,
        source: c.source,
    })), []);

    // Animation controls
    const animControls = (
        <div className="flex items-center gap-4">
            <Button
                label={animPlaying ? 'pause' : animTime >= 1 ? 'replay' : 'play'}
                onClick={() => {
                    if (animTime >= 1) {
                        setAnimTime(0);
                        setAnimPlaying(true);
                    } else {
                        setAnimPlaying(!animPlaying);
                    }
                }}
                size="sm"
            />
            <div className="flex-1 max-w-[300px]">
                <SliderInput
                    label=""
                    min={0}
                    max={1}
                    step={0.01}
                    value={animTime}
                    onChange={(v) => {
                        setAnimPlaying(false);
                        setAnimTime(v);
                    }}
                    showDecimals
                />
            </div>
            <div className="text-xs font-mono text-lime-200/40">
                t = {Math.round(animTime * 200)}
            </div>
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
                        trajectory={displayTrajectory}
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
                        <h3 className="text-lime-400 font-semibold mb-3">The Framework</h3>
                        <p className="leading-relaxed text-sm">
                            Epistemic lensing is the systematic deformation of belief-updating induced by the channel between world and agent.
                            The central insight is the distinction between <em>ignorance</em> (a deficit of signal) and <em>distortion</em> (a reshaping of the inferential path).
                            A society suffering from ignorance needs more information. A society suffering from distortion needs <em>differently structured</em> channels.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Five Distortion Operators</h3>
                        <p className="leading-relaxed text-sm mb-3">
                            Any mediating channel can be decomposed into five elementary operations:
                        </p>
                        <div className="border-l-2 border-lime-500/40 pl-4 space-y-2 text-sm">
                            <p><span className="text-lime-400">Attenuation</span> removes signal, increasing uncertainty without directional bias.</p>
                            <p><span className="text-lime-400">Selection</span> passes some signals and blocks others, creating partial world-models.</p>
                            <p><span className="text-lime-400">Warping</span> reframes content, producing directional bias in the posterior.</p>
                            <p><span className="text-lime-400">Amplification</span> overweights certain cues, inflating their salience beyond evidential strength.</p>
                            <p><span className="text-lime-400">Recursion</span> feeds channel output back into itself, creating path dependence and hysteresis.</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Four Metrics</h3>
                        <div className="space-y-3 text-sm">
                            <p>
                                <span className="text-lime-400">Information loss</span>{' '}
                                <Equation math="\mathcal{L} = 1 - I(W;M) / I(W;X)" /> measures how much world-relevant information survives mediation.
                            </p>
                            <p>
                                <span className="text-lime-400">Posterior divergence</span>{' '}
                                <Equation math="\mathcal{D} = D_{JS}(q_i \| q^*)" /> measures how far the mediated posterior bends from the benchmark.
                            </p>
                            <p>
                                <span className="text-lime-400">Inferential curvature</span>{' '}
                                <Equation math="\kappa = u_{\text{med}}(e) - u_{\text{bench}}(e)" /> compares the sensitivity of belief-update to evidence.
                            </p>
                            <p>
                                <span className="text-lime-400">Hysteresis</span>{' '}
                                <Equation math="\mathcal{H}" /> measures residual distortion after corrective evidence arrives.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Key Finding</h3>
                        <div className="border-l-2 border-lime-500/40 pl-4">
                            <p className="text-lime-200/80 text-sm leading-relaxed">
                                Ignorance and distortion are qualitatively different. Attenuation produces high information loss
                                but low posterior divergence and zero hysteresis. Warping and recursion produce lower information loss
                                but high posterior divergence and high hysteresis. The agent is confident, wrong, and resistant to correction.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Model Changelog</h3>
                        <ModelChangelog entries={changelog} />
                    </div>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="Epistemic lensing"
            subtitle="how mediated channels deform belief formation"
            description={undefined}
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
            researchUrl="/playgrounds/epistemic-lensing/research"
        />
    );
}
