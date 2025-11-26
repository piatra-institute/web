'use client';

import { useRef, useState } from 'react';
import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import Settings from './components/Settings';
import Viewer, { ViewerRef } from './components/Viewer';
import Equation from '@/components/Equation';
import { SimulationParams, PRESETS, PresetId } from './constants';

const DEFAULT_PARAMS: SimulationParams = PRESETS[0].params;

export default function Playground() {
    const viewerRef = useRef<ViewerRef>(null);

    // Lift state up to prevent reset on settings toggle
    const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
    const [selectedPresetId, setSelectedPresetId] = useState<PresetId>('sorting');

    const handleParamsChange = (newParams: SimulationParams) => {
        setParams(newParams);
        viewerRef.current?.updateSimulation(newParams);
    };

    const handlePresetChange = (id: PresetId) => {
        setSelectedPresetId(id);
        // Only update params when selecting a non-custom preset
        // When switching to 'custom' (from slider changes), keep current params
        if (id !== 'custom') {
            const preset = PRESETS.find((p) => p.id === id);
            if (preset) {
                setParams(preset.params);
                viewerRef.current?.updateSimulation(preset.params);
            }
        }
    };

    const handleReset = () => {
        setParams(DEFAULT_PARAMS);
        setSelectedPresetId('sorting');
        viewerRef.current?.reset();
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
                    <Viewer ref={viewerRef} params={params} />
                </div>
            ),
        },
        {
            id: 'outro',
            type: 'outro',
            content: (
                <div className="space-y-6">
                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Intra-Algorithm Freedom</h4>
                        <p className="text-gray-300">
                            Even with a fixed algorithm, branching and choice exist. The conditional action
                            entropy{' '}
                            <Equation math="H(A_t \mid H_t)" />
                            {' '}measures how many nontrivial options the system has at each step. Combined with
                            empowerment—the mutual information{' '}
                            <Equation math="I(A_t ; S_{t+\Delta})" />
                            {' '}between actions and future states—this captures meaningful choices rather than mere noise.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Inter-Algorithm Freedom</h4>
                        <p className="text-gray-300">
                            The policy manifold volume{' '}
                            <Equation math="V_\tau = \text{Vol}(\mathcal{R}_\tau)" />
                            {' '}represents how many distinct algorithms (policies) the system can reach through
                            learning, plasticity, or reconfiguration within timescale τ. A sorting algorithm has
                            near-zero volume; a learning organism inhabits a vast, structured region of policy space.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Causal Emergence</h4>
                        <p className="text-gray-300">
                            When macro-level descriptions have more effective information than micro-level ones,
                            we have causal emergence:{' '}
                            <Equation math="\text{EI}(\text{macro}) > \text{EI}(\text{micro})" />
                            . This is where high-level decisions become better levers on system behavior than
                            raw micro-variables—the mathematical signature of genuine agency at scale.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Descriptive Regularity</h4>
                        <p className="text-gray-300">
                            The Bernshteyn–Rozhoň bridge connects local distributed algorithms to measurable
                            colorings on infinite Borel graphs. High descriptive regularity means solutions
                            are tame (Borel/Baire measurable) and locally implementable—not pathological
                            axiom-of-choice constructions that cannot be realized by physical systems.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">The Tree and Cloth Metaphor</h4>
                        <p className="text-gray-300">
                            The visualization shows algorithms as trees—computation unfolding through time—with
                            a translucent cloth representing goal slack: the fiber bundle of micro-implementations
                            that achieve the same macro-outcome. Thick cloth means many paths to the same goal;
                            thin cloth means rigid, deterministic execution. This is freedom made geometric.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Composite Freedom Measure</h4>
                        <p className="text-gray-300">
                            The freedom score combines these dimensions:
                        </p>
                        <Equation mode="block" math="F \approx 0.25 \cdot H(A_t|H_t) + 0.25 \cdot \text{Empowerment} + 0.2 \cdot \log V_\tau + 0.2 \cdot (\text{EI}_\text{macro} - \text{EI}_\text{micro}) + 0.1 \cdot \text{Regularity}" />
                        <p className="text-gray-300 mt-2">
                            Low scores indicate rigid automata with tiny policy manifolds. High scores correspond
                            to systems that navigate policy space itself, exploiting slack between implementations
                            and using macro-scale descriptions as powerful levers on their own dynamics.
                        </p>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="space between algorithms"
            description="intra- and inter-algorithm freedom through policy manifolds and goal slack"
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
