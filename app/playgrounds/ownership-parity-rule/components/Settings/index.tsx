'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import Toggle from '@/components/Toggle';
import { PurchaseEvent } from '../../playground';

// Product catalog (sorted by year)
const CATALOG = [
    { name: "Intel Pentium III (2000)", ticker: "INTC", defaultCost: 300, year: 2000 },
    { name: "Microsoft Xbox 360 (2005)", ticker: "MSFT", defaultCost: 399, year: 2005 },
    { name: "Intel Core 2 Duo (2006)", ticker: "INTC", defaultCost: 316, year: 2006 },
    { name: "Sony PlayStation 3 (2006)", ticker: "SONY", defaultCost: 499, year: 2006 },
    { name: "Apple iPhone (2007)", ticker: "AAPL", defaultCost: 499, year: 2007 },
    { name: "Amazon Kindle (2007)", ticker: "AMZN", defaultCost: 399, year: 2007 },
    { name: "NVIDIA GeForce 8800 GT (2007)", ticker: "NVDA", defaultCost: 249, year: 2007 },
    { name: "Apple MacBook (2008)", ticker: "AAPL", defaultCost: 1299, year: 2008 },
    { name: "Apple iPad (2010)", ticker: "AAPL", defaultCost: 499, year: 2010 },
    { name: "Apple MacBook Pro (2012)", ticker: "AAPL", defaultCost: 1799, year: 2012 },
    { name: "Sony PlayStation 4 (2013)", ticker: "SONY", defaultCost: 399, year: 2013 },
    { name: "Apple MacBook Air (2015)", ticker: "AAPL", defaultCost: 999, year: 2015 },
    { name: "NVIDIA GTX 1080 (2016)", ticker: "NVDA", defaultCost: 599, year: 2016 },
    { name: "AMD Ryzen 7 1700 (2017)", ticker: "AMD", defaultCost: 329, year: 2017 },
    { name: "NVIDIA RTX 3080 (2020)", ticker: "NVDA", defaultCost: 699, year: 2020 },
];

// Subscription catalog (sorted alphabetically)
const SUBSCRIPTIONS = [
    { name: "Adobe Creative Cloud", ticker: "ADBE", defaultMonthly: 55, startYear: 2013 },
    { name: "Amazon Prime", ticker: "AMZN", defaultMonthly: 13, startYear: 2005 },
    { name: "Autodesk (AutoCAD LT)", ticker: "ADSK", defaultMonthly: 60, startYear: 2016 },
    { name: "Google Workspace", ticker: "GOOG", defaultMonthly: 6, startYear: 2014 },
    { name: "Microsoft 365 Personal", ticker: "MSFT", defaultMonthly: 7, startYear: 2011 },
    { name: "Netflix", ticker: "NFLX", defaultMonthly: 12, startYear: 2007 },
];

interface SettingsProps {
    events: PurchaseEvent[];
    consolidated: boolean;
    onEventsChange: (events: PurchaseEvent[], consolidated: boolean) => void;
    onReset: () => void;
}

