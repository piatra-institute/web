'use client';

import React from 'react';


export interface ChangelogEntry {
    version: string;
    date: string;
    changes: string[];
}

interface ModelChangelogProps {
    entries: ChangelogEntry[];
}

export default function ModelChangelog({ entries }: ModelChangelogProps) {
    return (
        <div className="space-y-4">
            {entries.map((entry) => (
                <div key={entry.version} className="border-l-2 border-lime-500/20 pl-3">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-lime-400">{entry.version}</span>
                        <span className="text-[10px] font-mono text-lime-200/40">{entry.date}</span>
                    </div>
                    <ul className="space-y-1">
                        {entry.changes.map((change, i) => (
                            <li key={i} className="text-xs text-lime-200/60 leading-relaxed">
                                {change}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
