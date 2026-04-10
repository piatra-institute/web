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
    GraphNode, Edge, Graph, NodeType, PresetKey,
    buildPreset, computeField, computeSensitivity,
    computeNarrative, createNode, resetUid,
    ANIMATION_TOTAL_FRAMES,
} from './logic';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';


interface Props {
    sourceContext?: PlaygroundSourceContext;
}

export default function MorphospaceEnginePlayground({ sourceContext }: Props) {
    const [graph, setGraph] = useState<Graph>(() => {
        resetUid();
        return buildPreset('e-mitigation');
    });
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [connectFromId, setConnectFromId] = useState<string | null>(null);

    // Animation
    const [playing, setPlaying] = useState(true);
    const [time, setTime] = useState(0);
    const animFrameRef = useRef<number | null>(null);

    useEffect(() => {
        if (!playing) {
            if (animFrameRef.current !== null) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
            return;
        }
        let last = 0;
        const step = (ts: number) => {
            if (!last) last = ts;
            const dt = (ts - last) / 1000;
            last = ts;
            setTime(prev => prev + dt * 0.85);
            animFrameRef.current = requestAnimationFrame(step);
        };
        animFrameRef.current = requestAnimationFrame(step);
        return () => { if (animFrameRef.current !== null) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; } };
    }, [playing]);

    const field = useMemo(() => computeField(graph, time), [graph, time]);
    const narrative = useMemo(() => computeNarrative(field, graph), [field, graph]);
    const sensitivityBars = useMemo(() => computeSensitivity(graph, time), [graph, time]);

    const loadPreset = useCallback((key: PresetKey) => {
        resetUid();
        setGraph(buildPreset(key));
        setSelectedNodeId(null);
        setConnectFromId(null);
        setTime(0);
    }, []);

    const addNode = useCallback((type: NodeType) => {
        const x = 120 + Math.random() * 740;
        const y = 90 + Math.random() * 380;
        const node = createNode(type, x, y);
        setGraph(prev => ({ ...prev, nodes: [...prev.nodes, node] }));
        setSelectedNodeId(node.id);
    }, []);

    const deleteNode = useCallback((id: string) => {
        setGraph(prev => ({
            nodes: prev.nodes.filter(n => n.id !== id),
            edges: prev.edges.filter(e => e.from !== id && e.to !== id),
        }));
        if (selectedNodeId === id) setSelectedNodeId(null);
        if (connectFromId === id) setConnectFromId(null);
    }, [selectedNodeId, connectFromId]);

    const togglePlaying = useCallback(() => {
        setPlaying(p => !p);
    }, []);

    const resetTime = useCallback(() => {
        setTime(0);
    }, []);

    const animControls = (
        <div className="flex items-center gap-4">
            <Button label={playing ? 'pause' : 'play'} onClick={togglePlaying} size="xs" />
            <Button label="reset" onClick={resetTime} size="xs" />
            <span className="text-xs font-mono text-lime-200/60">t = {time.toFixed(1)}</span>
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
                        graph={graph}
                        onGraphChange={setGraph}
                        field={field}
                        selectedNodeId={selectedNodeId}
                        onSelectNode={setSelectedNodeId}
                        connectFromId={connectFromId}
                        onConnectFrom={setConnectFromId}
                        sensitivityBars={sensitivityBars}
                        assumptions={assumptions}
                        versions={versions}
                        playing={playing}
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
                        <h3 className="text-lime-400 font-semibold mb-3">The morphospace hypothesis</h3>
                        <p className="leading-relaxed text-sm">
                            Michael Levin proposes that biological form is best understood
                            not as a bottom-up consequence of molecular interactions, but
                            as navigation through a pre-existing space of possible forms
                            {' '}&mdash; a morphospace. In this view, developmental programs
                            are goal-directed searches through an abstract landscape where
                            attractors correspond to viable anatomies. The morphospace
                            engine takes this idea literally: nodes define forces,
                            tendencies, and constraints that shape a field, and the
                            emergent pattern is a phenotype.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Constraint as cause</h3>
                        <p className="leading-relaxed text-sm">
                            Alicia Juarrero argues that constraints are not merely
                            boundary conditions but are causally efficacious. In her
                            framework, enabling constraints{' '}
                            <em>create</em> the possibility space within which
                            morphogenesis occurs. A ring constraint in this playground
                            does not merely limit the field &mdash; it channels and
                            sculpts it, creating patterns that would not exist without
                            the constraint. This is analogous to how a riverbank does
                            not merely contain water but shapes the flow into meanders,
                            eddies, and deltas.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Mathematical constants as forcing terms</h3>
                        <p className="leading-relaxed text-sm">
                            The playground treats mathematical constants (
                            <Equation math="e" />, <Equation math="\pi" />,{' '}
                            <Equation math="\varphi" />, Feigenbaum{' '}
                            <Equation math="\delta" />, silver ratio) as
                            &ldquo;trans-real&rdquo; forcing terms &mdash; structures
                            from an abstract realm that leave fingerprints on physical
                            morphology when projected into the field. The mitigation
                            parameter controls how much a constraint node absorbs or
                            redirects the constant&apos;s influence, while ingress
                            controls how deeply the constant penetrates the field.
                        </p>
                        <Equation mode="block" math="\text{push} = s_{\text{eff}} \cdot (1 - m) \cdot \sin\!\bigl(c \cdot (r + \theta) - t\bigr) \cdot G(r)" />
                        <p className="leading-relaxed text-sm mt-2">
                            where <Equation math="c" /> is the constant value,{' '}
                            <Equation math="m" /> is mitigation,{' '}
                            <Equation math="s_{\text{eff}}" /> is effective strength, and{' '}
                            <Equation math="G(r)" /> is a Gaussian envelope.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Node types</h3>
                        <p className="leading-relaxed text-sm">
                            <strong className="text-lime-200">Seeds</strong> are local
                            generative impulses &mdash; point sources of morphogenetic
                            potential with controllable frequency and polarity.{' '}
                            <strong className="text-lime-200">Fields</strong> distribute
                            tendencies across the whole space along radial, horizontal,
                            vertical, or spiral axes.{' '}
                            <strong className="text-lime-200">Constraints</strong> channel
                            and dampen the field through ring, stripe, or spiral modes.{' '}
                            <strong className="text-lime-200">Constants</strong> inject
                            mathematical forcing with controllable mitigation and ingress.{' '}
                            <strong className="text-lime-200">Attractors</strong> are
                            recursive memory sinks that thicken nascent morphology.{' '}
                            <strong className="text-lime-200">Observations</strong> probe
                            the field without shaping it.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Emergent phenotypes</h3>
                        <p className="leading-relaxed text-sm">
                            The morphology classifier identifies six emergent phenotype
                            classes from the field metrics: <em>spiral membrane</em>{' '}
                            (high swirl + coherence), <em>core-focused organoid</em>{' '}
                            (center bias dominance), <em>ring shell</em> (edge bias
                            dominance), <em>striped corridor</em> (high anisotropy),{' '}
                            <em>amoeboid turbulence</em> (low coherence), and{' '}
                            <em>metastable lattice</em> (the balanced default). These
                            are not predefined patterns but categories that emerge from
                            the spatial statistics of the computed field.
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
            title="Morphospace engine"
            subtitle="node-graph experiments in the space of possible forms"
            description={
                <>
                    <a href="https://pubmed.ncbi.nlm.nih.gov/31920779/" className="underline" target="_blank" rel="noopener noreferrer">
                        2019, Levin, The computational boundary of a &ldquo;self&rdquo;
                    </a>
                    {' \u00B7 '}
                    <a href="https://mitpress.mit.edu/9780262600477/dynamics-in-action/" className="underline" target="_blank" rel="noopener noreferrer">
                        2002, Juarrero, Dynamics in Action
                    </a>
                </>
            }
            sections={sections}
            settings={
                <Settings
                    graph={graph}
                    onGraphChange={setGraph}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={setSelectedNodeId}
                    connectFromId={connectFromId}
                    onConnectFrom={setConnectFromId}
                    field={field}
                    narrative={narrative}
                    onLoadPreset={loadPreset}
                    onAddNode={addNode}
                    onDeleteNode={deleteNode}
                />
            }
        />
    );
}
