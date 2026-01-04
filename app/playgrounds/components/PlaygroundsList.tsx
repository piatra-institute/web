'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';

import IndexLayout from '@/components/IndexLayout';
import { linkAnchorStyle } from '@/data/styles';
import { playgrounds } from '../data';



const STORAGE_KEY = 'playgrounds-filter';
const YEARS = ['2024', '2025', '2026'];
const MONTHS_ROW_1 = ['01', '02', '03', '04', '05', '06'];
const MONTHS_ROW_2 = ['07', '08', '09', '10', '11', '12'];
const MONTH_NAMES: Record<string, string> = {
    'January': '01',
    'February': '02',
    'March': '03',
    'April': '04',
    'May': '05',
    'June': '06',
    'July': '07',
    'August': '08',
    'September': '09',
    'October': '10',
    'November': '11',
    'December': '12',
};


function parseDateString(dateStr: string): { year: string; month: string } | null {
    // Parse "Month Year" format like "February 2024"
    const parts = dateStr.split(' ');
    if (parts.length !== 2) return null;

    const [monthName, year] = parts;
    const month = MONTH_NAMES[monthName];

    if (!month || !year) return null;
    return { year, month };
}

export default function PlaygroundsList() {
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [initialized, setInitialized] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const { year, month } = JSON.parse(stored);
                if (year) setSelectedYear(year);
                if (month) setSelectedMonth(month);
            }
        } catch {
            // Ignore errors
        }
        setInitialized(true);
    }, []);

    // Save to localStorage when selection changes
    useEffect(() => {
        if (!initialized) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                year: selectedYear,
                month: selectedMonth,
            }));
        } catch {
            // Ignore errors
        }
    }, [selectedYear, selectedMonth, initialized]);

    // Get available months for selected year
    const availableMonths = useMemo(() => {
        if (!selectedYear) return [];
        const months = new Set<string>();
        playgrounds.forEach((p) => {
            const parsed = parseDateString(p.date);
            if (parsed && parsed.year === selectedYear) {
                months.add(parsed.month);
            }
        });
        return Array.from(months).sort();
    }, [selectedYear]);

    // Filter playgrounds
    const filteredPlaygrounds = useMemo(() => {
        return playgrounds.filter((p) => {
            const parsed = parseDateString(p.date);
            if (!parsed) return true; // Show items with unparseable dates

            if (selectedYear && parsed.year !== selectedYear) return false;
            if (selectedMonth && parsed.month !== selectedMonth) return false;

            return true;
        });
    }, [selectedYear, selectedMonth]);

    const handleYearClick = (year: string | null) => {
        if (year === selectedYear) {
            // Clicking same year again deselects it
            setSelectedYear(null);
            setSelectedMonth(null);
        } else {
            setSelectedYear(year);
            setSelectedMonth(null);
        }
    };

    const handleMonthClick = (month: string) => {
        if (month === selectedMonth) {
            setSelectedMonth(null);
        } else {
            setSelectedMonth(month);
        }
    };

    // Don't render until localStorage is loaded to prevent flicker
    if (!initialized) {
        return <div className="min-h-screen" />;
    }

    return (
        <IndexLayout
            title="playgrounds"
            description={
                <>
                    the playgrounds are in various stages of development
                    <br />
                    from conceptual sketches to fully functional applications
                </>
            }
        >
            {/* Year Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
                <button
                    onClick={() => handleYearClick(null)}
                    className={`px-4 py-1.5 text-sm border transition-colors focus:outline-none focus:ring-1 focus:ring-white ${
                        selectedYear === null
                            ? 'border-lime-500 text-lime-400 bg-lime-500/10'
                            : 'border-lime-500/30 text-gray-400 hover:border-lime-500/50 hover:text-gray-300'
                    }`}
                >
                    ALL
                </button>
                {YEARS.map((year) => (
                    <button
                        key={year}
                        onClick={() => handleYearClick(year)}
                        className={`px-4 py-1.5 text-sm border transition-colors focus:outline-none focus:ring-1 focus:ring-white ${
                            selectedYear === year
                                ? 'border-lime-500 text-lime-400 bg-lime-500/10'
                                : 'border-lime-500/30 text-gray-400 hover:border-lime-500/50 hover:text-gray-300'
                        }`}
                    >
                        {year}
                    </button>
                ))}
            </div>

            {/* Month Filter (fixed height container to prevent layout shift) */}
            <div className="h-25 md:h-10 mb-4">
                {selectedYear && (
                    <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-1.5">
                        <button
                            onClick={() => setSelectedMonth(null)}
                            className={`px-2 py-1 text-xs border transition-colors focus:outline-none focus:ring-1 focus:ring-white ${
                                selectedMonth === null
                                    ? 'border-lime-500 text-lime-400 bg-lime-500/10'
                                    : 'border-lime-500/30 text-gray-400 hover:border-lime-500/50 hover:text-gray-300'
                            }`}
                        >
                            YEAR
                        </button>
                        <div className="flex gap-1.5">
                            {MONTHS_ROW_1.map((month) => {
                                const isAvailable = availableMonths.includes(month);
                                const isSelected = selectedMonth === month;

                                return (
                                    <button
                                        key={month}
                                        onClick={() => isAvailable && handleMonthClick(month)}
                                        disabled={!isAvailable}
                                        className={`w-10 py-1 text-xs border transition-colors focus:outline-none focus:ring-1 focus:ring-white ${
                                            isSelected
                                                ? 'border-lime-500 text-lime-400 bg-lime-500/10'
                                                : isAvailable
                                                  ? 'border-lime-500/30 text-gray-400 hover:border-lime-500/50 hover:text-gray-300'
                                                  : 'border-gray-800 text-gray-700 cursor-not-allowed'
                                        }`}
                                    >
                                        {month}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex gap-1.5">
                            {MONTHS_ROW_2.map((month) => {
                                const isAvailable = availableMonths.includes(month);
                                const isSelected = selectedMonth === month;

                                return (
                                    <button
                                        key={month}
                                        onClick={() => isAvailable && handleMonthClick(month)}
                                        disabled={!isAvailable}
                                        className={`w-10 py-1 text-xs border transition-colors focus:outline-none focus:ring-1 focus:ring-white ${
                                            isSelected
                                                ? 'border-lime-500 text-lime-400 bg-lime-500/10'
                                                : isAvailable
                                                  ? 'border-lime-500/30 text-gray-400 hover:border-lime-500/50 hover:text-gray-300'
                                                  : 'border-gray-800 text-gray-700 cursor-not-allowed'
                                        }`}
                                    >
                                        {month}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Results count */}
            <div className="text-center text-sm text-gray-500 mb-4">
                {filteredPlaygrounds.length} playground{filteredPlaygrounds.length !== 1 ? 's' : ''}
                {selectedYear && ` in ${selectedYear}`}
                {selectedMonth && ` / ${selectedMonth}`}
            </div>

            {/* Playgrounds List */}
            <div className="p-6">
                {filteredPlaygrounds.length === 0 ? (
                    <div className="text-center text-sm text-gray-500">
                        no playgrounds for this period
                    </div>
                ) : (
                    filteredPlaygrounds.map((playground) => {
                        const { name, link, description, date } = playground;

                        return (
                            <Link
                                key={name + link}
                                href={link}
                                className="mb-8 block focus:outline-none focus:ring-1 focus:ring-white text-center"
                                draggable={false}
                            >
                                <div className={linkAnchorStyle}>
                                    {name} · {date}
                                </div>

                                {description && <div>{description}</div>}
                            </Link>
                        );
                    })
                )}
            </div>
        </IndexLayout>
    );
}
