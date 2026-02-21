'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';

import IndexLayout from '@/components/IndexLayout';
import { linkAnchorStyle } from '@/data/styles';
import {
    playgrounds,
    TOPICS,
    OPERATIONS,
    type Topic,
    type Operation,
} from '../data';



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

const selectedStyle = 'border-lime-500 text-lime-400 bg-lime-500/10 cursor-pointer';
const unselectedStyle = 'border-lime-500/30 text-gray-400 hover:border-lime-500/50 hover:text-gray-300 cursor-pointer';

export default function PlaygroundsList() {
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [selectedTopics, setSelectedTopics] = useState<Set<Topic>>(new Set());
    const [selectedOperations, setSelectedOperations] = useState<Set<Operation>>(new Set());
    const mounted = useRef(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const { year, month, topics, operations } = JSON.parse(stored);
                if (year) setSelectedYear(year);
                if (month) setSelectedMonth(month);
                if (topics && Array.isArray(topics)) setSelectedTopics(new Set(topics));
                if (operations && Array.isArray(operations)) setSelectedOperations(new Set(operations));
            }
        } catch {
            // Ignore errors
        }
        mounted.current = true;
    }, []);

    // Save to localStorage when selection changes
    useEffect(() => {
        if (!mounted.current) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                year: selectedYear,
                month: selectedMonth,
                topics: Array.from(selectedTopics),
                operations: Array.from(selectedOperations),
            }));
        } catch {
            // Ignore errors
        }
    }, [selectedYear, selectedMonth, selectedTopics, selectedOperations]);

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
            if (!parsed) return true;

            if (selectedYear && parsed.year !== selectedYear) return false;
            if (selectedMonth && parsed.month !== selectedMonth) return false;

            if (selectedTopics.size > 0 && !p.topics.some(t => selectedTopics.has(t))) return false;
            if (selectedOperations.size > 0 && !p.operations.some(o => selectedOperations.has(o))) return false;

            return true;
        });
    }, [selectedYear, selectedMonth, selectedTopics, selectedOperations]);

    // Available topics given current date + operation filters
    const availableTopics = useMemo(() => {
        const topics = new Set<Topic>();
        playgrounds.forEach((p) => {
            const parsed = parseDateString(p.date);
            if (!parsed) return;
            if (selectedYear && parsed.year !== selectedYear) return;
            if (selectedMonth && parsed.month !== selectedMonth) return;
            if (selectedOperations.size > 0 && !p.operations.some(o => selectedOperations.has(o))) return;
            p.topics.forEach(t => topics.add(t));
        });
        return topics;
    }, [selectedYear, selectedMonth, selectedOperations]);

    // Available operations given current date + topic filters
    const availableOperations = useMemo(() => {
        const operations = new Set<Operation>();
        playgrounds.forEach((p) => {
            const parsed = parseDateString(p.date);
            if (!parsed) return;
            if (selectedYear && parsed.year !== selectedYear) return;
            if (selectedMonth && parsed.month !== selectedMonth) return;
            if (selectedTopics.size > 0 && !p.topics.some(t => selectedTopics.has(t))) return;
            p.operations.forEach(o => operations.add(o));
        });
        return operations;
    }, [selectedYear, selectedMonth, selectedTopics]);

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

    const toggleTopic = (t: Topic) => {
        setSelectedTopics(prev => {
            const next = new Set(prev);
            if (next.has(t)) next.delete(t); else next.add(t);
            return next;
        });
    };

    const toggleOperation = (o: Operation) => {
        setSelectedOperations(prev => {
            const next = new Set(prev);
            if (next.has(o)) next.delete(o); else next.add(o);
            return next;
        });
    };

    // Build results count description
    const filterDescription = useMemo(() => {
        const parts: string[] = [];
        if (selectedYear) parts.push(selectedYear);
        if (selectedMonth) parts.push(selectedMonth);
        selectedTopics.forEach(t => {
            const found = TOPICS.find(topic => topic.key === t);
            if (found) parts.push(found.label);
        });
        selectedOperations.forEach(o => {
            const found = OPERATIONS.find(op => op.key === o);
            if (found) parts.push(found.label);
        });

        const count = `${filteredPlaygrounds.length} playground${filteredPlaygrounds.length !== 1 ? 's' : ''}`;
        if (parts.length === 0) return count;
        return `${count} \u00b7 ${parts.join(' \u00b7 ')}`;
    }, [filteredPlaygrounds.length, selectedYear, selectedMonth, selectedTopics, selectedOperations]);

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
                    className={`px-4 py-1.5 text-sm border transition-colors focus:outline-none ${
                        selectedYear === null ? selectedStyle : unselectedStyle
                    }`}
                >
                    ALL
                </button>
                {YEARS.map((year) => (
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

            {/* Month Filter (fixed height container to prevent layout shift) */}
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

            {/* Topic & Operation Filters */}
            <div className="flex justify-center mb-8">
                <div className="flex flex-col gap-6">
                    {/* Topic Filter */}
                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs text-gray-500 text-center">topic</span>
                        <div className="grid grid-cols-3 gap-2">
                            {TOPICS.map(({ key, label, description }) => {
                                const isAvailable = availableTopics.has(key);
                                const isSelected = selectedTopics.has(key);

                                return (
                                    <div key={key} className="relative group">
                                        <button
                                            onClick={() => isAvailable && toggleTopic(key)}
                                            disabled={!isAvailable}
                                            className={`w-full px-3 py-1 text-xs text-center border transition-colors focus:outline-none ${
                                                isSelected
                                                    ? selectedStyle
                                                    : isAvailable
                                                      ? unselectedStyle
                                                      : 'border-gray-800 text-gray-700 cursor-not-allowed'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2.5 py-1.5 text-xs text-lime-200/80 bg-black border border-lime-500/30 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10">
                                            {description}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Operation Filter */}
                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs text-gray-500 text-center">operation</span>
                        <div className="grid grid-cols-3 gap-2">
                            {OPERATIONS.map(({ key, label, description, question }) => {
                                const isAvailable = availableOperations.has(key);
                                const isSelected = selectedOperations.has(key);

                                return (
                                    <div key={key} className="relative group">
                                        <button
                                            onClick={() => isAvailable && toggleOperation(key)}
                                            disabled={!isAvailable}
                                            className={`w-full px-3 py-1 text-xs text-center border transition-colors focus:outline-none ${
                                                isSelected
                                                    ? selectedStyle
                                                    : isAvailable
                                                      ? unselectedStyle
                                                      : 'border-gray-800 text-gray-700 cursor-not-allowed'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2.5 py-1.5 text-xs bg-black border border-lime-500/30 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10">
                                            <div className="text-lime-200/80">{description}</div>
                                            <div className="text-lime-200/50 italic">{question}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Results count */}
            <div className="text-center text-sm text-gray-500 mb-6">
                {filterDescription}
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
                                className="mb-8 block focus:outline-none text-center"
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
