/**
 * The machine, without the mathematics.
 *
 * No differential equation appears anywhere in this file: that is the point.
 * The state is the accumulated rotation of each integrator wheel; the update
 * rule is the kinematics of a wheel on a disc, a differential gear, a gear
 * train with lost motion, a follow-up servo with lag, and a carriage stop at
 * the rim. Hand this simulator a different patch and it computes a different
 * equation, exactly as the bench did.
 *
 * Numerical scheme, kept deliberately identical to the original single-
 * equation implementation so that its calibration survives:
 *
 *   Pass A  value0   post-backlash values of every bus variable, no lag.
 *   Pass B  deriv0   zeroth-order rates: d(out)/dx = g * value0(carriage)
 *                    * deriv0(disc), UNCLIPPED. Used only for the first-order
 *                    lag correction.
 *   Pass C  command  adder outputs with each lagged term t replaced by
 *                    value0(t) - tau * deriv0(t); carriage offsets clipped at
 *                    the rim; integration rates g * offset/k * rate(disc),
 *                    CLIPPED, recursive through dependent-disc chains.
 *
 * RK4 advances the wheel accumulations with the backlash held values frozen
 * across the step; the gear trains take up their play once per step.
 */

import {
    EquationCoeffs,
    EquationKey,
    EQUATIONS,
    PatchSpec,
    X_END,
    buildPatchFor,
} from './patch';


export interface Mechanism {
    /** Fraction of the ideal rotation that survives the friction contact. */
    g: number;
    /** Follow-up lag, in units of the independent variable. */
    lag: number;
    /** Disc radius, mm. Infinity for the mathematical machine. */
    R: number;
    /** Dead band per integrator output variable, in that variable's units. */
    deadBands: Record<string, number>;
    /** Scale factor k per integrator id, mm per unit of the carriage variable. */
    scales: Record<string, number>;
}


export interface TracePoint {
    x: number;
    /** The exact solution: what the pen should be drawing. */
    ideal: number;
    /** What the pen is actually drawing. */
    machine: number;
    /** Signed departure of the pen from the truth. */
    error: number;
    /** The patch's second variable of interest. */
    secondary: number;
    /** Every bus variable at this instant, for the 3D machine. */
    vars: Record<string, number>;
    /** Wheel offset from the disc centre per integrator id, mm. */
    offsets: Record<string, number>;
    /** 1 when a wheel is being held at the rim by the carriage stop. */
    clipped: number;
}

export interface MachineRun {
    trace: TracePoint[];
    /** RMS(machine - ideal) / RMS(ideal) over the whole run. */
    relError: number;
    /** Decimal digits of the answer the machine got right. */
    usefulDigits: number;
    /** Period measured from the machine's own zero crossings, 0 if unmeasurable. */
    period: number;
    /** Log-slope of the machine's amplitude envelope. Positive means growth. */
    envelopeRate: number;
    /** Fraction of the run spent riding a carriage stop. */
    clipFraction: number;
    peakExcursion: number;
    diverged: boolean;
}


/** Standard lost-motion model: the output holds until the play is taken up. */
export function play(input: number, held: number, band: number): number {
    if (band <= 0) return input;
    const half = band / 2;
    if (input - held > half) return input - half;
    if (held - input > half) return input + half;
    return held;
}


/* ---------------------------------------------------------------- *
 * One instant of the machine.
 * ---------------------------------------------------------------- */

interface BusFrame {
    value0: Record<string, number>;
    offsets: Record<string, number>;
    rates: Record<string, number>;
    clipped: boolean;
}

