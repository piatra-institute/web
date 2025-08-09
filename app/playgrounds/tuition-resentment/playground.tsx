'use client';

import { useState, useRef } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Settings from './components/Settings';
import Viewer from './components/Viewer';

export default function TuitionResentmentPlayground() {
    // Institutional factors
    const [tuition, setTuition] = useState(70000);
    const [marketing, setMarketing] = useState(60);
    const [prestige, setPrestige] = useState(75);
    const [gradeLeniency, setGradeLeniency] = useState(55);
    const [qualityInvest, setQualityInvest] = useState(50);
    
    // Student experience
    const [observedQuality, setObservedQuality] = useState(65);
    
    // Psychological factors
    const [powerAsymmetry, setPowerAsymmetry] = useState(60);
    const [identityInternalization, setIdentityInternalization] = useState(70);
    const [socialComparison, setSocialComparison] = useState(55);
    
    // Dynamic simulation parameters
    const [simulationHorizon, setSimulationHorizon] = useState(16);
    const [initialReputation, setInitialReputation] = useState(55);
    
    // Scenarios
    const [aidShock, setAidShock] = useState(false);
    const [rankingDrop, setRankingDrop] = useState(false);
    const [gradeAudit, setGradeAudit] = useState(true);
    const [qualityProgram, setQualityProgram] = useState(false);
    
    const [refreshKey, setRefreshKey] = useState(0);
    
    const viewerRef = useRef<{ exportCanvas: () => void }>(null);
    
    const handleReset = () => {
        setTuition(70000);
        setMarketing(60);
        setPrestige(75);
        setGradeLeniency(55);
        setQualityInvest(50);
        setObservedQuality(65);
        setPowerAsymmetry(60);
        setIdentityInternalization(70);
        setSocialComparison(55);
        setSimulationHorizon(16);
        setInitialReputation(55);
        setAidShock(false);
        setRankingDrop(false);
        setGradeAudit(true);
        setQualityProgram(false);
        setRefreshKey(prev => prev + 1);
    };
    
    const handleExport = () => {
        viewerRef.current?.exportCanvas();
    };
    
    return (
        <PlaygroundLayout
            title="tuition resentment"
            subtitle="high-tuition psychodynamics and attribution of blame"
            sections={[
                {
                    id: 'intro',
                    type: 'intro',
                    content: (
                        <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                            <h2 className="text-2xl font-bold text-white mb-4">Attribution Dynamics Model</h2>
                            <p>
                                This simulation explores how <strong className="font-semibold text-lime-400">high tuition fees</strong> create 
                                psychological dynamics where students may internalize failure rather than question institutional quality.
                            </p>
                            <p>
                                The model tracks how expectations (E), driven by cost and marketing, clash with observed quality (Q) to create 
                                cognitive dissonance (D). A key innovation is the <strong className="font-semibold text-lime-400">attribution 
                                mixer λ</strong>, which determines whether this dissonance becomes self-resentment or institutional resentment.
                            </p>
                            <div className="bg-black border border-gray-800 p-4 mt-4">
                                <h3 className="text-sm font-semibold text-lime-400 mb-2">Core Mechanisms:</h3>
                                <ul className="space-y-1 text-sm">
                                    <li><strong className="text-white">Expectation Formation:</strong> E = f(Tuition, Marketing, Prestige, Reputation)</li>
                                    <li><strong className="text-white">Dissonance:</strong> D = max(0, E - Q_observed)</li>
                                    <li><strong className="text-white">Attribution Split:</strong> λ determines internal vs external blame</li>
                                    <li><strong className="text-white">Reputation Dynamics:</strong> Evolves based on quality, complaints, and grade penalties</li>
                                </ul>
                            </div>
                        </div>
                    )
                },
                {
                    id: 'canvas',
                    type: 'canvas',
                    content: (
                        <PlaygroundViewer>
                            <Viewer
                                ref={viewerRef}
                                key={refreshKey}
                                tuition={tuition}
                                marketing={marketing}
                                prestige={prestige}
                                gradeLeniency={gradeLeniency}
                                qualityInvest={qualityInvest}
                                observedQuality={observedQuality}
                                powerAsymmetry={powerAsymmetry}
                                identityInternalization={identityInternalization}
                                socialComparison={socialComparison}
                                simulationHorizon={simulationHorizon}
                                initialReputation={initialReputation}
                                aidShock={aidShock}
                                rankingDrop={rankingDrop}
                                gradeAudit={gradeAudit}
                                qualityProgram={qualityProgram}
                            />
                        </PlaygroundViewer>
                    )
                },
                {
                    id: 'outro',
                    type: 'outro',
                    content: (
                        <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                            <h2 className="text-2xl font-bold text-white mb-6">Understanding the Results</h2>
                            
                            <div className="space-y-6">
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">The Attribution Mechanism</h3>
                                    <p className="mb-3">
                                        The attribution parameter λ (lambda) is crucial:
                                    </p>
                                    <div className="bg-black border border-gray-800 p-3 mb-3 font-mono text-sm">
                                        λ = σ(θ₀ + θ₁·Power + θ₂·Identity + θ₃·SocialComp)
                                    </div>
                                    <ul className="space-y-2 ml-4 text-sm">
                                        <li>• When λ is high (→1): Students blame themselves for disappointment</li>
                                        <li>• When λ is low (→0): Students blame the institution</li>
                                        <li>• Power asymmetry increases self-blame (grades as leverage)</li>
                                        <li>• Identity internalization increases self-blame (ego protection)</li>
                                        <li>• Social comparison increases self-blame (peer pressure)</li>
                                    </ul>
                                </div>
                                
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Resentment Dynamics</h3>
                                    <div className="bg-black border border-gray-800 p-3 mb-3 font-mono text-sm">
                                        R_internal = λ × Dissonance<br/>
                                        R_external = (1-λ) × Dissonance
                                    </div>
                                    <p className="text-sm">
                                        Dissonance gets channeled into either self-resentment (harmful to mental health) or 
                                        institutional resentment (leads to complaints). High tuition paradoxically can reduce 
                                        complaints by increasing λ through sunk-cost and prestige effects.
                                    </p>
                                </div>
                                
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Institutional Manipulation</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li><strong>Grade Inflation:</strong> Artificially raises observed quality, reducing dissonance but risking reputation when detected</li>
                                        <li><strong>Prestige Messaging:</strong> Increases expectations AND attribution to self (double effect)</li>
                                        <li><strong>Marketing Intensity:</strong> Raises expectations without improving quality</li>
                                        <li><strong>Quality Investment:</strong> The only genuine way to reduce dissonance long-term</li>
                                    </ul>
                                </div>
                                
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Key Scenarios to Explore</h3>
                                    <ol className="space-y-2 text-sm">
                                        <li><strong>1. High Cost, Low Quality:</strong> Set tuition to max, quality to min - watch self-blame dominate</li>
                                        <li><strong>2. Grade Inflation Trap:</strong> High grade leniency temporarily helps but damages reputation</li>
                                        <li><strong>3. Aid Shock Impact:</strong> Enable aid shock - see how reduced cost changes attribution</li>
                                        <li><strong>4. Quality Investment:</strong> Enable quality program - the sustainable path to satisfaction</li>
                                    </ol>
                                </div>
                                
                                <div className="mt-8 p-6 border border-gray-800">
                                    <h3 className="text-lg font-semibold text-white mb-3">Model Insights</h3>
                                    <p className="text-sm text-gray-400">
                                        This model reveals how high tuition can create a self-reinforcing cycle: high costs raise expectations, 
                                        unmet expectations create dissonance, but psychological mechanisms (sunk cost, identity protection) 
                                        channel this into self-blame rather than institutional critique. This protects institutions from 
                                        accountability while harming student wellbeing. Understanding these dynamics is crucial for both 
                                        policy intervention and individual awareness.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                }
            ]}
            settings={
                <Settings
                    tuition={tuition}
                    setTuition={setTuition}
                    marketing={marketing}
                    setMarketing={setMarketing}
                    prestige={prestige}
                    setPrestige={setPrestige}
                    gradeLeniency={gradeLeniency}
                    setGradeLeniency={setGradeLeniency}
                    qualityInvest={qualityInvest}
                    setQualityInvest={setQualityInvest}
                    observedQuality={observedQuality}
                    setObservedQuality={setObservedQuality}
                    powerAsymmetry={powerAsymmetry}
                    setPowerAsymmetry={setPowerAsymmetry}
                    identityInternalization={identityInternalization}
                    setIdentityInternalization={setIdentityInternalization}
                    socialComparison={socialComparison}
                    setSocialComparison={setSocialComparison}
                    simulationHorizon={simulationHorizon}
                    setSimulationHorizon={setSimulationHorizon}
                    initialReputation={initialReputation}
                    setInitialReputation={setInitialReputation}
                    aidShock={aidShock}
                    setAidShock={setAidShock}
                    rankingDrop={rankingDrop}
                    setRankingDrop={setRankingDrop}
                    gradeAudit={gradeAudit}
                    setGradeAudit={setGradeAudit}
                    qualityProgram={qualityProgram}
                    setQualityProgram={setQualityProgram}
                    onReset={handleReset}
                    onExport={handleExport}
                />
            }
        />
    );
}