export default function Settings({ events, consolidated, onEventsChange, onReset }: SettingsProps) {
    // One-off purchase state
    const [selectedProductIdx, setSelectedProductIdx] = useState(0);
    const [purchaseCost, setPurchaseCost] = useState(CATALOG[0].defaultCost);

    // Subscription state
    const [selectedSubIdx, setSelectedSubIdx] = useState(0);
    const [subMonthly, setSubMonthly] = useState(SUBSCRIPTIONS[0].defaultMonthly);
    const [subStartYear, setSubStartYear] = useState(SUBSCRIPTIONS[0].startYear);
    const [subMonths, setSubMonths] = useState(60);

    const addPurchase = () => {
        const p = CATALOG[selectedProductIdx];
        const d = new Date(`${p.year}-06-15`);
        onEventsChange([...events, {
            type: 'purchase',
            ticker: p.ticker,
            label: p.name,
            date: d,
            amount: Number(purchaseCost)
        }], consolidated);
    };

    const addSubscription = () => {
        const s = SUBSCRIPTIONS[selectedSubIdx];
        const d = new Date(`${subStartYear}-01-15`);
        onEventsChange([...events, {
            type: 'subscription',
            ticker: s.ticker,
            label: s.name,
            date: d,
            amount: Number(subMonthly),
            months: Number(subMonths)
        }], consolidated);
    };

    const removeEvent = (idx: number) => {
        onEventsChange(events.filter((_, i) => i !== idx), consolidated);
    };

    const resetAll = () => {
        setSelectedProductIdx(0);
        setPurchaseCost(CATALOG[0].defaultCost);
        setSelectedSubIdx(0);
        setSubMonthly(SUBSCRIPTIONS[0].defaultMonthly);
        setSubStartYear(SUBSCRIPTIONS[0].startYear);
        setSubMonths(60);
        onReset();
    };

    const totalInvested = events.reduce((sum, ev) => {
        if (ev.type === 'purchase') return sum + ev.amount;
        if (ev.type === 'subscription') return sum + ev.amount * (ev.months || 0);
        return sum;
    }, 0);

    return (
        <div className="space-y-6">
            {/* One-off Purchase */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Add One-off Purchase</h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-gray-400 text-sm">Product</label>
                        <select
                            value={selectedProductIdx}
                            onChange={(e) => {
                                const idx = Number(e.target.value);
                                setSelectedProductIdx(idx);
                                setPurchaseCost(CATALOG[idx].defaultCost);
                            }}
                            className="w-full mt-1 px-3 py-2 bg-black border border-lime-500/20 text-lime-400 focus:outline-none focus:border-lime-500/50"
                        >
                            {CATALOG.map((p, i) => (
                                <option key={i} value={i}>{p.name} • {p.ticker}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-gray-400 text-sm">Cost (USD)</label>
                        <input
                            type="number"
                            value={purchaseCost}
                            onChange={(e) => setPurchaseCost(Number(e.target.value))}
                            className="w-full mt-1 px-3 py-2 bg-black border border-lime-500/20 text-lime-400 focus:outline-none focus:border-lime-500/50"
                        />
                    </div>
                    <Button
                        label="Add Purchase"
                        onClick={addPurchase}
                        className="w-full"
                    />
                </div>
            </div>

            {/* Subscription */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Add Subscription (Monthly DCA)</h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-gray-400 text-sm">Service</label>
                        <select
                            value={selectedSubIdx}
                            onChange={(e) => {
                                const idx = Number(e.target.value);
                                setSelectedSubIdx(idx);
                                setSubMonthly(SUBSCRIPTIONS[idx].defaultMonthly);
                                setSubStartYear(SUBSCRIPTIONS[idx].startYear);
                            }}
                            className="w-full mt-1 px-3 py-2 bg-black border border-lime-500/20 text-lime-400 focus:outline-none focus:border-lime-500/50"
                        >
                            {SUBSCRIPTIONS.map((s, i) => (
                                <option key={i} value={i}>{s.name} • {s.ticker}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="text-gray-400 text-sm">Monthly</label>
                            <input
                                type="number"
                                value={subMonthly}
                                onChange={(e) => setSubMonthly(Number(e.target.value))}
                                className="w-full mt-1 px-3 py-2 bg-black border border-lime-500/20 text-lime-400 focus:outline-none focus:border-lime-500/50"
                            />
                        </div>
                        <div>
                            <label className="text-gray-400 text-sm">Start</label>
                            <input
                                type="number"
                                value={subStartYear}
                                onChange={(e) => setSubStartYear(Number(e.target.value))}
                                className="w-full mt-1 px-3 py-2 bg-black border border-lime-500/20 text-lime-400 focus:outline-none focus:border-lime-500/50"
                            />
                        </div>
                        <div>
                            <label className="text-gray-400 text-sm">Months</label>
                            <input
                                type="number"
                                value={subMonths}
                                onChange={(e) => setSubMonths(Number(e.target.value))}
                                className="w-full mt-1 px-3 py-2 bg-black border border-lime-500/20 text-lime-400 focus:outline-none focus:border-lime-500/50"
                            />
                        </div>
                    </div>
                    <Button
                        label="Add Subscription"
                        onClick={addSubscription}
                        className="w-full"
                    />
                </div>
            </div>

            {/* Summary */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Summary</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-400">Events:</span>
                        <span className="text-white">{events.length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Total Invested:</span>
                        <span className="text-white">${totalInvested.toLocaleString()}</span>
                    </div>
                </div>
                <Toggle
                    text="Consolidated View"
                    value={consolidated}
                    toggle={() => onEventsChange(events, !consolidated)}
                />
                <Button
                    label="Reset All"
                    onClick={resetAll}
                    className="w-full"
                />
            </div>

            {/* Event List */}
            {events.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lime-400 font-semibold">Events</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {events.map((ev, i) => (
                            <div
                                key={i}
                                className="bg-black border border-lime-500/20 px-3 py-2 text-xs"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="text-lime-400 font-semibold">{ev.label}</div>
                                        <div className="text-gray-400">
                                            {ev.ticker} • {ev.date.getFullYear()} •{' '}
                                            {ev.type === 'purchase'
                                                ? `$${ev.amount}`
                                                : `$${ev.amount}/mo × ${ev.months}`}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeEvent(i)}
                                        className="text-gray-500 hover:text-lime-400 ml-2"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