function evalBus(
    spec: PatchSpec,
    mech: Mechanism,
    state: Record<string, number>,
    held: Record<string, number>,
    x: number,
): BusFrame {
    const adderByOut = new Map(spec.adders.map(a => [a.out, a]));
    const intByOut = new Map(spec.integrators.map(i => [i.out, i]));

    /* Pass A: post-backlash values, no lag. */
    const value0: Record<string, number> = { x };
    for (const int of spec.integrators) {
        value0[int.out] = play(state[int.out], held[int.out], mech.deadBands[int.out] ?? 0);
    }
    if (spec.inputTable) value0[spec.inputTable.out] = spec.inputTable.fn(x);

    const valueOf = (name: string): number => {
        if (name in value0) return value0[name];
        const adder = adderByOut.get(name);
        if (!adder) return 0;
        let sum = 0;
        for (const term of adder.terms) sum += term.ratio * valueOf(term.var);
        value0[name] = sum;
        return sum;
    };
    for (const adder of spec.adders) valueOf(adder.out);

    /* Pass B: zeroth-order rates, unclipped, for the lag correction only. */
    const deriv0: Record<string, number> = { x: 1 };
    const derivOf = (name: string): number => {
        if (name in deriv0) return deriv0[name];
        deriv0[name] = 0;
        const int = intByOut.get(name);
        if (int) {
            deriv0[name] = mech.g * valueOf(int.carriage) * derivOf(int.disc);
            return deriv0[name];
        }
        const adder = adderByOut.get(name);
        if (adder) {
            let sum = 0;
            for (const term of adder.terms) sum += term.ratio * derivOf(term.var);
            deriv0[name] = sum;
            return sum;
        }
        if (spec.inputTable && name === spec.inputTable.out) {
            deriv0[name] = spec.inputTable.dfn(x);
        }
        return deriv0[name];
    };

    /* Pass C: lag applied to the marked adder terms, offsets clipped, rates. */
    const lagged: Record<string, number> = {};
    const laggedOf = (name: string): number => {
        const adder = adderByOut.get(name);
        if (!adder) return valueOf(name);
        if (name in lagged) return lagged[name];
        let sum = 0;
        for (const term of adder.terms) {
            const base = adderByOut.has(term.var) ? laggedOf(term.var) : valueOf(term.var);
            sum += term.ratio * (term.lagged ? base - mech.lag * derivOf(term.var) : base);
        }
        lagged[name] = sum;
        return sum;
    };

    const offsets: Record<string, number> = {};
    let clipped = false;
    for (const int of spec.integrators) {
        const k = mech.scales[int.id];
        let offset = k * laggedOf(int.carriage);
        if (Math.abs(offset) > mech.R) {
            offset = Math.sign(offset) * mech.R;
            clipped = true;
        }
        offsets[int.id] = offset;
    }

    const rates: Record<string, number> = { x: 1 };
    const rateOf = (name: string): number => {
        if (name in rates) return rates[name];
        rates[name] = 0;
        const int = intByOut.get(name);
        if (int) {
            rates[name] = mech.g * (offsets[int.id] / mech.scales[int.id]) * rateOf(int.disc);
            return rates[name];
        }
        const adder = adderByOut.get(name);
        if (adder) {
            let sum = 0;
            for (const term of adder.terms) sum += term.ratio * rateOf(term.var);
            rates[name] = sum;
            return sum;
        }
        if (spec.inputTable && name === spec.inputTable.out) {
            rates[name] = spec.inputTable.dfn(x);
        }
        return rates[name];
    };
    for (const int of spec.integrators) rateOf(int.out);

    return { value0, offsets, rates, clipped };
}


/* ---------------------------------------------------------------- *
 * Running a patch.
 * ---------------------------------------------------------------- */

