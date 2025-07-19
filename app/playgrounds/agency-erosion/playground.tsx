'use client';

import { useState, useRef } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Settings from './components/Settings';
import Viewer from './components/Viewer';



export default function AgencyErosionPlayground() {
    // Simulation parameters
    const [numAgents, setNumAgents] = useState(400);
    const [steps, setSteps] = useState(120);
    const [m, setM] = useState(1.5);
    const [lambdaRefine, setLambdaRefine] = useState(0.08);
    const [thetaRef, setThetaRef] = useState(0.6);
    const [fragDecay, setFragDecay] = useState(0.03);
    const [alphaCoalition, setAlphaCoalition] = useState(3.0);
    const [Cstar, setCstar] = useState(0.25);
    const [dFactor, setDFactor] = useState(0.08);
    const [infoGain, setInfoGain] = useState(0.05);
    const [baseD, setBaseD] = useState(0.2);
    const [w1, setW1] = useState(1.0);
    const [w2, setW2] = useState(0.8);
    const [w3, setW3] = useState(0.6);
    const [w4, setW4] = useState(0.8);
    const [w5, setW5] = useState(0.6);
    const [thetaCMS, setThetaCMS] = useState(0.0);
    const [shockMode, setShockMode] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const viewerRef = useRef<{ exportCanvas: () => void }>(null);

    const handleReset = () => {
        setNumAgents(400);
        setSteps(120);
        setM(1.5);
        setLambdaRefine(0.08);
        setThetaRef(0.6);
        setFragDecay(0.03);
        setAlphaCoalition(3.0);
        setCstar(0.25);
        setDFactor(0.08);
        setInfoGain(0.05);
        setBaseD(0.2);
        setW1(1.0);
        setW2(0.8);
        setW3(0.6);
        setW4(0.8);
        setW5(0.6);
        setThetaCMS(0.0);
        setShockMode(true);
        setRefreshKey(prev => prev + 1);
    };

    const handleExport = () => {
        viewerRef.current?.exportCanvas();
    };

    return (
        <PlaygroundLayout
            title="agency erosion"
            subtitle="identity substitution dynamics in amplified environments"
            sections={[
                {
                    id: 'intro',
                    type: 'intro',
                    content: (
                        <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                            <h2 className="text-2xl font-bold text-white mb-4">Identity Substitution Dynamics</h2>
                            <p>
                                This simulation models how <strong className="font-semibold text-lime-400">symbolic identity signaling</strong> can
                                substitute for <strong className="font-semibold text-lime-400">agency-building participation</strong> in
                                social movements and collective action contexts.
                            </p>
                            <p>
                                As platform amplification (<em>m</em>) increases the visibility rewards for performative identity expression,
                                agents may allocate more of their limited attention budget to signaling (S) rather than substantive
                                organizing work (A). This can lead to movement fragmentation and reduced collective efficacy.
                            </p>
                            <div className="bg-black border border-gray-800 p-4 mt-4">
                                <h3 className="text-sm font-semibold text-lime-400 mb-2">Key Concepts:</h3>
                                <ul className="space-y-1 text-sm">
                                    <li><strong className="text-white">Signaling (S):</strong> Expressive identity performance</li>
                                    <li><strong className="text-white">Agency (A):</strong> Substantive organizing work</li>
                                    <li><strong className="text-white">Substitution Index (SI):</strong> Excess signaling after controlling for baseline salience</li>
                                    <li><strong className="text-white">CMS:</strong> Composite Mobilization Score tracking movement health</li>
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
                                numAgents={numAgents}
                                steps={steps}
                                m={m}
                                lambdaRefine={lambdaRefine}
                                thetaRef={thetaRef}
                                fragDecay={fragDecay}
                                alphaCoalition={alphaCoalition}
                                Cstar={Cstar}
                                dFactor={dFactor}
                                infoGain={infoGain}
                                baseD={baseD}
                                w1={w1}
                                w2={w2}
                                w3={w3}
                                w4={w4}
                                w5={w5}
                                thetaCMS={thetaCMS}
                                shockMode={shockMode}
                            />
                        </PlaygroundViewer>
                    )
                },
                {
                    id: 'outro',
                    type: 'outro',
                    content: (
                        <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                            <h2 className="text-2xl font-bold text-white mb-6">Model Interpretation & Dynamics</h2>

                            <div className="space-y-6">
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Emancipatory vs Anesthetic Patterns</h3>
                                    <p className="mb-3">
                                        The model distinguishes between two modes of identity signaling:
                                    </p>
                                    <ul className="space-y-2 ml-4">
                                        <li>
                                            <strong className="text-green-400">Emancipatory:</strong> Signaling that scaffolds
                                            coordination and broadens the action network (signal then build)
                                        </li>
                                        <li>
                                            <strong className="text-red-400">Anesthetic:</strong> Signaling that substitutes
                                            for substantive participation (signal instead of build)
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Key Mechanisms</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <h4 className="text-sm font-semibold text-white">1. Amplification Effect</h4>
                                            <p className="text-sm text-gray-400">
                                                Platform parameter <em>m</em> multiplies signaling returns, shifting agent incentives
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-white">2. Fragmentation Feedback</h4>
                                            <p className="text-sm text-gray-400">
                                                High S/A ratios increase identity partition entropy H, reducing coalition effectiveness
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-white">3. Coalition Threshold</h4>
                                            <p className="text-sm text-gray-400">
                                                {"Success requires C > C*, creating strategic discouragement when fragmented"}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-white">4. Information Distortion</h4>
                                            <p className="text-sm text-gray-400">
                                                Reduced cross-group exchange increases factual error, degrading coordination
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Reading the Metrics</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li>
                                            <strong className="text-white">{"SI > 1.25:"}</strong> Warning level for excess signaling
                                        </li>
                                        <li>
                                            <strong className="text-white">Rising H + Falling C:</strong> Fragmentation in progress
                                        </li>
                                        <li>
                                            <strong className="text-white">{"CMS < 0 with Rising S:"}</strong> Anesthetic substitution pattern
                                        </li>
                                        <li>
                                            <strong className="text-white">Phase Colors:</strong> Green (Emancipatory), Red (Anesthetic), Gray (Neutral)
                                        </li>
                                    </ul>
                                </div>

                                <div className="mt-8 p-6 border border-gray-800">
                                    <h3 className="text-lg font-semibold text-white mb-3">Model Limitations</h3>
                                    <p className="text-sm text-gray-400">
                                        This is a simplified heuristic model designed to illustrate dynamics, not make empirical predictions.
                                        Real social movements involve far more complex causal structures, heterogeneous agents, and
                                        multi-channel communication. The model assumes bounded attention, myopic updating, and treats
                                        opportunity supply as exogenous. External validation against historical cases is essential
                                        before any policy application.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                }
            ]}
            settings={
                <Settings
                    numAgents={numAgents}
                    setNumAgents={setNumAgents}
                    steps={steps}
                    setSteps={setSteps}
                    m={m}
                    setM={setM}
                    lambdaRefine={lambdaRefine}
                    setLambdaRefine={setLambdaRefine}
                    thetaRef={thetaRef}
                    setThetaRef={setThetaRef}
                    fragDecay={fragDecay}
                    setFragDecay={setFragDecay}
                    alphaCoalition={alphaCoalition}
                    setAlphaCoalition={setAlphaCoalition}
                    Cstar={Cstar}
                    setCstar={setCstar}
                    dFactor={dFactor}
                    setDFactor={setDFactor}
                    infoGain={infoGain}
                    setInfoGain={setInfoGain}
                    baseD={baseD}
                    setBaseD={setBaseD}
                    w1={w1}
                    setW1={setW1}
                    w2={w2}
                    setW2={setW2}
                    w3={w3}
                    setW3={setW3}
                    w4={w4}
                    setW4={setW4}
                    w5={w5}
                    setW5={setW5}
                    thetaCMS={thetaCMS}
                    setThetaCMS={setThetaCMS}
                    shockMode={shockMode}
                    setShockMode={setShockMode}
                    onReset={handleReset}
                    onExport={handleExport}
                />
            }
        />
    );
}
