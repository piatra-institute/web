'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';

import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Equation from '@/components/Equation';
import ModelChangelog from '@/components/ModelChangelog';
import ResearchPromptButton from '@/components/ResearchPromptButton';
import { PlaygroundSourceContext } from '@/lib/readPlaygroundSource';

import Settings from './components/Settings';
import Viewer, { TrajectoryPoint } from './components/Viewer';
import { ForbiddenCell } from './components/ForbiddenHeatmap';
import {
    Params,
    PresetKey,
    Snapshot,
    SweepableParam,
    Metrics,
    ActionKey,
    ACTIONS,
    PRESET_DESCRIPTIONS,
    presetParams,
    applyAction,
    obstructionMatrix,
    computeViability,
    computeNarrative,
    computeSensitivity,
    computeSweep,
} from './logic';
import { assumptions } from './assumptions';
import { calibrationCases } from './calibration';
import { versions, changelog } from './versions';


interface Props {
    sourceContext?: PlaygroundSourceContext;
}

const TRAJECTORY_LIMIT = 30;
const ACTIVE_EDGE_TICKS = 6;

export default function ForbiddenEdgesPlayground({ sourceContext }: Props) {
    const initialPreset: PresetKey = 'broken-trust';
    const [params, setParams] = useState<Params>(() => presetParams(initialPreset));
    const [metrics, setMetrics] = useState<Metrics>(() => PRESET_DESCRIPTIONS[initialPreset].initialMetrics);
    const [trajectory, setTrajectory] = useState<TrajectoryPoint[]>(() => [{
        ...PRESET_DESCRIPTIONS[initialPreset].initialMetrics,
        tick: 0,
        viability: computeViability(PRESET_DESCRIPTIONS[initialPreset].initialMetrics),
        action: null,
    }]);
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
    const [sweepParam, setSweepParam] = useState<SweepableParam>('scarcity');
    const [lastAction, setLastAction] = useState<ActionKey | null>(null);
    const [activeEdges, setActiveEdges] = useState<{ from: string; to: string }[]>([]);

    const tickRef = useRef(0);
    const activeEdgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const obstruction = useMemo(() => obstructionMatrix(metrics, params), [metrics, params]);
    const sensitivityBars = useMemo(() => computeSensitivity(params, metrics), [params, metrics]);
    const sweep = useMemo(() => computeSweep(params, metrics, sweepParam), [params, metrics, sweepParam]);
    const narrative = useMemo(() => computeNarrative(metrics, params, lastAction), [metrics, params, lastAction]);

    const forbiddenCells: ForbiddenCell[] = useMemo(() => {
        const baseline = computeViability(metrics);
        return ACTIONS.map((a) => {
            const next = applyAction(metrics, a.key, params);
            const v = computeViability(next);
            return {
                action: a.key,
                label: a.label,
                deltaViability: v - baseline,
            };
        });
    }, [metrics, params]);

    const calibrationResults = useMemo(() => {
        return calibrationCases.map((c) => ({
            name: c.name,
            description: c.description,
            predicted: computeViability(metrics),
            expected: c.expectedViability,
            source: c.source,
        }));
    }, [metrics]);

    const loadPreset = useCallback((key: PresetKey) => {
        const desc = PRESET_DESCRIPTIONS[key];
        const next = presetParams(key);
        setParams(next);
        let m = desc.initialMetrics;
        const points: TrajectoryPoint[] = [{
            ...m,
            tick: 0,
            viability: computeViability(m),
            action: null,
        }];
        for (let i = 0; i < desc.preplayed.length; i++) {
            m = applyAction(m, desc.preplayed[i], next);
            points.push({ ...m, tick: i + 1, viability: computeViability(m), action: desc.preplayed[i] });
        }
        setMetrics(m);
        setTrajectory(points);
        tickRef.current = points.length - 1;
        setLastAction(desc.preplayed[desc.preplayed.length - 1] ?? null);
        const lastA = desc.preplayed[desc.preplayed.length - 1];
        const lastEdges = lastA ? ACTIONS.find((a) => a.key === lastA)?.edges ?? [] : [];
        setActiveEdges(lastEdges);
    }, []);

    const onAction = useCallback((key: ActionKey) => {
        setMetrics((prev) => {
            const next = applyAction(prev, key, params);
            tickRef.current += 1;
            setTrajectory((traj) => {
                const point: TrajectoryPoint = {
                    ...next,
                    tick: tickRef.current,
                    viability: computeViability(next),
                    action: key,
                };
                return [...traj, point].slice(-TRAJECTORY_LIMIT);
            });
            return next;
        });
        setLastAction(key);
        const edges = ACTIONS.find((a) => a.key === key)?.edges ?? [];
        setActiveEdges(edges);
        if (activeEdgeTimer.current) clearTimeout(activeEdgeTimer.current);
        activeEdgeTimer.current = setTimeout(() => setActiveEdges([]), ACTIVE_EDGE_TICKS * 200);
    }, [params]);

    const onResetMetrics = useCallback(() => {
        const m = PRESET_DESCRIPTIONS[params.preset].initialMetrics;
        setMetrics(m);
        tickRef.current = 0;
        setTrajectory([{
            ...m,
            tick: 0,
            viability: computeViability(m),
            action: null,
        }]);
        setLastAction(null);
        setActiveEdges([]);
    }, [params.preset]);

    const saveSnapshot = useCallback(() => {
        setSnapshot({
            params,
            metrics,
            viability: computeViability(metrics),
            label: params.preset,
        });
    }, [params, metrics]);

    const clearSnapshot = useCallback(() => setSnapshot(null), []);

    useEffect(() => {
        return () => {
            if (activeEdgeTimer.current) clearTimeout(activeEdgeTimer.current);
        };
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
                        metrics={metrics}
                        trajectory={trajectory}
                        obstruction={obstruction}
                        forbiddenCells={forbiddenCells}
                        snapshot={snapshot}
                        sweepParam={sweepParam}
                        onSweepParamChange={setSweepParam}
                        sweep={sweep}
                        sensitivityBars={sensitivityBars}
                        calibration={calibrationResults}
                        assumptions={assumptions}
                        versions={versions}
                        lastAction={lastAction}
                        activeEdges={activeEdges}
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
                        <h3 className="text-lime-400 font-semibold mb-3">Morality is not a substance in the graph</h3>
                        <p className="leading-relaxed text-sm">
                            There is no special node where morality lives. There is no neuron
                            that fires only for the good. There is no chemical that detects
                            betrayal. What there is, instead, is a structure: agents, dependencies,
                            harms, repairs, institutions, commons, and memories, and a constraint
                            on which transitions through that structure preserve or destroy the
                            conditions for further agency, trust, and life.
                        </p>
                        <div className="border-l-2 border-lime-500/40 pl-4 mt-3">
                            <p className="text-lime-200/80 text-sm">
                                Morality is the topology of forbidden, allowed, repaired, and
                                irreversible transformations among beings who can be harmed.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Eight framings, one constraint</h3>
                        <p className="leading-relaxed text-sm">
                            The same constraint can be read from many graphs. Each framing
                            contributes a piece, none alone is sufficient.
                        </p>
                        <ul className="list-disc list-inside text-sm leading-relaxed text-lime-200/80 mt-2 space-y-1">
                            <li><span className="text-lime-400">state-transition</span>: forbidden edges that destroy nodes or coerce paths</li>
                            <li><span className="text-lime-400">dopamine valuation</span>: how reward prediction error gets entangled with others' pain</li>
                            <li><span className="text-lime-400">causal</span>: blame as path-control over consequences</li>
                            <li><span className="text-lime-400">social</span>: trust, kinship, debt as edges that institutions regulate</li>
                            <li><span className="text-lime-400">top-down</span>: macro labels (crime, debt, marriage) shaping micro behaviour</li>
                            <li><span className="text-lime-400">chemical reaction</span>: catalysts (ritual), inhibitors (taboo), hysteresis (irreparable harms)</li>
                            <li><span className="text-lime-400">hypergraph</span>: actions that bind ≥3 nodes simultaneously (bribe, climate damage, truth-telling)</li>
                            <li><span className="text-lime-400">sheaf</span>: local moral patches that fail to glue into a global section</li>
                        </ul>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Forbidden, allowed, repaired, irreversible</h3>
                        <p className="leading-relaxed text-sm">
                            Each action carries a Δ-viability: the change in the weighted
                            aggregate
                        </p>
                        <Equation mode="block" math="V = 0.22\,T + 0.24\,A + 0.22\,(100-H) + 0.12\,R + 0.14\,(100-D) + 0.06\,E" />
                        <p className="leading-relaxed text-sm mt-2">
                            where T, A, H, R, D, E are trust, agency, harm, repair, domination,
                            and ecology. Some edges (betrayal, coercion under empathy, exploit
                            under scarcity) are <em>forbidden</em> in the sense that traversing
                            them sharply decreases V. The forbidden set <em>shifts with context</em>:
                            empathy makes some predatory actions costlier; scarcity makes some
                            ecological actions unaffordable. Forbidden is not a property of an
                            edge alone, it is a property of an edge in a state under a pressure.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Sheaf obstruction: when local frames disagree</h3>
                        <p className="leading-relaxed text-sm">
                            For a cellular sheaf F over a moral graph,
                        </p>
                        <Equation mode="block" math="\ker L_{\mathcal F} \cong H^0(X;\mathcal F)" />
                        <p className="leading-relaxed text-sm mt-2">
                            and the obstruction to a global moral assignment is measured by
                            Robinson&rsquo;s consistency radius: the standard deviation of local
                            ratings on overlaps. The sheaf tab measures this directly: each
                            action gets a rating from each of five frames (medical, military,
                            kin, legal, market). When the consistency radius is large, no single
                            frame can speak for the whole, that is what we call moral
                            disagreement, and it is structural rather than just rhetorical.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Why dopamine is not morality</h3>
                        <p className="leading-relaxed text-sm">
                            Schultz&rsquo;s reward-prediction-error account (1997) showed dopamine
                            tracks the difference between expected and actual outcomes, not
                            valence, not goodness. Morality enters when the prediction graph
                            includes others&rsquo; pain, reputation, identity, sacred values.
                            Crockett et al. (2014) found people require more compensation to
                            inflict harm on a stranger than on themselves; pharmacological work
                            (2015) showed citalopram increases harm aversion while levodopa
                            reduces it. These results <em>locate</em> morality not in dopamine
                            but in the way valuation graphs are structured to include suffering
                            beyond the self.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">What is solid, what is speculative</h3>
                        <p className="leading-relaxed text-sm">
                            The reward-prediction-error account, the harm-aversion experiments,
                            and the basic graph-theoretic vocabulary are well-established. The
                            sheaf-cohomology framing of moral disagreement (after Robinson and
                            Hansen-Ghrist) is structurally clean but empirically untested as
                            applied here. The five frames, six metrics, and viability weights
                            are stipulated, they encode an interpretive choice, not a measured
                            ground truth. The substantive claim is that morality has the
                            <em> shape</em> of a constraint over a multi-scale graph; the specific
                            numbers are scaffolding to make that shape visible.
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
            title="forbidden edges"
            subtitle="morality as constraint geometry over a multi-scale graph of agency, harm, and obstruction"
            description={
                <>
                    based on{' '}
                    <a
                        href="https://www.pnas.org/doi/10.1073/pnas.1408988111"
                        className="underline"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        2014, Crockett et al., Harm to others outweighs harm to self
                    </a>
                </>
            }
            sections={sections}
            researchUrl="/playgrounds/forbidden-edges/research"
            settings={
                <Settings
                    params={params}
                    onParamsChange={setParams}
                    metrics={metrics}
                    narrative={narrative}
                    snapshot={snapshot}
                    onSaveSnapshot={saveSnapshot}
                    onClearSnapshot={clearSnapshot}
                    onAction={onAction}
                    onLoadPreset={loadPreset}
                    onResetMetrics={onResetMetrics}
                />
            }
        />
    );
}