export function runPatch(
    spec: PatchSpec,
    coeffs: EquationCoeffs,
    mech: Mechanism,
    y0: number,
    dt: number,
    idealAt: (x: number, index: number) => number,
): MachineRun {
    const eq = EQUATIONS[spec.equation];
    const init = eq.initialState(coeffs, y0);

    const state: Record<string, number> = {};
    const held: Record<string, number> = {};
    for (const int of spec.integrators) {
        state[int.out] = init[int.out] ?? 0;
        held[int.out] = state[int.out];
    }

    const steps = Math.round(X_END / dt);
    const trace: TracePoint[] = [];

    let clipCount = 0;
    let peakExcursion = 0;
    let diverged = false;

    for (let n = 0; n <= steps; n++) {
        const x = n * dt;
        const f1 = evalBus(spec, mech, state, held, x);

        if (f1.clipped) clipCount++;
        peakExcursion = Math.max(peakExcursion, Math.abs(f1.value0[spec.penVar]));

        const ideal = idealAt(x, n);
        const machine = f1.value0[spec.penVar];
        trace.push({
            x,
            ideal,
            machine,
            error: machine - ideal,
            secondary: f1.value0[spec.secondaryVar] ?? 0,
            vars: f1.value0,
            offsets: f1.offsets,
            clipped: f1.clipped ? 1 : 0,
        });

        if (n === steps) break;

        const h = dt / 2;
        const at = (base: Record<string, number>, rates: Record<string, number>, dh: number) => {
            const next: Record<string, number> = {};
            for (const int of spec.integrators) {
                next[int.out] = base[int.out] + dh * rates[int.out];
            }
            return next;
        };

        const f2 = evalBus(spec, mech, at(state, f1.rates, h), held, x + h);
        const f3 = evalBus(spec, mech, at(state, f2.rates, h), held, x + h);
        const f4 = evalBus(spec, mech, at(state, f3.rates, dt), held, x + dt);

        for (const int of spec.integrators) {
            const v = int.out;
            state[v] += (dt / 6) * (f1.rates[v] + 2 * f2.rates[v] + 2 * f3.rates[v] + f4.rates[v]);
            if (!Number.isFinite(state[v])) {
                state[v] = 0;
                diverged = true;
            } else if (Math.abs(state[v]) > 1e5) {
                state[v] = Math.sign(state[v]) * 1e5;
                diverged = true;
            }
        }

        // The gear trains take up their play once per step.
        for (const int of spec.integrators) {
            held[int.out] = play(state[int.out], held[int.out], mech.deadBands[int.out] ?? 0);
        }
    }

    let sumErr = 0;
    let sumIdeal = 0;
    for (const p of trace) {
        sumErr += p.error * p.error;
        sumIdeal += p.ideal * p.ideal;
    }
    const rmsIdeal = Math.sqrt(sumIdeal / trace.length);
    const rmsErr = Math.sqrt(sumErr / trace.length);
    const relError = rmsIdeal > 1e-12 ? rmsErr / rmsIdeal : rmsErr;

    const digits = Math.max(0, Math.min(7, -Math.log10(Math.max(relError, 1e-7))));

    return {
        trace,
        relError,
        // Rounded because this one lands in a server-rendered style attribute (the
        // tornado bars). Math.exp and friends differ by an ulp between the V8 in
        // Node and the V8 in the browser, six thousand RK4 steps carry that into
        // the last digits, and React then finds the two renders disagree.
        usefulDigits: Math.round(digits * 1e6) / 1e6,
        period: measurePeriod(trace),
        envelopeRate: measureEnvelopeRate(trace),
        clipFraction: clipCount / trace.length,
        peakExcursion,
        diverged,
    };
}


/* ---------------------------------------------------------------- *
 * The mathematical truth: the same patch, run on a perfect machine.
 * ---------------------------------------------------------------- */

const PERFECT: Omit<Mechanism, 'deadBands' | 'scales'> = { g: 1, lag: 0, R: Infinity };

function coeffKey(equation: EquationKey, coeffs: EquationCoeffs, y0: number, dt: number): string {
    return [
        equation,
        coeffs.frequency, coeffs.damping, coeffs.lambda, coeffs.mu,
        coeffs.amplitude, coeffs.forceFrequency,
        y0, dt,
    ].join('|');
}

const runCache = new Map<string, MachineRun>();
const seriesCache = new Map<string, number[]>();
const IDEAL_CACHE_MAX = 16;

function remember<T>(cache: Map<string, T>, key: string, value: T): T {
    if (cache.size >= IDEAL_CACHE_MAX) {
        const oldest = cache.keys().next().value;
        if (oldest !== undefined) cache.delete(oldest);
    }
    cache.set(key, value);
    return value;
}

