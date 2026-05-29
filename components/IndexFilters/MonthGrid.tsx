'use client';

import React from 'react';

import { selectedStyle, unselectedStyle, disabledStyle, focusRing } from './styles';


const MONTHS_ROW_1 = ['01', '02', '03', '04', '05', '06'];
const MONTHS_ROW_2 = ['07', '08', '09', '10', '11', '12'];


interface MonthGridProps {
    visible: boolean;        // only render the grid when a year is selected
    available: string[];     // months that have items under the current other filters
    selected: string | null;
    onSelect: (month: string | null) => void;
}

export default function MonthGrid({ visible, available, selected, onSelect }: MonthGridProps) {
    // fixed-height container so the page doesn't shift when the grid appears.
    // on md+ the row stretches to fill the container width: YEAR plus the two
    // month groups share the row via flex-1, so the row matches the search and
    // chip widths above and below it. on mobile we keep the stacked layout.
    return (
        <div className="h-25 md:h-10">
            {visible && (
                <div className="flex flex-col items-center justify-center gap-2 md:flex-row md:items-stretch md:justify-stretch md:gap-1.5 md:w-full">
                    <button
                        onClick={() => onSelect(null)}
                        className={`px-2 py-1 text-xs border transition-colors md:flex-1 ${focusRing} ${
                            selected === null ? selectedStyle : unselectedStyle
                        }`}
                    >
                        YEAR
                    </button>
                    {[MONTHS_ROW_1, MONTHS_ROW_2].map((row, rowIdx) => (
                        <div key={rowIdx} className="flex gap-1.5 md:flex-[6]">
                            {row.map((month) => {
                                const isAvailable = available.includes(month);
                                const isSelected = selected === month;
                                return (
                                    <button
                                        key={month}
                                        onClick={() => {
                                            if (!isAvailable) return;
                                            onSelect(isSelected ? null : month);
                                        }}
                                        disabled={!isAvailable}
                                        className={`w-10 py-1 text-xs border transition-colors md:w-auto md:flex-1 ${focusRing} ${
                                            isSelected
                                                ? selectedStyle
                                                : isAvailable
                                                    ? unselectedStyle
                                                    : disabledStyle
                                        }`}
                                    >
                                        {month}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
