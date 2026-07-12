/**
 * The patch: the machine's program.
 *
 * A differential analyzer is not told an equation; it is wired into one. Each
 * integrator's disc is geared to some shaft (usually the independent variable,
 * sometimes another variable: that is how products are built), its carriage is
 * screwed to some shaft, and its wheel delivers a new variable. Adders are
 * differential gears; the constants of the equation are change-gear ratios.
 *
 * This file holds that wiring, and nothing else. The simulator in engine.ts
 * integrates whatever patch it is handed; the four equations below are
 * hand-authored setup sheets, the way an operator would have drawn them.
 */

export type EquationKey =
    | 'damped-oscillator'
    | 'exponential-decay'
    | 'forced-oscillator'
    | 'van-der-pol';

/** The coefficient fields a patch may read. Params satisfies this shape. */
export interface EquationCoeffs {
    frequency: number;
    damping: number;
    lambda: number;
    mu: number;
    amplitude: number;
    forceFrequency: number;
    trackingError: number;
}

export interface AdderTerm {
    var: string;
    ratio: number;
    /**
     * The lumped drive-train lag of the loop sits on this edge: the value
     * arriving is tau of the independent variable old, applied to first order.
     * Each feedback loop marks exactly one edge, following the lumped-lag
     * assumption.
     */
    lagged?: boolean;
    /**
     * How the term physically arrives in the 3D scene: 'local' means a direct
     * shaft from an adjacent unit, 'row' means down from the shaft bank.
     */
    via?: 'row' | 'local';
}

export interface AdderSpec {
    id: string;
    /** One term is a change-gear cluster; several are a differential chain. */
    kind: 'gear' | 'differential';
    terms: AdderTerm[];
    out: string;
    /** Which integrator's lead screw the output drives. */
    feeds: string;
    /** Bench position for the 3D scene. */
    bench: 'front' | 'back';
    x: number;
}

export type SlotId = 'front-0' | 'front-1' | 'front-2' | 'back-0' | 'back-1' | 'back-2';

/** Bench slot positions, matching the Machine3D layout. */
export const SLOT_POSITIONS: Record<SlotId, { x: number; z: number; bench: 'front' | 'back' }> = {
    'front-0': { x: -4.2, z: -1.6, bench: 'front' },
    'front-1': { x: 0, z: -1.6, bench: 'front' },
    'front-2': { x: 3.4, z: -1.6, bench: 'front' },
    'back-0': { x: -4.2, z: 1.6, bench: 'back' },
    'back-1': { x: 0, z: 1.6, bench: 'back' },
    'back-2': { x: 3.4, z: 1.6, bench: 'back' },
};

export interface IntegratorSpec {
    id: string;
    /** What turns the disc: 'x' means the countershaft, otherwise a variable. */
    disc: 'x' | string;
    /** The variable the carriage lead screw is geared to. */
    carriage: string;
    /** The variable the wheel accumulates and the spline shaft carries out. */
    out: string;
    /** Per-integrator scale, as a multiple of the common scale-factor slider. */
    relScale: number;
    slot: SlotId;
}

export interface InputTableSpec {
    /** The variable the operator's cross-hair injects. */
    out: string;
    fn: (x: number) => number;
    /** Analytic derivative, needed for the first-order lag correction. */
    dfn: (x: number) => number;
}

export interface PatchSpec {
    equation: EquationKey;
    integrators: IntegratorSpec[];
    adders: AdderSpec[];
    inputTable?: InputTableSpec;
    /** The variable the pen draws. */
    penVar: string;
    /** A second variable worth charting. */
    secondaryVar: string;
    secondaryLabel: string;
    /** Shaft-bank row assignment (0..4) for every variable that rides the bank. */
    rows: Record<string, number>;
}

export type CoeffKey = keyof EquationCoeffs;

export interface CoeffSpec {
    key: CoeffKey;
    label: string;
    min: number;
    max: number;
    step: number;
}