/**
 * The patch run on a perfect mechanism: no creep, no lag, no lost motion, no
 * rim. The forced equation's ideal zeroes the operator error too, so the
 * operator's hand shows up where it belongs: in the machine's error, not in
 * the truth.
 */
export function idealRun(
    equation: EquationKey,
    coeffs: EquationCoeffs,
    y0: number,
    dt: number,
): MachineRun {
    const key = coeffKey(equation, coeffs, y0, dt);
    const cached = runCache.get(key);
    if (cached) return cached;

    const pureCoeffs: EquationCoeffs = { ...coeffs, trackingError: 0 };
    const spec = buildPatchFor(equation, pureCoeffs);
    const deadBands: Record<string, number> = {};
    const scales: Record<string, number> = {};
    for (const int of spec.integrators) {
        deadBands[int.out] = 0;
        scales[int.id] = 1;
    }
    const run = runPatch(spec, pureCoeffs, { ...PERFECT, deadBands, scales }, y0, dt, () => 0);
    return remember(runCache, key, run);
}

/**
 * Samples of the exact solution on the dt grid. Closed form when the equation
 * has one; otherwise the perfect-mechanism run of the patch itself.
 */
export function idealSeries(
    equation: EquationKey,
    coeffs: EquationCoeffs,
    y0: number,
    dt: number,
): number[] {
    const eq = EQUATIONS[equation];

    if (!eq.closedForm) return idealRun(equation, coeffs, y0, dt).trace.map(p => p.machine);

    const key = coeffKey(equation, coeffs, y0, dt);
    const cached = seriesCache.get(key);
    if (cached) return cached;

    const steps = Math.round(X_END / dt);
    const series = Array.from({ length: steps + 1 }, (_, n) => eq.closedForm!(n * dt, coeffs, y0));
    return remember(seriesCache, key, series);
}


/* ---------------------------------------------------------------- *
 * Reading the trace the way an operator would.
 * ---------------------------------------------------------------- */

/** Period read off the machine's own trace, from its zero crossings. */
export function measurePeriod(trace: { x: number; machine: number }[]): number {
    const crossings: number[] = [];
    for (let i = 1; i < trace.length; i++) {
        const a = trace[i - 1].machine;
        const b = trace[i].machine;
        if (a <= 0 && b > 0) {
            const t = a === b ? 0 : -a / (b - a);
            crossings.push(trace[i - 1].x + t * (trace[i].x - trace[i - 1].x));
        }
    }
    if (crossings.length < 2) return 0;
    return (crossings[crossings.length - 1] - crossings[0]) / (crossings.length - 1);
}


/** Log-slope of the amplitude envelope, fitted through the trace's own peaks. */
export function measureEnvelopeRate(trace: { x: number; machine: number }[]): number {
    const xs: number[] = [];
    const ys: number[] = [];

    for (let i = 1; i < trace.length - 1; i++) {
        const prev = Math.abs(trace[i - 1].machine);
        const here = Math.abs(trace[i].machine);
        const next = Math.abs(trace[i + 1].machine);
        if (here > prev && here >= next && here > 1e-6) {
            xs.push(trace[i].x);
            ys.push(Math.log(here));
        }
    }
    if (xs.length < 3) return 0;

    const n = xs.length;
    const meanX = xs.reduce((a, b) => a + b, 0) / n;
    const meanY = ys.reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
        num += (xs[i] - meanX) * (ys[i] - meanY);
        den += (xs[i] - meanX) ** 2;
    }
    return den > 1e-12 ? num / den : 0;
}


/** Envelope rate of the exact solution, so growth by design (a limit cycle
 *  spiralling outward) is not mistaken for the machine hunting. */
export function idealEnvelopeRate(series: number[], dt: number): number {
    const asTrace = series.map((machine, n) => ({ x: n * dt, machine }));
    return measureEnvelopeRate(asTrace);
}
