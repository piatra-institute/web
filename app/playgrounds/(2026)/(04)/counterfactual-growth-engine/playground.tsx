'use client';

import React, { useState, useMemo, useCallback } from 'react';

import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Equation from '@/components/Equation';
import ModelChangelog from '@/components/ModelChangelog';
import ResearchPromptButton from '@/components/ResearchPromptButton';
import { PlaygroundSourceContext } from '@/lib/readPlaygroundSource';

import Settings from './components/Settings';
import Viewer from './components/Viewer';
import {
    Params, DEFAULT_PARAMS, buildComparison, computeKpis,
    decomposePolicy, computeSensitivity, computeNarrative,
} from './logic';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';


interface Props {
    sourceContext?: PlaygroundSourceContext;
}

export default function CounterfactualGrowthEnginePlayground({ sourceContext }: Props) {
    const [params, setParams] = useState<Params>(DEFAULT_PARAMS);

    const comparison = useMemo(() => buildComparison(params), [params]);
    const kpis = useMemo(() => computeKpis(comparison), [comparison]);
    const policyDecomp = useMemo(() => decomposePolicy(params), [params]);
    const sensitivityBars = useMemo(() => computeSensitivity(params), [params]);
    const narrative = useMemo(() => computeNarrative(kpis, params), [kpis, params]);

    const handleParamsChange = useCallback((p: Params) => {
        setParams(p);
    }, []);

    const sections: PlaygroundSection[] = [
        { id: 'intro', type: 'intro' },
        {
            id: 'canvas',
            type: 'canvas',
            content: (
                <PlaygroundViewer>
                    <Viewer
                        params={params}
                        comparison={comparison}
                        kpis={kpis}
                        policyDecomp={policyDecomp}
                        sensitivityBars={sensitivityBars}
                        assumptions={assumptions}
                        versions={versions}
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
                        <h3 className="text-lime-400 font-semibold mb-3">The counterfactual question</h3>
                        <p className="leading-relaxed text-sm">
                            &ldquo;What would Romania&apos;s GDP be today if it had done
                            everything Poland did?&rdquo; The honest answer is: no one
                            knows. But a framework can make the question sharp enough to
                            examine. The engine separates two distinct things: Romania
                            keeps its own 1990 starting conditions and population path,
                            while inheriting a fraction of Poland&apos;s annual growth
                            trajectory. That framing prevents the shortcut of simply
                            copying Poland&apos;s aggregate GDP onto Romania &mdash; which
                            conflates population size with per-person growth.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">The formula</h3>
                        <Equation mode="block" math="\text{GDP}^{\text{cf}}_t = \text{Pop}^{\text{target}}_t \cdot \text{GDPpc}^{\text{target}}_{1990} \cdot \prod_{s=1991}^{t} \bigl(1 + g^{\text{cf}}_s\bigr)" />
                        <p className="leading-relaxed text-sm mt-2">
                            where the counterfactual growth rate
                            {' '}<Equation math="g^{\text{cf}}_s" />{' '}interpolates between
                            the target&apos;s actual growth rate and the model
                            country&apos;s growth rate at intensity
                            {' '}<Equation math="\alpha" />, minus a convergence-drag term
                            {' '}<Equation math="\delta" />{' '}reflecting local friction:
                        </p>
                        <Equation mode="block" math="g^{\text{cf}}_s = (1-\alpha)\,g^{\text{target}}_s + \alpha\,g^{\text{model}}_s - \delta" />
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Synthetic control</h3>
                        <p className="leading-relaxed text-sm">
                            Instead of arbitrarily picking one comparator, you can blend
                            several with normalized weights. This is the logic of Abadie,
                            Diamond &amp; Hainmueller&apos;s synthetic control method:
                            a weighted combination of donor countries often produces a
                            better counterfactual than any single country because it
                            averages out each donor&apos;s idiosyncratic features. Try
                            the &ldquo;Romania: synthetic control&rdquo; preset to see
                            Romania&apos;s path under a 40/35/25 blend of Poland,
                            Czechia, and Slovakia.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Confidence bands</h3>
                        <p className="leading-relaxed text-sm">
                            Counterfactuals should not be reported as single-point
                            estimates. Uncertainty compounds over time &mdash; a
                            projection for 2024 based on 1990 assumptions has far more
                            degrees of freedom than a projection for 1992. The engine
                            models this with square-root uncertainty growth:
                            {' '}<Equation math="\sigma_t = \sigma_0 \sqrt{t/T}" />.
                            The shaded band on the GDP chart shows the range.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Policy gap decomposition</h3>
                        <p className="leading-relaxed text-sm">
                            The policy basket captures seven dimensions (institutions,
                            investment, education, export complexity, macro stability,
                            state capacity, EU absorption). The gap decomposition shows
                            which dimensions contribute most to the overall difference.
                            This is a cleaner answer than &ldquo;Poland grew more&rdquo;
                            &mdash; it lets you say &ldquo;the biggest gap was in export
                            complexity and institutions.&rdquo;
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Reverse framing</h3>
                        <p className="leading-relaxed text-sm">
                            The framework is symmetric. The same machinery that asks
                            &ldquo;what if Romania had been like Poland?&rdquo; can ask
                            &ldquo;what if Poland had been like Romania?&rdquo;. Toggle
                            reverse framing to test whether the model country&apos;s
                            outperformance is treated as normative because of evidence
                            or because of ex post availability bias.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">What this is not</h3>
                        <p className="leading-relaxed text-sm">
                            This is not a causal claim. Poland&apos;s outperformance
                            reflects a bundle of decisions, institutional trajectories,
                            EU integration, demographic and geographic factors, and
                            luck. The counterfactual gap is an outcome-proxy, not a
                            courtroom damages figure. The value of the framework is that
                            it makes the comparison precise enough to examine, debate,
                            and improve &mdash; not that it delivers a single true
                            number.
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
            title="Counterfactual growth engine"
            subtitle="explore how countries might have evolved under another country's economic path"
            description={
                <>
                    <a href="https://www.nber.org/papers/w7771" className="underline" target="_blank" rel="noopener noreferrer">
                        2001, Acemoglu, Johnson &amp; Robinson, Colonial Origins of Comparative Development
                    </a>
                    {' · '}
                    <a href="https://www.nber.org/papers/w6564" className="underline" target="_blank" rel="noopener noreferrer">
                        1999, Hall &amp; Jones, Why Do Some Countries Produce So Much More Output per Worker?
                    </a>
                </>
            }
            sections={sections}
            settings={
                <Settings
                    params={params}
                    onParamsChange={handleParamsChange}
                    kpis={kpis}
                    narrative={narrative}
                />
            }
        />
    );
}
