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
    OntologyState, PresetKey,
    buildPreset, computeMetrics, computeSensitivity,
    computeNarrative,
} from './logic';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';


interface Props {
    sourceContext?: PlaygroundSourceContext;
}

export default function OntometricsPlayground({ sourceContext }: Props) {
    const [state, setState] = useState<OntologyState>(() => buildPreset('metaphysics'));

    const metrics = useMemo(() => computeMetrics(state), [state]);
    const sensitivityBars = useMemo(() => computeSensitivity(state), [state]);
    const narrative = useMemo(() => computeNarrative(metrics, state), [metrics, state]);

    const loadPreset = useCallback((key: PresetKey) => {
        setState(buildPreset(key));
    }, []);

    const sections: PlaygroundSection[] = [
        { id: 'intro', type: 'intro' },
        {
            id: 'canvas',
            type: 'canvas',
            content: (
                <PlaygroundViewer>
                    <Viewer
                        state={state}
                        metrics={metrics}
                        sensitivityBars={sensitivityBars}
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
                        <h3 className="text-lime-400 font-semibold mb-3">Angels on a pin</h3>
                        <p className="leading-relaxed text-sm">
                            Medieval scholars are mocked for asking how many angels
                            fit on a needle&apos;s tip. But the mockery misses the
                            point: they were probing real problems &mdash; occupancy,
                            individuation, locality, causation for non-material agents
                            &mdash; with the only concepts available to them. &ldquo;Angel
                            questions&rdquo; are what inquiry looks like when a culture has
                            problem-sensitivity but lacks clean abstractions. The
                            vocabulary may be wrong; the underlying pressure may be
                            profound.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">The CAD analogy</h3>
                        <p className="leading-relaxed text-sm">
                            An ontology can fail in two opposite directions, mirroring
                            CAD sketch constraints. An <em>underdeveloped</em> ontology
                            has too few concepts to carve reality well &mdash; like an
                            underconstrained sketch where many shapes satisfy the
                            dimensions. An <em>overdetermined</em> ontology has too many
                            categories, constraints, or distinctions relative to what the
                            phenomena warrant &mdash; like an overconstrained sketch that
                            locks up or becomes brittle. Good ontology sits in the middle:
                            enough distinctions to track reality, not so many that it
                            becomes baroque.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">The quality function</h3>
                        <p className="leading-relaxed text-sm">
                            The playground uses an MDL-inspired quality function that
                            balances fit against structural cost:
                        </p>
                        <Equation mode="block" math="Q(O;D) = \text{Fit} - \lambda K - \mu \text{Red} - \nu \text{Inc} - \rho \text{Brit}" />
                        <p className="leading-relaxed text-sm mt-2">
                            where <Equation math="\text{Fit} = 0.55 \cdot \text{Coverage} + 0.45 \cdot \text{Discrimination}" />,{' '}
                            <Equation math="K" /> is structural complexity,{' '}
                            <Equation math="\text{Red}" /> is category redundancy (Jaccard overlap),{' '}
                            <Equation math="\text{Inc}" /> is axiom inconsistency, and{' '}
                            <Equation math="\text{Brit}" /> is revision brittleness.
                            The penalty weights <Equation math="\lambda, \mu, \nu, \rho" /> are
                            adjustable.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Harman&apos;s axes</h3>
                        <p className="leading-relaxed text-sm">
                            Graham Harman distinguishes two modes of ontological reduction.{' '}
                            <strong className="text-lime-200">Undermining</strong> reduces
                            a thing downward to its constituent parts.{' '}
                            <strong className="text-lime-200">Overmining</strong> reduces
                            a thing upward to its effects, appearances, or relations.
                            These are orthogonal to the underdeveloped/overdetermined
                            axis: an ontology can be underdeveloped AND overmining, or
                            overdetermined AND undermining. The playground estimates a
                            Harman index from axiom type distribution &mdash;
                            subtype-heavy axioms lean toward overmining, dependsOn-heavy
                            axioms lean toward undermining.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">MDL interpretation</h3>
                        <p className="leading-relaxed text-sm">
                            The Minimum Description Length principle says: the best model
                            minimizes the sum of the model&apos;s description length{' '}
                            <Equation math="L(O)" /> and the residual surprise{' '}
                            <Equation math="L(D|O)" /> &mdash; how much the phenomena
                            remain unexplained. An underdeveloped ontology has low{' '}
                            <Equation math="L(O)" /> but high{' '}
                            <Equation math="L(D|O)" />. An overdetermined ontology has
                            bloated <Equation math="L(O)" /> while{' '}
                            <Equation math="L(D|O)" /> barely decreases. The playground
                            visualizes this decomposition.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The strongest single test</h3>
                        <p className="leading-relaxed text-sm">
                            Does the ontology introduce exactly the distinctions needed to
                            explain stable differences in the world, without multiplying
                            categories beyond independent necessity? That is probably the
                            closest thing to an engineering criterion for ontology.
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
            title="Ontometrics"
            subtitle="measuring whether an ontology is underdeveloped, calibrated, or overdetermined"
            description={
                <>
                    <a href="https://plato.stanford.edu/entries/logic-ontology/" className="underline" target="_blank" rel="noopener noreferrer">
                        SEP, Logic and Ontology
                    </a>
                    {' \u00B7 '}
                    <a href="https://plato.stanford.edu/entries/mereology/" className="underline" target="_blank" rel="noopener noreferrer">
                        SEP, Mereology
                    </a>
                </>
            }
            sections={sections}
            settings={
                <Settings
                    state={state}
                    onStateChange={setState}
                    metrics={metrics}
                    narrative={narrative}
                    onLoadPreset={loadPreset}
                />
            }
        />
    );
}
