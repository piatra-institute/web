'use client';

import React, { useMemo } from 'react';
import {
    ComposedChart,
    LineChart,
    Line,
    Scatter,
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
    ANIMALS,
    KLEIBER_EXPONENT,
    SURFACE_EXPONENT,
    bestFit,
    metabolicRate,
    type Metrics,
    type Params,
    type SweepDatum,
} from '../../logic';


interface ViewerProps {
    params: Params;
    metrics: Metrics;
    sweep: SweepDatum[];
    calibration: CalibrationResult[];
    assumptions: Assumption[];
    versions: ModelVersion[];
}


export default function Viewer({
    params,
    metrics,
    sweep,
    calibration,
    assumptions,
    versions,
}: ViewerProps) {
    const points = useMemo(
        () =>
            [...ANIMALS]
                .sort((a, b) => a.mass - b.mass)
                .map((a) => ({
                    name: a.name,
                    mass: a.mass,
                    measured: a.bmr,
                    predicted: Number(metabolicRate(a.mass, params.coefficient, params.exponent).toFixed(3)),
                })),
        [params.coefficient, params.exponent],
    );

    const fit = useMemo(() => bestFit(), []);

    return (
        <div className="w-[90vw] h-[90vh] max-w-[1100px] overflow-y-auto space-y-6 outline-none [&_*]:outline-none text-lime-100">
            <div className="flex items-center justify-between gap-4">
                <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
            </div>

            <div className="border border-lime-500/30 p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <div className="font-semibold text-sm text-lime-400">metabolic rate vs body mass</div>
                        <div className="text-lime-200/60 text-xs mt-1">
                            B = B0 M^a across ten animals · on log-log axes the exponent is the slope
                        </div>
                    </div>
                    <div className="flex gap-6 text-xs font-mono text-lime-200/60">
                        <div>exponent: <span className="text-lime-400">{params.exponent.toFixed(2)}</span></div>
                        <div>error: <span className="text-lime-400">{metrics.mape.toFixed(0)}%</span></div>
                        <div>log R<sup>2</sup>: <span className="text-lime-400">{metrics.r2.toFixed(2)}</span></div>
                    </div>
                </div>
            </div>

            <div>
                <div className="text-xs text-lime-200/60 mb-2 font-mono">
                    measured basal metabolic rate (points) vs the tuned power law (line) · both axes logarithmic
                </div>
                <div style={{ width: '100%', height: 360 }}>
                    <ResponsiveContainer width="100%" height={360} minWidth={0}>
                        <ComposedChart data={points} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                            <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                            <XAxis
                                dataKey="mass"
                                type="number"
                                scale="log"
                                domain={[0.01, 6000]}
                                ticks={[0.01, 0.1, 1, 10, 100, 1000]}
                                tick={{ fill: '#a3e635', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                label={{ value: 'body mass (kg)', fill: '#a3e635', fontSize: 10, position: 'insideBottom', dy: 12 }}
                            />
                            <YAxis
                                type="number"
                                scale="log"
                                domain={[0.1, 3000]}
                                ticks={[0.1, 1, 10, 100, 1000]}
                                tick={{ fill: '#a3e635', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <ReTooltip
                                content={
                                    <ChartTooltip
                                        labelFormat={(l) => `${Number(l)} kg`}
                                        valueFormat={(v) => `${Number(v).toFixed(1)} W`}
                                    />
                                }
                            />
                            <Line type="monotone" dataKey="predicted" stroke="#facc15" strokeWidth={2} dot={false} name="model" />
                            <Scatter dataKey="measured" fill="#a3e635" name="measured" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div>
                <div className="text-xs text-lime-200/60 mb-2 font-mono">
                    fit error vs exponent, coefficient held fixed · the minimum is the data best fit; the 2/3 and 3/4 references straddle it
                </div>
                <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer width="100%" height={280} minWidth={0}>
                        <LineChart data={sweep} margin={{ top: 10, right: 20, bottom: 16, left: 10 }}>
                            <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                            <XAxis
                                dataKey="exponent"
                                type="number"
                                domain={[0.5, 1.1]}
                                tick={{ fill: '#a3e635', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis tick={{ fill: '#a3e635', fontSize: 10 }} tickLine={false} axisLine={false} />
                            <ReTooltip
                                content={
                                    <ChartTooltip
                                        labelFormat={(l) => `a ${Number(l).toFixed(3)}`}
                                        valueFormat={(v) => Number(v).toFixed(3)}
                                    />
                                }
                            />
                            <ReferenceLine x={SURFACE_EXPONENT} stroke="#f97316" strokeDasharray="3 3" strokeOpacity={0.6} label={{ value: '2/3', fill: '#f97316', fontSize: 9, position: 'top' }} />
                            <ReferenceLine x={KLEIBER_EXPONENT} stroke="#a3e635" strokeDasharray="3 3" strokeOpacity={0.6} label={{ value: '3/4', fill: '#a3e635', fontSize: 9, position: 'top' }} />
                            <ReferenceLine x={params.exponent} stroke="#facc15" strokeDasharray="2 2" strokeOpacity={0.7} label={{ value: 'now', fill: '#facc15', fontSize: 9, position: 'top' }} />
                            <Line type="monotone" dataKey="rmseLog" stroke="#a3e635" strokeWidth={2} dot={false} name="log error" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="text-[10px] text-lime-200/40 font-mono mt-1">
                    ordinary least squares on the log-log data gives exponent {fit.exponent.toFixed(3)}, coefficient {fit.coefficient.toFixed(2)} W
                </div>
            </div>

            <div className="border border-lime-500/30 p-4 space-y-3">
                <div className="text-sm text-lime-200/80 leading-relaxed">a power law is a straight line in log-log coordinates:</div>
                <Equation mode="block" math="B = B_0\,M^{a} \quad\Longleftrightarrow\quad \log B = \log B_0 + a\,\log M" />
                <div className="text-sm text-lime-200/80 leading-relaxed">
                    so the exponent a is the slope. Kleiber found a near three quarters; the surface-to-volume argument predicts two thirds.
                </div>
            </div>

            <CalibrationPanel results={calibration} outputLabel="basal metabolic rate (W)" />

            <AssumptionPanel assumptions={assumptions} />
        </div>
    );
}
