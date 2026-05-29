'use client';

import { useState, useMemo, useEffect, useRef, ReactNode } from 'react';

import { parseIndexDate } from '@/lib/parseIndexDate';

import SearchInput from './SearchInput';
import YearPills from './YearPills';
import MonthGrid from './MonthGrid';
import ChipGroup, { type ChipOption } from './ChipGroup';


export interface ChipGroupConfig<T> {
    /** storage key fragment, e.g. 'topics' */
    key: string;
    /** shown above the chip grid, e.g. 'topic' */
    label: string;
    /** the available options for this chip group */
    options: ChipOption[];
    /** pull this group's classification from a single item */
    getItemKeys: (item: T) => readonly string[];
}

interface IndexFiltersProps<T> {
    items: T[];
    getDate: (item: T) => string | null | undefined;
    getSearchableText: (item: T) => string;
    chipGroups?: ChipGroupConfig<T>[];
    storageKey: string;
    /** singular noun for the result count, e.g. "playground", "paper" */
    dataLabel: string;
    children: (filtered: T[]) => ReactNode;
}

interface StoredFilters {
    search: string;
    year: string | null;
    month: string | null;
    chips: Record<string, string[]>;
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
            chips: parsed.chips && typeof parsed.chips === 'object' && !Array.isArray(parsed.chips)
                ? parsed.chips
                : {},
        };
    } catch {
        return null;
    }
}


