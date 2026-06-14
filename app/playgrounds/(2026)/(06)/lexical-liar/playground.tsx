'use client';

import React, { useCallback, useMemo, useState } from 'react';

import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import ModelChangelog from '@/components/ModelChangelog';
import ResearchPromptButton from '@/components/ResearchPromptButton';
import Equation from '@/components/Equation';
import { PlaygroundSourceContext } from '@/lib/readPlaygroundSource';

import Settings from './components/Settings';
import Viewer from './components/Viewer';
import {
    CONTRONYMS,
    CONTRONYM_KEYS,
    DEFAULT_PARAMS,
    Params,
    Snapshot,
    computeMetrics,
    computeNarrative,
    computeSweep,
} from './logic';
import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';


interface Props {
    sourceContext?: PlaygroundSourceContext;
}


export default function LexicalLiarPlayground({ sourceContext }: Props) {
    const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

    const metrics = useMemo(() => computeMetrics(params), [params]);
    const narrative = useMemo(() => computeNarrative(params, metrics), [params, metrics]);
    const sweep = useMemo(() => computeSweep(params), [params]);
    const calibration = useMemo(() => buildCalibration(), []);

    const saveSnapshot = useCallback(() => {
        setSnapshot({ params, metrics, label: CONTRONYMS[params.word].label });
    }, [params, metrics]);

    const clearSnapshot = useCallback(() => setSnapshot(null), []);

    const randomExample = useCallback(() => {
        const key = CONTRONYM_KEYS[Math.floor(Math.random() * CONTRONYM_KEYS.length)];
        const word = CONTRONYMS[key];
        const ex = word.examples[Math.floor(Math.random() * word.examples.length)];
        const ctxIndex = Math.floor(Math.random() * word.contexts.length);
        setParams((p) => ({
            ...p,
            word: key,
            contextIndex: ctxIndex,
            manualPull: ex.score,
            customText: ex.text,
            collapse: Math.random() > 0.78,
        }));
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
                        sweep={sweep}
                        calibration={calibration}
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
                        <h3 className="text-lime-400 font-semibold mb-3">Words against themselves</h3>
                        <p className="leading-relaxed text-sm">
                            A contronym is a word that seems to mean its own opposite. Sanction
                            permits and punishes. Cleave splits and clings. Screen shows and hides.
                            The naive move is to write{' '}
                            <span className="font-mono text-lime-300">sanction = permit and punish</span>{' '}
                            and call the word a contradiction. But that flattens a context-indexed
                            rule into a single dictionary slot. Restore the index and the trouble
                            disappears.
                        </p>
                        <div className="border-l-2 border-lime-500/40 pl-4 mt-3">
                            <p className="text-lime-200/80 text-sm">
                                A contronym is not a lexical contradiction. It is a context-sensitive
                                semantic operator whose polarity context fixes.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The formal shape</h3>
                        <p className="leading-relaxed text-sm">
                            Treat each word token as a function from context to polarity. There exist
                            contexts that send it to P and contexts that send it to not-P, but there
                            is no single context that sends it to both at once.
                        </p>
                        <div className="my-3">
                            <Equation mode="block" math="M(w, c) = f_w(c), \quad \mathrm{Range}(f_w) \supseteq \{P, \lnot P\}" />
                        </div>
                        <p className="leading-relaxed text-sm">
                            Many contronyms are not arbitrary opposites either. They are two
                            directions of one reversible operation. Dust is{' '}
                            <span className="italic">change the dust-relation</span>; context decides
                            whether you add it to a cake or remove it from a shelf.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">The Grim move</h3>
                        <p className="leading-relaxed text-sm">
                            In Patrick Grim&apos;s work, totalized systems of truth or knowledge
                            generate paradox: the Liar, the Knower, Gödel-style incompleteness all
                            appear when you try to complete a self-referential whole. Contronyms are
                            a small linguistic cousin. The paradox is manufactured by the demand for
                            a total, context-free dictionary entry. Indexed meaning stays coherent;
                            only the collapsed representation breaks. Collapse mode in this playground
                            performs the erasure on purpose so you can watch the contradiction switch
                            on.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">What this playground is and is not</h3>
                        <p className="leading-relaxed text-sm">
                            The sentence analyzer is a bag-of-cues keyword scorer with no syntax and
                            no world model, and the polarity numbers are hand-assigned, not measured
                            from a corpus. It is a transparent toy meant to make one claim legible:
                            that lexical meaning is often an operator over context rather than a fixed
                            object, and that the apparent self-contradiction of a contronym is an
                            artifact of flattening that operator. The calibration table shows exactly
                            where the toy scorer already disagrees with the hand labels.
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
            title="the lexical liar"
            subtitle="contronyms as context-sensitive operators"
            description={
                <a
                    href="https://mitpress.mit.edu/9780262071345/the-incomplete-universe/"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Patrick Grim, The Incomplete Universe (1991)
                </a>
            }
            sections={sections}
            settings={
                <Settings
                    params={params}
                    onParamsChange={setParams}
                    metrics={metrics}
                    narrative={narrative}
                    snapshot={snapshot}
                    onSaveSnapshot={saveSnapshot}
                    onClearSnapshot={clearSnapshot}
                    onRandomExample={randomExample}
                />
            }
            researchUrl="/playgrounds/lexical-liar/research"
        />
    );
}
