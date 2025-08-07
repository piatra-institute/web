'use client';

import { useState, useRef } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Settings from './components/Settings';
import Viewer from './components/Viewer';



export default function AuthoritarianPaternalismPlayground() {
    // Population & horizon
    const [N, setN] = useState(2000);
    const [T, setT] = useState(120);
    
    // Preference distribution θ ~ Normal(μ_θ, σ_θ)
    const [muTheta, setMuTheta] = useState(0);
    const [sdTheta, setSdTheta] = useState(1);
    
    // Choice precision & shock scale
    const [lambda, setLambda] = useState(1.0);
    const [sigmaEps, setSigmaEps] = useState(0.5);
    
    // Payoff weights (a,b,c,d,κ)
    const [a, setA] = useState(0.8);
    const [b, setB] = useState(0.6);
    const [c, setC] = useState(1.0);
    const [d, setD] = useState(0.8);
    const [kappa, setKappa] = useState(0.6);
    
    // Policy levels
    const [g, setG] = useState(1.0);
    const [r, setR] = useState(0.5);
    const [p, setP] = useState(0.7);
    const [k, setK] = useState(0.8);
    
    // State transitions
    const [rho, setRho] = useState(0.9);
    const [eta, setEta] = useState(0.6);
    const [phi, setPhi] = useState(0.85);
    const [psi, setPsi] = useState(0.3);
    
    // Initial states
    const [F0, setF0] = useState(0.5);
    const [Order0, setOrder0] = useState(0.5);
    
    // Animation speed
    const [speedMs, setSpeedMs] = useState(30);
    
    const [refreshKey, setRefreshKey] = useState(0);
    
    const viewerRef = useRef<{ exportCanvas: () => void }>(null);
    
    const handleReset = () => {
        setN(2000);
        setT(120);
        setMuTheta(0);
        setSdTheta(1);
        setLambda(1.0);
        setSigmaEps(0.5);
        setA(0.8);
        setB(0.6);
        setC(1.0);
        setD(0.8);
        setKappa(0.6);
        setG(1.0);
        setR(0.5);
        setP(0.7);
        setK(0.8);
        setRho(0.9);
        setEta(0.6);
        setPhi(0.85);
        setPsi(0.3);
        setF0(0.5);
        setOrder0(0.5);
        setSpeedMs(30);
        setRefreshKey(prev => prev + 1);
    };
    
    const handleExport = () => {
        viewerRef.current?.exportCanvas();
    };
    
    return (
        <PlaygroundLayout
            title="authoritarian paternalism"
            subtitle="dark agent simulation of paternal authority dynamics"
            sections={[
                {
                    id: 'intro',
                    type: 'intro',
                    content: (
                        <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                            <h2 className="text-2xl font-bold text-white mb-4">Model Overview</h2>
                            <p>
                                This simulation models how <strong className="font-semibold text-lime-400">paternal signaling</strong> (F) 
                                and <strong className="font-semibold text-lime-400">order</strong> co-evolve to shape citizen support 
                                in authoritarian systems. Citizens have heterogeneous preferences θ for paternal authority.
                            </p>
                            <p>
                                Support probability follows σ(λ·ΔU), where utility differences incorporate transfers, 
                                repression costs, order benefits, and critically, the interaction between individual 
                                paternal preference θ and regime signaling F.
                            </p>
                            <div className="bg-black border border-gray-800 p-4 mt-4">
                                <h3 className="text-sm font-semibold text-lime-400 mb-2">Key Dynamics:</h3>
                                <ul className="space-y-1 text-sm">
                                    <li><strong className="text-white">F (Paternal Authority):</strong> Amplified by propaganda p, decays at rate ρ</li>
                                    <li><strong className="text-white">Order:</strong> Built through repression r, provides public good benefits</li>
                                    <li><strong className="text-white">Agentiality:</strong> How much decisions depend on θ vs regime levers</li>
                                    <li><strong className="text-white">VarShare:</strong> Cross-sectional variance driven by preference heterogeneity</li>
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
                                N={N}
                                T={T}
                                muTheta={muTheta}
                                sdTheta={sdTheta}
                                lambda={lambda}
                                sigmaEps={sigmaEps}
                                a={a}
                                b={b}
                                c={c}
                                d={d}
                                kappa={kappa}
                                g={g}
                                r={r}
                                p={p}
                                k={k}
                                rho={rho}
                                eta={eta}
                                phi={phi}
                                psi={psi}
                                F0={F0}
                                Order0={Order0}
                                speedMs={speedMs}
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
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Utility Components</h3>
                                    <p className="mb-3">
                                        Citizens evaluate regime support based on:
                                    </p>
                                    <div className="bg-black border border-gray-800 p-3 mb-3 font-mono text-sm">
                                        ΔU = a·g − d·r + b·Order + c·θ·F − κ·k + ε
                                    </div>
                                    <ul className="space-y-2 ml-4 text-sm">
                                        <li>• <strong>a·g:</strong> Material transfers (positive)</li>
                                        <li>• <strong>−d·r:</strong> Direct repression costs (negative)</li>
                                        <li>• <strong>b·Order:</strong> Public good from stability (positive)</li>
                                        <li>• <strong>c·θ·F:</strong> Paternal authority interaction (varies by θ)</li>
                                        <li>• <strong>−κ·k:</strong> Opposition costs (negative)</li>
                                        <li>• <strong>ε:</strong> Idiosyncratic shocks</li>
                                    </ul>
                                </div>
                                
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">State Evolution</h3>
                                    <div className="bg-black border border-gray-800 p-3 mb-3 font-mono text-sm">
                                        F[t+1] = ρ·F[t] + η·p<br/>
                                        Order[t+1] = φ·Order[t] + ψ·r
                                    </div>
                                    <ul className="space-y-2 text-sm">
                                        <li>• <strong>F dynamics:</strong> Propaganda p builds paternal signaling, which decays at rate (1−ρ)</li>
                                        <li>• <strong>Order dynamics:</strong> Repression r builds order, which erodes at rate (1−φ)</li>
                                        <li>• Both states create path dependence in regime support</li>
                                    </ul>
                                </div>
                                
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Agentiality Metrics</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <h4 className="text-sm font-semibold text-white">Individual Agentiality</h4>
                                            <div className="bg-black border border-gray-800 p-3 my-2 font-mono text-sm">
                                                A[i] = |c·θ[i]·F| / (|baseline| + |c·θ[i]·F|)
                                            </div>
                                            <p className="text-sm text-gray-400">
                                                Measures how much individual i's choice depends on their paternal preference vs regime incentives
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-white">Variance Share</h4>
                                            <div className="bg-black border border-gray-800 p-3 my-2 font-mono text-sm">
                                                Var(c·θ·F) / [Var(c·θ·F) + σ²ε]
                                            </div>
                                            <p className="text-sm text-gray-400">
                                                Fraction of cross-sectional variance in utility driven by preference heterogeneity
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Key Scenarios</h3>
                                    <ol className="space-y-2 text-sm">
                                        <li><strong>1. Propaganda Ramp:</strong> High η and p → F rises → θ becomes decisive → support polarizes by preference</li>
                                        <li><strong>2. Coercive Order:</strong> High r and ψ → Order rises → tradeoff between repression cost and stability benefit</li>
                                        <li><strong>3. Fragmented Society:</strong> High σθ → wide preference distribution → VarShare rises, outcomes diverge</li>
                                        <li><strong>4. Noisy Environment:</strong> High σε → random shocks dominate → choices less predictable, VarShare falls</li>
                                    </ol>
                                </div>
                                
                                <div className="mt-8 p-6 border border-gray-800">
                                    <h3 className="text-lg font-semibold text-white mb-3">Model Limitations</h3>
                                    <p className="text-sm text-gray-400">
                                        This stylized model abstracts complex political dynamics. Real authoritarian systems involve 
                                        endogenous policy responses, network effects, information asymmetries, and historical contingencies 
                                        not captured here. The model assumes myopic agents, exogenous policies, and independent decisions. 
                                        Use for conceptual exploration, not empirical prediction.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                }
            ]}
            settings={
                <Settings
                    N={N}
                    setN={setN}
                    T={T}
                    setT={setT}
                    muTheta={muTheta}
                    setMuTheta={setMuTheta}
                    sdTheta={sdTheta}
                    setSdTheta={setSdTheta}
                    lambda={lambda}
                    setLambda={setLambda}
                    sigmaEps={sigmaEps}
                    setSigmaEps={setSigmaEps}
                    a={a}
                    setA={setA}
                    b={b}
                    setB={setB}
                    c={c}
                    setC={setC}
                    d={d}
                    setD={setD}
                    kappa={kappa}
                    setKappa={setKappa}
                    g={g}
                    setG={setG}
                    r={r}
                    setR={setR}
                    p={p}
                    setP={setP}
                    k={k}
                    setK={setK}
                    rho={rho}
                    setRho={setRho}
                    eta={eta}
                    setEta={setEta}
                    phi={phi}
                    setPhi={setPhi}
                    psi={psi}
                    setPsi={setPsi}
                    F0={F0}
                    setF0={setF0}
                    Order0={Order0}
                    setOrder0={setOrder0}
                    speedMs={speedMs}
                    setSpeedMs={setSpeedMs}
                    onReset={handleReset}
                    onExport={handleExport}
                />
            }
        />
    );
}