export default function IndexFilters<T>({
    items,
    getDate,
    getSearchableText,
    chipGroups = [],
    storageKey,
    dataLabel,
    children,
}: IndexFiltersProps<T>) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [selectedChips, setSelectedChips] = useState<Record<string, Set<string>>>(() => {
        const init: Record<string, Set<string>> = {};
        for (const g of chipGroups) init[g.key] = new Set();
        return init;
    });
    const mounted = useRef(false);

    // load saved state once on mount
    useEffect(() => {
        const stored = readStorage(storageKey);
        if (stored) {
            if (stored.search) setSearchQuery(stored.search);
            if (stored.year) setSelectedYear(stored.year);
            if (stored.month) setSelectedMonth(stored.month);
            const next: Record<string, Set<string>> = {};
            for (const g of chipGroups) {
                next[g.key] = new Set(stored.chips?.[g.key] ?? []);
            }
            setSelectedChips(next);
        }
        mounted.current = true;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storageKey]);

    // debounced persistence (250 ms) so a continuous typing run produces a single write.
    useEffect(() => {
        if (!mounted.current) return;
        const id = setTimeout(() => {
            try {
                const chipsObj: Record<string, string[]> = {};
                for (const g of chipGroups) {
                    chipsObj[g.key] = Array.from(selectedChips[g.key] ?? []);
                }
                localStorage.setItem(
                    storageKey,
                    JSON.stringify({
                        search: searchQuery,
                        year: selectedYear,
                        month: selectedMonth,
                        chips: chipsObj,
                    }),
                );
            } catch {
                // ignore
            }
        }, 250);
        return () => clearTimeout(id);
    }, [storageKey, searchQuery, selectedYear, selectedMonth, selectedChips, chipGroups]);

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

    // multi-word, case-insensitive, AND across whitespace-separated tokens.
    const matchesSearch = useMemo(() => {
        const tokens = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
        if (tokens.length === 0) return () => true;
        return (it: T) => {
            const hay = getSearchableText(it).toLowerCase();
            return tokens.every((t) => hay.includes(t));
        };
    }, [searchQuery, getSearchableText]);

    const matchesDate = useMemo(() => {
        return (it: T) => {
            if (!selectedYear && !selectedMonth) return true;
            const parsed = parseIndexDate(getDate(it));
            if (selectedYear) {
                if (!parsed || parsed.year !== selectedYear) return false;
            }
            if (selectedMonth) {
                if (!parsed || parsed.month !== selectedMonth) return false;
            }
            return true;
        };
    }, [getDate, selectedYear, selectedMonth]);

    // predicate for chip group g, ignoring its own selection. used for cascading availability.
    const matchesOtherChips = (skipGroupKey: string) => (it: T): boolean => {
        for (const g of chipGroups) {
            if (g.key === skipGroupKey) continue;
            const sel = selectedChips[g.key];
            if (!sel || sel.size === 0) continue;
            const keys = g.getItemKeys(it);
            if (keys.length === 0) return false;
            if (!keys.some((k) => sel.has(k))) return false;
        }
        return true;
    };

    // predicate that includes every chip group's selection. used for the actual filter.
    const matchesAllChips = useMemo(() => {
        return (it: T) => {
            for (const g of chipGroups) {
                const sel = selectedChips[g.key];
                if (!sel || sel.size === 0) continue;
                const keys = g.getItemKeys(it);
                if (keys.length === 0) return false;
                if (!keys.some((k) => sel.has(k))) return false;
            }
            return true;
        };
    }, [chipGroups, selectedChips]);

    const filteredItems = useMemo(() => {
        return items.filter((it) => matchesDate(it) && matchesSearch(it) && matchesAllChips(it));
    }, [items, matchesDate, matchesSearch, matchesAllChips]);

    // available chip keys per group: keys that appear in items passing every other filter
    // (year + month + search + OTHER chip groups).
    const availablePerGroup = useMemo(() => {
        const out: Record<string, Set<string>> = {};
        for (const g of chipGroups) {
            const pass = matchesOtherChips(g.key);
            const s = new Set<string>();
            items.forEach((it) => {
                if (!matchesDate(it)) return;
                if (!matchesSearch(it)) return;
                if (!pass(it)) return;
                for (const k of g.getItemKeys(it)) s.add(k);
            });
            out[g.key] = s;
        }
        return out;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, chipGroups, selectedChips, matchesDate, matchesSearch]);

    const summary = useMemo(() => {
        const parts: string[] = [];
        if (selectedYear) parts.push(selectedYear);
        if (selectedMonth) parts.push(selectedMonth);
        for (const g of chipGroups) {
            const sel = selectedChips[g.key];
            if (!sel) continue;
            for (const k of sel) {
                const opt = g.options.find((o) => o.key === k);
                if (opt) parts.push(opt.label);
            }
        }
        if (searchQuery.trim()) parts.push(`"${searchQuery.trim()}"`);
        const count = `${filteredItems.length} ${dataLabel}${filteredItems.length !== 1 ? 's' : ''}`;
        return parts.length === 0 ? count : `${count} · ${parts.join(' · ')}`;
    }, [filteredItems.length, selectedYear, selectedMonth, searchQuery, dataLabel, chipGroups, selectedChips]);

    const toggleChip = (groupKey: string, chipKey: string) => {
        setSelectedChips((prev) => {
            const next = new Set(prev[groupKey] ?? []);
            if (next.has(chipKey)) next.delete(chipKey);
            else next.add(chipKey);
            return { ...prev, [groupKey]: next };
        });
    };

    const clearChipGroup = (groupKey: string) => {
        setSelectedChips((prev) => ({ ...prev, [groupKey]: new Set() }));
    };

    const handleYearChange = (year: string | null) => {
        setSelectedYear(year);
        // clearing the year clears any month selection
        if (year === null) setSelectedMonth(null);
        else if (selectedYear !== year) setSelectedMonth(null);
    };

    return (
        <div className="w-full max-w-2xl mx-auto px-4">
            {/* search */}
            <div className="mb-8">
                <SearchInput value={searchQuery} onChange={setSearchQuery} />
            </div>

            {/* year pills */}
            <div className="mb-4">
                <YearPills
                    years={availableYears}
                    selected={selectedYear}
                    onSelect={handleYearChange}
                />
            </div>

            {/* month grid */}
            <div className="mb-4">
                <MonthGrid
                    visible={selectedYear !== null}
                    available={availableMonths}
                    selected={selectedMonth}
                    onSelect={setSelectedMonth}
                />
            </div>

            {/* chip groups (topics, kinds, operations, …) */}
            {chipGroups.length > 0 && (
                <div className="mb-8 flex flex-col gap-6">
                    {chipGroups.map((g) => (
                        <ChipGroup
                            key={g.key}
                            label={g.label}
                            options={g.options}
                            available={availablePerGroup[g.key] ?? new Set()}
                            selected={selectedChips[g.key] ?? new Set()}
                            onToggle={(k) => toggleChip(g.key, k)}
                            onClear={() => clearChipGroup(g.key)}
                        />
                    ))}
                </div>
            )}

            {/* results count */}
            <div className="text-center text-sm text-gray-500 mb-6">{summary}</div>

            {children(filteredItems)}
        </div>
    );
}
