'use client';

import React from 'react';


export interface MetricDeltaProps {
    label: string;
    current: number;
    saved: number;
    /**
     * Number of decimal places. With `decimals=0` the value is rendered as a
     * thousands-separated integer (e.g. `1,015`). With `decimals>0` the value
     * is rendered with `toFixed(decimals)` (e.g. `1.79`).
     */
    decimals?: number;
    /**
     * Treat values as fractions in [0, 1] and render as percentages.
     */
    isPercent?: boolean;
    /**
     * If true (the default), an upward delta is good (lime). If false, an
     * upward delta is bad (orange).
     */
    higherIsBetter?: boolean;
    /**
     * Threshold below which the arrow shows `=`. When omitted, the default is
     * `0.005` for `isPercent`, `0.005` for `decimals>=2`, scales by decimals
     * for finer precision, otherwise `0.5` for integers.
     */
    eps?: number;
}


/**
 * Single-line "label: value ↑ delta" cell used in playground Settings panels
 * to display before / after deltas against a saved snapshot.
 *
 * Threshold for the arrow / colour is auto-scaled from `decimals` when no
 * explicit `eps` is passed. This keeps each consumer rendering identical
 * output to its previous inlined implementation.
 */
export default function MetricDelta({
    label,
    current,
    saved,
    decimals = 0,
    isPercent = false,
    higherIsBetter = true,
    eps: epsOverride,
}: MetricDeltaProps) {
    const delta = current - saved;
    const eps = epsOverride !== undefined
        ? epsOverride
        : isPercent
            ? 0.005
            : decimals >= 2
                ? 0.005
                : decimals > 0
                    ? Math.pow(10, -decimals) / 2
                    : 0.5;
    const arrow = delta > eps ? '↑' : delta < -eps ? '↓' : '=';
    const positive = higherIsBetter ? delta > eps : delta < -eps;
    const negative = higherIsBetter ? delta < -eps : delta > eps;
    const color = positive
        ? 'text-lime-400'
        : negative
            ? 'text-orange-400'
            : 'text-lime-200/40';
    const fmt = (v: number) =>
        isPercent
            ? `${(v * 100).toFixed(decimals)}%`
            : decimals > 0
                ? v.toFixed(decimals)
                : Math.round(v).toLocaleString();
    return (
        <div className="text-lime-200/60 text-xs font-mono">
            {label}: <span className="text-lime-400">{fmt(current)}</span>{' '}
            <span className={color}>
                {arrow} {fmt(Math.abs(delta))}
            </span>
        </div>
    );
}
