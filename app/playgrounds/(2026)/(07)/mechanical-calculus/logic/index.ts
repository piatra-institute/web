/**
 * Mechanical calculus: an error model of a wheel-and-disc differential analyzer.
 *
 * The machine solves the damped oscillator
 *
 *     y'' + 2*zeta*omega*y' + omega^2*y = 0,   y(0) = y0,  y'(0) = 0
 *
 * by patching two integrators in a loop: integrator 1 carries the acceleration
 * on its wheel and delivers the velocity on its output shaft; integrator 2
 * carries the velocity and delivers the displacement, which is fed back to
 * integrator 1 and drawn by the pen.
 *
 * Wheel-and-disc kinematics. A disc turning through angle Theta drags a wheel
 * of radius rho sitting at radial offset r, so the wheel turns through
 *
 *     theta_wheel = (1 / rho) * integral( r dTheta ).
 *
 * With Theta = 2*pi*x (one disc turn per unit of the independent variable) and
 * the carriage placing the wheel at r = k*V (k in mm per unit of the integrand),
 * the output shaft accumulates (k / rho) * integral(V dx) turns. So one turn of
 * an output shaft is worth rho/k units of the integral: the scale factor k is
 * the whole of "programming" this machine.
 *
 * Four physical error sources act on that ideal relation:
 *
 *   creep      the friction contact transmits torque by microslip, so the wheel
 *              under-rotates by kappa = T_load / (G * mu * N * rho). Past
 *              kappa = 1 the contact breaks into gross slip and transmits
 *              nothing. The torque amplifier gain G is what buys headroom here.
 *   backlash   the gear train between an output shaft and the next carriage has
 *              lost motion, so every reversal of the transmitted variable is
 *              swallowed. In represented units the dead band is beta*rho/k.
 *   lag        the follow-up servos take real time to null an error. Running the
 *              independent variable at S units per real second turns a real-time
 *              lag into a lag of tau = S * lag_real in the problem's own units.
 *              The value reaching a carriage is the value its shaft carried tau
 *              ago, taken to first order: y(x - tau) = y - tau * g * v, since the
 *              represented y advances at g*v. In a feedback loop that lag eats
 *              damping, zeta_eff = zeta - g*omega*tau/2, and once it has eaten
 *              all of it the machine oscillates on its own.
 *   saturation the wheel cannot leave the disc, so |k*V| <= R.
 *
 * The loop is integrated with RK4 so that numerical error stays several orders
 * of magnitude below the mechanical error being studied. Backlash is the one
 * element with memory: the held value is frozen across a step and taken up at
 * the end of it.
 */

export type PresetKey =
    | 'kelvin-1876'
    | 'construction-set'
    | 'bush-1931'
    | 'run-it-fast'
    | 'mis-scaled';

export interface Params {
    /** omega: the problem's natural frequency, radians per unit of x. */
    frequency: number;
    /** zeta: the problem's damping ratio. */
    damping: number;

    /** G: torque amplifier gain. 1 means no amplifier at all. */
    torqueGain: number;
    /** mu: friction coefficient at the wheel-disc contact. */
    friction: number;
    /** N: normal force pressing the wheel onto the disc, newtons. */
    wheelLoad: number;
    /** rho: integrating wheel radius, mm. */
    wheelRadius: number;
    /** R: disc radius, mm. The wheel cannot be carried past it. */
    discRadius: number;
    /** beta: gear-train lost motion, arcminutes of shaft rotation. */
    backlash: number;
    /** S: how fast the drive turns the independent variable, x-units per real second. */
    machineSpeed: number;
    /** k: scale factor, mm of wheel offset per unit of the integrand. */
    scaleFactor: number;

    preset: PresetKey;
}


/** Units of the independent variable covered by one run of the machine. */
export const X_END = 30;

/** Integration step for the displayed run. */
const DT = 0.005;
/** Coarser step for sweeps, landscapes and tornado bars. */
const DT_SWEEP = 0.02;

