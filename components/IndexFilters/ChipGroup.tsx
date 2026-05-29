'use client';

import React from 'react';

import { selectedStyle, unselectedStyle, disabledStyle, focusRing } from './styles';


export interface ChipOption {
    key: string;
    label: string;
    description?: string;
    question?: string;
}


interface ChipGroupProps {
    label: string;                  // e.g. 'topic', 'kind', 'operation'
    options: ChipOption[];
    available: Set<string>;         // keys that pass the other active filters
    selected: Set<string>;
    onToggle: (key: string) => void;
    onClear: () => void;
}

export default function ChipGroup({
    label,
    options,
    available,
    selected,
    onToggle,
    onClear,
}: ChipGroupProps) {
    const hasSelection = selected.size > 0;
    return (
        <div className="flex flex-col gap-1.5">
            {/* relative wrapper so the × can absolutely overlay at the right
                edge without nudging the centred label. always rendered with
                opacity-0 so there is no layout shift when chips clear. */}
            <div className="relative">
                <span className="text-xs text-gray-500 text-center block">{label}</span>
                <button
                    type="button"
                    onClick={onClear}
                    aria-label={`clear ${label}`}
                    tabIndex={hasSelection ? 0 : -1}
                    aria-hidden={!hasSelection}
                    className={`absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-xs leading-none text-lime-200/60 hover:text-lime-400 cursor-pointer transition-opacity focus:outline-none focus-visible:outline-1 focus-visible:outline-lime-500 ${
                        hasSelection ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                >
                    ×
                </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {options.map((opt) => {
                    const isAvailable = available.has(opt.key);
                    const isSelected = selected.has(opt.key);
                    const hasTip = Boolean(opt.description || opt.question);
                    return (
                        <button
                            key={opt.key}
                            onClick={() => isAvailable && onToggle(opt.key)}
                            disabled={!isAvailable}
                            className={`relative w-full px-3 py-1 text-xs text-center border transition-colors ${focusRing} ${
                                isSelected
                                    ? selectedStyle
                                    : isAvailable
                                        ? unselectedStyle
                                        : disabledStyle
                            }`}
                        >
                            {/* the label is the peer: hovering only this span
                                triggers the tooltip. the rest of the button
                                stays clickable but does not trigger the tip. */}
                            <span className="peer relative inline-block">{opt.label}</span>
                            {hasTip && (
                                <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2.5 py-1.5 text-xs bg-black border border-lime-500/30 whitespace-nowrap opacity-0 peer-hover:opacity-100 transition-opacity z-10 block">
                                    {opt.description && (
                                        <span className="block text-lime-200/80">{opt.description}</span>
                                    )}
                                    {opt.question && (
                                        <span className="block text-lime-200/50 italic">{opt.question}</span>
                                    )}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
