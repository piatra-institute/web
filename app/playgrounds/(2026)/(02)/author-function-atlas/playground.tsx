'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Equation from '@/components/Equation';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import {
    Variant,
    DerivedVariant,
    Params,
    AuthorName,
    DEFAULT_PARAMS,
    clamp,
    computeClicheIndex,
    entanglementSurplus,
    colorBucket,
    initializePopulation,
    stepPopulation,
} from './logic';

export default function AuthorFunctionAtlasPlayground() {
    const [author, setAuthor] = useState<AuthorName>('Harari');
    const [seed, setSeed] = useState<number>(1337);
    const [params, setParams] = useState<Params>({ ...DEFAULT_PARAMS });
    const [tick, setTick] = useState<number>(0);
    const [running, setRunning] = useState<boolean>(false);
    const [query, setQuery] = useState<string>('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const rngRef = useRef<() => number>(() => Math.random());
    const [population, setPopulation] = useState<Variant[]>(() => {
        const init = initializePopulation(author, seed);
        rngRef.current = init.rand;
        return init.pop;
    });

    // Reset on author/seed change
    useEffect(() => {
        const init = initializePopulation(author, seed);
        rngRef.current = init.rand;
        setPopulation(init.pop);
        setTick(0);
        setSelectedId(null);
        setRunning(false);
    }, [author, seed]);

    // Auto-run
    useEffect(() => {
        if (!running) return;
        const id = window.setInterval(() => {
            setPopulation((prev) => {
                const copy = prev.map((v) => ({ ...v }));
                return stepPopulation(copy, params, rngRef.current, tick + 1);
            });
            setTick((t) => t + 1);
        }, 450);
        return () => window.clearInterval(id);
    }, [running, params, tick]);

    const handleStep = useCallback(() => {
        setPopulation((prev) => {
            const copy = prev.map((v) => ({ ...v }));
            return stepPopulation(copy, params, rngRef.current, tick + 1);
        });
        setTick((t) => t + 1);
    }, [params, tick]);

    const handleReset = useCallback(() => {
        const init = initializePopulation(author, seed);
        rngRef.current = init.rand;
        setPopulation(init.pop);
        setTick(0);
        setSelectedId(null);
        setRunning(false);
    }, [author, seed]);

    const derived = useMemo(() => {
        const rows: DerivedVariant[] = population.map((v) => {
            const c = computeClicheIndex(v);
            const e = entanglementSurplus(v);
            return {
                ...v,
                cliche: c,
                entanglement: e,
                x: v.specificity,
                y: Math.log(v.freq + 1),
                z: clamp(1 + 7 * (1 - v.retention), 1, 8),
                bucket: colorBucket(e),
            };
        });

        const filtered = query.trim()
            ? rows.filter((r) => r.text.toLowerCase().includes(query.trim().toLowerCase()))
            : rows;

        const topCliches = [...rows].sort((a, b) => b.cliche - a.cliche).slice(0, 10);

        const selected = selectedId ? rows.find((r) => r.id === selectedId) ?? null : null;

        const byId = new Map(rows.map((r) => [r.id, r]));
        const chain: DerivedVariant[] = [];
        let cur = selected;
        let guard = 0;
        while (cur && guard++ < 30) {
            chain.push(cur);
            if (!cur.parentId) break;
            cur = byId.get(cur.parentId) ?? null;
        }

        return { rows, filtered, topCliches, selected, chain };
    }, [population, query, selectedId]);

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
                        filtered={derived.filtered}
                        selected={derived.selected}
                        chain={derived.chain}
                        onSelectId={setSelectedId}
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
                        <h3 className="text-lime-400 font-semibold mb-3">The Author-Function</h3>
                        <p className="leading-relaxed text-sm">
                            Foucault argued that the author is not a person behind a text but a function of discourse: a classificatory device that groups texts, grants authority, and restricts interpretation. When we say &ldquo;Nietzsche said...&rdquo; we invoke a brand-name that does social work independent of verifiable sourcing. This playground makes that dynamic visible.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Cliché Index</h3>
                        <p className="leading-relaxed text-sm mb-3">
                            Each variant is scored by a composite cliché index:
                        </p>
                        <Equation
                            mode="block"
                            math="C = \sigma\!\bigl(\alpha \ln(f+1) + \beta \cdot \text{disp} - \gamma \cdot \text{surp} - \delta \cdot \text{ret} + \epsilon \cdot \text{mut}\bigr)"
                        />
                        <p className="leading-relaxed text-sm mt-3">
                            where <Equation math="f" /> is circulation frequency, <Equation math="\text{disp}" /> is channel dispersion, <Equation math="\text{surp}" /> is surprisal (low = predictable), <Equation math="\text{ret}" /> is context retention, and <Equation math="\text{mut}" /> is mutability. High-cliché variants are widely circulated, dispersed across channels, unsurprising, context-free, and highly mutable.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Entanglement Surplus</h3>
                        <p className="leading-relaxed text-sm mb-3">
                            The entanglement surplus measures the gap between name-brand attachment and source verifiability:
                        </p>
                        <Equation
                            mode="block"
                            math="E = A_{\text{name}} - A_{\text{src}}"
                        />
                        <p className="leading-relaxed text-sm mt-3">
                            Positive <Equation math="E" /> means the author&apos;s name is doing more legitimation work than the actual source context provides. This is the signature of discourse entanglement: the name circulates as a brand-token, increasingly detached from verifiable citation.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Replicator-Mutator Dynamics</h3>
                        <p className="leading-relaxed text-sm">
                            The population evolves through a replicator equation: variants with higher fitness (portable, general, brief, name-legitimized) grow in frequency while low-fitness variants decline. Mutations spawn paraphrase-variants that inherit perturbed traits. Over time, the population drifts toward cliché attractors in the lower-left of the specificity-circulation landscape: general, highly circulated, context-collapsed slogans carrying a prestigious name.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Notes</h3>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>This is a synthetic model. The population is seeded from canonical phrase fragments, not real quote corpora.</li>
                            <li>All parameter values are normalized to [0, 1]. Absolute values are arbitrary; relative dynamics matter.</li>
                            <li>The scatter size encodes excerpt/context-loss pressure (inversely related to retention).</li>
                            <li>The three entanglement buckets (Low, Mid, High) split variants by their name-minus-source surplus.</li>
                        </ul>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="author-function atlas"
            subtitle="how quotes become clichés through circulation, context collapse, and attribution drift"
            sections={sections}
            settings={
                <Settings
                    author={author}
                    onAuthorChange={setAuthor}
                    seed={seed}
                    onSeedChange={setSeed}
                    params={params}
                    onParamsChange={setParams}
                    query={query}
                    onQueryChange={setQuery}
                    tick={tick}
                    populationSize={population.length}
                    running={running}
                    onToggleRunning={() => setRunning((r) => !r)}
                    onStep={handleStep}
                    onReset={handleReset}
                    topCliches={derived.topCliches}
                    selectedId={selectedId}
                    onSelectId={setSelectedId}
                />
            }
        />
    );
}
