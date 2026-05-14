'use client';

import React, { useMemo } from 'react';

import {
    SchoolKey,
    SchoolStrength,
    SCHOOLS,
} from '../../logic';


// Each rationale sits at a cardinal point. The needle is the vector sum of
// how strongly the current world-state supports each one, so it points at
// the case the situation actually makes for raising taxes, independent of
// the school the user has selected.
const ANGLES: Record<SchoolKey, number> = {
    'redistribution': -Math.PI / 2, // north
    'state-capacity': 0,            // east
    'consolidation': Math.PI / 2,   // south
    'corrective': Math.PI,          // west
};

interface CompassDialProps {
    strengths: SchoolStrength[];
    selectedSchool: SchoolKey;
    dominant: SchoolKey;
    aligned: boolean;
}

export default function CompassDial({
    strengths,
    selectedSchool,
    dominant,
    aligned,
}: CompassDialProps) {
    const size = 320;
    const center = size / 2;
    const maxRadius = 116;

    const strengthMap = useMemo(() => {
        const m = {} as Record<SchoolKey, number>;
        strengths.forEach((s) => {
            m[s.key] = s.strength;
        });
        return m;
    }, [strengths]);

    const needle = useMemo(() => {
        let x = 0;
        let y = 0;
        strengths.forEach((s) => {
            const a = ANGLES[s.key];
            x += Math.cos(a) * s.strength;
            y += Math.sin(a) * s.strength;
        });
        // average so a single saturated school gives a full-length needle
        x /= 2;
        y /= 2;
        const mag = Math.min(1, Math.hypot(x, y));
        const ang = Math.atan2(y, x);
        return {
            x: center + Math.cos(ang) * mag * maxRadius,
            y: center + Math.sin(ang) * mag * maxRadius,
            mag,
        };
    }, [strengths, center]);

    const points = (Object.keys(ANGLES) as SchoolKey[]).map((key) => {
        const a = ANGLES[key];
        const strength = strengthMap[key] ?? 0;
        return {
            key,
            angle: a,
            strength,
            tipX: center + Math.cos(a) * strength * maxRadius,
            tipY: center + Math.sin(a) * strength * maxRadius,
            labelX: center + Math.cos(a) * (maxRadius + 26),
            labelY: center + Math.sin(a) * (maxRadius + 26),
        };
    });

    const polygon = points
        .map((p) => `${p.tipX.toFixed(2)},${p.tipY.toFixed(2)}`)
        .join(' ');

    return (
        <div className="flex flex-col items-center gap-3">
            <svg
                viewBox={`0 0 ${size} ${size}`}
                className="w-full max-w-[360px]"
                role="img"
                aria-label="Fiscal compass dial"
            >
                {/* rings */}
                {[0.25, 0.5, 0.75, 1].map((r) => (
                    <circle
                        key={r}
                        cx={center}
                        cy={center}
                        r={r * maxRadius}
                        fill="none"
                        stroke="#1f2a12"
                        strokeWidth={1}
                    />
                ))}
                {/* cardinal axes */}
                {points.map((p) => (
                    <line
                        key={`axis-${p.key}`}
                        x1={center}
                        y1={center}
                        x2={center + Math.cos(p.angle) * maxRadius}
                        y2={center + Math.sin(p.angle) * maxRadius}
                        stroke="#1f2a12"
                        strokeWidth={1}
                    />
                ))}

                {/* strength polygon */}
                <polygon
                    points={polygon}
                    fill="#84cc16"
                    fillOpacity={0.12}
                    stroke="#84cc16"
                    strokeOpacity={0.5}
                    strokeWidth={1.5}
                />

                {/* strength tips */}
                {points.map((p) => {
                    const isSelected = p.key === selectedSchool;
                    const isDominant = p.key === dominant;
                    return (
                        <g key={`pt-${p.key}`}>
                            <circle
                                cx={p.tipX}
                                cy={p.tipY}
                                r={isDominant ? 5 : 3.5}
                                fill={isDominant ? '#a3e635' : '#65a30d'}
                            />
                            <text
                                x={p.labelX}
                                y={p.labelY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="font-mono"
                                fontSize={10}
                                fill={isSelected ? '#a3e635' : '#84cc16'}
                                fillOpacity={isSelected ? 1 : 0.6}
                            >
                                {SCHOOLS[p.key].label}
                            </text>
                            <text
                                x={p.labelX}
                                y={p.labelY + 12}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="font-mono"
                                fontSize={9}
                                fill="#65a30d"
                            >
                                {(p.strength * 100).toFixed(0)}
                            </text>
                        </g>
                    );
                })}

                {/* needle */}
                <line
                    x1={center}
                    y1={center}
                    x2={needle.x}
                    y2={needle.y}
                    stroke="#a3e635"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                />
                <circle cx={needle.x} cy={needle.y} r={4.5} fill="#a3e635" />
                <circle cx={center} cy={center} r={3} fill="#84cc16" />
            </svg>

            <div className="text-xs font-mono text-lime-200/60 text-center">
                the situation points at{' '}
                <span className="text-lime-400">{SCHOOLS[dominant].label}</span>
                {aligned ? (
                    <span className="text-lime-400"> · your rationale agrees</span>
                ) : (
                    <span className="text-orange-400">
                        {' '}· you have selected {SCHOOLS[selectedSchool].label}
                    </span>
                )}
            </div>
        </div>
    );
}
