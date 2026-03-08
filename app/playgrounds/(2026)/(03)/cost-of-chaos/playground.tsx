'use client';

import { useState, useMemo, useEffect } from 'react';

import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Equation from '@/components/Equation';

import {
    Params,
    DEFAULT_PARAMS,
    NodePoint,
    makeLayout,
    makeEdges,
    computeChaosStats,
} from './logic';

import Settings from './components/Settings';
import Viewer from './components/Viewer';

const SVG_W = 800;
const SVG_H = 600;

export default function Playground() {
    const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
    const [manualPositions, setManualPositions] = useState<NodePoint[] | null>(null);

    useEffect(() => {
        setManualPositions(null);
    }, [params.nodeCount, params.layoutMode, params.seed]);

    const autoPositions = useMemo(
        () => makeLayout(params.nodeCount, SVG_W, SVG_H, params.layoutMode, params.seed),
        [params.nodeCount, params.layoutMode, params.seed],
    );

    const positions = manualPositions ?? autoPositions;

    const edges = useMemo(
        () => makeEdges(params.nodeCount, params.colors, params.coloringMode, params.seed),
        [params.nodeCount, params.colors, params.coloringMode, params.seed],
    );

    const stats = useMemo(
        () => computeChaosStats(params.nodeCount, edges, params.colors, params.cliqueSize),
        [params.nodeCount, edges, params.colors, params.cliqueSize],
    );

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
                        positions={positions}
                        edges={edges}
                        stats={stats}
                        params={params}
                        onPositionsChange={setManualPositions}
                    />
                </PlaygroundViewer>
            ),
        },
        {
            id: 'outro',
            type: 'outro' as const,
            content: (
                <div className="space-y-8 text-gray-300">
                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Ramsey&apos;s Theorem</h3>
                        <p className="leading-relaxed text-sm">
                            For any integers <Equation math="s, t \geq 2" />, there exists a minimum{' '}
                            <Equation math="N = R(s,t)" /> such that every 2-coloring of the complete graph{' '}
                            <Equation math="K_N" /> contains either a monochromatic <Equation math="K_s" /> or{' '}
                            <Equation math="K_t" />. Once a system has enough elements and enough pairwise
                            relations, some nontrivial regularity must crystallize.
                        </p>
                        <Equation
                            mode="block"
                            math="n \geq R(s,t) \implies \text{every 2-coloring of } K_n \text{ contains mono-}K_s \text{ or } K_t"
                        />
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Known Ramsey Numbers</h3>
                        <p className="leading-relaxed text-sm mb-3">
                            Ramsey numbers grow so fast that exact computation is notoriously
                            difficult. Even small cases push mathematics to its limits:
                        </p>
                        <Equation
                            mode="block"
                            math="R(3,3) = 6 \quad R(3,4) = 9 \quad R(3,5) = 14 \quad R(4,4) = 18 \quad R(4,5) = 25"
                        />
                        <p className="leading-relaxed text-sm mt-3">
                            Erdos famously remarked that computing <Equation math="R(5,5)" /> would require
                            marshaling the entire resources of humanity. The exact value remains
                            unknown, bounded between 43 and 48.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">The Cost of Chaos</h3>
                        <p className="leading-relaxed text-sm">
                            Chaos is expensive because it requires suppression. To prevent structure from
                            emerging in a large system, you must reduce elements, sever connections,
                            fragment relations, enforce separations. The cost is not energetic - it is
                            {' '}<em>combinatorial</em>.
                        </p>
                        <p className="leading-relaxed text-sm mt-3">
                            A large, richly connected system naturally generates structure. To keep it
                            formless, you must artificially starve it of scale or relation. Below the
                            Ramsey threshold, disorder is free. Above it, disorder carries a price measured
                            by the fraction of connections trapped in forced patterns.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Adversarial Coloring</h3>
                        <p className="leading-relaxed text-sm">
                            The <em>adversarial</em> strategy uses a greedy algorithm to minimize
                            monochromatic cliques: for each edge, it tries every available color and
                            picks the one that creates the fewest new triangles. This is the system&apos;s
                            best effort to resist structure.
                        </p>
                        <p className="leading-relaxed text-sm mt-3">
                            Below the Ramsey threshold, the adversarial strategy succeeds - zero
                            monochromatic cliques. Above it, even the optimal resistance fails.
                            Try increasing vertices from 5 to 6 with 2 colors and clique size 3
                            to cross the <Equation math="R(3,3) = 6" /> threshold and watch structure
                            become inevitable.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Notes</h3>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>Vertices are draggable - sculpt your own layout.</li>
                            <li>Hover a color layer in the legend to isolate its geometry.</li>
                            <li>The adversarial coloring is a greedy heuristic, not a global optimum.</li>
                            <li>Ramsey thresholds are shown for 2-color symmetric cases R(s,s).</li>
                        </ul>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="cost of chaos"
            subtitle="the combinatorial inevitability of structure and the cost of maintaining disorder"
            description={
                <a
                    href="https://doi.org/10.1112/plms/s2-30.1.264"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    1930, Frank P. Ramsey, On a Problem of Formal Logic
                </a>
            }
            sections={sections}
            settings={
                <Settings
                    params={params}
                    onParamsChange={setParams}
                    stats={stats}
                />
            }
        />
    );
}
