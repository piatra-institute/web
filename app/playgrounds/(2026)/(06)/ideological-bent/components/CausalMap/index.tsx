'use client';

import React from 'react';


/**
 * Causal sketch: the policy outcome Y is driven by threat, classified signal,
 * agency pressure, legal affordance, and geopolitics, with actor traits as just
 * one input. The point is to stop actor identity from absorbing every cause.
 */
export default function CausalMap() {
    return (
        <svg viewBox="0 0 820 420" width="100%" height="auto" role="img" aria-label="Causal graph" className="max-w-[820px]">
            <defs>
                <marker id="ib-arrowhead" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="rgba(163,230,53,.5)" />
                </marker>
            </defs>

            {[
                { x: 32, y: 42, t: 'Threat severity', s: 'T' },
                { x: 32, y: 172, t: 'Classified signal', s: 'I' },
                { x: 242, y: 42, t: 'Agency pressure', s: 'B' },
                { x: 242, y: 172, t: 'Legal affordance', s: 'L' },
                { x: 242, y: 302, t: 'Geopolitics', s: 'G' },
            ].map((n) => (
                <g key={n.t}>
                    <rect x={n.x} y={n.y} width={150} height={54} rx={2} fill="rgba(163,230,53,.06)" stroke="rgba(163,230,53,.3)" strokeWidth={1.2} />
                    <text x={n.x + 75} y={n.y + 22} textAnchor="middle" fill="#d9f99d" fontSize={12}>{n.t}</text>
                    <text x={n.x + 75} y={n.y + 40} textAnchor="middle" fill="#a3e635" fontSize={12} fontFamily="monospace">{n.s}</text>
                </g>
            ))}

            <rect x={492} y={112} width={158} height={72} rx={2} fill="rgba(250,204,21,.06)" stroke="rgba(250,204,21,.32)" strokeWidth={1.2} />
            <text x={571} y={140} textAnchor="middle" fill="#fde68a" fontSize={12}>Actor traits</text>
            <text x={571} y={160} textAnchor="middle" fill="#a3e635" fontSize={11}>risk, process, allies</text>

            <rect x={616} y={262} width={158} height={72} rx={2} fill="rgba(163,230,53,.1)" stroke="rgba(163,230,53,.4)" strokeWidth={1.2} />
            <text x={695} y={290} textAnchor="middle" fill="#d9f99d" fontSize={12}>Policy outcome</text>
            <text x={695} y={310} textAnchor="middle" fill="#a3e635" fontSize={12} fontFamily="monospace">Y</text>

            {[
                [182, 69, 242, 69],
                [182, 199, 242, 199],
                [392, 69, 500, 124],
                [392, 199, 616, 288],
                [392, 329, 616, 310],
                [571, 184, 664, 262],
                [107, 96, 664, 262],
                [107, 226, 664, 262],
            ].map((l, i) => (
                <line
                    key={i}
                    x1={l[0]}
                    y1={l[1]}
                    x2={l[2]}
                    y2={l[3]}
                    stroke="rgba(163,230,53,.32)"
                    strokeWidth={1.5}
                    markerEnd="url(#ib-arrowhead)"
                />
            ))}
        </svg>
    );
}
