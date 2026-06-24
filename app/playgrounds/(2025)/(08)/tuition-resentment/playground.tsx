'use client';

import { useState, useRef } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import AssumptionPanel from '@/components/AssumptionPanel';
import CalibrationPanel from '@/components/CalibrationPanel';
import VersionSelector from '@/components/VersionSelector';
import ModelChangelog from '@/components/ModelChangelog';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';

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

    const calibration = buildCalibration();

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
            researchUrl="/playgrounds/tuition-resentment/research"
            sections={[
                {
                    id: 'intro',
                    type: 'intro',
                    content: (
                        <div className="text-gray-300 text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
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
                        <div className="space-y-8 text-gray-300">
                            <div>
                                <h3 className="text-lime-400 font-semibold mb-3">The attribution mechanism</h3>
                                <p className="leading-relaxed text-sm mb-3">
                                    The attribution parameter lambda decides where disappointment goes. It is a logistic of three
                                    psychological drivers, bounded between institutional blame and self-blame.
                                </p>
                                <div className="border-l-2 border-lime-500/40 pl-4">
                                    <p className="text-lime-200/80 mb-2 font-mono text-sm">
                                        lambda = sigma(theta0 + theta1 Power + theta2 Identity + theta3 SocialComparison)
                                    </p>
                                </div>
                                <ul className="space-y-2 mt-3 text-sm leading-relaxed">
                                    <li>When lambda is high (toward 1): students blame themselves for the disappointment.</li>
                                    <li>When lambda is low (toward 0): students blame the institution.</li>
                                    <li>Power asymmetry raises self-blame, since grades are leverage.</li>
                                    <li>Identity internalization raises self-blame, as ego protection.</li>
                                    <li>Social comparison raises self-blame, through peer pressure.</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lime-400 font-semibold mb-3">Resentment dynamics</h3>
                                <div className="border-l-2 border-lime-500/40 pl-4">
                                    <p className="text-lime-200/80 mb-2 font-mono text-sm">
                                        R_self = lambda Dissonance
                                    </p>
                                    <p className="text-lime-200/80 mb-2 font-mono text-sm">
                                        R_institutional = (1 - lambda) Dissonance
                                    </p>
                                </div>
                                <p className="leading-relaxed text-sm mt-3">
                                    A single pool of dissonance is split into self-resentment, which harms wellbeing, and institutional
                                    resentment, which drives complaints. High tuition can paradoxically reduce complaints by raising lambda
                                    through sunk-cost and prestige effects.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lime-400 font-semibold mb-3">Institutional levers</h3>
                                <ul className="space-y-2 text-sm leading-relaxed">
                                    <li>Grade inflation raises observed quality, reducing dissonance but risking reputation when an audit detects it.</li>
                                    <li>Prestige messaging raises both expectation and self-attribution, a double effect.</li>
                                    <li>Marketing intensity raises expectation without improving quality.</li>
                                    <li>Quality investment is the only genuine way to reduce dissonance over the long run.</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lime-400 font-semibold mb-3">Scenarios to explore</h3>
                                <ol className="space-y-2 text-sm leading-relaxed">
                                    <li>High cost, low quality: set tuition to max and quality to min, and watch self-blame dominate.</li>
                                    <li>Grade-inflation trap: high leniency helps briefly but damages reputation once audited.</li>
                                    <li>Aid shock: enable it to see how reduced cost shifts attribution.</li>
                                    <li>Quality program: enable it for the sustainable path to satisfaction.</li>
                                </ol>
                            </div>

                            <div>
                                <h3 className="text-lime-400 font-semibold mb-3">Model insights</h3>
                                <p className="leading-relaxed text-sm">
                                    The model dramatizes a self-reinforcing cycle: high cost raises expectation, unmet expectation creates
                                    dissonance, and psychological mechanisms (sunk cost, identity protection) route that dissonance into
                                    self-blame rather than institutional critique. This protects institutions from accountability while
                                    harming student wellbeing. The exact arithmetic is verified below; the interpretation is an argument, not
                                    a forecast.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lime-400 font-semibold mb-3">Model version</h3>
                                <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
                            </div>

                            <div>
                                <h3 className="text-lime-400 font-semibold mb-3">Calibration</h3>
                                <CalibrationPanel results={calibration} outputLabel="model value" />
                            </div>

                            <div>
                                <h3 className="text-lime-400 font-semibold mb-3">Assumptions</h3>
                                <AssumptionPanel assumptions={assumptions} />
                            </div>

                            <div>
                                <h3 className="text-lime-400 font-semibold mb-3">Model changelog</h3>
                                <ModelChangelog entries={changelog} />
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