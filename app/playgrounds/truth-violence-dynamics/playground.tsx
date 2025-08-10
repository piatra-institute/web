'use client';

import { useState, useRef, useEffect } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Settings from './components/Settings';
import Viewer from './components/Viewer';

// Utility functions
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const clampNonNeg = (x: number) => (x < 0 ? 0 : x);

function S(E: number) {
    return E / (1 + Math.max(0, E));
}

// RK4 integration step
function rk4Step(
    state: { u: number; t: number; v: number; tau?: number },
    params: any,
    exog: { E: (t: number) => number; M: (t: number) => number; IT: (t: number) => number },
    dt: number
) {
    const f = (s: any, time: number) => {
        const E = Math.max(0, exog.E(time));
        const M = Math.max(0, exog.M(time));
        const IT = Math.max(0, exog.IT(time));

        const du =
            params.alpha0 +
            params.alpha1 * (1 - s.t) +
            params.alpha2 * M -
            params.alpha3 * s.u -
            params.alpha4 * s.v +
            params.alpha5 * s.v * s.u;

        const dt_ = s.t * (1 - s.t) * (params.eta + params.beta1 * IT - params.beta2 * s.u - params.beta3 * s.v);

        const dv = -params.lambda * s.v + params.phi * s.u * (1 - s.t) * S(E) + params.psi * E;

        return { du, dt: dt_, dv };
    };

    const time0 = state.tau ?? 0;
    const s0 = { ...state };
    const k1 = f(s0, time0);
    const s1 = { u: s0.u + (dt / 2) * k1.du, t: s0.t + (dt / 2) * k1.dt, v: s0.v + (dt / 2) * k1.dv };
    const k2 = f(s1, time0 + dt / 2);
    const s2 = { u: s0.u + (dt / 2) * k2.du, t: s0.t + (dt / 2) * k2.dt, v: s0.v + (dt / 2) * k2.dv };
    const k3 = f(s2, time0 + dt / 2);
    const s3 = { u: s0.u + dt * k3.du, t: s0.t + dt * k3.dt, v: s0.v + dt * k3.dv };
    const k4 = f(s3, time0 + dt);

    let u = s0.u + (dt / 6) * (k1.du + 2 * k2.du + 2 * k3.du + k4.du);
    let t = s0.t + (dt / 6) * (k1.dt + 2 * k2.dt + 2 * k3.dt + k4.dt);
    let v = s0.v + (dt / 6) * (k1.dv + 2 * k2.dv + 2 * k3.dv + k4.dv);

    // Enforce domains
    u = clampNonNeg(u);
    t = clamp01(t);
    v = clamp01(v);

    return { u, t, v };
}

// Pulse schedule for exogenous drivers
function makePulseSchedule(base = 0) {
    const pulses: Array<{ start: number; duration: number; amplitude: number }> = [];
    const fn = (time: number) => {
        let extra = 0;
        for (const p of pulses) {
            if (time >= p.start && time < p.start + p.duration) extra += p.amplitude;
        }
        return Math.max(0, base + extra);
    };
    fn.addPulse = (start: number, duration: number, amplitude: number) => 
        pulses.push({ start, duration, amplitude });
    fn.setBase = (b: number) => (base = Math.max(0, b));
    fn.getBase = () => base;
    fn.clearPulses = () => (pulses.length = 0);
    fn.getPulses = () => pulses.slice();
    return fn;
}

