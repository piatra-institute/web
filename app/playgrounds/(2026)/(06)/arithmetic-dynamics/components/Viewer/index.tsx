'use client';

import React, { useMemo, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ReTooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';

import AssumptionPanel, { Assumption } from '@/components/AssumptionPanel';
import CalibrationPanel, { CalibrationResult } from '@/components/CalibrationPanel';
import VersionSelector, { ModelVersion } from '@/components/VersionSelector';
import ChartTooltip from '@/components/ChartTooltip';
import Equation from '@/components/Equation';

import {
    TEMPLATE_KEYS,
    TEMPLATE_LABELS,
    TEMPLATE_BLURBS,
    makeTemplates,
    templateIndex,
    type Metrics,
    type Params,
    type SweepDatum,
} from '../../logic';
import TissueGrid, { TissueGridHandle } from '../TissueGrid';
import TemplateThumb from '../TemplateThumb';


type Tab = 'morphology' | 'templates' | 'orbit' | 'analysis';

const TABS: { key: Tab; label: string }[] = [
    { key: 'morphology', label: 'morphology' },
    { key: 'templates', label: 'templates' },
    { key: 'orbit', label: 'orbit' },
    { key: 'analysis', label: 'analysis' },
];


interface ViewerProps {
    params: Params;
    metrics: Metrics;
    sweep: SweepDatum[];
    calibration: CalibrationResult[];
    assumptions: Assumption[];
    versions: ModelVersion[];
    gridRef: React.Ref<TissueGridHandle>;
    onMetrics: (m: Metrics) => void;
}


export default function Viewer({
    params,
    metrics,
    sweep,
    calibration,
    assumptions,
    versions,
    gridRef,
    onMetrics,
}: ViewerProps) {
    const [tab, setTab] = useState<Tab>('morphology');
    const templates = useMemo(() => makeTemplates(), []);

    const activeIdx = templateIndex(params.template);
    const maxAbs = Math.max(1e-6, ...metrics.overlaps.map((o) => Math.abs(o)));

    return (
        <div className="w-[90vw] h-[90vh] max-w-[1100px] overflow-y-auto space-y-6 outline-none [&_*]:outline-none text-lime-100">
            <div className="flex items-center justify-between gap-4">
                <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
            </div>

            <div className="border border-lime-500/30 p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <div className="font-semibold text-sm text-lime-400">{TEMPLATE_LABELS[params.template]}</div>
                        <div className="text-lime-200/60 text-xs mt-1">
                            a tissue relaxing under low-rank memory + diffusion · seed, lesion, and watch the form regenerate
                        </div>
                    </div>
                    <div className="flex gap-6 text-xs font-mono text-lime-200/60">
                        <div>recovery: <span className="text-lime-400">{Math.round(metrics.recovery * 100)}%</span></div>
                        <div>dominant: <span className="text-lime-400">{TEMPLATE_LABELS[TEMPLATE_KEYS[metrics.dominant]]}</span></div>
                        <div>energy: <span className="text-lime-400">{metrics.energy.toFixed(2)}</span></div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center gap-4">
                <TissueGrid ref={gridRef} params={params} onMetrics={onMetrics} />
                <div className="w-full max-w-[760px] space-y-2">
                    {TEMPLATE_KEYS.map((key, k) => {
                        const ov = metrics.overlaps[k] ?? 0;
                        const pct = 50 + 50 * (ov / maxAbs);
                        const isDominant = k === metrics.dominant;
                        const isActive = k === activeIdx;
                        return (
                            <div key={key} className="flex items-center gap-3">
                                <div className={`w-28 text-[11px] ${isActive ? 'text-lime-400' : 'text-lime-200/60'}`}>
                                    {TEMPLATE_LABELS[key]}
                                </div>
                                <div className="flex-1 h-2.5 bg-lime-500/5 border border-lime-500/15 relative overflow-hidden">
                                    <div
                                        className={isDominant ? 'absolute inset-y-0 left-0 bg-lime-500/70' : 'absolute inset-y-0 left-0 bg-lime-500/30'}
                                        style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
                                    />
                                    <div className="absolute inset-y-0 left-1/2 w-px bg-lime-200/20" />
                                </div>
                                <div className="w-12 text-right text-[11px] font-mono text-lime-200/50">{ov.toFixed(2)}</div>
                            </div>
                        );
                    })}
                    <div className="text-[10px] text-lime-200/40 font-mono">
                        template overlaps m_k = &lt;p_k, y&gt; · centre line is zero · the filled bar is the dominant attractor
                    </div>
                </div>
            </div>

            <div className="flex gap-1 flex-wrap border-b border-lime-500/20">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`px-3 py-1.5 text-xs font-mono border-b-2 -mb-px transition-colors cursor-pointer ${
                            tab === t.key
                                ? 'border-lime-500 text-lime-400'
                                : 'border-transparent text-lime-200/50 hover:text-lime-200/80'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'morphology' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        teal-lime is positive polarity, orange is negative, black is intermediate · the colour is y = tanh(g u)
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-lime-500/20 p-4">
                            <div className="text-[10px] uppercase tracking-wide text-lime-200/40">how to read it</div>
                            <ul className="text-xs text-lime-200/70 mt-2 space-y-1.5 leading-relaxed list-disc pl-4">
                                <li><span className="text-lime-300">seed target</span> drops the tissue into a stored morphology.</li>
                                <li><span className="text-lime-300">lesion</span> zeroes a patch, like an injury.</li>
                                <li>if memory is strong enough, the form fills back in: regeneration as descent into a basin.</li>
                                <li><span className="text-lime-300">imprint current</span> writes the current shape over the selected template, a one-shot Hebbian memory.</li>
                            </ul>
                        </div>
                        <div className="border border-lime-500/20 p-4">
                            <div className="text-[10px] uppercase tracking-wide text-lime-200/40">the three regimes</div>
                            <ul className="text-xs text-lime-200/70 mt-2 space-y-1.5 leading-relaxed list-disc pl-4">
                                <li>below a memory threshold the form is forgotten and decays to blank.</li>
                                <li>above it, a lesioned form is repaired: a stored attractor.</li>
                                <li>with too little diffusion a lesion can leave a frozen scar.</li>
                                <li>with noise the basin is metastable, not an exact fixed point.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'templates' && (
                <div className="space-y-3">
                    <div className="text-xs text-lime-200/60 font-mono">
                        the three orthonormalised stored morphologies · the low-rank memory pulls the tissue toward their span
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {TEMPLATE_KEYS.map((key, k) => (
                            <div
                                key={key}
                                className={`border p-3 ${k === activeIdx ? 'border-lime-500 bg-lime-500/5' : 'border-lime-500/20'}`}
                            >
                                <TemplateThumb pattern={templates[k]} />
                                <div className="text-sm text-lime-300 mt-2">{TEMPLATE_LABELS[key]}</div>
                                <div className="text-[11px] text-lime-200/60 mt-1 leading-relaxed">{TEMPLATE_BLURBS[key]}</div>
                            </div>
                        ))}
                    </div>
                    <div className="border border-lime-500/20 p-3 text-xs text-lime-200/60 leading-relaxed">
                        these are the canonical targets. an in-app <span className="text-lime-300">imprint</span> rewrites one of
                        them inside the live tissue, but does not change this reference panel.
                    </div>
                </div>
            )}

            {tab === 'orbit' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        the shared move: form as the destination of an iterated update on a structured state space
                    </div>
                    <div className="border border-lime-500/30 p-4 space-y-3">
                        <div className="text-sm text-lime-200/80 leading-relaxed">
                            the tissue is a continuous associative memory. each cell relaxes by
                        </div>
                        <Equation
                            mode="block"
                            math="\frac{du_i}{dt} = -u_i + \alpha \sum_k p_k^{(i)} \langle p_k, y\rangle + D\,\nabla^2 y_i + \sigma\,\eta_i,\quad y_i = \tanh(g\,u_i)"
                        />
                        <div className="text-sm text-lime-200/80 leading-relaxed">
                            with symmetric, orthonormal templates the deterministic dynamics descend a Lyapunov energy
                        </div>
                        <Equation
                            mode="block"
                            math="E = -\tfrac{\alpha}{2}\sum_k \langle p_k, y\rangle^2 + \tfrac{D}{2}\sum_{\langle i,j\rangle}(y_i - y_j)^2"
                        />
                        <div className="border-l-2 border-lime-500/40 pl-3 text-sm text-lime-200/80 leading-relaxed">
                            stored morphologies are the minima of E. a lesion is a push up an energy hill; regeneration is the
                            roll back down.
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="border border-lime-500/20 p-3">
                            <div className="text-lime-300 font-semibold">arithmetic dynamics</div>
                            <div className="text-lime-200/60 mt-1 leading-relaxed">
                                Silverman&apos;s dictionary: torsion points <Equation math="\leftrightarrow" /> periodic and
                                preperiodic points. iteration forces a point into an exact, discrete orbit.
                            </div>
                        </div>
                        <div className="border border-lime-500/20 p-3">
                            <div className="text-lime-300 font-semibold">evolutionary learning</div>
                            <div className="text-lime-200/60 mt-1 leading-relaxed">
                                Watson: selection reshapes <Equation math="W" /> by Hebbian-like rules, so past targets become
                                developmental attractors with memory and generalisation.
                            </div>
                        </div>
                        <div className="border border-lime-500/20 p-3">
                            <div className="text-lime-300 font-semibold">bioelectric morphogenesis</div>
                            <div className="text-lime-200/60 mt-1 leading-relaxed">
                                Levin: a stored target morphology, held as a bioelectric setpoint, that tissues relax back toward
                                after injury.
                            </div>
                        </div>
                    </div>
                    <div className="border-l-2 border-orange-500/40 pl-3 text-xs text-orange-200/70 leading-relaxed">
                        the analogy is real but graded: the arithmetic orbit is exact and discrete; the biological attractor is
                        approximate, dissipative, and noisy. shared dynamical structure does not establish that biology accesses a
                        pre-existing Platonic realm of forms.
                    </div>
                </div>
            )}

            {tab === 'analysis' && (
                <div className="space-y-6">
                    <div>
                        <div className="text-xs text-lime-200/60 mb-2 font-mono">
                            memory-strength sweep · deterministic recovery of a lesioned vs intact form as alpha grows, holding
                            diffusion and gain fixed · this is the retrieval transition
                        </div>
                        <div style={{ width: '100%', height: 280 }}>
                            <ResponsiveContainer width="100%" height={280} minWidth={0}>
                                <LineChart data={sweep} margin={{ top: 10, right: 20, bottom: 16, left: 10 }}>
                                    <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="memory"
                                        tick={{ fill: '#a3e635', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                        type="number"
                                        domain={[0, 3]}
                                    />
                                    <YAxis
                                        tick={{ fill: '#a3e635', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                        domain={[0, 100]}
                                    />
                                    <ReTooltip
                                        content={
                                            <ChartTooltip
                                                labelFormat={(l) => (typeof l === 'number' ? `α ${l.toFixed(2)}` : String(l))}
                                                valueFormat={(v) => `${Number(v).toFixed(1)}%`}
                                            />
                                        }
                                    />
                                    <ReferenceLine
                                        x={params.memory}
                                        stroke="#a3e635"
                                        strokeDasharray="3 3"
                                        strokeOpacity={0.5}
                                        label={{ value: 'now', fill: '#a3e635', fontSize: 9, position: 'top' }}
                                    />
                                    <Line type="monotone" dataKey="recovery" stroke="#a3e635" strokeWidth={2} dot={false} name="after lesion" />
                                    <Line type="monotone" dataKey="recoveryNoLesion" stroke="#facc15" strokeWidth={1.5} dot={false} name="intact" strokeDasharray="6 3" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-[10px] text-lime-200/40 font-mono mt-1">
                            solid: recovery after a lesion · dashed: intact relaxation · where they coincide, damage is fully repaired
                        </div>
                    </div>

                    <CalibrationPanel results={calibration} outputLabel="regeneration fidelity %" />

                    <AssumptionPanel assumptions={assumptions} />
                </div>
            )}
        </div>
    );
}
