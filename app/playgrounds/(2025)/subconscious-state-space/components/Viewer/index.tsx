'use client';

import { forwardRef, useImperativeHandle, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ViewerRef, SimulationParams } from '../../playground';

interface TimePoint {
    t: number;
    E1: number;
    E2: number;
}

interface SimulationResult {
    series: TimePoint[];
    upFrac: number;
    freqHz: number;
    synchrony: number;
    accessProb: number;
}

// Sigmoid activation function
function sigmoid(x: number, a = 3.2, theta = 0.35): number {
    return 1.0 / (1.0 + Math.exp(-a * (x - theta)));
}

function clamp01(x: number): number {
    return x < 0 ? 0 : x > 1 ? 1 : x;
}

function mean(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
}

function pearson(a: number[], b: number[]): number {
    const ma = mean(a);
    const mb = mean(b);
    let num = 0, da = 0, db = 0;
    for (let i = 0; i < a.length; i++) {
        const xa = a[i] - ma;
        const xb = b[i] - mb;
        num += xa * xb;
        da += xa * xa;
        db += xb * xb;
    }
    const den = Math.sqrt(da * db) + 1e-12;
    return den > 0 ? num / den : 0;
}

function slowWaveFrequency(sig: number[], dt: number): number {
    const m = mean(sig);
    let crossings = 0;
    for (let i = 1; i < sig.length; i++) {
        const s1 = sig[i - 1] - m;
        const s2 = sig[i] - m;
        if ((s1 <= 0 && s2 > 0) || (s1 >= 0 && s2 < 0)) crossings++;
    }
    const duration = sig.length * dt;
    const freq = crossings / (2 * duration);
    return isFinite(freq) ? freq : 0;
}

function accessProbability(
    series: TimePoint[],
    dt: number,
    thr: number,
    sustainSteps: number,
    syncThresh: number
): number {
    const E1 = series.map(s => s.E1);
    const E2 = series.map(s => s.E2);
    let count = 0, total = 0;

    for (let i = 0; i + sustainSteps < series.length; i += Math.max(1, Math.floor(sustainSteps / 2))) {
        const w1 = E1.slice(i, i + sustainSteps);
        const w2 = E2.slice(i, i + sustainSteps);
        const allHigh = w1.every(x => x > thr) && w2.every(x => x > thr);
        const r = pearson(w1, w2);
        if (allHigh && r > syncThresh) count++;
        total++;
    }
    return total > 0 ? count / total : 0;
}

function simulate(params: SimulationParams): SimulationResult {
    const { g_gaba, g_nmda, g_k2p, thalamus, couple, noise } = params;

    // Time settings
    const dt = 0.002; // 2 ms
    const T = 8.0; // 8 s simulated
    const n = Math.floor(T / dt);

    // Time constants
    const tauE = 0.020; // 20 ms
    const tauI = 0.010; // 10 ms
    const tauA = 0.300; // 300 ms for slow adaptation

    // Coupling weights
    const wEE = 1.60;
    const wEI = 1.80;
    const wIE = 1.80;
    const wII = 1.00;
    const gA = 0.9; // adaptation strength on E

    // Access heuristic params
    const upThresh = 0.55;
    const accessThresh = 0.65;
    const sustain_ms = 120;
    const sustainSteps = Math.floor((sustain_ms / 1000) / dt);
    const syncThresh = 0.25;

    // State vectors
    let E1 = 0.1, I1 = 0.1, A1 = 0.0;
    let E2 = 0.1, I2 = 0.1, A2 = 0.0;

    const series: TimePoint[] = new Array(n);

    // Simple deterministic PRNG for reproducibility
    let seed = 7;
    function randn(): number {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        const u1 = ((seed >>> 0) / 4294967296 + 1e-12);
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        const u2 = ((seed >>> 0) / 4294967296 + 1e-12);
        return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }

    let upCount = 0;

    for (let t = 0; t < n; t++) {
        const n1 = noise * randn();
        const n2 = noise * randn();

        const T1 = thalamus;
        const T2 = thalamus;

        const C1 = couple * E2;
        const C2 = couple * E1;

        // E dynamics
        const net1 = wEE * E1 - wEI * (1 + g_gaba) * I1 - gA * A1 + g_nmda * E1 + C1 + T1 + n1 - g_k2p * E1;
        const net2 = wEE * E2 - wEI * (1 + g_gaba) * I2 - gA * A2 + g_nmda * E2 + C2 + T2 + n2 - g_k2p * E2;

        const dE1 = (-E1 + sigmoid(net1)) / tauE * dt;
        const dE2 = (-E2 + sigmoid(net2)) / tauE * dt;

        // I dynamics
        const dI1 = (-I1 + sigmoid(wIE * E1 - wII * (1 + g_gaba) * I1 + 0.1 * T1)) / tauI * dt;
        const dI2 = (-I2 + sigmoid(wIE * E2 - wII * (1 + g_gaba) * I2 + 0.1 * T2)) / tauI * dt;

        // Adaptation
        const dA1 = (E1 - A1) / tauA * dt;
        const dA2 = (E2 - A2) / tauA * dt;

        E1 = clamp01(E1 + dE1);
        E2 = clamp01(E2 + dE2);
        I1 = clamp01(I1 + dI1);
        I2 = clamp01(I2 + dI2);
        A1 = clamp01(A1 + dA1);
        A2 = clamp01(A2 + dA2);

        if (E1 > upThresh || E2 > upThresh) upCount++;

        series[t] = { t: +(t * dt).toFixed(3), E1, E2 };
    }

    // Metrics
    const upFrac = upCount / n;
    const freqHz = slowWaveFrequency(series.map(s => s.E1), dt);
    const synchrony = pearson(series.map(s => s.E1), series.map(s => s.E2));
    const accessProb = accessProbability(series, dt, accessThresh, sustainSteps, syncThresh);

    return { series, upFrac, freqHz, synchrony, accessProb };
}

