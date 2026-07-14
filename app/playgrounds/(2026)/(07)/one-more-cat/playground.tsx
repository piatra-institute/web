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
    DEFAULT_PARAMS,
    computeNarrative,
    computeSensitivity,
    makeSnapshot,
    presetParams,
    simulate,
    simulateEnsemble,
    type Params,
    type PresetKey,
    type SimMode,
    type Snapshot,
} from './logic';
import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';


interface Props {
    sourceContext?: PlaygroundSourceContext;
}


export default function OneMoreCatPlayground({ sourceContext }: Props) {
    const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
    const [preset, setPreset] = useState<PresetKey | null>(null);
    const [mode, setMode] = useState<SimMode>('expected');
    const [seed, setSeed] = useState(42);
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

    const handleParamsChange = useCallback((p: Params) => {
        setParams(p);
        setPreset(null);
    }, []);

    const onPreset = useCallback((key: PresetKey) => {
        setPreset(key);
        setParams(presetParams(key));
    }, []);

    const onModeChange = useCallback((m: SimMode) => setMode(m), []);
    const onReseed = useCallback(() => setSeed((s) => s + 1), []);

    const sim = useMemo(
        () => simulate(params, seed, mode === 'stochastic', false),
        [params, seed, mode],
    );

    const simNoIntervention = useMemo(
        () => (params.interventionMonth > 0 ? simulate(params, seed, mode === 'stochastic', true) : null),
        [params, seed, mode],
    );

    const ensemble = useMemo(
        () => (mode === 'ensemble' ? simulateEnsemble(params, 200, seed) : null),
        [params, seed, mode],
    );

    const sensitivity = useMemo(() => computeSensitivity(params), [params]);
    const narrative = useMemo(() => computeNarrative(sim, params, simNoIntervention), [sim, params, simNoIntervention]);
    const calibration = useMemo(() => buildCalibration(), []);

    const onSaveSnapshot = useCallback(() => {
        setSnapshot(makeSnapshot(sim, preset ?? 'custom'));
    }, [sim, preset]);
    const onClearSnapshot = useCallback(() => setSnapshot(null), []);

    const sections: PlaygroundSection[] = [
        { id: 'intro', type: 'intro' },
        {
            id: 'canvas',
            type: 'canvas',
            content: (
                <PlaygroundViewer>
                    <Viewer
                        params={params}
                        mode={mode}
                        sim={sim}
                        simNoIntervention={simNoIntervention}
                        ensemble={ensemble}
                        snapshot={snapshot}
                        calibration={calibration}
                        assumptions={assumptions}
                        versions={versions}
                        sensitivity={sensitivity}
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
                        <h3 className="text-lime-400 font-semibold mb-3">The question, made mechanical</h3>
                        <p className="leading-relaxed text-sm">
                            &ldquo;How does someone end up with a hundred cats?&rdquo; is usually asked as a question about a
                            person. This playground asks it as a question about a system. A household is a small population with
                            inflows (unsolicited arrivals the caregiver accepts, and births) and outflows (rehoming and permanent
                            exits). Each month the caregiver faces one more accept-or-refuse decision, and the balance of those
                            decisions, not any single choice, decides whether the count stays at one, settles at a pair, or drifts
                            upward for years.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Why capacity, not count</h3>
                        <p className="leading-relaxed text-sm">
                            The variable that governs welfare here is not the number of cats but the care-load ratio, the required
                            care divided by the effective capacity to provide it.
                        </p>
                        <div className="my-3">
                            <Equation mode="block" math="\rho = \frac{\text{required care load}}{\text{effective capacity}}" />
                        </div>
                        <p className="leading-relaxed text-sm">
                            Below one, there is slack. Above one, monitoring lapses, illness is caught late, and the extra work
                            feeds back as still more load. This is why an organized sanctuary of eighty cats can sit in a stable
                            regime while an overwhelmed home of fifteen is already in crisis. The number on its own tells you very
                            little.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Three feedbacks that resist reversal</h3>
                        <p className="leading-relaxed text-sm">
                            Growth is driven by loops, not by a bad decision. Cat solicitation raises the probability of accepting
                            the next arrival. Unsterilized cats reproduce, and the model anchors that to a measured rate of roughly
                            1.4 litters a year with about three kittens each. A caregiver known to take cats in attracts more
                            offers, so opportunities scale with the current population.
                        </p>
                        <div className="border-l-2 border-lime-500/40 pl-4 mt-3">
                            <p className="text-lime-200/80 text-sm">
                                Reversal is harder than accumulation. Refusing an unknown cat is easy; surrendering a named,
                                attached cat is not. That asymmetry is hysteresis: the population resists falling even once the
                                caregiver wants it to, which is why late interventions in the intervention lab buy so much less
                                than early ones.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">What it is not</h3>
                        <p className="leading-relaxed text-sm">
                            This is a transparent hypothesis generator, not a fitted predictor and not a diagnosis. A high cat
                            count does not by itself indicate hoarding, and nothing here pathologizes multi-cat owners; the model
                            deliberately routes organized high-count runs to a sanctuary regime rather than a crisis. The welfare
                            and strain indices are visible proxies, not validated instruments. The calibration panel checks only
                            that the engine reproduces the identities and the one literature rate it claims to encode, which is the
                            honest limit of what a model like this can verify about itself.
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
            title="one more cat"
            subtitle="a threshold model of household cat accumulation, in which care capacity, not count, governs welfare"
            description={
                <a
                    href="https://pmc.ncbi.nlm.nih.gov/articles/PMC1308348/"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    1999, Patronek, Hoarding of Animals
                </a>
            }
            sections={sections}
            settings={
                <Settings
                    params={params}
                    onParamsChange={handleParamsChange}
                    preset={preset}
                    onPreset={onPreset}
                    mode={mode}
                    onModeChange={onModeChange}
                    seed={seed}
                    onReseed={onReseed}
                    snapshot={snapshot}
                    onSaveSnapshot={onSaveSnapshot}
                    onClearSnapshot={onClearSnapshot}
                    sim={sim}
                    narrative={narrative}
                />
            }
            researchUrl="/playgrounds/one-more-cat/research"
        />
    );
}
