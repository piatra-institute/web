'use client';

import { useState, useRef, useCallback } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Viewer from './components/Viewer';
import Settings from './components/Settings';



export default function GeometryBecomingTopologyPlayground() {
    const [epsilon, setEpsilon] = useState(50);
    const [useExoticStructure, setUseExoticStructure] = useState(false);
    const [currentView, setCurrentView] = useState<'metric' | 'smooth' | 'topology'>('topology');
    const [selectedPoints, setSelectedPoints] = useState<number[]>([]);

    const viewerRef = useRef<{ exportCanvas: () => void }>(null);

    const handleReset = useCallback(() => {
        setEpsilon(50);
        setUseExoticStructure(false);
        setCurrentView('topology');
        setSelectedPoints([]);
    }, []);

    const handleExport = useCallback(() => {
        viewerRef.current?.exportCanvas();
    }, []);

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
            content: (
                <div className="mt-12">
                    <p className="text-xl text-gray-300 mb-4">
                        An Interactive Exploration of Geometric Structure
                    </p>
                    <p className="text-gray-400">
                        Explore how connectivity emerges from proximity, and discover the distinct layers
                        of geometric structure from rigid metrics to flexible topology.
                    </p>
                </div>
            ),
        },
        {
            id: 'canvas',
            type: 'canvas' as const,
            content: (
                <PlaygroundViewer>
                    <Viewer
                        ref={viewerRef}
                        epsilon={epsilon}
                        useExoticStructure={useExoticStructure}
                        currentView={currentView}
                        selectedPoints={selectedPoints}
                        onEpsilonChange={setEpsilon}
                        onUseExoticStructureChange={setUseExoticStructure}
                        onCurrentViewChange={setCurrentView}
                        onSelectedPointsChange={setSelectedPoints}
                    />
                </PlaygroundViewer>
            ),
        },
        {
            id: 'about',
            type: 'outro' as const,
            content: (
                <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                    <p>
                        This interactive visualization explores the mathematical hierarchy underlying <strong className="text-lime-200">Topological Data Analysis (TDA)</strong>—a framework that extracts robust structural features from high-dimensional data. Beginning with a discrete point cloud embedded in ℝ², we construct increasingly abstract representations that reveal fundamental geometric invariants.
                    </p>
                    <p>
                        The <strong className="text-lime-200">Vietoris-Rips parameter ε</strong> governs the formation of our simplicial complex: for each pair of points within Euclidean distance ε, we add a 1-simplex (edge). When three points are pairwise connected, we fill in the 2-simplex (triangle). This construction yields a <a href="https://en.wikipedia.org/wiki/Vietoris%E2%80%93Rips_complex" target="_blank" className="text-lime-200 hover:text-lime-50 underline">Vietoris-Rips complex</a> Rips(X,ε), providing a combinatorial approximation to the underlying topological space.
                    </p>
                    <p>
                        The visualization demonstrates three distinct geometric structures, each preserved by progressively weaker equivalence relations:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong className="text-lime-200">Riemannian structure</strong> (Metric View): The complete geometric data, including the metric tensor g<sub>ij</sub>. Preserved by <strong className="text-lime-200">isometries</strong> φ: (M,g) → (M&apos;,g&apos;) where φ*g&apos; = g. Invariants include geodesic distances, curvature tensors, and volume forms.</li>
                        <li><strong className="text-lime-200">Smooth structure</strong> (Smooth View): The differentiable manifold structure, forgetting the metric but retaining C<sup>∞</sup> compatibility. Preserved by <strong className="text-lime-200">diffeomorphisms</strong>. The &quot;Exotic Structure&quot; toggle illustrates Milnor&apos;s discovery of exotic 7-spheres—manifolds homeomorphic but not diffeomorphic to S<sup>7</sup>.</li>
                        <li><strong className="text-lime-200">Topological structure</strong> (Topological View): The coarsest structure, preserving only continuity. Characterized by <strong className="text-lime-200">homeomorphism</strong> invariants: the Betti numbers β<sub>k</sub> = rank(H<sub>k</sub>) measuring k-dimensional holes. Here, β<sub>0</sub> counts connected components and β<sub>1</sub> counts 1-dimensional cycles.</li>
                    </ul>
                    <p>
                        This hierarchical decomposition—from rigid Riemannian geometry through smooth manifolds to flexible topology—exemplifies the power of categorical thinking in mathematics. In applications to biological data, where noise and measurement uncertainty dominate, topological invariants provide stable signatures of global structure. Rather than asking &quot;what is the precise conformation?&quot; we ask &quot;what is the persistent homology?&quot;—capturing essential connectivity patterns that survive perturbations.
                    </p>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="Geometry Becoming Topology"
            subtitle="exploring the transformation from geometric to topological properties"
            sections={sections}
            settings={
                <Settings
                    epsilon={epsilon}
                    useExoticStructure={useExoticStructure}
                    currentView={currentView}
                    onEpsilonChange={setEpsilon}
                    onUseExoticStructureChange={setUseExoticStructure}
                    onCurrentViewChange={setCurrentView}
                    onReset={handleReset}
                    onExport={handleExport}
                />
            }
        />
    );
}
