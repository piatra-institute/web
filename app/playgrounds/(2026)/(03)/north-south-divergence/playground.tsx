'use client';

import React, { useState, useMemo, useCallback } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Equation from '@/components/Equation';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import {
    Scenario,
    DEFAULT_SCENARIO,
    computeGapTimeline,
    computeRadarData,
    shapleyAttribution,
} from './logic';

export default function NorthSouthDivergencePlayground() {
    const [scenario, setScenario] = useState<Scenario>({ ...DEFAULT_SCENARIO });

    const selectedBin = useMemo(
        () => scenario.timeline.find((b) => b.id === scenario.selectedBinId) ?? scenario.timeline[0],
        [scenario.timeline, scenario.selectedBinId],
    );

    const gapData = useMemo(() => computeGapTimeline(scenario), [scenario]);

    const radarData = useMemo(
        () => selectedBin ? computeRadarData(scenario.accelerants, selectedBin) : [],
        [scenario.accelerants, selectedBin],
    );

    const shapley = useMemo(
        () => selectedBin
            ? shapleyAttribution(scenario.model, scenario.accelerants, selectedBin, scenario.weights, scenario.shapleySamples)
            : [],
        [scenario.model, scenario.accelerants, selectedBin, scenario.weights, scenario.shapleySamples],
    );

    const handleSelectBin = useCallback((id: string) => {
        setScenario((prev) => ({ ...prev, selectedBinId: id }));
    }, []);

    const handleReset = useCallback(() => {
        setScenario({ ...DEFAULT_SCENARIO });
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
                        gapData={gapData}
                        radarData={radarData}
                        shapley={shapley}
                        selectedBinId={scenario.selectedBinId}
                        onSelectBin={handleSelectBin}
                        northLabel={scenario.northLabel}
                        southLabel={scenario.southLabel}
                        gapMode={scenario.model.gapMode}
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
                        <h3 className="text-lime-400 font-semibold mb-3">The Great Divergence</h3>
                        <p className="leading-relaxed text-sm">
                            Long-run GDP reconstructions show that today&apos;s North&ndash;South income gaps largely widen in the 19th&ndash;20th centuries, not &ldquo;since forever.&rdquo; The divergence is consistent with industrialization + imperial integration being central to the story. This playground lets you encode hypotheses about which accelerants mattered, when, and how much.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Aggregation Models</h3>
                        <p className="leading-relaxed text-sm mb-3">
                            Three aggregation functions transform accelerant values into a composite score:
                        </p>
                        <Equation
                            mode="block"
                            math="\text{Additive: } f = \sum_i w_i \cdot x_i"
                        />
                        <Equation
                            mode="block"
                            math="\text{Multiplicative: } f = \prod_i x_i^{w_i} \quad \text{(Cobb\text{--}Douglas)}"
                        />
                        <Equation
                            mode="block"
                            math="\text{CES: } f = \left(\sum_i w_i \cdot x_i^\rho\right)^{1/\rho}"
                        />
                        <p className="leading-relaxed text-sm mt-3">
                            The CES (constant elasticity of substitution) nests the other two: as{' '}
                            <Equation math="\rho \to 0" /> it approximates the geometric mean, and at{' '}
                            <Equation math="\rho = 1" /> it reduces to the additive form. Negative{' '}
                            <Equation math="\rho" /> makes accelerants complements (weakest-link behavior).
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Shapley Attribution</h3>
                        <p className="leading-relaxed text-sm mb-3">
                            The Shapley value from cooperative game theory provides a principled way to allocate &ldquo;credit&rdquo; among interacting factors:
                        </p>
                        <Equation
                            mode="block"
                            math="\phi_i = \frac{1}{n!}\sum_{\pi \in \Pi} \left[v(S_i^\pi \cup \{i\}) - v(S_i^\pi)\right]"
                        />
                        <p className="leading-relaxed text-sm mt-3">
                            For each ordering of accelerants, we measure how much adding accelerant{' '}
                            <Equation math="i" /> changes the gap. Averaging over all orderings gives a fair split that accounts for interactions. We approximate this with Monte Carlo sampling over permutations.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Accelerants</h3>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li><span className="text-lime-400">Energy</span>: scalable energy (coal, oil, electrification) &mdash; Pomeranz&apos;s coal + New World framing.</li>
                            <li><span className="text-lime-400">Institutions</span>: property rights, credible commitment, contract enforcement &mdash; Acemoglu, Johnson &amp; Robinson.</li>
                            <li><span className="text-lime-400">State capacity</span>: tax, administration, infrastructure, public goods.</li>
                            <li><span className="text-lime-400">Human capital</span>: education, literacy, health, technology absorption.</li>
                            <li><span className="text-lime-400">Innovation</span>: scientific ecosystems, diffusion, R&amp;D &mdash; Mokyr&apos;s &ldquo;culture of growth.&rdquo;</li>
                            <li><span className="text-lime-400">Finance</span>: intermediation depth, risk-sharing, cost of capital.</li>
                            <li><span className="text-lime-400">Trade</span>: terms-of-trade, bargaining power, value-chain control.</li>
                            <li><span className="text-lime-400">Empire</span>: coerced labor, colonial extraction, unequal exchange &mdash; Beckert&apos;s &ldquo;war capitalism.&rdquo;</li>
                            <li><span className="text-lime-400">Geography</span>: endowments, waterways, disease burdens, transport costs.</li>
                        </ul>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Caveats</h3>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>All values are illustrative placeholders, not authoritative historical data. Replace with your own estimates.</li>
                            <li>Attribution is model-conditioned: changing the aggregator changes the credit split.</li>
                            <li>Factors are endogenous and interactive &mdash; there is no model-free, uniquely correct &ldquo;credit split.&rdquo;</li>
                            <li>The gap between North and South is not explained by any single accelerant; the interaction structure matters.</li>
                        </ul>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="north-south divergence"
            subtitle="accelerants, aggregation models, and Shapley attribution across historical time bins"
            sections={sections}
            settings={
                <Settings
                    scenario={scenario}
                    onScenarioChange={setScenario}
                    onReset={handleReset}
                />
            }
        />
    );
}
