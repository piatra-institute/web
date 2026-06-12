'use client';

import React, { useState } from 'react';
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
    ACTION_TRANSLATION,
    PRESET_DESCRIPTIONS,
    STATUS_COLOR,
    STATUS_LABEL,
    STATUS_LEDGER,
    TRIANGLE_EDGES,
    TRIANGLE_NODES,
    type Metrics,
    type ModelResult,
    type Params,
    type SweepDatum,
    type TermStatus,
} from '../../logic';
import TriangleMap from '../TriangleMap';
import Heatmap from '../Heatmap';


type Tab = 'triangle' | 'conformal' | 'ward' | 'flow' | 'analysis';

const TABS: { key: Tab; label: string }[] = [
    { key: 'triangle', label: 'triangle' },
    { key: 'conformal', label: 'conformal' },
    { key: 'ward', label: 'ward' },
    { key: 'flow', label: 'flow' },
    { key: 'analysis', label: 'analysis' },
];

const TERM_STATUS_COLOR: Record<TermStatus, string> = {
    kept: 'text-lime-400 border-lime-500/40',
    merged: 'text-yellow-400 border-yellow-500/40',
    removed: 'text-orange-400/70 border-orange-500/30 line-through',
};


interface ViewerProps {
    params: Params;
    result: ModelResult;
    metrics: Metrics;
    sweep: SweepDatum[];
    calibration: CalibrationResult[];
    assumptions: Assumption[];
    versions: ModelVersion[];
}


