'use client';

import React, { useState, useMemo, useCallback } from 'react';

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
    computeSensitivity,
    computeSweep,
    computeHolonomyPath,
    computeEnergyField,
} from './logic';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';


interface Props {
    sourceContext?: PlaygroundSourceContext;
}

export default function AuraSpacePlayground({ sourceContext }: Props) {
    const [params, setParams] = useState<Params>(() => presetParams('museum-masterpiece'));
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
    const [sweepParam, setSweepParam] = useState<SweepableParam>('reproductionSaturation');

    const metrics = useMemo(() => computeMetrics(params), [params]);
    const narrative = useMemo(() => computeNarrative(metrics, params), [metrics, params]);
    const sensitivityBars = useMemo(() => computeSensitivity(params), [params]);
    const sweep = useMemo(() => computeSweep(params, sweepParam), [params, sweepParam]);
    const holonomyPath = useMemo(() => computeHolonomyPath(params, metrics), [params, metrics]);
    const energyField = useMemo(() => computeEnergyField(params, metrics), [params, metrics]);

    const saveSnapshot = useCallback(() => {
        setSnapshot({
            params,
            metrics,
            label: params.preset,
        });
    }, [params, metrics]);

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
                        metrics={metrics}
                        snapshot={snapshot}
                        sweepParam={sweepParam}
                        onSweepParamChange={setSweepParam}
                        sweep={sweep}
                        sensitivityBars={sensitivityBars}
                        holonomyPath={holonomyPath}
                        energyField={energyField}
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
                        <h3 className="text-lime-400 font-semibold mb-3">From form-space to aura-space</h3>
                        <p className="leading-relaxed text-sm">
                            Latent space, the space generative models navigate, maps
                            possible <em>forms</em>: style, composition, subject, medium.
                            Walter Benjamin&rsquo;s aura is something different: a
                            relational structure between an object, its context, an
                            observer, and a history. It maps possible{' '}
                            <em>distances</em>.
                        </p>
                        <div className="border-l-2 border-lime-500/40 pl-4 mt-3">
                            <p className="text-lime-200/80 text-sm">
                                Latent space maps possible forms.
                                <br />
                                Aura space maps possible distances.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The base manifold</h3>
                        <p className="leading-relaxed text-sm">
                            The state of an object-in-the-world lives on a product
                            manifold:
                        </p>
                        <Equation
                            mode="block"
                            math="\mathcal{M} = \mathcal{X} \times \mathcal{C} \times \mathcal{U} \times \mathcal{T}"
                        />
                        <p className="leading-relaxed text-sm mt-2">
                            where <Equation math="\mathcal{X}" /> is the object,{' '}
                            <Equation math="\mathcal{C}" /> the context (museum, archive,
                            feed, ruin), <Equation math="\mathcal{U}" /> the observer
                            (training, desire, alienation), and{' '}
                            <Equation math="\mathcal{T}" /> historical time. Aura is not
                            a property at a point; it is a fiber attached to each
                            situation.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Fiber bundle and connection</h3>
                        <p className="leading-relaxed text-sm">
                            Total aura space is a bundle{' '}
                            <Equation math="\pi: \mathcal{E} \to \mathcal{M}" /> with
                            fibers <Equation math="\mathcal{F}_m" /> of possible
                            aura-states (sacred, prestige, distance, history, trace,
                            meme, market, uncanny). A connection{' '}
                            <Equation math="\nabla A" /> tells you how aura changes when
                            the object moves through contexts. The same painting going{' '}
                            <em>studio &rarr; collector &rarr; war loss &rarr; rediscovery
                                &rarr; museum</em>{' '}
                            is not the same painting that went{' '}
                            <em>studio &rarr; Instagram &rarr; print</em>: parallel
                            transport along the two paths gives different aura at the
                            endpoint. That residue is{' '}
                            <span className="text-lime-300">holonomy</span>.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Curvature and sheaf tension</h3>
                        <p className="leading-relaxed text-sm">
                            Curvature{' '}
                            <Equation math="F_\nabla = \nabla^2" /> measures where the
                            field is non-flat: the regions of cultural space where
                            history, scarcity, and institution bend perception
                            disproportionately. A cheap chair and Napoleon&rsquo;s chair
                            have similar matter; aura-space around the second is curved.
                        </p>
                        <p className="leading-relaxed text-sm mt-2">
                            Sheaf tension is the failure of local aura assignments to
                            glue into a coherent global one. Collectors, locals, critics,
                            the state, the internet, and the artist often inhabit
                            incompatible aura sheaves over the same object — Confederate
                            statues, colonial artifacts, and AI artworks all carry
                            nontrivial sheaf cohomology.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Energy and attractors</h3>
                        <p className="leading-relaxed text-sm">
                            Treating aura as the negative log-likelihood of a stable
                            cultural state,
                        </p>
                        <Equation
                            mode="block"
                            math="P(a \mid m) = \frac{e^{-E(a, m)}}{Z(m)}"
                        />
                        <p className="leading-relaxed text-sm mt-2">
                            yields attractor basins: sacred relic, institutional
                            masterpiece, luxury, ruin, meme, synthetic novelty. Cultural
                            objects drift toward local minima unless something disrupts
                            them. Move the historical-depth and ritual-distance sliders
                            to navigate this landscape.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">What is solid, what is speculative</h3>
                        <p className="leading-relaxed text-sm">
                            Benjamin&rsquo;s relational characterization of aura and
                            Bourdieu&rsquo;s account of cultural consecration are
                            well-supported in the humanities. The geometric machinery —
                            fiber bundles, holonomy, sheaves, optimal transport — is
                            here as <em>structural metaphor</em>, not as calibrated
                            empirical model. The thirteen input parameters and eight
                            output fibers are stipulated, not measured. The substantive
                            claim is that aura behaves like a relational field with
                            curvature and path dependence — not that this particular set
                            of weights is the true one.
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
            title="aura atlas"
            subtitle="navigating the relational field of cultural distance, scarcity, ritual, institution, and reception"
            description={
                <>
                    based on{' '}
                    <a
                        href="https://web.mit.edu/allanmc/www/benjamin.pdf"
                        className="underline"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        1936, Walter Benjamin, The Work of Art in the Age of Mechanical
                        Reproduction
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
