'use client';

import React, { useState, useMemo } from 'react';
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
import SensitivityAnalysis, { SensitivityBar } from '@/components/SensitivityAnalysis';
import VersionSelector, { ModelVersion } from '@/components/VersionSelector';

import {
    Params,
    Metrics,
    Snapshot,
    SchoolKey,
    SchoolStrength,
    SweepableParam,
    SweepDatum,
    SCHOOLS,
    PARAM_SPECS,
    searchAuthors,
} from '../../logic';
import CompassDial from '../CompassDial';


type Tab = 'compass' | 'scorecard' | 'schools' | 'authors' | 'analysis';

const TABS: { key: Tab; label: string }[] = [
    { key: 'compass', label: 'compass' },
    { key: 'scorecard', label: 'scorecard' },
    { key: 'schools', label: 'schools' },
    { key: 'authors', label: 'authors' },
    { key: 'analysis', label: 'analysis' },
];

const SCORE_ROWS: { key: keyof Metrics; label: string; higherIsBetter: boolean }[] = [
    { key: 'welfare', label: 'welfare', higherIsBetter: true },
    { key: 'growth', label: 'growth', higherIsBetter: true },
    { key: 'equality', label: 'equality', higherIsBetter: true },
    { key: 'fiscalRepair', label: 'fiscal repair', higherIsBetter: true },
    { key: 'legitimacy', label: 'legitimacy', higherIsBetter: true },
];

interface ViewerProps {
    params: Params;
    metrics: Metrics;
    snapshot: Snapshot | null;
    strengths: SchoolStrength[];
    dominant: { key: SchoolKey; aligned: boolean };
    verdict: string;
    sweepParam: SweepableParam;
    onSweepParamChange: (p: SweepableParam) => void;
    sweep: SweepDatum[];
    sensitivityBars: SensitivityBar[];
    calibration: CalibrationResult[];
    assumptions: Assumption[];
    versions: ModelVersion[];
}

function ChartTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: Array<{ value: number; name: string; color: string }>;
    label?: string | number;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div
            style={{
                background: '#0a0a0a',
                border: '1px solid #84cc16',
                padding: 10,
                color: '#ecfccb',
                fontSize: 11,
            }}
        >
            <div style={{ marginBottom: 4, color: '#a3e635' }}>
                {typeof label === 'number' ? label.toFixed(0) : label}
            </div>
            {payload.map((p, i) => (
                <div key={i}>
                    <span style={{ color: p.color }}>{p.name}</span>:{' '}
                    {Number(p.value).toFixed(0)}
                </div>
            ))}
        </div>
    );
}

function ScoreBar({
    label,
    value,
    saved,
}: {
    label: string;
    value: number;
    saved?: number;
}) {
    return (
        <div className="grid grid-cols-[110px_1fr_36px] items-center gap-3">
            <div className="text-xs font-mono text-lime-200/70">{label}</div>
            <div className="relative h-4 bg-lime-500/5 border border-lime-500/15">
                <div
                    className="h-full bg-lime-500/60"
                    style={{ width: `${value}%` }}
                />
                {saved !== undefined && (
                    <div
                        className="absolute top-0 h-full border-l-2 border-orange-400 border-dashed"
                        style={{ left: `${saved}%` }}
                    />
                )}
            </div>
            <div className="text-right text-xs font-mono text-lime-400">{value}</div>
        </div>
    );
}

