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
    Params,
    Events,
    Snapshot,
    SweepableParam,
    presetParams,
    DEFAULT_EVENTS,
    simulate,
    extractMetrics,
    computeNarrative,
    computeSweep,
    computeSensitivity,
    HISTORICAL_CASES,
} from './logic';
import { assumptions } from './assumptions';
import { calibrationCases } from './calibration';
import { versions, changelog } from './versions';


interface Props {
    sourceContext?: PlaygroundSourceContext;
}

export default function FrontierGovernancePlayground({ sourceContext }: Props) {
    const [params, setParams] = useState<Params>(() => presetParams('balanced'));
    const [events, setEvents] = useState<Events>(DEFAULT_EVENTS);
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
    const [sweepParam, setSweepParam] = useState<SweepableParam>('profitControl');
    const [focusMetric, setFocusMetric] = useState('welfareIndex');
    const [sectorFocus, setSectorFocus] = useState('AI');

    const result = useMemo(() => simulate(params, events), [params, events]);
    const metrics = useMemo(() => extractMetrics(result.final), [result]);
    const narrative = useMemo(() => computeNarrative(metrics, params), [metrics, params]);
    const sweep = useMemo(() => computeSweep(params, events, sweepParam), [params, events, sweepParam]);
    const sensitivityBars = useMemo(() => computeSensitivity(params, events), [params, events]);

    const radarData = useMemo(() => {
        const current = [
            { metric: 'Frontier', value: metrics.frontierIndex },
            { metric: 'Deployment', value: metrics.deploymentIndex },
            { metric: 'Welfare', value: metrics.welfareIndex },
            { metric: 'Resilience', value: metrics.resilienceIndex },
            { metric: 'State capacity', value: metrics.stateCapacityIndex },
            { metric: 'Concentration', value: metrics.concentrationIndex },
        ];
        if (snapshot) {
            return current.map((d) => ({
                ...d,
                snapshotValue: ({
                    'Frontier': snapshot.metrics.frontierIndex,
                    'Deployment': snapshot.metrics.deploymentIndex,
                    'Welfare': snapshot.metrics.welfareIndex,
                    'Resilience': snapshot.metrics.resilienceIndex,
                    'State capacity': snapshot.metrics.stateCapacityIndex,
                    'Concentration': snapshot.metrics.concentrationIndex,
                } as Record<string, number>)[d.metric] ?? 0,
            }));
        }
        return current;
    }, [metrics, snapshot]);

    const scenarioCloud = useMemo(() => {
        const variants: { name: string; p: Params; e: Events }[] = [
            { name: 'Your configuration', p: params, e: events },
            {
                name: 'Hard control',
                p: { ...params, profitControl: 85, excessProfitTax: 45, publicRD: 20, subsidy: 10, capitalCost: 75, energyAbundance: 20 },
                e: events,
            },
            {
                name: 'Rent targeting',
                p: { ...params, profitControl: 18, excessProfitTax: 65, monopolyRegulation: 72, publicRD: 58, procurement: 54 },
                e: events,
            },
            {
                name: 'Frontier developmental',
                p: { ...params, profitControl: 14, excessProfitTax: 28, publicRD: 82, subsidy: 65, procurement: 72, openScience: 72, energyAbundance: 60 },
                e: { ...events, cheapNuclear: true },
            },
            {
                name: 'Venture hypergrowth',
                p: { ...params, profitControl: 6, excessProfitTax: 8, monopolyRegulation: 12, antitrust: 10, publicRD: 22, procurement: 18, capitalCost: 16 },
                e: { ...events, aiShock: true, automationWave: true },
            },
        ];
        return variants.map((variant) => {
            const sim = simulate(variant.p, variant.e);
            return {
                name: variant.name,
                welfare: sim.final.welfareIndex,
                frontier: sim.final.frontierIndex,
                concentration: sim.final.concentrationIndex,
                shortages: sim.final.shortageIndex,
            };
        });
    }, [params, events]);

    const calibrationResults = useMemo(() => calibrationCases.map(c => {
        const sim = simulate(c.params, c.events);
        return {
            name: c.name,
            description: c.description,
            predicted: sim.final.welfareIndex,
            expected: c.expected,
            source: c.source,
        };
    }), []);

    const saveSnapshot = useCallback(() => {
        setSnapshot({
            params,
            events,
            metrics,
            label: params.preset,
        });
    }, [params, events, metrics]);

    const clearSnapshot = useCallback(() => {
        setSnapshot(null);
    }, []);

    const sections: PlaygroundSection[] = [
        { id: 'intro', type: 'intro' },
        {
            id: 'canvas',
            type: 'canvas',
            content: (
                <PlaygroundViewer>
                    <Viewer
                        result={result}
                        metrics={metrics}
                        radarData={radarData}
                        scenarioCloud={scenarioCloud}
                        sweep={sweep}
                        sensitivityBars={sensitivityBars}
                        assumptions={assumptions}
                        calibrationResults={calibrationResults}
                        versions={versions}
                        snapshot={snapshot}
                        sweepParam={sweepParam}
                        onSweepParamChange={setSweepParam}
                        focusMetric={focusMetric}
                        onFocusMetricChange={setFocusMetric}
                        sectorFocus={sectorFocus}
                        onSectorFocusChange={setSectorFocus}
                        historicalCases={HISTORICAL_CASES}
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
                        <h3 className="text-lime-400 font-semibold mb-3">The core distinction</h3>
                        <p className="leading-relaxed text-sm">
                            The correct question is not &ldquo;state or market?&rdquo; but rather:
                            what kind of profit, in what kind of sector, under what informational
                            and energetic conditions? The model is built around three distinct
                            governance instruments that interact differently with sector structure.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Model dynamics</h3>
                        <p className="leading-relaxed text-sm">
                            For each sector <Equation math="s" /> and year <Equation math="t" />,
                            the simulation evolves knowledge, deployment, concentration, and
                            profitability as coupled nonlinear processes:
                        </p>
                        <Equation mode="block" math="K_s(t{+}1) = K_s(t) + \text{impulse}_s \cdot (1 - K_s) \cdot 0.18" />
                        <Equation mode="block" math="D_s(t{+}1) = D_s(t) + \sigma(\text{readiness}_s - 0.34) \cdot 0.10" />
                        <Equation mode="block" math="C_s(t{+}1) = C_s(t) + \text{network}_s \cdot 0.035 - \text{antitrust} \cdot 0.038" />
                        <p className="leading-relaxed text-sm mt-2">
                            The welfare index aggregates consumer benefit, state capacity, and
                            resilience, penalized by inequality and shortage:
                        </p>
                        <Equation mode="block" math="W(t) = \text{consumer} + \text{strategic} \cdot 0.14 + \text{resilience} \cdot 0.12 - \text{inequality} \cdot 0.24" />
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">When control fails</h3>
                        <p className="leading-relaxed text-sm">
                            Broad direct profit control fails when the state cannot observe true costs,
                            quality changes, replacement costs, and risk across thousands of firms in
                            real time. The profit does not disappear; it reappears as shortage, lower
                            quality, bribery, queuing, or black-market markup. Venezuela under the 2014
                            Fair Prices Law is the canonical example.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">When control works</h3>
                        <p className="leading-relaxed text-sm">
                            Excess-profits taxation can be efficient when it falls only on economic
                            rent: if the profit is a windfall created by war, scarcity, monopoly
                            position, or luck rather than by marginal effort or investment, taxing
                            the excess does less damage. A normal return still remains. Utility-style
                            regulation works in structural monopolies where duplicative competition
                            is wasteful.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Frontier sectors</h3>
                        <p className="leading-relaxed text-sm">
                            AI, robotics, private space, private nuclear, advanced materials, and
                            biotech each occupy different positions in the control-frontier tradeoff
                            space. Nuclear has high monopoly-like structure (
                            <Equation math="\mu = 0.64" />) making utility regulation defensible.
                            AI has high network effects (<Equation math="n = 0.84" />) making
                            antitrust and excess-profits taxation more appropriate. Materials science
                            at the speculative frontier (<Equation math="f = 1.0" />) benefits most
                            from public R&D and open science.
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
            title="frontier governance"
            subtitle="when state control of profits helps vs. harms innovation across frontier sectors"
            description={
                <>
                    <a href="https://www.imf.org/en/publications/wp/issues/2022/09/16/excess-profit-taxes-historical-perspective-and-contemporary-relevance-523550" className="underline" target="_blank" rel="noopener noreferrer">
                        2022, IMF, Excess Profit Taxes: Historical Perspective and Contemporary Relevance
                    </a>
                </>
            }
            sections={sections}
            settings={
                <Settings
                    params={params}
                    onParamsChange={setParams}
                    events={events}
                    onEventsChange={setEvents}
                    metrics={metrics}
                    narrative={narrative}
                    snapshot={snapshot}
                    onSaveSnapshot={saveSnapshot}
                    onClearSnapshot={clearSnapshot}
                />
            }
        />
    );
}
