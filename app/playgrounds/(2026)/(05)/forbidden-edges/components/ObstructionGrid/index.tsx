'use client';

import React from 'react';

import { ActionRatingRow, MORAL_FRAMES, ActionKey } from '../../logic';


interface ObstructionGridProps {
    rows: ActionRatingRow[];
    highlightAction: ActionKey | null;
}

function ratingColor(r: number): string {
    // r in [-1, 1]
    if (r > 0.4) return '#a3e635';        // strong virtue
    if (r > 0.05) return 'rgba(163, 230, 53, 0.55)';
    if (r >= -0.05) return 'rgba(163, 230, 53, 0.18)';
    if (r > -0.4) return 'rgba(251, 146, 60, 0.55)';
    return '#fb923c';
}

export default function ObstructionGrid({ rows, highlightAction }: ObstructionGridProps) {
    return (
        <div className="border border-lime-500/30 bg-[#0a0a0a]">
            <table className="w-full text-xs font-mono">
                <thead>
                    <tr className="text-lime-200/40 text-[10px] uppercase tracking-wide">
                        <th className="text-left p-2">action</th>
                        {MORAL_FRAMES.map((f) => (
                            <th key={f.key} className="p-2 text-center" title={f.description}>
                                {f.label}
                            </th>
                        ))}
                        <th className="text-right p-2">obstruction</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => {
                        const highlighted = highlightAction === row.action;
                        return (
                            <tr
                                key={row.action}
                                className={`border-t border-lime-500/10 ${highlighted ? 'bg-lime-500/8' : ''}`}
                            >
                                <td className="p-2 text-lime-200/80">{row.actionLabel}</td>
                                {row.ratings.map((r) => (
                                    <td key={r.frame} className="p-2 text-center">
                                        <div
                                            className="inline-block w-12 h-5"
                                            style={{ background: ratingColor(r.rating) }}
                                            title={`${r.frame}: ${r.rating.toFixed(2)}`}
                                        />
                                        <div className="text-[9px] text-lime-200/50 mt-0.5">
                                            {r.rating >= 0 ? '+' : ''}{r.rating.toFixed(2)}
                                        </div>
                                    </td>
                                ))}
                                <td className="p-2 text-right">
                                    <span className={
                                        row.consistencyRadius > 0.5 ? 'text-orange-400' :
                                        row.consistencyRadius > 0.3 ? 'text-yellow-400' :
                                        'text-lime-400'
                                    }>
                                        {row.consistencyRadius.toFixed(2)}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