export default function Viewer({
    params,
    metrics,
    snapshot,
    strengths,
    dominant,
    verdict,
    sweepParam,
    onSweepParamChange,
    sweep,
    sensitivityBars,
    calibration,
    assumptions,
    versions,
}: ViewerProps) {
    const [tab, setTab] = useState<Tab>('compass');
    const [authorQuery, setAuthorQuery] = useState('');

    const sweepSpec = PARAM_SPECS.find((s) => s.key === sweepParam);
    const sweepLabel = sweepSpec?.label ?? sweepParam;

    const filteredAuthors = useMemo(
        () => searchAuthors(authorQuery),
        [authorQuery],
    );

    const school = SCHOOLS[params.school];

    return (
        <div className="w-[90vw] h-[90vh] max-w-[1100px] overflow-y-auto space-y-6 outline-none [&_*]:outline-none text-lime-100">
            <div className="flex items-center justify-between gap-4">
                <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
            </div>

            <div className="border border-lime-500/30 p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <div className="font-semibold text-sm text-lime-400">
                            {school.label} · {school.rationale}
                        </div>
                        <div className="text-lime-200/60 text-xs mt-1">
                            preset: <span className="text-lime-200/80">{params.preset}</span>
                        </div>
                    </div>
                    <div className="flex gap-6 text-xs font-mono text-lime-200/60">
                        <div>
                            welfare: <span className="text-lime-400">{metrics.welfare}</span>
                        </div>
                        <div>
                            revenue: <span className="text-lime-400">{metrics.revenue}</span>
                        </div>
                        <div>
                            distortion: <span className="text-lime-400">{metrics.distortion}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {SCORE_ROWS.map((r) => (
                    <div key={r.key} className="border border-lime-500/20 p-3">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide">{r.label}</div>
                        <div className="text-lg font-mono text-lime-400 mt-1">{metrics[r.key]}</div>
                    </div>
                ))}
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

            {tab === 'compass' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        each rationale sits at a cardinal point · the lime polygon is how
                        strongly the current world-state supports each one · the needle is
                        their vector sum, the case the situation actually makes for raising
                        taxes
                    </div>
                    <CompassDial
                        strengths={strengths}
                        selectedSchool={params.school}
                        dominant={dominant.key}
                        aligned={dominant.aligned}
                    />
                    <div className="border border-lime-500/30 p-4">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide">
                            current verdict
                        </div>
                        <div className="text-sm text-lime-100 mt-2 leading-relaxed">
                            {verdict}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="border border-lime-500/20 p-3">
                            <div className="text-xs text-lime-200/40 uppercase tracking-wide">revenue index</div>
                            <div className="text-2xl font-mono text-lime-400 mt-1">{metrics.revenue}</div>
                            <div className="text-[10px] text-lime-200/40 mt-1">
                                package scaled by administrative capacity
                            </div>
                        </div>
                        <div className="border border-lime-500/20 p-3">
                            <div className="text-xs text-lime-200/40 uppercase tracking-wide">distortion index</div>
                            <div className="text-2xl font-mono text-lime-400 mt-1">{metrics.distortion}</div>
                            <div className="text-[10px] text-lime-200/40 mt-1">
                                deadweight loss, superlinear in the package
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'scorecard' && (
                <div className="space-y-3">
                    <div className="text-xs text-lime-200/60 font-mono">
                        five outcomes, higher is better · the dashed orange marker is the
                        saved snapshot, if any · legitimacy falls when the package outruns
                        capacity or legitimacy
                    </div>
                    <div className="space-y-3 border border-lime-500/20 p-4">
                        {SCORE_ROWS.map((r) => (
                            <ScoreBar
                                key={r.key}
                                label={r.label}
                                value={metrics[r.key]}
                                saved={snapshot ? snapshot.metrics[r.key] : undefined}
                            />
                        ))}
                    </div>
                    {snapshot && (
                        <div className="text-xs text-orange-300/70 font-mono">
                            saved snapshot: {snapshot.label} · welfare = {snapshot.metrics.welfare} ·
                            growth = {snapshot.metrics.growth} · legitimacy = {snapshot.metrics.legitimacy}
                        </div>
                    )}
                </div>
            )}

            {tab === 'schools' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        each rationale has a different target and a different failure mode
                    </div>
                    <div className="border border-lime-500/30 p-4">
                        <div className="text-sm text-lime-400 font-semibold mb-2">
                            {school.label}
                        </div>
                        <div className="text-sm text-lime-100/80 leading-relaxed">
                            {school.thesis}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="border border-lime-500/20 p-4">
                            <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-2">
                                best-fit taxes
                            </div>
                            <ul className="space-y-1.5 text-sm text-lime-100/80">
                                {school.bestTaxes.map((x) => (
                                    <li key={x}>· {x}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="border border-lime-500/20 p-4">
                            <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-2">
                                main risks
                            </div>
                            <ul className="space-y-1.5 text-sm text-lime-100/80">
                                {school.risks.map((x) => (
                                    <li key={x}>· {x}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="border border-lime-500/20 p-4">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-2">
                            keywords
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {school.keywords.map((x) => (
                                <span
                                    key={x}
                                    className="px-2 py-0.5 text-xs font-mono border border-lime-500/30 text-lime-200/70"
                                >
                                    {x}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {tab === 'authors' && (
                <div className="space-y-3">
                    <div className="text-xs text-lime-200/60 font-mono">
                        19 economists placed under the rationale they are the strongest
                        reference for · search by name, angle, tax instrument, or work
                    </div>
                    <input
                        type="text"
                        value={authorQuery}
                        onChange={(e) => setAuthorQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') setAuthorQuery('');
                        }}
                        placeholder="search authors"
                        className="w-full px-3 py-1.5 text-sm border border-lime-500/30 text-lime-100 appearance-none focus:border-lime-500 focus:outline-none transition-colors [&::placeholder]:!bg-transparent [&::placeholder]:!text-lime-200/40"
                        style={{ backgroundColor: '#000' }}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredAuthors.map((a) => {
                            const active = a.school === params.school;
                            return (
                                <div
                                    key={a.name}
                                    className={`border p-3 transition-colors ${
                                        active
                                            ? 'border-lime-500 bg-lime-500/10'
                                            : 'border-lime-500/20'
                                    }`}
                                >
                                    <div className="flex items-baseline justify-between gap-2">
                                        <div className="text-sm font-semibold text-lime-100">
                                            {a.name}
                                        </div>
                                        <div className="text-[10px] font-mono text-lime-200/50">
                                            {SCHOOLS[a.school].label}
                                        </div>
                                    </div>
                                    <div className="text-xs text-lime-200/60 mt-1">{a.angle}</div>
                                    <div className="text-xs text-lime-300/70 mt-1.5">
                                        {a.signatureTax}
                                    </div>
                                    <div className="text-[10px] text-lime-200/40 mt-1 italic">
                                        {a.keyWork}
                                    </div>
                                </div>
                            );
                        })}
                        {filteredAuthors.length === 0 && (
                            <div className="border border-lime-500/20 p-4 text-sm text-lime-200/50">
                                no authors match that search
                            </div>
                        )}
                    </div>
                </div>
            )}

            {tab === 'analysis' && (
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-lime-200/60 font-mono">sweep</span>
                            <div className="flex gap-1 flex-wrap">
                                {PARAM_SPECS.map((spec) => (
                                    <button
                                        key={spec.key}
                                        onClick={() => onSweepParamChange(spec.key)}
                                        className={`px-2 py-0.5 text-[10px] font-mono border transition-colors cursor-pointer ${
                                            sweepParam === spec.key
                                                ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                                : 'border-lime-500/20 text-lime-200/50 hover:border-lime-500/40'
                                        }`}
                                    >
                                        {spec.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="text-xs text-lime-200/60 mb-2 font-mono">
                            {sweepLabel} sweep · how the five outcomes respond as one input
                            is swept while the rest are held
                        </div>
                        <div style={{ width: '100%', height: 280 }}>
                            <ResponsiveContainer width="100%" height={280} minWidth={0}>
                                <LineChart data={sweep} margin={{ top: 10, right: 20, bottom: 16, left: 10 }}>
                                    <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="sweepValue"
                                        tick={{ fill: '#a3e635', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(v: number) => v.toFixed(0)}
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        tick={{ fill: '#a3e635', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <ReTooltip content={<ChartTooltip />} />
                                    <ReferenceLine
                                        x={params[sweepParam]}
                                        stroke="#a3e635"
                                        strokeDasharray="3 3"
                                        strokeOpacity={0.5}
                                        label={{ value: 'now', fill: '#a3e635', fontSize: 9, position: 'top' }}
                                    />
                                    <Line type="monotone" dataKey="welfare" stroke="#a3e635" strokeWidth={2.5} dot={false} name="welfare" />
                                    <Line type="monotone" dataKey="growth" stroke="#84cc16" strokeWidth={1.5} dot={false} name="growth" strokeDasharray="6 3" />
                                    <Line type="monotone" dataKey="equality" stroke="#65a30d" strokeWidth={1.5} dot={false} name="equality" strokeDasharray="3 3" />
                                    <Line type="monotone" dataKey="fiscalRepair" stroke="#4d7c0f" strokeWidth={1.5} dot={false} name="fiscal repair" strokeDasharray="2 4" />
                                    <Line type="monotone" dataKey="legitimacy" stroke="#f97316" strokeWidth={1.5} dot={false} name="legitimacy" strokeDasharray="5 3" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <SensitivityAnalysis
                        bars={sensitivityBars}
                        baseline={metrics.welfare}
                        outputLabel="welfare"
                    />

                    <CalibrationPanel results={calibration} outputLabel="welfare" />

                    <AssumptionPanel assumptions={assumptions} />
                </div>
            )}
        </div>
    );
}
