'use client';

import React from 'react';


export interface ChartTooltipPayloadItem {
    value: number;
    name: string;
    color: string;
}

export interface ChartTooltipProps {
    active?: boolean;
    payload?: Array<ChartTooltipPayloadItem>;
    label?: string | number;
    /** Format the title (`label`). Defaults to integer-string for numbers. */
    labelFormat?: (label: string | number) => string;
    /** Format each payload value. Defaults to integer-string. */
    valueFormat?: (value: number) => string;
}


function defaultLabelFormat(label: string | number): string {
    return typeof label === 'number' ? label.toFixed(0) : String(label);
}

function defaultValueFormat(value: number): string {
    return Number(value).toFixed(0);
}


/**
 * Recharts custom-tooltip component styled in the playground lime palette.
 *
 * Used by every playground analysis chart. Format overrides keep each
 * consumer's previous precision identical:
 *
 *   uncare-engine / salience-engine: no override
 *   kerr-causality:    labelFormat l=>Number(l).toFixed(2), valueFormat v=>v.toFixed(3)
 *   audience-attractor: labelFormat l=>Number(l).toFixed(2), valueFormat v=>v.toLocaleString()
 */
export default function ChartTooltip({
    active,
    payload,
    label,
    labelFormat = defaultLabelFormat,
    valueFormat = defaultValueFormat,
}: ChartTooltipProps) {
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
                {label !== undefined ? labelFormat(label) : null}
            </div>
            {payload.map((p, i) => (
                <div key={i}>
                    <span style={{ color: p.color }}>{p.name}</span>: {valueFormat(p.value)}
                </div>
            ))}
        </div>
    );
}
