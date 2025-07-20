'use client';

import { useState, useRef } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Settings from './components/Settings';
import Viewer from './components/Viewer';



export default function MeaningAutogenesisPlayground() {
    const [currentLevel, setCurrentLevel] = useState(0);
    const [simulationRunning, setSimulationRunning] = useState(false);
    const [simulationPaused, setSimulationPaused] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [canDisrupt, setCanDisrupt] = useState(false);
    const [simulationParams, setSimulationParams] = useState({
        substrateCount: 80,
        catalystCount: 10,
        fragilityThreshold: 20,
        simulationSpeed: 1
    });
    const viewerRef = useRef<{ disruptCapsid: () => void; exportCanvas: () => void; stepSimulation: () => void; exportData: () => void }>(null);

    const handleStartReset = () => {
        if (simulationRunning) {
            setSimulationRunning(false);
            setSimulationPaused(false);
            setCanDisrupt(false);
            setRefreshKey(prev => prev + 1);
        } else {
            if (currentLevel === 0) return;
            setSimulationRunning(true);
            setSimulationPaused(false);
        }
    };

    const handlePausePlay = () => {
        setSimulationPaused(!simulationPaused);
    };

    const handleStep = () => {
        if (!simulationRunning) return;
        viewerRef.current?.stepSimulation();
    };

    const handleDisrupt = () => {
        viewerRef.current?.disruptCapsid();
    };

    const handleExport = () => {
        viewerRef.current?.exportCanvas();
    };

    const handleExportData = () => {
        viewerRef.current?.exportData();
    };

    const handleParamChange = (param: string, value: number) => {
        setSimulationParams(prev => ({ ...prev, [param]: value }));
    };

    const handleLevelChange = (level: number) => {
        if (level === currentLevel && simulationRunning) return;
        setCurrentLevel(level);
        setSimulationRunning(false);
        setSimulationPaused(false);
        setCanDisrupt(false);
        setRefreshKey(prev => prev + 1);
    };

    return (
        <PlaygroundLayout
            title="meaning autogenesis"
            subtitle="biosemiotic emergence from molecule to sign"
            description={
                <a
                    href="https://doi.org/10.1007/s12304-021-09453-9"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    2021, Terrence W. Deacon, How Molecules Became Signs
                </a>
            }
            sections={[
                {
                    id: 'intro',
                    type: 'intro',
                    content: (
                        <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                            <h2 className="text-2xl font-bold text-white mb-4">Biosemiotics: From Molecule to Sign</h2>
                            <p>
                                This playground simulates the emergence of semiotic (meaning-making) processes from simple chemistry.
                                Based on biosemiotician Terrence Deacon&apos;s work, it shows how a simple &quot;autogen&quot; can evolve
                                from merely self-repairing to interpreting its environment and eventually using a molecular &quot;symbol&quot; system.
                            </p>
                        </div>
                    )
                },
                {
                    id: 'canvas',
                    type: 'canvas',
                    content: (
                        <PlaygroundViewer>
                            <div className="relative w-full h-full">
                                <Viewer
                                    ref={viewerRef}
                                    currentLevel={currentLevel}
                                    simulationRunning={simulationRunning}
                                    simulationPaused={simulationPaused}
                                    refreshKey={refreshKey}
                                    onCanDisruptChange={setCanDisrupt}
                                    simulationParams={simulationParams}
                                />
                            </div>
                        </PlaygroundViewer>
                    )
                },
                {
                    id: 'outro',
                    type: 'outro',
                    content: (
                        <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                            <h2 className="text-2xl font-bold text-white mb-6">Understanding Biosemiotic Emergence</h2>

                            <p>
                                This simulation demonstrates how <strong className="font-semibold text-lime-400">meaning</strong> emerges from
                                simple molecular interactions. Each level represents a fundamental type of sign relation described by
                                Charles Sanders Peirce and applied to biology by Terrence Deacon.
                            </p>

                            <div className="space-y-6">
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Level 1: Iconic Signs</h3>
                                    <p className="mb-2">
                                        The autogen interprets disruption through <em>resemblance</em>. A broken capsid resembles
                                        the need for repair, triggering an identical response regardless of cause.
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        <strong>Key insight:</strong> Even the simplest self-maintaining systems exhibit proto-semiotic
                                        behavior - they &quot;interpret&quot; their environment through chemical reactions.
                                    </p>
                                </div>

                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Level 2: Indexical Signs</h3>
                                    <p className="mb-2">
                                        The autogen now responds to <em>correlations</em>. Substrate binding indicates resource
                                        availability, creating a causal relationship between environmental state and system response.
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        <strong>Key insight:</strong> This represents the emergence of environmental sensing -
                                        the system can now &quot;measure&quot; external conditions and respond adaptively.
                                    </p>
                                </div>

                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Level 3: Symbolic Signs</h3>
                                    <p className="mb-2">
                                        The template molecule carries <em>conventional</em> information. The sequence doesn&apos;t
                                        physically resemble what it produces - it&apos;s an arbitrary code that must be &quot;read&quot;
                                        by the catalysts.
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        <strong>Key insight:</strong> This is analogous to genetic information - abstract sequences
                                        that gain meaning only through interpretation by molecular machinery.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 p-6 border border-gray-800">
                                <h3 className="text-lg font-semibold text-white mb-3">Theoretical Implications</h3>
                                <p className="mb-4">
                                    Deacon&apos;s autogenic model suggests that life&apos;s defining features -
                                    self-maintenance, adaptation, and heredity - emerge naturally from the interplay
                                    of self-organizing processes. No external designer or pre-existing information is required.
                                </p>
                                <p className="text-sm text-gray-400">
                                    The progression from iconic to symbolic interpretation parallels major transitions in evolution:
                                    from simple autocatalysis to environmental responsiveness to genetic encoding. Each level
                                    builds on the previous, creating increasingly sophisticated forms of biological meaning.
                                </p>
                            </div>
                        </div>
                    )
                }
            ]}
            settings={
                <Settings
                    currentLevel={currentLevel}
                    simulationRunning={simulationRunning}
                    simulationPaused={simulationPaused}
                    canDisrupt={canDisrupt}
                    onLevelChange={handleLevelChange}
                    onStartReset={handleStartReset}
                    onPausePlay={handlePausePlay}
                    onStep={handleStep}
                    onDisrupt={handleDisrupt}
                    onExport={handleExport}
                    onExportData={handleExportData}
                    onParamChange={handleParamChange}
                    simulationParams={simulationParams}
                />
            }
        />
    );
}