/** Static load torque on an integrator output shaft, N*m (bearings, gears, pen). */
const T_STATIC = 0.12;
/** Extra load per mm-per-x-unit of carriage slew rate, N*m. */
const C_CARRIAGE = 0.0008;
/** Follow-up lag of the torque amplifier at unit gain, real seconds. */
const C_SERVO = 400;
/** Fixed drive-train follow-up lag, real seconds. */
const T_GEAR = 0.08;

const TURNS_PER_ARCMIN = 1 / 21600;
/** Delay is clamped so the history buffer stays bounded. */
const MAX_LAG = 4;

export const ANIMATION_TOTAL_FRAMES = 260;


export const DEFAULT_PARAMS: Params = {
    frequency: 1.2,
    damping: 0.05,
    torqueGain: 12000,
    friction: 0.28,
    wheelLoad: 25,
    wheelRadius: 20,
    discRadius: 120,
    backlash: 4,
    machineSpeed: 0.01,
    scaleFactor: 60,
    preset: 'bush-1931',
};


export const PRESET_DESCRIPTIONS: Record<PresetKey, { label: string; question: string; expectation: string }> = {
    'kelvin-1876': {
        label: 'Kelvin, 1876',
        question: 'Kelvin described this machine on paper. Why did nobody build it?',
        expectation: 'Without a torque amplifier the wheel cannot drive the next carriage. It slips. The discs turn and the pen draws a straight line.',
    },
    'construction-set': {
        label: 'construction set',
        question: 'Can you build a differential analyzer out of toy parts?',
        expectation: 'Yes, and it computes. Sloppy gears and small discs hold it to roughly one decimal digit of truth.',
    },
    'bush-1931': {
        label: 'Bush, 1931',
        question: 'What does the MIT machine actually deliver?',
        expectation: 'Two useful digits. The integrators are far better than that; phase error accumulating over six cycles eats the rest.',
    },
    'run-it-fast': {
        label: 'run it fast',
        question: 'The run takes fifty minutes. Can we hurry it along?',
        expectation: 'No. Speed converts the servos’ real-time lag into problem-time lag, the lag eats the damping, and the machine hunts.',
    },
    'mis-scaled': {
        label: 'mis-scaled',
        question: 'What if the scale factor is chosen badly?',
        expectation: 'The carriage asks for more millimetres than the disc has radius. The wheel rides off the rim and the peaks are clipped flat.',
    },
};


export function presetParams(key: PresetKey): Params {
    switch (key) {
        case 'kelvin-1876':
            return {
                frequency: 1.2, damping: 0.05,
                torqueGain: 1, friction: 0.28, wheelLoad: 25, wheelRadius: 20,
                discRadius: 120, backlash: 4, machineSpeed: 0.01, scaleFactor: 60,
                preset: key,
            };
        case 'construction-set':
            return {
                frequency: 1.2, damping: 0.05,
                torqueGain: 5000, friction: 0.15, wheelLoad: 8, wheelRadius: 15,
                discRadius: 60, backlash: 90, machineSpeed: 0.03, scaleFactor: 35,
                preset: key,
            };
        case 'bush-1931':
            return { ...DEFAULT_PARAMS, preset: key };
        case 'run-it-fast':
            return {
                frequency: 1.3, damping: 0.01,
                torqueGain: 12000, friction: 0.28, wheelLoad: 25, wheelRadius: 20,
                discRadius: 120, backlash: 4, machineSpeed: 0.6, scaleFactor: 60,
                preset: key,
            };
        case 'mis-scaled':
            return {
                frequency: 1.2, damping: 0.05,
                torqueGain: 12000, friction: 0.28, wheelLoad: 25, wheelRadius: 20,
                discRadius: 120, backlash: 4, machineSpeed: 0.01, scaleFactor: 150,
                preset: key,
            };
    }
}


/* ---------------------------------------------------------------- *
 * The exact solution the machine is trying to draw.
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


interface PeakRates {
    /** Largest |y''| over the run: what integrator 1's carriage must represent. */
    accel: number;
    /** Largest |y'| over the run: what integrator 2's carriage must represent. */
    velocity: number;
    /** Largest |y'''| over the run: how fast a carriage must be slewed. */
    jerk: number;
}

