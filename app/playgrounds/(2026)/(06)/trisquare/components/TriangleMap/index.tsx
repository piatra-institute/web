'use client';

import React from 'react';

import {
    STATUS_COLOR,
    STATUS_LABEL,
    TRIANGLE_EDGES,
    TRIANGLE_NODES,
    type ClaimStatus,
    type TriangleNode,
} from '../../logic';


const POS: Record<TriangleNode['id'], { x: number; y: number; anchor: 'middle' | 'start' | 'end' }> = {
    qg: { x: 300, y: 70, anchor: 'middle' },
    ps: { x: 120, y: 300, anchor: 'middle' },
    phi4: { x: 480, y: 300, anchor: 'middle' },
};

const NODE_TEXT: Record<TriangleNode['id'], string> = {
    qg: 'QG  (γ→0)',
    ps: 'PS',
    phi4: '‖φ‖₄⁴',
};


export default function TriangleMap() {
    return (
        <div className="space-y-3">
            <svg viewBox="0 0 600 360" className="w-full max-w-[600px] mx-auto">
                {TRIANGLE_EDGES.map((edge) => {
                    const a = POS[edge.from];
                    const b = POS[edge.to];
                    const mx = (a.x + b.x) / 2;
                    const my = (a.y + b.y) / 2;
                    const color = STATUS_COLOR[edge.status];
                    return (
                        <g key={`${edge.from}-${edge.to}`}>
                            <line
                                x1={a.x}
                                y1={a.y}
                                x2={b.x}
                                y2={b.y}
                                stroke={color}
                                strokeWidth={2.5}
                                strokeDasharray={edge.status === 'speculative' ? '7 5' : undefined}
                                strokeOpacity={0.8}
                            />
                            <rect x={mx - 78} y={my - 13} width={156} height={26} fill="#0a0a0a" stroke={color} strokeOpacity={0.5} />
                            <text x={mx} y={my + 4} textAnchor="middle" fontSize={10} fill={color} fontFamily="ui-monospace, monospace">
                                {edge.label}
                            </text>
                        </g>
                    );
                })}

                {TRIANGLE_NODES.map((node) => {
                    const p = POS[node.id];
                    return (
                        <g key={node.id}>
                            <circle cx={p.x} cy={p.y} r={34} fill="#0a0a0a" stroke="#a3e635" strokeWidth={2} />
                            <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize={15} fill="#d9f99d" fontFamily="ui-monospace, monospace">
                                {NODE_TEXT[node.id]}
                            </text>
                        </g>
                    );
                })}
            </svg>

            <div className="flex flex-wrap gap-4 justify-center text-[10px] font-mono">
                {(['exact', 'known', 'speculative'] as ClaimStatus[]).map((s) => (
                    <div key={s} className="flex items-center gap-2">
                        <span className="inline-block w-4 h-0.5" style={{ backgroundColor: STATUS_COLOR[s] }} />
                        <span className="text-lime-200/60">{STATUS_LABEL[s]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
