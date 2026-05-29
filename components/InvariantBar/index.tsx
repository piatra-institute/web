'use client';

import React from 'react';


export interface InvariantBarProps {
    label: string;
    /** 0..100 */
    value: number;
    /** 0..100, draws a dashed orange ghost marker if present. */
    saved?: number;
}


/**
 * A `[label · 0-100 lime-fill bar · value]` row used in the "invariants"
 * panel of playground Viewers. When `saved` is provided, an orange dashed
 * vertical marker overlays the bar at that position to compare a saved
 * snapshot against the current run.
 */
export default function InvariantBar({ label, value, saved }: InvariantBarProps) {
    return (
        <div className="grid grid-cols-[140px_1fr_36px] items-center gap-3">
            <div className="text-xs font-mono text-lime-200/70">{label}</div>
            <div className="relative h-4 bg-lime-500/5 border border-lime-500/15">
                <div className="h-full bg-lime-500/60" style={{ width: `${value}%` }} />
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
