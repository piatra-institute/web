'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Equation from '@/components/Equation';
import Settings from './components/Settings';
import Viewer, { ViewerRef } from './components/Viewer';
import {
    SimulationParams,
    Edge,
    NodeId,
    DEFAULT_PARAMS,
    defaultEdges,
    minimalEdges,
    implicationEdges,
    buildAdjacencyMatrix,
    BITMAP,
    bitsToNode,
    flipA,
    flipB,
    flipAB,
} from './logic';

export default function GreimasSquareDynamicsPlayground() {
    const [params, setParams] = useState<SimulationParams>({ ...DEFAULT_PARAMS });
    const [edges, setEdges] = useState<Edge[]>(defaultEdges());
    const [running, setRunning] = useState(true);
    const [groupBits, setGroupBits] = useState<[0 | 1, 0 | 1]>(BITMAP.S1);

    const viewerRef = useRef<ViewerRef>(null);

    const groupNode = useMemo(() => bitsToNode(groupBits[0], groupBits[1]), [groupBits]);

    const enabledEdges = useMemo(() => edges.filter((e) => e.enabled), [edges]);
    const adjacency = useMemo(() => buildAdjacencyMatrix(edges), [edges]);

    const labels: Record<NodeId, string> = useMemo(() => ({
        S1: params.labelS1,
        S2: params.labelS2,
        nS1: params.labelnS1,
        nS2: params.labelnS2,
    }), [params.labelS1, params.labelS2, params.labelnS1, params.labelnS2]);

    const handleToggleEdge = useCallback((id: string) => {
        setEdges((prev) => prev.map((e) => (e.id === id ? { ...e, enabled: !e.enabled } : e)));
    }, []);

    const handlePreset = useCallback((preset: 'greimas' | 'minimal' | 'implications') => {
        switch (preset) {
            case 'greimas': setEdges(defaultEdges()); break;
            case 'minimal': setEdges(minimalEdges()); break;
            case 'implications': setEdges(implicationEdges()); break;
        }
        setParams((p) => ({ ...p, preset }));
        viewerRef.current?.clearParticles();
    }, []);

    const handleGroupAction = useCallback((action: 'a' | 'b' | 'ab' | 'reset') => {
        switch (action) {
            case 'a': setGroupBits((b) => flipA(b)); break;
            case 'b': setGroupBits((b) => flipB(b)); break;
            case 'ab': setGroupBits((b) => flipAB(b)); break;
            case 'reset': setGroupBits([0, 0]); break;
        }
    }, []);

    const handleClear = useCallback(() => {
        viewerRef.current?.clearParticles();
    }, []);

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
                        ref={viewerRef}
                        edges={edges}
                        viewMode={params.viewMode}
                        flowMode={params.flowMode}
                        selectedNode={params.selectedNode}
                        groupNode={groupNode}
                        showUndirectedFlow={params.showUndirectedFlow}
                        spawnRate={params.spawnRate}
                        particleSpeed={params.particleSpeed}
                        maxParticles={params.maxParticles}
                        running={running}
                        labels={labels}
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
                        <h3 className="text-lime-400 font-semibold mb-3">The Semiotic Square</h3>
                        <p className="leading-relaxed text-sm">
                            Greimas&apos;s semiotic square is a tool for mapping the logical structure of semantic oppositions. Given two contrary terms{' '}
                            <Equation math="S_1" /> and <Equation math="S_2" />, the square generates their contradictories{' '}
                            <Equation math="\neg S_1" /> and <Equation math="\neg S_2" />, producing a four-term structure with six typed relations: contradiction, contrariety, sub-contrariety, and implication (deixis).
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Relations</h3>
                        <p className="leading-relaxed text-sm mb-3">
                            The four relation types capture distinct logical constraints:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li><span className="text-lime-400">Contradiction</span>: mutually exclusive truth values. <Equation math="S_1 \leftrightarrow \neg S_1" /> &mdash; one must hold, the other must not.</li>
                            <li><span className="text-lime-400">Contrariety</span>: cannot both be true. <Equation math="S_1" /> and <Equation math="S_2" /> may both fail, but cannot both hold.</li>
                            <li><span className="text-lime-400">Sub-contrariety</span>: cannot both be false. <Equation math="\neg S_1" /> and <Equation math="\neg S_2" /> may co-exist, but at least one must hold.</li>
                            <li><span className="text-lime-400">Implication</span>: directed deixis. <Equation math="S_1 \to \neg S_2" /> and <Equation math="S_2 \to \neg S_1" /> define the diagonal channels.</li>
                        </ul>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Klein Four-Group</h3>
                        <p className="leading-relaxed text-sm mb-3">
                            The group view encodes the four corners as two bits and treats moves on the square as composable bit-flips:
                        </p>
                        <Equation
                            mode="block"
                            math="V_4 \cong \mathbb{Z}_2 \times \mathbb{Z}_2 = \{(0,0),\,(1,0),\,(0,1),\,(1,1)\}"
                        />
                        <p className="leading-relaxed text-sm mt-3">
                            Generator <Equation math="a" /> flips the first bit (contradiction axis), <Equation math="b" /> flips the second (contrariety axis), and <Equation math="ab" /> flips both (diagonal). Each generator is its own inverse &mdash; applying it twice returns to the origin &mdash; making the group an involution lattice.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Flows as Reachability</h3>
                        <p className="leading-relaxed text-sm">
                            The animated particles trace reachability through the enabled structure. In &ldquo;from selected node&rdquo; mode, particles emit from the chosen corner along directed and optionally undirected edges, visualizing which positions are accessible from a given semantic commitment. The random walk mode reveals which corners become steady-state attractors under the current edge configuration.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Notes</h3>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>The formal structure (edges, types) is intentionally separated from interpretation (what <Equation math="S_1" />, <Equation math="S_2" /> mean).</li>
                            <li>Try concrete labels (e.g., Legal/Illegal) and compare presets.</li>
                            <li>In group view, repeatedly apply <Equation math="a" />, <Equation math="b" />, <Equation math="ab" /> to verify involution and commutation.</li>
                            <li>The adjacency matrix in settings shows the enabled structure as a typed graph.</li>
                        </ul>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="Greimas square dynamics"
            subtitle="the semiotic square as typed opposition structure and Klein four-group"
            sections={sections}
            settings={
                <Settings
                    params={params}
                    onParamsChange={setParams}
                    edges={edges}
                    onToggleEdge={handleToggleEdge}
                    onPreset={handlePreset}
                    groupNode={groupNode}
                    onGroupAction={handleGroupAction}
                    running={running}
                    onToggleRunning={() => setRunning((r) => !r)}
                    onClear={handleClear}
                    adjacency={adjacency}
                />
            }
        />
    );
}
