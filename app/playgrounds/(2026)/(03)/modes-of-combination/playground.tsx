'use client';

import { useMemo, useState, useCallback } from 'react';

import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import ModelChangelog from '@/components/ModelChangelog';
import Equation from '@/components/Equation';

import Settings from './components/Settings';
import Viewer from './components/Viewer';

import {
    Params,
    DEFAULT_PARAMS,
    products,
    filterProducts,
    computeMatrix,
    computeNarrative,
} from './logic';

import { assumptions } from './assumptions';
import { versions, changelog } from './versions';

import { PlaygroundSourceContext } from '@/lib/readPlaygroundSource';
import ResearchPromptButton from '@/components/ResearchPromptButton';


export default function Playground({ sourceContext }: { sourceContext?: PlaygroundSourceContext }) {
    const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
    const [selectedId, setSelectedId] = useState('wreath-product');

    const filtered = useMemo(() => filterProducts(params), [params]);
    const matrix = useMemo(() => computeMatrix(), []);
    const narrative = useMemo(() => computeNarrative(params, filtered), [params, filtered]);

    const selected = useMemo(
        () => filtered.find(p => p.id === selectedId) ?? filtered[0] ?? null,
        [filtered, selectedId],
    );

    const handleModeSelect = useCallback((mode: string) => {
        setParams(p => ({ ...p, selectedMode: mode }));
    }, []);

    const handleSelectConstruction = useCallback((id: string) => {
        setSelectedId(id);
        const inFiltered = filtered.some(p => p.id === id);
        if (!inFiltered) {
            setParams(p => ({ ...p, selectedField: 'All', selectedMode: 'all', search: '' }));
        }
    }, [filtered]);

    const sections: PlaygroundSection[] = [
        { id: 'intro', type: 'intro' },
        {
            id: 'canvas',
            type: 'canvas',
            content: (
                <PlaygroundViewer>
                    <Viewer
                        filtered={filtered}
                        selected={selected}
                        matrix={matrix}
                        selectedMode={params.selectedMode}
                        assumptions={assumptions}
                        versions={versions}
                        onSelectConstruction={handleSelectConstruction}
                        onModeSelect={handleModeSelect}
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
                        <h3 className="text-lime-400 font-semibold mb-3">The four universal templates</h3>
                        <p className="leading-relaxed text-sm">
                            Most product-like constructions can be understood as variants of four
                            categorical shapes, each defined by a universal property:
                        </p>
                        <div className="mt-3 space-y-2">
                            <p className="leading-relaxed text-sm">
                                <strong className="text-lime-400">Product</strong>{' '}
                                <Equation math="A \times B" /> &mdash; remember both objects independently.
                            </p>
                            <p className="leading-relaxed text-sm">
                                <strong className="text-lime-400">Coproduct</strong>{' '}
                                <Equation math="A \amalg B" /> &mdash; freely contain both objects.
                            </p>
                            <p className="leading-relaxed text-sm">
                                <strong className="text-lime-400">Pullback</strong>{' '}
                                <Equation math="A \times_C B" /> &mdash; keep only compatible pairs.
                            </p>
                            <p className="leading-relaxed text-sm">
                                <strong className="text-lime-400">Pushout</strong>{' '}
                                <Equation math="A \amalg_C B" /> &mdash; glue along shared structure.
                            </p>
                        </div>
                        <p className="leading-relaxed text-sm mt-3">
                            Everything else typically adds an <em>action</em>, a <em>quotient</em>,
                            a <em>twist/cocycle</em>, or an <em>iteration/hierarchy</em>.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">From independence to freedom</h3>
                        <p className="leading-relaxed text-sm">
                            The direct product <Equation math="G \times H" /> keeps two groups independent &mdash;
                            every element of one commutes with every element of the other. The free product{' '}
                            <Equation math="G * H" /> does the opposite: it merges with maximal freedom,
                            imposing no new relations beyond those already present in each factor. The graph
                            product interpolates between these extremes by using a graph to decide which pairs commute.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The action hierarchy</h3>
                        <p className="leading-relaxed text-sm">
                            The <strong className="text-lime-400">semidirect product</strong>{' '}
                            <Equation math="N \rtimes H" /> adds one-sided control: <Equation math="H" /> acts
                            on <Equation math="N" /> but not vice versa. The <strong className="text-lime-400">wreath product</strong>{' '}
                            <Equation math="G \wr H \cong G^{(X)} \rtimes H" /> distributes many copies of{' '}
                            <Equation math="G" /> across an index set and lets <Equation math="H" /> coordinate them.
                            The <strong className="text-lime-400">Zappa&ndash;Sz&eacute;p product</strong> drops the
                            asymmetry entirely: both sides act on each other and co-determine the multiplication.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Gluing and compatibility</h3>
                        <p className="leading-relaxed text-sm">
                            Gluing constructions (pushout, amalgamated product, connected sum) identify shared structure.
                            Compatibility constructions (pullback, fiber product) do the dual: they keep only pairs
                            that agree over a common image. These are often the hardest to see clearly because the
                            construction is defined by what it <em>excludes</em> rather than what it <em>adds</em>.
                        </p>
                        <Equation mode="block" math="G \times_Q H = \{(g,h) : \varphi(g) = \psi(h)\}" />
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The tensor product and interaction</h3>
                        <p className="leading-relaxed text-sm">
                            Where the direct product stores independent coordinates, the tensor product{' '}
                            <Equation math="V \otimes W" /> universalizes bilinear interaction. It turns
                            structured interaction into an object in its own right &mdash; this is why
                            it feels deeper than mere pairing. The monoidal product generalizes this
                            to any category with a distinguished way of combining objects.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Local versus global</h3>
                        <p className="leading-relaxed text-sm">
                            A fiber bundle <Equation math="F \hookrightarrow E \to B" /> looks like a product{' '}
                            <Equation math="F \times B" /> on every small patch, but globally the pieces
                            may be stitched with twists that prevent a global factorization. The M&ouml;bius
                            band is the canonical example: locally an interval times a circle, globally
                            twisted. This tension between local product structure and global obstruction
                            is one of the deepest themes in topology and geometry.
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
            title="modes of combination"
            subtitle="atlas of product constructions across group theory, ring theory, category theory, and topology"
            sections={sections}
            settings={
                <Settings
                    params={params}
                    onParamsChange={setParams}
                    narrative={narrative}
                    visibleCount={filtered.length}
                    totalCount={products.length}
                />
            }
        />
    );
}
