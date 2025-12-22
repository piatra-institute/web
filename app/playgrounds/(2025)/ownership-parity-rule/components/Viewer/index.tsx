'use client';

import { forwardRef, useImperativeHandle, useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { ViewerRef, PurchaseEvent } from '../../playground';
import { SERIES } from '../../logic/stock-prices';

function priceAt(ticker: string, date: Date): number | null {
    const series = SERIES[ticker]?.prices || {};
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${month.toString().padStart(2, '0')}`;

    // Direct match
    if (series[key] != null) return series[key];

    // Look backwards for most recent available price
    const keys = Object.keys(series).sort();
    if (keys.length === 0) return null;

    for (let i = keys.length - 1; i >= 0; i--) {
        if (keys[i] <= key) {
            return series[keys[i]];
        }
    }

    return null;
}

interface TimelinePoint {
    date: Date;
    total: number;
    [ticker: string]: number | Date;
}

const Viewer = forwardRef<ViewerRef>((_, ref) => {
    const [events, setEvents] = useState<PurchaseEvent[]>([]);
    const [consolidated, setConsolidated] = useState(true);

    useImperativeHandle(ref, () => ({
        updateVisualization: (newEvents: PurchaseEvent[], isConsolidated: boolean) => {
            setEvents(newEvents);
            setConsolidated(isConsolidated);
        },
        reset: () => {
            setEvents([]);
        }
    }));

    // Consolidated timeline (all events combined)
    const timeline = useMemo(() => {
        // Build monthly dates from 2000 to 2025
        const dates: Date[] = [];
        for (let y = 2000; y <= 2025; y++) {
            for (let m = 0; m < 12; m++) {
                dates.push(new Date(y, m, 15));
            }
        }

        // Holdings per ticker
        const tickers = Object.keys(SERIES);
        const shares: Record<string, number> = Object.fromEntries(tickers.map(t => [t, 0]));

        const points: TimelinePoint[] = [];
        for (const t of dates) {
            // Apply events
            for (const ev of events) {
                if (ev.type === 'purchase') {
                    const sameMonth = ev.date.getFullYear() === t.getFullYear() && ev.date.getMonth() === t.getMonth();
                    if (sameMonth) {
                        const px = priceAt(ev.ticker, ev.date);
                        if (px) shares[ev.ticker] += ev.amount / px;
                    }
                } else if (ev.type === 'subscription') {
                    const monthsFromStart = (t.getFullYear() - ev.date.getFullYear()) * 12 + (t.getMonth() - ev.date.getMonth());
                    if (monthsFromStart >= 0 && monthsFromStart < (ev.months || 0)) {
                        const px = priceAt(ev.ticker, t);
                        if (px) shares[ev.ticker] += ev.amount / px;
                    }
                }
            }

            // Compute portfolio value
            let total = 0;
            const perTicker: Record<string, number> = {};
            for (const ticker of Object.keys(shares)) {
                const px = priceAt(ticker, t);
                if (px) {
                    const val = shares[ticker] * px;
                    total += val;
                    perTicker[ticker] = val;
                }
            }

            points.push({ date: t, total, ...perTicker });
        }

        return points;
    }, [events]);

    // Individual timelines (one per event)
    const individualTimelines = useMemo(() => {
        const dates: Date[] = [];
        for (let y = 2000; y <= 2025; y++) {
            for (let m = 0; m < 12; m++) {
                dates.push(new Date(y, m, 15));
            }
        }

        return events.map((ev, idx) => {
            let shares = 0;
            const values = dates.map(t => {
                // Apply this specific event
                if (ev.type === 'purchase') {
                    const sameMonth = ev.date.getFullYear() === t.getFullYear() && ev.date.getMonth() === t.getMonth();
                    if (sameMonth) {
                        const px = priceAt(ev.ticker, ev.date);
                        if (px) shares += ev.amount / px;
                    }
                } else if (ev.type === 'subscription') {
                    const monthsFromStart = (t.getFullYear() - ev.date.getFullYear()) * 12 + (t.getMonth() - ev.date.getMonth());
                    if (monthsFromStart >= 0 && monthsFromStart < (ev.months || 0)) {
                        const px = priceAt(ev.ticker, t);
                        if (px) shares += ev.amount / px;
                    }
                }

                // Compute value
                const px = priceAt(ev.ticker, t);
                return px ? shares * px : 0;
            });

            return {
                event: ev,
                index: idx,
                values
            };
        });
    }, [events]);

    const totalInvested = useMemo(() => {
        return events.reduce((sum, ev) => {
            if (ev.type === 'purchase') return sum + ev.amount;
            if (ev.type === 'subscription') return sum + ev.amount * (ev.months || 0);
            return sum;
        }, 0);
    }, [events]);

    const latestValue = timeline.length > 0 ? timeline[timeline.length - 1].total : 0;
    const gainPct = totalInvested > 0 ? ((latestValue - totalInvested) / totalInvested) * 100 : 0;

    // Chart data
    const chartData = useMemo(() => {
        if (consolidated) {
            return timeline.map(p => ({
                date: p.date.toISOString().slice(0, 7),
                total: Number(p.total.toFixed(2)),
                AAPL: Number((p.AAPL as number || 0).toFixed(2)),
                NVDA: Number((p.NVDA as number || 0).toFixed(2)),
                INTC: Number((p.INTC as number || 0).toFixed(2)),
                AMD: Number((p.AMD as number || 0).toFixed(2)),
                MSFT: Number((p.MSFT as number || 0).toFixed(2)),
                AMZN: Number((p.AMZN as number || 0).toFixed(2)),
                ADBE: Number((p.ADBE as number || 0).toFixed(2)),
                ADSK: Number((p.ADSK as number || 0).toFixed(2)),
                META: Number((p.META as number || 0).toFixed(2)),
                SONY: Number((p.SONY as number || 0).toFixed(2)),
                NFLX: Number((p.NFLX as number || 0).toFixed(2)),
                GOOG: Number((p.GOOG as number || 0).toFixed(2)),
            }));
        } else {
            // Individual view - one line per event
            const dates: Date[] = [];
            for (let y = 2000; y <= 2025; y++) {
                for (let m = 0; m < 12; m++) {
                    dates.push(new Date(y, m, 15));
                }
            }

            return dates.map((date, dateIdx) => {
                const point: Record<string, string | number> = {
                    date: date.toISOString().slice(0, 7)
                };

                individualTimelines.forEach((timeline) => {
                    const key = `event_${timeline.index}`;
                    point[key] = Number(timeline.values[dateIdx].toFixed(2));
                });

                return point;
            });
        }
    }, [consolidated, timeline, individualTimelines]);

    // Holdings by ticker (current)
    const holdings = useMemo(() => {
        if (timeline.length === 0) return [];
        const latest = timeline[timeline.length - 1];
        return Object.keys(SERIES)
            .map(ticker => ({
                ticker,
                name: SERIES[ticker].name,
                value: (latest[ticker] as number) || 0
            }))
            .filter(h => h.value > 0)
            .sort((a, b) => b.value - a.value);
    }, [timeline]);

    return (
        <div className="w-full h-full bg-black border border-lime-500/20 p-6 overflow-auto">
            <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-black border border-lime-500/20 p-4">
                        <div className="text-gray-400 text-sm mb-1">Total Invested</div>
                        <div className="text-white text-2xl font-mono">
                            ${totalInvested.toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-black border border-lime-500/20 p-4">
                        <div className="text-gray-400 text-sm mb-1">Current Value</div>
                        <div className="text-white text-2xl font-mono">
                            ${latestValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                    </div>
                    <div className="bg-black border border-lime-500/20 p-4">
                        <div className="text-gray-400 text-sm mb-1">Gain/Loss</div>
                        <div className={`text-2xl font-mono ${gainPct >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                            {gainPct >= 0 ? '+' : ''}{gainPct.toFixed(1)}%
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="bg-black border border-lime-500/20 p-4">
                    <h3 className="text-lime-400 font-semibold mb-4">
                        {consolidated ? 'Portfolio Value Over Time' : 'Individual Event Values Over Time'}
                    </h3>
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#84cc16" stopOpacity={0.6} />
                                        <stop offset="95%" stopColor="#84cc16" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#84cc16" opacity={0.1} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: '#d4d4d4', fontSize: 12 }}
                                    stroke="#84cc16"
                                    opacity={0.2}
                                />
                                <YAxis
                                    tick={{ fill: '#d4d4d4', fontSize: 12 }}
                                    stroke="#84cc16"
                                    opacity={0.2}
                                    width={80}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#000',
                                        border: '1px solid rgba(132, 204, 22, 0.2)',
                                        color: '#84cc16'
                                    }}
                                    formatter={(value) => typeof value === 'number' ? [`$${value.toLocaleString()}`, ''] : [String(value), '']}
                                />
                                <Legend wrapperStyle={{ color: '#84cc16' }} />
                                {consolidated ? (
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        name="Total"
                                        stroke="#84cc16"
                                        fill="url(#gTotal)"
                                        strokeWidth={2}
                                    />
                                ) : (
                                    individualTimelines.map((timeline, idx) => {
                                        const colors = [
                                            '#84cc16', '#22d3ee', '#f59e0b', '#ec4899',
                                            '#8b5cf6', '#10b981', '#f97316', '#06b6d4',
                                            '#6366f1', '#14b8a6', '#eab308', '#ef4444'
                                        ];
                                        const color = colors[idx % colors.length];
                                        return (
                                            <Area
                                                key={`event_${idx}`}
                                                type="monotone"
                                                dataKey={`event_${idx}`}
                                                name={timeline.event.label}
                                                stroke={color}
                                                fill={color}
                                                fillOpacity={0.1}
                                                strokeWidth={2}
                                            />
                                        );
                                    })
                                )}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Holdings Table (Consolidated view only) */}
                {consolidated && holdings.length > 0 && (
                    <div className="bg-black border border-lime-500/20 p-4">
                        <h3 className="text-lime-400 font-semibold mb-4">Holdings by Ticker (Current)</h3>
                        <div className="space-y-2">
                            {holdings.map(h => (
                                <div key={h.ticker} className="flex justify-between items-center border-b border-lime-500/10 pb-2">
                                    <div>
                                        <span className="text-lime-400 font-mono">{h.ticker}</span>
                                        <span className="text-gray-400 text-sm ml-2">{h.name}</span>
                                    </div>
                                    <div className="text-white font-mono">
                                        ${h.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Individual Event Values (Individual view only) */}
                {!consolidated && individualTimelines.length > 0 && (
                    <div className="bg-black border border-lime-500/20 p-4">
                        <h3 className="text-lime-400 font-semibold mb-4">Individual Event Values (Current)</h3>
                        <div className="space-y-2">
                            {individualTimelines.map((timeline, idx) => {
                                const currentValue = timeline.values[timeline.values.length - 1];
                                const invested = timeline.event.type === 'purchase'
                                    ? timeline.event.amount
                                    : timeline.event.amount * (timeline.event.months || 0);
                                const gainPct = invested > 0 ? ((currentValue - invested) / invested) * 100 : 0;

                                return (
                                    <div key={idx} className="flex justify-between items-center border-b border-lime-500/10 pb-2">
                                        <div className="flex-1">
                                            <div className="text-lime-400 font-semibold text-sm">{timeline.event.label}</div>
                                            <div className="text-gray-400 text-xs">
                                                Invested: ${invested.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-white font-mono">
                                                ${currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </div>
                                            <div className={`text-xs font-mono ${gainPct >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                                                {gainPct >= 0 ? '+' : ''}{gainPct.toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {events.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        Add purchases or subscriptions to see portfolio visualization
                    </div>
                )}
            </div>
        </div>
    );
});

Viewer.displayName = 'Viewer';

export default Viewer;