export default function TruthViolenceDynamicsPlayground() {
    // Model parameters
    const [params, setParams] = useState({
        alpha0: 0.02,
        alpha1: 0.25,
        alpha2: 0.30,
        alpha3: 0.20,
        alpha4: 0.30,
        alpha5: 0.10,
        eta: 0.02,
        beta1: 0.50,
        beta2: 0.35,
        beta3: 0.25,
        lambda: 0.60,
        phi: 0.60,
        psi: 0.10,
    });

    // Exogenous drivers
    const ERef = useRef(makePulseSchedule(0.3));
    const MRef = useRef(makePulseSchedule(0.2));
    const ITRef = useRef(makePulseSchedule(0.6));

    // Simulation state
    const [state, setState] = useState({ u: 0.2, t: 0.45, v: 0.05, tau: 0 });
    const [running, setRunning] = useState(false);
    const [dt, setDt] = useState(0.05);
    const [speed, setSpeed] = useState(30);
    const [maxPoints, setMaxPoints] = useState(1000);
    const [data, setData] = useState<any[]>([]);

    // Initial conditions for reset
    const [initialU, setInitialU] = useState(0.2);
    const [initialT, setInitialT] = useState(0.45);
    const [initialV, setInitialV] = useState(0.05);

    // Base values for exogenous drivers
    const [baseE, setBaseE] = useState(0.3);
    const [baseM, setBaseM] = useState(0.2);
    const [baseIT, setBaseIT] = useState(0.6);

    const viewerRef = useRef<{ exportCanvas: () => void }>(null);

    // Calculate risk index
    const risk = (() => {
        const E = ERef.current(state.tau);
        const u = state.u;
        const t = state.t;
        const R = params.phi * u * (1 - t) * S(E) + params.psi * E - params.lambda;
        return R;
    })();

    // Apply preset configurations
    const applyPreset = (name: string) => {
        if (name === 'stabilizing') {
            setParams({
                alpha0: 0.02,
                alpha1: 0.20,
                alpha2: 0.18,
                alpha3: 0.35,
                alpha4: 0.20,
                alpha5: 0.08,
                eta: 0.04,
                beta1: 0.70,
                beta2: 0.30,
                beta3: 0.20,
                lambda: 0.85,
                phi: 0.45,
                psi: 0.08,
            });
            setBaseE(0.2);
            setBaseM(0.15);
            setBaseIT(0.75);
            ERef.current.setBase(0.2);
            MRef.current.setBase(0.15);
            ITRef.current.setBase(0.75);
            reset(true);
        }
        if (name === 'spiral') {
            setParams({
                alpha0: 0.03,
                alpha1: 0.32,
                alpha2: 0.40,
                alpha3: 0.10,
                alpha4: 0.35,
                alpha5: 0.20,
                eta: 0.00,
                beta1: 0.30,
                beta2: 0.45,
                beta3: 0.35,
                lambda: 0.35,
                phi: 0.80,
                psi: 0.25,
            });
            setBaseE(0.4);
            setBaseM(0.35);
            setBaseIT(0.30);
            ERef.current.setBase(0.4);
            MRef.current.setBase(0.35);
            ITRef.current.setBase(0.30);
            reset(true);
        }
        if (name === 'shock') {
            setParams((p) => ({ ...p, alpha5: 0.18, alpha4: 0.25 }));
            setBaseE(0.25);
            setBaseM(0.20);
            setBaseIT(0.55);
            ERef.current.setBase(0.25);
            MRef.current.setBase(0.20);
            ITRef.current.setBase(0.55);
            const t0 = state.tau;
            ERef.current.addPulse(t0 + 2, 2.5, 0.8);
            MRef.current.addPulse(t0 + 1, 1.5, 0.7);
            reset(true);
        }
    };

    const reset = (keepExog = false) => {
        setRunning(false);
        setState({ u: initialU, t: initialT, v: initialV, tau: 0 });
        setData([]);
        if (!keepExog) {
            ERef.current = makePulseSchedule(baseE);
            MRef.current = makePulseSchedule(baseM);
            ITRef.current = makePulseSchedule(baseIT);
        }
    };

    const step = () => {
        const exog = {
            E: (t: number) => ERef.current(t),
            M: (t: number) => MRef.current(t),
            IT: (t: number) => ITRef.current(t),
        };
        setState((prev) => {
            const next = rk4Step(prev, params, exog, dt);
            const tau = parseFloat((prev.tau + dt).toFixed(4));
            const point = {
                time: tau,
                u: parseFloat(next.u.toFixed(6)),
                t: parseFloat(next.t.toFixed(6)),
                v: parseFloat(next.v.toFixed(6)),
                E: parseFloat(exog.E(tau).toFixed(6)),
                M: parseFloat(exog.M(tau).toFixed(6)),
                IT: parseFloat(exog.IT(tau).toFixed(6)),
                R: parseFloat((params.phi * next.u * (1 - next.t) * S(exog.E(tau)) + params.psi * exog.E(tau) - params.lambda).toFixed(6)),
            };
            setData((d) => (d.length > maxPoints ? [...d.slice(-Math.floor(maxPoints * 0.9)), point] : [...d, point]));
            return { ...next, tau };
        });
    };

    // Update base values when sliders change
    useEffect(() => {
        ERef.current.setBase(baseE);
    }, [baseE]);

    useEffect(() => {
        MRef.current.setBase(baseM);
    }, [baseM]);

    useEffect(() => {
        ITRef.current.setBase(baseIT);
    }, [baseIT]);

    // Simulation loop
    useEffect(() => {
        if (!running) return;
        const interval = setInterval(step, 1000 / Math.max(1, speed));
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [running, speed]);

    // Initial data population
    useEffect(() => {
        const exog = { 
            E: (t: number) => ERef.current(t), 
            M: (t: number) => MRef.current(t), 
            IT: (t: number) => ITRef.current(t) 
        };
        const seed: any[] = [];
        let s = { u: 0.2, t: 0.45, v: 0.05, tau: 0 };
        for (let i = 0; i < 20; i++) {
            s = { ...rk4Step(s, params, exog, dt), tau: parseFloat(((s.tau ?? 0) + dt).toFixed(4)) };
            seed.push({
                time: s.tau,
                u: parseFloat(s.u.toFixed(6)),
                t: parseFloat(s.t.toFixed(6)),
                v: parseFloat(s.v.toFixed(6)),
                E: parseFloat(exog.E(s.tau).toFixed(6)),
                M: parseFloat(exog.M(s.tau).toFixed(6)),
                IT: parseFloat(exog.IT(s.tau).toFixed(6)),
                R: parseFloat((params.phi * s.u * (1 - s.t) * S(exog.E(s.tau)) + params.psi * exog.E(s.tau) - params.lambda).toFixed(6)),
            });
        }
        setData(seed);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAddPulse = (driver: 'E' | 'M' | 'IT', amplitude: number, duration: number) => {
        const ref = driver === 'E' ? ERef : driver === 'M' ? MRef : ITRef;
        ref.current.addPulse(state.tau + 1, duration, amplitude);
    };

    const handleClearPulses = (driver: 'E' | 'M' | 'IT') => {
        const ref = driver === 'E' ? ERef : driver === 'M' ? MRef : ITRef;
        ref.current.clearPulses();
    };

    const handleExport = () => {
        const csvContent = [
            ['time', 'u', 't', 'v', 'E', 'M', 'IT', 'R'].join(','),
            ...data.map(row => [
                row.time.toFixed(4),
                row.u.toFixed(6),
                row.t.toFixed(6),
                row.v.toFixed(6),
                row.E.toFixed(6),
                row.M.toFixed(6),
                row.IT.toFixed(6),
                row.R.toFixed(6)
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'truth-violence-dynamics.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <PlaygroundLayout
            title="Truth-Violence Dynamics"
            subtitle="parrhesia suppression through pressure and punitive support dynamics"
            sections={[
                {
                    id: 'intro',
                    type: 'intro',
                    content: (
                        <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                            <h2 className="text-2xl font-bold text-white mb-4">Parrhesia Suppression Model</h2>
                            <p>
                                Interactive exploration of the coupled ODE model for <strong className="text-lime-400">uncertainty (u)</strong>,{' '}
                                <strong className="text-lime-400">truth-seeking share (t)</strong>, and{' '}
                                <strong className="text-lime-400">punitive support (v)</strong> under elite cues, misinformation, and institutional strength.
                            </p>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lime-400">Core Dynamics:</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-300">
                                    <li>Pressure rises from non-truth-seeking population and misinformation</li>
                                    <li>Truth-seeking is boosted by institutions but suppressed by pressure and violence</li>
                                    <li>Punitive support grows when pressure among non-truth-seekers meets elite sanction</li>
                                    <li>Short-term venting through repression can backfire into long-term escalation</li>
                                </ul>
                            </div>
                            <div className="mt-4 p-3 bg-black border border-gray-800 rounded">
                                <p className="text-xs text-gray-400">
                                    Based on the mathematical model: u′ = α₀ + α₁(1-t) + α₂M - α₃u - α₄v + α₅vu
                                </p>
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
                                data={data}
                                running={running}
                                onToggleRunning={() => setRunning(!running)}
                                onStep={step}
                                risk={risk}
                                currentState={state}
                            />
                        </PlaygroundViewer>
                    )
                },
                {
                    id: 'outro',
                    type: 'outro',
                    content: (
                        <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                            <h2 className="text-2xl font-bold text-white mb-4">Implications & Extensions</h2>
                            
                            <div className="space-y-4">
                                <p>
                                    This model demonstrates how <strong className="text-lime-400">parrhesia</strong> (fearless speech) 
                                    can be systematically suppressed through the interaction of uncertainty, elite signaling, and 
                                    punitive support dynamics.
                                </p>
                                
                                <div className="bg-black border border-gray-800 p-4">
                                    <h3 className="text-sm font-semibold text-lime-400 mb-2">Key Findings:</h3>
                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                        <li>Truth-seeking populations are vulnerable to cascading suppression</li>
                                        <li>Short-term repression can appear effective but creates long-term instability</li>
                                        <li>Strong institutions (high I_T) provide resilience against authoritarian drift</li>
                                        <li>The risk index R captures tipping points toward violence support</li>
                                    </ul>
                                </div>
                                
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold text-lime-400">Policy Interventions</h3>
                                    <p className="text-sm">
                                        The model suggests several leverage points for maintaining truth-seeking capacity:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                        <li><strong>Institutional strengthening</strong> (↑I_T): Press freedom, academic independence</li>
                                        <li><strong>Accountability mechanisms</strong> (↑λ): Rapid decay of violence support</li>
                                        <li><strong>Counter-disinformation</strong> (↓M): Prebunking, fact-checking infrastructure</li>
                                        <li><strong>Elite restraint</strong> (↓E): Norms against weaponizing uncertainty</li>
                                    </ul>
                                </div>
                                
                                <div className="bg-black border border-gray-800 p-4">
                                    <h3 className="text-sm font-semibold text-lime-400 mb-2">Mathematical Extensions:</h3>
                                    <p className="text-sm mb-2">Future work could incorporate:</p>
                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                        <li>Network effects: spatial contagion of truth-seeking vs punitive support</li>
                                        <li>Memory dynamics: historical trauma affecting baseline parameters</li>
                                        <li>Multiple equilibria: regime-switching between democratic and authoritarian attractors</li>
                                        <li>Stochastic shocks: modeling unpredictable events that reset dynamics</li>
                                    </ul>
                                </div>
                                
                                <p className="text-sm text-gray-400 italic">
                                    "The first casualty when war comes is truth" — but truth-seeking itself may be the 
                                    earlier casualty, creating conditions where violence becomes acceptable.
                                </p>
                            </div>
                        </div>
                    )
                }
            ]}
            settings={
                <Settings
                    params={params}
                    setParams={setParams}
                    dt={dt}
                    setDt={setDt}
                    speed={speed}
                    setSpeed={setSpeed}
                    maxPoints={maxPoints}
                    setMaxPoints={setMaxPoints}
                    initialU={initialU}
                    setInitialU={setInitialU}
                    initialT={initialT}
                    setInitialT={setInitialT}
                    initialV={initialV}
                    setInitialV={setInitialV}
                    baseE={baseE}
                    setBaseE={setBaseE}
                    baseM={baseM}
                    setBaseM={setBaseM}
                    baseIT={baseIT}
                    setBaseIT={setBaseIT}
                    onReset={() => reset(false)}
                    onApplyPreset={applyPreset}
                    onAddPulse={handleAddPulse}
                    onClearPulses={handleClearPulses}
                    onExport={handleExport}
                />
            }
        />
    );
}