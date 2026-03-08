'use client';

import { useState, useMemo, useCallback } from 'react';

import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Equation from '@/components/Equation';

import Settings from './components/Settings';
import Viewer from './components/Viewer';
import {
    type Params,
    DEFAULT_PARAMS,
    mulberry32,
    generateLambdas,
    buildProbabilityCurve,
    estimateThresholds,
    fitPowerLaw,
    buildCompartmentWitness,
    estimateSinglePoint,
} from './logic';


export default function CO2MetabolismPlayground() {
    const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
    const [runNonce, setRunNonce] = useState(0);
    const [witnessNonce, setWitnessNonce] = useState(0);

    const lambdas = useMemo(
        () => generateLambdas(params.lambdaCount, params.lambdaBase),
        [params.lambdaCount, params.lambdaBase],
    );

    const simulation = useMemo(() => {
        const rng = mulberry32(params.seed + runNonce * 1000);
        const curve = buildProbabilityCurve({
            nMin: params.nMin,
            nMax: params.nMax,
            nStep: params.nStep,
            lambdas,
            q: params.q,
            trials: params.trials,
            roleProbs: params.roleProbs,
            rng,
        });
        const thresholds = estimateThresholds(curve, lambdas, params.targetThreshold);
        const fit = fitPowerLaw(thresholds);
        return { curve, thresholds, fit };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [runNonce]);

    const witness = useMemo(() => {
        const rng = mulberry32(params.seed + witnessNonce * 7919);
        const lambda = lambdas[Math.floor(lambdas.length / 2)] || 0.25;
        const N = Math.round(params.nMin + (params.nMax - params.nMin) * 0.45);
        return buildCompartmentWitness({
            N,
            q: params.q,
            lambda,
            roleProbs: params.roleProbs,
            rng,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [witnessNonce]);

    const stats = useMemo(() => {
        const rng = mulberry32(params.seed + runNonce * 3001);
        return estimateSinglePoint({
            nMin: params.nMin,
            nMax: params.nMax,
            q: params.q,
            lambdas,
            trials: params.trials,
            roleProbs: params.roleProbs,
            rng,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [runNonce]);

    const handleRun = useCallback(() => setRunNonce((n) => n + 1), []);
    const handleNewWitness = useCallback(() => setWitnessNonce((n) => n + 1), []);

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
                        viewMode={params.viewMode}
                        curve={simulation.curve}
                        thresholds={simulation.thresholds}
                        fit={simulation.fit}
                        witness={witness}
                        lambdas={lambdas}
                        targetThreshold={params.targetThreshold}
                    />
                </PlaygroundViewer>
            ),
        },
        {
            id: 'outro',
            type: 'outro' as const,
            content: (
                <div className="space-y-8 text-gray-300">
                    <p>
                        Nick Lane&apos;s hypothesis proposes that life originated not from a prebiotic soup
                        but from the geochemistry of alkaline hydrothermal vents. Where hydrogen-rich
                        fluids from serpentinizing rock met CO₂-laden ocean water, a natural
                        electrochemical gradient drove carbon fixation — the same reaction that
                        powers the acetyl-CoA pathway in modern methanogens and acetogens.
                    </p>

                    <div className="border-l-2 border-lime-500/40 pl-4 my-4">
                        <p className="text-lime-200/80 mb-2">
                            The 4-reaction Lane motif — a minimal proto-metabolic core:
                        </p>
                        <div className="space-y-1 font-mono text-sm text-lime-200/70">
                            <Equation mode="block" math="\text{r1: } \text{CO}_2 + \text{H}_2 \xrightarrow{M^*} A" />
                            <Equation mode="block" math="\text{r2: } A \xrightarrow{M^*} C" />
                            <Equation mode="block" math="\text{r3: } A \xrightarrow{C} B" />
                            <Equation mode="block" math="\text{r4: } A + \text{H}_2 \xrightarrow{C} 2A" />
                        </div>
                        <p className="text-lime-200/60 text-sm mt-2">
                            A = activated intermediate, C = catalyst/cofactor, B = boundary precursor.
                            Reaction r4 is autocatalytic: the system can amplify itself.
                        </p>
                    </div>

                    <p>
                        This playground models a threshold question: molecules are randomly assigned
                        roles (A, C, B) and distributed across vent pore compartments. Each
                        compartment is checked for a Lane-like motif. The central parameter is
                        catalytic density λ — the probability that any given molecular interaction
                        actually catalyzes a reaction.
                    </p>

                    <div className="border-l-2 border-lime-500/40 pl-4 my-4">
                        <p className="text-lime-200/80 mb-2">
                            The expected motif count scales as:
                        </p>
                        <Equation
                            mode="block"
                            math="\mu \approx p_A \cdot p_C \cdot p_B \cdot \frac{N^3 \cdot \lambda^4}{q^2}"
                        />
                        <p className="text-lime-200/60 text-sm mt-2">
                            As N grows, proto-cores become probabilistically inevitable — not guaranteed
                            in any single compartment, but increasingly hard to avoid across the ensemble.
                        </p>
                    </div>

                    <p>
                        The threshold N* marks where P(H<sub>L</sub>) crosses the target probability.
                        Empirically, N* scales with λ as a power law. The heuristic analysis
                        predicts:
                    </p>

                    <div className="border-l-2 border-lime-500/40 pl-4 my-4">
                        <Equation
                            mode="block"
                            math="N^* \propto \lambda^{-4/3}"
                        />
                        <p className="text-lime-200/60 text-sm mt-2">
                            Higher catalytic density dramatically lowers the molecular threshold
                            for proto-metabolic emergence.
                        </p>
                    </div>

                    <p>
                        Compartmentalization matters: vent pores act as natural reaction vessels.
                        More pores (higher q) dilute molecules across compartments, pushing
                        thresholds upward. But each pore provides an independent trial — a
                        tradeoff between concentration and combinatorial opportunity.
                    </p>

                    <p className="text-lime-200/60 text-sm">
                        This is a toy model — no stoichiometry, kinetics, or thermodynamics.
                        It captures threshold behavior, not chemistry. The point is that
                        the transition from &quot;possible&quot; to &quot;nearly forced&quot; can be sharp,
                        and that sharpness does not depend on any one lucky compartment
                        but on the statistics of the entire vent system.
                    </p>
                </div>
            ),
        },
    ];

    const settings = (
        <Settings
            params={params}
            onParamsChange={setParams}
            stats={stats}
            onRun={handleRun}
            onNewWitness={handleNewWitness}
        />
    );

    return (
        <PlaygroundLayout
            title="co₂-metabolism hypothesis"
            subtitle="proto-metabolic threshold behavior in alkaline hydrothermal vent chemistry"
            description={
                <a
                    href="https://doi.org/10.1016/j.cell.2012.11.050"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    2012, Lane &amp; Martin, The Origin of Membrane Bioenergetics
                </a>
            }
            sections={sections}
            settings={settings}
        />
    );
}
