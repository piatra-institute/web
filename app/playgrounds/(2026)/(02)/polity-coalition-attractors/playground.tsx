'use client';

import React, { useState, useCallback, useMemo } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import Equation from '@/components/Equation';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import {
    ModelParams,
    SimSettings,
    InitialConditions,
    BasinSettings,
    DEFAULT_PARAMS,
    DEFAULT_SIM,
    DEFAULT_INIT,
    DEFAULT_BASIN,
    PRESETS,
} from './logic';

export default function PolityCoalitionAttractorsPlayground() {
    const [params, setParams] = useState<ModelParams>({ ...DEFAULT_PARAMS });
    const [sim, setSim] = useState<SimSettings>({ ...DEFAULT_SIM });
    const [init, setInit] = useState<InitialConditions>({ ...DEFAULT_INIT });
    const [basin, setBasin] = useState<BasinSettings>({ ...DEFAULT_BASIN });
    const [presetId, setPresetId] = useState('baseline');

    const handlePresetChange = useCallback((id: string) => {
        const preset = PRESETS.find((p) => p.id === id) ?? PRESETS[0];
        setPresetId(id);
        setParams({ ...preset.params });
        setInit({ ...preset.init });
        if (preset.sim) {
            setSim((prev) => ({ ...prev, ...preset.sim }));
        }
    }, []);

    const handleRandomStart = useCallback(() => {
        setInit({ x0: Math.random(), t0: Math.random() });
    }, []);

    const handleReset = useCallback(() => {
        setParams({ ...DEFAULT_PARAMS });
        setSim({ ...DEFAULT_SIM });
        setInit({ ...DEFAULT_INIT });
        setBasin({ ...DEFAULT_BASIN });
        setPresetId('baseline');
    }, []);

    const sections = useMemo(() => [
        {
            id: 'intro',
            type: 'intro' as const,
        },
        {
            id: 'canvas',
            type: 'canvas' as const,
            content: (
                <Viewer
                    params={params}
                    sim={sim}
                    init={init}
                    basin={basin}
                    onInitChange={setInit}
                />
            ),
        },
        {
            id: 'outro',
            type: 'outro' as const,
            content: (
                <div className="space-y-8 text-gray-300">
                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Coalition Dynamics Model</h3>
                        <p className="leading-relaxed text-sm mb-3">
                            Two state variables evolve over time: <Equation math="x" /> (the share of the population
                            supporting an exclusionary coalition) and <Equation math="t" /> (institutional trust / civic
                            confidence). Both are bounded to [0, 1].
                        </p>
                        <Equation
                            mode="block"
                            math="\frac{dx}{dt} = \Delta t \cdot x(1-x)(\pi_E - \pi_I) + \Delta t \cdot \text{noise}"
                        />
                        <Equation
                            mode="block"
                            math="\frac{dt}{dt} = \Delta t \cdot (0.55R + 0.45C + 0.25N - 0.55P - 0.65x - 0.45S - 0.2\theta)"
                        />
                        <p className="leading-relaxed text-sm mt-3">
                            The <Equation math="x(1-x)" /> factor ensures replicator dynamics: change is fastest at intermediate
                            shares and stalls near the boundaries. The payoff
                            differential <Equation math="\pi_E - \pi_I" /> determines whether exclusionary or inclusive
                            support grows.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Attractor Classes</h3>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>
                                <span className="text-green-400 font-semibold">Inclusive</span> (<Equation math="x < 0.2" />) — exclusionary
                                support is marginal; trust-building feedbacks dominate.
                            </li>
                            <li>
                                <span className="text-yellow-400 font-semibold">Mixed</span> (<Equation math="0.2 \leq x \leq 0.8" />) — neither
                                coalition dominates; system is in a contested or transitional zone.
                            </li>
                            <li>
                                <span className="text-red-400 font-semibold">Exclusionary</span> (<Equation math="x > 0.8" />) — exclusionary
                                politics dominate; trust erodes in a self-reinforcing cycle.
                            </li>
                        </ul>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Parameters</h3>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li><span className="text-lime-100 font-semibold">S</span> (Stress) — economic/security shocks that raise threat salience.</li>
                            <li><span className="text-lime-100 font-semibold">D</span> (Diversity) — salience of group boundaries in this toy model.</li>
                            <li><span className="text-lime-100 font-semibold">P</span> (Polarization) — fragmented information space; amplifies perceived threat.</li>
                            <li><span className="text-lime-100 font-semibold">N</span> (Norms) — rule-of-law / rights constraints that raise the cost of exclusion.</li>
                            <li><span className="text-lime-100 font-semibold">C</span> (Contact) — bridging social capital; reduces perceived threat.</li>
                            <li><span className="text-lime-100 font-semibold">R</span> (Redistribution) — material inclusion; increases trust and inclusive payoff.</li>
                            <li><span className="text-lime-100 font-semibold">O</span> (Opportunism) — elite identity entrepreneurship; strengthens exclusionary narrative feedback.</li>
                        </ul>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Notes</h3>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>This is a toy model. Use it to reason about feedback loops and basins, not to estimate real-world quantities.</li>
                            <li>Presets are illustrative, not empirically calibrated. For data-grounded presets, map real indicators into S/D/P/N/C/R/O.</li>
                            <li>The basin map can be computationally expensive at high grid resolutions. Lower the grid setting if interaction feels slow.</li>
                        </ul>
                    </div>
                </div>
            ),
        },
    ], [params, sim, init, basin]);

    return (
        <PlaygroundLayout
            title="polity coalition attractors"
            subtitle="basins of inclusion versus exclusion under stress, norms, and contact"
            sections={sections}
            settings={
                <Settings
                    params={params}
                    onParamsChange={setParams}
                    sim={sim}
                    onSimChange={setSim}
                    init={init}
                    onInitChange={setInit}
                    basin={basin}
                    onBasinChange={setBasin}
                    presetId={presetId}
                    onPresetChange={handlePresetChange}
                    onRandomStart={handleRandomStart}
                    onReset={handleReset}
                />
            }
        />
    );
}
