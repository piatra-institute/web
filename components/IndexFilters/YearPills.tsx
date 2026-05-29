'use client';

import React from 'react';

import { selectedStyle, unselectedStyle, focusRing } from './styles';


interface YearPillsProps {
    years: string[];          // available years, derived from data
    selected: string | null;
    onSelect: (year: string | null) => void;
}

export default function YearPills({ years, selected, onSelect }: YearPillsProps) {
    return (
        <div className="flex flex-wrap justify-center gap-2">
            <button
                onClick={() => onSelect(null)}
                className={`px-4 py-1.5 text-sm border transition-colors ${focusRing} ${
                    selected === null ? selectedStyle : unselectedStyle
                }`}
            >
                ALL
            </button>
            {years.map((year) => (
                <button
                    key={year}
                    onClick={() => onSelect(selected === year ? null : year)}
                    className={`px-4 py-1.5 text-sm border transition-colors ${focusRing} ${
                        selected === year ? selectedStyle : unselectedStyle
                    }`}
                >
                    {year}
                </button>
            ))}
        </div>
    );
}
