'use client';

import React from 'react';

import { AuraVector, DIMENSIONS } from '../../logic';


interface AuraGlyphProps {
    auraVector: AuraVector;
    auraIntensity: number;
    snapshotVector?: AuraVector | null;
}

export default function AuraGlyph({
    auraVector,
    auraIntensity,
    snapshotVector,
}: AuraGlyphProps) {
    const center = 200;
    const baseRadius = 50;
    const maxRadius = 130;

    const points = DIMENSIONS.map((d, i) => {
        const angle = (Math.PI * 2 * i) / DIMENSIONS.length - Math.PI / 2;
        const r = baseRadius + (maxRadius - baseRadius) * auraVector[d.key];
        return {
            x: center + Math.cos(angle) * r,
            y: center + Math.sin(angle) * r,
            labelX: center + Math.cos(angle) * (maxRadius + 30),
            labelY: center + Math.sin(angle) * (maxRadius + 30),
            label: d.label,
            value: auraVector[d.key],
        };
    });

    const polygon = points.map((p) => `${p.x},${p.y}`).join(' ');

    const snapshotPoints = snapshotVector
        ? DIMENSIONS.map((d, i) => {
              const angle = (Math.PI * 2 * i) / DIMENSIONS.length - Math.PI / 2;
              const r = baseRadius + (maxRadius - baseRadius) * snapshotVector[d.key];
              return {
                  x: center + Math.cos(angle) * r,
                  y: center + Math.sin(angle) * r,
              };
          })
        : null;
    const snapshotPolygon = snapshotPoints
        ? snapshotPoints.map((p) => `${p.x},${p.y}`).join(' ')
        : null;

    const rings = [0.25, 0.5, 0.75, 1].map((r) =>
        DIMENSIONS.map((_, i) => {
            const angle = (Math.PI * 2 * i) / DIMENSIONS.length - Math.PI / 2;
            const radius = baseRadius + (maxRadius - baseRadius) * r;
            return `${center + Math.cos(angle) * radius},${center + Math.sin(angle) * radius}`;
        }).join(' '),
    );

    return (
        <div className="border border-lime-500/30 bg-[#0a0a0a] p-2">
            <svg viewBox="0 0 400 400" className="w-full h-auto">
                {rings.map((r, i) => (
                    <polygon
                        key={i}
                        points={r}
                        fill="none"
                        stroke="#84cc16"
                        strokeOpacity={0.12}
                        strokeWidth={1}
                    />
                ))}

                {points.map((p, i) => (
                    <line
                        key={i}
                        x1={center}
                        y1={center}
                        x2={center + Math.cos((Math.PI * 2 * i) / DIMENSIONS.length - Math.PI / 2) * maxRadius}
                        y2={center + Math.sin((Math.PI * 2 * i) / DIMENSIONS.length - Math.PI / 2) * maxRadius}
                        stroke="#84cc16"
                        strokeOpacity={0.12}
                    />
                ))}

                {snapshotPolygon && (
                    <polygon
                        points={snapshotPolygon}
                        fill="none"
                        stroke="#f97316"
                        strokeWidth={1.5}
                        strokeDasharray="6 3"
                    />
                )}

                <polygon
                    points={polygon}
                    fill="#84cc16"
                    fillOpacity={0.18}
                    stroke="#a3e635"
                    strokeWidth={2}
                />

                <circle
                    cx={center}
                    cy={center}
                    r={10 + auraIntensity * 28}
                    fill="#84cc16"
                    fillOpacity={0.25}
                />
                <circle cx={center} cy={center} r={4} fill="#a3e635" />

                {points.map((p, i) => (
                    <g key={i}>
                        <circle cx={p.x} cy={p.y} r={3.5} fill="#a3e635" />
                        <text
                            x={p.labelX}
                            y={p.labelY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="11"
                            fill="#a3e635"
                            opacity={0.7}
                            fontFamily="monospace"
                        >
                            {p.label}
                        </text>
                        <text
                            x={p.labelX}
                            y={p.labelY + 12}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="9"
                            fill="#a3e635"
                            opacity={0.4}
                            fontFamily="monospace"
                        >
                            {(p.value * 100).toFixed(0)}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
}
