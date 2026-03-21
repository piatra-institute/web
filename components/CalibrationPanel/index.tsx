'use client';

import React, { useState } from 'react';


export interface CalibrationResult {
    name: string;
    description: string;
    predicted: number;
    expected: number;
    source: string;
}

interface CalibrationPanelProps {
    results: CalibrationResult[];
    outputLabel: string;
    onLoadCase?: (name: string) => void;
}

export default function CalibrationPanel({ results, outputLabel, onLoadCase }: CalibrationPanelProps) {
    const [expanded, setExpanded] = useState(false);

    const avgError = results.length
        ? results.reduce((sum, r) => sum + Math.abs(r.expected !== 0 ? (r.predicted - r.expected) / r.expected : 0), 0) / results.length
        : 0;

    return (
        <div className="border border-lime-500/20">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-3 text-xs text-lime-200/60 hover:text-lime-200/80 transition-colors cursor-pointer"
            >
                <span className="font-mono uppercase tracking-wide">
                    calibration · {outputLabel} ({results.length} cases)
                </span>
                <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-mono ${avgError < 0.15 ? 'text-lime-400' : avgError < 0.35 ? 'text-yellow-400' : 'text-orange-400'}`}>
                        avg |error|: {(avgError * 100).toFixed(1)}%
                    </span>
                    <span className="text-lime-200/40">{expanded ? '−' : '+'}</span>
                </div>
            </button>
            {expanded && (
                <div className="border-t border-lime-500/10 p-3">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-lime-200/40 font-mono uppercase tracking-wide text-[10px]">
                                    <th className="text-left p-1.5">case</th>
                                    <th className="text-right p-1.5">predicted</th>
                                    <th className="text-right p-1.5">expected</th>
                                    <th className="text-right p-1.5">error</th>
                                    <th className="text-left p-1.5 pl-3">source</th>
                                    {onLoadCase && <th className="p-1.5"></th>}
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((r) => {
                                    const error = r.predicted - r.expected;
                                    const errorPct = r.expected !== 0 ? (error / r.expected) * 100 : 0;
                                    return (
                                        <tr key={r.name} className="border-t border-lime-500/10">
                                            <td className="p-1.5">
                                                <div className="text-lime-100">{r.name}</div>
                                                <div className="text-[10px] text-lime-200/30 max-w-[200px]">{r.description}</div>
                                            </td>
                                            <td className="text-right p-1.5 font-mono text-lime-400">
                                                {r.predicted.toFixed(3)}
                                            </td>
                                            <td className="text-right p-1.5 font-mono text-lime-200/60">
                                                {r.expected.toFixed(3)}
                                            </td>
                                            <td className="text-right p-1.5 font-mono">
                                                <span className={Math.abs(errorPct) < 15 ? 'text-lime-400' : Math.abs(errorPct) < 35 ? 'text-yellow-400' : 'text-orange-400'}>
                                                    {errorPct >= 0 ? '+' : ''}{errorPct.toFixed(1)}%
                                                </span>
                                            </td>
                                            <td className="p-1.5 pl-3 text-[10px] text-lime-200/30">
                                                {r.source}
                                            </td>
                                            {onLoadCase && (
                                                <td className="p-1.5">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onLoadCase(r.name); }}
                                                        className="text-[10px] font-mono text-lime-400/60 hover:text-lime-400 border border-lime-500/20 hover:border-lime-500/40 px-2 py-0.5 transition-colors cursor-pointer"
                                                    >
                                                        load
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
