'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';

import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Button from '@/components/Button';
import Equation from '@/components/Equation';
import ModelChangelog from '@/components/ModelChangelog';
import ResearchPromptButton from '@/components/ResearchPromptButton';
import { PlaygroundSourceContext } from '@/lib/readPlaygroundSource';

import Settings from './components/Settings';
import Viewer from './components/Viewer';
import {
    Params, PresetKey, StepState,
    DEFAULT_PARAMS, presetParams, simulate,
    computeSensitivity, computeNarrative,
} from './logic';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';


interface Props {
    sourceContext?: PlaygroundSourceContext;
}

export default function CoordinationUnderComplementarityPlayground({ sourceContext }: Props) {
    const [params, setParams] = useState<Params>(DEFAULT_PARAMS);

    // Playhead
    const [playing, setPlaying] = useState(true);
    const [tick, setTick] = useState(0);

    const steps = useMemo(() => simulate(params), [params]);
    const currentStep = steps[Math.min(tick, Math.max(steps.length - 1, 0))];
    const sensitivityBars = useMemo(() => computeSensitivity(params), [params]);
    const narrative = useMemo(() => computeNarrative(currentStep, params), [currentStep, params]);

    // Auto-advance playhead
    useEffect(() => {
        if (!playing) return;
        const id = setInterval(() => {
            setTick(prev => (prev + 1) % Math.max(steps.length, 1));
        }, 500);
        return () => clearInterval(id);
    }, [playing, steps.length]);

    useEffect(() => {
        if (tick >= steps.length) setTick(Math.max(0, steps.length - 1));
    }, [tick, steps.length]);

    const handleParamsChange = useCallback((p: Params) => {
        setParams(p);
        setTick(0);
    }, []);

    const animControls = (
        <div className="flex items-center gap-4">
            <Button label={playing ? 'pause' : 'play'} onClick={() => setPlaying(p => !p)} size="xs" />
            <Button label="reset" onClick={() => setTick(0)} size="xs" />
            <input type="range" min={0} max={Math.max(0, steps.length - 1)} step={1} value={tick}
                onChange={e => { setPlaying(false); setTick(parseInt(e.target.value)); }}
                className="w-40 h-1 accent-lime-500 cursor-pointer" />
            <span className="text-xs font-mono text-lime-200/60">
                {currentStep.t + 1}/{steps.length}
            </span>
        </div>
    );

    const sections: PlaygroundSection[] = [
        { id: 'intro', type: 'intro' },
        {
            id: 'canvas',
            type: 'canvas',
            content: (
                <PlaygroundViewer controls={animControls}>
                    <Viewer
                        params={params}
                        steps={steps}
                        currentStep={currentStep}
                        tick={tick}
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
                        <h3 className="text-lime-400 font-semibold mb-3">Wrong scale of selection</h3>
                        <p className="leading-relaxed text-sm">
                            A housing system fails when the unit of function and the unit
                            of selection are different. The city-region must jointly
                            provide homes, infrastructure, mobility, and access to
                            productive locations. But local actors optimize home values,
                            tax bases, congestion, electoral pressure, or financing needs.
                            When these two levels diverge, demand shocks that should
                            produce more housing get converted instead into price
                            inflation, queues, exclusion, vacancy misallocation, or
                            informal settlement.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">The functional adaptation rate</h3>
                        <p className="leading-relaxed text-sm">
                            The FAR measures how much of a demand shock is absorbed by
                            useful coordinated capacity versus converted into pathological
                            outputs:
                        </p>
                        <Equation mode="block" math="\text{FAR} = \frac{\text{demand absorbed as completions + mobility + infrastructure}}{\text{total demand shock}}" />
                        <p className="leading-relaxed text-sm mt-2">
                            A high-FAR system produces homes and infrastructure. A
                            low-FAR system produces asset inflation, waiting lists,
                            overcrowding, and informality.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Sheaf-like gluing</h3>
                        <p className="leading-relaxed text-sm">
                            Each scale has a local section &mdash; its desired state and
                            perceived signal. The system is coherent only when adjacent
                            scales&apos; sections glue into a consistent global section.
                            Failure to glue produces a <em>cohomology defect</em>: a
                            formal measure of how badly local intentions fail to compose
                            into system-level coordination. This is analogous to how a
                            sheaf on a topological space has well-defined global sections
                            only when its restriction maps are compatible.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Morphogenetic hierarchy</h3>
                        <p className="leading-relaxed text-sm">
                            Inspired by Michael Levin&apos;s work on bioelectric
                            morphogenesis: lower-level cells can be recruited by
                            higher-level tissue patterns when repair and signaling remain
                            intact. In this simulator, the metro-scale goal pulls
                            lower scales toward coordinated behavior through a
                            morphogenetic term &mdash; but only when repair capacity and
                            gluing strength are sufficient. When these break down, lower
                            scales drift or lock in, producing the housing equivalents of
                            developmental malformation.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Regime classification</h3>
                        <p className="leading-relaxed text-sm">
                            The system can occupy four regimes.{' '}
                            <strong className="text-lime-200">Adaptive</strong>: scales
                            align, demand becomes capacity.{' '}
                            <strong className="text-lime-200">Rigid lock-in</strong>:
                            the system appears stable but vetoes prevent adaptation (NIMBY
                            equilibrium).{' '}
                            <strong className="text-lime-200">Chaotic drift</strong>:
                            scales act on contradictory signals, oscillating without
                            settling.{' '}
                            <strong className="text-lime-200">Collapse</strong>: gluing
                            breaks down entirely and the system cannot organize a
                            coherent response. Basin stability measures how much shock
                            the current regime can absorb before transitioning &mdash;
                            a rigidly locked system in a narrow basin is paradoxically
                            fragile.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Harm obstruction</h3>
                        <p className="leading-relaxed text-sm">
                            When scales fail to glue, unabsorbed demand converts into
                            specific harm dimensions: <em>agency</em> (loss of choice
                            and access), <em>material security</em> (price spikes and
                            rent burden), <em>systemic stability</em> (bubble fragility
                            and tail risk), and <em>mobility</em> (lock-in and inability
                            to relocate). Different coordination failures produce
                            different harm profiles: NIMBY lock-in primarily harms
                            agency and material security; finance misalignment primarily
                            harms stability.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Hysteresis</h3>
                        <p className="leading-relaxed text-sm">
                            The system exhibits path dependence: accumulated
                            misallocation retroactively degrades signal fidelity.
                            Developers misread distorted signals, municipalities
                            misinterpret corrupted demand data, speculators amplify
                            noise. The system&apos;s own failures distort future
                            perception, creating a feedback loop where coordination
                            failure breeds further coordination failure.
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
            title="Coordination under complementarity"
            subtitle="multilevel coordination failure in housing, infrastructure, and spatially fixed systems"
            description={
                <>
                    <a href="https://www.nber.org/papers/w21154" className="underline" target="_blank" rel="noopener noreferrer">
                        2019, Hsieh &amp; Moretti, Housing Constraints and Spatial Misallocation
                    </a>
                    {' \u00B7 '}
                    <a href="https://pubmed.ncbi.nlm.nih.gov/31920779/" className="underline" target="_blank" rel="noopener noreferrer">
                        2019, Levin, The computational boundary of a &ldquo;self&rdquo;
                    </a>
                </>
            }
            sections={sections}
            settings={
                <Settings
                    params={params}
                    onParamsChange={handleParamsChange}
                    currentStep={currentStep}
                    narrative={narrative}
                />
            }
        />
    );
}
