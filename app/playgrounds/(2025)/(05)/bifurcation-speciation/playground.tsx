'use client';

import React, { useRef, useState } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Button from '@/components/Button';
import AssumptionPanel from '@/components/AssumptionPanel';
import CalibrationPanel from '@/components/CalibrationPanel';
import VersionSelector from '@/components/VersionSelector';
import ModelChangelog from '@/components/ModelChangelog';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import CaptureHelper, { CaptureHandle } from './components/CaptureHelper';

import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';

// Default parameter values for the simulation
const defaults = {
    birdCount: 30,
    resourceMean: 0.5,
    resourceVariance: 0.02,
    adaptationRate: 1.5,
    bifurcationParameter: 3.5,
    bifurcationStart: 0.5,
    bifurcationEnd: 8.0,
    bifurcationSteps: 80,
    iterations: 1000,
    visualizationMode: 'bifurcation' as 'bifurcation' | 'timeseries',
};

export default function BifurcationSpeciationPlayground() {
    const viewerRef = useRef<CaptureHandle>(null);
    const calibration = buildCalibration();

    // BirdSym model parameters
    const [birdCount, setBirdCount] = useState(defaults.birdCount);
    const [resourceMean, setResourceMean] = useState(defaults.resourceMean);
    const [resourceVariance, setResourceVariance] = useState(defaults.resourceVariance);
    const [adaptationRate, setAdaptationRate] = useState(defaults.adaptationRate);
    const [bifurcationParameter, setBifurcationParameter] = useState(defaults.bifurcationParameter);

    // Bifurcation diagram parameters
    const [bifurcationStart, setBifurcationStart] = useState(defaults.bifurcationStart);
    const [bifurcationEnd, setBifurcationEnd] = useState(defaults.bifurcationEnd);
    const [bifurcationSteps, setBifurcationSteps] = useState(defaults.bifurcationSteps);

    // Simulation parameters
    const [iterations, setIterations] = useState(defaults.iterations);

    // Visualization mode
    const [visualizationMode, setVisualizationMode] = useState(defaults.visualizationMode);

    // Randomize parameters
    const randomizeParameters = () => {
        setBirdCount(Math.floor(Math.random() * 50) + 10); // 10-60
        setResourceMean(Math.random() * 0.8 + 0.1); // 0.1-0.9
        setResourceVariance(Math.random() * 0.05 + 0.005); // 0.005-0.055
        setAdaptationRate(Math.random() * 3 + 0.5); // 0.5-3.5
        setBifurcationParameter(Math.random() * 8 + 1); // 1-9
        setBifurcationStart(Math.random() * 2 + 0.1); // 0.1-2.1
        setBifurcationEnd(Math.random() * 10 + 5); // 5-15
        setIterations(Math.floor(Math.random() * 2000) + 500); // 500-2500
    };

    // Reset all parameters to defaults
    const reset = () => {
        setBirdCount(defaults.birdCount);
        setResourceMean(defaults.resourceMean);
        setResourceVariance(defaults.resourceVariance);
        setAdaptationRate(defaults.adaptationRate);
        setBifurcationParameter(defaults.bifurcationParameter);
        setBifurcationStart(defaults.bifurcationStart);
        setBifurcationEnd(defaults.bifurcationEnd);
        setBifurcationSteps(defaults.bifurcationSteps);
        setIterations(defaults.iterations);
        setVisualizationMode(defaults.visualizationMode);
    };

    // Export the current view as a PNG image
    const exportPNG = () => {
        requestAnimationFrame(() => {
            if (!viewerRef.current) return;
            const dataURL = viewerRef.current.capture();

            const a = document.createElement('a');
            a.href = dataURL;
            a.download = `birdsym_${visualizationMode}_${Date.now()}.png`;
            a.click();
        });
    };

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
            content: (
                <div className="mt-12">
                    <p className="text-xl text-gray-300 mb-4">
                        Explore sympatric speciation through the BirdSym evolutionary model
                    </p>
                    <p className="text-gray-400">
                        Investigate how resource competition drives species divergence through
                        bifurcation patterns, demonstrating the mathematical foundations of
                        evolutionary branching and adaptive radiation.
                    </p>
                </div>
            ),
        },
        {
            id: 'simulation',
            type: 'canvas' as const,
            content: (
                <PlaygroundViewer
                    controls={
                        <Button
                            label="Randomize"
                            onClick={randomizeParameters}
                        />
                    }
                >
                    <CaptureHelper ref={viewerRef}>
                        <Viewer
                            birdCount={birdCount}
                            resourceMean={resourceMean}
                            resourceVariance={resourceVariance}
                            adaptationRate={adaptationRate}
                            bifurcationParameter={bifurcationParameter}
                            bifurcationStart={bifurcationStart}
                            bifurcationEnd={bifurcationEnd}
                            bifurcationSteps={bifurcationSteps}
                            iterations={iterations}
                            visualizationMode={visualizationMode}
                        />
                    </CaptureHelper>
                </PlaygroundViewer>
            ),
        },
        {
            id: 'about',
            type: 'outro' as const,
            content: (
                <div className="space-y-8 text-gray-300">
                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Speciation without a barrier</h3>
                        <p className="leading-relaxed text-sm">
                            The BirdSym model shows how sympatric speciation can emerge from resource competition alone,
                            with no geographic isolation. Birds spread along a trait axis stay one cluster until
                            competition crosses a threshold, then split into two specialists on either side of the
                            richest resources.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Speciation as broken symmetry</h3>
                        <p className="leading-relaxed text-sm">
                            The bifurcation diagram sweeps the competition parameter: below a critical value a single
                            cluster is stable, above it the symmetric state loses stability and forks in two. This is a
                            pitchfork bifurcation, the same mathematics as a buckling beam. The calibration panel checks
                            the deterministic Gaussian kernels underneath; the assumptions panel is honest about the
                            random initial perturbation and what the model leaves out.
                        </p>
                    </div>

                    <div className="border-t border-lime-500/20 pt-6">
                        <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
                    </div>

                    <CalibrationPanel results={calibration} outputLabel="kernel value" />

                    <AssumptionPanel assumptions={assumptions} />

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Model changelog</h3>
                        <ModelChangelog entries={changelog} />
                    </div>
                </div>
            ),
        },
    ];

    const settings = (
        <Settings
            birdCount={birdCount}
            setBirdCount={setBirdCount}
            resourceMean={resourceMean}
            setResourceMean={setResourceMean}
            resourceVariance={resourceVariance}
            setResourceVariance={setResourceVariance}
            adaptationRate={adaptationRate}
            setAdaptationRate={setAdaptationRate}
            bifurcationParameter={bifurcationParameter}
            setBifurcationParameter={setBifurcationParameter}
            bifurcationStart={bifurcationStart}
            setBifurcationStart={setBifurcationStart}
            bifurcationEnd={bifurcationEnd}
            setBifurcationEnd={setBifurcationEnd}
            bifurcationSteps={bifurcationSteps}
            setBifurcationSteps={setBifurcationSteps}
            iterations={iterations}
            setIterations={setIterations}
            visualizationMode={visualizationMode}
            setVisualizationMode={setVisualizationMode}
            reset={reset}
            onExport={exportPNG}
        />
    );

    return (
        <PlaygroundLayout
            title="Bifurcation Speciation Explorer"
            subtitle="Sympatric Speciation Through Adaptive Dynamics"
            sections={sections}
            settings={settings}
            researchUrl="/playgrounds/bifurcation-speciation/research"
        />
    );
}