export interface EquationDef {
    key: EquationKey;
    label: string;
    latex: string;
    description: string;
    defaultY0: number;
    coeffSpecs: CoeffSpec[];
    buildPatch(coeffs: EquationCoeffs): PatchSpec;
    initialState(coeffs: EquationCoeffs, y0: number): Record<string, number>;
    /** Exact solution, when one exists; otherwise the ideal run is numeric. */
    closedForm?: (x: number, coeffs: EquationCoeffs, y0: number) => number;
    /**
     * Peak carriage travel per integrator (in the represented variable's own
     * units) and the fastest carriage slew, both over the ideal run. Supplied
     * in closed form where possible; otherwise measured from the ideal run.
     */
    peaks?: (coeffs: EquationCoeffs, y0: number) => { integrands: Record<string, number>; slew: number };
    /** Linearised loop analysis, for the equations that have one. */
    linear?: {
        omega(coeffs: EquationCoeffs): number;
        zeta(coeffs: EquationCoeffs): number;
    };
    /**
     * The rate against which creep and lag are costed: the frequency for an
     * oscillator, the decay constant for a decay, the measured beat otherwise.
     */
    rateScale(coeffs: EquationCoeffs, measuredPeriod: number): number;
}


/** Units of the independent variable covered by one run of the machine. */
export const X_END = 30;


/* ---------------------------------------------------------------- *
 * The exact solution of the damped oscillator (kept for calibration).
 * ---------------------------------------------------------------- */

/** y(x) for the underdamped oscillator with y(0) = 1, y'(0) = 0. */
export function idealY(x: number, omega: number, zeta: number): number {
    const wd = omega * Math.sqrt(1 - zeta * zeta);
    return Math.exp(-zeta * omega * x) * (Math.cos(wd * x) + (zeta * omega / wd) * Math.sin(wd * x));
}

/** y'(x) for the same initial conditions. */
export function idealV(x: number, omega: number, zeta: number): number {
    const wd = omega * Math.sqrt(1 - zeta * zeta);
    return -Math.exp(-zeta * omega * x) * ((omega * omega) / wd) * Math.sin(wd * x);
}


/** Peak |y''|, |y'|, |y'''| over the run, scaled by y0: what the oscillator
 *  patches ask of their carriages. */
function oscillatorPeaks(omega: number, zeta: number, y0: number): { accel: number; velocity: number; jerk: number } {
    let accel = 0;
    let velocity = 0;
    let jerk = 0;

    for (let x = 0; x <= X_END; x += 0.02) {
        const y = idealY(x, omega, zeta);
        const v = idealV(x, omega, zeta);
        const a = -2 * zeta * omega * v - omega * omega * y;
        const j = -2 * zeta * omega * a - omega * omega * v;
        accel = Math.max(accel, Math.abs(a));
        velocity = Math.max(velocity, Math.abs(v));
        jerk = Math.max(jerk, Math.abs(j));
    }

    return { accel: accel * y0, velocity: velocity * y0, jerk: jerk * y0 };
}


/* ---------------------------------------------------------------- *
 * The operator's hand.
 * ---------------------------------------------------------------- */

/**
 * A deterministic stand-in for the input-table operator: a quasi-periodic
 * wobble of unit scale around the true curve. Deterministic because the
 * machine must draw the same curve on every run (and on the server).
 */
export function operatorWobble(x: number): number {
    return 0.85 * Math.sin(2.399 * x) + 0.51 * Math.sin(5.81 * x + 1.0);
}

export function operatorWobbleRate(x: number): number {
    return 0.85 * 2.399 * Math.cos(2.399 * x) + 0.51 * 5.81 * Math.cos(5.81 * x + 1.0);
}


/* ---------------------------------------------------------------- *
 * The four setup sheets.
 * ---------------------------------------------------------------- */

