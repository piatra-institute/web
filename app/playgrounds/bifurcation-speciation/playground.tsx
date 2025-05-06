'use client';

import React, { useRef, useState } from 'react';
import Header from '@/components/Header';
import Title from '@/components/Title';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import CaptureHelper, { CaptureHandle } from './components/CaptureHelper';

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

    return (
        <div className="relative min-h-screen">
            {/* Full-screen visualization */}
            <div className="absolute inset-0">
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
            </div>

            {/* Top-left header and title */}
            <div className="absolute top-0 left-0 z-10 p-6 pointer-events-none">
                <Header />
                <Title text="Bifurcation Speciation Explorer" />
                <div className="max-w-xl text-white/80 mt-2 text-sm text-center">
                    Explore the dynamics of the BirdSym model where resource competition 
                    <br />
                    drives sympatric speciation through bifurcation patterns
                    <br />
                    <br />
                    Adjust resource distribution, adaptation rate, and bifurcation parameter
                    <br />
                    to observe how species divergence emerges from the model
                </div>
            </div>

            {/* Right-side settings panel */}
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
        </div>
    );
}