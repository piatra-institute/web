import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    multipleForEvent,
    priceAt,
    latestPrice,
    type PurchaseEventInput,
} from './logic';


/**
 * Calibration for the ownership-parity rule.
 *
 * The model is a deterministic counterfactual over fixed monthly price series:
 * a dollar spent on a product buys a dollar of the issuer's equity, valued at
 * the latest available price. Because the model has no stochastic component,
 * the honest test is internal consistency against an independently derived
 * target rather than a noisy empirical fit.
 *
 * For a one-off purchase the terminal multiple must equal the issuer's price
 * appreciation over the holding period: latest_price / purchase_price. The
 * `expected` field carries that ratio, computed by hand from the raw monthly
 * price files (see comments), entirely outside the model's share-accounting
 * code path. The `predicted` field runs the full model (`multipleForEvent`,
 * which divides terminal value by cash invested). Agreement confirms the
 * parity accounting introduces no drift.
 *
 * For the subscription case the target is the dollar-cost-averaged multiple,
 * recomputed here independently by summing monthly fractional shares, so the
 * model's subscription path is checked against a separate implementation.
 */
interface ParityCase {
    name: string;
    event: PurchaseEventInput;
    expected: number;
    description: string;
    source: string;
}


/** Independent DCA multiple: sum monthly shares directly, value at latest price. */
function independentSubscriptionMultiple(ev: PurchaseEventInput): number {
    const months = ev.months || 0;
    let shares = 0;
    for (let m = 0; m < months; m++) {
        const t = new Date(ev.date.getFullYear(), ev.date.getMonth() + m, 15);
        const px = priceAt(ev.ticker, t);
        if (px) shares += ev.amount / px;
    }
    const last = latestPrice(ev.ticker);
    const invested = ev.amount * months;
    if (!last || invested <= 0) return 0;
    return (shares * last) / invested;
}


const CASES: ParityCase[] = [
    {
        name: 'iPhone 2007 -> Apple',
        event: { type: 'purchase', ticker: 'AAPL', label: 'iPhone', date: new Date('2007-06-15'), amount: 499 },
        // AAPL 2007-06 = 3.6636, latest = 249.34 -> 68.0587x
        expected: 68.0587,
        description: 'a $499 iPhone at launch, with $499 of Apple equity bought the same month.',
        source: 'split-adjusted AAPL monthly close 2007-06 (3.6636) to latest (249.34)',
    },
    {
        name: 'GeForce 8800 GT 2007 -> NVIDIA',
        event: { type: 'purchase', ticker: 'NVDA', label: '8800 GT', date: new Date('2007-06-15'), amount: 249 },
        // NVDA 2007-06 = 0.6314, latest = 179.83 -> 284.8115x
        expected: 284.8115,
        description: 'a $249 graphics card, with $249 of NVIDIA equity held to date.',
        source: 'split-adjusted NVDA monthly close 2007-06 (0.6314) to latest (179.83)',
    },
    {
        name: 'PlayStation 3 2006 -> Sony',
        event: { type: 'purchase', ticker: 'SONY', label: 'PS3', date: new Date('2006-06-15'), amount: 499 },
        // SONY 2006-06 = 7.5567, latest = 28.89 -> 3.8231x
        expected: 3.8231,
        description: 'a $499 console paired with $499 of Sony equity: a far flatter ride than the chipmakers.',
        source: 'SONY (ADR) monthly close 2006-06 (7.5567) to latest (28.89)',
    },
    {
        name: 'Pentium III 2000 -> Intel',
        event: { type: 'purchase', ticker: 'INTC', label: 'Pentium III', date: new Date('2000-06-15'), amount: 300 },
        // INTC 2000-06 = 37.9889, latest = 37.15 -> 0.9779x (a loss)
        expected: 0.9779,
        description: 'a $300 CPU at the dot-com peak: the parity bet on Intel is underwater 25 years later.',
        source: 'INTC monthly close 2000-06 (37.9889) to latest (37.15)',
    },
    {
        name: 'Netflix subscription 2007 -> Netflix (DCA)',
        event: { type: 'subscription', ticker: 'NFLX', label: 'Netflix', date: new Date('2007-01-15'), amount: 12, months: 60 },
        // independent DCA recomputation of the same monthly buys
        expected: independentSubscriptionMultiple({ type: 'subscription', ticker: 'NFLX', label: 'Netflix', date: new Date('2007-01-15'), amount: 12, months: 60 }),
        description: '$12/mo for five years, each payment matched by $12 of Netflix equity (dollar-cost averaged).',
        source: 'independent monthly-share summation over NFLX 2007-01 to 2011-12, valued at latest close',
    },
];


export function buildCalibration(): CalibrationResult[] {
    return CASES.map((c) => ({
        name: c.name,
        description: c.description,
        predicted: Number(multipleForEvent(c.event).toFixed(4)),
        expected: Number(c.expected.toFixed(4)),
        source: c.source,
    }));
}