export const EQUATIONS: Record<EquationKey, EquationDef> = {
    'damped-oscillator': {
        key: 'damped-oscillator',
        label: 'damped oscillator',
        latex: "y'' + 2\\zeta\\omega y' + \\omega^2 y = 0",
        description: 'The classic two-integrator loop: acceleration into velocity into displacement, fed back through the adder.',
        defaultY0: 1,
        coeffSpecs: [
            { key: 'frequency', label: 'frequency &omega;', min: 0.5, max: 2.5, step: 0.05 },
            { key: 'damping', label: 'damping &zeta;', min: 0.005, max: 0.3, step: 0.005 },
        ],
        buildPatch: c => ({
            equation: 'damped-oscillator',
            integrators: [
                { id: 'int-v', disc: 'x', carriage: 'cmd', out: 'v', relScale: 1, slot: 'front-0' },
                { id: 'int-y', disc: 'x', carriage: 'v', out: 'y', relScale: 1, slot: 'front-1' },
            ],
            adders: [
                {
                    id: 'adder-cmd',
                    kind: 'differential',
                    terms: [
                        { var: 'v', ratio: -2 * c.damping * c.frequency, via: 'local' },
                        { var: 'y', ratio: -c.frequency * c.frequency, lagged: true, via: 'row' },
                    ],
                    out: 'cmd',
                    feeds: 'int-v',
                    bench: 'front',
                    x: -1.9,
                },
            ],
            penVar: 'y',
            secondaryVar: 'v',
            secondaryLabel: 'velocity',
            rows: { v: 0, y: 1 },
        }),
        initialState: (_c, y0) => ({ v: 0, y: y0 }),
        closedForm: (x, c, y0) => y0 * idealY(x, c.frequency, c.damping),
        peaks: (c, y0) => {
            const p = oscillatorPeaks(c.frequency, c.damping, y0);
            return { integrands: { 'int-v': p.accel, 'int-y': p.velocity }, slew: p.jerk };
        },
        linear: {
            omega: c => c.frequency,
            zeta: c => c.damping,
        },
        rateScale: c => c.frequency,
    },

    'exponential-decay': {
        key: 'exponential-decay',
        label: 'exponential decay',
        latex: "y' = -\\lambda y",
        description: 'The simplest patch that computes anything: one integrator, one sign-reversing change gear, closed on itself.',
        defaultY0: 1,
        coeffSpecs: [
            { key: 'lambda', label: 'decay rate &lambda;', min: 0.05, max: 1.2, step: 0.01 },
        ],
        buildPatch: c => ({
            equation: 'exponential-decay',
            integrators: [
                { id: 'int-y', disc: 'x', carriage: 'cmd', out: 'y', relScale: 1, slot: 'front-0' },
            ],
            adders: [
                {
                    id: 'gear-neg',
                    kind: 'gear',
                    terms: [{ var: 'y', ratio: -c.lambda, lagged: true, via: 'row' }],
                    out: 'cmd',
                    feeds: 'int-y',
                    bench: 'front',
                    x: -1.9,
                },
            ],
            penVar: 'y',
            secondaryVar: 'cmd',
            secondaryLabel: 'slope',
            rows: { y: 1 },
        }),
        initialState: (_c, y0) => ({ y: y0 }),
        closedForm: (x, c, y0) => y0 * Math.exp(-c.lambda * x),
        peaks: (c, y0) => ({
            integrands: { 'int-y': c.lambda * y0 },
            slew: c.lambda * c.lambda * y0,
        }),
        linear: {
            omega: c => c.lambda,
            zeta: () => 1,
        },
        rateScale: c => c.lambda,
    },

    'forced-oscillator': {
        key: 'forced-oscillator',
        label: 'forced oscillator',
        latex: "y'' + 2\\zeta\\omega y' + \\omega^2 y = A\\sin(\\Omega x)",
        description: 'The same loop with the input table alive: an operator traces the forcing curve by hand, and that hand is now a term in the error budget.',
        defaultY0: 0,
        coeffSpecs: [
            { key: 'frequency', label: 'frequency &omega;', min: 0.5, max: 2.5, step: 0.05 },
            { key: 'damping', label: 'damping &zeta;', min: 0.005, max: 0.3, step: 0.005 },
            { key: 'amplitude', label: 'forcing amplitude A', min: 0.1, max: 1.5, step: 0.05 },
            { key: 'forceFrequency', label: 'forcing frequency &Omega;', min: 0.2, max: 2.5, step: 0.05 },
            { key: 'trackingError', label: 'operator error (% of A)', min: 0, max: 2, step: 0.1 },
        ],
        buildPatch: c => {
            const eps = (c.trackingError / 100) * c.amplitude;
            return {
                equation: 'forced-oscillator',
                integrators: [
                    { id: 'int-v', disc: 'x', carriage: 'cmd', out: 'v', relScale: 0.65, slot: 'front-0' },
                    { id: 'int-y', disc: 'x', carriage: 'v', out: 'y', relScale: 1, slot: 'front-1' },
                ],
                adders: [
                    {
                        id: 'adder-cmd',
                        kind: 'differential',
                        terms: [
                            { var: 'v', ratio: -2 * c.damping * c.frequency, via: 'local' },
                            { var: 'y', ratio: -c.frequency * c.frequency, lagged: true, via: 'row' },
                            { var: 'F', ratio: 1, via: 'row' },
                        ],
                        out: 'cmd',
                        feeds: 'int-v',
                        bench: 'front',
                        x: -1.9,
                    },
                ],
                inputTable: {
                    out: 'F',
                    fn: x => c.amplitude * Math.sin(c.forceFrequency * x) + eps * operatorWobble(x),
                    dfn: x => c.amplitude * c.forceFrequency * Math.cos(c.forceFrequency * x) + eps * operatorWobbleRate(x),
                },
                penVar: 'y',
                secondaryVar: 'F',
                secondaryLabel: 'forcing',
                rows: { v: 0, y: 1, F: 2 },
            };
        },
        initialState: (_c, y0) => ({ v: 0, y: y0 }),
        peaks: (c, y0) => {
            // The homogeneous peaks plus the forcing and its derivative: a safe
            // over-estimate of the carriage travel the patch will ask for.
            const p = oscillatorPeaks(c.frequency, c.damping, Math.max(y0, 1e-9));
            const steady = c.amplitude / Math.sqrt(
                (c.frequency ** 2 - c.forceFrequency ** 2) ** 2
                + (2 * c.damping * c.frequency * c.forceFrequency) ** 2,
            );
            const accel = p.accel + c.amplitude + steady * c.frequency * c.frequency;
            const velocity = p.velocity + steady * Math.max(c.forceFrequency, c.frequency);
            const jerk = p.jerk + c.amplitude * c.forceFrequency;
            return { integrands: { 'int-v': accel, 'int-y': velocity }, slew: jerk };
        },
        linear: {
            omega: c => c.frequency,
            zeta: c => c.damping,
        },
        rateScale: c => Math.max(c.frequency, c.forceFrequency),
    },

    'van-der-pol': {
        key: 'van-der-pol',
        label: 'van der Pol',
        latex: "y'' - \\mu(1 - y^2)\\,y' + y = 0",
        description: 'A nonlinear limit cycle, patched in Liénard form. The squares are built by integrators whose discs are driven by y itself: products by parts, the way the machine actually did them.',
        defaultY0: 0.5,
        coeffSpecs: [
            { key: 'mu', label: 'nonlinearity &mu;', min: 0.2, max: 2.5, step: 0.05 },
        ],
        buildPatch: c => ({
            equation: 'van-der-pol',
            integrators: [
                { id: 'int-y', disc: 'x', carriage: 'cmd', out: 'y', relScale: 0.62, slot: 'front-0' },
                { id: 'int-z', disc: 'x', carriage: 'y', out: 'z', relScale: 0.62, slot: 'front-1' },
                { id: 'int-h', disc: 'y', carriage: 'y', out: 'h', relScale: 0.75, slot: 'back-0' },
                { id: 'int-q', disc: 'y', carriage: 'ySq', out: 'q', relScale: 0.42, slot: 'back-1' },
            ],
            adders: [
                {
                    id: 'gear-2h',
                    kind: 'gear',
                    terms: [{ var: 'h', ratio: 2, via: 'local' }],
                    out: 'ySq',
                    feeds: 'int-q',
                    bench: 'back',
                    x: -1.9,
                },
                {
                    id: 'adder-cmd',
                    kind: 'differential',
                    terms: [
                        { var: 'y', ratio: c.mu, via: 'row' },
                        { var: 'q', ratio: -c.mu, via: 'row' },
                        { var: 'z', ratio: -1, lagged: true, via: 'row' },
                    ],
                    out: 'cmd',
                    feeds: 'int-y',
                    bench: 'front',
                    x: -1.9,
                },
            ],
            penVar: 'y',
            secondaryVar: 'z',
            secondaryLabel: 'z = ∫y dx',
            rows: { y: 1, z: 0, q: 2, ySq: 3 },
        }),
        initialState: (c, y0) => ({
            y: y0,
            z: c.mu * (y0 - (y0 ** 3) / 3),
            h: (y0 ** 2) / 2,
            q: (y0 ** 3) / 3,
        }),
        rateScale: (_c, measuredPeriod) =>
            measuredPeriod > 1e-6 ? (2 * Math.PI) / measuredPeriod : 1,
    },
};


