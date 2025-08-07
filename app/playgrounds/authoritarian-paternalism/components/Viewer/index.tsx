'use client';

import React, { useMemo, useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

interface ViewerProps {
    N: number;
    T: number;
    muTheta: number;
    sdTheta: number;
    lambda: number;
    sigmaEps: number;
    a: number;
    b: number;
    c: number;
    d: number;
    kappa: number;
    g: number;
    r: number;
    p: number;
    k: number;
    rho: number;
    eta: number;
    phi: number;
    psi: number;
    F0: number;
    Order0: number;
    speedMs: number;
}

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

function randn() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function quantiles(sortedArr: number[], qs = [0.1, 0.5, 0.9]) {
    const n = sortedArr.length;
    return qs.map((q) => {
        if (n === 0) return null;
        const idx = clamp(Math.floor(q * (n - 1)), 0, n - 1);
        return sortedArr[idx];
    });
}

interface MiniChartProps {
    data: any[];
    xKey?: string;
    ySeries?: { key: string; label: string }[];
    yDomain?: [number, number];
    height?: number;
    showLegend?: boolean;
    title?: string;
    subtitle?: string;
}

function MiniChart({
    data,
    xKey = "t",
    ySeries = [{ key: "y", label: "y" }],
    yDomain = [0, 1],
    height = 260,
    showLegend = true,
    title,
    subtitle,
}: MiniChartProps) {
    const ref = useRef<HTMLDivElement>(null);
    const width = 900;
    const hPad = 8;
    const vPad = 12;
    const innerW = width - 2 * hPad;
    const innerH = 220;

    const [yMin, yMax] = yDomain ?? [0, 1];
    const n = Math.max(1, data.length);

    const scaleX = (i: number) => hPad + (i / (n - 1 || 1)) * innerW;
    const scaleY = (y: number) => vPad + (1 - (y - yMin) / (yMax - yMin || 1)) * innerH;

    const gridLines = 5;
    const grid = Array.from({ length: gridLines + 1 }, (_, k) => {
        const y = vPad + (k / gridLines) * innerH;
        const val = yMax - (k / gridLines) * (yMax - yMin);
        return { y, val };
    });

    const colors = ["#84cc16", "#a3e635", "#bef264", "#4ade80", "#22c55e", "#16a34a"];

    const lines = ySeries.map((s, idx) => {
        const pts = data
            .map((row, i) => {
                const xv = scaleX(i);
                const yv = scaleY(typeof row[s.key] === "number" ? row[s.key] : 0);
                return `${xv},${yv}`;
            })
            .join(" ");
        return { pts, color: colors[idx % colors.length], label: s.label };
    });

    return (
        <div className="w-full" ref={ref}>
            {title && (
                <div className="mb-2">
                    <div className="text-lg font-medium text-white">{title}</div>
                    {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
                </div>
            )}
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-64 bg-black border border-gray-800"
            >
                {grid.map((g, i) => (
                    <g key={i}>
                        <line x1={hPad} x2={hPad + innerW} y1={g.y} y2={g.y} stroke="#374151" strokeDasharray="3 3" />
                        <text x={hPad + innerW + 4} y={g.y + 4} fontSize="10" fill="#9ca3af">
                            {g.val.toFixed(2)}
                        </text>
                    </g>
                ))}

                <line x1={hPad} y1={vPad} x2={hPad} y2={vPad + innerH} stroke="#9ca3af" strokeWidth="1" />
                <line x1={hPad} y1={vPad + innerH} x2={hPad + innerW} y2={vPad + innerH} stroke="#9ca3af" strokeWidth="1" />

                {lines.map((ln, i) => (
                    <polyline key={i} fill="none" stroke={ln.color} strokeWidth="2" points={ln.pts} />
                ))}
            </svg>
            {showLegend && (
                <div className="flex flex-wrap gap-3 mt-2 text-xs">
                    {ySeries.map((s, idx) => (
                        <div key={s.key} className="inline-flex items-center gap-2">
                            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: colors[idx % colors.length] }} />
                            <span className="text-gray-300">{s.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const Viewer = forwardRef<{ exportCanvas: () => void }, ViewerProps>((props, ref) => {
    const { N, T, muTheta, sdTheta, lambda, sigmaEps, a, b, c, d, kappa, g, r, p, k, rho, eta, phi, psi, F0, Order0, speedMs } = props;
    
    const [isRunning, setIsRunning] = useState(false);
    
    const thetas = useMemo(() => {
        const arr = Array.from({ length: N }, () => muTheta + sdTheta * randn());
        arr.sort((x, y) => x - y);
        return arr;
    }, [N, muTheta, sdTheta]);

    const [q10, q50, q90] = useMemo(() => quantiles(thetas), [thetas]);

    const [series, setSeries] = useState<any[]>([]);
    const [agentSeries, setAgentSeries] = useState({ low: [] as any[], mid: [] as any[], high: [] as any[] });
    const [telemetry, setTelemetry] = useState({ t: 0, F: F0, Order: Order0, Support: 0, AvgAgency: 0, VarShare: 0 });

    const baseTerm = (F: number, Order: number) => a * g - d * r + b * Order - kappa * k;

    function step(state: { t: number; F: number; Order: number }) {
        const { t, F, Order } = state;
        const eps = Array.from({ length: N }, () => sigmaEps * randn());

        const base = baseTerm(F, Order);
        let sumP = 0;
        let sumAgency = 0;

        const varThetaComponent = c * c * F * F * (sdTheta * sdTheta);
        const varShare = varThetaComponent / (varThetaComponent + sigmaEps * sigmaEps + 1e-12);

        const reps = [q10, q50, q90];
        const repLabels = ["low", "mid", "high"];
        const repOut: any = {};

        for (let i = 0; i < N; i++) {
            const th = thetas[i];
            const dU = base + c * th * F + eps[i];
            const P = sigmoid(lambda * dU);
            sumP += P;

            const numer = Math.abs(c * th * F);
            const denom = Math.abs(base) + numer + 1e-6;
            const Ai = numer / denom;
            sumAgency += Ai;
        }

        reps.forEach((th, idx) => {
            if (th === null) return;
            const dU = base + c * th * F;
            const P = sigmoid(lambda * dU);
            const numer = Math.abs(c * th * F);
            const denom = Math.abs(base) + numer + 1e-6;
            const Ai = numer / denom;
            repOut[repLabels[idx]] = { P, A: Ai };
        });

        const support = sumP / N;
        const avgAgency = sumAgency / N;

        const Fnext = rho * F + eta * p;
        const OrderNext = phi * Order + psi * r;

        return {
            t: t + 1,
            next: { t: t + 1, F: Fnext, Order: OrderNext },
            row: { t, F, Order, Support: support, AvgAgency: avgAgency, VarShare: varShare },
            reps: {
                low: { t, P: repOut.low?.P || 0, A: repOut.low?.A || 0 },
                mid: { t, P: repOut.mid?.P || 0, A: repOut.mid?.A || 0 },
                high: { t, P: repOut.high?.P || 0, A: repOut.high?.A || 0 },
            },
        };
    }

    useEffect(() => {
        if (series.length === 0) {
            const base = baseTerm(F0, Order0);
            const support = sigmoid(lambda * base);
            const numerMid = Math.abs(c * (q50 ?? 0) * F0);
            const denomMid = Math.abs(base) + numerMid + 1e-6;
            const Amed = numerMid / denomMid;
            setSeries([{ t: 0, F: F0, Order: Order0, Support: support, AvgAgency: Amed, VarShare: 0 }]);
            setAgentSeries({
                low: [{ t: 0, P: sigmoid(lambda * (base + c * (q10 ?? 0) * F0)), A: Math.abs(c * (q10 ?? 0) * F0) / (Math.abs(base) + Math.abs(c * (q10 ?? 0) * F0) + 1e-6) }],
                mid: [{ t: 0, P: sigmoid(lambda * (base + c * (q50 ?? 0) * F0)), A: Math.abs(c * (q50 ?? 0) * F0) / (Math.abs(base) + Math.abs(c * (q50 ?? 0) * F0) + 1e-6) }],
                high: [{ t: 0, P: sigmoid(lambda * (base + c * (q90 ?? 0) * F0)), A: Math.abs(c * (q90 ?? 0) * F0) / (Math.abs(base) + Math.abs(c * (q90 ?? 0) * F0) + 1e-6) }],
            });
            setTelemetry({ t: 0, F: F0, Order: Order0, Support: support, AvgAgency: Amed, VarShare: 0 });
        }
    }, []);

    useEffect(() => {
        if (!isRunning) return;

        let current = { t: (series.at(-1)?.t ?? 0) + 0, F: series.at(-1)?.F ?? F0, Order: series.at(-1)?.Order ?? Order0 };
        let s = [...series];
        let aLow = [...agentSeries.low];
        let aMid = [...agentSeries.mid];
        let aHigh = [...agentSeries.high];

        const timer = setInterval(() => {
            if (current.t >= T) {
                clearInterval(timer);
                setIsRunning(false);
                return;
            }

            const { next, row, reps } = step(current);
            s.push(row);
            aLow.push(reps.low);
            aMid.push(reps.mid);
            aHigh.push(reps.high);

            current = next;

            if (current.t % 5 === 0 || current.t === T) {
                setSeries([...s]);
                setAgentSeries({ low: [...aLow], mid: [...aMid], high: [...aHigh] });
                setTelemetry({ t: row.t, F: row.F, Order: row.Order, Support: row.Support, AvgAgency: row.AvgAgency, VarShare: row.VarShare });
            }
        }, speedMs);

        return () => clearInterval(timer);
    }, [isRunning, T, F0, Order0, a, b, c, d, kappa, g, r, p, k, rho, eta, phi, psi, N, thetas, q10, q50, q90, lambda, sigmaEps, speedMs, series, agentSeries]);

    const [snap, setSnap] = useState({ t: 0, F: F0, Order: Order0 });
    
    function doStepOnce() {
        if (snap.t >= T) return;
        const { next, row, reps } = step(snap);
        setSeries((prev) => [...prev, row]);
        setAgentSeries((prev) => ({
            low: [...prev.low, reps.low],
            mid: [...prev.mid, reps.mid],
            high: [...prev.high, reps.high],
        }));
        setTelemetry({ t: row.t, F: row.F, Order: row.Order, Support: row.Support, AvgAgency: row.AvgAgency, VarShare: row.VarShare });
        setSnap(next);
    }

    const reset = () => {
        setSeries([]);
        setAgentSeries({ low: [], mid: [], high: [] });
        setTelemetry({ t: 0, F: F0, Order: Order0, Support: 0, AvgAgency: 0, VarShare: 0 });
        setSnap({ t: 0, F: F0, Order: Order0 });
    };

    const seriesForChart = useMemo(() => {
        const arr = (series && series.length > 0 ? series : [{ t: 0, F: F0, Order: Order0, Support: 0, AvgAgency: 0, VarShare: 0 }])
            .map((row, idx) => ({ ...row, t: typeof row.t === "number" ? row.t : idx }));
        return arr;
    }, [series, F0, Order0]);

    const agentsForChart = useMemo(() => {
        const fix = (arr: any[]) => (arr && arr.length > 0 ? arr : [{ t: 0, P: 0, A: 0 }])
            .map((row, idx) => ({ ...row, t: typeof row.t === "number" ? row.t : idx }));
        return {
            low: fix(agentSeries.low),
            mid: fix(agentSeries.mid),
            high: fix(agentSeries.high),
        };
    }, [agentSeries]);

    useImperativeHandle(ref, () => ({
        exportCanvas: () => {
            console.log("Export not implemented yet");
        }
    }));

    return (
        <div className="w-full p-4 md:p-8 bg-black text-white">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <button
                            className={`px-3 py-2 bg-lime-500 hover:bg-lime-400 disabled:opacity-50 transition-colors`}
                            onClick={() => {
                                reset();
                                setIsRunning(true);
                            }}
                            disabled={isRunning}
                        >
                            Run
                        </button>
                        <button
                            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
                            onClick={() => setIsRunning(false)}
                        >
                            Pause
                        </button>
                        <button
                            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
                            onClick={doStepOnce}
                        >
                            Step
                        </button>
                        <button
                            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
                            onClick={() => {
                                setIsRunning(false);
                                reset();
                            }}
                        >
                            Reset
                        </button>
                    </div>
                </div>

                <div className="border border-gray-800 bg-black p-4">
                    <h2 className="text-lg font-medium mb-2">Live Telemetry</h2>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-sm">
                        {[
                            { k: "t", v: telemetry.t },
                            { k: "F", v: telemetry.F.toFixed(3) },
                            { k: "Order", v: telemetry.Order.toFixed(3) },
                            { k: "Support", v: telemetry.Support.toFixed(3) },
                            { k: "AvgAgency", v: telemetry.AvgAgency.toFixed(3) },
                            { k: "VarShare", v: telemetry.VarShare.toFixed(3) },
                        ].map((x) => (
                            <div key={x.k} className="bg-black border border-gray-800 p-3 flex flex-col items-start">
                                <div className="text-xs uppercase text-gray-400">{x.k}</div>
                                <div className="text-base font-mono">{x.v}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border border-gray-800 bg-black p-4">
                    <MiniChart
                        data={seriesForChart}
                        ySeries={[
                            { key: "Support", label: "Support" },
                            { key: "F", label: "F" },
                            { key: "Order", label: "Order" },
                        ]}
                        yDomain={[0, 1.5]}
                        title="Regime State & Support"
                        subtitle="Support is the average of σ(λΔU). F and Order are states steered by p and r."
                    />
                </div>

                <div className="border border-gray-800 bg-black p-4">
                    <MiniChart
                        data={seriesForChart}
                        ySeries={[
                            { key: "AvgAgency", label: "AvgAgency (mean A_i)" },
                            { key: "VarShare", label: "VarShare (θ share of Var ΔU)" },
                        ]}
                        yDomain={[0, 1]}
                        title="Agentiality (collective)"
                        subtitle="AvgAgency rises when θ·F dominates baseline incentives. VarShare shows θ-driven dispersion."
                    />
                </div>

                <div className="border border-gray-800 bg-black p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MiniChart
                            data={agentsForChart.low}
                            ySeries={[{ key: "P", label: "P (low θ)" }]}
                            yDomain={[0, 1]}
                            title="Representative Agent — low θ"
                        />
                        <MiniChart
                            data={agentsForChart.mid}
                            ySeries={[{ key: "P", label: "P (median θ)" }]}
                            yDomain={[0, 1]}
                            title="Representative Agent — median θ"
                        />
                        <div className="md:col-span-2">
                            <MiniChart
                                data={agentsForChart.high}
                                ySeries={[{ key: "P", label: "P (high θ)" }]}
                                yDomain={[0, 1]}
                                title="Representative Agent — high θ"
                            />
                        </div>
                    </div>
                    <div className="w-full mt-4">
                        <MiniChart
                            data={seriesForChart}
                            ySeries={[{ key: "Support", label: "Support (avg)" }]}
                            yDomain={[0, 1]}
                            title="Average Support"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});

Viewer.displayName = 'Viewer';

export default Viewer;