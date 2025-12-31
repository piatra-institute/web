'use client';

import { useState } from 'react';
import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import Equation from '@/components/Equation';
import { SimulationParams, PRESETS, PresetId } from './constants';

const DEFAULT_PARAMS: SimulationParams = PRESETS[0].params;

export default function Playground() {
    const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
    const [selectedPresetId, setSelectedPresetId] = useState<PresetId>('pluralistic');

    const handleParamsChange = (newParams: SimulationParams) => {
        setParams(newParams);
    };

    const handlePresetChange = (id: PresetId) => {
        setSelectedPresetId(id);
        if (id !== 'custom') {
            const preset = PRESETS.find((p) => p.id === id);
            if (preset) {
                setParams(preset.params);
            }
        }
    };

    const handleReset = () => {
        setParams(DEFAULT_PARAMS);
        setSelectedPresetId('pluralistic');
    };

    const sections: PlaygroundSection[] = [
        {
            id: 'intro',
            type: 'intro',
        },
        {
            id: 'canvas',
            type: 'canvas',
            content: (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 space-y-8">
                    <Viewer params={params} />
                </div>
            ),
        },
        {
            id: 'outro',
            type: 'outro',
            content: (
                <div className="space-y-6">
                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">From Concave to Convex Returns</h4>
                        <p className="text-gray-300">
                            Classical capitalism operates with mostly concave returns to scale: diminishing
                            marginal gains, geographic fragmentation, and technological limits allow many
                            firms to coexist. Algorithmic finance inverts this. Returns become strongly
                            convex: more capital enables better models, better data, faster execution, which
                            compounds into more capital. The fitness landscape transforms from a rolling
                            terrain with many peaks into a sharpening spike where only the apex survives.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">The Zero-Temperature Limit</h4>
                        <p className="text-gray-300">
                            Think of strategies as states in a Boltzmann distribution. Under normal
                            capitalism, noise and bounded rationality spread probability mass across
                            multiple good-enough strategies. Under ultra-optimized algorithmic competition,
                            the system cools toward{' '}
                            <Equation math="T \to 0" />
                            : probability mass concentrates on the single global maximum, and everyone
                            else becomes effectively extinct. Your &quot;only one can exist&quot; is exactly this
                            zero-temperature limit.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Niche Separation and Survival</h4>
                        <p className="text-gray-300">
                            The separation parameter controls how distinct different algorithmic niches
                            are in strategy space. Even with high convexity, if niches are far enough
                            apart, you can have several winners—each a local monopolist in their domain.
                            When niches collapse together (low separation), competition becomes direct,
                            and only the globally optimal strategy survives. This is why the transition
                            to monodominance is not automatic: it requires both high convexity{' '}
                            <em>and</em> niche collapse.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Background Slack and Ecosystem Dependence</h4>
                        <p className="text-gray-300">
                            The slack parameter represents the minimum fitness floor—how much room there
                            is for marginal strategies to persist. With high slack, weak strategies can
                            survive as liquidity providers, noise traders, or marginal participants. With
                            no slack, the system becomes maximally harsh: any strategy below the optimal
                            is driven to extinction. Paradoxically, the dominant algorithm{' '}
                            <em>needs</em> this ecosystem: it requires counterparties, volatility, and a
                            steady flow of inferior orders. Total annihilation would kill its own edge.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Concentration Metrics</h4>
                        <p className="text-gray-300">
                            The top-5% fitness share measures what fraction of total fitness is captured
                            by the strongest strategies. The Gini coefficient measures inequality across
                            the entire landscape. As you increase convexity and collapse niches, both
                            metrics rise sharply—the signature of algorithmic monodominance. A Gini near
                            1 means almost all fitness is concentrated in a single point; a Gini near 0
                            means fitness is evenly distributed across many strategies.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">What Dies Is Not Capitalism</h4>
                        <p className="text-gray-300">
                            RenTec-class algorithms do not end capitalism as a mode of production—they
                            still operate on private capital, wage labour, and profit accumulation. What
                            dies is capitalism as an <em>ecology of many capitals</em>: the ideological
                            story of fair competition, price discovery by many participants, and equal
                            opportunity. What replaces it is algorithmic rentier capitalism: same core
                            logic, but with accumulation routed through opaque, closed, machine-driven
                            systems that ordinary capital owners cannot realistically enter or understand.
                        </p>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="algorithmic monodominance"
            description="phase transitions from concave to convex returns in algorithmic competition"
            sections={sections}
            settings={
                <Settings
                    params={params}
                    selectedPresetId={selectedPresetId}
                    onParamsChange={handleParamsChange}
                    onPresetChange={handlePresetChange}
                    onReset={handleReset}
                />
            }
        />
    );
}
