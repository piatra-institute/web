'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import PlaygroundSettings from '@/components/PlaygroundSettings';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Button from '@/components/Button';
import Equation from '@/components/Equation';
import AssumptionPanel from '@/components/AssumptionPanel';
import VersionSelector from '@/components/VersionSelector';
import ModelChangelog from '@/components/ModelChangelog';
import ResearchPromptButton from '@/components/ResearchPromptButton';
import { PlaygroundSourceContext } from '@/lib/readPlaygroundSource';
import { clamp01 } from '@/lib/playgroundMath';

import Viewer, { ViewerRef } from './components/Viewer';
import Settings from './components/Settings';
import MetricsOverlay from './components/MetricsOverlay';
import EntropyComplexityChart from './components/EntropyComplexityChart';

import {
    DEFAULT_PARAMS,
    MIXING_STAGES,
    computeNarrative,
    presetParams,
    type PresetKey,
} from './logic';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';
import type {
    MetricSample,
    SimulationMetrics,
    SimulationParams,
    Snapshot,
} from './types';


interface Props {
    sourceContext?: PlaygroundSourceContext;
}

const DEFAULT_METRICS: SimulationMetrics = {
    entropy: 0,
    mixedness: 0,
    complexity: 0,
    kinetic: 0,
};

const HISTORY_LENGTH = 180;

