'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';

import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import Equation from '@/components/Equation';

import Settings, { PresetKey } from './components/Settings';
import Viewer, { PlaybackState } from './components/Viewer';
import { runSimulation, DEFAULT_PARAMS, SimulationParams } from './logic';

export default function Playground() {
    const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [playback, setPlayback] = useState<PlaybackState>({
        isPlaying: false,
        currentTime: DEFAULT_PARAMS.T,
        speed: 1,
    });
    const [selectedSection, setSelectedSection] = useState(0);
    const [activePreset, setActivePreset] = useState<PresetKey>(null);

    const simulation = useMemo(() => runSimulation(params), [params]);

    // Reset playback when T changes
    useEffect(() => {
        setPlayback(prev => ({
            ...prev,
            currentTime: params.T,
            isPlaying: false,
        }));
    }, [params.T]);

    // Reset section if it's out of bounds
    useEffect(() => {
        if (selectedSection >= simulation.sections.length) {
            setSelectedSection(0);
        }
    }, [simulation.sections.length, selectedSection]);

    // Animation loop
    useEffect(() => {
        if (!playback.isPlaying) return;

        const interval = setInterval(() => {
            setPlayback(prev => {
                const dt = params.dt * prev.speed * 3; // Speed multiplier
                const newTime = prev.currentTime + dt;
                if (newTime >= params.T) {
                    return { ...prev, currentTime: params.T, isPlaying: false };
                }
                return { ...prev, currentTime: newTime };
            });
        }, 33); // ~30fps

        return () => clearInterval(interval);
    }, [playback.isPlaying, params.dt, params.T]);

    const handleParamsChange = useCallback((newParams: SimulationParams) => {
        setParams(newParams);
    }, []);

    const handlePlaybackChange = useCallback((newPlayback: PlaybackState) => {
        setPlayback(newPlayback);
    }, []);

    const handleSectionChange = useCallback((index: number) => {
        setSelectedSection(index);
    }, []);

    const handlePresetChange = useCallback((preset: PresetKey) => {
        setActivePreset(preset);
    }, []);

    const sections: PlaygroundSection[] = [
        { id: 'intro', type: 'intro' },
        {
            id: 'canvas',
            type: 'canvas',
            content: (
                <div className="absolute inset-0 flex flex-col">
                    {settingsOpen && (
                        <div className="absolute inset-0 bg-black/70 z-10 pointer-events-none" />
                    )}
                    <Viewer
                        micro={simulation.micro}
                        sections={simulation.sections}
                        cover={simulation.cover}
                        glueResult={simulation.glueResult}
                        macro={simulation.macro}
                        reduced={simulation.reduced}
                        overlapStats={simulation.overlapStats}
                        playback={playback}
                        onPlaybackChange={handlePlaybackChange}
                        selectedSection={selectedSection}
                        maxTime={params.T}
                    />
                </div>
            ),
        },
        {
            id: 'outro',
            type: 'outro',
            content: (
                <div className="space-y-8">
                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">The event → process boundary</h4>
                        <p className="text-gray-300 mb-4">
                            When does a collection of local micro-events become a coherent process?
                            This playground instantiates a sheaf-theoretic answer: a <em>process</em> is
                            a sheaf of trajectories over a site of time-intervals, where local sections
                            glue consistently into global behavior.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Site and presheaf of micro-trajectories</h4>
                        <p className="text-gray-300 mb-3">
                            The <strong>site</strong> is the poset category <Equation math="\mathbf{Int}" /> of
                            time-intervals <Equation math="I \subseteq [0,T]" /> with inclusions as morphisms.
                        </p>
                        <p className="text-gray-300 mb-3">
                            A <strong>presheaf</strong> <Equation math="\mathcal{X}: \mathbf{Int}^{op} \to \mathbf{Set}" /> assigns
                            to each interval the set of admissible micro-histories on that interval.
                            Restriction maps <Equation math="\rho_{IJ}: \mathcal{X}(I) \to \mathcal{X}(J)" /> truncate
                            histories to sub-intervals.
                        </p>
                        <p className="text-gray-300">
                            The <strong>sheaf condition</strong> states: if local sections{' '}
                            <Equation math="x_i \in \mathcal{X}(I_i)" /> agree on overlaps, they glue to a unique
                            global section <Equation math="x \in \mathcal{X}(\bigcup I_i)" />.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Coarse-graining as a natural transformation</h4>
                        <p className="text-gray-300 mb-3">
                            The macro presheaf <Equation math="\mathcal{M}" /> assigns coarse-grained observables
                            (here: moving averages) to each interval. Coarse-graining is a natural transformation:
                        </p>
                        <Equation mode="block" math="q: \mathcal{X} \Rightarrow \mathcal{M}" />
                        <p className="text-gray-300 mt-3">
                            Naturality ensures <Equation math="q_J \circ \rho^{\mathcal{X}}_{IJ} = \rho^{\mathcal{M}}_{IJ} \circ q_I" />:
                            the macro of a restriction equals the restriction of the macro.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Closure and the Markov limit</h4>
                        <p className="text-gray-300 mb-3">
                            A macro description becomes a true <em>process</em> when its dynamics are <strong>closed</strong>:
                            future evolution depends only on the current macro-state, not the micro-history.
                        </p>
                        <p className="text-gray-300 mb-3">
                            The Mori–Zwanzig formalism makes this precise. Coarse-graining produces an exact equation:
                        </p>
                        <Equation mode="block" math="\frac{dm}{dt} = R(m) + \int_0^t K(t-s) m(s) \, ds + \eta(t)" />
                        <p className="text-gray-300 mt-3">
                            with drift <Equation math="R" />, memory kernel <Equation math="K" />, and noise <Equation math="\eta" />.
                            When the kernel decays rapidly (timescale separation), the memory term vanishes and you get
                            <strong> Markovian closure</strong>: the macro is a self-contained dynamical system.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">How to explore</h4>
                        <ol className="text-gray-300 list-decimal list-inside space-y-2">
                            <li>
                                Turn <span className="text-lime-400">Consistent restrictions</span> off: local sections
                                become independent, and strict sheaf gluing fails.
                            </li>
                            <li>
                                Add <span className="text-lime-400">measurement noise</span>: gluing fails unless
                                tolerance ε is large enough.
                            </li>
                            <li>
                                Toggle <span className="text-lime-400">Strict sheaf gluing</span> off to see
                                sheafification (best-fit descent repair).
                            </li>
                            <li>
                                Compare Markov vs memory models. Vary τ and watch the closure RMSE change.
                            </li>
                        </ol>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="descent & closure"
            subtitle="from local micro-events to autonomous macro-processes"
            sections={sections}
            settings={
                <Settings
                    params={params}
                    onParamsChange={handleParamsChange}
                    selectedSection={selectedSection}
                    onSelectedSectionChange={handleSectionChange}
                    sectionCount={simulation.sections.length}
                    activePreset={activePreset}
                    onPresetChange={handlePresetChange}
                />
            }
            onSettingsToggle={setSettingsOpen}
        />
    );
}
