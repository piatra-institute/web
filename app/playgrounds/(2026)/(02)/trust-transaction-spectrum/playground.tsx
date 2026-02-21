'use client';

import { useState, useMemo, useCallback } from 'react';

import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import Equation from '@/components/Equation';

import Settings from './components/Settings';
import Viewer from './components/Viewer';
import {
    type Inputs,
    type Scenario,
    DEFAULT_INPUTS,
    computeModel,
    computeComparison,
} from './logic';


export default function Playground() {
    const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS);
    const [scenarioName, setScenarioName] = useState('Baseline');
    const [scenarios, setScenarios] = useState<Scenario[]>([]);
    const [compareId, setCompareId] = useState<string | null>(null);

    const model = useMemo(() => computeModel(inputs), [inputs]);
    const compare = useMemo(
        () => computeComparison(inputs, scenarios, compareId),
        [inputs, scenarios, compareId],
    );

    const handleSaveScenario = useCallback(() => {
        const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
        const entry: Scenario = {
            id,
            name: scenarioName.trim() || 'Scenario',
            createdAt: new Date().toISOString(),
            inputs: { ...inputs },
            score: model.score,
            posture: model.posture.name,
        };
        setScenarios((prev) => [entry, ...prev].slice(0, 12));
        setCompareId((prev) => prev || id);
    }, [inputs, model.score, model.posture.name, scenarioName]);

    const handleLoadInputs = useCallback((newInputs: Inputs) => {
        setInputs(newInputs);
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
                <div className="w-full h-full flex items-center justify-center">
                    <Viewer
                        model={model}
                        compare={compare}
                        crisis={inputs.crisis}
                    />
                </div>
            ),
        },
        {
            id: 'outro',
            type: 'outro',
            content: (
                <div className="space-y-6">
                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Model Structure</h4>
                        <p className="text-gray-300">
                            The transactionality index combines nine normalised input variables{' '}
                            <Equation math="\tilde{x}_i = x_i / 10" /> with expert-elicited weights{' '}
                            <Equation math="w_i" /> (summing to 1.0), two multiplicative interaction
                            terms, and a convex autonomy adjustment:
                        </p>
                        <Equation mode="block" math="T = 100 \Bigl(\sum_{i=1}^{9} w_i \tilde{x}_i + \gamma_1 \tilde{x}_{\text{thr}}(1-\tilde{x}_{\text{all}}) + \gamma_2 \tilde{x}_{\text{riv}}(1-\tilde{x}_{\text{inst}})\Bigr) - (1-\ell)^{3/2}\!\cdot 10 + \ell \cdot 5" />
                        <p className="text-gray-300 mt-2">
                            where <Equation math="\gamma_1 = 0.08" /> and <Equation math="\gamma_2 = 0.06" /> are
                            interaction coefficients and <Equation math="\ell" /> is normalised autonomy.
                            The index maps to four posture regimes via heuristic thresholds:
                        </p>
                        <ul className="text-gray-300 mt-2 space-y-1">
                            <li><Equation math="T < 25" />: Rules-first / institutionalist</li>
                            <li><Equation math="25 \leq T < 45" />: Selective engagement</li>
                            <li><Equation math="45 \leq T < 65" />: Hedging / insurance</li>
                            <li><Equation math="T \geq 65" />: Hard transactionalism</li>
                        </ul>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Interaction Terms</h4>
                        <p className="text-gray-300">
                            A purely additive model misses crucial conditional dynamics. Walt&apos;s
                            balance-of-threat theory implies that high threat with a credible alliance
                            is qualitatively different from high threat without one — the interaction
                            term <Equation math="\tilde{x}_{\text{thr}} \cdot (1 - \tilde{x}_{\text{all}})" /> captures
                            this compounding effect. Similarly, Thorhallsson&apos;s shelter theory
                            predicts that great-power rivalry in a region without institutional cover
                            produces amplified pressure beyond what the additive terms alone would suggest.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Crisis Regime</h4>
                        <p className="text-gray-300">
                            Under the crisis regime, weight mass is reallocated so that the institutional
                            shelter deficit weight <em>increases</em> (+0.02). This follows Thorhallsson (2011),
                            who argues that shelter is most critical precisely during crises — a shelter
                            deficit is costlier when the threat is acute. Conversely, reputational capital
                            weight decreases (&minus;0.03) because short-term survival overrides reputation
                            investment under acute threat.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Theoretical Sources</h4>
                        <p className="text-gray-300">
                            Factor selection draws on established IR concepts:
                            Thorhallsson&apos;s <em>institutional shelter theory</em> (political, economic,
                            and societal shelter dimensions); Kuik&apos;s <em>hedging framework</em> (structural
                            uncertainty as scope condition, domestic legitimation as primary variation driver);
                            Walt&apos;s <em>balance of threat</em> (proximity, capability, intentions);
                            and Hirschman&apos;s <em>dependency concentration</em> analysis (operationalisable
                            via Herfindahl-Hirschman Index).
                        </p>
                        <p className="text-gray-300 mt-2">
                            Note: the reputational capital factor reflects the Weisiger/Yarhi-Milo position
                            that reputations matter in IR. This is actively contested — Press and Mercer argue
                            reputations matter less than commonly assumed. The model implicitly takes a side
                            in this ongoing debate.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Limitations</h4>
                        <p className="text-gray-300">
                            This is an expert-judgment heuristic, not an empirically calibrated model.
                            The specific weights are elicited rather than regression-derived —
                            comparable in methodology to the Fragile States Index. The posture
                            thresholds (25/45/65) are decision-theoretic boundaries, not
                            empirically observed cutpoints.
                        </p>
                        <p className="text-gray-300 mt-2">
                            Missing factors include geographic proximity (Walt), regime type
                            (democratic vs authoritarian states hedge differently per Kuik),
                            economic structure (resource-rich vs service economies), and normative
                            identity. Sanctions exposure presents an endogeneity concern — it is
                            partly a consequence of posture rather than purely an input to it.
                            Domain-specific posture variation (a state may be transactional on
                            energy security while rules-first on border norms) would require
                            sector-weighted extensions.
                        </p>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="trust-transaction spectrum"
            subtitle="strategic posture optimisation for small states under geopolitical constraints"
            description="small-state diplomacy, institutional shelter theory, and hedging in international relations"
            sections={sections}
            researchUrl="/playgrounds/trust-transaction-spectrum/research"
            settings={
                <Settings
                    inputs={inputs}
                    onInputsChange={setInputs}
                    scenarioName={scenarioName}
                    onScenarioNameChange={setScenarioName}
                    scenarios={scenarios}
                    compareId={compareId}
                    onCompareIdChange={setCompareId}
                    onSaveScenario={handleSaveScenario}
                    onLoadScenario={handleLoadInputs}
                />
            }
        />
    );
}
