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
    const [selectedPresetId, setSelectedPresetId] = useState<PresetId>('open');

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
        setSelectedPresetId('open');
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
                        <h4 className="text-lime-400 font-semibold mb-2">The Selection Mechanism</h4>
                        <p className="text-gray-300">
                            Consider agents with moral aversion{' '}
                            <Equation math="m \in [0,1]" />
                            {' '}where higher values mean stronger aversion to complicity and corruption.
                            A field with closedness{' '}
                            <Equation math="k" />
                            {' '}offers joining payoff{' '}
                            <Equation math="J(m,k) = B(k) - [m \cdot g(k) + h(k)]" />
                            . Agents join if{' '}
                            <Equation math="J \geq 0" />
                            , yielding cutoff{' '}
                            <Equation math="m^* = \frac{B(k) - h(k)}{g(k)}" />
                            . Only agents with{' '}
                            <Equation math="m \leq m^*" />
                            {' '}enter.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Why Closedness Selects for Low Moral Aversion</h4>
                        <p className="text-gray-300">
                            As closedness{' '}
                            <Equation math="k" />
                            {' '}increases, the moral cost amplifier{' '}
                            <Equation math="g(k) = k^\alpha" />
                            {' '}rises. If{' '}
                            <Equation math="\frac{g'(k)}{g(k)} > \frac{B'(k) - h'(k)}{B(k) - h(k)}" />
                            , then{' '}
                            <Equation math="m^{*\prime}(k) < 0" />
                            : the cutoff falls. High-m types (those with strong moral aversion) find
                            entry increasingly costly, while low-m types still find it attractive.
                            The entrant pool shifts toward corruption-tolerant individuals.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Loyalty Signaling Amplifies Selection</h4>
                        <p className="text-gray-300">
                            When the system requires loyalty signals (oaths, public endorsements),
                            the cutoff becomes{' '}
                            <Equation math="\tilde{m}^* = \frac{B - h + \bar{\ell} \psi(s,k)}{g(k) + \phi(s,k)}" />
                            {' '}where{' '}
                            <Equation math="\phi" />
                            {' '}is moral dissonance cost and{' '}
                            <Equation math="\psi" />
                            {' '}is identity/loyalty benefit. Stronger signals raise{' '}
                            <Equation math="\phi" />
                            , shrinking{' '}
                            <Equation math="\tilde{m}^*" />
                            {' '}further. Closed systems and loyalty tests complement each other
                            in producing adverse selection.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">The Population Distribution</h4>
                        <p className="text-gray-300">
                            Moral aversion in the applicant population follows a Beta distribution{' '}
                            <Equation math="m \sim \text{Beta}(a, b)" />
                            . Higher{' '}
                            <Equation math="a" />
                            {' '}skews toward high moral aversion (more principled population);
                            higher{' '}
                            <Equation math="b" />
                            {' '}skews toward low moral aversion. The charts show how the entrant
                            distribution (shaded) is truncated at{' '}
                            <Equation math="m^*" />
                            {' '}and shifts left as closedness increases.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Dynamic Reinforcement</h4>
                        <p className="text-gray-300">
                            Closedness today selects tomorrow&apos;s joiners, who then vote for or
                            normalize closedness—locking in a corruption-prone attractor. The
                            coupled mean-field map{' '}
                            <Equation math="k_{t+1} = \Gamma(\Phi(m^*(k_t)))" />
                            {' '}can have stable high-closedness equilibria with persistently low
                            mean{' '}
                            <Equation math="\bar{m}" />
                            . Once established, these equilibria are self-reinforcing.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">What This Means</h4>
                        <p className="text-gray-300">
                            The model shows that no-criticism constraints mathematically implement
                            a screening device that filters in agents already inclined to tolerate
                            or benefit from corrupt equilibria. This is not about individual moral
                            failure—it&apos;s about structural forces that systematically select for
                            certain types. The sound, evidence-based stance: condemn the structure,
                            predict higher corruption rates, and evaluate individuals by actions
                            within that structure rather than by mere affiliation.
                        </p>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="closedness adverse selection"
            description="how no-criticism constraints filter entrants toward lower moral aversion"
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
