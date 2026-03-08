'use client';

import { useState, useMemo } from 'react';

import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Equation from '@/components/Equation';

import Settings from './components/Settings';
import Viewer from './components/Viewer';
import {
    type Params,
    type ClassificationResult,
    DEFAULT_PARAMS,
    ROCKS,
    classifyIgneous,
    classifySedimentary,
    classifyMetamorphic,
} from './logic';


export default function LithicGrammarPlayground() {
    const [params, setParams] = useState<Params>(DEFAULT_PARAMS);

    const result = useMemo<ClassificationResult | null>(() => {
        if (params.viewMode !== 'classifier' && params.viewMode !== 'graph') {
            if (params.selectedRockId) {
                const rock = ROCKS.find((r) => r.id === params.selectedRockId);
                if (rock) {
                    return {
                        rock,
                        why: rock.description,
                        neighbors: rock.neighbors
                            .map((nid) => ROCKS.find((r) => r.id === nid))
                            .filter(Boolean) as typeof ROCKS,
                    };
                }
            }
            return null;
        }

        switch (params.domain) {
            case 'igneous':
                return classifyIgneous({
                    sio2: params.sio2,
                    texture: params.texture,
                    highAlkali: params.highAlkali,
                    vesicular: params.vesicular,
                    veryCoarse: params.veryCoarse,
                    ol: params.ol,
                    opx: params.opx,
                    cpx: params.cpx,
                });
            case 'sedimentary':
                return classifySedimentary({
                    sedType: params.sedType,
                    grainSize: params.grainSize,
                    fissile: params.fissile,
                    rounded: params.rounded,
                    glacial: params.glacial,
                    feldspathic: params.feldspathic,
                    poorlySorted: params.poorlySorted,
                    chemComposition: params.chemComposition,
                    mgRich: params.mgRich,
                    biogenic: params.biogenic,
                    hotSpring: params.hotSpring,
                    organicType: params.organicType,
                });
            case 'metamorphic':
                return classifyMetamorphic({
                    protolith: params.protolith,
                    grade: params.grade,
                    pressure: params.pressure,
                    contact: params.contact,
                });
        }
    }, [params]);

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
        },
        {
            id: 'canvas',
            type: 'canvas' as const,
            content: (
                <PlaygroundViewer>
                    <Viewer
                        params={params}
                        onParamsChange={setParams}
                        result={result}
                    />
                </PlaygroundViewer>
            ),
        },
        {
            id: 'outro',
            type: 'outro' as const,
            content: (
                <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                    <h3 className="text-lime-100 font-sans text-lg">The Grammar of Rocks</h3>
                    <p>
                        Rock names are discrete labels imposed on continuous geological manifolds.
                        The mineral composition, grain size, temperature, pressure, and formation
                        history of a rock all vary continuously, yet petrology assigns each specimen
                        a discrete name. Three domains — igneous, sedimentary, metamorphic — each
                        use their own classification grammar: different axes, different boundaries,
                        different decision logic.
                    </p>

                    <h3 className="text-lime-100 font-sans text-lg">Igneous Classification</h3>
                    <p>
                        The primary axis is silica content. SiO₂ percentage partitions the space into
                        ultramafic ({'<'}45%), mafic (45–52%), intermediate (52–63%), and felsic ({'>'}63%).
                        The secondary axis is texture: plutonic (coarse-grained, slow cooling at depth)
                        versus volcanic (fine-grained, rapid cooling at surface). For ultramafic plutonic rocks,
                        a ternary classification based on olivine, orthopyroxene, and clinopyroxene modal
                        proportions further partitions the space.
                    </p>
                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <p className="text-lime-200/80 mb-2">
                            The IUGS/Streckeisen system uses mineral modes:
                        </p>
                        <Equation
                            mode="block"
                            math="\text{Ol} + \text{Opx} + \text{Cpx} = 100\%"
                        />
                        <p className="text-lime-200/60 text-sm mt-2">
                            with field boundaries at Ol = 90% (dunite), Ol = 40% (peridotite/pyroxenite),
                            and Opx:Cpx ratio (harzburgite vs wehrlite vs lherzolite).
                        </p>
                    </div>

                    <h3 className="text-lime-100 font-sans text-lg">Sedimentary Classification</h3>
                    <p>
                        Clastic sedimentary rocks are classified by grain size following the Wentworth scale:
                        clay ({'<'}0.004 mm), silt (0.004–0.063 mm), sand (0.063–2 mm), gravel ({'>'}2 mm).
                        Within each size, modifiers refine the classification: fissility distinguishes shale
                        from mudstone, rounding separates conglomerate from breccia, feldspar content
                        yields arkose, poor sorting gives graywacke.
                    </p>
                    <p>
                        Chemical and organic sedimentary rocks follow different logic entirely:
                        composition (carbonate, siliceous, evaporite) and biogenic origin (plant → coal,
                        shell → coquina, diatom → diatomite).
                    </p>

                    <h3 className="text-lime-100 font-sans text-lg">Metamorphic Classification</h3>
                    <p>
                        Metamorphic classification depends on three variables: protolith (what the rock
                        was before), grade (how much temperature and pressure it experienced), and the
                        pressure regime. The same protolith at different P-T conditions yields different
                        rocks. A pelitic (clay-rich) protolith follows the sequence
                        slate → phyllite → schist → gneiss → migmatite with increasing grade.
                        A mafic protolith takes a different path: greenschist → amphibolite → granulite
                        at normal pressure, but blueschist → eclogite under high pressure.
                    </p>

                    <h3 className="text-lime-100 font-sans text-lg">The Rock Cycle</h3>
                    <p>
                        All three domains connect through geological processes — weathering breaks down
                        igneous and metamorphic rocks into sediment, lithification compresses sediment
                        into sedimentary rock, metamorphism transforms any rock under heat and pressure,
                        and melting returns material to magma. Every rock is potentially every other rock
                        given enough time and the right conditions. The cycle has no beginning and no end.
                    </p>

                    <h3 className="text-lime-100 font-sans text-lg">Boundaries</h3>
                    <p>
                        Some classification boundaries are sharp: dunite requires {'>'}90% olivine.
                        Others are fuzzy: the granite–granodiorite boundary depends on the ratio
                        of alkali feldspar to plagioclase, which varies continuously. Still others
                        are purely conventional: the 63% SiO₂ line separating intermediate from felsic
                        is a human decision, not a physical discontinuity. The playground makes these
                        different boundary types visible — nature is continuous, nomenclature is discrete.
                    </p>
                </div>
            ),
        },
    ];

    const settings = (
        <Settings
            params={params}
            onParamsChange={setParams}
            result={result}
        />
    );

    return (
        <PlaygroundLayout
            title="lithic grammar"
            subtitle="the classification rules that partition continuous geological space into discrete rock names"
            description={
                <a
                    href="https://www.cambridge.org/core/books/principles-of-igneous-and-metamorphic-petrology/7B4B1D1AB8E9392195990E16DF56DAA4"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    2011, Philpotts & Ague, Principles of Igneous and Metamorphic Petrology
                </a>
            }
            sections={sections}
            settings={settings}
        />
    );
}
