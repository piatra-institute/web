'use client';

import { useState, useRef, useEffect } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Settings from './components/Settings';
import Viewer from './components/Viewer';

export default function ScarcityOverTechnologyPlayground() {
    const [technology, setTechnology] = useState(20);
    const [users, setUsers] = useState(100000000);
    const [techEfficacy, setTechEfficacy] = useState(1.5);
    const [friction, setFriction] = useState(0.1);
    const [corruption, setCorruption] = useState(0);
    const [attentionEnabled, setAttentionEnabled] = useState(false);
    const [attention, setAttention] = useState(5000000000);

    const viewerRef = useRef<{ exportCanvas: () => void }>(null);

    const handleReset = () => {
        setTechnology(20);
        setUsers(100000000);
        setTechEfficacy(1.5);
        setFriction(0.1);
        setCorruption(0);
        setAttentionEnabled(false);
        setAttention(5000000000);
    };

    const handleExport = () => {
        if (viewerRef.current) {
            viewerRef.current.exportCanvas();
        }
    };

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
            content: (
                <div className="space-y-6">
                    <div className="prose prose-invert max-w-none">
                        <h2 className="text-lime-500">Economy = ∂(Scarcity)/∂(Technology)</h2>
                        <p className="text-gray-300">
                            This model operationalizes the thesis that &ldquo;the economy&rdquo; is not a static entity,
                            but rather the rate of change of scarcity with respect to technology.
                        </p>
                        <p className="text-gray-300">
                            As technology advances, it transforms the landscape of scarcity. What was once scarce
                            becomes abundant, and new forms of scarcity emerge. The economy is this dynamic process
                            of transformation itself.
                        </p>
                    </div>
                </div>
            ),
        },
        {
            id: 'canvas',
            type: 'canvas' as const,
            content: (
                <PlaygroundViewer className="bg-black">
                    <Viewer
                        ref={viewerRef}
                        technology={technology}
                        users={users}
                        techEfficacy={techEfficacy}
                        friction={friction}
                        corruption={corruption}
                        attentionEnabled={attentionEnabled}
                        attention={attention}
                    />
                </PlaygroundViewer>
            ),
        },
        {
            id: 'outro',
            type: 'outro' as const,
            content: (
                <div className="space-y-8">
                    <div className="prose prose-invert max-w-none">
                        <h3 className="text-lime-500 text-2xl mb-6">The Mathematics of Post-Scarcity</h3>
                        
                        <div className="space-y-6">
                            <div className="border-l-2 border-lime-500/50 pl-4">
                                <h4 className="text-lime-400 font-semibold mb-2">λ · Scarcity as Shadow Price</h4>
                                <p className="text-gray-300">
                                    The dual multiplier from optimization theory—when constraints bind, 
                                    prices emerge. As technology expands capacity, λ → 0, and the resource 
                                    exits the economic sphere entirely. Post-scarcity is λ = 0.
                                </p>
                            </div>

                            <div className="border-l-2 border-lime-500/50 pl-4">
                                <h4 className="text-lime-400 font-semibold mb-2">∂λ/∂T · The Economy as Gradient</h4>
                                <p className="text-gray-300">
                                    Not a place or thing, but a rate of change. The economy exists precisely 
                                    where technology meets scarcity. When this derivative approaches zero, 
                                    the economic problem dissolves—the resource becomes like air.
                                </p>
                            </div>

                            <div className="border-l-2 border-lime-500/50 pl-4">
                                <h4 className="text-lime-400 font-semibold mb-2">h · Artificial Scarcity</h4>
                                <p className="text-gray-300">
                                    Corruption and hoarding create phantom constraints. Even infinite 
                                    technology cannot solve artificially maintained scarcity—a political 
                                    problem masquerading as an economic one.
                                </p>
                            </div>

                            <div className="border-l-2 border-lime-500/50 pl-4">
                                <h4 className="text-lime-400 font-semibold mb-2">A · The Final Frontier</h4>
                                <p className="text-gray-300">
                                    Attention, time, care—resources that technology cannot multiply. 
                                    As material scarcity vanishes, these become the new economic primitives. 
                                    The economy of the future is an economy of human attention.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-black border border-lime-500/20">
                            <p className="text-sm text-lime-400">
                                The economy is not eternal. It is a temporary phenomenon, 
                                a turbulence in the flow from scarcity to abundance. 
                                Our task is not to manage it, but to obsolete it.
                            </p>
                        </div>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="scarcity over technology"
            subtitle="economy as the derivative of scarcity with respect to technology"
            sections={sections}
            settings={
                <Settings
                    technology={technology}
                    setTechnology={setTechnology}
                    users={users}
                    setUsers={setUsers}
                    techEfficacy={techEfficacy}
                    setTechEfficacy={setTechEfficacy}
                    friction={friction}
                    setFriction={setFriction}
                    corruption={corruption}
                    setCorruption={setCorruption}
                    attentionEnabled={attentionEnabled}
                    setAttentionEnabled={setAttentionEnabled}
                    attention={attention}
                    setAttention={setAttention}
                    onReset={handleReset}
                    onExport={handleExport}
                />
            }
        />
    );
}