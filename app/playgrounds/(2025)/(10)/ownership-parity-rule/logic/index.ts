import { SERIES } from './stock-prices';

export { SERIES };

export type EventType = 'purchase' | 'subscription';

export interface PurchaseEventInput {
    type: EventType;
    ticker: string;
    label: string;
    date: Date;
    amount: number;
    months?: number;
}

/**
 * Most-recent-available monthly close for a ticker at a given date. Prices are
 * stored at monthly granularity keyed "YYYY-MM". If the exact month is missing
 * the function walks backward to the most recent earlier month, mirroring how a
 * trade would execute at the last known price. Returns null when no price on or
 * before the date exists (for example before the ticker started trading).
 */
export function priceAt(ticker: string, date: Date): number | null {
    const series = SERIES[ticker]?.prices || {};
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${month.toString().padStart(2, '0')}`;

    if (series[key] != null) return series[key];

    const keys = Object.keys(series).sort();
    if (keys.length === 0) return null;

    for (let i = keys.length - 1; i >= 0; i--) {
        if (keys[i] <= key) {
            return series[keys[i]];
        }
    }

    return null;
}

/**
 * Latest dated price available for a ticker (the final monthly close in the
 * series). Used as the terminal valuation date.
 */
export function latestPrice(ticker: string): number | null {
    const series = SERIES[ticker]?.prices || {};
    const keys = Object.keys(series).sort();
    if (keys.length === 0) return null;
    return series[keys[keys.length - 1]];
}

/**
 * The ownership-parity rule applied to one event: for every dollar spent on a
 * product, one dollar buys equity in the issuing firm. A one-off purchase buys
 * all shares at the purchase-month price (a lump sum). A subscription spreads
 * the monthly payment across the contract window, buying shares each month at
 * that month's price (dollar-cost averaging). Returns the fractional share
 * count accumulated by the parity investment.
 */
export function sharesForEvent(ev: PurchaseEventInput): number {
    let shares = 0;
    if (ev.type === 'purchase') {
        const px = priceAt(ev.ticker, ev.date);
        if (px) shares += ev.amount / px;
        return shares;
    }
    const months = ev.months || 0;
    for (let m = 0; m < months; m++) {
        const t = new Date(ev.date.getFullYear(), ev.date.getMonth() + m, 15);
        const px = priceAt(ev.ticker, t);
        if (px) shares += ev.amount / px;
    }
    return shares;
}

/** Total cash an event commits: lump sum for a purchase, monthly times months for a subscription. */
export function investedForEvent(ev: PurchaseEventInput): number {
    if (ev.type === 'purchase') return ev.amount;
    return ev.amount * (ev.months || 0);
}

/** Terminal value of the parity holding for one event, valued at the latest price. */
export function valueForEvent(ev: PurchaseEventInput, valuationDate?: Date): number {
    const shares = sharesForEvent(ev);
    const px = valuationDate ? priceAt(ev.ticker, valuationDate) : latestPrice(ev.ticker);
    if (!px) return 0;
    return shares * px;
}

/** Terminal-value multiple for one event: ending value divided by cash invested. */
export function multipleForEvent(ev: PurchaseEventInput, valuationDate?: Date): number {
    const invested = investedForEvent(ev);
    if (invested <= 0) return 0;
    return valueForEvent(ev, valuationDate) / invested;
}

export interface PortfolioMetrics {
    totalInvested: number;
    currentValue: number;
    gainPct: number;
    multiple: number;
}

/** Aggregate metrics for a basket of parity events, valued at the latest prices. */
export function portfolioMetrics(events: PurchaseEventInput[]): PortfolioMetrics {
    let totalInvested = 0;
    let currentValue = 0;
    for (const ev of events) {
        totalInvested += investedForEvent(ev);
        currentValue += valueForEvent(ev);
    }
    const gainPct = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;
    const multiple = totalInvested > 0 ? currentValue / totalInvested : 0;
    return { totalInvested, currentValue, gainPct, multiple };
}
