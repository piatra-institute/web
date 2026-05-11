'use client';

import { useState, useMemo, useEffect, useRef, ReactNode } from 'react';

import { parseIndexDate } from '@/lib/parseIndexDate';


const MONTHS_ROW_1 = ['01', '02', '03', '04', '05', '06'];
const MONTHS_ROW_2 = ['07', '08', '09', '10', '11', '12'];

const selectedStyle = 'border-lime-500 text-lime-400 bg-lime-500/10 cursor-pointer';
const unselectedStyle = 'border-lime-500/30 text-gray-400 hover:border-lime-500/50 hover:text-gray-300 cursor-pointer';

interface IndexFiltersProps<T> {
    items: T[];
    getDate: (item: T) => string | null | undefined;
    getSearchableText: (item: T) => string;
    storageKey: string;
    /**
     * Singular noun for the result count, e.g. "playground", "press item",
     * "paper", "policy". The component pluralises by appending "s".
     */
    dataLabel: string;
    children: (filtered: T[], summary: string) => ReactNode;
}

interface StoredFilters {
    search: string;
    year: string | null;
    month: string | null;
}

function readStorage(key: string): StoredFilters | null {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return {
            search: typeof parsed.search === 'string' ? parsed.search : '',
            year: typeof parsed.year === 'string' || parsed.year === null ? parsed.year : null,
            month: typeof parsed.month === 'string' || parsed.month === null ? parsed.month : null,
        };
    } catch {
        return null;
    }
}

export default function IndexFilters<T>({
    items,
    getDate,
    getSearchableText,
    storageKey,
    dataLabel,
    children,
}: IndexFiltersProps<T>) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const mounted = useRef(false);

    useEffect(() => {
        const stored = readStorage(storageKey);
        if (stored) {
            if (stored.search) setSearchQuery(stored.search);
            if (stored.year) setSelectedYear(stored.year);
            if (stored.month) setSelectedMonth(stored.month);
        }
        mounted.current = true;
    }, [storageKey]);

    useEffect(() => {
        if (!mounted.current) return;
        try {
            localStorage.setItem(
                storageKey,
                JSON.stringify({
                    search: searchQuery,
                    year: selectedYear,
                    month: selectedMonth,
                }),
            );
        } catch {
            // ignore
        }
    }, [storageKey, searchQuery, selectedYear, selectedMonth]);

    const availableYears = useMemo(() => {
        const ys = new Set<string>();
        items.forEach((it) => {
            const parsed = parseIndexDate(getDate(it));
            if (parsed) ys.add(parsed.year);
        });
        return Array.from(ys).sort();
    }, [items, getDate]);

    const availableMonths = useMemo(() => {
        if (!selectedYear) return [] as string[];
        const ms = new Set<string>();
        items.forEach((it) => {
            const parsed = parseIndexDate(getDate(it));
            if (parsed && parsed.year === selectedYear && parsed.month) {
                ms.add(parsed.month);
            }
        });
        return Array.from(ms).sort();
    }, [items, getDate, selectedYear]);

    const filteredItems = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return items.filter((it) => {
            const parsed = parseIndexDate(getDate(it));
            if (selectedYear) {
                if (!parsed || parsed.year !== selectedYear) return false;
            }
            if (selectedMonth) {
                if (!parsed || parsed.month !== selectedMonth) return false;
            }
            if (q.length > 0) {
                const hay = getSearchableText(it).toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [items, getDate, getSearchableText, selectedYear, selectedMonth, searchQuery]);

    const summary = useMemo(() => {
        const parts: string[] = [];
        if (selectedYear) parts.push(selectedYear);
        if (selectedMonth) parts.push(selectedMonth);
        if (searchQuery.trim()) parts.push(`"${searchQuery.trim()}"`);
        const count = `${filteredItems.length} ${dataLabel}${filteredItems.length !== 1 ? 's' : ''}`;
        if (parts.length === 0) return count;
        return `${count} · ${parts.join(' · ')}`;
    }, [filteredItems.length, selectedYear, selectedMonth, searchQuery, dataLabel]);

    const handleYearClick = (year: string | null) => {
        if (year === selectedYear) {
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

    return (
        <>
            {/* Search input */}
            <div className="flex justify-center mb-8 px-4">
                <div className="relative w-full max-w-4xl">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') setSearchQuery('');
                        }}
                        placeholder="search"
                        className="w-full px-3 py-1.5 pr-9 text-sm border border-lime-500/30 text-lime-100 appearance-none focus:border-lime-500 focus:outline-none transition-colors [&::placeholder]:!bg-transparent [&::placeholder]:!text-lime-200/40"
                        style={{ backgroundColor: '#000' }}
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            aria-label="clear search"
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-lime-200/60 hover:text-lime-400 text-base leading-none cursor-pointer"
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            {/* Year filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
                <button
                    onClick={() => handleYearClick(null)}
                    className={`px-4 py-1.5 text-sm border transition-colors focus:outline-none ${
                        selectedYear === null ? selectedStyle : unselectedStyle
                    }`}
                >
                    ALL
                </button>
                {availableYears.map((year) => (
                    <button
                        key={year}
                        onClick={() => handleYearClick(year)}
                        className={`px-4 py-1.5 text-sm border transition-colors focus:outline-none ${
                            selectedYear === year ? selectedStyle : unselectedStyle
                        }`}
                    >
                        {year}
                    </button>
                ))}
            </div>

            {/* Month filter (fixed-height container to prevent layout shift) */}
            <div className="h-25 md:h-10 mb-4">
                {selectedYear && (
                    <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-1.5">
                        <button
                            onClick={() => setSelectedMonth(null)}
                            className={`px-2 py-1 text-xs border transition-colors focus:outline-none ${
                                selectedMonth === null ? selectedStyle : unselectedStyle
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
                                        className={`w-10 py-1 text-xs border transition-colors focus:outline-none ${
                                            isSelected
                                                ? selectedStyle
                                                : isAvailable
                                                    ? unselectedStyle
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
                                        className={`w-10 py-1 text-xs border transition-colors focus:outline-none ${
                                            isSelected
                                                ? selectedStyle
                                                : isAvailable
                                                    ? unselectedStyle
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
            <div className="text-center text-sm text-gray-500 mb-6">
                {summary}
            </div>

            {children(filteredItems, summary)}
        </>
    );
}