export const EQUATION_KEYS: EquationKey[] = [
    'damped-oscillator',
    'exponential-decay',
    'forced-oscillator',
    'van-der-pol',
];


export function buildPatchFor(equation: EquationKey, coeffs: EquationCoeffs): PatchSpec {
    const spec = EQUATIONS[equation].buildPatch(coeffs);
    validatePatch(spec);
    return spec;
}


/**
 * A patch must be a machine that can exist: at most six integrators, one unit
 * per slot, every referenced variable produced somewhere, no algebraic loop
 * that dodges every integrator, and no disc chained onto its own output.
 */
export function validatePatch(spec: PatchSpec): void {
    if (spec.integrators.length > 6) {
        throw new Error(`patch wants ${spec.integrators.length} integrators; the bench has six`);
    }

    const slots = new Set<string>();
    for (const int of spec.integrators) {
        if (slots.has(int.slot)) throw new Error(`two integrators in slot ${int.slot}`);
        slots.add(int.slot);
    }

    const produced = new Set<string>(['x']);
    for (const int of spec.integrators) produced.add(int.out);
    for (const adder of spec.adders) produced.add(adder.out);
    if (spec.inputTable) produced.add(spec.inputTable.out);

    const consumed: string[] = [
        ...spec.integrators.map(i => i.carriage),
        ...spec.integrators.filter(i => i.disc !== 'x').map(i => i.disc),
        ...spec.adders.flatMap(a => a.terms.map(t => t.var)),
        spec.penVar,
        spec.secondaryVar,
    ];
    for (const name of consumed) {
        if (!produced.has(name)) throw new Error(`variable "${name}" is consumed but never produced`);
    }

    // Adder outputs must form a DAG over adder-to-adder references.
    const adderByOut = new Map(spec.adders.map(a => [a.out, a]));
    const visiting = new Set<string>();
    const done = new Set<string>();
    const walk = (out: string): void => {
        if (done.has(out)) return;
        if (visiting.has(out)) throw new Error(`algebraic loop through adder "${out}": every loop must pass through an integrator`);
        visiting.add(out);
        const adder = adderByOut.get(out);
        if (adder) {
            for (const term of adder.terms) {
                if (adderByOut.has(term.var)) walk(term.var);
            }
        }
        visiting.delete(out);
        done.add(out);
    };
    for (const adder of spec.adders) walk(adder.out);

    // Disc-drive chains must also terminate (an integrator's disc may be
    // driven by another integrator's output, but not circularly).
    const intByOut = new Map(spec.integrators.map(i => [i.out, i]));
    for (const int of spec.integrators) {
        const seen = new Set<string>([int.out]);
        let disc = int.disc;
        while (disc !== 'x') {
            if (seen.has(disc)) throw new Error(`disc-drive cycle through "${disc}"`);
            seen.add(disc);
            const upstream = intByOut.get(disc);
            if (!upstream) {
                if (adderByOut.has(disc) || spec.inputTable?.out === disc) break;
                throw new Error(`disc of "${int.id}" driven by unknown variable "${disc}"`);
            }
            disc = upstream.disc;
        }
    }

    for (const [name] of Object.entries(spec.rows)) {
        if (!produced.has(name)) throw new Error(`bank row assigned to unproduced variable "${name}"`);
    }
}
