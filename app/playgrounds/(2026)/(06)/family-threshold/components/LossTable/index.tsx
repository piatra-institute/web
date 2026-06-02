'use client';

import React from 'react';

import { ACTION_LABELS, type ActionLoss } from '../../logic';


interface LossTableProps {
    losses: ActionLoss[];
    chosen: string;
}


export default function LossTable({ losses, chosen }: LossTableProps) {
    if (losses.length === 0) {
        return (
            <div className="border border-lime-500/20 p-3 text-xs text-lime-200/50">
                no action losses yet · run the simulation
            </div>
        );
    }

    return (
        <div className="border border-lime-500/20">
            <div className="grid grid-cols-[160px_80px_1fr] gap-2 px-3 py-2 border-b border-lime-500/20 text-[10px] uppercase tracking-wide text-lime-200/40">
                <div>action</div>
                <div className="text-right">loss</div>
                <div>why</div>
            </div>
            {losses.map((row) => {
                const isChosen = row.action === chosen;
                const cls = row.loss > 100 ? 'text-orange-400' : row.loss < 4 ? 'text-lime-400' : row.loss < 9 ? 'text-yellow-400' : 'text-orange-400';
                return (
                    <div
                        key={row.action}
                        className={`grid grid-cols-[160px_80px_1fr] gap-2 px-3 py-2 border-b border-lime-500/10 last:border-b-0 items-start ${
                            isChosen ? 'bg-lime-500/10' : ''
                        }`}
                    >
                        <div className={`text-sm ${isChosen ? 'text-lime-400 font-semibold' : 'text-lime-100/80'}`}>
                            {ACTION_LABELS[row.action]}
                        </div>
                        <div className={`text-right text-sm font-mono ${cls}`}>
                            {row.loss > 100 ? 'n/a' : row.loss.toFixed(2)}
                        </div>
                        <div className="text-[11px] text-lime-200/60 leading-snug">
                            {row.explanation}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
