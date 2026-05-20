'use client';

import React from 'react';

import {
    LADDER,
    OBJECTS,
    statusOf,
    type ObjectState,
    type Snapshot,
} from '../../logic';


interface SalienceLadderProps {
    focal: ObjectState;
    objectKey: string;
    snapshot: Snapshot | null;
}

const PAD_TOP = 4;
const RUNG_H = 13;
const BAR_X = 28;
const BAR_W = 68;
const RAIL_X = 26;

function rungY(index: number): number {
    return PAD_TOP + (LADDER.length - 1 - index) * RUNG_H;
}

export default function SalienceLadder({
    focal,
    objectKey,
    snapshot,
}: SalienceLadderProps) {
    const status = statusOf(focal);
    const ghost = snapshot ? snapshot.focal : null;
    const obj = OBJECTS[objectKey as keyof typeof OBJECTS];

    const profilePoints = LADDER.map((l) => {
        const y = rungY(l.index) + RUNG_H / 2;
        const x = BAR_X + (BAR_W * focal.rungs[l.index]) / 100;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');

    const climbY = rungY(focal.climb) + RUNG_H / 2;

    return (
        <div className="w-full space-y-4">
            <div className="border border-lime-500/20 p-3">
                <div className="text-[10px] text-lime-200/40 uppercase tracking-wide mb-2">
                    matter to meaning ladder · {obj?.label}
                </div>
                <svg
                    viewBox="0 0 100 112"
                    className="w-full h-auto"
                    style={{ maxHeight: 460 }}
                >
                    {/* ladder spine */}
                    <line
                        x1={RAIL_X}
                        y1={rungY(7) + RUNG_H / 2}
                        x2={RAIL_X}
                        y2={rungY(0) + RUNG_H / 2}
                        stroke="#84cc16"
                        strokeOpacity="0.3"
                        strokeWidth="0.4"
                    />

                    {LADDER.map((l) => {
                        const y0 = rungY(l.index);
                        const act = focal.rungs[l.index];
                        const ghostAct = ghost ? ghost.rungs[l.index] : null;
                        const isClimb = l.index === focal.climb;
                        return (
                            <g key={l.key}>
                                <rect
                                    x={BAR_X}
                                    y={y0 + 1}
                                    width={BAR_W}
                                    height={RUNG_H - 2}
                                    fill={l.color}
                                    fillOpacity="0.07"
                                    stroke={l.color}
                                    strokeOpacity="0.18"
                                    strokeWidth="0.2"
                                />
                                <rect
                                    x={BAR_X}
                                    y={y0 + 1}
                                    width={(BAR_W * act) / 100}
                                    height={RUNG_H - 2}
                                    fill={l.color}
                                    fillOpacity={isClimb ? 0.62 : 0.34}
                                />
                                {ghostAct !== null && (
                                    <rect
                                        x={BAR_X}
                                        y={y0 + 1}
                                        width={(BAR_W * ghostAct) / 100}
                                        height={RUNG_H - 2}
                                        fill="none"
                                        stroke="#f97316"
                                        strokeOpacity="0.7"
                                        strokeWidth="0.35"
                                        strokeDasharray="1.2 0.8"
                                    />
                                )}
                                <text
                                    x={2}
                                    y={y0 + RUNG_H / 2 - 0.6}
                                    fontSize="2.5"
                                    fill={l.color}
                                    fillOpacity="0.95"
                                    fontWeight="600"
                                >
                                    {l.index} {l.title}
                                </text>
                                <text
                                    x={2}
                                    y={y0 + RUNG_H / 2 + 2.6}
                                    fontSize="1.9"
                                    fill="#a3e635"
                                    fillOpacity="0.4"
                                >
                                    {l.formula}
                                </text>
                                <text
                                    x={BAR_X + BAR_W - 0.5}
                                    y={y0 + RUNG_H / 2 + 1}
                                    fontSize="2.3"
                                    fill={l.color}
                                    fillOpacity="0.85"
                                    textAnchor="end"
                                >
                                    {act}
                                </text>
                            </g>
                        );
                    })}

                    {/* activation profile */}
                    <polyline
                        points={profilePoints}
                        fill="none"
                        stroke={status.color}
                        strokeOpacity="0.85"
                        strokeWidth="0.5"
                    />
                    {LADDER.map((l) => {
                        const y = rungY(l.index) + RUNG_H / 2;
                        const x = BAR_X + (BAR_W * focal.rungs[l.index]) / 100;
                        return (
                            <circle
                                key={`p-${l.key}`}
                                cx={x}
                                cy={y}
                                r={0.7}
                                fill={status.color}
                            />
                        );
                    })}

                    {/* climb head on the spine */}
                    <circle
                        cx={RAIL_X}
                        cy={climbY}
                        r={2.4}
                        fill={status.color}
                    />
                    <circle
                        cx={RAIL_X}
                        cy={climbY}
                        r={3.8}
                        fill="none"
                        stroke={status.color}
                        strokeOpacity="0.5"
                        strokeWidth="0.3"
                    />
                    {ghost && ghost.climb !== focal.climb && (
                        <circle
                            cx={RAIL_X}
                            cy={rungY(ghost.climb) + RUNG_H / 2}
                            r={2}
                            fill="none"
                            stroke="#f97316"
                            strokeWidth="0.45"
                            strokeDasharray="1 0.6"
                        />
                    )}
                </svg>

                <div className="grid grid-cols-3 gap-3 mt-2 text-xs">
                    <div className="text-lime-200/60">
                        salience: <span className="text-lime-400 font-mono">{focal.salience}</span>
                    </div>
                    <div className="text-lime-200/60">
                        climb: <span className="text-lime-400 font-mono">{focal.climb} / 7</span>
                    </div>
                    <div className="text-lime-200/60">
                        over-salience: <span className="text-lime-400 font-mono">{focal.overSalience}</span>
                    </div>
                </div>
            </div>

            <div className="border border-lime-500/20 p-3">
                <div className="text-[10px] text-lime-200/40 uppercase tracking-wide mb-2">
                    current status
                </div>
                <div className="text-lg font-semibold mb-1" style={{ color: status.color }}>
                    {status.title}
                </div>
                <div className="text-xs text-lime-200/70 italic mb-3">{status.label}</div>
                <div className="text-sm text-lime-200/80 leading-relaxed">
                    {status.description}
                </div>
                <div
                    className="border-l-2 mt-4 pl-3 py-1"
                    style={{ borderColor: `${status.color}66` }}
                >
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide mb-1">
                        best response
                    </div>
                    <div className="text-xs text-lime-200/80 leading-relaxed">
                        {status.intervention}
                    </div>
                </div>
            </div>
        </div>
    );
}
