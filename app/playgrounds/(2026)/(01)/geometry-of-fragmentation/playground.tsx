'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import Settings, { SimulationParams, DEFAULT_PARAMS } from './components/Settings';
import Viewer, { ViewerRef } from './components/Viewer';
import Equation from '@/components/Equation';
import { generateMosaic, computeStats, MosaicStats, HistoryPoint } from './logic';

export default function Playground() {
    const viewerRef = useRef<ViewerRef>(null);
    const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
    const [stats, setStats] = useState<MosaicStats | null>(null);
    const [settingsOpen, setSettingsOpen] = useState(false);

    // Animation state
    const [isPlaying, setIsPlaying] = useState(false);
    const [animationFrame, setAnimationFrame] = useState(-1); // -1 = show final
    const [history, setHistory] = useState<HistoryPoint[]>([]);
    const [animationSpeed, setAnimationSpeed] = useState(100); // ms per frame

    useEffect(() => {
        const result = generateMosaic({
            mode: params.mode,
            splits: params.splits,
            sites: params.sites,
            seed: params.seed,
            angleBias: params.angleBias,
            minArea: params.minArea,
            storeEvery: params.storeEvery,
        });

        viewerRef.current?.updateMosaic(result.polys, result.history);
        setStats(computeStats(result.polys));
        setHistory(result.history);
        setAnimationFrame(-1); // Reset to final on new generation
        setIsPlaying(false);
    }, [params]);

    // Animation loop
    useEffect(() => {
        if (!isPlaying || history.length === 0) return;

        const interval = setInterval(() => {
            setAnimationFrame(prev => {
                const next = prev + 1;
                if (next >= history.length) {
                    setIsPlaying(false);
                    return -1; // Show final
                }
                return next;
            });
        }, animationSpeed);

        return () => clearInterval(interval);
    }, [isPlaying, history.length, animationSpeed]);

    // Get current stats based on animation frame
    const currentStats = animationFrame >= 0 && animationFrame < history.length
        ? computeStats(history[animationFrame].polys)
        : stats;

    const handleParamsChange = (newParams: SimulationParams) => {
        setParams(newParams);
    };

    const handleRegenerate = () => {
        // Trigger regeneration (already handled by params change)
    };

    const handlePlayPause = useCallback(() => {
        if (isPlaying) {
            setIsPlaying(false);
        } else {
            if (animationFrame === -1 || animationFrame >= history.length - 1) {
                setAnimationFrame(0);
            }
            setIsPlaying(true);
        }
    }, [isPlaying, animationFrame, history.length]);

    const handleReset = useCallback(() => {
        setIsPlaying(false);
        setAnimationFrame(0);
    }, []);

    const handleSkipToEnd = useCallback(() => {
        setIsPlaying(false);
        setAnimationFrame(-1);
    }, []);

    const sections: PlaygroundSection[] = [
        {
            id: 'intro',
            type: 'intro',
        },
        {
            id: 'canvas',
            type: 'canvas',
            content: (
                <div className="absolute inset-0 flex flex-col">
                    {settingsOpen && (
                        <div className="absolute inset-0 bg-black/50 z-10 pointer-events-none" />
                    )}
                    <div className="flex-1 p-4">
                        <Viewer
                            ref={viewerRef}
                            colorMode={params.colorMode}
                            showEdges={params.showEdges}
                            showFill={params.showFill}
                            animationFrame={animationFrame}
                            historyLength={history.length}
                        />
                    </div>
                    <div className="flex items-center justify-center gap-4 py-2">
                        {/* Animation controls */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleReset}
                                className="px-2 py-1 text-xs border border-lime-500/30 text-lime-300 hover:border-lime-500 transition-colors"
                                title="Reset"
                            >
                                ⏮
                            </button>
                            <button
                                onClick={handlePlayPause}
                                className="px-3 py-1 text-xs border border-lime-500/30 text-lime-300 hover:border-lime-500 transition-colors"
                            >
                                {isPlaying ? '⏸' : '▶'}
                            </button>
                            <button
                                onClick={handleSkipToEnd}
                                className="px-2 py-1 text-xs border border-lime-500/30 text-lime-300 hover:border-lime-500 transition-colors"
                                title="Skip to end"
                            >
                                ⏭
                            </button>
                            <span className="text-xs text-lime-200/60 ml-2">
                                {animationFrame >= 0 ? `${animationFrame + 1}/${history.length}` : `${history.length}/${history.length}`}
                            </span>
                        </div>
                        {/* Stats */}
                        {currentStats && (
                            <div className="flex gap-6 text-sm font-mono">
                                <div>
                                    <span className="text-lime-200/50">cells:</span>{' '}
                                    <span className="text-lime-400">{currentStats.cells}</span>
                                </div>
                                <div>
                                    <span className="text-lime-200/50">⟨n⟩:</span>{' '}
                                    <span className="text-lime-400">{currentStats.avgSides.toFixed(2)}</span>
                                </div>
                                <div>
                                    <span className="text-lime-200/50">⟨d⟩:</span>{' '}
                                    <span className="text-lime-400">{currentStats.avgDegree.toFixed(2)}</span>
                                </div>
                                <div>
                                    <span className="text-lime-200/50">1/n+1/d:</span>{' '}
                                    <span className="text-lime-400">
                                        {(1/currentStats.avgSides + 1/currentStats.avgDegree).toFixed(3)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            id: 'outro',
            type: 'outro',
            content: (
                <div className="space-y-6">
                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Plato&apos;s Cube</h4>
                        <p className="text-gray-300">
                            When solids fragment randomly, the resulting pieces tend toward a statistical attractor:
                            on average, fragments have approximately 6 faces and 8 vertices&mdash;the topology of a cube.
                            As Gábor Domokos and Douglas Jerolmack showed, this isn&apos;t about physics; it&apos;s pure geometry.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">The Quadrangle Attractor</h4>
                        <p className="text-gray-300 mb-3">
                            In two dimensions, random convex splits of a region produce fragments that average
                            approximately 4 sides and 4 vertices:
                        </p>
                        <Equation mode="block" math="\langle n \rangle \to 4" />
                        <p className="text-gray-300 mt-3">
                            This &quot;Platonic quadrangle&quot; is the 2D analog of the cube attractor. You can observe
                            this by selecting &quot;Random splits&quot; mode and increasing the number of splits.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">The Voronoi Hexagon</h4>
                        <p className="text-gray-300 mb-3">
                            Different fragmentation processes lead to different attractors. Voronoi tessellations,
                            which emerge from processes like cooling, drying mud, or columnar jointing, produce:
                        </p>
                        <Equation mode="block" math="\langle n \rangle \to 6, \quad \langle d \rangle \to 3" />
                        <p className="text-gray-300 mt-3">
                            where <Equation math="\langle d \rangle" /> is the average vertex degree (polygons meeting at each vertex).
                            The Giant&apos;s Causeway and dried mud flats exhibit this hexagonal pattern.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Euler&apos;s Formula Constraint</h4>
                        <p className="text-gray-300 mb-3">
                            For planar tilings, the average sides <Equation math="n" /> and vertex degree <Equation math="d" /> are constrained:
                        </p>
                        <Equation mode="block" math="\frac{1}{n} + \frac{1}{d} \approx \frac{1}{2}" />
                        <p className="text-gray-300 mt-3">
                            This relationship, derived from Euler&apos;s formula, restricts which (n, d) combinations are geometrically possible.
                            Boundary effects can cause deviations.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Phase Space</h4>
                        <p className="text-gray-300">
                            The phase space view plots the trajectory of (avgDegree, avgSides) as fragmentation proceeds.
                            Watch how different modes converge toward their respective attractors: (4,4) for random splits,
                            (~3,~6) for Voronoi. The mixed mode shows competition between these attractors.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Angle Bias</h4>
                        <p className="text-gray-300">
                            Increasing angle bias pushes fracture lines toward horizontal and vertical orientations,
                            producing more rectangular fragments. This mimics geological processes where stress fields
                            have preferred orientations.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Implications</h4>
                        <p className="text-gray-300">
                            This framework suggests that fragment statistics can reveal formation conditions.
                            Given a field site with fractured rock, measuring the average faces and vertices
                            might indicate whether fragmentation occurred through random stress, thermal contraction,
                            or repeated cracking cycles.
                        </p>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="Geometry of fragmentation"
            subtitle="random fragmentation converging to universal attractors"
            description={
                <a
                    href="https://www.pnas.org/doi/10.1073/pnas.2001037117"
                    target="_blank"
                    className="text-blue-400 hover:text-blue-300 underline"
                >
                    2020, Domokos, Jerolmack, Kun, Török, Plato&apos;s cube and the natural geometry of fragmentation
                </a>
            }
            sections={sections}
            settings={<Settings params={params} onParamsChange={handleParamsChange} onRegenerate={handleRegenerate} />}
            onSettingsToggle={setSettingsOpen}
        />
    );
}