export default function EntropyCafePlayground({ sourceContext }: Props) {
    const viewerRef = useRef<ViewerRef>(null);
    const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
    const [metrics, setMetrics] = useState<SimulationMetrics>(DEFAULT_METRICS);
    const [history, setHistory] = useState<MetricSample[]>([]);
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

    const peakComplexity = useMemo(
        () => history.reduce((max, h) => Math.max(max, h.complexity), 0),
        [history],
    );

    const narrative = useMemo(() => computeNarrative(metrics, peakComplexity), [metrics, peakComplexity]);

    const handleMetricsUpdate = useCallback((sample: SimulationMetrics) => {
        const finite = (v: number) => (Number.isFinite(v) ? v : 0);
        // Honest passthrough: entropy and mixedness are already binary-entropy
        // bits in [0, 1]; complexity and kinetic are kept at their native scale.
        // No cosmetic gain or power curve is applied.
        const honest: SimulationMetrics = {
            entropy: clamp01(finite(sample.entropy)),
            mixedness: clamp01(finite(sample.mixedness)),
            complexity: Math.max(0, finite(sample.complexity)),
            kinetic: Math.max(0, finite(sample.kinetic)),
        };
        setMetrics(honest);
        setHistory((prev) => {
            const t = prev.length ? prev[prev.length - 1].t + 1 : 0;
            return [...prev.slice(-HISTORY_LENGTH + 1), { ...honest, t }];
        });
    }, []);

    const handleReset = useCallback(() => {
        viewerRef.current?.reset();
        setMetrics(DEFAULT_METRICS);
        setHistory([]);
    }, []);

    const handleStirOnce = useCallback(() => viewerRef.current?.stirOnce(), []);
    const handleAddCream = useCallback(() => viewerRef.current?.addCream(), []);

    const selectPreset = useCallback((key: PresetKey) => {
        setParams(presetParams(key));
    }, []);

    const saveSnapshot = useCallback(() => {
        setSnapshot({
            params,
            metrics,
            peakComplexity,
            label: params.preset,
        });
    }, [params, metrics, peakComplexity]);

    const clearSnapshot = useCallback(() => setSnapshot(null), []);

    const sections: PlaygroundSection[] = [
        { id: 'intro', type: 'intro' },
        {
            id: 'canvas',
            type: 'canvas',
            content: (
                <PlaygroundViewer
                    controls={
                        <>
                            <div className="flex flex-wrap gap-2 justify-center">
                                <Button onClick={handleAddCream} label="Pour Cream" size="sm" />
                                <Button onClick={handleStirOnce} label="Stir Once" size="sm" />
                                <Button onClick={saveSnapshot} label="Save" size="sm" />
                                <Button onClick={handleReset} label="Reset" size="sm" />
                            </div>
                            <EntropyComplexityChart history={history} />
                        </>
                    }
                >
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
                        <div className="relative w-[min(80vw,360px)] h-[58vh] max-h-[620px]">
                            <Viewer
                                ref={viewerRef}
                                params={params}
                                onMetricsUpdate={handleMetricsUpdate}
                            />
                        </div>
                        <MetricsOverlay metrics={metrics} history={history} />
                    </div>
                </PlaygroundViewer>
            ),
        },
        {
            id: 'outro',
            type: 'outro',
            content: (
                <div className="space-y-8 text-gray-300">
                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Entropy, and why it rises</h3>
                        <p className="leading-relaxed text-sm">
                            Sean Carroll uses a cup of coffee with a splash of cream as the cleanest
                            everyday picture of the second law of thermodynamics. The unmixed cup is
                            ordered and improbable; left alone, or stirred, it drifts toward the
                            overwhelmingly more numerous mixed configurations. That drift is the
                            increase of entropy.
                        </p>
                        <p className="leading-relaxed text-sm mt-3">
                            To put a number on it we coarse-grain: bin the cup into a grid of voxels
                            and, for each voxel, take the cream fraction <Equation math="c" /> and its
                            binary Shannon entropy. The entropy of the cup is the particle-weighted
                            average over voxels. It is low when each voxel is nearly pure coffee or
                            pure cream, and maximal when every voxel sits near a fifty-fifty mix.
                        </p>
                        <Equation
                            mode="block"
                            math="H(c) = -\left[c\,\log_2 c + (1-c)\,\log_2(1-c)\right]"
                        />
                        <div className="border-l-2 border-lime-500/40 pl-4 mt-3">
                            <p className="text-lime-200/80 text-sm">
                                Entropy is defined relative to the coarse-graining. The grid is the
                                observer. This is not a flaw in the analogy; it is the physics.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The rise and fall of complexity</h3>
                        <p className="leading-relaxed text-sm">
                            Entropy climbs monotonically, but the cup does not get more interesting to
                            look at the whole way. Watch the three stages: cream layered on coffee
                            (simple), then a moment of intricate filaments and tendrils (complex), then
                            a flat uniform brown (simple again). The interesting structure lives in the
                            middle.
                        </p>
                        <p className="leading-relaxed text-sm mt-3">
                            We track that with two quantities. Mixedness is how close a voxel is to an
                            even mix; apparent complexity is the local concentration gradient weighted
                            by mixedness, averaged over the cup. It is near zero when the cup is layered
                            (almost no gradient that is also mixed) and near zero again when uniform (no
                            gradient at all), and it peaks while the filaments form.
                        </p>
                        <Equation mode="block" math="\text{mixedness} = 1 - |2c - 1|" />
                        <Equation
                            mode="block"
                            math="\text{complexity} \;\propto\; \overline{|\nabla c|}\,\times\,\text{mixedness}"
                        />
                        <div className="border-l-2 border-lime-500/40 pl-4 mt-3">
                            <p className="text-lime-200/80 text-sm">
                                Entropy goes up and stays up. Apparent complexity goes up and comes
                                back down. The high-entropy end state is visually the simplest.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Reading the cup</h3>
                        <p className="leading-relaxed text-sm">
                            Pour cream, then choose when to stir. The overlay tracks entropy and
                            complexity live; the chart below the cup shows their histories on the same
                            time axis, so you can see entropy plateau while complexity crests and falls.
                            The five presets move through the regimes: a quiet pour, diffusion-only
                            settling, a hard continuous stir, and thick or watery fluids that move the
                            complexity peak earlier or later.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">What this is and is not</h3>
                        <p className="leading-relaxed text-sm">
                            This is a real particle fluid (about sixty thousand particles with buoyancy,
                            pressure, diffusion, and a stirring vortex) rendered as a liquid surface,
                            with honest coarse-grained metrics and no cosmetic rescaling. It is still a
                            toy: coffee and cream are a binary species, the pressure is a soft penalty
                            rather than a true incompressible solve, and the apparent-complexity measure
                            is one choice among many, so only its qualitative shape is meant to be
                            trusted. Because cream and coffee stay as separate particle domains rather
                            than dissolving molecule by molecule, the absolute coarse-grained entropy
                            stays small, so the overlay sparklines and the time-series chart auto-scale
                            to make the rise of entropy and the rise-and-fall of complexity legible.
                            There is no parameter sweep or sensitivity tornado, because a live
                            stochastic fluid has no single deterministic number per setting to sweep;
                            the time-series is the evidence instead.
                        </p>
                        <p className="leading-relaxed text-sm mt-3">
                            One last point Carroll makes: the second law does not forbid local order.
                            The cup reaches equilibrium, but Earth does not, because it is an open system
                            that takes in low-entropy sunlight and radiates high-entropy heat to space.
                            Life lives on that flow.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Three phases of the mix</h3>
                        <p className="leading-relaxed text-sm mb-3">
                            The three glasses in the photograph are three moments in one process.
                            The coarse-grained entropy climbs across them; the apparent complexity
                            rises and then falls.
                        </p>
                        <div className="space-y-2">
                            {MIXING_STAGES.map((stage) => {
                                const entWord =
                                    stage.expectedEntropy < 0.2
                                        ? 'near zero'
                                        : stage.expectedEntropy < 0.7
                                            ? 'climbing'
                                            : 'near its ceiling';
                                const cmpWord =
                                    stage.complexityShape === 'low'
                                        ? 'low'
                                        : stage.complexityShape === 'peak'
                                            ? 'at its peak'
                                            : 'collapsed';
                                return (
                                    <div key={stage.id} className="border-l-2 border-lime-500/30 pl-3 py-0.5">
                                        <p className="text-sm">
                                            <span className="text-lime-300 font-medium">{stage.label}</span>
                                            <span className="text-gray-400">: {stage.description}.</span>
                                        </p>
                                        <p className="text-xs text-lime-200/50">
                                            entropy {entWord}, apparent complexity {cmpWord}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <AssumptionPanel assumptions={assumptions} />

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Model</h3>
                        <div className="mb-4">
                            <VersionSelector versions={versions} active={versions[0].id} />
                        </div>
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

    const settings = (
        <PlaygroundSettings
            sections={[
                {
                    content: (
                        <Settings
                            params={params}
                            metrics={metrics}
                            peakComplexity={peakComplexity}
                            narrative={narrative}
                            snapshot={snapshot}
                            onParamsChange={setParams}
                            onSelectPreset={selectPreset}
                            onReset={handleReset}
                            onStirOnce={handleStirOnce}
                            onAddCream={handleAddCream}
                            onSaveSnapshot={saveSnapshot}
                            onClearSnapshot={clearSnapshot}
                        />
                    ),
                },
            ]}
        />
    );

    return (
        <PlaygroundLayout
            title="entropy café"
            subtitle="coffee, cream, and the rise and fall of complexity"
            description={
                <>
                    <a
                        href="https://arxiv.org/abs/1405.6903"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                    >
                        Aaronson, Carroll and Ouellette 2014, Quantifying the Rise and Fall of Complexity in Closed Systems
                    </a>
                    , and{' '}
                    <a
                        href="https://www.youtube.com/watch?v=SWP2ktac34k"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                    >
                        Sean Carroll&apos;s coffee-and-cream analogy
                    </a>
                    {' '}for the second law.
                </>
            }
            sections={sections}
            settings={settings}
            researchUrl="/playgrounds/entropy-cafe/research"
        />
    );
}