const Viewer = forwardRef<ViewerRef>((_, ref) => {
    const [params, setParams] = useState<SimulationParams>({
        g_gaba: 0.6,
        g_nmda: 0.4,
        g_k2p: 0.4,
        thalamus: 0.25,
        couple: 0.15,
        noise: 0.02,
    });

    useImperativeHandle(ref, () => ({
        updateSimulation: (newParams: SimulationParams) => {
            setParams(newParams);
        },
        reset: () => {
            setParams({
                g_gaba: 0.6,
                g_nmda: 0.4,
                g_k2p: 0.4,
                thalamus: 0.25,
                couple: 0.15,
                noise: 0.02,
            });
        }
    }));

    const simulation = useMemo(() => simulate(params), [params]);

    const { series, upFrac, freqHz, synchrony, accessProb } = simulation;

    const fmt = (x: number) => (isFinite(x) ? x.toFixed(3) : '0.000');

    const getAccessBadgeColor = (v: number) => {
        if (v >= 0.6) return 'bg-lime-500/20 border-lime-500/40';
        if (v >= 0.3) return 'bg-amber-500/20 border-amber-500/40';
        return 'bg-red-500/20 border-red-500/40';
    };

    return (
        <div className="w-full h-full bg-black border border-lime-500/20 p-6 overflow-auto">
            <div className="space-y-6">
                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-black border border-lime-500/20 p-4">
                        <div className="text-gray-400 text-xs mb-1">Slow-wave frequency (Hz)</div>
                        <div className="text-white text-2xl font-mono">{fmt(freqHz)}</div>
                    </div>
                    <div className="bg-black border border-lime-500/20 p-4">
                        <div className="text-gray-400 text-xs mb-1">Up-state fraction</div>
                        <div className="text-white text-2xl font-mono">{fmt(upFrac)}</div>
                    </div>
                    <div className="bg-black border border-lime-500/20 p-4">
                        <div className="text-gray-400 text-xs mb-1">Synchrony (r)</div>
                        <div className="text-white text-2xl font-mono">{fmt(synchrony)}</div>
                    </div>
                    <div className={`border p-4 ${getAccessBadgeColor(accessProb)}`}>
                        <div className="text-gray-300 text-xs mb-1">Access probability</div>
                        <div className={`text-2xl font-mono ${accessProb >= 0.6 ? 'text-lime-400' : accessProb >= 0.3 ? 'text-amber-400' : 'text-red-400'}`}>
                            {fmt(accessProb)}
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="bg-black border border-lime-500/20 p-4">
                    <h3 className="text-lime-400 font-semibold mb-4">Time Series (E1, E2)</h3>
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={series}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#84cc16" opacity={0.1} />
                                <XAxis
                                    dataKey="t"
                                    tick={{ fill: '#d4d4d4', fontSize: 12 }}
                                    stroke="#84cc16"
                                    opacity={0.2}
                                    label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fill: '#d4d4d4' }}
                                />
                                <YAxis
                                    tick={{ fill: '#d4d4d4', fontSize: 12 }}
                                    stroke="#84cc16"
                                    opacity={0.2}
                                    domain={[0, 1]}
                                    label={{ value: 'Activity', angle: -90, position: 'insideLeft', fill: '#d4d4d4' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#000',
                                        border: '1px solid rgba(132, 204, 22, 0.2)',
                                        color: '#84cc16'
                                    }}
                                    formatter={(value: number) => value.toFixed(3)}
                                />
                                <Legend wrapperStyle={{ color: '#84cc16' }} />
                                <Line
                                    type="monotone"
                                    dataKey="E1"
                                    name="Node 1"
                                    stroke="#84cc16"
                                    dot={false}
                                    strokeWidth={2}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="E2"
                                    name="Node 2"
                                    stroke="#22d3ee"
                                    dot={false}
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Interpretation Guide */}
                <div className="bg-black border border-lime-500/20 p-4">
                    <h3 className="text-lime-400 font-semibold mb-3">Interpretation</h3>
                    <div className="text-sm text-gray-300 space-y-2">
                        <p>
                            <strong className="text-lime-400">High access probability:</strong> Both nodes frequently
                            sustain elevated activity with strong synchrony—indicative of conditions permitting global ignition.
                        </p>
                        <p>
                            <strong className="text-lime-400">Low access probability:</strong> Nodes fail to maintain
                            sustained, synchronized high activity—characteristic of unconscious regimes (sleep, anesthesia).
                        </p>
                        <p>
                            <strong className="text-lime-400">Slow-wave frequency:</strong> Reflects the dominant oscillation
                            rate; typical slow-wave sleep exhibits 0.5-1 Hz rhythms.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
});

Viewer.displayName = 'Viewer';

export default Viewer;
