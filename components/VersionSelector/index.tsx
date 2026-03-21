'use client';

import React from 'react';


export interface ModelVersion {
    id: string;
    llm: string;
    date: string;
    description: string;
}

interface VersionSelectorProps {
    versions: ModelVersion[];
    active: string;
    onSelect?: (id: string) => void;
}

export default function VersionSelector({ versions, active, onSelect }: VersionSelectorProps) {
    const current = versions.find(v => v.id === active);

    if (versions.length <= 1) {
        return current ? (
            <div className="flex items-center gap-3 text-[10px] font-mono text-lime-200/40">
                <span className="border border-lime-500/20 px-1.5 py-0.5 text-lime-200/60">{current.llm}</span>
                <span>{current.date}</span>
                <span>&middot;</span>
                <span>{current.description}</span>
            </div>
        ) : null;
    }

    return (
        <div className="flex items-center gap-2">
            {versions.map((v) => (
                <button
                    key={v.id}
                    onClick={() => onSelect?.(v.id)}
                    className={`py-1 px-2 text-[10px] font-mono border transition-colors cursor-pointer ${
                        v.id === active
                            ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                            : 'border-lime-500/20 text-lime-200/40 hover:border-lime-500/40'
                    }`}
                >
                    {v.llm}
                </button>
            ))}
            {current && (
                <span className="text-[10px] font-mono text-lime-200/30 ml-2">
                    {current.date} &middot; {current.description}
                </span>
            )}
        </div>
    );
}