function peakRates(omega: number, zeta: number, y0: number): PeakRates {
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
 * The machine's mechanical budget.
 * ---------------------------------------------------------------- */

export interface MachineSpec {
    /** mu * N * rho: the most torque the friction contact can pass, N*m. */
    frictionLimit: number;
    /** What the downstream carriage, gears and pen demand, N*m. */
    loadTorque: number;
    /** kappa: microslip as a fraction of the friction limit. */
    creep: number;
    /** kappa >= 1: the contact has broken loose and transmits nothing. */
    grossSlip: boolean;
    /** g = 1 - kappa: the fraction of the ideal rotation that survives. */
    gain: number;
    /** Follow-up lag of the drive train, real seconds. */
    lagReal: number;
    /** tau: the same lag expressed in units of the independent variable. */
    lag: number;
    /** The lag at which the loop's effective damping reaches zero. */
    lagCritical: number;
    stable: boolean;
    /** Gear-train lost motion, in units of the transmitted variable. */
    deadBand: number;
    /** R / k: the largest integrand the disc can represent. */
    ceiling: number;
    /** The largest integrand the problem actually demands. */
    peakIntegrand: number;
    /** Ratio of the two, in decibels. Negative means the wheel leaves the disc. */
    headroomDb: number;
    /** 20 log10(R / (rho * beta)): the mechanism's intrinsic resolution span. */
    dynamicRangeDb: number;
    /** zeta_eff = zeta - g*omega*tau/2. Negative means a growing oscillation. */
    effDamping: number;
    /** g * omega: the frequency the machine actually runs at. */
    machineOmega: number;
    /** How long one run takes on the real machine, minutes. */
    runtimeMinutes: number;
}


export function machineSpec(params: Params, y0: number = 1): MachineSpec {
    const { frequency: omega, damping: zeta } = params;
    const rhoM = params.wheelRadius / 1000;

    const peaks = peakRates(omega, zeta, y0);

    const frictionLimit = params.friction * params.wheelLoad * rhoM;
    const carriageSlew = params.scaleFactor * peaks.jerk;
    const loadTorque = T_STATIC + C_CARRIAGE * carriageSlew;

    const creep = loadTorque / Math.max(params.torqueGain * frictionLimit, 1e-12);
    const grossSlip = creep >= 1;
    const gain = Math.max(0, 1 - creep);

    const lagReal = C_SERVO / params.torqueGain + T_GEAR;
    const lag = Math.min(params.machineSpeed * lagReal, MAX_LAG);
    const lagCritical = gain > 0 ? (2 * zeta) / (gain * omega) : Infinity;

    const backlashTurns = params.backlash * TURNS_PER_ARCMIN;
    const deadBand = (backlashTurns * params.wheelRadius) / params.scaleFactor;

    const ceiling = params.discRadius / params.scaleFactor;
    const peakIntegrand = Math.max(peaks.accel, peaks.velocity, 1e-9);
    const headroomDb = 20 * Math.log10(ceiling / peakIntegrand);

    const resolutionSpan = params.discRadius / (params.wheelRadius * Math.max(backlashTurns, 1e-7));
    const dynamicRangeDb = Math.min(20 * Math.log10(resolutionSpan), 160);

    const effDamping = zeta - (gain * omega * lag) / 2;
    const machineOmega = gain * omega;

    return {
        frictionLimit,
        loadTorque,
        creep,
        grossSlip,
        gain,
        lagReal,
        lag,
        lagCritical,
        stable: gain > 0 && lag < lagCritical,
        deadBand,
        ceiling,
        peakIntegrand,
        headroomDb,
        dynamicRangeDb,
        effDamping,
        machineOmega,
        runtimeMinutes: X_END / params.machineSpeed / 60,
    };
}


/* ---------------------------------------------------------------- *
 * Running the machine.
 * ---------------------------------------------------------------- */

export interface TracePoint {
    x: number;
    /** The exact solution: what the pen should be drawing. */
    ideal: number;
    /** What the pen is actually drawing. */
    machine: number;
    /** Signed departure of the pen from the truth. */
    error: number;
    /** The velocity arriving at integrator 2's carriage. */
    velocity: number;
    /** Integrator 1 wheel offset from the disc centre, mm. */
    offsetA: number;
    /** Integrator 2 wheel offset from the disc centre, mm. */
    offsetV: number;
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
    /** Log-slope of the machine's amplitude envelope. Positive means it is hunting. */
    envelopeRate: number;
    /** Fraction of the run spent riding a carriage stop. */
    clipFraction: number;
    peakExcursion: number;
    diverged: boolean;
}


/** Standard lost-motion model: the output holds until the play is taken up. */
function play(input: number, held: number, band: number): number {
    if (band <= 0) return input;
    const half = band / 2;
    if (input - held > half) return input - half;
    if (held - input > half) return input + half;
    return held;
}


/** One instant of the machine: where the wheels sit and how fast the shafts turn. */
interface Stage {
    dv: number;
    dy: number;
    offsetA: number;
    offsetV: number;
    transmittedY: number;
    transmittedV: number;
    clipped: boolean;
}


export function runMachine(params: Params, y0: number = 1, dt: number = DT): MachineRun {
    const spec = machineSpec(params, y0);
    const { frequency: omega, damping: zeta, scaleFactor: k, discRadius: R } = params;
    const { gain: g, deadBand, lag } = spec;

    /**
     * The whole machine at one instant. `heldY` and `heldV` are the values the
     * gear trains are currently presenting downstream; they are frozen across an
     * RK4 step and taken up at the end of it.
     */
    const stage = (y: number, v: number, heldY: number, heldV: number): Stage => {
        const transmittedV = play(v, heldV, deadBand);
        const transmittedY = play(y, heldY, deadBand);

        // What integrator 1's carriage is told to represent, tau of lag ago.
        const lagged = transmittedY - lag * g * transmittedV;
        const command = -2 * zeta * omega * transmittedV - omega * omega * lagged;

        let offsetA = k * command;
        const clipA = Math.abs(offsetA) > R;
        if (clipA) offsetA = Math.sign(offsetA) * R;

        let offsetV = k * transmittedV;
        const clipV = Math.abs(offsetV) > R;
        if (clipV) offsetV = Math.sign(offsetV) * R;

        return {
            dv: (g * offsetA) / k,
            dy: (g * offsetV) / k,
            offsetA,
            offsetV,
            transmittedY,
            transmittedV,
            clipped: clipA || clipV,
        };
    };

    const steps = Math.round(X_END / dt);
    const trace: TracePoint[] = [];

    // The wheels' accumulated rotations, and what survives the gear trains.
    let y = y0;
    let v = 0;
    let heldY = y0;
    let heldV = 0;

    let clipCount = 0;
    let peakExcursion = 0;
    let diverged = false;

    for (let n = 0; n <= steps; n++) {
        const x = n * dt;
        const s1 = stage(y, v, heldY, heldV);

        if (s1.clipped) clipCount++;
        peakExcursion = Math.max(peakExcursion, Math.abs(s1.transmittedY));

        const ideal = y0 * idealY(x, omega, zeta);
        trace.push({
            x,
            ideal,
            machine: s1.transmittedY,
            error: s1.transmittedY - ideal,
            velocity: s1.transmittedV,
            offsetA: s1.offsetA,
            offsetV: s1.offsetV,
            clipped: s1.clipped ? 1 : 0,
        });

        if (n === steps) break;

        const h = dt / 2;
        const s2 = stage(y + h * s1.dy, v + h * s1.dv, heldY, heldV);
        const s3 = stage(y + h * s2.dy, v + h * s2.dv, heldY, heldV);
        const s4 = stage(y + dt * s3.dy, v + dt * s3.dv, heldY, heldV);

        y += (dt / 6) * (s1.dy + 2 * s2.dy + 2 * s3.dy + s4.dy);
        v += (dt / 6) * (s1.dv + 2 * s2.dv + 2 * s3.dv + s4.dv);

        if (!Number.isFinite(y) || !Number.isFinite(v) || Math.abs(y) > 1e5) {
            y = Number.isFinite(y) ? Math.sign(y) * Math.min(Math.abs(y), 1e5) : 1e5;
            v = Number.isFinite(v) ? Math.sign(v) * Math.min(Math.abs(v), 1e5) : 0;
            diverged = true;
        }

        // The gear trains take up their play once per step.
        heldV = play(v, heldV, deadBand);
        heldY = play(y, heldY, deadBand);
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


/** The largest distance a wheel is carried from the centre of its disc, mm. */
export function peakWheelOffset(run: MachineRun): number {
    let peak = 0;
    for (const p of run.trace) {
        peak = Math.max(peak, Math.abs(p.offsetA), Math.abs(p.offsetV));
    }
    return peak;
}


/** Period read off the machine's own trace, the way an operator would read it. */
export function measurePeriod(trace: TracePoint[]): number {
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
export function measureEnvelopeRate(trace: TracePoint[]): number {
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


/**
 * Machine speed at which the loop's effective damping reaches zero, located by
 * bisecting the simulated envelope rate rather than by using the analytic law.
 */
export function findCriticalSpeed(params: Params): number {
    let lo = 0.001;
    let hi = 2.0;
    const growsAt = (s: number) => runMachine({ ...params, machineSpeed: s }, 1, DT_SWEEP).envelopeRate > 0;

    if (growsAt(lo)) return lo;
    if (!growsAt(hi)) return hi;

    for (let i = 0; i < 24; i++) {
        const mid = 0.5 * (lo + hi);
        if (growsAt(mid)) hi = mid;
        else lo = mid;
    }
    return 0.5 * (lo + hi);
}


/* ---------------------------------------------------------------- *
 * Metrics, narrative, sweeps.
 * ---------------------------------------------------------------- */

export type Regime =
    | 'gross slip'
    | 'hunting'
    | 'saturated'
    | 'backlash-limited'
    | 'creep-limited'
    | 'lag-limited';

export interface Metrics {
    relError: number;
    usefulDigits: number;
    creepPct: number;
    /** Degrees of phase the machine has lost by the end of the run. */
    phaseDrift: number;
    clipPct: number;
    lag: number;
    lagCritical: number;
    effDamping: number;
    dynamicRangeDb: number;
    headroomDb: number;
    runtimeMinutes: number;
    period: number;
    envelopeRate: number;
    stable: boolean;
    grossSlip: boolean;
    regime: Regime;
    interpretation: string;
}


/** Which of the four error sources is currently doing the most damage. */
function classify(params: Params, spec: MachineSpec, run: MachineRun): Regime {
    if (spec.grossSlip) return 'gross slip';
    if (!spec.stable || run.envelopeRate > 0) return 'hunting';
    if (run.clipFraction > 0.01) return 'saturated';

    const phaseCost = spec.creep * params.frequency * X_END;
    const lagCost = (params.damping - spec.effDamping) * params.frequency * X_END;
    const backlashCost = spec.deadBand * 20;

    if (backlashCost >= phaseCost && backlashCost >= lagCost) return 'backlash-limited';
    if (lagCost >= phaseCost) return 'lag-limited';
    return 'creep-limited';
}


export function computeMetrics(params: Params, dt: number = DT): Metrics {
    const spec = machineSpec(params);
    const run = runMachine(params, 1, dt);
    const regime = classify(params, spec, run);

    const phaseDrift = spec.creep * params.frequency * X_END * (180 / Math.PI);

    const interpretation = {
        'gross slip': 'The contact has broken loose. The machine turns and computes nothing.',
        'hunting': 'The loop lag exceeds the damping it has to spend. The oscillation grows on its own.',
        'saturated': 'A carriage is being held against its stop. The peaks of the solution are being cut off.',
        'backlash-limited': 'Lost motion in the gear trains now costs more than slip does. A better amplifier will not help.',
        'creep-limited': 'Microslip at the friction contact sets the accuracy. More torque amplification buys more digits.',
        'lag-limited': 'The follow-up servos are the bottleneck. Slowing the machine down would buy accuracy.',
    }[regime];

    return {
        relError: run.relError,
        usefulDigits: run.usefulDigits,
        creepPct: spec.creep * 100,
        phaseDrift,
        clipPct: run.clipFraction * 100,
        lag: spec.lag,
        lagCritical: spec.lagCritical,
        effDamping: spec.effDamping,
        dynamicRangeDb: spec.dynamicRangeDb,
        headroomDb: spec.headroomDb,
        runtimeMinutes: spec.runtimeMinutes,
        period: run.period,
        envelopeRate: run.envelopeRate,
        stable: spec.stable,
        grossSlip: spec.grossSlip,
        regime,
        interpretation,
    };
}


export function computeNarrative(metrics: Metrics, params: Params): string {
    const spec = machineSpec(params);

    if (metrics.grossSlip) {
        return `The carriage, gears and pen demand ${spec.loadTorque.toFixed(2)} N·m, and the wheel-disc contact can pass only ${(spec.frictionLimit * params.torqueGain).toFixed(2)} N·m. The wheel spins on the disc without gripping it. This is exactly the wall Kelvin hit in 1876, and it is what Nieman’s torque amplifier climbed over.`;
    }

    if (!metrics.stable) {
        return `The drive train needs ${spec.lagReal.toFixed(2)} s to follow an order, and at ${params.machineSpeed.toFixed(2)} x-units per second that is a lag of ${metrics.lag.toFixed(3)} x-units. The loop can only afford ${metrics.lagCritical.toFixed(3)}. Effective damping has gone negative (${metrics.effDamping.toFixed(3)}), so the machine feeds its own oscillation and the pen climbs off the paper.`;
    }

    const parts: string[] = [];

    if (metrics.clipPct > 1) {
        parts.push(`The carriage is asking for ±${(spec.peakIntegrand * params.scaleFactor).toFixed(0)} mm on a disc of radius ${params.discRadius} mm, so a wheel rides its stop for ${metrics.clipPct.toFixed(0)}% of the run and the peaks come out flat.`);
    }

    parts.push(`Each integrator loses ${metrics.creepPct.toFixed(3)}% to microslip. That sounds like nothing, but it is a frequency error, and by the end of ${X_END} x-units the pen is ${Math.abs(metrics.phaseDrift).toFixed(1)}° out of phase with the truth.`);

    if (params.damping - metrics.effDamping > 0.1 * params.damping) {
        const stolen = ((params.damping - metrics.effDamping) / params.damping) * 100;
        parts.push(`Servo lag has quietly taken ${stolen.toFixed(0)}% of the damping, so the machine’s oscillation dies more slowly than the real one.`);
    }

    parts.push(`Overall the pen is ${(metrics.relError * 100).toFixed(2)}% away from the exact solution: ${metrics.usefulDigits.toFixed(1)} decimal digits of truth, bought with ${metrics.runtimeMinutes.toFixed(0)} minutes of turning.`);

    return parts.join(' ');
}


export interface Snapshot {
    params: Params;
    metrics: Metrics;
    trace: TracePoint[];
    label: string;
}


export type SweepableParam = keyof Omit<Params, 'preset'>;

export interface ParamSpec {
    key: SweepableParam;
    label: string;
    min: number;
    max: number;
    step: number;
    /** Sweep and plot this one on a logarithmic axis. */
    log?: boolean;
    unit?: string;
}

export const PARAM_SPECS: ParamSpec[] = [
    { key: 'torqueGain', label: 'torque gain', min: 1, max: 100000, step: 1, log: true, unit: '×' },
    { key: 'machineSpeed', label: 'machine speed', min: 0.005, max: 0.6, step: 0.005, unit: ' x/s' },
    { key: 'scaleFactor', label: 'scale factor', min: 10, max: 400, step: 1, unit: ' mm/unit' },
    { key: 'backlash', label: 'backlash', min: 0, max: 120, step: 1, unit: '′' },
    { key: 'discRadius', label: 'disc radius', min: 40, max: 250, step: 1, unit: ' mm' },
    { key: 'wheelRadius', label: 'wheel radius', min: 5, max: 40, step: 1, unit: ' mm' },
    { key: 'friction', label: 'friction', min: 0.05, max: 0.6, step: 0.01 },
    { key: 'wheelLoad', label: 'wheel load', min: 2, max: 60, step: 1, unit: ' N' },
    { key: 'frequency', label: 'frequency', min: 0.5, max: 2.5, step: 0.05 },
    { key: 'damping', label: 'damping', min: 0.005, max: 0.3, step: 0.005 },
];


export interface SweepDatum {
    sweepValue: number;
    usefulDigits: number;
    creepPct: number;
    clipPct: number;
}

export function computeSweep(params: Params, sweepKey: SweepableParam = 'torqueGain'): SweepDatum[] {
    const spec = PARAM_SPECS.find(s => s.key === sweepKey);
    if (!spec) return [];

    const steps = 41;
    const data: SweepDatum[] = [];

    for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        const v = spec.log
            ? spec.min * Math.pow(spec.max / spec.min, t)
            : spec.min + (spec.max - spec.min) * t;
        const m = computeMetrics({ ...params, [sweepKey]: v }, DT_SWEEP);
        data.push({
            sweepValue: v,
            usefulDigits: m.usefulDigits,
            creepPct: Math.min(m.creepPct, 100),
            clipPct: m.clipPct,
        });
    }

    return data;
}


export interface SensitivityBar {
    label: string;
    low: number;
    high: number;
}

export function computeSensitivity(params: Params): SensitivityBar[] {
    return PARAM_SPECS.map(spec => {
        const atMin = computeMetrics({ ...params, [spec.key]: spec.min }, DT_SWEEP).usefulDigits;
        const atMax = computeMetrics({ ...params, [spec.key]: spec.max }, DT_SWEEP).usefulDigits;
        return {
            label: spec.label,
            low: Math.min(atMin, atMax),
            high: Math.max(atMin, atMax),
        };
    }).sort((a, b) => (b.high - b.low) - (a.high - a.low));
}


/* ---------------------------------------------------------------- *
 * The scaling problem: the one decision an operator actually made.
 * ---------------------------------------------------------------- */

export interface ScaleDatum {
    scaleFactor: number;
    usefulDigits: number;
    /** How far the signal sits above the gear train's lost motion, in dB. */
    resolutionDb: number;
    /** How far the signal sits below the rim of the disc, in dB. */
    headroomDb: number;
}

export interface ScaleLandscape {
    points: ScaleDatum[];
    /** The scale factor at which the wheel first reaches the rim. */
    kSaturation: number;
    /** The scale factor that maximises useful digits. */
    kOptimum: number;
    current: number;
}

export function computeScaleLandscape(params: Params): ScaleLandscape {
    const points: ScaleDatum[] = [];
    const steps = 44;
    const kMin = 8;
    const kMax = 500;

    let best = -1;
    let kOptimum = params.scaleFactor;

    for (let i = 0; i < steps; i++) {
        const k = kMin * Math.pow(kMax / kMin, i / (steps - 1));
        const trial = { ...params, scaleFactor: k };
        const spec = machineSpec(trial);
        const digits = computeMetrics(trial, DT_SWEEP).usefulDigits;

        points.push({
            scaleFactor: k,
            usefulDigits: digits,
            resolutionDb: 20 * Math.log10(spec.peakIntegrand / Math.max(spec.deadBand, 1e-9)),
            headroomDb: spec.headroomDb,
        });

        if (digits > best) {
            best = digits;
            kOptimum = k;
        }
    }

    const baseSpec = machineSpec(params);
    return {
        points,
        kSaturation: params.discRadius / baseSpec.peakIntegrand,
        kOptimum,
        current: params.scaleFactor,
    };
}


/** Torque amplifier gains span five decades, so show them the way an engineer would. */
export function formatGain(g: number): string {
    if (g >= 10000) return `${(g / 1000).toFixed(0)}k`;
    if (g >= 1000) return `${(g / 1000).toFixed(1)}k`;
    return g.toFixed(0);
}
