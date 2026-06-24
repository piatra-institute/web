'use client';

import { useState, useRef, useCallback } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import VersionSelector from '@/components/VersionSelector';
import CalibrationPanel from '@/components/CalibrationPanel';
import AssumptionPanel from '@/components/AssumptionPanel';
import ModelChangelog from '@/components/ModelChangelog';
import Viewer from './components/Viewer';
import Settings from './components/Settings';
import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';



export default function Playground() {
    const [sigma, setSigma] = useState(0.63);
    const [refreshKey, setRefreshKey] = useState(0);

    const viewerRef = useRef<{ exportCanvas: () => void }>(null);

    const calibration = buildCalibration();

    const handleReset = useCallback(() => {
        setSigma(1.0);
        setRefreshKey(prev => prev + 1);
    }, []);

    const handleExport = useCallback(() => {
        viewerRef.current?.exportCanvas();
    }, []);

    const handleRefresh = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
            content: (
                <div className="mt-12">
                    <p className="text-xl text-gray-300 mb-4">
                        Exploring Branching Criticality
                    </p>
                    <p className="text-gray-400">
                        Visualize avalanche dynamics and power-law distributions at the edge of criticality.
                        Discover how the d² metric quantifies distance from the critical regime.
                    </p>
                </div>
            ),
        },
        {
            id: 'canvas',
            type: 'canvas' as const,
            content: (
                <PlaygroundViewer>
                    <Viewer
                        ref={viewerRef}
                        sigma={sigma}
                        refreshKey={refreshKey}
                    />
                </PlaygroundViewer>
            ),
        },
        {
            id: 'about',
            type: 'outro' as const,
            content: (
                <div className="space-y-8 text-gray-300">
                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">One parameter, three regimes</h3>
                        <p className="leading-relaxed text-sm">
                            This playground simulates a branching process: each active site activates a successor with
                            probability sigma, so the branching ratio (mean growth of activity per step) is exactly sigma.
                            Below 1 activity fades, above 1 it runs away, and at exactly 1 the system is critical and
                            avalanche sizes follow a power law with no characteristic scale. The slider moves the system
                            across that boundary so you can see the regimes on either side.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">What is exact</h3>
                        <p className="leading-relaxed text-sm">
                            Two closed-form facts anchor the model. For a subcritical run the expected total avalanche size
                            is 1/(1 - sigma), diverging as sigma approaches 1; at sigma = 0.8 it is 5, at sigma = 0.5 it is
                            2. At criticality the avalanche-size distribution is a power law P(s) ~ s^(-3/2), the mean-field
                            branching exponent. The calibration panel verifies both from the shipped logic.
                        </p>
                        <div className="border-l-2 border-lime-500/40 pl-4 mt-3">
                            <p className="text-lime-200/80 text-sm">
                                The strong, defensible claims are the branching-process mathematics. The proposal that the
                                cortex tunes itself to sigma = 1, and the distance-to-criticality metric that summarises how
                                far a recording sits from that point, are separate interpretations kept apart here.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The distance-to-criticality metric</h3>
                        <p className="leading-relaxed text-sm">
                            The d-squared metric is a proposed scalar distance to criticality, accumulated across timescale
                            shells via a temporal renormalization-group analysis, with d-squared = 0 at perfect criticality.
                            It is presented as context: the live simulation does not compute it, it only sets sigma directly.
                            Reported practical values place awake quiet cortex near-critical and anesthesia or seizures far
                            from critical, but that pipeline is still being validated.
                        </p>
                    </div>

                    <div className="space-y-8">
                        <VersionSelector versions={versions} active="claude-v1" />
                        <CalibrationPanel results={calibration} outputLabel="branching-process quantity" />
                        <AssumptionPanel assumptions={assumptions} />
                        <div>
                            <h3 className="text-lime-400 font-semibold mb-3">Model changelog</h3>
                            <ModelChangelog entries={changelog} />
                        </div>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="Criticality"
            subtitle="branching processes and distance-to-criticality metrics"
            description={
                <a
                    href="https://doi.org/10.1016/j.neuron.2025.05.020"
                    target="_blank"
                    className="underline"
                >
                    2025, Keith B. Hengen, Woodrow L. Shew, Is criticality a unified setpoint of brain function
                </a>
            }
            sections={sections}
            settings={
                <Settings
                    sigma={sigma}
                    onSigmaChange={setSigma}
                    onReset={handleReset}
                    onExport={handleExport}
                    onRefresh={handleRefresh}
                />
            }
            researchUrl="/playgrounds/criticality/research"
        />
    );
}