export default function Viewer({
    params,
    result,
    metrics,
    sweep,
    calibration,
    assumptions,
    versions,
}: ViewerProps) {
    const [tab, setTab] = useState<Tab>('triangle');
    const { field, ward, rg } = result;

    return (
        <div className="w-[90vw] h-[90vh] max-w-[1100px] overflow-y-auto space-y-6 outline-none [&_*]:outline-none text-lime-100">
            <div className="flex items-center justify-between gap-4">
                <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
            </div>

            <div className="border border-lime-500/30 p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <div className="font-semibold text-sm text-lime-400">
                            {PRESET_DESCRIPTIONS[params.preset].label}
                        </div>
                        <div className="text-lime-200/60 text-xs mt-1 italic">
                            {PRESET_DESCRIPTIONS[params.preset].expectation}
                        </div>
                    </div>
                    <div className="flex gap-6 text-xs font-mono text-lime-200/60">
                        <div>peak |K|: <span className="text-lime-400">{metrics.maxAbsK.toFixed(2)}</span></div>
                        <div>int K: <span className="text-lime-400">{metrics.integralK.toFixed(2)}</span></div>
                        <div>couplings: <span className="text-lime-400">{metrics.independentCouplings}</span></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">peak Omega</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">{metrics.peakOmega.toFixed(2)}</div>
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">min Omega</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">{metrics.minOmega.toFixed(2)}</div>
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">mean |K|</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">{metrics.meanAbsK.toFixed(2)}</div>
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">Weyl</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">0</div>
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">terms cut</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">{ward.removed}</div>
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">pole t*</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">
                        {Number.isFinite(metrics.landauPole) ? metrics.landauPole.toFixed(1) : '∞'}
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

            {tab === 'triangle' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        the correspondence as a map: three theories, with every edge tagged by how solid the link is
                    </div>
                    <TriangleMap />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {TRIANGLE_NODES.map((node) => (
                            <div key={node.id} className="border border-lime-500/20 p-3 space-y-2">
                                <Equation math={node.latex} />
                                <div className="text-sm text-lime-300">{node.label}</div>
                                <div className="text-[11px] text-lime-200/60 leading-relaxed">{node.blurb}</div>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2">
                        {TRIANGLE_EDGES.map((edge) => (
                            <div key={`${edge.from}-${edge.to}`} className="border border-lime-500/20 p-3">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="text-[10px] font-mono px-2 py-0.5 border"
                                        style={{ color: STATUS_COLOR[edge.status], borderColor: STATUS_COLOR[edge.status] }}
                                    >
                                        {STATUS_LABEL[edge.status]}
                                    </span>
                                    <span className="text-xs text-lime-300 font-mono">{edge.label}</span>
                                </div>
                                <div className="text-[11px] text-lime-200/60 leading-relaxed mt-2">{edge.note}</div>
                            </div>
                        ))}
                    </div>
                    <div className="border border-lime-500/30 p-4 space-y-2">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide">status ledger</div>
                        {STATUS_LEDGER.map((item) => (
                            <div key={item.claim} className="grid grid-cols-[120px_1fr] gap-3 items-start border-t border-lime-500/10 pt-2 first:border-t-0 first:pt-0">
                                <span
                                    className="text-[10px] font-mono"
                                    style={{ color: STATUS_COLOR[item.status] }}
                                >
                                    {STATUS_LABEL[item.status]}
                                </span>
                                <div>
                                    <div className="text-xs text-lime-100/90">{item.claim}</div>
                                    <div className="text-[10px] text-lime-200/40 mt-0.5 leading-relaxed">{item.detail}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === 'conformal' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        the conformally flat sector: the entire metric is one scalar field, the conformal factor
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Heatmap grid={field.omega} diverging={false} title="conformal factor Omega(x, y)" subtitle="dark low, lime high" />
                        <Heatmap grid={field.curvature} diverging title="Gaussian curvature K(x, y)" subtitle="orange negative, lime positive" />
                    </div>
                    <div className="border border-lime-500/30 p-4 space-y-3">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide">geometry as one scalar field</div>
                        <Equation mode="block" math="g_{\mu\nu}(x) = \Omega^2(x)\,\eta_{\mu\nu}, \qquad \Omega(x) = e^{\phi(x)}" />
                        <div className="text-sm text-lime-200/80 leading-relaxed">
                            on the 2D slice the curvature is read straight off the conformal factor:
                        </div>
                        <Equation mode="block" math="K = -\,\Omega^{-2}\,\Delta \ln \Omega, \qquad R = 2K" />
                        <div className="border-l-2 border-lime-500/40 pl-3">
                            <div className="text-sm text-lime-200/80 leading-relaxed">
                                the Weyl tensor vanishes, <Equation math="C_{\mu\nu\rho\sigma} = 0" />, so there is no free spin-2
                                gravitational field here. that is exactly what makes this sector look like a scalar theory,
                                and exactly what it leaves out.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'ward' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        symmetry as a compression algorithm on theory space: each Ward identity deletes or merges terms
                    </div>
                    <Equation mode="block" math="\mathcal{L} = \lambda\,\varphi^4 + (\partial\varphi)^2 + m^2\varphi^2 + M_P^2 R + \Lambda + \alpha R^2 + C_{\mu\nu\rho\sigma}^2 + (\partial_t\varphi)^2" />
                    <div className="grid grid-cols-3 gap-3">
                        <div className="border border-lime-500/20 p-3 text-center">
                            <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">kept</div>
                            <div className="text-lg font-mono text-lime-400 mt-1">{ward.kept}</div>
                        </div>
                        <div className="border border-lime-500/20 p-3 text-center">
                            <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">merged</div>
                            <div className="text-lg font-mono text-yellow-400 mt-1">{ward.merged}</div>
                        </div>
                        <div className="border border-lime-500/20 p-3 text-center">
                            <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">removed</div>
                            <div className="text-lg font-mono text-orange-400 mt-1">{ward.removed}</div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {ward.verdicts.map((v) => (
                            <div key={v.term.id} className={`border p-3 ${TERM_STATUS_COLOR[v.status].split(' ').slice(1).join(' ')}`}>
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                    <div className="flex items-center gap-3">
                                        <span className={TERM_STATUS_COLOR[v.status].split(' ')[0]}>
                                            <Equation math={v.term.latex} />
                                        </span>
                                        <span className="text-xs text-lime-200/70">{v.term.label}</span>
                                    </div>
                                    <span className={`text-[10px] font-mono uppercase ${TERM_STATUS_COLOR[v.status].split(' ')[0]}`}>
                                        {v.status}
                                    </span>
                                </div>
                                <div className="text-[11px] text-lime-200/50 mt-1 leading-relaxed">{v.reason}</div>
                            </div>
                        ))}
                    </div>
                    <div className="border border-lime-500/20 p-3 text-xs text-lime-200/60 leading-relaxed">
                        the claim that the Ward identity restricts the form of the Lagrangian in the UV is shown
                        here as a checklist: toggling symmetries on the left thins this list. real Ward identities are
                        constraints on correlation functions, so this is a schematic, not a derivation.
                    </div>
                </div>
            )}

            {tab === 'flow' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        the one-loop phi-fourth coupling runs to a Landau pole; this is why a single dimensionless coupling matters
                    </div>
                    <Equation mode="block" math="\frac{d\lambda}{d\ln\mu} = \frac{3\lambda^2}{16\pi^2}" />
                    <div style={{ width: '100%', height: 280 }}>
                        <ResponsiveContainer width="100%" height={280} minWidth={0}>
                            <LineChart data={rg} margin={{ top: 10, right: 20, bottom: 16, left: 10 }}>
                                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="t"
                                    tick={{ fill: '#a3e635', fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={false}
                                    label={{ value: 't = ln(mu / mu0)', fill: '#a3e635', fontSize: 10, position: 'insideBottom', offset: -6 }}
                                />
                                <YAxis
                                    tick={{ fill: '#a3e635', fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <ReTooltip
                                    content={
                                        <ChartTooltip
                                            labelFormat={(l) => (typeof l === 'number' ? `t = ${l.toFixed(1)}` : String(l))}
                                            valueFormat={(v) => Number(v).toFixed(3)}
                                        />
                                    }
                                />
                                {Number.isFinite(metrics.landauPole) && (
                                    <ReferenceLine
                                        x={Number(metrics.landauPole.toFixed(1))}
                                        stroke="#f97316"
                                        strokeDasharray="4 3"
                                        label={{ value: 'Landau pole', fill: '#f97316', fontSize: 9, position: 'top' }}
                                    />
                                )}
                                <Line type="monotone" dataKey="lambda" stroke="#a3e635" strokeWidth={2} dot={false} name="lambda" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="border border-lime-500/30 p-4 space-y-2">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide">action translator</div>
                        <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 text-[10px] uppercase tracking-wide text-lime-200/40 border-b border-lime-500/20 pb-1">
                            <div>term</div>
                            <div>gravity side</div>
                            <div>scalar side</div>
                        </div>
                        {ACTION_TRANSLATION.map((row) => (
                            <div key={row.term} className="grid grid-cols-[1fr_1fr_1fr] gap-2 items-center border-b border-lime-500/10 last:border-b-0 py-1">
                                <div className="text-xs text-lime-200/70">{row.term}</div>
                                <div><Equation math={row.gravity} /></div>
                                <div className="text-xs text-lime-200/70">{row.scalar}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === 'analysis' && (
                <div className="space-y-6">
                    <div>
                        <div className="text-xs text-lime-200/60 mb-2 font-mono">
                            amplitude sweep: how the peak and mean curvature of this preset grow as the deformation amplitude increases
                        </div>
                        <div style={{ width: '100%', height: 280 }}>
                            <ResponsiveContainer width="100%" height={280} minWidth={0}>
                                <LineChart data={sweep} margin={{ top: 10, right: 20, bottom: 16, left: 10 }}>
                                    <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="amplitude"
                                        tick={{ fill: '#a3e635', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: '#a3e635', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                        domain={[0, 'dataMax']}
                                    />
                                    <ReTooltip
                                        content={
                                            <ChartTooltip
                                                labelFormat={(l) => (typeof l === 'number' ? `A = ${l.toFixed(2)}` : String(l))}
                                                valueFormat={(v) => Number(v).toFixed(3)}
                                            />
                                        }
                                    />
                                    <ReferenceLine
                                        x={Number(params.amplitude.toFixed(2))}
                                        stroke="#a3e635"
                                        strokeDasharray="3 3"
                                        strokeOpacity={0.5}
                                        label={{ value: 'now', fill: '#a3e635', fontSize: 9, position: 'top' }}
                                    />
                                    <Line type="monotone" dataKey="maxAbsK" stroke="#a3e635" strokeWidth={2} dot={false} name="peak |K|" />
                                    <Line type="monotone" dataKey="meanAbsK" stroke="#facc15" strokeWidth={1.5} dot={false} name="mean |K|" strokeDasharray="6 3" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <CalibrationPanel results={calibration} outputLabel="Gaussian curvature at origin" />

                    <AssumptionPanel assumptions={assumptions} />
                </div>
            )}
        </div>
    );
}
